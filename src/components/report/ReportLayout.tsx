import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Report, StakeholderLens, ReportData, LENS_CONFIG } from '@/types/database';
import { LensSelector } from '@/components/LensToggle';
import { ExportDialog } from '@/components/report/ExportDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Share2, 
  LayoutDashboard, 
  Brain, 
  Lightbulb, 
  Film, 
  Users, 
  BarChart3,
  Palette,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentProgress {
  [agentName: string]: {
    status: 'pending' | 'running' | 'completed' | 'failed';
    error?: string;
    completedAt?: string;
    retryCount?: number;
  };
}

interface ReportContextValue {
  report: Report | null;
  reportData: ReportData | null;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  isComic: boolean;
}

import { createContext, useContext } from 'react';

export const ReportContext = createContext<ReportContextValue | null>(null);

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within ReportLayout');
  }
  return context;
}

export default function ReportLayout() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLens, setActiveLens] = useState<StakeholderLens>('studio_executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentProgress, setAgentProgress] = useState<AgentProgress | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchReportAndAnalysis() {
      if (!runId || !profile?.current_organization_id) return;

      setLoading(true);
      
      // Fetch report and analysis run in parallel
      const [reportResult, analysisResult] = await Promise.all([
        supabase
          .from('reports')
          .select('*')
          .eq('analysis_run_id', runId)
          .eq('organization_id', profile.current_organization_id)
          .single(),
        supabase
          .from('analysis_runs')
          .select('agent_progress, status')
          .eq('id', runId)
          .single()
      ]);

      if (reportResult.error) {
        console.error('Error fetching report:', reportResult.error);
        setLoading(false);
        return;
      }

      setReport(reportResult.data as unknown as Report);
      
      if (analysisResult.data?.agent_progress) {
        setAgentProgress(analysisResult.data.agent_progress as AgentProgress);
      }
      
      setLoading(false);
    }

    fetchReportAndAnalysis();
  }, [runId, profile?.current_organization_id]);

  // Calculate failed agents
  const failedAgents = agentProgress 
    ? Object.entries(agentProgress)
        .filter(([name, data]) => name !== '_meta' && data.status === 'failed')
        .map(([name]) => name)
    : [];

  const retryFailedAgents = async () => {
    if (!runId || !report) return;
    
    setIsRetrying(true);
    try {
      const response = await supabase.functions.invoke('analyze-script', {
        body: {
          runId,
          scriptId: report.script_id,
          resume: true,
          forceAnalysis: true
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Retry started', {
        description: `Retrying ${failedAgents.length} failed agent(s)...`
      });

      // Refresh page to show updated progress
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Retry error:', error);
      toast.error('Failed to retry agents', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const reportData = report?.full_report_data as ReportData | null;
  const isComic = reportData?.scriptMetadata?.scriptType === 'comic';

  const getCurrentScore = () => {
    if (!reportData) return report?.overall_score || 0;
    return reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  };

  const navItems = isComic ? [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '' },
    { id: 'analysis', label: 'AI Analysis', icon: Brain, path: '/analysis' },
    { id: 'insights', label: 'Insights', icon: Lightbulb, path: '/insights' },
    { id: 'narrative', label: 'Narrative', icon: Film, path: '/narrative' },
    { id: 'characters', label: 'Characters', icon: Users, path: '/characters' },
    { id: 'comic', label: 'Comic Analysis', icon: Palette, path: '/comic' },
  ] : [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '' },
    { id: 'analysis', label: 'AI Analysis', icon: Brain, path: '/analysis' },
    { id: 'insights', label: 'Insights', icon: Lightbulb, path: '/insights' },
    { id: 'narrative', label: 'Narrative', icon: Film, path: '/narrative' },
    { id: 'characters', label: 'Characters', icon: Users, path: '/characters' },
    { id: 'platform', label: 'Platform & Risk', icon: BarChart3, path: '/platform' },
  ];

  const currentPath = location.pathname.replace(`/report/${runId}`, '') || '';
  const currentNav = navItems.find(item => item.path === currentPath) || navItems[0];

  if (authLoading || loading) {
    return <ReportSkeleton />;
  }

  if (!report || !reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-4">The report you are looking for does not exist.</p>
          <Button onClick={() => navigate('/scripts')}>Back to Scripts</Button>
        </div>
      </div>
    );
  }

  const contextValue: ReportContextValue = {
    report,
    reportData,
    activeLens,
    setActiveLens,
    currentScore: getCurrentScore(),
    isComic,
  };

  return (
    <ReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed left-0 top-0 h-screen z-40 transition-all duration-300 border-r border-border bg-card/95 backdrop-blur-xl",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {!sidebarCollapsed && (
              <Button variant="ghost" size="icon" onClick={() => navigate('/scripts')}>
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
                  onClick={() => navigate(`/report/${runId}${item.path}`)}
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
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          {/* Top Header */}
          <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
            {/* Failed Agents Banner */}
            {failedAgents.length > 0 && (
              <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-medium">
                    {failedAgents.length} agent{failedAgents.length > 1 ? 's' : ''} failed:
                  </span>
                  <span className="text-muted-foreground">
                    {failedAgents.slice(0, 3).join(', ')}
                    {failedAgents.length > 3 && ` +${failedAgents.length - 3} more`}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={retryFailedAgents}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Retry Failed
                </Button>
              </div>
            )}
            
            <div className="h-16 flex items-center justify-between px-6">
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
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <ExportDialog reportId={report.id} reportTitle={report.title} />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            <Outlet context={contextValue} />
          </div>
        </main>
      </div>
    </ReportContext.Provider>
  );
}

function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border bg-card p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Skeleton className="h-16 w-full mb-6" />
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </main>
    </div>
  );
}
