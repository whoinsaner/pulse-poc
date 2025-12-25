import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'score-excellent';
  if (score >= 6.5) return 'score-good';
  if (score >= 5) return 'score-average';
  if (score >= 3) return 'score-poor';
  return 'score-critical';
}

function getScoreBgColor(score: number): string {
  if (score >= 8) return 'score-bg-excellent';
  if (score >= 6.5) return 'score-bg-good';
  if (score >= 5) return 'score-bg-average';
  if (score >= 3) return 'score-bg-poor';
  return 'score-bg-critical';
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Exceptional';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Good';
  if (score >= 6) return 'Good';
  if (score >= 5) return 'Average';
  if (score >= 4) return 'Below Average';
  if (score >= 3) return 'Needs Work';
  return 'Critical';
}

const sizeConfig = {
  sm: {
    container: 'px-2 py-1',
    score: 'text-lg',
    max: 'text-xs',
    label: 'text-xs',
  },
  md: {
    container: 'px-3 py-2',
    score: 'text-2xl',
    max: 'text-sm',
    label: 'text-xs',
  },
  lg: {
    container: 'px-4 py-3',
    score: 'text-4xl',
    max: 'text-base',
    label: 'text-sm',
  },
  xl: {
    container: 'px-6 py-4',
    score: 'text-6xl',
    max: 'text-lg',
    label: 'text-base',
  },
};

export function ScoreDisplay({ score, maxScore = 10, size = 'md', showLabel = true, className }: ScoreDisplayProps) {
  const colorClass = getScoreColor(score);
  const bgColorClass = getScoreBgColor(score);
  const label = getScoreLabel(score);
  const config = sizeConfig[size];

  return (
    <div className={cn(
      "inline-flex flex-col items-center rounded-xl",
      bgColorClass,
      config.container,
      className
    )}>
      <div className="flex items-baseline gap-1">
        <span className={cn("font-bold", colorClass, config.score)}>
          {score.toFixed(1)}
        </span>
        <span className={cn("text-muted-foreground", config.max)}>
          / {maxScore}
        </span>
      </div>
      {showLabel && (
        <span className={cn("font-medium mt-1", colorClass, config.label)}>
          {label}
        </span>
      )}
    </div>
  );
}

// Horizontal score bar variant
interface ScoreBarProps {
  score: number;
  maxScore?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ScoreBar({ score, maxScore = 10, label, showValue = true, className }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  const colorClass = getScoreColor(score);

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showValue && (
            <span className={cn("font-semibold", colorClass)}>
              {score.toFixed(1)} / {maxScore}
            </span>
          )}
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score >= 8 ? 'bg-[hsl(var(--score-excellent))]' :
            score >= 6.5 ? 'bg-[hsl(var(--score-good))]' :
            score >= 5 ? 'bg-[hsl(var(--score-average))]' :
            score >= 3 ? 'bg-[hsl(var(--score-poor))]' :
            'bg-[hsl(var(--score-critical))]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Compact score badge
interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function ScoreBadge({ score, maxScore = 10, size = 'md', className }: ScoreBadgeProps) {
  const colorClass = getScoreColor(score);
  const bgColorClass = getScoreBgColor(score);

  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-full font-bold",
      bgColorClass,
      colorClass,
      size === 'sm' ? 'h-6 w-12 text-xs' : 'h-8 w-16 text-sm',
      className
    )}>
      {score.toFixed(1)}
    </span>
  );
}

export { getScoreColor, getScoreBgColor, getScoreLabel };
