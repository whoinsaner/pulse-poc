import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LensSelector } from '@/components/LensToggle';
import { StakeholderBadge } from '@/components/StakeholderBadge';
import { ExportDialog } from '@/components/report/ExportDialog';
import { DecisionSignalBadge } from '@/components/report/DecisionSignalBadge';
import { 
  FileText, 
  Users, 
  Film, 
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReadinessLabel } from '@/lib/scoreUtils';

interface ActionRailProps {
  reportData: ReportData;
  reportId: string;
  reportTitle: string;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export function ActionRail({
  reportData,
  reportId,
  reportTitle,
  activeLens,
  setActiveLens,
  currentScore,
  stakeholderLens,
}: ActionRailProps) {
  const navigate = useNavigate();
  const [statsExpanded, setStatsExpanded] = useState(true);
  
  const metadata = reportData.scriptMetadata;
  const totalCharacters = reportData.characters?.length || 0;
  const totalScenes = reportData.scenes?.length || 0;
  const totalInsights = reportData.insights?.length || 0;

  const readiness = getReadinessLabel(currentScore);

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-card hidden lg:flex flex-col h-[calc(100vh-6.5rem)] sticky top-[6.5rem]">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Hero Score */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <ScoreRing 
                score={currentScore} 
                size="lg" 
                label="Readiness"
                showBenchmark
                benchmarkScore={7}
              />
            </div>
            
            <div>
              <p className={cn("text-sm font-semibold", readiness.color)}>
                {readiness.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stakeholderLens 
                  ? `${LENS_CONFIG[stakeholderLens].label} View`
                  : `${LENS_CONFIG[activeLens].label} Perspective`
                }
              </p>
            </div>
            
            {/* Decision Signal Badge */}
            <DecisionSignalBadge score={currentScore} size="sm" />
          </div>

          {/* Quick Stats */}
          <div className="bg-muted/50 rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setStatsExpanded(!statsExpanded)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Stats
              </span>
              {statsExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {statsExpanded && (
              <div className="px-3 pb-3 space-y-2">
                <button
                  onClick={() => navigate('./story')}
                  className="w-full flex items-center justify-between py-2 border-t border-border/50 hover:bg-muted/50 rounded px-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Pages</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">{metadata?.pageCount || '—'}</span>
                </button>
                <button
                  onClick={() => navigate('./craft')}
                  className="w-full flex items-center justify-between py-2 border-t border-border/50 hover:bg-muted/50 rounded px-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Scenes</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">{totalScenes}</span>
                </button>
                <button
                  onClick={() => navigate('./characters')}
                  className="w-full flex items-center justify-between py-2 border-t border-border/50 hover:bg-muted/50 rounded px-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Characters</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">{totalCharacters}</span>
                </button>
                <button
                  onClick={() => navigate('./story')}
                  className="w-full flex items-center justify-between py-2 border-t border-border/50 hover:bg-muted/50 rounded px-1 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Insights</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">{totalInsights}</span>
                </button>
              </div>
            )}
          </div>

          {/* Stakeholder Lens Selector */}
          {!stakeholderLens && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Viewing As
              </h3>
              <LensSelector 
                activeLens={activeLens} 
                onLensChange={setActiveLens} 
                compact 
              />
            </div>
          )}

          {/* Stakeholder Badge for fixed lens */}
          {stakeholderLens && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Stakeholder Report
              </h3>
              <div className="bg-muted/50 rounded-xl border border-border p-3">
                <StakeholderBadge lens={stakeholderLens} size="md" showLabel />
                <p className="text-xs text-muted-foreground mt-2">
                  Analysis tailored for {LENS_CONFIG[stakeholderLens].label.toLowerCase()} priorities
                </p>
              </div>
            </div>
          )}

          {/* Key Insights Preview */}
          {reportData.insights && reportData.insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Top Insights
              </h3>
              <div className="space-y-2">
                {reportData.insights.slice(0, 3).map((insight, i) => (
                  <div 
                    key={i}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-accent-gold mt-0.5 shrink-0" />
                      <p className="text-xs font-medium line-clamp-2">{insight.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border bg-card">
        <ExportDialog reportId={reportId} reportTitle={reportTitle} />
      </div>
    </aside>
  );
}