import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User, AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  password: z.string().min(1, 'Password is required').max(100, 'Password too long'),
});

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  
  const { login, isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'inactivity') {
      setError('Session expired due to inactivity. Please login again.');
    } else if (reason === 'unauthorized') {
      setError('Please login to access the admin panel.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAttemptsRemaining(null);

    // Validate input
    const validation = loginSchema.safeParse({ username, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(result.error || 'Login failed');
        if (result.attemptsRemaining !== undefined) {
          setAttemptsRemaining(result.attemptsRemaining);
        }
        // Clear password on failed attempt
        setPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-primary to-wood-dark p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Security badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-success/90 text-white rounded-full text-sm font-medium shadow-lg">
            <Shield className="w-4 h-4" />
            <span>Secure Login</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-2xl p-8 pt-12 border border-border">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-20 h-20 mx-auto rounded-2xl object-cover shadow-lg ring-4 ring-primary/20 mb-4" 
            />
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Sai Siddha Furniture Work</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-destructive font-medium text-sm">{error}</p>
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <p className="text-destructive/80 text-xs mt-1">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="pl-11 h-12"
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-11 pr-11 h-12"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 btn-primary text-lg font-semibold"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Login to Admin Panel
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              This is a secure area. All login attempts are monitored and logged.
              <br />
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-xs mt-6">
          © {new Date().getFullYear()} Sai Siddha Furniture Work. All rights reserved.
        </p>
      </div>
    </div>
  );
}
