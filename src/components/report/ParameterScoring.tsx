import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { ParameterScoreData } from '@/types/database';

interface ParameterScoringProps {
  categoryScores: Record<string, number>;
  parameterScores?: ParameterScoreData[];
}

export function ParameterScoring({ categoryScores, parameterScores }: ParameterScoringProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-chart-3';
    if (score >= 50) return 'text-chart-4';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-chart-3/10';
    if (score >= 50) return 'bg-chart-4/10';
    if (score >= 40) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  // Use category scores as the primary display
  const parameters = Object.entries(categoryScores).map(([category, score]) => ({
    name: category,
    displayName: category,
    score: score,
    description: `Analysis of ${category.toLowerCase()} aspects of the script`,
    category,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h2 className="text-2xl font-bold mb-8">Pulse Parameter Scoring</h2>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TooltipProvider>
          {parameters.map((param, index) => (
            <div
              key={param.name}
              className={cn(
                'p-4 rounded-xl border border-border bg-card',
                'transition-all duration-300 hover:border-primary/30 animate-fade-up'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{param.displayName}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p>{param.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className={cn(
                  'px-3 py-1.5 rounded-lg font-bold text-lg',
                  getScoreBg(param.score),
                  getScoreColor(param.score)
                )}>
                  {(param.score / 10).toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
