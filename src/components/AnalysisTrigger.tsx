import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisStatus, AgentProgress } from '@/types/database';

interface AnalysisTriggerProps {
  scriptId: string;
  scriptTitle: string;
  onAnalysisComplete?: (analysisRunId: string) => void;
}

const AGENT_NAMES = [
  'StructureAgent',
  'CharacterAgent',
  'ConflictAgent',
  'ThemeAgent',
  'DialogueAgent',
  'EmotionalArcAgent',
  'WorldLogicAgent',
  'MarketAgent',
  'ExecutionAgent',
];

const AGENT_LABELS: Record<string, string> = {
  StructureAgent: 'Structure',
  CharacterAgent: 'Character',
  ConflictAgent: 'Conflict',
  ThemeAgent: 'Theme',
  DialogueAgent: 'Dialogue',
  EmotionalArcAgent: 'Emotion',
  WorldLogicAgent: 'World Logic',
  MarketAgent: 'Market',
  ExecutionAgent: 'Execution',
};

export function AnalysisTrigger({ scriptId, scriptTitle, onAnalysisComplete }: AnalysisTriggerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisRunId, setAnalysisRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('pending');
  const [agentProgress, setAgentProgress] = useState<Record<string, AgentProgress>>({});
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Handle realtime updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    const newRecord = payload.new;
    console.log('[AnalysisTrigger] Realtime update received:', newRecord.status);
    
    setStatus(newRecord.status as AnalysisStatus);
    setAgentProgress((newRecord.agent_progress as unknown as Record<string, AgentProgress>) || {});
    setLastUpdated(new Date());

    if (newRecord.status === 'completed') {
      setIsAnalyzing(false);
      toast({
        title: 'Analysis complete',
        description: `"${scriptTitle}" has been analyzed successfully`,
      });
      onAnalysisComplete?.(newRecord.id);
    } else if (newRecord.status === 'failed') {
      setIsAnalyzing(false);
      setError(newRecord.error_message || 'Analysis failed');
      toast({
        title: 'Analysis failed',
        description: newRecord.error_message || 'An error occurred during analysis',
        variant: 'destructive',
      });
    }
  }, [scriptTitle, onAnalysisComplete, toast]);

  // Subscribe to realtime updates when analysis starts
  useEffect(() => {
    if (!analysisRunId || !isAnalyzing) return;

    console.log('[AnalysisTrigger] Subscribing to realtime updates for:', analysisRunId);

    const channel = supabase
      .channel(`analysis-progress-${analysisRunId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_runs',
          filter: `id=eq.${analysisRunId}`,
        },
        handleRealtimeUpdate
      )
      .subscribe((status) => {
        console.log('[AnalysisTrigger] Subscription status:', status);
      });

    return () => {
      console.log('[AnalysisTrigger] Unsubscribing from realtime updates');
      supabase.removeChannel(channel);
    };
  }, [analysisRunId, isAnalyzing, handleRealtimeUpdate]);

  const startAnalysis = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to run analysis',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setStatus('pending');
      setAgentProgress({});
      setLastUpdated(null);

      // Create analysis run
      const { data: run, error: createError } = await supabase
        .from('analysis_runs')
        .insert({
          script_id: scriptId,
          initiated_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;

      setAnalysisRunId(run.id);
      console.log('[AnalysisTrigger] Created analysis run:', run.id);

      // Trigger analysis edge function (non-blocking)
      supabase.functions.invoke('analyze-script', {
        body: {
          scriptId,
          analysisRunId: run.id,
        },
      }).then(({ error: invokeError }) => {
        if (invokeError) {
          console.error('[AnalysisTrigger] Edge function error:', invokeError);
          setError(invokeError.message);
          setIsAnalyzing(false);
        }
      });

    } catch (err) {
      console.error('Analysis error:', err);
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to start analysis',
        variant: 'destructive',
      });
    }
  };

  const getProgressPercentage = () => {
    const agents = Object.values(agentProgress);
    if (agents.length === 0) return 0;
    const completed = agents.filter(a => a.status === 'completed').length;
    const running = agents.filter(a => a.status === 'running').length;
    return Math.round(((completed + running * 0.5) / AGENT_NAMES.length) * 100);
  };

  const getAgentIcon = (agentStatus?: string) => {
    switch (agentStatus) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!isAnalyzing && status === 'pending') {
    return (
      <Button onClick={startAnalysis} className="w-full">
        <Play className="h-4 w-4 mr-2" />
        Run AI Analysis
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">
            {status === 'processing' ? 'Analyzing Script...' : 
             status === 'completed' ? 'Analysis Complete' : 
             status === 'failed' ? 'Analysis Failed' : 'Starting Analysis...'}
          </h3>
          {isAnalyzing && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium animate-pulse">
              <Zap className="h-3 w-3" />
              LIVE
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground">{getProgressPercentage()}%</span>
      </div>

      <Progress value={getProgressPercentage()} className="h-2" />

      {lastUpdated && isAnalyzing && (
        <p className="text-xs text-muted-foreground">
          Last update: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {AGENT_NAMES.map((agent) => {
          const progress = agentProgress[agent];
          return (
            <div
              key={agent}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg text-sm transition-all duration-300',
                progress?.status === 'completed' && 'bg-success/10 scale-[1.02]',
                progress?.status === 'running' && 'bg-primary/10 ring-1 ring-primary/30',
                progress?.status === 'failed' && 'bg-destructive/10',
                !progress?.status && 'bg-muted/50'
              )}
            >
              {getAgentIcon(progress?.status)}
              <span className="truncate">{AGENT_LABELS[agent]}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {status === 'completed' && analysisRunId && (
        <Button onClick={() => onAnalysisComplete?.(analysisRunId)} className="w-full">
          View Report
        </Button>
      )}
    </div>
  );
}
