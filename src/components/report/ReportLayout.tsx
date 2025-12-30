import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Report, StakeholderLens, ReportData, LENS_CONFIG } from '@/types/database';
import { LensSelector } from '@/components/LensToggle';
import { ExportDialog } from '@/components/report/ExportDialog';
import { StakeholderBadge } from '@/components/StakeholderBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Loader2,
  Building,
  User,
  UserX,
  MessageSquare,
  Heart,
  Eye,
  Sparkles,
  TrendingUp,
  Target,
  ListTodo,
  Layers,
  FileText,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isNavSectionRelevant } from '@/lib/stakeholderConfig';

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
  stakeholderLens: StakeholderLens | null;
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

const getNavGroups = (isComic: boolean): NavGroup[] => {
  const baseGroups: NavGroup[] = [
    {
      label: 'OVERVIEW',
      items: [
        { id: 'snapshot', label: 'Project Snapshot', icon: LayoutDashboard, path: '' },
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

  if (isComic) {
    // Add comic-specific nav item to Craft Elements
    const craftIndex = baseGroups.findIndex(g => g.label === 'CRAFT ELEMENTS');
    if (craftIndex !== -1) {
      baseGroups[craftIndex].items.push({
        id: 'comic',
        label: 'Comic Analysis',
        icon: Palette,
        path: '/comic',
      });
    }
  }

  return baseGroups;
};

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
  const [stakeholderLens, setStakeholderLens] = useState<StakeholderLens | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchReportAndAnalysis() {
      if (!runId || !profile?.current_organization_id) return;

      setLoading(true);
      
      const [reportResult, analysisResult] = await Promise.all([
        supabase
          .from('reports')
          .select('*')
          .eq('analysis_run_id', runId)
          .eq('organization_id', profile.current_organization_id)
          .single(),
        supabase
          .from('analysis_runs')
          .select('agent_progress, status, stakeholder_lens')
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
      
      // Set stakeholder lens from analysis run
      if (analysisResult.data?.stakeholder_lens) {
        setStakeholderLens(analysisResult.data.stakeholder_lens as StakeholderLens);
        // Also set active lens to match for consistent scoring
        setActiveLens(analysisResult.data.stakeholder_lens as StakeholderLens);
      }
      
      setLoading(false);
    }

    fetchReportAndAnalysis();
  }, [runId, profile?.current_organization_id]);

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
  const allNavGroups = getNavGroups(isComic);
  
  // Filter navigation groups based on stakeholder lens
  const navGroups = allNavGroups.map(group => ({
    ...group,
    items: group.items.filter(item => isNavSectionRelevant(item.id, stakeholderLens))
  })).filter(group => group.items.length > 0);

  const getCurrentScore = () => {
    if (!reportData) return report?.overall_score || 0;
    return reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  };

  const currentPath = location.pathname.replace(`/report/${runId}`, '') || '';
  
  // Find current nav item across all groups
  const findCurrentNav = () => {
    for (const group of navGroups) {
      const item = group.items.find(item => item.path === currentPath);
      if (item) return item;
    }
    return navGroups[0].items[0];
  };
  const currentNav = findCurrentNav();

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
    stakeholderLens,
  };

  return (
    <ReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed left-0 top-0 h-screen z-40 transition-all duration-300 border-r border-border bg-card/95 backdrop-blur-xl flex flex-col",
          sidebarCollapsed ? "w-16" : "w-72"
        )}>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
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
            "p-4 border-b border-border shrink-0",
            sidebarCollapsed ? "text-center" : ""
          )}>
            {/* Stakeholder Lens Badge */}
            {stakeholderLens && !sidebarCollapsed && (
              <div className="mb-3">
                <StakeholderBadge lens={stakeholderLens} size="sm" showLabel />
              </div>
            )}
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
                  {stakeholderLens ? LENS_CONFIG[stakeholderLens].label : LENS_CONFIG[activeLens].label} Score
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
                          onClick={() => navigate(`/report/${runId}${item.path}`)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
                            isActive 
                              ? "bg-primary text-primary-foreground" 
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

          {/* Lens Selector at bottom - only show if comprehensive analysis */}
          {!sidebarCollapsed && !stakeholderLens && (
            <div className="p-4 border-t border-border bg-card/95 shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Viewing as</p>
              <LensSelector activeLens={activeLens} onLensChange={setActiveLens} compact />
            </div>
          )}
          
          {/* Show stakeholder info for stakeholder-specific reports */}
          {!sidebarCollapsed && stakeholderLens && (
            <div className="p-4 border-t border-border bg-card/95 shrink-0">
              <p className="text-xs text-muted-foreground mb-2">Stakeholder Report</p>
              <p className="text-sm font-medium">{LENS_CONFIG[stakeholderLens].label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {navGroups.reduce((sum, g) => sum + g.items.length, 0)} sections analyzed
              </p>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-72"
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
                {/* Show stakeholder badge in header */}
                {stakeholderLens && (
                  <StakeholderBadge lens={stakeholderLens} size="sm" showLabel />
                )}
                {sidebarCollapsed && !stakeholderLens && (
                  <LensSelector activeLens={activeLens} onLensChange={setActiveLens} compact />
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const shareUrl = window.location.href;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      toast.success('Link copied to clipboard', {
                        description: 'Share this link to give others access to this report.'
                      });
                    }).catch(() => {
                      toast.error('Failed to copy link');
                    });
                  }}
                >
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
      <aside className="w-72 border-r border-border bg-card p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <Skeleton key={i} className="h-8 w-full" />
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
