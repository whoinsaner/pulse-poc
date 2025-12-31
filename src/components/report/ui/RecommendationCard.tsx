import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  Wrench, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles
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

const priorityConfig: Record<RecommendationPriority, { color: string; bgColor: string; borderGlow: string; label: string }> = {
  critical: { 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10', 
    borderGlow: 'border-destructive/30 hover:border-destructive/50',
    label: 'Critical' 
  },
  high: { 
    color: 'text-warning', 
    bgColor: 'bg-warning/10', 
    borderGlow: 'border-warning/30 hover:border-warning/50',
    label: 'High' 
  },
  medium: { 
    color: 'text-info', 
    bgColor: 'bg-info/10', 
    borderGlow: 'border-info/30 hover:border-info/50',
    label: 'Medium' 
  },
  low: { 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted/50', 
    borderGlow: 'border-border hover:border-primary/30',
    label: 'Low' 
  },
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
      "glass-premium rounded-xl p-5 transition-all duration-300 hover:shadow-lg group",
      pConfig.borderGlow,
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110",
          pConfig.bgColor
        )}>
          <Lightbulb className={cn("h-5 w-5", pConfig.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-display font-semibold tracking-tight">{title}</h4>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm",
              pConfig.bgColor,
              pConfig.color
            )}>
              {pConfig.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          
          {(effort || impact) && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
              {eConfig && (
                <div className="flex items-center gap-1.5 text-xs">
                  <eConfig.icon className={cn("h-3.5 w-3.5", eConfig.color)} />
                  <span className={cn("font-medium", eConfig.color)}>{eConfig.label}</span>
                </div>
              )}
              {impact && (
                <div className="flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="font-medium">{impact}</span>
                </div>
              )}
            </div>
          )}
          
          {action && (
            <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform duration-300">
              <Sparkles className="h-4 w-4" />
              <span>{action}</span>
              <ArrowRight className="h-4 w-4" />
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
    <div className={cn("space-y-10", className)}>
      {tiers.map((tier, tierIndex) => (
        <div key={tierIndex} className="animate-fade-in" style={{ animationDelay: `${tierIndex * 100}ms` }}>
          <div className="flex items-center gap-3 mb-5">
            <div className={cn(
              "p-2 rounded-lg",
              priorityConfig[tier.priority].bgColor
            )}>
              <AlertTriangle className={cn(
                "h-5 w-5",
                priorityConfig[tier.priority].color
              )} />
            </div>
            <h3 className="font-display font-semibold text-lg tracking-tight">{tier.label}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-muted text-muted-foreground">
              {tier.items.length} item{tier.items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-4">
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
