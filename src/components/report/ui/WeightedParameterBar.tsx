import { cn } from '@/lib/utils';
import { getWeightTier, getScoreBarColor, getDiagnosticCategory } from '@/lib/scoreUtils';
import { Progress } from '@/components/ui/progress';
import { Circle, CircleDot } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface WeightedParameter {
  parameterName: string;
  displayName: string;
  score: number;
  weight?: number;
  rationale?: string;
  evidence?: Array<{ quote?: string; explanation?: string }>;
}

interface WeightedParameterBarProps {
  parameter: WeightedParameter;
  showWeight?: boolean;
  showRationale?: boolean;
  className?: string;
}

export function WeightedParameterBar({
  parameter,
  showWeight = true,
  showRationale = false,
  className,
}: WeightedParameterBarProps) {
  const weightTier = getWeightTier(parameter.weight);
  const scoreColor = getScoreBarColor(parameter.score);
  const diagnostic = getDiagnosticCategory(parameter.score);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Weight indicator dot */}
          {showWeight && (
            <span className="shrink-0">
              {weightTier.tier === 'core' ? (
                <CircleDot className={cn('h-3.5 w-3.5', weightTier.color)} />
              ) : weightTier.tier === 'polish' ? (
                <Circle className={cn('h-3.5 w-3.5', weightTier.color)} />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground/40 fill-muted-foreground/20" />
              )}
            </span>
          )}
          
          <span className="text-sm font-medium truncate">{parameter.displayName}</span>
          
          {/* Weight multiplier label */}
          {showWeight && weightTier.multiplierLabel && (
            <span className={cn('text-[10px] uppercase font-semibold', weightTier.color)}>
              {weightTier.tier === 'core' ? 'CORE' : 'Polish'}
            </span>
          )}
        </div>

        <span className={cn('font-mono font-bold text-sm tabular-nums', diagnostic.color)}>
          {Math.round(parameter.score)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <Progress 
          value={parameter.score} 
          className={cn(
            'h-2',
            weightTier.tier === 'core' && 'h-2.5',
            weightTier.tier === 'polish' && 'h-1.5 opacity-70'
          )}
        />
      </div>

      {/* Rationale */}
      {showRationale && parameter.rationale && (
        <p className="text-xs text-muted-foreground pl-5">
          {parameter.rationale}
        </p>
      )}
    </div>
  );
}

// Collapsible list of parameters
interface WeightedParameterListProps {
  parameters: WeightedParameter[];
  title?: string;
  initiallyExpanded?: boolean;
  showAllByDefault?: boolean;
  defaultVisibleCount?: number;
  className?: string;
}

export function WeightedParameterList({
  parameters,
  title = 'Parameter Breakdown',
  initiallyExpanded = false,
  showAllByDefault = false,
  defaultVisibleCount = 5,
  className,
}: WeightedParameterListProps) {
  const [isOpen, setIsOpen] = useState(initiallyExpanded);
  
  // Sort by weight (core first) then by score (lowest first for attention)
  const sortedParams = [...parameters].sort((a, b) => {
    const weightA = a.weight ?? 1.0;
    const weightB = b.weight ?? 1.0;
    if (weightA !== weightB) return weightB - weightA; // Higher weight first
    return a.score - b.score; // Lower score first (needs attention)
  });

  const visibleParams = showAllByDefault ? sortedParams : sortedParams.slice(0, defaultVisibleCount);
  const hiddenParams = showAllByDefault ? [] : sortedParams.slice(defaultVisibleCount);

  return (
    <div className={cn('rounded-xl border bg-card p-4', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {parameters.length} parameters
            </span>
            <ChevronDown 
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isOpen && 'rotate-180'
              )} 
            />
          </div>
        </CollapsibleTrigger>

        <div className="mt-4 space-y-3">
          {visibleParams.map((param) => (
            <WeightedParameterBar
              key={param.parameterName}
              parameter={param}
              showWeight
              showRationale
            />
          ))}
        </div>

        {hiddenParams.length > 0 && (
          <CollapsibleContent>
            <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
              {hiddenParams.map((param) => (
                <WeightedParameterBar
                  key={param.parameterName}
                  parameter={param}
                  showWeight
                  showRationale
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}
