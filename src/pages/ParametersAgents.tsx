import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  Bot,
  Layers,
  Eye,
  Scale,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  FileJson,
  Download,
  Film,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportParametersToCSV } from "@/lib/exportUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AgentOutputSchema } from "@/components/parameters/AgentOutputSchema";
import { InsightsSchema } from "@/components/parameters/InsightsSchema";
import { DataFlowDiagram } from "@/components/parameters/DataFlowDiagram";
import { SampleAgentOutput } from "@/components/parameters/SampleAgentOutput";
import { AgentSectionMapping } from "@/components/parameters/AgentSectionMapping";
import { InteractivePipeline } from "@/components/parameters/InteractivePipeline";
import {
  SCRIPT_TYPES,
  SIMPLE_SCRIPT_TYPES,
  ALL_AGENTS,
  getAnalysisAgentsForScriptType,
  CURRENT_PROMPT_VERSION,
  CONFIDENCE_LEVELS,
  getConfidenceLevel,
  ScriptTypeCategory,
} from "@/lib/scriptFramework";

interface Parameter {
  id: string;
  name: string;
  display_name: string;
  category: string;
  agent_source: string;
  description: string | null;
  default_weight: number;
}

interface LensWeight {
  id: string;
  lens: string;
  weight: number;
  parameter_id: string;
  parameter_name: string;
  display_name: string;
  category: string;
}

