import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { 
  Bot, 
  ChevronLeft, 
  Save, 
  RotateCcw, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronRight,
  Settings2,
  Sparkles,
  Layers,
  Wand2,
  Cpu,
  RefreshCw,
  AlertCircle,
  CheckCircle2
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
  meta: { label: "Meta", icon: Wand2, color: "bg-amber-500" },
};

export default function AgentConfiguration() {
  const navigate = useNavigate();
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
    meta: true,
  });
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [newParameterInput, setNewParameterInput] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, AgentSyncStatus>>({});

  useEffect(() => {
    const initializeAgents = async () => {
      // Auto-sync framework on mount to ensure agents are up-to-date
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

  // Auto-sync if there are missing agents or framework updates
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
      
      // Cast the data to our interface
      const typedAgents = (data || []) as AgentConfiguration[];
      setAgents(typedAgents);
      
      // Select first agent if none selected
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

  const groupedAgents = agents.reduce((acc, agent) => {
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
      
      // First, save the current version to history before updating
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
        // Continue with save even if history fails
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bot className="h-5 w-5 animate-pulse" />
          <span>Loading agent configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Agent Configuration</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", syncing && "animate-spin")} />
              {syncing ? "Syncing..." : "Sync Framework"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/models")}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Model Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="w-80 border-r bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">Agents</h2>
                <Badge variant="secondary">{agents.length}</Badge>
              </div>

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
                      <Button
                        variant="ghost"
                        className="w-full justify-between px-2 py-1.5 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1 rounded", config.color)}>
                            <Icon className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-medium">{config.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {categoryAgents.length}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 mt-1">
                      {categoryAgents.map((agent) => {
                        const isInFramework = !!AGENT_BY_ID[agent.agent_name];
                        const isInactive = !agent.is_active;
                        
                        return (
                          <Button
                            key={agent.id}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start pl-8 py-1.5 h-auto text-sm gap-2",
                              selectedAgent?.id === agent.id && "bg-accent",
                              isInactive && "opacity-50"
                            )}
                            onClick={() => handleSelectAgent(agent)}
                          >
                            <span className={cn(
                              "truncate flex-1 text-left",
                              isInactive && "line-through"
                            )}>
                              {agent.display_name}
                            </span>
                            {isInactive && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                Inactive
                              </Badge>
                            )}
                            {!isInFramework && agent.is_system && (
                              <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
                            )}
                          </Button>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {editedAgent ? (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
              {/* Agent Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedAgent.display_name}
                      onChange={(e) =>
                        setEditedAgent({ ...editedAgent, display_name: e.target.value })
                      }
                      className="text-2xl font-bold h-auto py-1 px-2"
                    />
                    <Badge className={cn(
                      CATEGORY_CONFIG[editedAgent.category]?.color || "bg-muted",
                      "text-white"
                    )}>
                      {CATEGORY_CONFIG[editedAgent.category]?.label || editedAgent.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    {editedAgent.agent_name}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <AgentVersionHistory
                    agentConfigId={editedAgent.id}
                    currentVersion={editedAgent.version}
                    onRevert={handleRevertToVersion}
                  />
                  <Button
                    variant="outline"
                    onClick={handleRevert}
                    disabled={!hasChanges || saving}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Revert
                  </Button>
                  <Button onClick={() => handleSave()} disabled={!hasChanges || saving}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  {!editedAgent.is_system && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={saving}>
                          <Trash2 className="h-4 w-4" />
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

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                  <CardDescription>What this agent does and its purpose</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editedAgent.description || ""}
                    onChange={(e) =>
                      setEditedAgent({ ...editedAgent, description: e.target.value })
                    }
                    placeholder="Describe what this agent analyzes..."
                    className="min-h-[80px]"
                  />
                </CardContent>
              </Card>

              {/* Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Parameters</CardTitle>
                  <CardDescription>
                    The scoring parameters this agent evaluates ({editedAgent.parameters.length} parameters)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {editedAgent.parameters.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No parameters defined</p>
                    ) : (
                      editedAgent.parameters.map((param) => (
                        <Badge
                          key={param}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {param}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                            onClick={() => handleRemoveParameter(param)}
                          >
                            ×
                          </Button>
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
                    />
                    <Button onClick={handleAddParameter} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Prompt */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">System Prompt</CardTitle>
                      <CardDescription>
                        The instructions sent to the AI model for this agent
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPromptExpanded(!promptExpanded)}
                    >
                      {promptExpanded ? "Collapse" : "Expand"}
                      {promptExpanded ? (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-1" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editedAgent.system_prompt}
                    onChange={(e) =>
                      setEditedAgent({ ...editedAgent, system_prompt: e.target.value })
                    }
                    className={cn(
                      "font-mono text-sm transition-all",
                      promptExpanded ? "min-h-[500px]" : "min-h-[150px]"
                    )}
                    placeholder="Enter the system prompt for this agent..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {editedAgent.system_prompt.length} characters • Version {editedAgent.version}
                  </p>
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Metadata & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Agent Active</p>
                      <p className="text-xs text-muted-foreground">
                        Inactive agents are skipped during analysis
                      </p>
                    </div>
                    <Switch
                      checked={editedAgent.is_active}
                      onCheckedChange={(checked) =>
                        setEditedAgent({ ...editedAgent, is_active: checked })
                      }
                    />
                  </div>

                  {/* Framework Status */}
                  {(() => {
                    const isInFramework = !!AGENT_BY_ID[editedAgent.agent_name];
                    return (
                      <div className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border",
                        isInFramework ? "bg-green-500/10 border-green-500/30" : "bg-amber-500/10 border-amber-500/30"
                      )}>
                        {isInFramework ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm">In USAF Framework</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm">Legacy agent (not in current framework)</span>
                          </>
                        )}
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{new Date(editedAgent.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p>{new Date(editedAgent.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">System Agent</p>
                      <p>{editedAgent.is_system ? "Yes" : "No (Custom)"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Version</p>
                      <p>{editedAgent.version}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an agent to view its configuration</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
