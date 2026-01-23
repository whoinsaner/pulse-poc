import { CheckCircle, ArrowRight, XCircle } from 'lucide-react';
import { getDecisionSignal } from '@/lib/scoreUtils';
import { cn } from '@/lib/utils';

interface StudioRecommendationProps {
  score: number;
  summary: string;
}

const iconMap = {
  CheckCircle,
  ArrowRight,
  XCircle,
};

export function StudioRecommendation({ score, summary }: StudioRecommendationProps) {
  const signal = getDecisionSignal(score);
  const Icon = iconMap[signal.icon];

  // Map decision signal to studio recommendation labels
  const getStudioLabel = () => {
    switch (signal.signal) {
      case 'go':
        return 'PROCEED TO PRODUCTION';
      case 'iterate':
        return score >= 55 ? 'PROCEED WITH DEVELOPMENT' : 'CONSIDER WITH REWRITE';
      case 'hold':
        return 'PASS - NEEDS MAJOR REVISION';
    }
  };

  // Extract verdict from summary
  const verdictText = summary || 'Analysis pending. The AI agents are processing this script to provide detailed recommendations.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Studio Recommendation */}
        <div className={cn(
          'p-6 rounded-xl border',
          signal.borderColor,
          signal.bgColor
        )}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Studio Recommendation
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <Icon className={cn('h-6 w-6', signal.color)} />
            <span className={cn('text-xl font-bold', signal.color)}>
              {getStudioLabel()}
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {signal.description}
          </p>
          
          {/* Decision Signal Badge */}
          <div className={cn(
            'mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
            signal.borderColor,
            'bg-background/50'
          )}>
            <span className={cn('text-xs font-semibold uppercase', signal.color)}>
              Decision: {signal.label}
            </span>
          </div>
        </div>

        {/* High-Level Verdict */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            High-Level Verdict
          </h2>
          <p className="text-foreground leading-relaxed">
            {verdictText.split('\n\n')[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