const LENS_LABELS: Record<string, { label: string; description: string; color: string }> = {
  studio_executive: {
    label: "Studio Executive",
    description: "Focus on commercial viability and audience appeal",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  producer: {
    label: "Producer",
    description: "Balance of creative vision and practical execution",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  actor: {
    label: "Actor",
    description: "Character depth and performative opportunities",
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  },
  director: {
    label: "Director",
    description: "Visual storytelling and creative control",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  writer: {
    label: "Writer",
    description: "Narrative craft and thematic resonance",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  financier: {
    label: "Financier",
    description: "ROI potential and risk assessment",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  investor: {
    label: "Investor",
    description: "Market clarity, budget realism, platform fit, franchise scalability",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  ott_platform: {
    label: "OTT Platform",
    description: "Streaming metrics and binge-worthiness",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  theatrical: {
    label: "Theatrical",
    description: "Big-screen impact and theatrical experience",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  },
};

const AGENT_COLORS: Record<string, string> = {
  // System Agents
  IntakeNormalizerAgent: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  ScriptTypeClassifierAgent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ClassifierArbitrationAgent: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  MultiTypeBlendingAgent: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  // Core Agents
  ConceptAgent: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  StructureAgent: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CharacterAgent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  ConflictAgent: "bg-red-500/10 text-red-500 border-red-500/20",
  ThemeAgent: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  DialogueAgent: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  EmotionalArcAgent: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  WorldLogicAgent: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  MarketAgent: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  ExecutionAgent: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  // Comic Agents
  ComicArtDirectionAgent: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
  ComicDialogueAgent: "bg-lime-500/10 text-lime-500 border-lime-500/20",
  ComicPacingAgent: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  ComicVisualAgent: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  // Interactive Agents
  InteractivityAgent: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  WorldBuildingAgent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  // Audio Agents
  AudioNarrativeAgent: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  // Meta Agents
  ScriptEvolutionAgent: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  CreatorFeedbackLoopAgent: "bg-green-500/10 text-green-500 border-green-500/20",
  ExplainabilityTraceAgent: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  InvestorReadinessAgent: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

// Get agents applicable to a script type using the framework
function getAgentsForScriptType(scriptType: string): string[] {
  const agents = getAnalysisAgentsForScriptType(scriptType);
  return agents.map(a => a.id);
}

export default function ParametersAgents() {
  const [selectedLens, setSelectedLens] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedScriptType, setSelectedScriptType] = useState<string>("all");

  const { data: parameters = [], isLoading: loadingParams } = useQuery({
    queryKey: ["parameters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parameters")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Parameter[];
    },
  });

  const { data: lensWeights = [], isLoading: loadingWeights } = useQuery({
    queryKey: ["lens-weights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lens_weights")
        .select(`
          id,
          lens,
          weight,
          parameter_id,
          parameters!inner (
            name,
            display_name,
            category
          )
        `)
        .order("lens", { ascending: true });
      if (error) throw error;
      return data.map((lw: any) => ({
        id: lw.id,
        lens: lw.lens,
        weight: lw.weight,
        parameter_id: lw.parameter_id,
        parameter_name: lw.parameters.name,
        display_name: lw.parameters.display_name,
        category: lw.parameters.category,
      })) as LensWeight[];
    },
  });

  // Group parameters by agent
  const parametersByAgent = useMemo(() => {
    const grouped: Record<string, Parameter[]> = {};
    parameters.forEach((param) => {
      if (!grouped[param.agent_source]) {
        grouped[param.agent_source] = [];
      }
      grouped[param.agent_source].push(param);
    });
    return grouped;
  }, [parameters]);

  // Group parameters by category
  const parametersByCategory = useMemo(() => {
    const grouped: Record<string, Parameter[]> = {};
    parameters.forEach((param) => {
      if (!grouped[param.category]) {
        grouped[param.category] = [];
      }
      grouped[param.category].push(param);
    });
    return grouped;
  }, [parameters]);

  // Get unique agents
  const agents = useMemo(() => {
    return [...new Set(parameters.map((p) => p.agent_source))].sort();
  }, [parameters]);

  // Get unique lenses
  const lenses = useMemo(() => {
    return [...new Set(lensWeights.map((lw) => lw.lens))].sort();
  }, [lensWeights]);

  // Get lens weights for a parameter
  const getParameterLensWeights = (parameterId: string) => {
    return lensWeights.filter((lw) => lw.parameter_id === parameterId);
  };

  // Get weight indicator
  const getWeightIndicator = (weight: number) => {
    if (weight > 1.05) {
      return { icon: TrendingUp, label: "High Priority", color: "text-green-500" };
    } else if (weight < 0.95) {
      return { icon: TrendingDown, label: "Lower Priority", color: "text-amber-500" };
    }
    return { icon: Minus, label: "Standard", color: "text-muted-foreground" };
  };

  // Get applicable agents based on script type
  const applicableAgents = useMemo(() => {
    return getAgentsForScriptType(selectedScriptType);
  }, [selectedScriptType]);

  // Filter parameters based on selection (including script type)
  const filteredParameters = useMemo(() => {
    let result = parameters;
    
    // Filter by script type (which agents are applicable)
    if (selectedScriptType !== "all") {
      result = result.filter((p) => applicableAgents.includes(p.agent_source));
    }
    
    if (selectedAgent !== "all") {
      result = result.filter((p) => p.agent_source === selectedAgent);
    }
    if (selectedLens !== "all") {
      const paramIdsWithLens = lensWeights
        .filter((lw) => lw.lens === selectedLens)
        .map((lw) => lw.parameter_id);
      result = result.filter((p) => paramIdsWithLens.includes(p.id));
    }
    return result;
  }, [parameters, selectedAgent, selectedLens, selectedScriptType, lensWeights, applicableAgents]);

  // Filter agents dropdown based on script type
  const filteredAgentsForDropdown = useMemo(() => {
    if (selectedScriptType === "all") {
      return agents;
    }
    return agents.filter((agent) => applicableAgents.includes(agent));
  }, [agents, selectedScriptType, applicableAgents]);

  // Group filtered parameters by category
  const filteredByCategory = useMemo(() => {
    const grouped: Record<string, Parameter[]> = {};
    filteredParameters.forEach((param) => {
      if (!grouped[param.category]) {
        grouped[param.category] = [];
      }
      grouped[param.category].push(param);
    });
    return grouped;
  }, [filteredParameters]);

  const isLoading = loadingParams || loadingWeights;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading parameters and agents...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-1 -ml-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </Link>
                </div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-6 w-6 text-primary" />
                  Parameters & Agents
                  <Badge variant="outline" className="text-xs font-normal">v{CURRENT_PROMPT_VERSION}</Badge>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Universal Script Analysis Framework — {ALL_AGENTS.length} agents across {SCRIPT_TYPES.length} script types
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedScriptType} onValueChange={(value) => {
                    setSelectedScriptType(value);
                    // Reset agent filter if current agent is not applicable
                    if (value !== "all" && selectedAgent !== "all") {
                      const newApplicable = getAgentsForScriptType(value);
                      if (!newApplicable.includes(selectedAgent)) {
                        setSelectedAgent("all");
                      }
                    }
                  }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Script Type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="all">All Script Types</SelectItem>
                    {/* Group script types by category */}
                    {Object.entries(
                      SCRIPT_TYPES.reduce((acc, type) => {
                        if (!acc[type.category]) acc[type.category] = [];
                        acc[type.category].push(type);
                        return acc;
                      }, {} as Record<string, typeof SCRIPT_TYPES>)
                    ).map(([category, types]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t first:border-t-0">
                          {category.replace('_', ' ')}
                        </div>
                        {types.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      {filteredAgentsForDropdown.map((agent) => (
                        <SelectItem key={agent} value={agent}>
                          {agent.replace("Agent", "")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedLens} onValueChange={setSelectedLens}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by Lens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Lenses</SelectItem>
                      {lenses.map((lens) => (
                        <SelectItem key={lens} value={lens}>
                          {LENS_LABELS[lens]?.label || lens}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportParametersToCSV(parameters, lensWeights.map(lw => ({
                    id: lw.id,
                    lens: lw.lens,
                    weight: lw.weight,
                    parameter_id: lw.parameter_id,
                  })))}
                  disabled={isLoading || parameters.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schema">Output Schema</TabsTrigger>
              <TabsTrigger value="agents">By Agent</TabsTrigger>
              <TabsTrigger value="lenses">By Lens</TabsTrigger>
              <TabsTrigger value="matrix">Lens Matrix</TabsTrigger>
            </TabsList>

            {/* Output Schema Tab */}
            <TabsContent value="schema" className="space-y-6">
              <DataFlowDiagram />
              <AgentSectionMapping />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AgentOutputSchema />
                <InsightsSchema />
              </div>
              <SampleAgentOutput />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Active Filter Banner */}
              {(selectedScriptType !== "all" || selectedLens !== "all" || selectedAgent !== "all") && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-medium">Active Filters:</span>
                        {selectedScriptType !== "all" && (
                          <Badge variant="secondary" className="gap-1">
                            <Film className="h-3 w-3" />
                            {SCRIPT_TYPES.find(t => t.value === selectedScriptType)?.label || selectedScriptType}
                          </Badge>
                        )}
                        {selectedAgent !== "all" && (
                          <Badge variant="secondary" className="gap-1">
                            <Bot className="h-3 w-3" />
                            {selectedAgent.replace("Agent", "")}
                          </Badge>
                        )}
                        {selectedLens !== "all" && (
                          <Badge variant="secondary" className="gap-1">
                            <Eye className="h-3 w-3" />
                            {LENS_LABELS[selectedLens]?.label}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedScriptType("all");
                          setSelectedAgent("all");
                          setSelectedLens("all");
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {selectedScriptType !== "all" ? "Applicable Parameters" : "Total Parameters"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{filteredParameters.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedScriptType !== "all" 
                        ? `For ${SCRIPT_TYPES.find(t => t.value === selectedScriptType)?.label || selectedScriptType}`
                        : `Across ${Object.keys(parametersByCategory).length} categories`
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {selectedScriptType !== "all" ? "Active Agents" : "Analysis Agents"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{selectedScriptType === "all" ? ALL_AGENTS.length : applicableAgents.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedScriptType !== "all"
                        ? `Active for ${SCRIPT_TYPES.find(t => t.value === selectedScriptType)?.label || selectedScriptType}`
                        : "Total across all types"
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Stakeholder Lenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{lenses.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unique perspectives for analysis
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Script Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{SCRIPT_TYPES.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Pipeline Visualization */}
              <InteractivePipeline />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agents Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      Analysis Agents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {agents.map((agent) => {
                          // Determine agent category from the agent arrays
                          const isSystemAgent = agent.includes('Normalizer') || agent.includes('Classifier') || agent.includes('Arbitration') || agent.includes('Blending');
                          const isMetaAgent = agent.includes('Evolution') || agent.includes('Feedback') || agent.includes('Explainability') || agent.includes('Investor');
                          const isComicAgent = agent.includes('Comic');
                          const isInteractiveAgent = agent.includes('Interactivity') || agent.includes('WorldBuilding');
                          const isAudioAgent = agent.includes('Audio');
                          
                          const categoryLabel = isSystemAgent ? 'System' 
                            : isMetaAgent ? 'Meta'
                            : isComicAgent ? 'Comic'
                            : isInteractiveAgent ? 'Interactive'
                            : isAudioAgent ? 'Audio'
                            : 'Core';
                          const categoryColor = isSystemAgent ? 'bg-slate-500/10 text-slate-500'
                            : isMetaAgent ? 'bg-amber-500/10 text-amber-500'
                            : isComicAgent ? 'bg-fuchsia-500/10 text-fuchsia-500'
                            : isInteractiveAgent ? 'bg-sky-500/10 text-sky-500'
                            : isAudioAgent ? 'bg-violet-500/10 text-violet-500'
                            : 'bg-emerald-500/10 text-emerald-500';
                          
                          return (
                            <div
                              key={agent}
                              className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn("font-medium", AGENT_COLORS[agent])}
                                  >
                                    {agent.replace("Agent", "")}
                                  </Badge>
                                  <Badge variant="outline" className={cn("text-xs", categoryColor)}>
                                    {categoryLabel}
                                  </Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {parametersByAgent[agent]?.length || 0} parameters
                                </span>
                              </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {parametersByAgent[agent]?.slice(0, 4).map((param) => (
                                <span
                                  key={param.id}
                                  className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                                >
                                  {param.display_name}
                                </span>
                              ))}
                              {(parametersByAgent[agent]?.length || 0) > 4 && (
                                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                  +{(parametersByAgent[agent]?.length || 0) - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Lenses Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Stakeholder Lenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {lenses.map((lens) => {
                          const lensInfo = LENS_LABELS[lens];
                          const lensParams = lensWeights.filter((lw) => lw.lens === lens);
                          const highPriority = lensParams.filter((lw) => lw.weight > 1.05);
                          const lowPriority = lensParams.filter((lw) => lw.weight < 0.95);

                          return (
                            <div
                              key={lens}
                              className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className={cn("font-medium", lensInfo?.color)}
                                >
                                  {lensInfo?.label || lens}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {lensParams.length} weighted params
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {lensInfo?.description}
                              </p>
                              <div className="mt-2 flex items-center gap-4 text-xs">
                                <span className="text-green-500 flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {highPriority.length} prioritized
                                </span>
                                <span className="text-amber-500 flex items-center gap-1">
                                  <TrendingDown className="h-3 w-3" />
                                  {lowPriority.length} de-prioritized
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* By Agent Tab */}
            <TabsContent value="agents" className="space-y-6">
              <Accordion type="multiple" className="space-y-4">
                {agents
                  .filter((agent) => selectedAgent === "all" || agent === selectedAgent)
                  .map((agent) => {
                    // Determine agent category from agent name
                    const isSystemAgent = agent.includes('Normalizer') || agent.includes('Classifier') || agent.includes('Arbitration') || agent.includes('Blending');
                    const isMetaAgent = agent.includes('Evolution') || agent.includes('Feedback') || agent.includes('Explainability') || agent.includes('Investor');
                    const isComicAgent = agent.includes('Comic');
                    const isInteractiveAgent = agent.includes('Interactivity') || agent.includes('WorldBuilding');
                    const isAudioAgent = agent.includes('Audio');
                    
                    const categoryLabel = isSystemAgent ? 'System' 
                      : isMetaAgent ? 'Meta'
                      : isComicAgent ? 'Comic'
                      : isInteractiveAgent ? 'Interactive'
                      : isAudioAgent ? 'Audio'
                      : 'Core';
                    const categoryColor = isSystemAgent ? 'bg-slate-500/10 text-slate-500'
                      : isMetaAgent ? 'bg-amber-500/10 text-amber-500'
                      : isComicAgent ? 'bg-fuchsia-500/10 text-fuchsia-500'
                      : isInteractiveAgent ? 'bg-sky-500/10 text-sky-500'
                      : isAudioAgent ? 'bg-violet-500/10 text-violet-500'
                      : 'bg-emerald-500/10 text-emerald-500';
                    
                    return (
                    <AccordionItem
                      key={agent}
                      value={agent}
                      className="border rounded-lg px-4 bg-card"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={cn("font-medium", AGENT_COLORS[agent])}
                          >
                            <Bot className="h-3 w-3 mr-1" />
                            {agent.replace("Agent", "")}
                          </Badge>
                          <Badge variant="outline" className={cn("text-xs", categoryColor)}>
                            {categoryLabel}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {parametersByAgent[agent]?.length || 0} parameters
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {parametersByAgent[agent]?.map((param) => {
                            const paramLensWeights = getParameterLensWeights(param.id);
                            return (
                              <div
                                key={param.id}
                                className="p-3 rounded-lg border bg-muted/30"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm">
                                      {param.display_name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {param.description || "No description"}
                                    </p>
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="secondary" className="text-xs">
                                        {param.category}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Category</TooltipContent>
                                  </Tooltip>
                                </div>
                                {paramLensWeights.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Lens weights:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {paramLensWeights.map((lw) => {
                                        const indicator = getWeightIndicator(lw.weight);
                                        const Icon = indicator.icon;
                                        return (
                                          <Tooltip key={lw.id}>
                                            <TooltipTrigger>
                                              <span
                                                className={cn(
                                                  "text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5",
                                                  LENS_LABELS[lw.lens]?.color
                                                )}
                                              >
                                                <Icon className={cn("h-2.5 w-2.5", indicator.color)} />
                                                {LENS_LABELS[lw.lens]?.label.split(" ")[0]}
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{LENS_LABELS[lw.lens]?.label}: {lw.weight.toFixed(2)}x</p>
                                              <p className="text-xs text-muted-foreground">
                                                {indicator.label}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    );
                  })}
              </Accordion>
            </TabsContent>

            {/* By Lens Tab */}
            <TabsContent value="lenses" className="space-y-6">
              <Accordion type="multiple" className="space-y-4">
                {lenses
                  .filter((lens) => selectedLens === "all" || lens === selectedLens)
                  .map((lens) => {
                    const lensInfo = LENS_LABELS[lens];
                    const lensParams = lensWeights.filter((lw) => lw.lens === lens);
                    const categorizedParams = lensParams.reduce(
                      (acc, lw) => {
                        if (!acc[lw.category]) acc[lw.category] = [];
                        acc[lw.category].push(lw);
                        return acc;
                      },
                      {} as Record<string, LensWeight[]>
                    );

                    return (
                      <AccordionItem
                        key={lens}
                        value={lens}
                        className="border rounded-lg px-4 bg-card"
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={cn("font-medium", lensInfo?.color)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {lensInfo?.label || lens}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {lensParams.length} weighted parameters
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {lensInfo?.description}
                          </p>
                          <div className="space-y-4">
                            {Object.entries(categorizedParams).map(([category, params]) => (
                              <div key={category}>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Layers className="h-4 w-4 text-muted-foreground" />
                                  {category}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                  {params.map((lw) => {
                                    const indicator = getWeightIndicator(lw.weight);
                                    const Icon = indicator.icon;
                                    return (
                                      <div
                                        key={lw.id}
                                        className="p-2 rounded border bg-muted/30 flex items-center justify-between"
                                      >
                                        <span className="text-sm">{lw.display_name}</span>
                                        <div className="flex items-center gap-1">
                                          <Icon className={cn("h-4 w-4", indicator.color)} />
                                          <span className="text-sm font-medium">
                                            {lw.weight.toFixed(2)}x
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
              </Accordion>
            </TabsContent>

            {/* Matrix Tab */}
            <TabsContent value="matrix" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Lens Weight Matrix
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Compare how different stakeholders weight each parameter category
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full">
                    <div className="min-w-[800px]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Category</th>
                            {lenses.map((lens) => (
                              <th key={lens} className="p-2 text-center">
                                <Badge
                                  variant="outline"
                                  className={cn("font-medium text-xs", LENS_LABELS[lens]?.color)}
                                >
                                  {LENS_LABELS[lens]?.label.split(" ")[0]}
                                </Badge>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(parametersByCategory).map((category) => {
                            const categoryParams = parametersByCategory[category];
                            return (
                              <tr key={category} className="border-b hover:bg-muted/50">
                                <td className="p-2 font-medium">{category}</td>
                                {lenses.map((lens) => {
                                  const weights = lensWeights.filter(
                                    (lw) =>
                                      lw.lens === lens &&
                                      categoryParams.some((p) => p.id === lw.parameter_id)
                                  );
                                  const avgWeight =
                                    weights.length > 0
                                      ? weights.reduce((sum, lw) => sum + lw.weight, 0) /
                                        weights.length
                                      : 1;
                                  const indicator = getWeightIndicator(avgWeight);
                                  const Icon = indicator.icon;

                                  return (
                                    <td key={lens} className="p-2 text-center">
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <div className="flex items-center justify-center gap-1">
                                            <Icon className={cn("h-4 w-4", indicator.color)} />
                                            <span className="font-mono">
                                              {avgWeight.toFixed(2)}
                                            </span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Average weight: {avgWeight.toFixed(3)}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {weights.length} parameters weighted
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Legend */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>High Priority (&gt;1.05x)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-muted-foreground" />
                      <span>Standard (0.95-1.05x)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-amber-500" />
                      <span>Lower Priority (&lt;0.95x)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}
