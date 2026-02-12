import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report, ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { Button } from '@/components/ui/button';
import { ExportDialog } from '@/components/report/ExportDialog';
import { Badge } from '@/components/ui/badge';
import { LensSelector } from '@/components/LensToggle';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ArrowLeft, 
  Share2,
  Film,
  Tv,
  Clapperboard,
  FileVideo,
  FileText,
  Palette,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getScriptTypeLabel } from '@/lib/reportNavigation';
import type { ScriptType } from '@/types/database';

interface CommandHeaderProps {
  report: Report;
  reportData: ReportData;
  currentPath: string;
  activeLens: StakeholderLens;
  stakeholderLens: StakeholderLens | null;
  currentScore: number;
  runId: string;
  isComic: boolean;
  onShare: () => void;
  onLensChange?: (lens: StakeholderLens) => void;
}

// Script type icons mapping
const SCRIPT_TYPE_ICONS: Record<ScriptType, typeof Film> = {
  feature: Film,
  pilot: Tv,
  episode: Clapperboard,
  short: FileVideo,
  documentary: FileText,
  comic: Palette,
  web_series: Tv,
  micro_drama: FileVideo,
};

// Script type badge colors
const SCRIPT_TYPE_COLORS: Record<ScriptType, string> = {
  feature: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  pilot: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  episode: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  short: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  documentary: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  comic: 'bg-chart-6/15 text-chart-6 border-chart-6/30',
  web_series: 'bg-primary/15 text-primary border-primary/30',
  micro_drama: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
};

export function CommandHeader({
  report,
  reportData,
  currentPath,
  activeLens,
  stakeholderLens,
  currentScore,
  runId,
  isComic,
  onShare,
  onLensChange,
}: CommandHeaderProps) {
  const navigate = useNavigate();
  const [statsOpen, setStatsOpen] = useState(false);
  
  const scriptType = reportData.scriptMetadata?.scriptType || 'feature';
  const ScriptTypeIcon = SCRIPT_TYPE_ICONS[scriptType];
  const scriptTypeLabel = getScriptTypeLabel(scriptType);
  const scriptTypeColor = SCRIPT_TYPE_COLORS[scriptType];

  const metadata = reportData.scriptMetadata;
  const totalCharacters = reportData.characters?.length || 0;
  const totalScenes = reportData.scenes?.length || 0;
  const totalInsights = reportData.insights?.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      {/* Single row: Back, title, script type, score, actions */}
      <div className="h-14 flex items-center justify-between px-4 lg:px-6 gap-4">
        {/* Left: Back + Title + Script Type Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/scripts')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-semibold text-lg truncate">
              {reportData.scriptMetadata?.title || report.title}
            </h1>
            
            {/* Script Type Badge */}
            <Badge 
              variant="outline" 
              className={cn(
                "hidden sm:inline-flex items-center gap-1.5 shrink-0 border",
                scriptTypeColor
              )}
            >
              <ScriptTypeIcon className="h-3 w-3" />
              <span className="text-xs font-medium">{scriptTypeLabel}</span>
            </Badge>
          </div>
        </div>




        {/* Right: Quick Stats + Lens + Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Stats Pill */}
          <Popover open={statsOpen} onOpenChange={setStatsOpen}>
            <PopoverTrigger asChild>
              <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border hover:bg-muted/80 transition-colors">
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {metadata?.pageCount || '—'}p · {totalScenes}s · {totalCharacters}c
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <div className="space-y-1">
                <button onClick={() => { navigate(`/report/${runId}/story`); setStatsOpen(false); }} className="w-full flex items-center justify-between py-2 px-2.5 hover:bg-muted rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">Pages</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">{metadata?.pageCount || '—'}</span>
                </button>
                <button onClick={() => { navigate(`/report/${runId}/craft`); setStatsOpen(false); }} className="w-full flex items-center justify-between py-2 px-2.5 hover:bg-muted rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <Film className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">Scenes</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">{totalScenes}</span>
                </button>
                <button onClick={() => { navigate(`/report/${runId}/characters`); setStatsOpen(false); }} className="w-full flex items-center justify-between py-2 px-2.5 hover:bg-muted rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">Characters</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">{totalCharacters}</span>
                </button>
                <button onClick={() => { navigate(`/report/${runId}/story`); setStatsOpen(false); }} className="w-full flex items-center justify-between py-2 px-2.5 hover:bg-muted rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">Insights</span>
                  </div>
                  <span className="font-mono font-semibold text-sm">{totalInsights}</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {stakeholderLens && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-primary">
                {LENS_CONFIG[stakeholderLens].label}
              </span>
            </div>
          )}

          {!stakeholderLens && onLensChange && (
            <div className="hidden sm:block">
              <LensSelector activeLens={activeLens} onLensChange={onLensChange} compact />
            </div>
          )}
          
          <ExportDialog reportId={report.id} reportTitle={report.title} reportData={reportData} activeLens={activeLens} scriptType={reportData?.scriptMetadata?.scriptType} />
          
          <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>
    </header>
  );
}