import { cn } from '@/lib/utils';
import { StakeholderLens, LENS_CONFIG } from '@/types/database';
import { 
  Building2, 
  Clapperboard, 
  User, 
  Camera, 
  PenTool, 
  DollarSign, 
  Tv, 
  Film,
  Users,
  LucideIcon
} from 'lucide-react';

// Icon mapping for stakeholders
const STAKEHOLDER_ICONS: Record<StakeholderLens, LucideIcon> = {
  studio_executive: Building2,
  producer: Clapperboard,
  actor: User,
  director: Camera,
  writer: PenTool,
  financier: DollarSign,
  ott_platform: Tv,
  theatrical: Film,
};

// Color themes for each stakeholder
const STAKEHOLDER_COLORS: Record<StakeholderLens, { bg: string; border: string; text: string }> = {
  studio_executive: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-500',
  },
  producer: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-500',
  },
  actor: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-500',
  },
  director: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-500',
  },
  writer: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-500',
  },
  financier: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-500',
  },
  ott_platform: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
  },
  theatrical: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-500',
  },
};

interface StakeholderBadgeProps {
  lens: StakeholderLens | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function StakeholderBadge({ 
  lens, 
  size = 'md', 
  showLabel = true, 
  showIcon = true,
  className 
}: StakeholderBadgeProps) {
  // Handle "All Stakeholders" case
  if (!lens) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border font-medium',
          'bg-primary/10 border-primary/30 text-primary',
          size === 'sm' && 'px-2 py-0.5 text-xs',
          size === 'md' && 'px-3 py-1 text-sm',
          size === 'lg' && 'px-4 py-1.5 text-base',
          className
        )}
      >
        {showIcon && <Users className={cn(
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-4 w-4',
          size === 'lg' && 'h-5 w-5',
        )} />}
        {showLabel && <span>All Stakeholders</span>}
      </div>
    );
  }

  const Icon = STAKEHOLDER_ICONS[lens];
  const colors = STAKEHOLDER_COLORS[lens];
  const config = LENS_CONFIG[lens];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        colors.bg,
        colors.border,
        colors.text,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base',
        className
      )}
    >
      {showIcon && <Icon className={cn(
        size === 'sm' && 'h-3 w-3',
        size === 'md' && 'h-4 w-4',
        size === 'lg' && 'h-5 w-5',
      )} />}
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

// Compact version for lists
export function StakeholderIndicator({ lens }: { lens: StakeholderLens | null }) {
  if (!lens) {
    return (
      <div className="w-2 h-2 rounded-full bg-primary" title="All Stakeholders" />
    );
  }

  const colors = STAKEHOLDER_COLORS[lens];
  const config = LENS_CONFIG[lens];

  return (
    <div 
      className={cn('w-2 h-2 rounded-full', colors.bg.replace('/10', ''))} 
      title={config.label}
      style={{ backgroundColor: `hsl(var(--${lens === 'studio_executive' ? 'chart-2' : lens === 'producer' ? 'warning' : lens === 'actor' ? 'destructive' : lens === 'director' ? 'chart-6' : lens === 'writer' ? 'success' : lens === 'financier' ? 'success' : lens === 'ott_platform' ? 'destructive' : 'warning'}))` }}
    />
  );
}

export { STAKEHOLDER_COLORS, STAKEHOLDER_ICONS };
