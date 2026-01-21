import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, BarChart3, Users, Zap, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
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
              <Button onClick={() => navigate('/auth?mode=signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-border mb-8 animate-fade-down">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Script Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 text-balance animate-fade-up">
            Stakeholder-adaptive
            <br />
            <span className="text-primary font-semibold">script intelligence</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-fade-up animation-delay-100 font-light">
            Transform screenplay evaluation with 12 specialized AI agents analyzing 
            every perspective in the production chain.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-200">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg" 
              onClick={() => navigate('/auth?mode=signup')}
            >
              Start Analyzing
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg"
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
                <p className="text-3xl md:text-4xl font-mono font-bold text-primary">{stat.value}</p>
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
            Every perspective. <span className="text-primary font-semibold">One platform.</span>
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
            },
            {
              icon: Users,
              title: '8 Stakeholder Lenses',
              description: 'Toggle between Studio, Producer, Actor, Director, Writer, Financier, OTT, and Theatrical views.',
            },
            {
              icon: BarChart3,
              title: 'Prescriptive Insights',
              description: 'Get actionable recommendations backed by evidence from your script.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-white shadow-sm border border-border hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
        <div className="bg-white shadow-sm border border-border rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">
              Tailored for every <span className="text-primary font-semibold">stakeholder</span>
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
                className="p-4 rounded-xl bg-muted/50 border border-border text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <p className="font-medium text-sm">{lens}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-primary rounded-3xl p-12 lg:p-16 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6 text-primary-foreground">
            Ready to transform your <span className="font-semibold">script analysis</span>?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
            Join studios and creators using Pulse to make smarter decisions, faster.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="h-14 px-10 text-lg" 
            onClick={() => navigate('/auth?mode=signup')}
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
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
