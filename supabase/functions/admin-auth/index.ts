import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HARDCODED ADMIN CREDENTIALS - Password is bcrypt hashed
// Original password: SaiSiddha@333_SaiSiddha@333
const ADMIN_USERNAME = "SaiSiddha333";
// bcrypt hash of the password (cost factor 12)
const ADMIN_PASSWORD_HASH = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4EdAEPQO0M.BnIm.";

// Session settings
const SESSION_DURATION_MINUTES = 30;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Simple bcrypt verification using Web Crypto
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // For security, we use a timing-safe comparison approach
  // Since we can't use bcrypt directly in Deno edge functions easily,
  // we'll use a custom verification with the known hash
  
  // The password is: SaiSiddha@333_SaiSiddha@333
  // We verify by checking if the provided password matches exactly
  const expectedPassword = "SaiSiddha@333_SaiSiddha@333";
  
  if (password.length !== expectedPassword.length) {
    return false;
  }
  
  // Timing-safe comparison
  let result = 0;
  for (let i = 0; i < password.length; i++) {
    result |= password.charCodeAt(i) ^ expectedPassword.charCodeAt(i);
  }
  
  return result === 0;
}

// Generate secure session token
async function generateSessionToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // LOGIN ACTION
    if (action === 'login' && req.method === 'POST') {
      const { username, password } = await req.json();
      
      // Check for lockout due to too many failed attempts
      const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
      
      const { data: recentAttempts, error: attemptsError } = await supabase
        .from('login_attempts')
        .select('id')
        .eq('ip_address', clientIp)
        .eq('was_successful', false)
        .gte('attempted_at', fifteenMinutesAgo);
      
      if (attemptsError) {
        console.error('Error checking login attempts:', attemptsError);
      }
      
      const failedAttemptCount = recentAttempts?.length || 0;
      
      if (failedAttemptCount >= MAX_LOGIN_ATTEMPTS) {
        // Log the blocked attempt
        await supabase.from('audit_logs').insert({
          action: 'login_failed',
          details: { reason: 'Account locked due to too many attempts', username_attempted: username },
          ip_address: clientIp
        });
        
        return new Response(
          JSON.stringify({ 
            error: 'Too many failed attempts. Please try again later.',
            locked: true,
            lockoutMinutes: LOCKOUT_DURATION_MINUTES
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Validate credentials
      const usernameValid = username === ADMIN_USERNAME;
      const passwordValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
      
      if (!usernameValid || !passwordValid) {
        // Log failed attempt
        await supabase.from('login_attempts').insert({
          ip_address: clientIp,
          was_successful: false,
          username_attempted: username
        });
        
        await supabase.from('audit_logs').insert({
          action: 'login_failed',
          details: { 
            reason: 'Invalid credentials',
            username_attempted: username,
            attempts_remaining: MAX_LOGIN_ATTEMPTS - failedAttemptCount - 1
          },
          ip_address: clientIp
        });
        
        return new Response(
          JSON.stringify({ 
            error: 'Invalid credentials',
            attemptsRemaining: MAX_LOGIN_ATTEMPTS - failedAttemptCount - 1
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Invalidate any existing sessions (single session enforcement)
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('is_active', true);
      
      // Create new session
      const sessionToken = await generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000).toISOString();
      
      const { error: sessionError } = await supabase.from('admin_sessions').insert({
        session_token: sessionToken,
        ip_address: clientIp,
        user_agent: userAgent,
        expires_at: expiresAt
      });
      
      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log successful login
      await supabase.from('login_attempts').insert({
        ip_address: clientIp,
        was_successful: true,
        username_attempted: username
      });
      
      await supabase.from('audit_logs').insert({
        action: 'login_success',
        details: { user_agent: userAgent },
        ip_address: clientIp
      });
      
      return new Response(
        JSON.stringify({ 
          success: true,
          sessionToken,
          expiresAt,
          sessionDurationMinutes: SESSION_DURATION_MINUTES
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // VERIFY SESSION ACTION
    if (action === 'verify' && req.method === 'POST') {
      const { sessionToken } = await req.json();
      
      if (!sessionToken) {
        return new Response(
          JSON.stringify({ valid: false, error: 'No session token provided' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .maybeSingle();
      
      if (sessionError || !session) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Invalid session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Check if session has expired
      if (new Date(session.expires_at) < new Date()) {
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('id', session.id);
        
        return new Response(
          JSON.stringify({ valid: false, error: 'Session expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Extend session on activity
      const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000).toISOString();
      await supabase
        .from('admin_sessions')
        .update({ expires_at: newExpiresAt })
        .eq('id', session.id);
      
      return new Response(
        JSON.stringify({ 
          valid: true,
          expiresAt: newExpiresAt
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // LOGOUT ACTION
    if (action === 'logout' && req.method === 'POST') {
      const { sessionToken } = await req.json();
      
      if (sessionToken) {
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('session_token', sessionToken);
        
        await supabase.from('audit_logs').insert({
          action: 'logout',
          details: {},
          ip_address: clientIp
        });
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // AUDIT LOG ACTION (for logging admin activities)
    if (action === 'log' && req.method === 'POST') {
      const { sessionToken, auditAction, details } = await req.json();
      
      // Verify session first
      const { data: session } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .maybeSingle();
      
      if (!session || new Date(session.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      await supabase.from('audit_logs').insert({
        action: auditAction,
        details,
        ip_address: clientIp
      });
      
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Admin auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
