import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Sparkles,
  Zap,
  BarChart3,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import type { AnalysisStatus, StakeholderLens, LENS_CONFIG } from '@/types/database';

interface AgentProgress {
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  startedAt?: string;
  completedAt?: string;
  model?: string;
}

interface AnalysisRun {
  id: string;
  status: AnalysisStatus;
  quality_mode: string | null;
  stakeholder_lens: StakeholderLens | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  agent_progress: Record<string, AgentProgress> | null;
  retry_count: number;
  max_retries: number;
  parent_run_id: string | null;
  report?: {
    id: string;
    overall_score: number | null;
  };
}

interface AnalysisRunHistoryProps {
  scriptId: string;
  scriptTitle: string;
}

export function AnalysisRunHistory({ scriptId, scriptTitle }: AnalysisRunHistoryProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    fetchRuns();
  }, [scriptId]);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analysis_runs')
        .select(`
          id,
          status,
          quality_mode,
          stakeholder_lens,
          created_at,
          started_at,
          completed_at,
          error_message,
          agent_progress,
          retry_count,
          max_retries,
          parent_run_id,
          reports (
            id,
            overall_score
          )
        `)
        .eq('script_id', scriptId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRuns = (data || []).map(run => ({
        ...run,
        agent_progress: run.agent_progress as unknown as Record<string, AgentProgress> | null,
        retry_count: (run as any).retry_count ?? 0,
        max_retries: (run as any).max_retries ?? 3,
        parent_run_id: (run as any).parent_run_id ?? null,
        report: Array.isArray(run.reports) && run.reports.length > 0 ? run.reports[0] : undefined,
      }));

      setRuns(formattedRuns as AnalysisRun[]);
    } catch (error) {
      console.error('Error fetching analysis runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryRun = async (failedRun: AnalysisRun) => {
    if (!user) return;
    setRetrying(failedRun.id);
    try {
      // Create a new run linked to the failed one
      const retryReasoningEffort = localStorage.getItem('pulse_reasoning_enabled') === 'true'
        ? (localStorage.getItem('pulse_reasoning_effort') as string || 'medium')
        : null;

      const { data: newRun, error: createError } = await supabase
        .from('analysis_runs')
        .insert({
          script_id: scriptId,
          initiated_by: user.id,
          status: 'pending' as const,
          stakeholder_lens: failedRun.stakeholder_lens,
          quality_mode: failedRun.quality_mode,
          retry_count: failedRun.retry_count + 1,
          max_retries: failedRun.max_retries,
          parent_run_id: failedRun.parent_run_id || failedRun.id,
          reasoning_effort: retryReasoningEffort,
        } as any)
        .select()
        .single();

      if (createError) throw createError;

      // Trigger analysis
      const reasoningEffort = localStorage.getItem('pulse_reasoning_enabled') === 'true'
        ? (localStorage.getItem('pulse_reasoning_effort') || 'medium')
        : null;
      console.log('[analyze-script][AnalysisRunHistory] Sending reasoningEffort:', reasoningEffort);

      const { error: invokeError } = await supabase.functions.invoke('analyze-script', {
        body: {
          scriptId,
          analysisRunId: newRun.id,
          mode: 'deep',
          qualityMode: failedRun.quality_mode || 'quality',
          forceAnalysis: false,
          resume: false,
          stakeholderLens: failedRun.stakeholder_lens || null,
          reasoningEffort,
        },
      });

      if (invokeError) throw invokeError;

      toast({ title: 'Retry queued', description: `Attempt ${failedRun.retry_count + 2} of ${failedRun.max_retries + 1} started.` });
      fetchRuns();
    } catch (err) {
      console.error('Retry failed:', err);
      toast({ title: 'Retry failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setRetrying(null);
    }
  };

  const getStatusIcon = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Processing</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getQualityModeIcon = (mode: string | null) => {
    switch (mode) {
      case 'quality':
        return <Sparkles className="h-3 w-3" />;
      case 'fast':
        return <Zap className="h-3 w-3" />;
      default:
        return <BarChart3 className="h-3 w-3" />;
    }
  };

  const getDuration = (run: AnalysisRun) => {
    if (run.started_at && run.completed_at) {
      const start = new Date(run.started_at).getTime();
      const end = new Date(run.completed_at).getTime();
      const seconds = Math.round((end - start) / 1000);
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.round(seconds / 60);
      return `${minutes}m`;
    }
    return null;
  };

  const getAgentStats = (run: AnalysisRun) => {
    if (!run.agent_progress) return null;
    
    let completed = 0, failed = 0, pending = 0, running = 0;
    const failedAgents: { name: string; error?: string }[] = [];
    
    for (const [agentName, progress] of Object.entries(run.agent_progress)) {
      if (agentName === '_meta') continue;
      
      switch (progress.status) {
        case 'completed': completed++; break;
        case 'failed': 
          failed++; 
          failedAgents.push({ name: agentName, error: progress.error });
          break;
        case 'running': running++; break;
        default: pending++; break;
      }
    }
    
    const total = completed + failed + pending + running;
    return { completed, failed, pending, running, total, failedAgents };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Analysis History
        </CardTitle>
        <CardDescription>
          {runs.length} analysis run{runs.length !== 1 ? 's' : ''} for "{scriptTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No analysis runs yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Run an analysis to see history here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-3">
              {runs.map((run, index) => {
                const agentStats = getAgentStats(run);
                
                return (
                  <div
                    key={run.id}
                    className={cn(
                      'p-4 rounded-lg border transition-colors',
                      index === 0 && run.status === 'completed'
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(run.status)}
                          {getStatusBadge(run.status)}
                          {run.quality_mode && (
                            <Badge variant="outline" className="text-xs gap-1">
                              {getQualityModeIcon(run.quality_mode)}
                              {run.quality_mode}
                            </Badge>
                          )}
                          {run.stakeholder_lens && (
                            <Badge variant="secondary" className="text-xs">
                              {run.stakeholder_lens.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                          </span>
                          {getDuration(run) && (
                            <span>Duration: {getDuration(run)}</span>
                          )}
                          {run.report?.overall_score && (
                            <span className="text-primary font-medium">
                              Score: {run.report.overall_score.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Agent stats */}
                        {agentStats && (
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                            {agentStats.completed > 0 && (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                ✓ {agentStats.completed} completed
                              </span>
                            )}
                            {agentStats.failed > 0 && (
                              <span className="text-destructive">
                                ✕ {agentStats.failed} failed
                              </span>
                            )}
                            {agentStats.running > 0 && (
                              <span className="text-blue-500">
                                ● {agentStats.running} running
                              </span>
                            )}
                          </div>
                        )}

                        {/* Failed agents details */}
                        {agentStats && agentStats.failedAgents.length > 0 && (
                          <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                            <p className="text-xs font-medium text-destructive mb-1">Failed Agents:</p>
                            <ul className="text-xs text-destructive/80 space-y-0.5">
                              {agentStats.failedAgents.slice(0, 4).map((agent) => (
                                <li key={agent.name} className="truncate">
                                  • {agent.name.replace('Agent', '')}: {agent.error?.slice(0, 50) || 'Unknown error'}
                                  {agent.error && agent.error.length > 50 && '...'}
                                </li>
                              ))}
                              {agentStats.failedAgents.length > 4 && (
                                <li className="text-muted-foreground">
                                  + {agentStats.failedAgents.length - 4} more...
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {run.error_message && !agentStats?.failedAgents.length && (
                          <p className="text-xs text-destructive mt-2 truncate">
                            Error: {run.error_message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        {run.status === 'completed' && run.report && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/report/${run.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                        {run.status === 'failed' && run.retry_count < run.max_retries && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={retrying === run.id}
                            onClick={() => retryRun(run)}
                          >
                            {retrying === run.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4 mr-1" />
                            )}
                            Retry
                          </Button>
                        )}
                        {run.retry_count > 0 && (
                          <Badge variant="outline" className="text-[10px] justify-center">
                            Attempt {run.retry_count + 1}/{run.max_retries + 1}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}