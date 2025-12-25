import { cn } from '@/lib/utils';
import { ScoreBadge, ScoreBar } from './ScoreDisplay';
import { InlineVerdict, VerdictType } from './VerdictBox';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
}

interface AnalysisTableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
  striped?: boolean;
  compact?: boolean;
  onRowClick?: (row: T, index: number) => void;
}

export function AnalysisTable<T extends Record<string, unknown>>({ 
  columns, 
  data, 
  className,
  striped = true,
  compact = false,
  onRowClick
}: AnalysisTableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  className={cn(
                    "font-semibold text-sm",
                    compact ? "px-3 py-2" : "px-4 py-3",
                    alignClasses[col.align || 'left']
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={cn(
                  "border-b border-border last:border-0 transition-colors",
                  striped && rowIndex % 2 === 1 && "bg-muted/20",
                  onRowClick && "cursor-pointer hover:bg-muted/40"
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((col) => {
                  const value = row[col.key as keyof T];
                  return (
                    <td 
                      key={String(col.key)}
                      className={cn(
                        "text-sm",
                        compact ? "px-3 py-2" : "px-4 py-3",
                        alignClasses[col.align || 'left']
                      )}
                    >
                      {col.render ? col.render(value, row, rowIndex) : String(value ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Pre-built column renderers
export const columnRenderers = {
  score: (value: number) => <ScoreBadge score={value} size="sm" />,
  
  scoreBar: (value: number, maxScore = 10) => (
    <ScoreBar score={value} maxScore={maxScore} showValue={false} />
  ),
  
  verdict: (type: VerdictType, label: string) => (
    <InlineVerdict type={type} label={label} />
  ),
  
  percentage: (value: number) => (
    <span className="font-medium">{(value * 100).toFixed(0)}%</span>
  ),
  
  boolean: (value: boolean) => (
    <InlineVerdict 
      type={value ? 'success' : 'error'} 
      label={value ? 'Yes' : 'No'} 
    />
  ),
  
  priority: (value: number) => {
    const type: VerdictType = value <= 1 ? 'error' : value <= 2 ? 'warning' : 'info';
    const label = value <= 1 ? 'Critical' : value <= 2 ? 'High' : value <= 3 ? 'Medium' : 'Low';
    return <InlineVerdict type={type} label={label} />;
  },
};

// Category breakdown table variant
interface CategoryBreakdownProps {
  categories: {
    name: string;
    score: number;
    items?: { name: string; score: number }[];
  }[];
  className?: string;
}

export function CategoryBreakdown({ categories, className }: CategoryBreakdownProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {categories.map((category, index) => (
        <div key={index} className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
            <span className="font-semibold">{category.name}</span>
            <ScoreBadge score={category.score} />
          </div>
          {category.items && category.items.length > 0 && (
            <div className="divide-y divide-border">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <ScoreBadge score={item.score} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
