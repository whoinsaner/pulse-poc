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
}> = {
  info: { 
    icon: Info, 
    bgColor: 'bg-info/5',
    borderColor: 'border-info/30',
    iconColor: 'text-info',
    titleColor: 'text-info',
  },
  success: { 
    icon: CheckCircle2, 
    bgColor: 'bg-success/5',
    borderColor: 'border-success/30',
    iconColor: 'text-success',
    titleColor: 'text-success',
  },
  warning: { 
    icon: AlertTriangle, 
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/30',
    iconColor: 'text-warning',
    titleColor: 'text-warning',
  },
  error: { 
    icon: XCircle, 
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/30',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
  },
  insight: { 
    icon: Lightbulb, 
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary/30',
    iconColor: 'text-primary',
    titleColor: 'text-primary',
  },
  finding: { 
    icon: Target, 
    bgColor: 'bg-chart-2/5',
    borderColor: 'border-chart-2/30',
    iconColor: 'text-chart-2',
    titleColor: 'text-chart-2',
  },
  opportunity: { 
    icon: TrendingUp, 
    bgColor: 'bg-success/5',
    borderColor: 'border-success/30',
    iconColor: 'text-success',
    titleColor: 'text-success',
  },
  issue: { 
    icon: AlertCircle, 
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/30',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
  },
};

export function VerdictBox({ type, title, content, className, icon }: VerdictBoxProps) {
  const config = verdictConfig[type];
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "rounded-xl border-l-4 p-4",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-3">
        {icon || <IconComponent className={cn("h-5 w-5 mt-0.5 shrink-0", config.iconColor)} />}
        <div className="flex-1 min-w-0">
          <h4 className={cn("font-semibold", config.titleColor)}>{title}</h4>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{content}</p>
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
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
      config.bgColor,
      config.iconColor,
      className
    )}>
      <IconComponent className="h-3 w-3" />
      {label}
    </span>
  );
}
