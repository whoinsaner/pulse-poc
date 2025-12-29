import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Json } from '@/integrations/supabase/types';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, CheckCircle, XCircle, Clock, RefreshCw,
  Lightbulb, GitBranch, Users, Swords, Palette, MessageSquare,
  Globe, Heart, TrendingUp, Cog, AlertTriangle, FileText, Timer,
  FileInput, Tag, Scale, Blend, RefreshCcw, Search, Briefcase,
  Eye, MessageCircle, Map, Mic, Gamepad2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisStatus, AgentProgress } from '@/types/database';
import { 
  getAnalysisAgentsForScriptType, 
  SYSTEM_AGENTS, 
  META_AGENTS,
  type AgentDefinition 
} from '@/lib/scriptFramework';

const AGENT_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes timeout for individual agents

// Icon mapping from string names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb, GitBranch, Users, Swords, Palette, MessageSquare,
  Globe, Heart, TrendingUp, Cog, FileInput, Tag, Scale, Blend,
  RefreshCw: RefreshCcw, Search, Briefcase, Eye, MessageCircle,
  Timer, Map, Mic, Gamepad2
};

interface AnalysisRun {
  id: string;
  script_id: string;
  status: AnalysisStatus;
  agent_progress: Record<string, AgentProgress> | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  scripts?: {
    title: string;
    genre: string | null;
    script_type: string;
  };
}

interface InProgressAnalysisProps {
  analysis: AnalysisRun;
  onRetry: () => void;
  onViewPartial?: () => void;
}

