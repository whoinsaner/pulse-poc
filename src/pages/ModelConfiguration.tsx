import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Cpu,
  Settings,
  Plus,
  Save,
  Trash2,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  Lock,
  Edit2,
  Bot,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelConfiguration {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_default: boolean;
  organization_id: string | null;
  created_at: string;
}

interface AgentMapping {
  id: string;
  agent_name: string;
  model: string;
  temperature: number | null;
  config_id: string | null;
}

interface AgentConfig {
  agent_name: string;
  display_name: string;
  category: string;
  is_active: boolean;
}

interface AuditLogEntry {
  id: string;
  config_id: string;
  changed_by: string;
  change_type: string;
  agent_name: string | null;
  old_value: any;
  new_value: any;
  summary: string | null;
  created_at: string;
}

const AVAILABLE_MODELS = [
  // Premium tier - best reasoning and capability
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'premium', description: 'Top-tier reasoning, multimodal' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', tier: 'premium', description: 'Next-gen Pro model' },
  { id: 'openai/gpt-5', name: 'GPT-5', tier: 'premium', description: 'Powerful reasoning, multimodal' },
  { id: 'openai/gpt-5.2', name: 'GPT-5.2', tier: 'premium', description: 'Latest OpenAI model' },
  // Standard tier - balanced speed and capability
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'standard', description: 'Balanced speed and quality' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', tier: 'standard', description: 'Fast next-gen model' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', tier: 'standard', description: 'Fast with strong reasoning' },
  // Economy tier - fastest and cheapest
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', tier: 'economy', description: 'Fastest, most economical' },
  { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', tier: 'economy', description: 'Speed optimized' },
];

// Agent categories for grouping in the UI
const AGENT_CATEGORY_ORDER = ['system', 'analysis', 'comic', 'meta', 'enrichment', 'production', 'micro_drama', 'web_series', 'audio'];

