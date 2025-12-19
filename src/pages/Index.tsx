import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, BarChart3, Users, Zap } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-6/10 rounded-full blur-3xl" />

        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Log in
              </Button>
              <Button onClick={() => navigate('/auth?mode=signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Script Analysis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
            Stakeholder-adaptive
            <br />
            <span className="gradient-text">script intelligence</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Transform screenplay evaluation with 12 specialized AI agents analyzing 
            every perspective in the production chain—from studio executives to actors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg" onClick={() => navigate('/auth?mode=signup')}>
              Start Analyzing
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg" onClick={() => navigate('/sample-report')}>
              Explore Film Sample
            </Button>
            <Button size="lg" variant="ghost" className="h-14 px-8 text-lg" onClick={() => navigate('/sample-comic-report')}>
              Explore Comic Sample
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Every perspective. One platform.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Switch between 8 stakeholder lenses to instantly see how your script 
            performs for different decision-makers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              className="p-8 rounded-xl bg-card border border-border card-hover"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-border p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your script analysis?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join studios and creators using Pulse to make smarter decisions, faster.
            </p>
            <Button size="lg" className="h-14 px-8 text-lg" onClick={() => navigate('/auth?mode=signup')}>
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
