import { Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export type QualityMode = 'quality' | string; // string for custom config UUIDs

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
  const isSystemSelected = value === 'quality';

  return (
    <TooltipProvider>
      <div className={cn('space-y-3', className)}>
        {/* System Configuration */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => !disabled && onChange('quality')}
                disabled={disabled}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left',
                  'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
                  disabled && 'opacity-50 cursor-not-allowed',
                  isSystemSelected
                    ? 'bg-violet-500/20 border-violet-500 shadow-lg shadow-violet-500/10'
                    : 'bg-violet-500/5 border-violet-500/20 hover:border-violet-500/40'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  isSystemSelected ? 'bg-violet-500/30' : 'bg-violet-500/10'
                )}>
                  <Sparkles className={cn('h-4 w-4', isSystemSelected ? 'text-violet-500' : 'text-violet-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-semibold', isSystemSelected ? 'text-violet-600 dark:text-violet-400' : 'text-foreground')}>
                      Quality
                    </span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-violet-500/30 text-violet-500">
                      Default
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Premium models • ~8-12 min • $0.20-0.40
                  </span>
                </div>
                {isSystemSelected && (
                  <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-sm">Uses Gemini Pro for complex agents. Best for final script reviews and production decisions.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Custom Configurations */}
        {customConfigs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom</span>
              <Settings className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
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
                          'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left',
                          'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
                          disabled && 'opacity-50 cursor-not-allowed',
                          isActive
                            ? 'bg-fuchsia-500/20 border-fuchsia-500 shadow-lg shadow-fuchsia-500/10'
                            : 'bg-fuchsia-500/5 border-fuchsia-500/20 hover:border-fuchsia-500/40'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          isActive ? 'bg-fuchsia-500/30' : 'bg-fuchsia-500/10'
                        )}>
                          <Settings className={cn('h-4 w-4', isActive ? 'text-fuchsia-500' : 'text-fuchsia-400')} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={cn('text-sm font-semibold block truncate', isActive ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-foreground')}>
                            {config.name}
                          </span>
                          {config.description && (
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              {config.description}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-fuchsia-500 shrink-0" />
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
