import { useNavigate } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { cn } from '@/lib/utils';
import { getUSAFNavGroups } from '@/lib/reportNavigation';
import { 
  ChevronLeft, 
  ChevronRight, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScoreRing } from '@/components/ScoreRing';
import { DecisionSignalBadge } from '@/components/report/DecisionSignalBadge';
import { getReadinessLabel } from '@/lib/scoreUtils';

interface SampleReportSidebarProps {
  reportData: ReportData;
  currentPath: string;
  basePath: string;
  collapsed: boolean;
  onToggle: () => void;
  activeLens: StakeholderLens;
  currentScore: number;
}

export function SampleReportSidebar({
  reportData,
  currentPath,
  basePath,
  collapsed,
  onToggle,
  activeLens,
  currentScore,
}: SampleReportSidebarProps) {
  const navigate = useNavigate();
  const scriptType = reportData.scriptMetadata?.scriptType || 'feature';
  const navGroups = getUSAFNavGroups(scriptType, reportData.categoryScores);

  const readiness = getReadinessLabel(currentScore);

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-card flex flex-col h-[calc(100vh-6.5rem)] sticky top-[6.5rem] transition-all duration-200",
        collapsed ? "w-14" : "w-64"
      )}
    >
      <ScrollArea className="flex-1">
        <div className={cn("space-y-4", collapsed ? "p-1" : "p-3")}>
          
          {/* Hero Score - only when expanded */}
          {!collapsed && (
            <div className="text-center space-y-3 pb-3 border-b border-border">
              <div className="relative inline-block">
                <ScoreRing 
                  score={currentScore} 
                  size="md" 
                  label="Readiness"
                  showBenchmark
                  benchmarkScore={7}
                />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", readiness.color)}>
                  {readiness.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {LENS_CONFIG[activeLens].label} Perspective
                </p>
              </div>
              <DecisionSignalBadge score={currentScore} size="sm" />
            </div>
          )}

          {/* Collapsed: mini score */}
          {collapsed && (
            <div className="flex flex-col items-center py-2 border-b border-border">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-default">
                      <span className="font-mono font-bold text-lg text-primary">{Math.round(currentScore)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">{readiness.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {navGroups.map((group) => (
              <div key={group.id} className="mb-2">
                <div className="space-y-0.5">
                  {group.items.map((item, itemIndex) => {
                    const isActive = item.path === currentPath;
                    const Icon = item.icon;
                    const isSubItem = group.id !== 'reference' && group.items.length > 1 && itemIndex > 0;

                    const button = (
                      <button
                        key={item.id}
                        onClick={() => navigate(`${basePath}${item.path}`)}
                        className={cn(
                          "w-full flex items-center gap-2.5 rounded-lg font-medium transition-all",
                          collapsed ? "justify-center px-2 py-2.5 text-sm" : isSubItem ? "pl-6 pr-3 py-1.5 text-xs" : "px-3 py-2 text-sm",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className={cn("shrink-0", isSubItem && !collapsed ? "h-3.5 w-3.5" : "h-4 w-4")} />
                        {!collapsed && <span>{item.label}</span>}
                      </button>
                    );

                    if (collapsed) {
                      return (
                        <TooltipProvider key={item.id} delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }
                    return button;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Bottom: Collapse toggle */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("w-full", collapsed ? "justify-center" : "")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
