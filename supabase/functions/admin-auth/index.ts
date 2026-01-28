import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://ggjljustbsrnkaaxgzab.supabase.co',
  'https://id-preview--09a60c66-9fad-43ad-b530-9dd8c79a1426.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

// Get CORS headers with origin validation
function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Session settings
const SESSION_DURATION_MINUTES = 30;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

// Verify password using bcrypt
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    // Supabase Edge Runtime doesn't support Web Workers; use bcryptjs (pure JS) instead.
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    console.error('Bcrypt comparison error:', error);
    return false;
  }
}

// Generate secure session token
async function generateSessionToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get admin credentials from environment variables
    const adminUsername = Deno.env.get('ADMIN_USERNAME');
    const adminPasswordHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    
    if (!adminUsername || !adminPasswordHash) {
      console.error('Admin credentials not configured in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
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
      
      // Input validation
      if (!username || typeof username !== 'string' || username.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid username format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!password || typeof password !== 'string' || password.length > 200) {
        return new Response(
          JSON.stringify({ error: 'Invalid password format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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
      
      // Validate credentials using environment variables and bcrypt
      const usernameValid = username === adminUsername;
      const passwordValid = await verifyPassword(password, adminPasswordHash);
      
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
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
