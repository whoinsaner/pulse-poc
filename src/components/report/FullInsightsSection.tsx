import { InsightData } from '@/types/database';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Target, 
  TrendingUp,
  Zap,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface FullInsightsSectionProps {
  insights: InsightData[];
}

export function FullInsightsSection({ insights }: FullInsightsSectionProps) {
  // Categorize insights
  const strengths = insights.filter(i => i.category === 'strength' || i.priority <= 2).slice(0, 6);
  const improvements = insights.filter(i => i.category === 'weakness' || i.category === 'improvement' || i.priority >= 4).slice(0, 6);
  const opportunities = insights.filter(i => i.category === 'opportunity' || i.priority === 3).slice(0, 4);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return CheckCircle2;
      case 'weakness': return AlertCircle;
      case 'opportunity': return Lightbulb;
      case 'risk': return AlertTriangle;
      default: return Target;
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'strength': return 'bg-success/10 border-success/30 text-success';
      case 'weakness': 
      case 'improvement': return 'bg-warning/10 border-warning/30 text-warning';
      case 'opportunity': return 'bg-chart-2/10 border-chart-2/30 text-chart-2';
      case 'risk': return 'bg-destructive/10 border-destructive/30 text-destructive';
      default: return 'bg-muted border-border text-muted-foreground';
    }
  };

  return (
    <section className="min-h-screen py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-3/10 text-chart-3 text-sm font-medium">
            Key Findings
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Strengths & Opportunities
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {insights.length} actionable insights to guide your next steps
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Strengths */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">What's Working</h3>
                <p className="text-muted-foreground">Key strengths of your script</p>
              </div>
            </div>

            <div className="space-y-4">
              {strengths.length > 0 ? strengths.map((insight, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-success/5 border border-success/20 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-success/10 shrink-0">
                      <Sparkles className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.supportingEvidence && insight.supportingEvidence.length > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-background/50">
                          <p className="text-xs italic text-muted-foreground">
                            "{insight.supportingEvidence[0].quote || insight.supportingEvidence[0].explanation}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 rounded-xl bg-muted/50 text-center">
                  <p className="text-muted-foreground">No strengths identified yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Priority Fixes */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Priority Fixes</h3>
                <p className="text-muted-foreground">Areas needing attention</p>
              </div>
            </div>

            <div className="space-y-4">
              {improvements.length > 0 ? improvements.map((insight, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-warning/5 border border-warning/20 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 shrink-0">
                      <span className="font-bold text-warning text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.actionable && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">
                          <Zap className="h-3 w-3" />
                          Actionable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 rounded-xl bg-muted/50 text-center">
                  <p className="text-muted-foreground">No critical fixes identified</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Opportunities section */}
        {opportunities.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-chart-2/10">
                <Lightbulb className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Growth Opportunities</h3>
                <p className="text-muted-foreground">Ways to elevate your script further</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {opportunities.map((insight, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-chart-2/5 border border-chart-2/20 animate-fade-up hover:border-chart-2/40 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-2 rounded-lg bg-chart-2/10 w-fit mb-3">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                  </div>
                  <h4 className="font-semibold mb-2">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="mt-16 grid sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-success/5 border border-success/20 text-center">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-3xl font-bold">{strengths.length}</p>
            <p className="text-sm text-muted-foreground">Strengths</p>
          </div>
          <div className="p-5 rounded-xl bg-warning/5 border border-warning/20 text-center">
            <AlertCircle className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-3xl font-bold">{improvements.length}</p>
            <p className="text-sm text-muted-foreground">Fixes Needed</p>
          </div>
          <div className="p-5 rounded-xl bg-chart-2/5 border border-chart-2/20 text-center">
            <Lightbulb className="h-8 w-8 text-chart-2 mx-auto mb-2" />
            <p className="text-3xl font-bold">{opportunities.length}</p>
            <p className="text-sm text-muted-foreground">Opportunities</p>
          </div>
          <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold">{insights.filter(i => i.actionable).length}</p>
            <p className="text-sm text-muted-foreground">Actionable</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Small sparkles icon for the component
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  );
}
