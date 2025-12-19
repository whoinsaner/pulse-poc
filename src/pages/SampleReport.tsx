import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { SAMPLE_REPORT, SAMPLE_REPORT_DATA } from '@/data/sampleReport';
import { StakeholderLens, LENS_CONFIG } from '@/types/database';
import { LensSelector } from '@/components/LensToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createContext, useContext } from 'react';

interface SampleReportContextValue {
  report: typeof SAMPLE_REPORT;
  reportData: typeof SAMPLE_REPORT_DATA;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  isComic: boolean;
  isSample: true;
}

export const SampleReportContext = createContext<SampleReportContextValue | null>(null);

export function useSampleReport() {
  const context = useContext(SampleReportContext);
  if (!context) {
    throw new Error('useSampleReport must be used within SampleReportLayout');
  }
  return context;
}

export default function SampleReportLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLens, setActiveLens] = useState<StakeholderLens>('studio_executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const reportData = SAMPLE_REPORT_DATA;
  const report = SAMPLE_REPORT;

  const getCurrentScore = () => {
    return reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '' },
    { id: 'analysis', label: 'AI Analysis', icon: Brain, path: '/analysis' },
    { id: 'insights', label: 'Insights', icon: Lightbulb, path: '/insights' },
    { id: 'narrative', label: 'Narrative', icon: Film, path: '/narrative' },
    { id: 'characters', label: 'Characters', icon: Users, path: '/characters' },
    { id: 'platform', label: 'Platform & Risk', icon: BarChart3, path: '/platform' },
  ];

  const currentPath = location.pathname.replace('/sample-report', '') || '';
  const currentNav = navItems.find(item => item.path === currentPath) || navItems[0];

  const contextValue: SampleReportContextValue = {
    report,
    reportData,
    activeLens,
    setActiveLens,
    currentScore: getCurrentScore(),
    isComic: false,
    isSample: true,
  };

  return (
    <SampleReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background flex">
        {/* Sample Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Sample Report: "The Last Signal"
              </span>
              <Badge variant="secondary" className="text-xs">Demo</Badge>
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
                Analyze Your Script
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed left-0 top-10 h-[calc(100vh-2.5rem)] z-40 transition-all duration-300 border-r border-border bg-card/95 backdrop-blur-xl",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {!sidebarCollapsed && (
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
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
            "p-4 border-b border-border",
            sidebarCollapsed ? "text-center" : ""
          )}>
            <div className={cn(
              "rounded-xl p-4",
              "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent"
            )}>
              <p className={cn(
                "font-bold gradient-text",
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

          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            {navItems.map((item) => {
              const isActive = item.path === currentPath;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/sample-report${item.path}`)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary-foreground")} />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Lens Selector at bottom */}
          {!sidebarCollapsed && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card/95">
              <p className="text-xs text-muted-foreground mb-2">Viewing as</p>
              <LensSelector activeLens={activeLens} onLensChange={setActiveLens} compact />
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 pt-10",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          {/* Top Header */}
          <header className="sticky top-10 z-30 h-16 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-6">
            <div>
              <h1 className="font-semibold text-lg truncate max-w-md">
                {reportData.scriptMetadata?.title || report.title}
              </h1>
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
    </SampleReportContext.Provider>
  );
}
