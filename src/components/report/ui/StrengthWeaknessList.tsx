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
        <div className="rounded-xl border border-success/30 bg-success/5 p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h4 className="font-semibold text-success">What Works</h4>
          </div>
          <ul className="space-y-3">
            {strengths.map((item, index) => (
              <li key={index} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.text}</p>
                  {item.detail && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {weaknesses.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <h4 className="font-semibold text-destructive">Needs Improvement</h4>
          </div>
          <ul className="space-y-3">
            {weaknesses.map((item, index) => (
              <li key={index} className="flex gap-3">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{item.text}</p>
                  {item.detail && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
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
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
            isStrength 
              ? "bg-success/10 text-success" 
              : "bg-destructive/10 text-destructive"
          )}
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
