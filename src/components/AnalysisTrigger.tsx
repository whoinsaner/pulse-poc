import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Play, CheckCircle, XCircle, Clock, Zap, 
  Lightbulb, Layers, Users, Swords, Sparkles, MessageSquare,
  Globe, Heart, TrendingUp, Wrench, Palette, LayoutGrid, 
  BookOpen, PenTool
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisStatus, AgentProgress, ScriptType } from '@/types/database';

interface AnalysisTriggerProps {
  scriptId: string;
  scriptTitle: string;
  scriptType?: ScriptType;
  onAnalysisComplete?: (analysisRunId: string) => void;
}

// UASF Agent definitions with modules
const UASF_AGENTS = [
  { name: 'ConceptAgent', label: 'Concept & Hook', module: 'A', icon: Lightbulb },
  { name: 'StructureAgent', label: 'Structure', module: 'B', icon: Layers },
  { name: 'CharacterAgent', label: 'Character', module: 'C', icon: Users },
  { name: 'ConflictAgent', label: 'Conflict', module: 'D', icon: Swords },
  { name: 'ThemeAgent', label: 'Theme', module: 'E', icon: Sparkles },
  { name: 'DialogueAgent', label: 'Dialogue', module: 'F', icon: MessageSquare },
  { name: 'WorldLogicAgent', label: 'World & Logic', module: 'G', icon: Globe },
  { name: 'EmotionalArcAgent', label: 'Emotional Arc', module: 'H', icon: Heart },
  { name: 'MarketAgent', label: 'Market', module: 'I', icon: TrendingUp },
  { name: 'ExecutionAgent', label: 'Execution', module: 'J', icon: Wrench },
];

const COMIC_AGENTS = [
  { name: 'ComicVisualAgent', label: 'Visual Storytelling', module: 'V', icon: Palette },
  { name: 'ComicDialogueAgent', label: 'Comic Dialogue', module: 'CD', icon: MessageSquare },
  { name: 'ComicPacingAgent', label: 'Panel Pacing', module: 'P', icon: LayoutGrid },
  { name: 'ComicArtDirectionAgent', label: 'Art Direction', module: 'AD', icon: PenTool },
];

const SYNTHESIS_AGENTS = [
  { name: 'StakeholderLensAgent', label: 'Stakeholder Analysis', module: 'S', icon: Users },
  { name: 'InsightSynthesisAgent', label: 'Insight Synthesis', module: 'IS', icon: BookOpen },
];

