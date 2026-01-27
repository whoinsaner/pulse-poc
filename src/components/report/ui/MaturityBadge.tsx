import { cn } from '@/lib/utils';
import { getMaturityStage, MaturityStage } from '@/lib/scoreUtils';
import { Circle, CircleDot, CircleCheck } from 'lucide-react';

interface MaturityBadgeProps {
  score: number;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STAGES: MaturityStage[] = ['draft', 'developing', 'polished', 'production'];

export function MaturityBadge({ 
  score, 
  showDescription = false, 
  size = 'md',
  className 
}: MaturityBadgeProps) {
  const maturity = getMaturityStage(score);
  const currentIndex = STAGES.indexOf(maturity.stage);

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Progress dots */}
      <div className={cn('flex items-center', sizeClasses[size])}>
        {STAGES.map((stage, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={stage} className="flex items-center">
              {index === 0 ? null : (
                <div 
                  className={cn(
                    'h-0.5 w-3 sm:w-4',
                    isActive ? maturity.bgColor.replace('/10', '/40') : 'bg-border'
                  )} 
                />
              )}
              <div className="relative">
                {isCurrent ? (
                  <CircleDot className={cn(iconSizes[size], maturity.color)} />
                ) : isActive ? (
                  <CircleCheck className={cn(iconSizes[size], maturity.color)} />
                ) : (
                  <Circle className={cn(iconSizes[size], 'text-muted-foreground/40')} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className={cn('flex items-center justify-between mt-1', sizeClasses[size])}>
        {STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const stageLabel = stage.charAt(0).toUpperCase() + stage.slice(1);
          
          return (
            <span 
              key={stage}
              className={cn(
                'text-[10px] sm:text-xs transition-colors',
                isCurrent ? maturity.color + ' font-medium' : 'text-muted-foreground/60',
                index === 0 && 'text-left',
                index === STAGES.length - 1 && 'text-right'
              )}
            >
              {stageLabel}
            </span>
          );
        })}
      </div>

      {/* Description */}
      {showDescription && (
        <p className={cn('mt-2 text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {maturity.description}
        </p>
      )}
    </div>
  );
}

// Compact inline version
interface InlineMaturityProps {
  score: number;
  className?: string;
}

export function InlineMaturity({ score, className }: InlineMaturityProps) {
  const maturity = getMaturityStage(score);
  
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        maturity.bgColor,
        maturity.borderColor,
        maturity.color,
        className
      )}
    >
      <CircleDot className="h-3 w-3" />
      {maturity.label}
    </span>
  );
}
