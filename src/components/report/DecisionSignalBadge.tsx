import { CheckCircle, ArrowRight, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDecisionSignal, DecisionSignalData } from '@/lib/scoreUtils';

interface DecisionSignalBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

const iconMap = {
  CheckCircle,
  ArrowRight,
  XCircle,
};

export function DecisionSignalBadge({ 
  score, 
  size = 'md', 
  showDescription = false,
  className 
}: DecisionSignalBadgeProps) {
  const signal = getDecisionSignal(score);
  const Icon = iconMap[signal.icon];

  const sizeClasses = {
    sm: {
      container: 'px-3 py-1.5',
      icon: 'h-4 w-4',
      label: 'text-sm font-bold',
      description: 'text-xs',
    },
    md: {
      container: 'px-4 py-2',
      icon: 'h-5 w-5',
      label: 'text-lg font-bold',
      description: 'text-sm',
    },
    lg: {
      container: 'px-6 py-3',
      icon: 'h-6 w-6',
      label: 'text-xl font-bold tracking-wide',
      description: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div 
      className={cn(
        'rounded-lg border inline-flex flex-col items-center gap-1',
        signal.bgColor,
        signal.borderColor,
        classes.container,
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn(classes.icon, signal.color)} />
        <span className={cn(classes.label, signal.color)}>
          {signal.label}
        </span>
      </div>
      {showDescription && (
        <p className={cn(classes.description, 'text-muted-foreground text-center max-w-xs')}>
          {signal.description}
        </p>
      )}
    </div>
  );
}
