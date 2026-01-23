import { Zap, Scale, Sparkles, Info, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type QualityMode = 'fast' | 'balanced' | 'quality' | string; // string for custom config UUIDs

export interface CustomModelConfig {
  id: string;
  name: string;
  description: string | null;
}

interface QualityModeSelectorProps {
  value: QualityMode;
  onChange: (mode: QualityMode) => void;
  disabled?: boolean;
  className?: string;
  customConfigs?: CustomModelConfig[];
}

const QUALITY_MODES = [
  {
    id: 'fast' as const,
    label: 'Fast',
    icon: Zap,
    description: '~2-3 min',
    tooltip: 'Uses lightweight models (Gemini Flash Lite) for all agents. Best for quick feedback on early drafts.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    activeColor: 'bg-amber-500/20 border-amber-500 shadow-amber-500/20',
    costTier: 'Low',
    costBadgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    estimatedCost: '$0.02-0.05',
  },
  {
    id: 'balanced' as const,
    label: 'Balanced',
    icon: Scale,
    description: '~4-6 min',
    tooltip: 'Standard models for simple agents, enhanced models for complex analysis (Character, Theme, Dialogue). Best balance of speed and quality.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
    activeColor: 'bg-primary/20 border-primary shadow-primary/20',
    costTier: 'Medium',
    costBadgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    estimatedCost: '$0.08-0.15',
  },
  {
    id: 'quality' as const,
    label: 'Quality',
    icon: Sparkles,
    description: '~8-12 min',
    tooltip: 'Premium models (Gemini Pro) for complex agents. Best for final script reviews and production decisions.',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    activeColor: 'bg-violet-500/20 border-violet-500 shadow-violet-500/20',
    costTier: 'High',
    costBadgeColor: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
    estimatedCost: '$0.20-0.40',
  },
];

// Helper to check if a value is a UUID (custom config)
const isUUID = (value: string): boolean => 
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function QualityModeSelector({ 
  value, 
  onChange, 
  disabled, 
  className,
  customConfigs = []
}: QualityModeSelectorProps) {
  const isCustomSelected = isUUID(value);
  const selectedCustomConfig = customConfigs.find(c => c.id === value);

  return (
    <TooltipProvider>
      <div className={cn('space-y-3', className)}>
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
        
        {/* System Presets */}
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
                      'relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all duration-200',
                      'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
                      disabled && 'opacity-50 cursor-not-allowed',
                      isActive
                        ? cn(mode.activeColor, 'shadow-lg')
                        : cn(mode.bgColor, mode.borderColor, 'hover:border-opacity-60')
                    )}
                  >
                    {/* Cost tier badge */}
                    <span className={cn(
                      'absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-semibold',
                      mode.costBadgeColor
                    )}>
                      {mode.costTier}
                    </span>
                    <Icon className={cn('h-5 w-5', mode.color)} />
                    <span className={cn('text-sm font-medium', isActive ? mode.color : 'text-foreground')}>
                      {mode.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">
                      {mode.description}
                    </span>
                    <span className={cn('text-[9px] font-medium', mode.color)}>
                      {mode.estimatedCost}
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

        {/* Custom Configurations */}
        {customConfigs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Custom Configurations</span>
              <Settings className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {customConfigs.map((config) => {
                const isActive = value === config.id;
                
                return (
                  <Tooltip key={config.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => !disabled && onChange(config.id)}
                        disabled={disabled}
                        className={cn(
                          'relative flex flex-col items-start gap-1 p-3 rounded-lg border-2 transition-all duration-200 text-left',
                          'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
                          disabled && 'opacity-50 cursor-not-allowed',
                          isActive
                            ? 'bg-fuchsia-500/20 border-fuchsia-500 shadow-lg shadow-fuchsia-500/20'
                            : 'bg-fuchsia-500/10 border-fuchsia-500/30 hover:border-fuchsia-500/60'
                        )}
                      >
                        {/* Custom badge */}
                        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400">
                          Custom
                        </span>
                        <Settings className={cn('h-4 w-4', isActive ? 'text-fuchsia-500' : 'text-fuchsia-400')} />
                        <span className={cn('text-sm font-medium truncate max-w-full', isActive ? 'text-fuchsia-500' : 'text-foreground')}>
                          {config.name}
                        </span>
                        {config.description && (
                          <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                            {config.description}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="text-sm font-medium">{config.name}</p>
                      {config.description && (
                        <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
