import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Shield, Loader2, CheckCircle, XCircle, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppRole } from '@/types/database';

interface InvitationDetails {
  id: string;
  email: string;
  role: AppRole;
  expires_at: string;
  organization: {
    name: string;
    logo_url: string | null;
  };
}

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Auth form state
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('invitations')
          .select(`
            id,
            email,
            role,
            expires_at,
            accepted_at,
            organizations:organization_id (
              name,
              logo_url
            )
          `)
          .eq('token', token)
          .single();

        if (fetchError || !data) {
          setError('Invitation not found');
          setLoading(false);
          return;
        }

        if (data.accepted_at) {
          setError('This invitation has already been used');
          setLoading(false);
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setError('This invitation has expired');
          setLoading(false);
          return;
        }

        setInvitation({
          id: data.id,
          email: data.email,
          role: data.role as AppRole,
          expires_at: data.expires_at,
          organization: data.organizations as unknown as { name: string; logo_url: string | null },
        });
        setEmail(data.email);
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!user || !token) return;

    setIsAccepting(true);
    try {
      const { data, error: acceptError } = await supabase.rpc('accept_invitation', {
        p_token: token,
        p_user_id: user.id,
      });

      if (acceptError) throw acceptError;

      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to accept invitation');
      }

      setAccepted(true);
      await refreshProfile();
      
      toast({
        title: 'Welcome!',
        description: `You've joined ${invitation?.organization.name}`,
      });

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.href,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        
        toast({
          title: 'Account created',
          description: 'You can now accept the invitation.',
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Authentication failed',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'analyst': return 'default';
      case 'viewer': return 'secondary';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-16 w-16 rounded-xl mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold mb-2">Welcome Aboard!</h2>
            <p className="text-muted-foreground mb-2">
              You've successfully joined {invitation?.organization.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            You've been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
            <div className={cn(
              "h-14 w-14 rounded-xl flex items-center justify-center shrink-0",
              "bg-gradient-to-br from-primary/20 to-primary/5"
            )}>
              {invitation?.organization.logo_url ? (
                <img
                  src={invitation.organization.logo_url}
                  alt={invitation.organization.name}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <Building2 className="h-7 w-7 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{invitation?.organization.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleBadgeVariant(invitation?.role || 'viewer')}>
                  <Shield className="h-3 w-3 mr-1" />
                  {invitation?.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Invited Email */}
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Invitation sent to:</span>
            <span className="font-medium">{invitation?.email}</span>
          </div>

          {/* Accept or Login */}
          {user ? (
            <Button
              className="w-full"
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Accept Invitation
            </Button>
          ) : showAuthForm ? (
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    required={!isLogin}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isLogin ? (
                  <LogIn className="h-4 w-4 mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <Button className="w-full" onClick={() => { setShowAuthForm(true); setIsLogin(true); }}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Accept
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { setShowAuthForm(true); setIsLogin(false); }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
            </div>
          )}

          {/* Expiry notice */}
          <p className="text-xs text-center text-muted-foreground">
            This invitation expires on {new Date(invitation?.expires_at || '').toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}