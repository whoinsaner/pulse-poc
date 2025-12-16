import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { CATEGORY_COLORS } from '@/types/database';
import { cn } from '@/lib/utils';

interface CategoryBarChartProps {
  categoryScores: Record<string, number>;
  className?: string;
  horizontal?: boolean;
}

export function CategoryBarChart({
  categoryScores,
  className,
  horizontal = false,
}: CategoryBarChartProps) {
  const data = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a)
    .map(([category, score]) => ({
      category,
      score: Math.round(score),
      fill: CATEGORY_COLORS[category] || 'hsl(var(--primary))',
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="font-medium text-sm">{payload[0].payload.category}</p>
          <p className="text-primary text-lg font-bold">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (horizontal) {
    return (
      <div className={cn('w-full h-64', className)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              dataKey="category"
              type="category"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
            <Bar
              dataKey="score"
              radius={[0, 4, 4, 0]}
              animationDuration={1000}
              animationBegin={0}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={cn('w-full h-64', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
          <Bar
            dataKey="score"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
            animationBegin={0}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