export function AnalysisTrigger({ 
  scriptId, 
  scriptTitle, 
  scriptType = 'feature',
  onAnalysisComplete 
}: AnalysisTriggerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisRunId, setAnalysisRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('pending');
  const [agentProgress, setAgentProgress] = useState<Record<string, AgentProgress>>({});
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isExtractionComplete, setIsExtractionComplete] = useState<boolean | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const isComic = scriptType === 'comic';
  const activeAgents = isComic 
    ? [...UASF_AGENTS, ...COMIC_AGENTS, ...SYNTHESIS_AGENTS]
    : [...UASF_AGENTS, ...SYNTHESIS_AGENTS];

  // Check if script extraction is complete
  useEffect(() => {
    const checkExtractionStatus = async () => {
      try {
        const { data: graph, error: graphError } = await supabase
          .from('narrative_graphs')
          .select('metadata')
          .eq('script_id', scriptId)
          .single();

        if (graphError) {
          // No graph found - extraction may not be complete
          setIsExtractionComplete(false);
          setExtractionError('Script has not been parsed yet. Please re-upload the script.');
          return;
        }

        const metadata = graph?.metadata as { extraction_complete?: boolean; extracted_pages?: number; expected_pages?: number } | null;
        
        if (metadata?.extraction_complete === false) {
          setIsExtractionComplete(false);
          setExtractionError(`Incomplete extraction: Only ${metadata.extracted_pages || 0} of ${metadata.expected_pages || 'unknown'} pages extracted. Please re-upload in a different format.`);
        } else {
          setIsExtractionComplete(true);
          setExtractionError(null);
        }
      } catch (err) {
        console.error('Error checking extraction status:', err);
        setIsExtractionComplete(false);
        setExtractionError('Unable to verify extraction status.');
      }
    };

    checkExtractionStatus();
  }, [scriptId]);

  // Timer for elapsed time
  useEffect(() => {
    if (!isAnalyzing) return;
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle realtime updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    const newRecord = payload.new;
    console.log('[AnalysisTrigger] Realtime update received:', newRecord.status, newRecord.agent_progress);
    
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
      setElapsedTime(0);

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

  const getProgressStats = () => {
    const completed = Object.values(agentProgress).filter(a => a.status === 'completed').length;
    const running = Object.values(agentProgress).filter(a => a.status === 'running').length;
    const failed = Object.values(agentProgress).filter(a => a.status === 'failed').length;
    const total = activeAgents.length;
    const percentage = Math.round(((completed + running * 0.5) / total) * 100);
    return { completed, running, failed, total, percentage };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAgentStatusClass = (agentStatus?: string) => {
    switch (agentStatus) {
      case 'completed':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400';
      case 'running':
        return 'bg-primary/20 border-primary/50 text-primary ring-2 ring-primary/30 animate-pulse';
      case 'failed':
        return 'bg-destructive/20 border-destructive/50 text-destructive';
      default:
        return 'bg-muted/50 border-border text-muted-foreground';
    }
  };

  const getAgentIcon = (agent: typeof UASF_AGENTS[0], agentStatus?: string) => {
    const Icon = agent.icon;
    if (agentStatus === 'running') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (agentStatus === 'completed') {
      return <CheckCircle className="h-4 w-4" />;
    }
    if (agentStatus === 'failed') {
      return <XCircle className="h-4 w-4" />;
    }
    return <Icon className="h-4 w-4" />;
  };

  const stats = getProgressStats();

  if (!isAnalyzing && status === 'pending') {
    // Still checking extraction status
    if (isExtractionComplete === null) {
      return (
        <Button disabled className="w-full">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Checking extraction status...
        </Button>
      );
    }

    // Extraction incomplete - show error
    if (!isExtractionComplete) {
      return (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Analysis Unavailable</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {extractionError || 'Script extraction is incomplete. AI analysis cannot proceed until all pages are extracted.'}
                </p>
              </div>
            </div>
          </div>
          <Button disabled className="w-full" variant="secondary">
            <Play className="h-4 w-4 mr-2" />
            Run UASF Analysis
          </Button>
        </div>
      );
    }

    return (
      <Button onClick={startAnalysis} className="w-full">
        <Play className="h-4 w-4 mr-2" />
        Run UASF Analysis
      </Button>
    );
  }

  return (
    <div className="space-y-4 p-4 rounded-xl bg-card border border-border">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            {isAnalyzing && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">
              {status === 'processing' ? 'UASF Analysis Running' : 
               status === 'completed' ? 'Analysis Complete' : 
               status === 'failed' ? 'Analysis Failed' : 'Initializing...'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {stats.completed}/{stats.total} agents complete • {formatTime(elapsedTime)}
            </p>
          </div>
        </div>
        
        {isAnalyzing && (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{stats.percentage}%</span>
        </div>
        <Progress value={stats.percentage} className="h-2" />
      </div>

      {/* Agent Grid - Core UASF Agents */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Core Analysis Modules (A-J)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {UASF_AGENTS.map((agent) => {
            const progress = agentProgress[agent.name];
            return (
              <div
                key={agent.name}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-300',
                  getAgentStatusClass(progress?.status)
                )}
              >
                {getAgentIcon(agent, progress?.status)}
                <span className="text-[10px] font-medium text-center leading-tight">{agent.label}</span>
                <span className="text-[9px] opacity-60">Module {agent.module}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comic-specific agents */}
      {isComic && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Comic-Specific Agents
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COMIC_AGENTS.map((agent) => {
              const progress = agentProgress[agent.name];
              return (
                <div
                  key={agent.name}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-300',
                    getAgentStatusClass(progress?.status)
                  )}
                >
                  {getAgentIcon(agent, progress?.status)}
                  <span className="text-[10px] font-medium text-center leading-tight">{agent.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Synthesis Agents */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Synthesis & Insights
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SYNTHESIS_AGENTS.map((agent) => {
            const progress = agentProgress[agent.name];
            return (
              <div
                key={agent.name}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-all duration-300',
                  getAgentStatusClass(progress?.status)
                )}
              >
                {getAgentIcon(agent, progress?.status)}
                <span className="text-sm font-medium">{agent.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Footer */}
      {lastUpdated && isAnalyzing && (
        <p className="text-xs text-muted-foreground text-center">
          Last update: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {status === 'completed' && analysisRunId && (
        <Button onClick={() => onAnalysisComplete?.(analysisRunId)} className="w-full">
          <CheckCircle className="h-4 w-4 mr-2" />
          View Full Report
        </Button>
      )}
    </div>
  );
}
