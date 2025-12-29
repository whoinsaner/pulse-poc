import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Json } from '@/integrations/supabase/types';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, CheckCircle, XCircle, Clock, RefreshCw,
  Lightbulb, GitBranch, Users, Swords, Palette, MessageSquare,
  Globe, Heart, TrendingUp, Cog, AlertTriangle, FileText, Timer,
  FileInput, Tag, Scale, Blend, RefreshCcw, Search, Briefcase,
  Eye, MessageCircle, Map, Mic, Gamepad2, ChevronDown, ChevronUp,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisStatus, AgentProgress } from '@/types/database';
import { 
  getAgentsForScriptType,
  getAnalysisAgentsForScriptType, 
  SYSTEM_AGENTS, 
  META_AGENTS,
  CORE_AGENTS,
  COMIC_AGENTS,
  INTERACTIVE_AGENTS,
  AUDIO_AGENTS,
  type AgentDefinition 
} from '@/lib/scriptFramework';
import { AnalysisPipelineVisualization } from './AnalysisPipelineVisualization';
import { ParameterBreakdownPanel } from './ParameterBreakdownPanel';
import { useRealtimeAnalysis } from '@/hooks/useRealtimeAnalysis';

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
  onComplete?: () => void;
}

export function InProgressAnalysis({ analysis: initialAnalysis, onRetry, onViewPartial, onComplete }: InProgressAnalysisProps) {
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryingAgent, setRetryingAgent] = useState<string | null>(null);
  const [showPipeline, setShowPipeline] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Use realtime hook for live updates
  const { 
    analysis: realtimeAnalysis, 
    agentProgress: realtimeAgentProgress,
    status: realtimeStatus,
    refresh 
  } = useRealtimeAnalysis({
    analysisRunId: initialAnalysis.id,
    onStatusChange: (status) => {
      console.log('[InProgressAnalysis] Status changed:', status);
    },
    onComplete: () => {
      console.log('[InProgressAnalysis] Analysis completed');
      onComplete?.();
    },
    onError: (error) => {
      console.error('[InProgressAnalysis] Analysis error:', error);
    }
  });
  
  // Merge realtime data with initial analysis (prefer realtime when available)
  const analysis = realtimeAnalysis || initialAnalysis;
  const agentProgress = realtimeAgentProgress || analysis.agent_progress || {};
  const scriptType = analysis.scripts?.script_type || 'feature';
  
  // Get ALL applicable agents for this script type (including system and meta)
  const allApplicableAgents = useMemo(() => {
    return getAgentsForScriptType(scriptType);
  }, [scriptType]);
  
  // Get analysis agents only (for backward compat grid)
  const analysisAgents = useMemo(() => {
    return getAnalysisAgentsForScriptType(scriptType);
  }, [scriptType]);
  
  // Group agents by category
  const agentsByCategory = useMemo(() => {
    const systemAgents = SYSTEM_AGENTS.filter(a => 
      a.applicableScriptTypes === 'all' || a.applicableScriptTypes.includes(scriptType)
    );
    
    const analysisAgentsList = [...CORE_AGENTS, ...COMIC_AGENTS, ...INTERACTIVE_AGENTS, ...AUDIO_AGENTS].filter(a => 
      a.applicableScriptTypes === 'all' || a.applicableScriptTypes.includes(scriptType)
    );
    
    const metaAgents = META_AGENTS.filter(a => 
      a.applicableScriptTypes === 'all' || a.applicableScriptTypes.includes(scriptType)
    );
    
    return { system: systemAgents, analysis: analysisAgentsList, meta: metaAgents };
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
    
    for (const agent of allApplicableAgents) {
      const progress = agentProgress[agent.id];
      if (progress?.status === 'completed') completed++;
      else if (progress?.status === 'running') {
        if (isAgentTimedOut(progress)) timedOut++;
        else running++;
      }
      else if (progress?.status === 'failed') failed++;
      else pending++;
    }
    
    const total = allApplicableAgents.length;
    const percentage = Math.round(((completed + running * 0.5) / total) * 100);
    return { completed, running, failed, pending, timedOut, total, percentage };
  };
  
  const stats = getAgentStats();
  
  // Calculate total parameters
  const totalParams = useMemo(() => 
    allApplicableAgents.reduce((sum, a) => sum + a.parameters.length, 0),
  [allApplicableAgents]);
  
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
      refresh();
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
      refresh();
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
    const status = realtimeStatus || analysis.status;
    if (status === 'processing') {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    }
    if (status === 'failed') {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (status === 'completed') {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
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
    <div className="space-y-4">
      {/* Main Status Card */}
      <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                {(realtimeStatus || analysis.status) === 'processing' ? (
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
                disabled={isRetrying || (realtimeStatus || analysis.status) === 'processing'}
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
          
          {/* Script type and params summary */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {scriptType.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {allApplicableAgents.length} agents • {totalParams} parameters
            </span>
            <Badge variant="secondary" className="text-xs ml-auto">
              <Layers className="h-3 w-3 mr-1" />
              System: {agentsByCategory.system.length} | Analysis: {agentsByCategory.analysis.length} | Meta: {agentsByCategory.meta.length}
            </Badge>
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
      
      {/* Pipeline Visualization */}
      <Collapsible open={showPipeline} onOpenChange={setShowPipeline}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between py-2 h-auto">
            <span className="flex items-center gap-2 text-sm font-medium">
              <GitBranch className="h-4 w-4" />
              Analysis Pipeline
            </span>
            {showPipeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <AnalysisPipelineVisualization 
            scriptType={scriptType} 
            agentProgress={agentProgress} 
          />
        </CollapsibleContent>
      </Collapsible>
      
      {/* Parameter Breakdown */}
      <Collapsible open={showBreakdown} onOpenChange={setShowBreakdown}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between py-2 h-auto">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Layers className="h-4 w-4" />
              Parameter Breakdown
            </span>
            {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <ParameterBreakdownPanel 
            scriptType={scriptType} 
            agentProgress={agentProgress} 
          />
        </CollapsibleContent>
      </Collapsible>
      
      {/* Compact Agent Grid (click to retry failed/timed out) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agent Status Grid
            <span className="text-xs font-normal text-muted-foreground ml-2">
              (Click failed or timed out agents to retry)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-12 gap-1.5">
            {allApplicableAgents.map((agent) => {
              const progress = agentProgress[agent.id];
              const status = progress?.status;
              const timedOut = isAgentTimedOut(progress);
              const canRetry = status === 'failed' || timedOut || status === 'pending';
              const isRetryingThis = retryingAgent === agent.id;
              
              return (
                <div
                  key={agent.id}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all group',
                    getAgentStatusClass(status, timedOut),
                    canRetry && 'cursor-pointer hover:ring-2 hover:ring-primary/50'
                  )}
                  onClick={() => canRetry && handleRetryAgent(agent.id)}
                  title={`${agent.name}: ${timedOut ? 'timed out' : status || 'pending'}\nCategory: ${agent.category}\nParams: ${agent.parameters.slice(0, 3).join(', ')}${agent.parameters.length > 3 ? '...' : ''}`}
                >
                  {isRetryingThis ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    getAgentIcon(agent, status, timedOut)
                  )}
                  <span className="text-[9px] font-medium truncate w-full text-center">
                    {getShortLabel(agent.name)}
                  </span>
                  
                  {/* Parameter count badge */}
                  <span className="text-[8px] text-muted-foreground">
                    {agent.parameters.length}p
                  </span>
                  
                  {/* Category indicator */}
                  <span className={cn(
                    "absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full",
                    agent.category === 'system' && "bg-slate-500",
                    agent.category === 'analysis' && "bg-emerald-500",
                    agent.category === 'comic' && "bg-indigo-500",
                    agent.category === 'meta' && "bg-purple-500"
                  )} />
                  
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
          
          {/* Category legend */}
          <div className="flex gap-4 mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              System
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Analysis
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Comic
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Meta
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