export default function ModelConfiguration() {
  const navigate = useNavigate();
  const { user, currentOrganization, userRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [configurations, setConfigurations] = useState<ModelConfiguration[]>([]);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const [mappings, setMappings] = useState<AgentMapping[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ModelConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewConfigDialog, setShowNewConfigDialog] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [newConfigDescription, setNewConfigDescription] = useState('');
  const [copyFromSystem, setCopyFromSystem] = useState(true);
  const [editedMappings, setEditedMappings] = useState<Record<string, { model: string; temperature: number }>>({});
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [showAuditLog, setShowAuditLog] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && userRole !== 'admin') {
      navigate('/dashboard');
      toast({
        title: 'Access Denied',
        description: 'Only admins can access model configuration.',
        variant: 'destructive',
      });
    }
  }, [user, authLoading, userRole, navigate, toast]);

  useEffect(() => {
    if (currentOrganization) {
      fetchConfigurations();
    }
  }, [currentOrganization]);

  const fetchConfigurations = async () => {
    setLoading(true);
    try {
      // Fetch agent configs from DB
      const { data: agents, error: agentError } = await supabase
        .from('agent_configurations')
        .select('agent_name, display_name, category, is_active')
        .eq('is_system', true)
        .order('category')
        .order('display_name');

      if (agentError) throw agentError;
      setAgentConfigs((agents || []) as AgentConfig[]);

      const { data: configs, error: configError } = await supabase
        .from('model_configurations')
        .select('*')
        .or(`is_system.eq.true,organization_id.eq.${currentOrganization?.id}`)
        .order('is_system', { ascending: false });

      if (configError) throw configError;
      // Filter out legacy "fast" and "balanced" system presets, keep only "quality"
      const filteredConfigs = (configs || []).filter(c => 
        !c.is_system || c.name === 'quality'
      );
      setConfigurations(filteredConfigs);

      if (filteredConfigs.length > 0) {
        const defaultConfig = filteredConfigs.find(c => c.is_default) || filteredConfigs[0];
        setSelectedConfig(defaultConfig);
        await fetchMappings(defaultConfig.id, (agents || []) as AgentConfig[]);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load configurations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMappings = async (configId: string, agents?: AgentConfig[]) => {
    const agentList = agents || agentConfigs;
    try {
      const { data, error } = await supabase
        .from('agent_model_mappings')
        .select('*')
        .eq('config_id', configId);

      if (error) throw error;
      setMappings(data || []);

      // Initialize edited mappings from all known agents
      const edited: Record<string, { model: string; temperature: number }> = {};
      // Include agents from DB
      agentList.forEach(agent => {
        const existing = data?.find(m => m.agent_name === agent.agent_name);
        edited[agent.agent_name] = {
          model: existing?.model || 'google/gemini-3-flash-preview',
          temperature: existing?.temperature ?? 0.7,
        };
      });
      // Also include any mappings that exist in DB but aren't in agent_configurations
      data?.forEach(m => {
        if (!edited[m.agent_name]) {
          edited[m.agent_name] = {
            model: m.model,
            temperature: m.temperature ?? 0.7,
          };
        }
      });
      setEditedMappings(edited);
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
  };

  const fetchAuditLog = async (configId: string) => {
    try {
      const { data, error } = await supabase
        .from('model_config_audit_log')
        .select('*')
        .eq('config_id', configId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error) setAuditLog(data || []);
    } catch (err) {
      console.error('Error fetching audit log:', err);
    }
  };

  const handleSelectConfig = async (config: ModelConfiguration) => {
    setSelectedConfig(config);
    await fetchMappings(config.id, agentConfigs);
    if (showAuditLog) await fetchAuditLog(config.id);
  };

  const handleCreateConfig = async () => {
    if (!newConfigName.trim() || !currentOrganization) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('model_configurations')
        .insert({
          name: newConfigName.trim(),
          description: newConfigDescription.trim() || null,
          organization_id: currentOrganization.id,
          is_system: false,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      setConfigurations([...configurations, data]);
      setSelectedConfig(data);
      setShowNewConfigDialog(false);
      setNewConfigName('');
      setNewConfigDescription('');
      setCopyFromSystem(true);

      // Build initial mappings - either copy from system quality config or use defaults
      let defaultMappings: Array<{ agent_name: string; model: string; temperature: number; config_id: string }>;

      if (copyFromSystem) {
        const systemConfig = configurations.find(c => c.is_system && c.name === 'quality');
        if (systemConfig) {
          const { data: systemMappings } = await supabase
            .from('agent_model_mappings')
            .select('agent_name, model, temperature')
            .eq('config_id', systemConfig.id);

          if (systemMappings && systemMappings.length > 0) {
            defaultMappings = systemMappings.map(m => ({
              agent_name: m.agent_name,
              model: m.model,
              temperature: m.temperature ?? 0.7,
              config_id: data.id,
            }));
          } else {
            defaultMappings = agentConfigs.map(agent => ({
              agent_name: agent.agent_name,
              model: 'google/gemini-3-flash-preview',
              temperature: 0.7,
              config_id: data.id,
            }));
          }
        } else {
          defaultMappings = agentConfigs.map(agent => ({
            agent_name: agent.agent_name,
            model: 'google/gemini-3-flash-preview',
            temperature: 0.7,
            config_id: data.id,
          }));
        }
      } else {
        defaultMappings = agentConfigs.map(agent => ({
          agent_name: agent.agent_name,
          model: 'google/gemini-3-flash-preview',
          temperature: 0.7,
          config_id: data.id,
        }));
      }

      await supabase.from('agent_model_mappings').insert(defaultMappings);
      await fetchMappings(data.id, agentConfigs);

      toast({
        title: 'Configuration created',
        description: `"${data.name}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to create configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMappings = async () => {
    if (!selectedConfig || !user) return;

    setIsSaving(true);
    try {
      // Build audit log entries by comparing old vs new
      const auditEntries: Array<{
        config_id: string;
        changed_by: string;
        change_type: string;
        agent_name: string;
        old_value: any;
        new_value: any;
        summary: string;
      }> = [];

      const oldMappingsMap: Record<string, { model: string; temperature: number }> = {};
      mappings.forEach(m => {
        oldMappingsMap[m.agent_name] = { model: m.model, temperature: m.temperature ?? 0.7 };
      });

      Object.entries(editedMappings).forEach(([agent, newVal]) => {
        const oldVal = oldMappingsMap[agent];
        if (!oldVal) return;
        if (oldVal.model !== newVal.model) {
          auditEntries.push({
            config_id: selectedConfig.id,
            changed_by: user.id,
            change_type: 'model_change',
            agent_name: agent,
            old_value: { model: oldVal.model },
            new_value: { model: newVal.model },
            summary: `Changed ${agent} model from ${oldVal.model} to ${newVal.model}`,
          });
        }
        if (oldVal.temperature !== newVal.temperature) {
          auditEntries.push({
            config_id: selectedConfig.id,
            changed_by: user.id,
            change_type: 'temperature_change',
            agent_name: agent,
            old_value: { temperature: oldVal.temperature },
            new_value: { temperature: newVal.temperature },
            summary: `Changed ${agent} temperature from ${oldVal.temperature} to ${newVal.temperature}`,
          });
        }
      });

      // Delete existing mappings
      await supabase
        .from('agent_model_mappings')
        .delete()
        .eq('config_id', selectedConfig.id);

      // Insert updated mappings
      const newMappings = Object.entries(editedMappings).map(([agent, config]) => ({
        agent_name: agent,
        model: config.model,
        temperature: config.temperature,
        config_id: selectedConfig.id,
      }));

      await supabase.from('agent_model_mappings').insert(newMappings);

      // Log audit entries
      if (auditEntries.length > 0) {
        await supabase.from('model_config_audit_log').insert(auditEntries);
      }

      // Refresh mappings and audit log
      await fetchMappings(selectedConfig.id);
      if (showAuditLog) await fetchAuditLog(selectedConfig.id);

      toast({
        title: 'Mappings saved',
        description: `${auditEntries.length} change(s) logged to audit trail.`,
      });
    } catch (error) {
      console.error('Error saving mappings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save mappings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!selectedConfig || selectedConfig.is_system) return;

    try {
      await supabase
        .from('model_configurations')
        .delete()
        .eq('id', selectedConfig.id);

      setConfigurations(configurations.filter(c => c.id !== selectedConfig.id));
      if (configurations.length > 1) {
        const next = configurations.find(c => c.id !== selectedConfig.id);
        if (next) {
          setSelectedConfig(next);
          await fetchMappings(next.id);
        }
      } else {
        setSelectedConfig(null);
      }

      toast({
        title: 'Configuration deleted',
        description: 'The configuration has been removed.',
      });
    } catch (error) {
      console.error('Error deleting configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete configuration',
        variant: 'destructive',
      });
    }
  };

  const getModelTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-3 w-3" />;
      case 'standard':
        return <Sparkles className="h-3 w-3" />;
      case 'economy':
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getModelTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'standard':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'economy':
        return 'bg-success/10 text-success border-success/20';
      default:
        return '';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Configurations</CardTitle>
                <Dialog open={showNewConfigDialog} onOpenChange={setShowNewConfigDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Configuration</DialogTitle>
                      <DialogDescription>
                        Create a custom model configuration for your organization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="configName">Name</Label>
                        <Input
                          id="configName"
                          value={newConfigName}
                          onChange={(e) => setNewConfigName(e.target.value)}
                          placeholder="My Custom Config"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="configDesc">Description</Label>
                        <Input
                          id="configDesc"
                          value={newConfigDescription}
                          onChange={(e) => setNewConfigDescription(e.target.value)}
                          placeholder="Optimized for fast analysis"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="copyFromSystem"
                          checked={copyFromSystem}
                          onChange={(e) => setCopyFromSystem(e.target.checked)}
                          className="rounded border-border"
                        />
                        <Label htmlFor="copyFromSystem" className="text-sm font-normal cursor-pointer">
                          Copy model mappings from system configuration
                        </Label>
                      </div>
                      <Button onClick={handleCreateConfig} disabled={!newConfigName.trim() || isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Configuration
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-3 space-y-2">
                  {configurations.map((config) => (
                    <button
                      key={config.id}
                      onClick={() => handleSelectConfig(config)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all',
                        selectedConfig?.id === config.id
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {config.is_system ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Settings className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-medium">{config.name}</span>
                        {config.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                      {config.description && (
                        <p className="text-xs text-muted-foreground pl-6">{config.description}</p>
                      )}
                      {config.is_system && (
                        <p className="text-xs text-muted-foreground pl-6 italic">System preset</p>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Agent Mappings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Agent Model Mappings
                  </CardTitle>
                  <CardDescription>
                    {selectedConfig?.name || 'Select a configuration'}
                    {selectedConfig?.is_system && ' (system)'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedConfig && !selectedConfig.is_system && (
                    <Button variant="outline" size="sm" onClick={handleDeleteConfig}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {selectedConfig && (
                    <Button size="sm" onClick={handleSaveMappings} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
             <ScrollArea className="h-[500px] pr-4">
                {/* Column Headers */}
                <div className="flex items-center gap-4 px-3 pb-2 mb-1 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="flex-1 min-w-0">Agent</div>
                  <div className="w-48 text-center">Model</div>
                  <div className="w-20 text-center" title="Controls randomness: 0 = deterministic, 2 = creative">Temp</div>
                </div>
                <div className="space-y-3">
                  {Object.entries(editedMappings)
                    .sort(([a], [b]) => {
                      const agentA = agentConfigs.find(ac => ac.agent_name === a);
                      const agentB = agentConfigs.find(ac => ac.agent_name === b);
                      const catOrder = (cat: string) => AGENT_CATEGORY_ORDER.indexOf(cat);
                      const catA = catOrder(agentA?.category || 'analysis');
                      const catB = catOrder(agentB?.category || 'analysis');
                      if (catA !== catB) return catA - catB;
                      return (agentA?.display_name || a).localeCompare(agentB?.display_name || b);
                    })
                    .map(([agent, mapping]) => {
                    const agentConfig = agentConfigs.find(ac => ac.agent_name === agent);
                    const displayName = agentConfig?.display_name || agent.replace(/Agent$/, '').replace(/([A-Z])/g, ' $1').trim();
                    const category = agentConfig?.category || 'unknown';
                    const modelInfo = AVAILABLE_MODELS.find(m => m.id === mapping.model);

                    return (
                      <div
                        key={agent}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{displayName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{agent}</p>
                        </div>
                        <Select
                          value={mapping.model}
                          onValueChange={(value) =>
                            setEditedMappings({
                              ...editedMappings,
                              [agent]: { ...mapping, model: value },
                            })
                          }
                          disabled={false}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_MODELS.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn('text-[10px] px-1', getModelTierColor(model.tier))}
                                  >
                                    {getModelTierIcon(model.tier)}
                                  </Badge>
                                  <span>{model.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="w-20">
                          <Input
                            type="number"
                            min="0"
                            max="2"
                            step="0.1"
                            value={mapping.temperature}
                            onChange={(e) =>
                              setEditedMappings({
                                ...editedMappings,
                                [agent]: { ...mapping, temperature: parseFloat(e.target.value) || 0.7 },
                              })
                            }
                            disabled={false}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Audit Trail */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Change History
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const next = !showAuditLog;
                  setShowAuditLog(next);
                  if (next && selectedConfig) await fetchAuditLog(selectedConfig.id);
                }}
              >
                {showAuditLog ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          {showAuditLog && (
            <CardContent>
              {auditLog.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No changes recorded yet.</p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {auditLog.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{entry.summary || `${entry.change_type} on ${entry.agent_name}`}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px]">
                              {entry.change_type.replace('_', ' ')}
                            </Badge>
                            <span>{new Date(entry.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          )}
        </Card>

        {/* Model Legend */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Model Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {AVAILABLE_MODELS.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border"
                >
                  <Badge variant="outline" className={cn('px-2', getModelTierColor(model.tier))}>
                    {getModelTierIcon(model.tier)}
                    <span className="ml-1 capitalize">{model.tier}</span>
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}