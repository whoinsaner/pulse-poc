import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { SAMPLE_WEB_SERIES_REPORT, SAMPLE_WEB_SERIES_REPORT_DATA } from '@/data/sampleWebSeriesReport';
import { StakeholderLens, LENS_CONFIG, Report, ReportData } from '@/types/database';
import { LensSelector } from '@/components/LensToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Brain, 
  Lightbulb, 
  Film, 
  Users, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileText,
  Building,
  User,
  UserX,
  MessageSquare,
  Heart,
  Eye,
  TrendingUp,
  Target,
  ListTodo,
  Layers,
  Play,
  Zap,
  RotateCcw,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createContext, useContext } from 'react';

interface ReportContextValue {
  report: Report;
  reportData: ReportData;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  isWebSeries: boolean;
  episodeLengthClass: string;
}

export const SampleWebSeriesReportContext = createContext<ReportContextValue | null>(null);

export function useSampleWebSeriesReport() {
  const context = useContext(SampleWebSeriesReportContext);
  if (!context) {
    throw new Error('useSampleWebSeriesReport must be used within SampleWebSeriesReportLayout');
  }
  return context;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const getNavGroups = (): NavGroup[] => [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'snapshot', label: 'Project Snapshot', icon: LayoutDashboard, path: '' },
    ],
  },
  {
    label: 'WEB SERIES',
    items: [
      { id: 'web-series', label: 'Web Series Analysis', icon: Play, path: '/web-series' },
      { id: 'retention', label: 'Retention Analysis', icon: RotateCcw, path: '/retention' },
      { id: 'hooks', label: 'Hooks Analysis', icon: Zap, path: '/hooks' },
    ],
  },
  {
    label: 'STORY ANALYSIS',
    items: [
      { id: 'concept', label: 'Concept & Hook', icon: Lightbulb, path: '/concept' },
      { id: 'plot', label: 'Plot Analysis', icon: TrendingUp, path: '/plot' },
      { id: 'structure', label: 'Structural Engineering', icon: Building, path: '/structure' },
    ],
  },
  {
    label: 'CHARACTERS',
    items: [
      { id: 'protagonist', label: 'Protagonist', icon: User, path: '/protagonist' },
      { id: 'antagonist', label: 'Antagonist', icon: UserX, path: '/antagonist' },
      { id: 'supporting', label: 'Supporting Cast', icon: Users, path: '/supporting' },
      { id: 'psychology', label: 'Character Psychology', icon: Brain, path: '/psychology' },
    ],
  },
  {
    label: 'CRAFT ELEMENTS',
    items: [
      { id: 'dialogue', label: 'Dialogue & Subtext', icon: MessageSquare, path: '/dialogue' },
      { id: 'theme', label: 'Theme & Moral Core', icon: Heart, path: '/theme' },
      { id: 'visual', label: 'Visual Storytelling', icon: Eye, path: '/visual' },
      { id: 'emotional', label: 'Emotional Resonance', icon: Sparkles, path: '/emotional' },
    ],
  },
  {
    label: 'PRODUCTION & MARKET',
    items: [
      { id: 'market', label: 'Marketability', icon: TrendingUp, path: '/market' },
      { id: 'production', label: 'Production', icon: Film, path: '/production' },
      { id: 'audience', label: 'Audience Strategy', icon: Target, path: '/audience' },
    ],
  },
  {
    label: 'ACTION ITEMS',
    items: [
      { id: 'rewrite', label: 'Rewrite Priorities', icon: ListTodo, path: '/rewrite' },
      { id: 'scenes', label: 'Scene Economy', icon: Layers, path: '/scenes' },
    ],
  },
  {
    label: 'REFERENCE',
    items: [
      { id: 'scorecard', label: 'Complete Scorecard', icon: BarChart3, path: '/scorecard' },
      { id: 'script', label: 'View Script', icon: FileText, path: '/script' },
    ],
  },
];

