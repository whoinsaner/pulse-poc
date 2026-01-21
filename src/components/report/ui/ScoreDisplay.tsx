import { cn } from '@/lib/utils';
import { 
  getScoreColor as getScoreColorUtil, 
  getScoreBgColor as getScoreBgColorUtil, 
  getScoreLabel as getScoreLabelUtil,
  normalizeScore
} from '@/lib/scoreUtils';

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

// Re-export from scoreUtils for backwards compatibility (0-100 scale)
function getScoreColor(score: number): string {
  return getScoreColorUtil(score);
}

function getScoreBgColor(score: number): string {
  return getScoreBgColorUtil(score);
}

function getScoreLabel(score: number): string {
  return getScoreLabelUtil(score);
}

const sizeConfig = {
  sm: {
    container: 'px-3 py-2',
    score: 'text-lg',
    max: 'text-xs',
    label: 'text-xs',
  },
  md: {
    container: 'px-4 py-3',
    score: 'text-2xl',
    max: 'text-sm',
    label: 'text-xs',
  },
  lg: {
    container: 'px-5 py-4',
    score: 'text-4xl',
    max: 'text-base',
    label: 'text-sm',
  },
  xl: {
    container: 'px-8 py-6',
    score: 'text-6xl',
    max: 'text-lg',
    label: 'text-base',
  },
};

export function ScoreDisplay({ score, maxScore = 100, size = 'md', showLabel = true, className }: ScoreDisplayProps) {
  const colorClass = getScoreColor(score);
  const bgColorClass = getScoreBgColor(score);
  const label = getScoreLabel(score);
  const config = sizeConfig[size];

  return (
    <div className={cn(
      "inline-flex flex-col items-center rounded-2xl transition-all duration-300 hover:scale-105",
      bgColorClass,
      config.container,
      className
    )}>
      <div className="flex items-baseline gap-1">
        <span className={cn("font-mono font-bold tracking-tight", colorClass, config.score)}>
          {Math.round(score)}
        </span>
        <span className={cn("text-muted-foreground font-mono", config.max)}>
          / {maxScore}
        </span>
      </div>
      {showLabel && (
        <span className={cn("font-display font-medium mt-1.5 tracking-tight", colorClass, config.label)}>
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

export function ScoreBar({ score, maxScore = 100, label, showValue = true, className }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  const colorClass = getScoreColor(score);

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-display font-medium tracking-tight">{label}</span>}
          {showValue && (
            <span className={cn("font-mono font-semibold tabular-nums", colorClass)}>
              {Math.round(score)} / {maxScore}
            </span>
          )}
        </div>
      )}
      <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
            score >= 80 ? 'bg-[hsl(var(--score-excellent))]' :
            score >= 65 ? 'bg-[hsl(var(--score-good))]' :
            score >= 50 ? 'bg-[hsl(var(--score-average))]' :
            score >= 30 ? 'bg-[hsl(var(--score-poor))]' :
            'bg-[hsl(var(--score-critical))]'
          )}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
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

export function ScoreBadge({ score, maxScore = 100, size = 'md', className }: ScoreBadgeProps) {
  const colorClass = getScoreColor(score);
  const bgColorClass = getScoreBgColor(score);

  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-full font-mono font-bold tabular-nums transition-all duration-200 hover:scale-110",
      bgColorClass,
      colorClass,
      size === 'sm' ? 'h-7 w-14 text-xs' : 'h-9 w-18 text-sm',
      className
    )}>
      {Math.round(score)}
    </span>
  );
}

export { getScoreColor, getScoreBgColor, getScoreLabel };
