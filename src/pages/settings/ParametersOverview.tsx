import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  TrendingUp,
  TrendingDown,
  Minus,
  Film,
  Download,
  CheckCircle2,
  AlertCircle,
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
import { InteractivePipeline } from "@/components/parameters/InteractivePipeline";
import {
  SCRIPT_TYPES,
  ALL_AGENTS,
  getAnalysisAgentsForScriptType,
  CURRENT_PROMPT_VERSION,
} from "@/lib/scriptFramework";
import {
  ALL_FRAMEWORK_PARAMETERS,
  getParameterSyncStatus,
  ParameterSyncStatus,
} from "@/lib/parameterSync";
import { toast } from "sonner";

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

const LENS_LABELS: Record<string, { label: string; description: string }> = {
  studio_executive: { label: "Studio Executive", description: "Focus on commercial viability and audience appeal" },
  producer: { label: "Producer", description: "Balance of creative vision and practical execution" },
  actor: { label: "Actor", description: "Character depth and performative opportunities" },
  director: { label: "Director", description: "Visual storytelling and creative control" },
  writer: { label: "Writer", description: "Narrative craft and thematic resonance" },
  financier: { label: "Financier", description: "ROI potential and risk assessment" },
  investor: { label: "Investor", description: "Market clarity, budget realism, platform fit, franchise scalability" },
  ott_platform: { label: "OTT Platform", description: "Streaming metrics and binge-worthiness" },
  theatrical: { label: "Theatrical", description: "Big-screen impact and theatrical experience" },
};

function getAgentsForScriptType(scriptType: string): string[] {
  return getAnalysisAgentsForScriptType(scriptType).map(a => a.id);
}

const getWeightIndicator = (weight: number) => {
  if (weight > 1.05) return { icon: TrendingUp, label: "High Priority", color: "text-green-500" };
  if (weight < 0.95) return { icon: TrendingDown, label: "Lower Priority", color: "text-amber-500" };
  return { icon: Minus, label: "Standard", color: "text-muted-foreground" };
};

