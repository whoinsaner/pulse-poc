import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Report, StakeholderLens, ReportData, LENS_CONFIG } from '@/types/database';
import { CommandHeader } from '@/components/report/CommandHeader';
import { ReportSidebar } from '@/components/report/ReportSidebar';
import { ExportDialog } from '@/components/report/ExportDialog';
import { ShareDialog } from '@/components/report/ShareDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  AlertTriangle,
  RefreshCw,
  Loader2,
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
  stakeholderLens: StakeholderLens | null;
  scriptType: import('@/types/database').ScriptType;
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
  const [searchParams] = useSearchParams();
  const shareToken = searchParams.get('share');
  const { user, profile, isLoading: authLoading } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLens, setActiveLens] = useState<StakeholderLens>('studio_executive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentProgress, setAgentProgress] = useState<AgentProgress | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [stakeholderLens, setStakeholderLens] = useState<StakeholderLens | null>(null);
  const [exportTriggerRef, setExportTriggerRef] = useState<HTMLButtonElement | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [isSharedAccess, setIsSharedAccess] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Scroll main content to top on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchReportAndAnalysis() {
      if (!runId) return;
      // Allow access if user is in org OR has a share token
      const hasOrgAccess = !!profile?.current_organization_id;
      const hasShareToken = !!shareToken;
      
      if (!hasOrgAccess && !hasShareToken) return;

      setLoading(true);
      
      // Build report query — with share token, skip org filter (RLS handles access via report_shares policy)
      let reportQuery = supabase
        .from('reports')
        .select('*')
        .eq('analysis_run_id', runId);
      
      if (!hasShareToken && hasOrgAccess) {
        reportQuery = reportQuery.eq('organization_id', profile!.current_organization_id!);
      }

      const [reportResult, analysisResult] = await Promise.all([
        reportQuery.single(),
        supabase
          .from('analysis_runs')
          .select('agent_progress, status, stakeholder_lens')
          .eq('id', runId)
          .single()
      ]);

      if (reportResult.error) {
        console.error('Error fetching report:', reportResult.error);
        
        // If share token access failed, the token may be expired/revoked
        if (hasShareToken && !hasOrgAccess) {
          toast.error('Share link is invalid, expired, or has been revoked');
        }
        setLoading(false);
        return;
      }

      setReport(reportResult.data as unknown as Report);
      setIsSharedAccess(hasShareToken && !hasOrgAccess);
      
      if (analysisResult.data?.agent_progress) {
        setAgentProgress(analysisResult.data.agent_progress as AgentProgress);
      }
      
      if (analysisResult.data?.stakeholder_lens) {
        setStakeholderLens(analysisResult.data.stakeholder_lens as StakeholderLens);
        setActiveLens(analysisResult.data.stakeholder_lens as StakeholderLens);
      }
      
      setLoading(false);
    }

    fetchReportAndAnalysis();
  }, [runId, profile?.current_organization_id, shareToken]);

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

  const getCurrentScore = () => {
    if (!reportData) return report?.overall_score || 0;
    return reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  };

  const currentPath = location.pathname.replace(`/report/${runId}`, '') || '';

  const handleShare = () => {
    setShareDialogOpen(true);
  };

  if (authLoading || loading) {
    return <ReportSkeleton />;
  }

  if (!report || !reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-4">The report you are looking for does not exist.</p>
          <Button onClick={() => navigate('/scripts')}>Back to Scripts</Button>
        </div>
      </div>
    );
  }

  const scriptType = reportData?.scriptMetadata?.scriptType || 'feature';

  const contextValue: ReportContextValue = {
    report,
    reportData,
    activeLens,
    setActiveLens,
    currentScore: getCurrentScore(),
    isComic,
    stakeholderLens,
    scriptType,
  };

  return (
    <ReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Command Header */}
        <CommandHeader
          report={report}
          reportData={reportData}
          currentPath={currentPath}
          activeLens={activeLens}
          stakeholderLens={stakeholderLens}
          currentScore={getCurrentScore()}
          runId={runId!}
          isComic={isComic}
          onShare={handleShare}
          onLensChange={setActiveLens}
        />

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

        {/* Main Content with Sidebar */}
        <div className="flex-1 flex">
          {/* Left Sidebar (nav + stats + lens) */}
          <ReportSidebar
            reportData={reportData}
            currentPath={currentPath}
            runId={runId!}
            reportId={report.id}
            reportTitle={report.title}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(prev => !prev)}
            activeLens={activeLens}
            setActiveLens={setActiveLens}
            currentScore={getCurrentScore()}
            stakeholderLens={stakeholderLens}
          />

          {/* Scrollable Content Area */}
          <main ref={mainRef} className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8 max-w-6xl mx-auto">
              <Outlet context={contextValue} />
            </div>
          </main>
        </div>

        {/* Export Dialog - positioned in bottom-right for accessibility */}
        <div className="fixed bottom-4 right-4 z-50 lg:hidden">
          <ExportDialog reportId={report.id} reportTitle={report.title} reportData={reportData} activeLens={activeLens} scriptType={scriptType} />
        </div>

        {/* Share Dialog */}
        {!isSharedAccess && (
          <ShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            reportId={report.id}
            reportTitle={report.title}
            runId={runId!}
          />
        )}
      </div>
    </ReportContext.Provider>
  );
}

function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header skeleton */}
      <div className="h-14 border-b border-border px-6 flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-48" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      {/* Tab bar skeleton */}
      <div className="h-12 border-b border-border px-4 flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="flex-1 flex">
        <main className="flex-1 p-6">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
        
        {/* Rail skeleton */}
        <aside className="w-72 border-l border-border p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </aside>
      </div>
    </div>
  );
}