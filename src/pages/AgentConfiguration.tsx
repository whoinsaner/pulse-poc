import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  Bot, 
  Save, 
  RotateCcw, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Wand2,
  Cpu,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AgentVersionHistory } from "@/components/AgentVersionHistory";
import { syncAgentsFromFramework, getAgentSyncStatus, AgentSyncStatus } from "@/lib/agentSync";
import { ALL_AGENTS, AGENT_BY_ID } from "@/lib/scriptFramework";

interface AgentConfiguration {
  id: string;
  organization_id: string | null;
  agent_name: string;
  display_name: string;
  category: string;
  description: string | null;
  parameters: string[];
  system_prompt: string;
  is_system: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  system: { label: "System", icon: Cpu, color: "bg-slate-500" },
  analysis: { label: "Analysis", icon: Sparkles, color: "bg-primary" },
  comic: { label: "Comic", icon: Layers, color: "bg-purple-500" },
  enrichment: { label: "Enrichment", icon: Search, color: "bg-cyan-500" },
  production: { label: "Production", icon: Cpu, color: "bg-orange-500" },
  meta: { label: "Meta", icon: Wand2, color: "bg-amber-500" },
};

export default function AgentConfiguration() {
  const { user, profile } = useAuth();
  const [agents, setAgents] = useState<AgentConfiguration[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfiguration | null>(null);
  const [editedAgent, setEditedAgent] = useState<AgentConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    system: true,
    analysis: true,
    comic: true,
    enrichment: true,
    production: true,
    meta: true,
  });
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [newParameterInput, setNewParameterInput] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, AgentSyncStatus>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initializeAgents = async () => {
      await autoSyncIfNeeded();
      await fetchAgents();
      await fetchSyncStatus();
    };
    initializeAgents();
  }, [profile?.current_organization_id]);

  const fetchSyncStatus = async () => {
    const status = await getAgentSyncStatus();
    setSyncStatus(status);
  };

  const autoSyncIfNeeded = async () => {
    try {
      const status = await getAgentSyncStatus();
      const missingAgents = ALL_AGENTS.filter(agent => !status[agent.id]?.inDatabase);
      
      if (missingAgents.length > 0) {
        console.log(`[AgentSync] Auto-syncing ${missingAgents.length} missing agents...`);
        setSyncing(true);
        const result = await syncAgentsFromFramework();
        if (result.success && result.seeded.length > 0) {
          toast.success(`Auto-synced ${result.seeded.length} new agents from framework`);
        }
        setSyncing(false);
      }
    } catch (error) {
      console.error("[AgentSync] Auto-sync error:", error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncAgentsFromFramework();
      if (result.success) {
        const messages: string[] = [];
        if (result.seeded.length > 0) {
          messages.push(`Seeded ${result.seeded.length} new agents`);
        }
        if (result.updated.length > 0) {
          messages.push(`Updated ${result.updated.length} agents`);
        }
        if (messages.length === 0) {
          toast.success("All agents are in sync");
        } else {
          toast.success(messages.join(", "));
        }
        await fetchAgents();
        await fetchSyncStatus();
      } else {
        toast.error(`Sync completed with errors: ${result.errors.join(", ")}`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync agents");
    } finally {
      setSyncing(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("agent_configurations")
        .select("*")
        .order("category", { ascending: true })
        .order("agent_name", { ascending: true });

      if (error) throw error;
      
      const typedAgents = (data || []) as AgentConfiguration[];
      setAgents(typedAgents);
      
      if (!selectedAgent && typedAgents.length > 0) {
        setSelectedAgent(typedAgents[0]);
        setEditedAgent(typedAgents[0]);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load agent configurations");
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    searchQuery === "" ||
    agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agent_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedAgents = filteredAgents.reduce((acc, agent) => {
    const category = agent.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(agent);
    return acc;
  }, {} as Record<string, AgentConfiguration[]>);

  const handleSelectAgent = (agent: AgentConfiguration) => {
    setSelectedAgent(agent);
    setEditedAgent({ ...agent });
    setPromptExpanded(false);
  };

  const handleSave = async (changeSummary?: string) => {
    if (!editedAgent || !user) return;
    try {
      setSaving(true);
      
      const { error: historyError } = await supabase
        .from("agent_prompt_versions")
        .insert({
          agent_config_id: editedAgent.id,
          version_number: editedAgent.version + 1,
          display_name: editedAgent.display_name,
          description: editedAgent.description,
          parameters: editedAgent.parameters,
          system_prompt: editedAgent.system_prompt,
          created_by: user.id,
          change_summary: changeSummary || null,
        });

      if (historyError) {
        console.error("Error saving version history:", historyError);
      }
      
      const { error } = await supabase
        .from("agent_configurations")
        .update({
          display_name: editedAgent.display_name,
          description: editedAgent.description,
          parameters: editedAgent.parameters,
          system_prompt: editedAgent.system_prompt,
          is_active: editedAgent.is_active,
          version: editedAgent.version + 1,
        })
        .eq("id", editedAgent.id);

      if (error) throw error;

      toast.success("Agent configuration saved");
      await fetchAgents();
    } catch (error) {
      console.error("Error saving agent:", error);
      toast.error("Failed to save agent configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleRevertToVersion = (version: {
    display_name: string;
    description: string | null;
    parameters: string[];
    system_prompt: string;
  }) => {
    if (!editedAgent) return;
    setEditedAgent({
      ...editedAgent,
      display_name: version.display_name,
      description: version.description,
      parameters: version.parameters,
      system_prompt: version.system_prompt,
    });
  };

  const handleRevert = () => {
    if (selectedAgent) {
      setEditedAgent({ ...selectedAgent });
    }
  };

  const handleClone = async () => {
    if (!selectedAgent || !profile?.current_organization_id) return;

    try {
      setSaving(true);
      const clonedAgent = {
        organization_id: profile.current_organization_id,
        agent_name: `${selectedAgent.agent_name}_custom`,
        display_name: `${selectedAgent.display_name} (Custom)`,
        category: selectedAgent.category,
        description: selectedAgent.description,
        parameters: selectedAgent.parameters,
        system_prompt: selectedAgent.system_prompt,
        is_system: false,
        is_active: true,
        version: 1,
      };

      const { data, error } = await supabase
        .from("agent_configurations")
        .insert(clonedAgent)
        .select()
        .single();

      if (error) throw error;

      toast.success("Agent cloned successfully");
      await fetchAgents();
      if (data) {
        setSelectedAgent(data as AgentConfiguration);
        setEditedAgent(data as AgentConfiguration);
      }
    } catch (error: any) {
      console.error("Error cloning agent:", error);
      if (error.code === "23505") {
        toast.error("A custom version of this agent already exists");
      } else {
        toast.error("Failed to clone agent");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAgent || selectedAgent.is_system) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("agent_configurations")
        .delete()
        .eq("id", selectedAgent.id);

      if (error) throw error;

      toast.success("Agent deleted");
      setSelectedAgent(null);
      setEditedAgent(null);
      await fetchAgents();
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete agent");
    } finally {
      setSaving(false);
    }
  };

  const handleAddParameter = () => {
    if (!editedAgent || !newParameterInput.trim()) return;
    const paramName = newParameterInput.trim().toLowerCase().replace(/\s+/g, "_");
    if (editedAgent.parameters.includes(paramName)) {
      toast.error("Parameter already exists");
      return;
    }
    setEditedAgent({
      ...editedAgent,
      parameters: [...editedAgent.parameters, paramName],
    });
    setNewParameterInput("");
  };

  const handleRemoveParameter = (param: string) => {
    if (!editedAgent) return;
    setEditedAgent({
      ...editedAgent,
      parameters: editedAgent.parameters.filter((p) => p !== param),
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const hasChanges = editedAgent && selectedAgent && 
    JSON.stringify(editedAgent) !== JSON.stringify(selectedAgent);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bot className="h-5 w-5 animate-pulse" />
          <span>Loading agent configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-border bg-card/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Agent Prompts</h2>
            <p className="text-sm text-muted-foreground">
              Configure AI agent behaviors, system prompts, and parameter assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", syncing && "animate-spin")} />
              Sync Framework
            </Button>
            <Badge variant="secondary" className="tabular-nums">
              {agents.length} agents
            </Badge>
          </div>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Agent List Panel */}
        <div className="w-72 border-r border-border flex flex-col bg-muted/20">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {Object.entries(groupedAgents).map(([category, categoryAgents]) => {
                const config = CATEGORY_CONFIG[category] || { 
                  label: category, 
                  icon: Bot, 
                  color: "bg-muted" 
                };
                const Icon = config.icon;
                const isExpanded = expandedCategories[category];

                return (
                  <Collapsible key={category} open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                    <CollapsibleTrigger asChild>
                      <button
                        className="flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("p-0.5 rounded", config.color)}>
                            <Icon className="h-3 w-3 text-white" />
                          </div>
                          <span className="font-medium text-foreground">{config.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {categoryAgents.length}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-0.5 mt-0.5">
                      {categoryAgents.map((agent) => {
                        const isInFramework = !!AGENT_BY_ID[agent.agent_name];
                        const isInactive = !agent.is_active;
                        const isSelected = selectedAgent?.id === agent.id;
                        
                        return (
                          <button
                            key={agent.id}
                            className={cn(
                              "w-full text-left pl-7 pr-2 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5",
                              isSelected
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              isInactive && "opacity-50"
                            )}
                            onClick={() => handleSelectAgent(agent)}
                          >
                            <span className={cn(
                              "truncate flex-1",
                              isInactive && "line-through"
                            )}>
                              {agent.display_name}
                            </span>
                            {isInactive && (
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">off</span>
                            )}
                            {!isInFramework && agent.is_system && (
                              <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}

              {Object.keys(groupedAgents).length === 0 && searchQuery && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No agents match "{searchQuery}"
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 min-w-0 overflow-auto">
          {editedAgent ? (
            <div className="p-6 max-w-3xl space-y-5">
              {/* Agent Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <Input
                    value={editedAgent.display_name}
                    onChange={(e) =>
                      setEditedAgent({ ...editedAgent, display_name: e.target.value })
                    }
                    className="text-lg font-semibold h-auto py-1 px-2 border-transparent hover:border-border focus:border-border transition-colors"
                  />
                  <div className="flex items-center gap-2 px-2">
                    <code className="text-xs text-muted-foreground font-mono">
                      {editedAgent.agent_name}
                    </code>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      CATEGORY_CONFIG[editedAgent.category]?.color || "bg-muted",
                      "text-white border-transparent"
                    )}>
                      {CATEGORY_CONFIG[editedAgent.category]?.label || editedAgent.category}
                    </Badge>
                    {editedAgent.agent_name === 'GlobalInstructions' && (
                      <Badge variant="default" className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white border-transparent">
                        Master Prompt
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      v{editedAgent.version}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <AgentVersionHistory
                    agentConfigId={editedAgent.id}
                    currentVersion={editedAgent.version}
                    onRevert={handleRevertToVersion}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRevert}
                    disabled={!hasChanges || saving}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" onClick={() => handleSave()} disabled={!hasChanges || saving}>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save
                  </Button>
                  {!editedAgent.is_system && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={saving}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this custom agent? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              <Separator />

              {/* Active Toggle + Framework Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
                  <Switch
                    checked={editedAgent.is_active}
                    onCheckedChange={(checked) =>
                      setEditedAgent({ ...editedAgent, is_active: checked })
                    }
                  />
                  <span className="text-sm">{editedAgent.is_active ? "Active" : "Inactive"}</span>
                </div>
                {(() => {
                  const isInFramework = !!AGENT_BY_ID[editedAgent.agent_name];
                  return (
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm",
                      isInFramework ? "border-green-500/30 text-green-600 dark:text-green-400" : "border-amber-500/30 text-amber-600 dark:text-amber-400"
                    )}>
                      {isInFramework ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> In Framework</>
                      ) : (
                        <><AlertCircle className="h-3.5 w-3.5" /> Legacy</>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editedAgent.description || ""}
                  onChange={(e) =>
                    setEditedAgent({ ...editedAgent, description: e.target.value })
                  }
                  placeholder="Describe what this agent analyzes..."
                  className="min-h-[60px] resize-none"
                />
              </div>

              {/* Parameters */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Parameters
                    <span className="text-muted-foreground font-normal ml-1.5">
                      ({editedAgent.parameters.length})
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editedAgent.parameters.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No parameters defined</p>
                  ) : (
                    editedAgent.parameters.map((param) => (
                      <Badge
                        key={param}
                        variant="secondary"
                        className="gap-1 pr-1 text-xs"
                      >
                        {param}
                        <button
                          className="ml-0.5 h-3.5 w-3.5 inline-flex items-center justify-center rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          onClick={() => handleRemoveParameter(param)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add parameter (e.g., pacing_quality)"
                    value={newParameterInput}
                    onChange={(e) => setNewParameterInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddParameter();
                      }
                    }}
                    className="h-8 text-sm"
                  />
                  <Button onClick={handleAddParameter} size="sm" variant="outline" className="h-8 px-2">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">System Prompt</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setPromptExpanded(!promptExpanded)}
                  >
                    {promptExpanded ? "Collapse" : "Expand"}
                    {promptExpanded ? (
                      <ChevronDown className="h-3 w-3 ml-1" />
                    ) : (
                      <ChevronRight className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                </div>
                <Textarea
                  value={editedAgent.system_prompt}
                  onChange={(e) =>
                    setEditedAgent({ ...editedAgent, system_prompt: e.target.value })
                  }
                  className={cn(
                    "font-mono text-xs leading-relaxed transition-all resize-none",
                    promptExpanded ? "min-h-[500px]" : "min-h-[120px]"
                  )}
                  placeholder="Enter the system prompt for this agent..."
                />
                <p className="text-[11px] text-muted-foreground">
                  {editedAgent.system_prompt.length} characters
                </p>
              </div>

              {/* Metadata footer */}
              <Separator />
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span>Created {new Date(editedAgent.created_at).toLocaleDateString()}</span>
                <span>Updated {new Date(editedAgent.updated_at).toLocaleDateString()}</span>
                <span>{editedAgent.is_system ? "System" : "Custom"}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select an agent to configure</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
