import { useNavigate } from 'react-router-dom';
import { Report, ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Share2, 
  Download,
  LayoutDashboard, 
  Lightbulb, 
  TrendingUp,
  Building,
  User,
  UserX,
  Users,
  Brain,
  MessageSquare,
  Heart,
  Eye,
  Sparkles,
  Target,
  Film,
  ListTodo,
  Layers,
  BarChart3,
  FileText,
  Palette,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

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

const getNavGroups = (isComic: boolean): NavGroup[] => {
  const groups: NavGroup[] = [
    {
      id: 'overview',
      label: 'Overview',
      items: [
        { id: 'snapshot', label: 'Snapshot', icon: LayoutDashboard, path: '' },
      ],
    },
    {
      id: 'story',
      label: 'Story',
      items: [
        { id: 'concept', label: 'Concept', icon: Lightbulb, path: '/concept' },
        { id: 'plot', label: 'Plot', icon: TrendingUp, path: '/plot' },
        { id: 'structure', label: 'Structure', icon: Building, path: '/structure' },
      ],
    },
    {
      id: 'characters',
      label: 'Characters',
      items: [
        { id: 'protagonist', label: 'Protagonist', icon: User, path: '/protagonist' },
        { id: 'antagonist', label: 'Antagonist', icon: UserX, path: '/antagonist' },
        { id: 'supporting', label: 'Cast', icon: Users, path: '/supporting' },
        { id: 'psychology', label: 'Psychology', icon: Brain, path: '/psychology' },
      ],
    },
    {
      id: 'craft',
      label: 'Craft',
      items: [
        { id: 'dialogue', label: 'Dialogue', icon: MessageSquare, path: '/dialogue' },
        { id: 'theme', label: 'Theme', icon: Heart, path: '/theme' },
        { id: 'visual', label: 'Visual', icon: Eye, path: '/visual' },
        { id: 'emotional', label: 'Emotion', icon: Sparkles, path: '/emotional' },
        ...(isComic ? [{ id: 'comic', label: 'Comic', icon: Palette, path: '/comic' }] : []),
      ],
    },
    {
      id: 'market',
      label: 'Market',
      items: [
        { id: 'market', label: 'Marketability', icon: TrendingUp, path: '/market' },
        { id: 'production', label: 'Production', icon: Film, path: '/production' },
        { id: 'audience', label: 'Audience', icon: Target, path: '/audience' },
      ],
    },
    {
      id: 'actions',
      label: 'Actions',
      items: [
        { id: 'rewrite', label: 'Rewrites', icon: ListTodo, path: '/rewrite' },
        { id: 'scenes', label: 'Scenes', icon: Layers, path: '/scenes' },
      ],
    },
    {
      id: 'reference',
      label: 'Reference',
      items: [
        { id: 'scorecard', label: 'Scorecard', icon: BarChart3, path: '/scorecard' },
        { id: 'script', label: 'Script', icon: FileText, path: '/script' },
      ],
    },
  ];

  return groups;
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
  const navGroups = getNavGroups(isComic);
  
  // Find current group and item
  const findCurrentNav = () => {
    for (const group of navGroups) {
      const item = group.items.find(item => item.path === currentPath);
      if (item) return { group, item };
    }
    return { group: navGroups[0], item: navGroups[0].items[0] };
  };
  
  const { group: currentGroup, item: currentItem } = findCurrentNav();

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      {/* Top row: Back, title, lens, actions */}
      <div className="h-14 flex items-center justify-between px-4 lg:px-6 gap-4">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/scripts')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="min-w-0">
            <h1 className="font-semibold text-lg truncate">
              {reportData.scriptMetadata?.title || report.title}
            </h1>
          </div>
        </div>

        {/* Center: Score badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-xs text-muted-foreground">Score</span>
          <span className="font-mono font-bold text-sm text-primary">{currentScore.toFixed(1)}</span>
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

      {/* Bottom row: Tab navigation */}
      <div className="h-12 flex items-center px-2 lg:px-4 overflow-x-auto scrollbar-hide">
        <nav className="flex items-center gap-1">
          {navGroups.map((group) => (
            <div key={group.id} className="flex items-center">
              {/* Group label */}
              <span className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:block">
                {group.label}
              </span>
              
              {/* Group items */}
              <div className="flex items-center gap-0.5">
                {group.items.map((item) => {
                  const isActive = item.path === currentPath;
                  const Icon = item.icon;
                  
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/report/${runId}${item.path}`)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              
              {/* Separator */}
              {group.id !== 'reference' && (
                <div className="w-px h-6 bg-border mx-2 hidden lg:block" />
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}