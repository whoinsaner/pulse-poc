import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { 
  FileText, 
  Bot, 
  GitBranch,
  Layers,
  Sparkles,
  CheckCircle2,
  Settings2,
  Film,
  Zap,
  FileOutput,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  SCRIPT_TYPES, 
  ALL_AGENTS, 
  SYSTEM_AGENTS, 
  CORE_AGENTS, 
  COMIC_AGENTS, 
  INTERACTIVE_AGENTS, 
  AUDIO_AGENTS, 
  META_AGENTS,
  getAgentsForScriptType,
  AgentDefinition
} from "@/lib/scriptFramework";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AgentNodeProps {
  agent: AgentDefinition;
  isActive: boolean;
  isHighlighted: boolean;
  showParameters: boolean;
}

function AgentNode({ agent, isActive, isHighlighted, showParameters }: AgentNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'system': return 'border-slate-500';
      case 'meta': return 'border-amber-500';
      case 'comic': return 'border-fuchsia-500';
      case 'analysis': 
        if (agent.id.includes('Comic')) return 'border-fuchsia-500';
        if (agent.id.includes('Interactivity') || agent.id.includes('WorldBuilding')) return 'border-sky-500';
        if (agent.id.includes('Audio')) return 'border-violet-500';
        return 'border-emerald-500';
      default: return 'border-muted';
    }
  };

  const getCategoryBg = (category: string) => {
    if (!isActive) return 'bg-muted/30 opacity-40';
    if (isHighlighted) {
      switch (category) {
        case 'system': return 'bg-slate-500/20 ring-2 ring-slate-500';
        case 'meta': return 'bg-amber-500/20 ring-2 ring-amber-500';
        case 'comic': return 'bg-fuchsia-500/20 ring-2 ring-fuchsia-500';
        case 'analysis': 
          if (agent.id.includes('Comic')) return 'bg-fuchsia-500/20 ring-2 ring-fuchsia-500';
          if (agent.id.includes('Interactivity') || agent.id.includes('WorldBuilding')) return 'bg-sky-500/20 ring-2 ring-sky-500';
          if (agent.id.includes('Audio')) return 'bg-violet-500/20 ring-2 ring-violet-500';
          return 'bg-emerald-500/20 ring-2 ring-emerald-500';
        default: return 'bg-muted/50';
      }
    }
    return 'bg-card';
  };

  const getParamPillColor = (category: string) => {
    if (!isActive) return 'bg-muted/50 text-muted-foreground';
    switch (category) {
      case 'system': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'meta': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'comic': return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30';
      case 'analysis': 
        if (agent.id.includes('Comic')) return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30';
        if (agent.id.includes('Interactivity') || agent.id.includes('WorldBuilding')) return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
        if (agent.id.includes('Audio')) return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-muted/50 text-muted-foreground';
    }
  };

  const formatParamName = (param: string) => {
    return param
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getApplicableTypesText = () => {
    if (agent.applicableScriptTypes === 'all') return 'All script types';
    return agent.applicableScriptTypes
      .map(t => SCRIPT_TYPES.find(st => st.value === t)?.label || t)
      .join(', ');
  };

  return (
    <div 
      className={cn(
        "p-3 rounded-lg border-2 transition-all duration-300",
        getCategoryColor(agent.category),
        getCategoryBg(agent.category),
        !isActive && "grayscale"
      )}
    >
      <Collapsible open={isExpanded && showParameters} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full text-left" disabled={!showParameters}>
          <div className="flex items-center gap-2">
            {isActive && <Zap className="h-3 w-3 text-primary flex-shrink-0" />}
            <span className={cn(
              "text-xs font-semibold truncate flex-1",
              !isActive && "text-muted-foreground"
            )}>
              {agent.name}
            </span>
            {showParameters && agent.parameters.length > 0 && (
              isExpanded ? 
                <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" /> : 
                <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </CollapsibleTrigger>
        
        {/* Description - always visible */}
        <p className={cn(
          "text-[10px] mt-1.5 line-clamp-2",
          isActive ? "text-muted-foreground" : "text-muted-foreground/60"
        )}>
          {agent.description}
        </p>

        {/* Applicable types */}
        <div className="text-[9px] text-muted-foreground/80 mt-1.5">
          {getApplicableTypesText()}
        </div>

        {/* Report sections */}
        {agent.reportSections.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {agent.reportSections.slice(0, 3).map((section) => (
              <Badge key={section} variant="secondary" className="text-[8px] px-1 py-0 h-4">
                {section}
              </Badge>
            ))}
            {agent.reportSections.length > 3 && (
              <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">
                +{agent.reportSections.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <CollapsibleContent className="mt-2 pt-2 border-t border-border/50">
          <div className="flex flex-wrap gap-1">
            {agent.parameters.map((param) => (
              <span 
                key={param}
                className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-full border",
                  getParamPillColor(agent.category)
                )}
              >
                {formatParamName(param)}
              </span>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface StageProps {
  title: string;
  stageNumber: number;
  agents: AgentDefinition[];
  activeAgentIds: string[];
  color: string;
  icon: React.ReactNode;
  showParameters: boolean;
}

function Stage({ title, stageNumber, agents, activeAgentIds, color, icon, showParameters }: StageProps) {
  const activeCount = agents.filter(a => activeAgentIds.includes(a.id)).length;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
          color
        )}>
          {stageNumber}
        </span>
        <span className="text-sm font-medium">{title}</span>
        <Badge variant="outline" className="ml-auto text-xs">
          {activeCount}/{agents.length} active
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {agents.map((agent) => (
          <AgentNode 
            key={agent.id} 
            agent={agent} 
            isActive={activeAgentIds.includes(agent.id)}
            isHighlighted={activeAgentIds.includes(agent.id)}
            showParameters={showParameters}
          />
        ))}
      </div>
    </div>
  );
}

export function InteractivePipeline() {
  const [selectedScriptType, setSelectedScriptType] = useState("feature_film");
  const [showParameters, setShowParameters] = useState(true);
  
  // Get active agents for selected script type
  const activeAgents = useMemo(() => {
    return getAgentsForScriptType(selectedScriptType);
  }, [selectedScriptType]);
  
  const activeAgentIds = useMemo(() => {
    return activeAgents.map(a => a.id);
  }, [activeAgents]);

  // Group script types by category for dropdown
  const scriptTypesByCategory = useMemo(() => {
    return SCRIPT_TYPES.reduce((acc, type) => {
      if (!acc[type.category]) acc[type.category] = [];
      acc[type.category].push(type);
      return acc;
    }, {} as Record<string, typeof SCRIPT_TYPES>);
  }, []);

  const categoryLabels: Record<string, string> = {
    film: "Film",
    series: "Series",
    stage: "Stage",
    audio: "Audio",
    interactive: "Interactive",
    short_form: "Short Form",
    corporate: "Corporate",
    documentary: "Documentary",
    experimental: "Experimental"
  };

  // Stats
  const totalAgents = ALL_AGENTS.length;
  const activeCount = activeAgents.length;
  const totalParams = activeAgents.reduce((sum, a) => sum + a.parameters.length, 0);
  
  // Categorize agents for display
  const analysisAgents = [...CORE_AGENTS, ...COMIC_AGENTS, ...INTERACTIVE_AGENTS, ...AUDIO_AGENTS];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Interactive Agent Pipeline
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              See which agents run for each script type. Click agents to expand parameters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input 
                type="checkbox" 
                checked={showParameters} 
                onChange={(e) => setShowParameters(e.target.checked)}
                className="rounded border-muted"
              />
              <span className="text-muted-foreground">Expand params</span>
            </label>
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedScriptType} onValueChange={setSelectedScriptType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select script type" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {Object.entries(scriptTypesByCategory).map(([category, types]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {categoryLabels[category] || category}
                      </SelectLabel>
                      {types.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-emerald-500" />
            <span className="text-sm">
              <span className="font-bold text-emerald-500">{activeCount}</span>
              <span className="text-muted-foreground">/{totalAgents} agents active</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-500" />
            <span className="text-sm">
              <span className="font-bold text-purple-500">{totalParams}</span>
              <span className="text-muted-foreground"> parameters analyzed</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">
              Script Type: <span className="font-medium text-foreground">{SCRIPT_TYPES.find(t => t.value === selectedScriptType)?.label}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stage 1: System - Intake & Classification */}
        <Stage
          title="Intake & Classification"
          stageNumber={1}
          agents={SYSTEM_AGENTS.slice(0, 2)}
          activeAgentIds={activeAgentIds}
          color="bg-slate-500"
          icon={<Settings2 className="h-4 w-4" />}
          showParameters={showParameters}
        />

        {/* Stage 2: System - Resolution */}
        <Stage
          title="Classification Resolution"
          stageNumber={2}
          agents={SYSTEM_AGENTS.slice(2)}
          activeAgentIds={activeAgentIds}
          color="bg-amber-500"
          icon={<CheckCircle2 className="h-4 w-4" />}
          showParameters={showParameters}
        />

        {/* Stage 3: Analysis */}
        <Stage
          title="Core Analysis"
          stageNumber={3}
          agents={analysisAgents}
          activeAgentIds={activeAgentIds}
          color="bg-emerald-500"
          icon={<Bot className="h-4 w-4" />}
          showParameters={showParameters}
        />

        {/* Stage 4: Meta */}
        <Stage
          title="Meta Analysis & Output"
          stageNumber={4}
          agents={META_AGENTS}
          activeAgentIds={activeAgentIds}
          color="bg-purple-500"
          icon={<Sparkles className="h-4 w-4" />}
          showParameters={showParameters}
        />

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-slate-500 bg-slate-500/20" />
            <span className="text-xs text-muted-foreground">System</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-emerald-500 bg-emerald-500/20" />
            <span className="text-xs text-muted-foreground">Core</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-fuchsia-500 bg-fuchsia-500/20" />
            <span className="text-xs text-muted-foreground">Comic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-sky-500 bg-sky-500/20" />
            <span className="text-xs text-muted-foreground">Interactive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-violet-500 bg-violet-500/20" />
            <span className="text-xs text-muted-foreground">Audio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-amber-500 bg-amber-500/20" />
            <span className="text-xs text-muted-foreground">Meta</span>
          </div>
          <div className="flex items-center gap-1.5 ml-4">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">Active for selected type</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InteractivePipeline;
