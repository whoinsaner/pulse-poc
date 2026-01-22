import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getScoreColor, getScoreBgColor } from '@/lib/scoreUtils';
import { filterVisibleCategories } from '@/lib/reportUtils';

import { ParameterScoreData } from '@/types/database';

interface ParameterScoringProps {
  categoryScores: Record<string, number>; // Expected 0-100 scale
  parameterScores?: ParameterScoreData[];
}

/**
 * ParameterScoring - Displays category scores
 * STANDARDIZED 100-POINT SCALE: All scores should be 0-100
 * Filters out system/internal categories
 */
export function ParameterScoring({ categoryScores, parameterScores }: ParameterScoringProps) {
  // Filter out system category and use remaining as primary display
  const visibleCategoryScores = filterVisibleCategories(categoryScores);
  const parameters = Object.entries(visibleCategoryScores).map(([category, score]) => ({
    name: category,
    displayName: category,
    score: score, // Already 0-100 scale
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
                  getScoreBgColor(param.score),
                  getScoreColor(param.score)
                )}>
                  {Math.round(param.score)}
                </div>
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
