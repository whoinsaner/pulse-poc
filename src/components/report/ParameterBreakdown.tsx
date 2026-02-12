import { Card } from '@/components/ui/card';
import { SubSectionHeader } from '@/components/report/ui/SectionHeader';
import { WeightedParameterBar, WeightedParameter } from '@/components/report/ui/WeightedParameterBar';
import { cn } from '@/lib/utils';

interface ParameterBreakdownProps {
  title: string;
  parameters: Array<{
    parameterName?: string;
    displayName?: string;
    score: number;
    rationale?: string | null;
  }>;
  maxVisible?: number;
  className?: string;
}

/**
 * Standardized parameter breakdown section used across all report sub-pages.
 * Renders parameters with full-width progress bars, scores, and rationale.
 */
export function ParameterBreakdown({ title, parameters, maxVisible = 8, className }: ParameterBreakdownProps) {
  if (parameters.length === 0) return null;

  return (
    <Card className={cn('p-6', className)}>
      <SubSectionHeader title={title} />
      <div className="space-y-5">
        {parameters.slice(0, maxVisible).map((param, index) => (
          <WeightedParameterBar
            key={param.parameterName || index}
            parameter={{
              parameterName: param.parameterName || `param-${index}`,
              displayName: param.displayName || param.parameterName || '',
              score: param.score,
              rationale: param.rationale || undefined,
            }}
            showWeight={false}
            showRationale
          />
        ))}
      </div>
    </Card>
  );
}
