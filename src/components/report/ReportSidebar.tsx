import { useNavigate } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { cn } from '@/lib/utils';
import { getUSAFNavGroups } from '@/lib/reportNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReportSidebarProps {
  reportData: ReportData;
  currentPath: string;
  runId: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function ReportSidebar({
  reportData,
  currentPath,
  runId,
  collapsed,
  onToggle,
}: ReportSidebarProps) {
  const navigate = useNavigate();
  const scriptType = reportData.scriptMetadata?.scriptType || 'feature';
  const navGroups = getUSAFNavGroups(scriptType, reportData.categoryScores);

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-card flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 transition-all duration-200",
        collapsed ? "w-14" : "w-52"
      )}
    >
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {navGroups.map((group) => (
            <div key={group.id} className="mb-3">
              {/* Group label */}
              {!collapsed && (
                <span className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {group.label}
                </span>
              )}

              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.path === currentPath;
                  const Icon = item.icon;

                  const button = (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/report/${runId}${item.path}`)}
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all",
                        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
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
      </ScrollArea>

      {/* Collapse toggle */}
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