export function InProgressAnalysis({ analysis, onRetry, onViewPartial }: InProgressAnalysisProps) {
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryingAgent, setRetryingAgent] = useState<string | null>(null);
  
  const agentProgress = analysis.agent_progress || {};
  const scriptType = analysis.scripts?.script_type || 'feature';
  
  // Get applicable agents for this script type from the framework
  const applicableAgents = useMemo(() => {
    return getAnalysisAgentsForScriptType(scriptType);
  }, [scriptType]);
  
  // Check if an agent has timed out (running for too long)
  const isAgentTimedOut = (progress: AgentProgress | undefined): boolean => {
    if (!progress || progress.status !== 'running') return false;
    if (!progress.startedAt) return false;
    const startedAt = new Date(progress.startedAt).getTime();
    return Date.now() - startedAt > AGENT_TIMEOUT_MS;
  };
  
  const getAgentStats = () => {
    let completed = 0, running = 0, failed = 0, pending = 0, timedOut = 0;
    
    for (const agent of applicableAgents) {
      const progress = agentProgress[agent.id];
      if (progress?.status === 'completed') completed++;
      else if (progress?.status === 'running') {
        if (isAgentTimedOut(progress)) timedOut++;
        else running++;
      }
      else if (progress?.status === 'failed') failed++;
      else pending++;
    }
    
    const total = applicableAgents.length;
    const percentage = Math.round(((completed + running * 0.5) / total) * 100);
    return { completed, running, failed, pending, timedOut, total, percentage };
  };
  
  const stats = getAgentStats();
  
  const handleResumeAnalysis = async () => {
    setIsRetrying(true);
    try {
      const { error } = await supabase.functions.invoke('analyze-script', {
        body: {
          scriptId: analysis.script_id,
          analysisRunId: analysis.id,
          mode: 'deep',
          resume: true,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: 'Analysis resumed',
        description: 'Re-running failed and pending agents...',
      });
      onRetry();
    } catch (err) {
      toast({
        title: 'Failed to resume',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  };
  
  const handleRetryAgent = async (agentName: string) => {
    setRetryingAgent(agentName);
    try {
      // Update the agent status to pending before retrying
      const updatedProgress = {
        ...agentProgress,
        [agentName]: { status: 'pending' as const }
      };
      
      await supabase
        .from('analysis_runs')
        .update({ agent_progress: updatedProgress as Json })
        .eq('id', analysis.id);
      
      const { error } = await supabase.functions.invoke('analyze-script', {
        body: {
          scriptId: analysis.script_id,
          analysisRunId: analysis.id,
          mode: 'deep',
          resume: true,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: `Retrying ${agentName}`,
        description: 'Agent analysis restarted...',
      });
      onRetry();
    } catch (err) {
      toast({
        title: 'Failed to retry agent',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRetryingAgent(null);
    }
  };
  
  const getStatusBadge = () => {
    if (analysis.status === 'processing') {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    }
    if (analysis.status === 'failed') {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
    if (analysis.status === 'pending') {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return null;
  };
  
  const getAgentStatusClass = (status?: string, timedOut?: boolean) => {
    if (timedOut) {
      return 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400';
    }
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400';
      case 'running':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400 animate-pulse';
      case 'failed':
        return 'bg-destructive/20 border-destructive/50 text-destructive';
      default:
        return 'bg-muted/50 border-border text-muted-foreground';
    }
  };
  
  const getAgentIcon = (agent: AgentDefinition, status?: string, timedOut?: boolean) => {
    const Icon = ICON_MAP[agent.icon] || Lightbulb;
    if (timedOut) return <Timer className="h-3 w-3" />;
    if (status === 'running') return <Loader2 className="h-3 w-3 animate-spin" />;
    if (status === 'completed') return <CheckCircle className="h-3 w-3" />;
    if (status === 'failed') return <XCircle className="h-3 w-3" />;
    return <Icon className="h-3 w-3" />;
  };
  
  // Get short label from agent name (e.g., "Concept & Hook" -> "Concept")
  const getShortLabel = (name: string): string => {
    const firstPart = name.split(' ')[0].replace('&', '').trim();
    return firstPart.length > 8 ? firstPart.slice(0, 7) + '…' : firstPart;
  };

  return (
    <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              {analysis.status === 'processing' ? (
                <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {analysis.scripts?.title || 'Untitled Script'}
                {getStatusBadge()}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Started {new Date(analysis.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {stats.completed > 0 && onViewPartial && (
              <Button variant="outline" size="sm" onClick={onViewPartial}>
                <FileText className="h-3 w-3 mr-1" />
                View Partial
              </Button>
            )}
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleResumeAnalysis}
              disabled={isRetrying || analysis.status === 'processing'}
            >
              {isRetrying ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Resume
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.completed} of {stats.total} agents complete</span>
            <span>{stats.percentage}%</span>
          </div>
          <Progress value={stats.percentage} className="h-1.5" />
        </div>
        
        {/* Error message */}
        {analysis.error_message && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            {analysis.error_message}
          </div>
        )}
        
        {/* Agent grid - dynamic based on script type */}
        <div className="space-y-3">
          {/* Script type indicator */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {scriptType.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {applicableAgents.length} agents active
            </span>
          </div>
          
          {/* Agent tiles */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {applicableAgents.map((agent) => {
              const progress = agentProgress[agent.id];
              const status = progress?.status;
              const timedOut = isAgentTimedOut(progress);
              const canRetry = status === 'failed' || timedOut || status === 'pending';
              const isRetryingThis = retryingAgent === agent.id;
              
              return (
                <div
                  key={agent.id}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all',
                    getAgentStatusClass(status, timedOut),
                    canRetry && 'cursor-pointer hover:ring-2 hover:ring-primary/50'
                  )}
                  onClick={() => canRetry && handleRetryAgent(agent.id)}
                  title={`${agent.name}: ${timedOut ? 'timed out' : status || 'pending'}${canRetry ? ' (click to retry)' : ''}\n${agent.description}`}
                >
                  {isRetryingThis ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    getAgentIcon(agent, status, timedOut)
                  )}
                  <span className="text-[9px] font-medium truncate w-full text-center">
                    {getShortLabel(agent.name)}
                  </span>
                  {(status === 'failed' || timedOut) && !isRetryingThis && (
                    <div className={cn(
                      "absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center",
                      timedOut ? "bg-amber-500" : "bg-destructive"
                    )}>
                      <RefreshCw className="h-2 w-2 text-destructive-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Stats summary */}
        <div className="flex flex-wrap gap-4 text-xs">
          {stats.completed > 0 && (
            <span className="text-emerald-500">✓ {stats.completed} completed</span>
          )}
          {stats.running > 0 && (
            <span className="text-blue-500">● {stats.running} running</span>
          )}
          {stats.timedOut > 0 && (
            <span className="text-amber-500">⏱ {stats.timedOut} timed out</span>
          )}
          {stats.failed > 0 && (
            <span className="text-destructive">✕ {stats.failed} failed</span>
          )}
          {stats.pending > 0 && (
            <span className="text-muted-foreground">○ {stats.pending} pending</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
