import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, BarChart3, Users, Zap, Play } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-gold/5" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-gold/10 rounded-full blur-[100px]" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="font-medium">
                Log in
              </Button>
              <Button onClick={() => navigate('/auth?mode=signup')} className="glow-primary">
                Get Started
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-premium mb-8 animate-fade-down">
            <Sparkles className="h-4 w-4 text-accent-gold" />
            <span className="text-sm font-medium">AI-Powered Script Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 text-balance animate-fade-up">
            Stakeholder-adaptive
            <br />
            <span className="gradient-gold">script intelligence</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-up animation-delay-100 font-light">
            Transform screenplay evaluation with 12 specialized AI agents analyzing 
            every perspective in the production chain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-200">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg glow-primary" 
              onClick={() => navigate('/auth?mode=signup')}
            >
              Start Analyzing
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg glass"
              onClick={() => navigate('/sample-report')}
            >
              <Play className="h-5 w-5 mr-2" />
              View Sample Report
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-up animation-delay-300">
            {[
              { value: '12', label: 'AI Agents' },
              { value: '8', label: 'Stakeholder Lenses' },
              { value: '50+', label: 'Parameters' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-mono font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
            Every perspective. <span className="gradient-gold">One platform.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Switch between 8 stakeholder lenses to instantly see how your script 
            performs for different decision-makers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              icon: Zap,
              title: '12 AI Agents',
              description: 'Specialized agents analyze structure, character, dialogue, theme, market fit, and more.',
              gradient: 'from-primary/20 to-primary/5',
            },
            {
              icon: Users,
              title: '8 Stakeholder Lenses',
              description: 'Toggle between Studio, Producer, Actor, Director, Writer, Financier, OTT, and Theatrical views.',
              gradient: 'from-accent-gold/20 to-accent-gold/5',
            },
            {
              icon: BarChart3,
              title: 'Prescriptive Insights',
              description: 'Get actionable recommendations backed by evidence from your script.',
              gradient: 'from-success/20 to-success/5',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={cn(
                "p-8 rounded-2xl glass-premium card-hover group",
                "bg-gradient-to-br",
                feature.gradient
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 font-display">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stakeholder Lenses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="glass-premium rounded-3xl p-8 lg:p-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-gold/5" />
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl mb-4">
                Tailored for every <span className="gradient-text">stakeholder</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Each lens weighs parameters differently, giving you role-specific insights.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Studio Executive',
                'Producer',
                'Director',
                'Actor',
                'Writer',
                'Financier',
                'OTT Platform',
                'Theatrical',
              ].map((lens, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-card/50 border border-border/50 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <p className="font-medium text-sm">{lens}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-accent-gold/20" />
          <div className="absolute inset-0 glass-premium" />
          
          <div className="relative z-10 p-12 lg:p-16 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
              Ready to transform your <span className="gradient-gold">script analysis</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join studios and creators using Pulse to make smarter decisions, faster.
            </p>
            <Button 
              size="lg" 
              className="h-14 px-10 text-lg glow-gold bg-accent-gold text-accent-gold-foreground hover:bg-accent-gold/90" 
              onClick={() => navigate('/auth?mode=signup')}
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2024 Pulse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}