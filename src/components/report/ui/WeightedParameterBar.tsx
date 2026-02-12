import { cn } from '@/lib/utils';
import { getWeightTier, getScoreBarColor, getDiagnosticCategory } from '@/lib/scoreUtils';
import { Progress } from '@/components/ui/progress';
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
    <div className={cn('rounded-lg border border-border bg-card p-4', className)}>
      <div className="flex items-start gap-4">
        {/* Left: Title + Rationale */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {showWeight && weightTier.multiplierLabel && (
              <span className={cn('text-[10px] uppercase font-semibold shrink-0', weightTier.color)}>
                {weightTier.tier === 'core' ? 'CORE' : 'Polish'}
              </span>
            )}
            <h4 className="font-semibold text-sm text-foreground">{parameter.displayName}</h4>
          </div>
          {showRationale && parameter.rationale && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
              {parameter.rationale}
            </p>
          )}
        </div>

        {/* Right: Progress bar + Score */}
        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          <Progress
            value={parameter.score}
            indicatorClassName={cn(
              scoreColor,
              weightTier.tier === 'polish' && 'opacity-70'
            )}
            className={cn(
              'h-2.5 w-24',
              weightTier.tier === 'core' && 'h-3',
              weightTier.tier === 'polish' && 'h-2'
            )}
          />
          <span className={cn('font-mono font-bold text-base tabular-nums', diagnostic.color)}>
            {Math.round(parameter.score)}
          </span>
        </div>
      </div>
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
    <div className={cn('space-y-2', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group px-1">
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

        <div className="mt-3 space-y-5">
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
            <div className="mt-5 space-y-5">
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
