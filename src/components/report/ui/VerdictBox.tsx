import { cn } from '@/lib/utils';
import { 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lightbulb,
  Target,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export type VerdictType = 'info' | 'success' | 'warning' | 'error' | 'insight' | 'finding' | 'opportunity' | 'issue';

interface VerdictBoxProps {
  type: VerdictType;
  title: string;
  content: string;
  className?: string;
  icon?: React.ReactNode;
}

const verdictConfig: Record<VerdictType, { 
  icon: typeof Info; 
  bgColor: string; 
  borderColor: string;
  iconColor: string;
  titleColor: string;
  glowColor: string;
}> = {
  info: { 
    icon: Info, 
    bgColor: 'bg-info/5',
    borderColor: 'border-l-info',
    iconColor: 'text-info',
    titleColor: 'text-info',
    glowColor: 'hover:shadow-info/10',
  },
  success: { 
    icon: CheckCircle2, 
    bgColor: 'bg-success/5',
    borderColor: 'border-l-success',
    iconColor: 'text-success',
    titleColor: 'text-success',
    glowColor: 'hover:shadow-success/10',
  },
  warning: { 
    icon: AlertTriangle, 
    bgColor: 'bg-warning/5',
    borderColor: 'border-l-warning',
    iconColor: 'text-warning',
    titleColor: 'text-warning',
    glowColor: 'hover:shadow-warning/10',
  },
  error: { 
    icon: XCircle, 
    bgColor: 'bg-destructive/5',
    borderColor: 'border-l-destructive',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
    glowColor: 'hover:shadow-destructive/10',
  },
  insight: { 
    icon: Lightbulb, 
    bgColor: 'bg-primary/5',
    borderColor: 'border-l-primary',
    iconColor: 'text-primary',
    titleColor: 'text-primary',
    glowColor: 'hover:shadow-primary/10',
  },
  finding: { 
    icon: Target, 
    bgColor: 'bg-chart-2/5',
    borderColor: 'border-l-chart-2',
    iconColor: 'text-chart-2',
    titleColor: 'text-chart-2',
    glowColor: 'hover:shadow-chart-2/10',
  },
  opportunity: { 
    icon: TrendingUp, 
    bgColor: 'bg-success/5',
    borderColor: 'border-l-success',
    iconColor: 'text-success',
    titleColor: 'text-success',
    glowColor: 'hover:shadow-success/10',
  },
  issue: { 
    icon: AlertCircle, 
    bgColor: 'bg-destructive/5',
    borderColor: 'border-l-destructive',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
    glowColor: 'hover:shadow-destructive/10',
  },
};

export function VerdictBox({ type, title, content, className, icon }: VerdictBoxProps) {
  const config = verdictConfig[type];
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "bg-white shadow-sm border border-border rounded-xl border-l-4 p-5 transition-all duration-300 hover:shadow-md group",
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-2 rounded-lg transition-transform duration-300 group-hover:scale-110",
          config.bgColor
        )}>
          {icon || <IconComponent className={cn("h-5 w-5", config.iconColor)} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-display font-semibold tracking-tight", config.titleColor)}>{title}</h4>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}

// Compact inline verdict for tables/lists
interface InlineVerdictProps {
  type: VerdictType;
  label: string;
  className?: string;
}

export function InlineVerdict({ type, label, className }: InlineVerdictProps) {
  const config = verdictConfig[type];
  const IconComponent = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105",
      config.bgColor,
      config.iconColor,
      className
    )}>
      <IconComponent className="h-3 w-3" />
      {label}
    </span>
  );
}
