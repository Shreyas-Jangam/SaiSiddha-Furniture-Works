import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; attemptsRemaining?: number; locked?: boolean }>;
  logout: () => Promise<void>;
  logActivity: (action: string, details?: Record<string, unknown>) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const SESSION_KEY = 'admin_session_token';
const SESSION_EXPIRY_KEY = 'admin_session_expiry';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticatedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    setIsAuthenticated(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    if (isAuthenticatedRef.current) {
      inactivityTimerRef.current = setTimeout(() => {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_EXPIRY_KEY);
        setIsAuthenticated(false);
        window.location.href = '/admin/login?reason=inactivity';
      }, INACTIVITY_TIMEOUT);
    }
  }, []);

  // Verify session on mount
  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      const sessionToken = sessionStorage.getItem(SESSION_KEY);
      const sessionExpiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
      
      if (!sessionToken) {
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      // Check local expiry first
      if (sessionExpiry && new Date(sessionExpiry) < new Date()) {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_EXPIRY_KEY);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('admin-auth/verify', {
          body: { sessionToken }
        });

        if (mounted) {
          if (error || !data?.valid) {
            sessionStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_EXPIRY_KEY);
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
            sessionStorage.setItem(SESSION_EXPIRY_KEY, data.expiresAt);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        if (mounted) {
          sessionStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_EXPIRY_KEY);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    verifySession();

    // Verify session every 5 minutes
    const interval = setInterval(verifySession, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  // Reset inactivity timer when authenticated changes to true
  useEffect(() => {
    if (isAuthenticated) {
      resetInactivityTimer();
    }
  }, [isAuthenticated, resetInactivityTimer]);

  // Reset inactivity timer on user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetInactivityTimer]);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth/login', {
        body: { username, password }
      });

      if (error) {
        return { success: false, error: 'Connection error. Please try again.' };
      }

      if (data?.locked) {
        return { 
          success: false, 
          error: `Account locked. Try again in ${data.lockoutMinutes} minutes.`,
          locked: true 
        };
      }

      if (data?.error) {
        return { 
          success: false, 
          error: data.error,
          attemptsRemaining: data.attemptsRemaining
        };
      }

      if (data?.success && data?.sessionToken) {
        sessionStorage.setItem(SESSION_KEY, data.sessionToken);
        sessionStorage.setItem(SESSION_EXPIRY_KEY, data.expiresAt);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Connection error. Please try again.' };
    }
  };

  const logout = async () => {
    const sessionToken = sessionStorage.getItem(SESSION_KEY);
    
    try {
      await supabase.functions.invoke('admin-auth/logout', {
        body: { sessionToken }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
    }
  };

  const logActivity = async (action: string, details?: Record<string, unknown>) => {
    const sessionToken = sessionStorage.getItem(SESSION_KEY);
    if (!sessionToken) return;

    try {
      await supabase.functions.invoke('admin-auth/log', {
        body: { sessionToken, auditAction: action, details }
      });
    } catch (err) {
      console.error('Audit log error:', err);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, logActivity }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
