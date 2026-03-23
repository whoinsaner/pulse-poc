import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowRight, Building2, Loader2, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { createOrganization, profile, currentOrganization, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Skip onboarding if user already has an organization
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (currentOrganization) {
        navigate('/dashboard');
      }
    }
  }, [user, currentOrganization, authLoading, navigate]);

  const handleCreateOrg = async () => {
    if (!orgName.trim()) {
      toast({
        title: 'Organization name required',
        description: 'Please enter a name for your organization.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await createOrganization(orgName);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'Failed to create organization',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setStep(3);
    }
  };

  const steps = [
    {
      title: 'Welcome to Pulse',
      description: 'Let\'s set up your workspace in just a few steps.',
    },
    {
      title: 'Create your organization',
      description: 'Your organization is where you and your team will collaborate.',
    },
    {
      title: 'You\'re all set!',
      description: 'Start analyzing scripts with AI-powered insights.',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-8" />
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  s === step ? 'w-8 bg-primary' : s < step ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>

          <h1 className="text-3xl font-bold mb-2">{steps[step - 1].title}</h1>
          <p className="text-muted-foreground">{steps[step - 1].description}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground">
                  Hi{profile?.full_name ? `, ${profile.full_name}` : ''}! Pulse uses advanced AI to analyze 
                  screenplays from multiple stakeholder perspectives, helping you make 
                  informed decisions faster.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🎬', label: '12 AI Agents', desc: 'Specialized analysis' },
                  { icon: '👥', label: '8 Lenses', desc: 'Stakeholder views' },
                  { icon: '📊', label: 'Deep Insights', desc: 'Actionable feedback' },
                  { icon: '📄', label: 'Multi-Format', desc: 'PDF, FDX, Fountain' },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-muted/50 text-center"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <p className="font-medium mt-2">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <Button onClick={() => setStep(2)} className="w-full h-12">
                Get started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Acme Studios"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  This could be your company, studio, or personal workspace.
                </p>
              </div>

              <Button
                onClick={handleCreateOrg}
                className="w-full h-12"
                disabled={isLoading || !orgName.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create organization
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-up text-center">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <svg
                  className="h-10 w-10 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Welcome to {orgName}!
                </h3>
                <p className="text-muted-foreground">
                  Your workspace is ready. Upload your first script to see Pulse in action.
                </p>
              </div>

              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full h-12"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
