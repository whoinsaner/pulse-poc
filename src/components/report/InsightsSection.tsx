import { InsightData } from '@/types/database';
import { cn } from '@/lib/utils';
import { Lightbulb, AlertTriangle, CheckCircle, Info, ChevronRight } from 'lucide-react';

interface InsightsSectionProps {
  insights: InsightData[];
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  const sortedInsights = [...insights].sort((a, b) => a.priority - b.priority);

  const getInsightIcon = (category: string, priority: number) => {
    if (priority <= 2) return AlertTriangle;
    if (category.toLowerCase().includes('strength')) return CheckCircle;
    return Lightbulb;
  };

  const getInsightStyle = (priority: number) => {
    if (priority === 1) return 'border-destructive/30 bg-destructive/5';
    if (priority <= 3) return 'border-warning/30 bg-warning/5';
    return 'border-border bg-card';
  };

  const getIconStyle = (priority: number) => {
    if (priority === 1) return 'text-destructive';
    if (priority <= 3) return 'text-warning';
    return 'text-primary';
  };

  return (
    <div className="bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Key Insights</h2>
            <p className="text-muted-foreground">Actionable recommendations from AI analysis</p>
          </div>
        </div>

        <div className="grid gap-4">
          {sortedInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.category, insight.priority);
            
            return (
              <div
                key={index}
                className={cn(
                  'p-4 sm:p-6 rounded-xl border transition-all duration-300 animate-fade-up',
                  'hover:shadow-lg hover:-translate-y-0.5',
                  getInsightStyle(insight.priority)
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-2 rounded-lg bg-background/50', getIconStyle(insight.priority))}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-background/50">
                        {insight.category}
                      </span>
                      {insight.actionable && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
                          Actionable
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Priority {insight.priority}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{insight.title}</h3>
                    <p className="text-muted-foreground">{insight.description}</p>

                    {insight.supportingEvidence && insight.supportingEvidence.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <details className="group">
                          <summary className="flex items-center gap-1 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                            <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                            {insight.supportingEvidence.length} supporting evidence
                          </summary>
                          <div className="mt-3 space-y-2 pl-5">
                            {insight.supportingEvidence.map((ev, i) => (
                              <div key={i} className="text-sm p-2 rounded bg-background/50">
                                {ev.quote && (
                                  <p className="italic mb-1">"{ev.quote}"</p>
                                )}
                                <p className="text-muted-foreground">{ev.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
