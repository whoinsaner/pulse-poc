import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { ParameterScoreData } from '@/types/database';

interface ParameterScoringProps {
  categoryScores: Record<string, number>; // Expected 0-10 scale
  parameterScores?: ParameterScoreData[];
}

/**
 * ParameterScoring - Displays category scores
 * STANDARDIZED 10-POINT SCALE: All scores should be 0-10
 */
export function ParameterScoring({ categoryScores, parameterScores }: ParameterScoringProps) {
  // 10-point scale thresholds
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'score-excellent';
    if (score >= 6.5) return 'score-good';
    if (score >= 5) return 'score-average';
    if (score >= 3) return 'score-poor';
    return 'score-critical';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'score-bg-excellent';
    if (score >= 6.5) return 'score-bg-good';
    if (score >= 5) return 'score-bg-average';
    if (score >= 3) return 'score-bg-poor';
    return 'score-bg-critical';
  };

  // Use category scores as the primary display (already 0-10)
  const parameters = Object.entries(categoryScores).map(([category, score]) => ({
    name: category,
    displayName: category,
    score: score, // Already 0-10 scale
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
                  {param.score.toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
