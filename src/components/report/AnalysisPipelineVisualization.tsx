import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, CheckCircle, XCircle, Clock, ArrowRight,
  Lightbulb, GitBranch, Users, Swords, Palette, MessageSquare,
  Globe, Heart, TrendingUp, Cog, FileInput, Tag, Scale, Blend,
  RefreshCcw, Search, Briefcase, Eye, MessageCircle, Timer, Map, Mic, Gamepad2,
  Layers, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentProgress, StakeholderLens } from '@/types/database';
import { 
  SYSTEM_AGENTS, 
  CORE_AGENTS, 
  COMIC_AGENTS, 
  META_AGENTS,
  INTERACTIVE_AGENTS,
  AUDIO_AGENTS,
  getAnalysisAgentsForScriptType,
  type AgentDefinition 
} from '@/lib/scriptFramework';
import { getExpectedAgentsForAnalysis } from '@/lib/stakeholderConfig';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb, GitBranch, Users, Swords, Palette, MessageSquare,
  Globe, Heart, TrendingUp, Cog, FileInput, Tag, Scale, Blend,
  RefreshCw: RefreshCcw, Search, Briefcase, Eye, MessageCircle,
  Timer, Map, Mic, Gamepad2
};

interface PipelineStageProps {
  title: string;
  agents: AgentDefinition[];
  activeAgentIds: string[];
  agentProgress: Record<string, AgentProgress>;
  stageColor: string;
  stageIcon: React.ReactNode;
  isLast?: boolean;
}

