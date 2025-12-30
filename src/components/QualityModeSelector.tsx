import { Zap, Scale, Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type QualityMode = 'fast' | 'balanced' | 'quality';

interface QualityModeSelectorProps {
  value: QualityMode;
  onChange: (mode: QualityMode) => void;
  disabled?: boolean;
  className?: string;
}

const QUALITY_MODES = [
  {
    id: 'fast' as const,
    label: 'Fast',
    icon: Zap,
    description: '~2-3 min, lower cost',
    tooltip: 'Uses lightweight models (Gemini Flash Lite) for all agents. Best for quick feedback on early drafts.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    activeColor: 'bg-amber-500/20 border-amber-500 shadow-amber-500/20',
  },
  {
    id: 'balanced' as const,
    label: 'Balanced',
    icon: Scale,
    description: '~4-6 min, recommended',
    tooltip: 'Standard models for simple agents, enhanced models for complex analysis (Character, Theme, Dialogue). Best balance of speed and quality.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    activeColor: 'bg-primary/20 border-primary shadow-primary/20',
  },
  {
    id: 'quality' as const,
    label: 'Quality',
    icon: Sparkles,
    description: '~8-12 min, highest accuracy',
    tooltip: 'Premium models (Gemini Pro) for complex agents. Best for final script reviews and production decisions.',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    activeColor: 'bg-violet-500/20 border-violet-500 shadow-violet-500/20',
  },
];

export function QualityModeSelector({ value, onChange, disabled, className }: QualityModeSelectorProps) {
  return (
    <TooltipProvider>
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Analysis Quality</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p>Choose between speed and accuracy. Higher quality uses more advanced AI models for deeper analysis.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {QUALITY_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = value === mode.id;
            
            return (
              <Tooltip key={mode.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => !disabled && onChange(mode.id)}
                    disabled={disabled}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all duration-200',
                      'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
                      disabled && 'opacity-50 cursor-not-allowed',
                      isActive
                        ? cn(mode.activeColor, 'shadow-lg')
                        : cn(mode.bgColor, mode.borderColor, 'hover:border-opacity-60')
                    )}
                  >
                    <Icon className={cn('h-5 w-5', mode.color)} />
                    <span className={cn('text-sm font-medium', isActive ? mode.color : 'text-foreground')}>
                      {mode.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">
                      {mode.description}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">{mode.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
