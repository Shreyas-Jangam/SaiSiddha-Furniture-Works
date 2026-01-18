-- Create enum for audit action types
CREATE TYPE public.audit_action AS ENUM (
  'login_success',
  'login_failed',
  'logout',
  'product_created',
  'product_updated',
  'product_deleted',
  'invoice_generated',
  'sale_created',
  'payment_updated',
  'data_reset'
);

-- Create admin_sessions table for session management
CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- No public access to sessions table - only edge functions can access
CREATE POLICY "No direct access to sessions" 
ON public.admin_sessions 
FOR ALL 
USING (false);

-- Create login_attempts table for brute-force protection
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  was_successful BOOLEAN NOT NULL DEFAULT false,
  username_attempted TEXT
);

-- Enable RLS on login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- No public access to login attempts - only edge functions can access
CREATE POLICY "No direct access to login attempts" 
ON public.login_attempts 
FOR ALL 
USING (false);

-- Create audit_logs table for comprehensive logging
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action audit_action NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- No public access to audit logs - only edge functions can access
CREATE POLICY "No direct access to audit logs" 
ON public.audit_logs 
FOR ALL 
USING (false);

-- Create indexes for performance
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);
CREATE INDEX idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX idx_login_attempts_time ON public.login_attempts(attempted_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_time ON public.audit_logs(created_at);