import { useNavigate } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Share2,
  FileText,
  Tv,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Users,
  Palette,
  Monitor,
  TrendingUp,
  ListTodo,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDecisionSignal } from '@/lib/scoreUtils';

interface WebSeriesCommandHeaderProps {
  reportData: ReportData;
  currentPath: string;
  activeLens: StakeholderLens;
  currentScore: number;
  basePath: string;
  sampleTitle: string;
  sampleBannerColor?: string;
  viewScriptPath: string;
}

// New consolidated navigation structure
const NAV_ITEMS = [
  { id: 'cover', label: 'Cover', icon: LayoutDashboard, path: '' },
  { id: 'story', label: 'Story', icon: BookOpen, path: '/story' },
  { id: 'characters', label: 'Characters', icon: Users, path: '/characters' },
  { id: 'craft', label: 'Craft', icon: Palette, path: '/craft' },
  { id: 'format', label: 'Format', icon: Monitor, path: '/format' },
  { id: 'commercial', label: 'Commercial', icon: TrendingUp, path: '/commercial' },
  { id: 'development', label: 'Development', icon: ListTodo, path: '/development' },
];

// Reference section (collapsible)
const REFERENCE_ITEMS = [
  { id: 'scorecard', label: 'Scorecard', icon: BarChart3, path: '/scorecard' },
  { id: 'script', label: 'Script', icon: FileText, path: '/script' },
];

const BANNER_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  primary: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', icon: 'text-primary' },
  'chart-4': { bg: 'bg-chart-4/10', border: 'border-chart-4/20', text: 'text-chart-4', icon: 'text-chart-4' },
  'chart-5': { bg: 'bg-chart-5/10', border: 'border-chart-5/20', text: 'text-chart-5', icon: 'text-chart-5' },
};

export function WebSeriesCommandHeader({
  reportData,
  currentPath,
  activeLens,
  currentScore,
  basePath,
  sampleTitle,
  sampleBannerColor = 'chart-4',
  viewScriptPath,
}: WebSeriesCommandHeaderProps) {
  const navigate = useNavigate();
  const decision = getDecisionSignal(currentScore);
  const bannerColors = BANNER_COLORS[sampleBannerColor] || BANNER_COLORS['chart-4'];

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
  };

  // Check if current path is a reference page
  const isReferencePage = REFERENCE_ITEMS.some(item => item.path === currentPath);
  const allNavItems = [...NAV_ITEMS, ...REFERENCE_ITEMS];

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
              onClick={() => navigate(viewScriptPath)}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Script
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/auth?mode=signup')}
            >
              Analyze Your Script
            </Button>
          </div>
        </div>
      </div>

      {/* Command Header */}
      <header className="sticky top-10 z-40 bg-card border-b border-border">
        {/* Top row: Back, title, score, actions */}
        <div className="h-14 flex items-center justify-between px-4 lg:px-6 gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="font-semibold text-lg truncate">
                {reportData.scriptMetadata?.title || 'Sample Report'}
              </h1>
              
              {/* Script Type Badge */}
              <Badge 
                variant="outline" 
                className="hidden sm:inline-flex items-center gap-1.5 shrink-0 border bg-chart-4/15 text-chart-4 border-chart-4/30"
              >
                <Tv className="h-3 w-3" />
                <span className="text-xs font-medium">Web Series</span>
              </Badge>
            </div>
          </div>

          {/* Center: Decision Signal + Score */}
          <div className="hidden md:flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn("font-bold", decision.bgColor, decision.borderColor, decision.color)}
            >
              {decision.label}
            </Badge>
            <span className="font-mono font-bold text-lg">{Math.round(currentScore)}</span>
          </div>

          {/* Right: Lens + Actions */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden lg:inline-flex text-xs">
              {LENS_CONFIG[activeLens].label}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom row: Simplified tabs */}
        <div className="h-11 border-t border-border/50 flex items-center px-4 gap-1 overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === currentPath;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(`${basePath}${item.path}`)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {/* Divider */}
          <div className="h-6 w-px bg-border mx-2" />
          
          {/* Reference items */}
          {REFERENCE_ITEMS.map((item) => {
            const isActive = item.path === currentPath;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(`${basePath}${item.path}`)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                <Icon className="h-3 w-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
}
