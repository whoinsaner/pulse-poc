import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CATEGORY_COLORS } from '@/types/database';
import { cn } from '@/lib/utils';

interface CategoryRadarChartProps {
  categoryScores: Record<string, number>;
  compact?: boolean;
  className?: string;
}

export function CategoryRadarChart({
  categoryScores,
  compact = false,
  className,
}: CategoryRadarChartProps) {
  const data = Object.entries(categoryScores).map(([category, score]) => ({
    category: category.length > 10 ? category.slice(0, 8) + '...' : category,
    fullCategory: category,
    score: Math.round(score),
    fullMark: 100,
  }));

  if (data.length < 3) {
    return null;
  }

  return (
    <div className={cn('w-full', compact ? 'h-40' : 'h-64', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius={compact ? '70%' : '80%'} data={data}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="category"
            tick={{
              fill: 'hsl(var(--muted-foreground))',
              fontSize: compact ? 10 : 12,
            }}
          />
          {!compact && (
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10,
              }}
              tickCount={5}
            />
          )}
          <Radar
            name="Score"
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
            animationDuration={1000}
            animationBegin={0}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
