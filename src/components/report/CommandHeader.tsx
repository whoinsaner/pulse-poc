import { useNavigate } from 'react-router-dom';
import { Report, ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Share2,
  Film,
  Tv,
  Clapperboard,
  FileVideo,
  FileText,
  Palette,
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
}: CommandHeaderProps) {
  const navigate = useNavigate();
  
  const scriptType = reportData.scriptMetadata?.scriptType || 'feature';
  const ScriptTypeIcon = SCRIPT_TYPE_ICONS[scriptType];
  const scriptTypeLabel = getScriptTypeLabel(scriptType);
  const scriptTypeColor = SCRIPT_TYPE_COLORS[scriptType];

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

        {/* Center: Score badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-xs text-muted-foreground">Score</span>
          <span className="font-mono font-bold text-sm text-primary">{Math.round(currentScore)}</span>
        </div>

        {/* Right: Lens + Actions */}
        <div className="flex items-center gap-2">
          {stakeholderLens && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-primary">
                {LENS_CONFIG[stakeholderLens].label}
              </span>
            </div>
          )}
          
          <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>
    </header>
  );
}