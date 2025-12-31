import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, MinusCircle } from 'lucide-react';

export type AssessmentStatus = 'yes' | 'no' | 'partial' | 'na';

export interface AssessmentItem {
  label: string;
  status: AssessmentStatus;
  description?: string;
}

interface AssessmentCardProps {
  title?: string;
  items: AssessmentItem[];
  className?: string;
  style?: React.CSSProperties;
}

const statusConfig: Record<AssessmentStatus, { icon: typeof CheckCircle2; color: string; bgColor: string; label: string }> = {
  yes: { 
    icon: CheckCircle2, 
    color: 'text-success', 
    bgColor: 'bg-success/10',
    label: 'Yes'
  },
  no: { 
    icon: XCircle, 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    label: 'No'
  },
  partial: { 
    icon: AlertCircle, 
    color: 'text-warning', 
    bgColor: 'bg-warning/10',
    label: 'Partial'
  },
  na: { 
    icon: MinusCircle, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted/30',
    label: 'N/A'
  },
};

export function AssessmentCard({ title, items, className, style }: AssessmentCardProps) {
  return (
    <div 
      className={cn(
        "glass-premium rounded-xl p-5 transition-all duration-300 hover:shadow-lg",
        className
      )}
      style={style}
    >
      {title && (
        <h4 className="font-display font-semibold text-lg mb-5 tracking-tight">{title}</h4>
      )}
      <div className="space-y-3">
        {items.map((item, index) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] group",
                config.bgColor
              )}
            >
              <div className="flex-1">
                <p className="font-medium">{item.label}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
              <div className={cn(
                "flex items-center gap-2 transition-transform duration-200 group-hover:scale-110",
                config.color
              )}>
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Grid variant for multiple assessment groups
interface AssessmentGridProps {
  groups: {
    title: string;
    items: AssessmentItem[];
  }[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function AssessmentGrid({ groups, columns = 3, className }: AssessmentGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn("grid gap-5", gridCols[columns], className)}>
      {groups.map((group, index) => (
        <AssessmentCard 
          key={index} 
          title={group.title} 
          items={group.items}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
