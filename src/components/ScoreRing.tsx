import { cn } from '@/lib/utils';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

export function ScoreRing({
  score,
  size = 'md',
  showLabel = true,
  label,
  className,
  animated = true,
}: ScoreRingProps) {
  const sizes = {
    sm: { diameter: 60, stroke: 4, fontSize: 'text-sm', labelSize: 'text-[10px]' },
    md: { diameter: 100, stroke: 6, fontSize: 'text-2xl', labelSize: 'text-xs' },
    lg: { diameter: 140, stroke: 8, fontSize: 'text-4xl', labelSize: 'text-sm' },
    xl: { diameter: 200, stroke: 10, fontSize: 'text-5xl', labelSize: 'text-base' },
  };

  const { diameter, stroke, fontSize, labelSize } = sizes[size];
  const radius = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--score-excellent)';
    if (score >= 65) return 'var(--score-good)';
    if (score >= 50) return 'var(--score-average)';
    if (score >= 35) return 'var(--score-poor)';
    return 'var(--score-critical)';
  };

  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 65) return 'score-good';
    if (score >= 50) return 'score-average';
    if (score >= 35) return 'score-poor';
    return 'score-critical';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className={cn('transform -rotate-90', animated && 'transition-all duration-1000')}
      >
        {/* Background circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={`hsl(${getScoreColor(score)})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={cn(animated && 'transition-all duration-1000 ease-out')}
          style={{
            filter: `drop-shadow(0 0 8px hsl(${getScoreColor(score)} / 0.5))`,
          }}
        />
        {/* Inner glow */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius - stroke}
          fill="none"
          stroke={`hsl(${getScoreColor(score)} / 0.1)`}
          strokeWidth={stroke * 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', fontSize, getScoreClass(score))}>
          {Math.round(score)}
        </span>
        {showLabel && label && (
          <span className={cn('text-muted-foreground mt-1', labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