function PipelineStage({ title, agents, activeAgentIds, agentProgress, stageColor, stageIcon, isLast }: PipelineStageProps) {
  const activeAgents = agents.filter(a => activeAgentIds.includes(a.id));
  const completedCount = activeAgents.filter(a => agentProgress[a.id]?.status === 'completed').length;
  const runningCount = activeAgents.filter(a => agentProgress[a.id]?.status === 'running').length;
  const failedCount = activeAgents.filter(a => agentProgress[a.id]?.status === 'failed').length;
  
  const stageProgress = activeAgents.length > 0 
    ? Math.round((completedCount / activeAgents.length) * 100) 
    : 0;
  
  const stageStatus = 
    failedCount > 0 ? 'failed' :
    runningCount > 0 ? 'running' :
    completedCount === activeAgents.length && activeAgents.length > 0 ? 'completed' :
    'pending';

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3 text-emerald-500" />;
      case 'running': return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-3 w-3 text-destructive" />;
      default: return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (activeAgents.length === 0) return null;

  return (
    <div className="flex items-stretch gap-4">
      <div className={cn(
        "flex-1 p-4 rounded-lg border-2 transition-all",
        stageStatus === 'completed' && "border-emerald-500/50 bg-emerald-500/5",
        stageStatus === 'running' && "border-blue-500/50 bg-blue-500/5",
        stageStatus === 'failed' && "border-destructive/50 bg-destructive/5",
        stageStatus === 'pending' && "border-border bg-muted/20"
      )}>
        {/* Stage Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("p-1.5 rounded-md", stageColor)}>
            {stageIcon}
          </div>
          <span className="font-semibold text-sm">{title}</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {completedCount}/{activeAgents.length}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <Progress value={stageProgress} className="h-1 mb-3" />
        
        {/* Agent pills */}
        <div className="flex flex-wrap gap-1.5">
          {activeAgents.map(agent => {
            const status = agentProgress[agent.id]?.status;
            const Icon = ICON_MAP[agent.icon] || Lightbulb;
            
            return (
              <div
                key={agent.id}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all",
                  status === 'completed' && "bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
                  status === 'running' && "bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300 animate-pulse",
                  status === 'failed' && "bg-destructive/20 border-destructive/30 text-destructive",
                  !status && "bg-muted/50 border-border text-muted-foreground"
                )}
                title={`${agent.name}\nParameters: ${agent.parameters.join(', ')}`}
              >
                {getStatusIcon(status)}
                <span className="font-medium">{agent.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Arrow connector */}
      {!isLast && (
        <div className="flex items-center">
          <ArrowRight className={cn(
            "h-5 w-5 transition-colors",
            stageStatus === 'completed' ? "text-emerald-500" : "text-muted-foreground/30"
          )} />
        </div>
      )}
    </div>
  );
}

interface AnalysisPipelineVisualizationProps {
  scriptType: string;
  agentProgress: Record<string, AgentProgress>;
  stakeholderLens?: StakeholderLens | null;
}

export function AnalysisPipelineVisualization({ 
  scriptType, 
  agentProgress,
  stakeholderLens
}: AnalysisPipelineVisualizationProps) {
  // Get expected agents based on script type AND stakeholder lens
  const expectedAgentIds = useMemo(() => {
    return getExpectedAgentsForAnalysis(scriptType, stakeholderLens ?? null);
  }, [scriptType, stakeholderLens]);
  
  const applicableAgents = useMemo(() => {
    return getAnalysisAgentsForScriptType(scriptType);
  }, [scriptType]);
  
  // Filter to only show expected agents
  const activeAgentIds = useMemo(() => expectedAgentIds, [expectedAgentIds]);
  
  // Calculate overall stats using expected agents
  const stats = useMemo(() => {
    const total = expectedAgentIds.length;
    const completed = expectedAgentIds.filter(id => agentProgress[id]?.status === 'completed').length;
    const running = expectedAgentIds.filter(id => agentProgress[id]?.status === 'running').length;
    const failed = expectedAgentIds.filter(id => agentProgress[id]?.status === 'failed').length;
    const pending = total - completed - running - failed;
    
    // Calculate total params from applicable agents that are in expected list
    const allAgents = [...SYSTEM_AGENTS, ...CORE_AGENTS, ...COMIC_AGENTS, ...INTERACTIVE_AGENTS, ...AUDIO_AGENTS, ...META_AGENTS];
    const totalParams = allAgents
      .filter(a => expectedAgentIds.includes(a.id))
      .reduce((sum, a) => sum + a.parameters.length, 0);
    
    return { total, completed, running, failed, pending, totalParams };
  }, [expectedAgentIds, agentProgress]);

  // Categorize agents by pipeline stage
  const analysisAgents = [...CORE_AGENTS, ...COMIC_AGENTS, ...INTERACTIVE_AGENTS, ...AUDIO_AGENTS];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-4 w-4 text-primary" />
            Analysis Pipeline
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {stats.totalParams} params
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {stats.completed}/{stats.total} agents
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pipeline stages in horizontal flow */}
        <div className="flex flex-col lg:flex-row gap-4">
          <PipelineStage
            title="System"
            agents={SYSTEM_AGENTS}
            activeAgentIds={activeAgentIds}
            agentProgress={agentProgress}
            stageColor="bg-slate-500/20 text-slate-500"
            stageIcon={<FileInput className="h-4 w-4" />}
          />
          
          <PipelineStage
            title="Analysis"
            agents={analysisAgents}
            activeAgentIds={activeAgentIds}
            agentProgress={agentProgress}
            stageColor="bg-emerald-500/20 text-emerald-500"
            stageIcon={<Lightbulb className="h-4 w-4" />}
            isLast
          />
          
          {/* Meta stage hidden - agents not yet implemented in edge function
          <PipelineStage
            title="Meta"
            agents={META_AGENTS}
            activeAgentIds={activeAgentIds}
            agentProgress={agentProgress}
            stageColor="bg-purple-500/20 text-purple-500"
            stageIcon={<Briefcase className="h-4 w-4" />}
            isLast
          />
          */}
        </div>
        
        {/* Status summary */}
        <div className="flex flex-wrap gap-4 pt-3 border-t text-xs">
          {stats.completed > 0 && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-3 w-3" />
              {stats.completed} completed
            </span>
          )}
          {stats.running > 0 && (
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              {stats.running} running
            </span>
          )}
          {stats.failed > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="h-3 w-3" />
              {stats.failed} failed
            </span>
          )}
          {stats.pending > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {stats.pending} pending
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalysisPipelineVisualization;
