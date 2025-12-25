import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  Wrench, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationEffort = 'easy' | 'moderate' | 'difficult';

interface RecommendationCardProps {
  title: string;
  description: string;
  priority?: RecommendationPriority;
  effort?: RecommendationEffort;
  impact?: string;
  action?: string;
  className?: string;
}

const priorityConfig: Record<RecommendationPriority, { color: string; bgColor: string; label: string }> = {
  critical: { color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'Critical' },
  high: { color: 'text-warning', bgColor: 'bg-warning/10', label: 'High' },
  medium: { color: 'text-info', bgColor: 'bg-info/10', label: 'Medium' },
  low: { color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Low' },
};

const effortConfig: Record<RecommendationEffort, { icon: typeof Clock; color: string; label: string }> = {
  easy: { icon: Zap, color: 'text-success', label: 'Quick Fix' },
  moderate: { icon: Clock, color: 'text-warning', label: 'Moderate Effort' },
  difficult: { icon: Wrench, color: 'text-destructive', label: 'Major Work' },
};

export function RecommendationCard({ 
  title, 
  description, 
  priority = 'medium',
  effort,
  impact,
  action,
  className 
}: RecommendationCardProps) {
  const pConfig = priorityConfig[priority];
  const eConfig = effort ? effortConfig[effort] : null;

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", pConfig.bgColor)}>
          <Lightbulb className={cn("h-5 w-5", pConfig.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{title}</h4>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              pConfig.bgColor,
              pConfig.color
            )}>
              {pConfig.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          
          {(effort || impact) && (
            <div className="flex items-center gap-4 mt-3">
              {eConfig && (
                <div className="flex items-center gap-1.5 text-xs">
                  <eConfig.icon className={cn("h-3.5 w-3.5", eConfig.color)} />
                  <span className={eConfig.color}>{eConfig.label}</span>
                </div>
              )}
              {impact && (
                <div className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{impact}</span>
                </div>
              )}
            </div>
          )}
          
          {action && (
            <div className="flex items-center gap-1.5 mt-3 text-sm font-medium text-primary">
              <ArrowRight className="h-4 w-4" />
              <span>{action}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Tiered recommendation list
interface TieredRecommendationsProps {
  tiers: {
    label: string;
    priority: RecommendationPriority;
    items: {
      title: string;
      description: string;
      effort?: RecommendationEffort;
      impact?: string;
    }[];
  }[];
  className?: string;
}

export function TieredRecommendations({ tiers, className }: TieredRecommendationsProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {tiers.map((tier, tierIndex) => (
        <div key={tierIndex}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className={cn(
              "h-5 w-5",
              priorityConfig[tier.priority].color
            )} />
            <h3 className="font-semibold text-lg">{tier.label}</h3>
            <span className="text-sm text-muted-foreground">
              ({tier.items.length} item{tier.items.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div className="space-y-3">
            {tier.items.map((item, itemIndex) => (
              <RecommendationCard
                key={itemIndex}
                title={item.title}
                description={item.description}
                priority={tier.priority}
                effort={item.effort}
                impact={item.impact}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
