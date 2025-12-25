import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Json } from '@/integrations/supabase/types';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, Play, CheckCircle, XCircle, Clock, RefreshCw,
  Lightbulb, Layers, Users, Swords, Sparkles, MessageSquare,
  Globe, Heart, TrendingUp, Wrench, AlertTriangle, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisStatus, AgentProgress } from '@/types/database';

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

const AGENT_CONFIG = [
  { name: 'ConceptAgent', label: 'Concept', icon: Lightbulb },
  { name: 'StructureAgent', label: 'Structure', icon: Layers },
  { name: 'CharacterAgent', label: 'Character', icon: Users },
  { name: 'ConflictAgent', label: 'Conflict', icon: Swords },
  { name: 'ThemeAgent', label: 'Theme', icon: Sparkles },
  { name: 'DialogueAgent', label: 'Dialogue', icon: MessageSquare },
  { name: 'WorldLogicAgent', label: 'World', icon: Globe },
  { name: 'EmotionalArcAgent', label: 'Emotion', icon: Heart },
  { name: 'MarketAgent', label: 'Market', icon: TrendingUp },
  { name: 'ExecutionAgent', label: 'Execution', icon: Wrench },
];

export function InProgressAnalysis({ analysis, onRetry, onViewPartial }: InProgressAnalysisProps) {
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryingAgent, setRetryingAgent] = useState<string | null>(null);
  
  const agentProgress = analysis.agent_progress || {};
  
  const getAgentStats = () => {
    const completed = Object.values(agentProgress).filter(a => a?.status === 'completed').length;
    const running = Object.values(agentProgress).filter(a => a?.status === 'running').length;
    const failed = Object.values(agentProgress).filter(a => a?.status === 'failed').length;
    const pending = Object.values(agentProgress).filter(a => a?.status === 'pending').length;
    const total = AGENT_CONFIG.length;
    const percentage = Math.round(((completed + running * 0.5) / total) * 100);
    return { completed, running, failed, pending, total, percentage };
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
  
  const getAgentStatusClass = (status?: string) => {
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
  
  const getAgentIcon = (agent: typeof AGENT_CONFIG[0], status?: string) => {
    const Icon = agent.icon;
    if (status === 'running') return <Loader2 className="h-3 w-3 animate-spin" />;
    if (status === 'completed') return <CheckCircle className="h-3 w-3" />;
    if (status === 'failed') return <XCircle className="h-3 w-3" />;
    return <Icon className="h-3 w-3" />;
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
        
        {/* Agent grid */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {AGENT_CONFIG.map((agent) => {
            const progress = agentProgress[agent.name];
            const status = progress?.status;
            const isFailed = status === 'failed';
            const isRetryingThis = retryingAgent === agent.name;
            
            return (
              <div
                key={agent.name}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all',
                  getAgentStatusClass(status),
                  isFailed && 'cursor-pointer hover:ring-2 hover:ring-destructive/50'
                )}
                onClick={() => isFailed && handleRetryAgent(agent.name)}
                title={`${agent.label}: ${status || 'pending'}${isFailed ? ' (click to retry)' : ''}`}
              >
                {isRetryingThis ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  getAgentIcon(agent, status)
                )}
                <span className="text-[9px] font-medium truncate w-full text-center">
                  {agent.label}
                </span>
                {isFailed && !isRetryingThis && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive flex items-center justify-center">
                    <RefreshCw className="h-2 w-2 text-destructive-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Stats summary */}
        <div className="flex gap-4 text-xs">
          {stats.completed > 0 && (
            <span className="text-emerald-500">✓ {stats.completed} completed</span>
          )}
          {stats.running > 0 && (
            <span className="text-blue-500">● {stats.running} running</span>
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
