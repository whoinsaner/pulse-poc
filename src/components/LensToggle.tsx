import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LENS_CONFIG, StakeholderLens } from '@/types/database';
import {
  Building2,
  Clapperboard,
  User,
  Camera,
  PenTool,
  DollarSign,
  Tv,
  Film,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LensToggleProps {
  activeLens: StakeholderLens;
  onLensChange: (lens: StakeholderLens) => void;
  className?: string;
  compact?: boolean;
}

const LENS_ICONS: Record<StakeholderLens, React.ComponentType<{ className?: string }>> = {
  studio_executive: Building2,
  producer: Clapperboard,
  actor: User,
  director: Camera,
  writer: PenTool,
  financier: DollarSign,
  ott_platform: Tv,
  theatrical: Film,
};

const LENS_ORDER: StakeholderLens[] = [
  'studio_executive',
  'producer',
  'actor',
  'director',
  'writer',
  'financier',
  'ott_platform',
  'theatrical',
];

export function LensToggle({
  activeLens,
  onLensChange,
  className,
  compact = false,
}: LensToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border',
        className
      )}
    >
      {LENS_ORDER.map((lens) => {
        const config = LENS_CONFIG[lens];
        const Icon = LENS_ICONS[lens];
        const isActive = lens === activeLens;

        return (
          <Tooltip key={lens}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onLensChange(lens)}
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200',
                  'hover:bg-accent/50',
                  isActive && 'bg-primary text-primary-foreground shadow-glow',
                  !isActive && 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {!compact && (
                  <span className="text-sm font-medium hidden lg:inline">
                    {config.label}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function LensSelector({
  activeLens,
  onLensChange,
  className,
}: LensToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeConfig = LENS_CONFIG[activeLens];
  const ActiveIcon = LENS_ICONS[activeLens];

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg w-full',
          'bg-card border border-border hover:border-primary/50',
          'transition-all duration-200'
        )}
      >
        <div className="p-2 rounded-md bg-primary/10">
          <ActiveIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium">{activeConfig.label}</p>
          <p className="text-xs text-muted-foreground">{activeConfig.description}</p>
        </div>
        <svg
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-scale-in">
          {LENS_ORDER.map((lens) => {
            const config = LENS_CONFIG[lens];
            const Icon = LENS_ICONS[lens];
            const isActive = lens === activeLens;

            return (
              <button
                key={lens}
                onClick={() => {
                  onLensChange(lens);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 w-full text-left',
                  'hover:bg-accent/50 transition-colors',
                  isActive && 'bg-primary/10'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-md',
                    isActive ? 'bg-primary/20' : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div className="flex-1">
                  <p className={cn('font-medium', isActive && 'text-primary')}>
                    {config.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
