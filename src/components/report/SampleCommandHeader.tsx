import { useNavigate } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
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
  Sparkles } from
'lucide-react';
import { cn } from '@/lib/utils';
import { getUSAFNavGroups, getScriptTypeLabel } from '@/lib/reportNavigation';
import type { ScriptType } from '@/types/database';

interface SampleCommandHeaderProps {
  reportData: ReportData;
  currentPath: string;
  activeLens: StakeholderLens;
  currentScore: number;
  basePath: string; // e.g., '/sample-report', '/sample-comic-report'
  sampleTitle: string;
  sampleBannerColor?: string; // e.g., 'primary', 'chart-4', 'chart-5'
  viewScriptPath: string;
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
  stage_play: Film,
  audio_drama: FileText,
  podcast_fiction: FileText,
  game_narrative: FileVideo,
};

// Script type badge colors
const SCRIPT_TYPE_COLORS: Record<ScriptType, string> = {
  feature: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
  pilot: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  episode: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  short: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  documentary: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  comic: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  web_series: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  micro_drama: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  stage_play: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  audio_drama: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  podcast_fiction: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
  game_narrative: 'bg-chart-1/15 text-chart-1 border-chart-1/30',
};

const BANNER_COLORS: Record<string, {bg: string;border: string;text: string;icon: string;}> = {
  primary: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: 'text-primary' },
  'chart-4': { bg: 'bg-chart-4/10', border: 'border-chart-4/20', text: 'text-chart-4', icon: 'text-chart-4' },
  'chart-5': { bg: 'bg-chart-5/10', border: 'border-chart-5/20', text: 'text-chart-5', icon: 'text-chart-5' }
};

export function SampleCommandHeader({
  reportData,
  currentPath,
  activeLens,
  currentScore,
  basePath,
  sampleTitle,
  sampleBannerColor = 'primary',
  viewScriptPath
}: SampleCommandHeaderProps) {
  const navigate = useNavigate();

  // Get dynamic navigation based on script type - use USAF consolidated navigation
  const scriptType = reportData.scriptMetadata?.scriptType || 'feature';
  const navGroups = getUSAFNavGroups(scriptType, reportData.categoryScores);

  // Get script type display info
  const ScriptTypeIcon = SCRIPT_TYPE_ICONS[scriptType];
  const scriptTypeLabel = getScriptTypeLabel(scriptType);
  const scriptTypeColor = SCRIPT_TYPE_COLORS[scriptType];
  const bannerColors = BANNER_COLORS[sampleBannerColor] || BANNER_COLORS.primary;

  // Find current group and item
  const findCurrentNav = () => {
    for (const group of navGroups) {
      const item = group.items.find((item) => item.path === currentPath);
      if (item) return { group, item };
    }
    return { group: navGroups[0], item: navGroups[0]?.items[0] };
  };

  const { group: currentGroup, item: currentItem } = findCurrentNav();

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <>
      {/* Sample Banner */}
      <div className={cn("sticky top-0 z-50 border-b backdrop-blur-sm", bannerColors.bg, bannerColors.border)}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className={cn("h-4 w-4", bannerColors.icon)} />
            <span className="text-sm font-medium">{sampleTitle}</span>
            <Badge variant="secondary" className="text-xs">Demo</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(viewScriptPath)}>

              <FileText className="h-4 w-4 mr-2" />
              View Script
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/auth?mode=signup')}>

              Analyze Your Script
            </Button>
          </div>
        </div>
      </div>

      {/* Command Header */}
      <header className="sticky top-10 z-40 bg-card border-b border-border">
        {/* Top row: Back, title, script type, lens, actions */}
        <div className="h-14 flex items-center justify-between px-4 lg:px-6 gap-4">
          {/* Left: Back + Title + Script Type Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="shrink-0">

              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="font-semibold text-lg truncate">
                {reportData.scriptMetadata?.title || 'Sample Report'}
              </h1>
              
              {/* Script Type Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "hidden sm:inline-flex items-center gap-1.5 shrink-0 border",
                  scriptTypeColor
                )}>

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
            <Badge variant="outline" className="hidden lg:inline-flex text-xs">
              {LENS_CONFIG[activeLens].label}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}>

              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom row: Grouped tabs */}
        




























      </header>
    </>);

}