export default function SampleWebSeriesReportLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [activeLens, setActiveLens] = useState<StakeholderLens>('ott_platform');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const reportData = SAMPLE_WEB_SERIES_REPORT_DATA;
  const report = SAMPLE_WEB_SERIES_REPORT;
  const navGroups = getNavGroups();

  const getCurrentScore = () => {
    return reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentPath = location.pathname.replace('/sample-web-series-report', '') || '';
  
  const findCurrentNav = () => {
    for (const group of navGroups) {
      const item = group.items.find(item => item.path === currentPath);
      if (item) return item;
    }
    return navGroups[0].items[0];
  };
  const currentNav = findCurrentNav();

  const episodeLengthClass = reportData.scriptMetadata?.episodeLengthClass || 'mid_form_web';
  const episodeLengthLabel = {
    short_form_web: 'Short-Form (<10 min)',
    mid_form_web: 'Mid-Form (10-30 min)',
    long_form_web: 'Long-Form (45-70+ min)',
  }[episodeLengthClass] || 'Mid-Form';

  const contextValue: ReportContextValue = {
    report: report as Report,
    reportData: reportData as ReportData,
    activeLens,
    setActiveLens,
    currentScore: getCurrentScore(),
    isWebSeries: true,
    episodeLengthClass,
  };

  return (
    <SampleWebSeriesReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background flex">
        {/* Sample Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-chart-4/10 border-b border-chart-4/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-chart-4" />
              <span className="text-sm font-medium">
                Sample Web Series: "The Algorithm"
              </span>
              <Badge variant="secondary" className="text-xs bg-chart-4/20 text-chart-4 border-chart-4/30">
                {episodeLengthLabel}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/sample-script')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Script
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/auth?mode=signup')}
              >
                Analyze Your Web Series
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed left-0 top-10 h-[calc(100vh-2.5rem)] z-40 transition-all duration-300 border-r border-border bg-card/95 backdrop-blur-xl flex flex-col",
          sidebarCollapsed ? "w-16" : "w-72"
        )}>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
            {!sidebarCollapsed && (
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={sidebarCollapsed ? "mx-auto" : ""}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Score Display */}
          <div className={cn(
            "p-4 border-b border-border shrink-0",
            sidebarCollapsed ? "text-center" : ""
          )}>
            <div className={cn(
              "rounded-xl p-4",
              "bg-gradient-to-br from-chart-4/10 via-chart-4/5 to-transparent"
            )}>
              <p className={cn(
                "font-bold text-chart-4",
                sidebarCollapsed ? "text-2xl" : "text-4xl"
              )}>
                {getCurrentScore().toFixed(1)}
              </p>
              {!sidebarCollapsed && (
                <p className="text-xs text-muted-foreground mt-1">
                  {LENS_CONFIG[activeLens].label} Score
                </p>
              )}
            </div>
          </div>

          {/* Navigation Items - Scrollable */}
          <ScrollArea className="flex-1">
            <nav className="p-2 space-y-4">
              {navGroups.map((group) => (
                <div key={group.label}>
                  {!sidebarCollapsed && (
                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = item.path === currentPath;
                      const Icon = item.icon;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(`/sample-web-series-report${item.path}`)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
                            isActive 
                              ? "bg-chart-4 text-primary-foreground" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            sidebarCollapsed && "justify-center px-2"
                          )}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary-foreground")} />
                          {!sidebarCollapsed && (
                            <span className="text-sm font-medium truncate">{item.label}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Lens Selector at bottom */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-border bg-card/95 shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Viewing as</p>
              <LensSelector activeLens={activeLens} onLensChange={setActiveLens} compact />
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 pt-10",
          sidebarCollapsed ? "ml-16" : "ml-72"
        )}>
          {/* Top Header */}
          <header className="sticky top-10 z-30 h-16 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-lg truncate max-w-md">
                  {reportData.scriptMetadata?.title || report.title}
                </h1>
                <Badge variant="outline" className="text-xs bg-chart-4/10 text-chart-4 border-chart-4/30">
                  Web Series
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentNav.label}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {sidebarCollapsed && (
                <LensSelector activeLens={activeLens} onLensChange={setActiveLens} compact />
              )}
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            <Outlet context={contextValue} />
          </div>
        </main>
      </div>
    </SampleWebSeriesReportContext.Provider>
  );
}
