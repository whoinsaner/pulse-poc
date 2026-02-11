import { useNavigate } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { cn } from '@/lib/utils';
import { getUSAFNavGroups } from '@/lib/reportNavigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Film, 
  Users, 
  Zap, 
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScoreRing } from '@/components/ScoreRing';
import { LensSelector } from '@/components/LensToggle';
import { StakeholderBadge } from '@/components/StakeholderBadge';
import { DecisionSignalBadge } from '@/components/report/DecisionSignalBadge';
import { ExportDialog } from '@/components/report/ExportDialog';
import { getReadinessLabel } from '@/lib/scoreUtils';
import { useState } from 'react';

interface ReportSidebarProps {
  reportData: ReportData;
  currentPath: string;
  runId: string;
  reportId: string;
  reportTitle: string;
  collapsed: boolean;
  onToggle: () => void;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export function ReportSidebar({
  reportData,
  currentPath,
  runId,
  reportId,
  reportTitle,
  collapsed,
  onToggle,
  activeLens,
  setActiveLens,
  currentScore,
  stakeholderLens,
}: ReportSidebarProps) {
  const navigate = useNavigate();
  const [statsExpanded, setStatsExpanded] = useState(true);
  const scriptType = reportData.scriptMetadata?.scriptType || 'feature';
  const navGroups = getUSAFNavGroups(scriptType, reportData.categoryScores);

  const metadata = reportData.scriptMetadata;
  const totalCharacters = reportData.characters?.length || 0;
  const totalScenes = reportData.scenes?.length || 0;
  const totalInsights = reportData.insights?.length || 0;
  const readiness = getReadinessLabel(currentScore);

  return (
    <aside
      className={cn(
        "shrink-0 border-r border-border bg-card flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 transition-all duration-200",
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
                  {stakeholderLens 
                    ? `${LENS_CONFIG[stakeholderLens].label} View`
                    : `${LENS_CONFIG[activeLens].label} Perspective`
                  }
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
                {!collapsed && (
                  <span className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {group.label}
                  </span>
                )}
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

          {/* Quick Stats - expanded only */}
          {!collapsed && (
            <div className="bg-muted/50 rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setStatsExpanded(!statsExpanded)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-muted transition-colors"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Stats
                </span>
                {statsExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              {statsExpanded && (
                <div className="px-2.5 pb-2.5 space-y-1">
                  <button onClick={() => navigate(`/report/${runId}/story`)} className="w-full flex items-center justify-between py-1.5 border-t border-border/50 hover:bg-muted/50 rounded px-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">Pages</span>
                    </div>
                    <span className="font-mono font-semibold text-xs">{metadata?.pageCount || '—'}</span>
                  </button>
                  <button onClick={() => navigate(`/report/${runId}/craft`)} className="w-full flex items-center justify-between py-1.5 border-t border-border/50 hover:bg-muted/50 rounded px-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <Film className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">Scenes</span>
                    </div>
                    <span className="font-mono font-semibold text-xs">{totalScenes}</span>
                  </button>
                  <button onClick={() => navigate(`/report/${runId}/characters`)} className="w-full flex items-center justify-between py-1.5 border-t border-border/50 hover:bg-muted/50 rounded px-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">Characters</span>
                    </div>
                    <span className="font-mono font-semibold text-xs">{totalCharacters}</span>
                  </button>
                  <button onClick={() => navigate(`/report/${runId}/story`)} className="w-full flex items-center justify-between py-1.5 border-t border-border/50 hover:bg-muted/50 rounded px-1 transition-colors">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">Insights</span>
                    </div>
                    <span className="font-mono font-semibold text-xs">{totalInsights}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stakeholder Lens - expanded only */}
          {!collapsed && !stakeholderLens && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Viewing As
              </h3>
              <LensSelector 
                activeLens={activeLens} 
                onLensChange={setActiveLens} 
                compact 
              />
            </div>
          )}

          {!collapsed && stakeholderLens && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Stakeholder Report
              </h3>
              <div className="bg-muted/50 rounded-xl border border-border p-2.5">
                <StakeholderBadge lens={stakeholderLens} size="md" showLabel />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Tailored for {LENS_CONFIG[stakeholderLens].label.toLowerCase()} priorities
                </p>
              </div>
            </div>
          )}

          {/* Top Insights - expanded only */}
          {!collapsed && reportData.insights && reportData.insights.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Top Insights
              </h3>
              <div className="space-y-1.5">
                {reportData.insights.slice(0, 3).map((insight, i) => (
                  <div 
                    key={i}
                    className="p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-3 w-3 text-accent-gold mt-0.5 shrink-0" />
                      <p className="text-xs font-medium line-clamp-2">{insight.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom: Export + Collapse */}
      <div className="p-2 border-t border-border space-y-1">
        {!collapsed && (
          <ExportDialog reportId={reportId} reportTitle={reportTitle} />
        )}
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
