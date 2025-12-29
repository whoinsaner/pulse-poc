import { Filter, Eye } from 'lucide-react';
import { StakeholderLens } from '@/types/database';
import { StakeholderBadge } from '@/components/StakeholderBadge';
import { cn } from '@/lib/utils';

interface StakeholderFilterNoticeProps {
  stakeholderLens: StakeholderLens;
  shownCount?: number;
  totalCount?: number;
  className?: string;
}

/**
 * Notice component shown when viewing a stakeholder-filtered report section.
 * Displays the active stakeholder lens and optional parameter counts.
 */
export function StakeholderFilterNotice({
  stakeholderLens,
  shownCount,
  totalCount,
  className,
}: StakeholderFilterNoticeProps) {
  const hasStats = shownCount !== undefined && totalCount !== undefined;
  
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30",
      className
    )}>
      <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Viewing as</span>
        <StakeholderBadge lens={stakeholderLens} size="sm" showLabel />
        {hasStats && shownCount !== totalCount && (
          <span className="text-sm text-muted-foreground">
            — showing {shownCount} of {totalCount} parameters
          </span>
        )}
      </div>
    </div>
  );
}
