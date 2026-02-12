import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface ListItem {
  text: string;
  detail?: string;
}

interface StrengthWeaknessListProps {
  strengths?: ListItem[];
  weaknesses?: ListItem[];
  layout?: 'columns' | 'stacked';
  className?: string;
}

export function StrengthWeaknessList({ 
  strengths = [], 
  weaknesses = [], 
  layout = 'columns',
  className 
}: StrengthWeaknessListProps) {
  return (
    <div className={cn(
      layout === 'columns' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6",
      className
    )}>
      {strengths.length > 0 && (
        <div className="rounded-xl border border-border bg-card border-l-4 border-l-success p-5 transition-all duration-300 hover:shadow-lg hover:shadow-success/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <h4 className="font-display font-semibold text-success tracking-tight">What Works</h4>
          </div>
          <ul className="space-y-4">
            {strengths.map((item, index) => (
              <li 
                key={index} 
                className="flex gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.text}</p>
                  {item.detail && (
                    <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {weaknesses.length > 0 && (
        <div className="rounded-xl border border-border bg-card border-l-4 border-l-destructive p-5 transition-all duration-300 hover:shadow-lg hover:shadow-destructive/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <h4 className="font-display font-semibold text-destructive tracking-tight">Needs Improvement</h4>
          </div>
          <ul className="space-y-4">
            {weaknesses.map((item, index) => (
              <li 
                key={index} 
                className="flex gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.text}</p>
                  {item.detail && (
                    <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Compact strength/weakness tags
interface TagListProps {
  items: string[];
  type: 'strength' | 'weakness';
  className?: string;
}

export function StrengthWeaknessTags({ items, type, className }: TagListProps) {
  const isStrength = type === 'strength';
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item, index) => (
        <span 
          key={index}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:scale-105",
            isStrength 
              ? "bg-success/10 text-success hover:bg-success/15" 
              : "bg-destructive/10 text-destructive hover:bg-destructive/15"
          )}
          style={{ animationDelay: `${index * 30}ms` }}
        >
          {isStrength ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {item}
        </span>
      ))}
    </div>
  );
}
