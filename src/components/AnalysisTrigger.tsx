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
  BookOpen, PenTool, AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { AnalysisStatus, AgentProgress, ScriptType, StakeholderLens } from '@/types/database';
import { StakeholderSelector } from '@/components/StakeholderSelector';
import { StakeholderBadge } from '@/components/StakeholderBadge';
import { getAgentsForStakeholder } from '@/lib/stakeholderConfig';
import { QualityModeSelector, type QualityMode } from '@/components/QualityModeSelector';

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
  const [showStakeholderSelector, setShowStakeholderSelector] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderLens | null>(null);
  const [pendingAnalysisMode, setPendingAnalysisMode] = useState<{ force: boolean; mode: 'quick' | 'deep' } | null>(null);
  const [qualityMode, setQualityMode] = useState<QualityMode>('balanced');

  const isComic = scriptType === 'comic';
  
  // Get agents based on selected stakeholder
  const getActiveAgents = () => {
    const agentNames = getAgentsForStakeholder(selectedStakeholder, isComic);
    const allAgents = [...UASF_AGENTS, ...COMIC_AGENTS, ...SYNTHESIS_AGENTS];
    return allAgents.filter(a => agentNames.includes(a.name));
  };
  
  const activeAgents = getActiveAgents();

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

  const startAnalysis = async (forceAnalysis = false, mode: 'quick' | 'deep' = 'deep', resume = false, existingRunId?: string, stakeholderLens?: StakeholderLens | null) => {
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
      
      // Don't reset progress when resuming
      if (!resume) {
        setAgentProgress({});
        setElapsedTime(0);
      }
      setLastUpdated(null);

      let runId = existingRunId;
      
      if (!resume || !existingRunId) {
        // Create new analysis run with stakeholder lens and quality mode
        const { data: run, error: createError } = await supabase
          .from('analysis_runs')
          .insert({
            script_id: scriptId,
            initiated_by: user.id,
            status: 'pending',
            stakeholder_lens: stakeholderLens || null,
            quality_mode: qualityMode,
          })
          .select()
          .single();

        if (createError) throw createError;
        runId = run.id;
      }

      setAnalysisRunId(runId!);
      console.log('[AnalysisTrigger] Created analysis run:', runId, 'mode:', mode, 'quality:', qualityMode, 'forceAnalysis:', forceAnalysis, 'resume:', resume, 'stakeholderLens:', stakeholderLens);

      // Trigger analysis edge function (non-blocking)
      supabase.functions.invoke('analyze-script', {
        body: {
          scriptId,
          analysisRunId: runId,
          mode,
          qualityMode,
          forceAnalysis,
          resume,
          stakeholderLens: stakeholderLens || null,
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

  const handleStakeholderSelect = (lens: StakeholderLens | null) => {
    setSelectedStakeholder(lens);
    setShowStakeholderSelector(false);
    if (pendingAnalysisMode) {
      startAnalysis(pendingAnalysisMode.force, pendingAnalysisMode.mode, false, undefined, lens);
      setPendingAnalysisMode(null);
    }
  };

  const initiateAnalysis = (force: boolean, mode: 'quick' | 'deep') => {
    setPendingAnalysisMode({ force, mode });
    setShowStakeholderSelector(true);
  };

  const retryFailedAgents = () => {
    if (!analysisRunId) return;
    toast({
      title: 'Resuming analysis',
      description: 'Re-running failed and pending agents in batches...',
    });
    startAnalysis(false, 'deep', true, analysisRunId);
  };

  // Check for stuck analysis (processing for > 5 minutes without updates)
  const isStuck = status === 'processing' && lastUpdated && 
    (new Date().getTime() - lastUpdated.getTime() > 5 * 60 * 1000);
  
  const hasFailedAgents = Object.values(agentProgress).some(a => a.status === 'failed');
  const hasPendingAgents = Object.values(agentProgress).some(a => a.status === 'pending');
  const hasRunningAgents = Object.values(agentProgress).some(a => a.status === 'running');

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

  // Show stakeholder selector
  if (showStakeholderSelector) {
    return (
      <StakeholderSelector
        onSelect={handleStakeholderSelect}
        onCancel={() => {
          setShowStakeholderSelector(false);
          setPendingAnalysisMode(null);
        }}
        selectedLens={selectedStakeholder}
      />
    );
  }

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

    // Extraction incomplete - show warning with override option
    if (!isExtractionComplete) {
      return (
        <div className="space-y-3">
          <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-400">Incomplete Script Parsing</p>
              <p className="text-muted-foreground mt-1">
                {extractionError || 'Script extraction is incomplete. Analysis accuracy may be reduced.'}
              </p>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => initiateAnalysis(true, 'deep')} 
              className="w-full" 
              variant="outline"
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Analyze Anyway (Reduced Accuracy)
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Analysis will use raw script text as fallback. Results may be less precise.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <QualityModeSelector 
          value={qualityMode} 
          onChange={setQualityMode} 
          disabled={false}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => initiateAnalysis(false, 'quick')} variant="outline" className="w-full">
            <Zap className="h-4 w-4 mr-2 text-amber-500" />
            Quick Analysis
          </Button>
          <Button onClick={() => initiateAnalysis(false, 'deep')} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Deep Analysis
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Quick: Direct text analysis (faster) • Deep: Uses parsed structure (more accurate)
        </p>
      </div>
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
        
        {isAnalyzing && !isStuck && (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        )}
        {isStuck && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            STALLED
          </Badge>
        )}
      </div>

      {/* Stuck/Failed Analysis Actions */}
      {(isStuck || (status === 'failed' && (hasFailedAgents || hasPendingAgents))) && (
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            <p className="font-medium text-amber-600 dark:text-amber-400">
              {isStuck ? 'Analysis appears stalled' : 'Some agents failed'}
            </p>
            <p className="text-muted-foreground mt-1">
              {stats.failed > 0 && `${stats.failed} agent(s) failed. `}
              {stats.completed > 0 && `${stats.completed} completed successfully. `}
              You can resume to retry failed/pending agents.
            </p>
            <Button 
              onClick={retryFailedAgents} 
              size="sm" 
              className="mt-2"
              variant="outline"
            >
              <Play className="h-3 w-3 mr-1" />
              Resume Analysis
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
        <div className="space-y-2">
          {stats.failed > 0 && (
            <Button onClick={retryFailedAgents} variant="outline" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Retry {stats.failed} Failed Agent{stats.failed > 1 ? 's' : ''}
            </Button>
          )}
          <Button onClick={() => onAnalysisComplete?.(analysisRunId)} className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            View Full Report
          </Button>
        </div>
      )}

      {status === 'failed' && analysisRunId && stats.failed > 0 && (
        <Button onClick={retryFailedAgents} className="w-full">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Retry Failed Agents ({stats.failed})
        </Button>
      )}
    </div>
  );
}