export default function ParametersOverview() {
  const [selectedLens, setSelectedLens] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedScriptType, setSelectedScriptType] = useState<string>("all");
  const [syncStatus, setSyncStatus] = useState<Record<string, ParameterSyncStatus>>({});
  const [syncChecked, setSyncChecked] = useState(false);

  useEffect(() => {
    const checkSync = async () => {
      try {
        const status = await getParameterSyncStatus();
        setSyncStatus(status);
      } catch (error) {
        console.error("[ParameterSync] Error checking sync status:", error);
      } finally {
        setSyncChecked(true);
      }
    };
    checkSync();
  }, []);

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
        .select(`id, lens, weight, parameter_id, parameters!inner (name, display_name, category)`)
        .order("lens", { ascending: true });
      if (error) throw error;
      return data.map((lw: any) => ({
        id: lw.id, lens: lw.lens, weight: lw.weight, parameter_id: lw.parameter_id,
        parameter_name: lw.parameters.name, display_name: lw.parameters.display_name, category: lw.parameters.category,
      })) as LensWeight[];
    },
  });

  const parametersByAgent = useMemo(() => {
    const grouped: Record<string, Parameter[]> = {};
    parameters.forEach((param) => {
      if (!grouped[param.agent_source]) grouped[param.agent_source] = [];
      grouped[param.agent_source].push(param);
    });
    return grouped;
  }, [parameters]);

  const agents = useMemo(() => [...new Set(parameters.map((p) => p.agent_source))].sort(), [parameters]);
  const lenses = useMemo(() => [...new Set(lensWeights.map((lw) => lw.lens))].sort(), [lensWeights]);

  const applicableAgents = useMemo(() => getAgentsForScriptType(selectedScriptType), [selectedScriptType]);

  const filteredParameters = useMemo(() => {
    let result = parameters;
    if (selectedScriptType !== "all") result = result.filter((p) => applicableAgents.includes(p.agent_source));
    if (selectedAgent !== "all") result = result.filter((p) => p.agent_source === selectedAgent);
    if (selectedLens !== "all") {
      const paramIdsWithLens = lensWeights.filter((lw) => lw.lens === selectedLens).map((lw) => lw.parameter_id);
      result = result.filter((p) => paramIdsWithLens.includes(p.id));
    }
    return result;
  }, [parameters, selectedAgent, selectedLens, selectedScriptType, lensWeights, applicableAgents]);

  const filteredAgentsForDropdown = useMemo(() => {
    if (selectedScriptType === "all") return agents;
    return agents.filter((agent) => applicableAgents.includes(agent));
  }, [agents, selectedScriptType, applicableAgents]);

  const getParameterLensWeights = (parameterId: string) => lensWeights.filter((lw) => lw.parameter_id === parameterId);

  const isLoading = loadingParams || loadingWeights;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading parameters...</div>
      </div>
    );
  }

  const getCategoryInfo = (agent: string) => {
    const isSystem = agent.includes('Normalizer') || agent.includes('Classifier') || agent.includes('Arbitration') || agent.includes('Blending');
    const isMeta = agent.includes('Evolution') || agent.includes('Feedback') || agent.includes('Explainability') || agent.includes('Investor');
    const isComic = agent.includes('Comic');
    const label = isSystem ? 'System' : isMeta ? 'Meta' : isComic ? 'Comic' : 'Core';
    const color = isSystem ? 'bg-slate-500/10 text-slate-500' : isMeta ? 'bg-amber-500/10 text-amber-500' : isComic ? 'bg-fuchsia-500/10 text-fuchsia-500' : 'bg-emerald-500/10 text-emerald-500';
    return { label, color };
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Page Header */}
        <div className="px-6 py-5 border-b border-border bg-card/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Parameters & Agents</h2>
                <Badge variant="outline" className="text-xs">v{CURRENT_PROMPT_VERSION}</Badge>
                {syncChecked && (
                  <Tooltip>
                    <TooltipTrigger>
                      {Object.values(syncStatus).filter(s => !s.inDatabase).length === 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {Object.values(syncStatus).filter(s => !s.inDatabase).length === 0
                        ? "All framework parameters synced"
                        : `${Object.values(syncStatus).filter(s => !s.inDatabase).length} parameters missing`
                      }
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {ALL_AGENTS.length} agents, {ALL_FRAMEWORK_PARAMETERS.length} parameters across {SCRIPT_TYPES.length} script types
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportParametersToCSV(parameters, lensWeights.map(lw => ({
                  id: lw.id, lens: lw.lens, weight: lw.weight, parameter_id: lw.parameter_id,
                })))}
                disabled={parameters.length === 0}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Select value={selectedScriptType} onValueChange={(value) => {
              setSelectedScriptType(value);
              if (value !== "all" && selectedAgent !== "all") {
                const newApplicable = getAgentsForScriptType(value);
                if (!newApplicable.includes(selectedAgent)) setSelectedAgent("all");
              }
            }}>
              <SelectTrigger className="w-[180px] h-8 text-sm">
                <Film className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Script Type" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="all">All Script Types</SelectItem>
                {SCRIPT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <Bot className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {filteredAgentsForDropdown.map((agent) => (
                  <SelectItem key={agent} value={agent}>{agent.replace("Agent", "")}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLens} onValueChange={setSelectedLens}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <Eye className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Lens" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lenses</SelectItem>
                {lenses.map((lens) => (
                  <SelectItem key={lens} value={lens}>{LENS_LABELS[lens]?.label || lens}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedScriptType !== "all" || selectedLens !== "all" || selectedAgent !== "all") && (
              <Button variant="ghost" size="sm" className="h-8 text-xs"
                onClick={() => { setSelectedScriptType("all"); setSelectedAgent("all"); setSelectedLens("all"); }}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs defaultValue="overview" className="space-y-5">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="agents">By Agent</TabsTrigger>
                <TabsTrigger value="lenses">By Lens</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <p className="text-xs text-muted-foreground">{selectedScriptType !== "all" ? "Applicable" : "Total"} Parameters</p>
                      <p className="text-2xl font-bold mt-1">{filteredParameters.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <p className="text-xs text-muted-foreground">{selectedScriptType !== "all" ? "Active" : "Total"} Agents</p>
                      <p className="text-2xl font-bold mt-1">{selectedScriptType === "all" ? ALL_AGENTS.length : applicableAgents.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <p className="text-xs text-muted-foreground">Stakeholder Lenses</p>
                      <p className="text-2xl font-bold mt-1">{lenses.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <p className="text-xs text-muted-foreground">Script Types</p>
                      <p className="text-2xl font-bold mt-1">{SCRIPT_TYPES.length}</p>
                    </CardContent>
                  </Card>
                </div>

                <InteractivePipeline />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Agents Overview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        Analysis Agents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[350px] pr-4">
                        <div className="space-y-2">
                          {agents.map((agent) => {
                            const catInfo = getCategoryInfo(agent);
                            return (
                              <div key={agent} className="p-2.5 rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium">{agent.replace("Agent", "")}</span>
                                    <Badge variant="outline" className={cn("text-[10px]", catInfo.color)}>{catInfo.label}</Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{parametersByAgent[agent]?.length || 0} params</span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {parametersByAgent[agent]?.slice(0, 3).map((param) => (
                                    <span key={param.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{param.display_name}</span>
                                  ))}
                                  {(parametersByAgent[agent]?.length || 0) > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{(parametersByAgent[agent]?.length || 0) - 3}</span>
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
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Stakeholder Lenses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[350px] pr-4">
                        <div className="space-y-2">
                          {lenses.map((lens) => {
                            const lensInfo = LENS_LABELS[lens];
                            const lensParams = lensWeights.filter((lw) => lw.lens === lens);
                            const highPriority = lensParams.filter((lw) => lw.weight > 1.05);
                            const lowPriority = lensParams.filter((lw) => lw.weight < 0.95);
                            return (
                              <div key={lens} className="p-2.5 rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{lensInfo?.label || lens}</span>
                                  <span className="text-xs text-muted-foreground">{lensParams.length} params</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{lensInfo?.description}</p>
                                <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                                  <span className="text-green-500 flex items-center gap-0.5">
                                    <TrendingUp className="h-3 w-3" /> {highPriority.length} prioritized
                                  </span>
                                  <span className="text-amber-500 flex items-center gap-0.5">
                                    <TrendingDown className="h-3 w-3" /> {lowPriority.length} de-prioritized
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

              {/* By Agent */}
              <TabsContent value="agents" className="space-y-4">
                <Accordion type="multiple" className="space-y-2">
                  {agents
                    .filter((agent) => selectedAgent === "all" || agent === selectedAgent)
                    .map((agent) => {
                      const catInfo = getCategoryInfo(agent);
                      return (
                        <AccordionItem key={agent} value={agent} className="border rounded-lg px-4 bg-card">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2">
                              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{agent.replace("Agent", "")}</span>
                              <Badge variant="outline" className={cn("text-[10px]", catInfo.color)}>{catInfo.label}</Badge>
                              <span className="text-xs text-muted-foreground">{parametersByAgent[agent]?.length || 0} parameters</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 pb-2">
                              {parametersByAgent[agent]?.map((param) => {
                                const paramLW = getParameterLensWeights(param.id);
                                return (
                                  <div key={param.id} className="p-2.5 rounded-lg border bg-muted/30">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium text-sm">{param.display_name}</h4>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">{param.description || "No description"}</p>
                                      </div>
                                      <Badge variant="secondary" className="text-[10px] shrink-0">{param.category}</Badge>
                                    </div>
                                    {paramLW.length > 0 && (
                                      <div className="mt-2 pt-2 border-t flex flex-wrap gap-1">
                                        {paramLW.map((lw) => {
                                          const ind = getWeightIndicator(lw.weight);
                                          const Icon = ind.icon;
                                          return (
                                            <Tooltip key={lw.id}>
                                              <TooltipTrigger>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded border bg-background flex items-center gap-0.5">
                                                  <Icon className={cn("h-2.5 w-2.5", ind.color)} />
                                                  {LENS_LABELS[lw.lens]?.label.split(" ")[0]}
                                                </span>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>{LENS_LABELS[lw.lens]?.label}: {lw.weight.toFixed(2)}x</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          );
                                        })}
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

              {/* By Lens */}
              <TabsContent value="lenses" className="space-y-4">
                <Accordion type="multiple" className="space-y-2">
                  {lenses
                    .filter((lens) => selectedLens === "all" || lens === selectedLens)
                    .map((lens) => {
                      const lensInfo = LENS_LABELS[lens];
                      const lensParams = lensWeights.filter((lw) => lw.lens === lens);
                      const categorizedParams = lensParams.reduce((acc, lw) => {
                        if (!acc[lw.category]) acc[lw.category] = [];
                        acc[lw.category].push(lw);
                        return acc;
                      }, {} as Record<string, LensWeight[]>);

                      return (
                        <AccordionItem key={lens} value={lens} className="border rounded-lg px-4 bg-card">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{lensInfo?.label || lens}</span>
                              <span className="text-xs text-muted-foreground">{lensParams.length} weighted parameters</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-xs text-muted-foreground mb-3">{lensInfo?.description}</p>
                            <div className="space-y-3">
                              {Object.entries(categorizedParams).map(([category, params]) => (
                                <div key={category}>
                                  <h4 className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                                    <Layers className="h-3 w-3 text-muted-foreground" /> {category}
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                                    {params.map((lw) => {
                                      const ind = getWeightIndicator(lw.weight);
                                      const Icon = ind.icon;
                                      return (
                                        <div key={lw.id} className="p-2 rounded border bg-muted/30 flex items-center justify-between">
                                          <span className="text-sm">{lw.display_name}</span>
                                          <div className="flex items-center gap-1">
                                            <Icon className={cn("h-3.5 w-3.5", ind.color)} />
                                            <span className="text-sm font-mono">{lw.weight.toFixed(2)}x</span>
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
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
