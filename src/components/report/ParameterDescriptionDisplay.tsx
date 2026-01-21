import { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getParameterById, type ParameterDefinition } from '@/lib/parameterDefinitions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ParameterDescriptionProps {
  parameterId: string;
  className?: string;
  showInline?: boolean;
}

export function ParameterDescription({ parameterId, className, showInline = false }: ParameterDescriptionProps) {
  const param = getParameterById(parameterId);
  
  if (!param) return null;
  
  if (showInline) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {param.description}
      </p>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className={cn("inline-flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground transition-colors", className)}>
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{param.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ParameterScoringGuideProps {
  parameterId: string;
  className?: string;
}

export function ParameterScoringGuide({ parameterId, className }: ParameterScoringGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const param = getParameterById(parameterId);
  
  if (!param) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <span>Scoring Guide</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded-md p-2">
          {param.scoringGuide}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface ParameterDetailCardProps {
  parameterId: string;
  score?: number;
  className?: string;
}

export function ParameterDetailCard({ parameterId, score, className }: ParameterDetailCardProps) {
  const param = getParameterById(parameterId);
  
  if (!param) return null;
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-destructive';
  };
  
  return (
    <div className={cn("p-4 rounded-xl bg-white shadow-sm border border-border", className)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h4 className="font-semibold text-sm">{param.displayName}</h4>
          <p className="text-xs text-muted-foreground">{param.category}</p>
        </div>
        {score !== undefined && (
          <span className={cn("font-mono font-bold text-lg", getScoreColor(score))}>
            {score.toFixed(1)}
          </span>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        {param.description}
      </p>
      
      <ParameterScoringGuide parameterId={parameterId} />
    </div>
  );
}

interface ParameterListProps {
  parameters: Array<{
    parameterId?: string;
    parameterName: string;
    displayName: string;
    score: number;
    category: string;
  }>;
  showDescriptions?: boolean;
  className?: string;
}

export function ParameterListWithDescriptions({ parameters, showDescriptions = true, className }: ParameterListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {parameters.map((param, index) => (
        <div 
          key={param.parameterId || `param-${index}`}
          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{param.displayName}</span>
              {showDescriptions && (
                <ParameterDescription parameterId={param.parameterName} />
              )}
            </div>
            <span className="text-xs text-muted-foreground">{param.category}</span>
          </div>
          <span className={cn(
            "font-mono font-semibold tabular-nums",
            param.score >= 8 ? 'text-success' :
            param.score >= 6 ? 'text-warning' :
            'text-destructive'
          )}>
            {param.score.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
