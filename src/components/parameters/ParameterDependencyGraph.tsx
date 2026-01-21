import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Network, 
  GitMerge, 
  CircleDot,
  ArrowRight,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ALL_AGENTS, 
  AgentDefinition
} from "@/lib/scriptFramework";

interface ParameterNode {
  id: string;
  name: string;
  agents: string[];
  category: string;
  connections: string[];
}

interface AgentOverlap {
  agent1: AgentDefinition;
  agent2: AgentDefinition;
  sharedParams: string[];
  sharedSections: string[];
}

// Define parameter relationships (semantic connections)
const PARAMETER_RELATIONSHIPS: Record<string, string[]> = {
  // Character-related clusters
  'want_vs_need': ['psychological_flaw_depth', 'transformation_credibility', 'agency_level'],
  'psychological_flaw_depth': ['want_vs_need', 'character_balance', 'internal_external_balance'],
  'agency_level': ['decision_density', 'want_vs_need', 'player_agency'],
  'decision_density': ['agency_level', 'conflict_density', 'choice_impact'],
  'transformation_credibility': ['want_vs_need', 'emotional_progression', 'catharsis_strength'],
  'character_balance': ['psychological_flaw_depth', 'performative_range', 'voice_differentiation'],
  'performative_range': ['character_balance', 'voice_differentiation', 'emotional_range'],
  
  // Structure-related clusters  
  'inciting_force_clarity': ['hook_clarity', 'escalation_logic', 'stakes_personalization'],
  'escalation_logic': ['inciting_force_clarity', 'midpoint_transformation', 'conflict_density'],
  'midpoint_transformation': ['escalation_logic', 'structural_symmetry', 'emotional_timing'],
  'structural_symmetry': ['midpoint_transformation', 'resolution_satisfaction', 'panel_to_panel_flow'],
  'resolution_satisfaction': ['structural_symmetry', 'catharsis_strength', 'payoff_delay'],
  'drop_off_risk': ['escalation_logic', 'listener_engagement', 'hook_clarity'],
  
  // Conflict-related clusters
  'conflict_type_diversity': ['conflict_density', 'internal_external_balance', 'emotional_range'],
  'conflict_density': ['conflict_type_diversity', 'decision_density', 'escalation_logic'],
  'stakes_personalization': ['inciting_force_clarity', 'cost_of_failure', 'emotional_progression'],
  'escalation_irreversibility': ['cost_of_failure', 'stakes_personalization', 'conflict_density'],
  'cost_of_failure': ['escalation_irreversibility', 'stakes_personalization', 'catharsis_strength'],
  'internal_external_balance': ['conflict_type_diversity', 'psychological_flaw_depth', 'thematic_spine_clarity'],
  
  // Theme-related clusters
  'thematic_spine_clarity': ['internal_external_balance', 'show_vs_tell_ratio', 'moral_complexity'],
  'show_vs_tell_ratio': ['thematic_spine_clarity', 'exposition_load', 'subtext_density'],
  'symbol_motif_consistency': ['thematic_spine_clarity', 'world_rule_consistency', 'style_consistency'],
  'moral_complexity': ['thematic_spine_clarity', 'psychological_flaw_depth', 'longevity_of_meaning'],
  'cultural_resonance': ['moral_complexity', 'audience_fit', 'localization_ease'],
  'longevity_of_meaning': ['moral_complexity', 'cultural_resonance', 'ip_expansion_potential'],
  
  // Dialogue-related clusters
  'exposition_load': ['show_vs_tell_ratio', 'subtext_density', 'balloon_efficiency'],
  'subtext_density': ['exposition_load', 'show_vs_tell_ratio', 'rhythm_and_silence'],
  'voice_differentiation': ['character_balance', 'performative_range', 'caption_voice'],
  'rhythm_and_silence': ['subtext_density', 'emotional_timing', 'sound_design_cues'],
  'quotability': ['voice_differentiation', 'marketing_hook_density', 'hook_clarity'],
  'medium_appropriateness': ['rhythm_and_silence', 'audio_scene_setting', 'visual_storytelling'],
  
  // World-related clusters
  'world_rule_consistency': ['symbol_motif_consistency', 'plausibility', 'lore_depth'],
  'setting_agency': ['world_rule_consistency', 'spatial_system_logic', 'exploration_reward'],
  'spatial_system_logic': ['setting_agency', 'panel_composition', 'page_layout'],
  'plausibility': ['world_rule_consistency', 'suspension_of_disbelief', 'continuity_integrity'],
  'continuity_integrity': ['plausibility', 'world_rule_consistency', 'style_consistency'],
  'suspension_of_disbelief': ['plausibility', 'world_rule_consistency', 'emotional_progression'],
  
  // Emotional clusters
  'emotional_range': ['conflict_type_diversity', 'performative_range', 'emotional_timing'],
  'emotional_timing': ['emotional_range', 'midpoint_transformation', 'rhythm_and_silence'],
  'emotional_progression': ['emotional_timing', 'transformation_credibility', 'stakes_personalization'],
  'catharsis_strength': ['emotional_progression', 'resolution_satisfaction', 'cost_of_failure'],
  'fatigue_vs_variety': ['emotional_range', 'conflict_type_diversity', 'panel_to_panel_flow'],
  'payoff_delay': ['catharsis_strength', 'resolution_satisfaction', 'cliffhangers'],
  
  // Market-related clusters
  'audience_fit': ['cultural_resonance', 'platform_fit', 'marketing_hook_density'],
  'platform_fit': ['audience_fit', 'consumption_pattern_alignment', 'readiness_score'],
  'consumption_pattern_alignment': ['platform_fit', 'drop_off_risk', 'issue_structure'],
  'marketing_hook_density': ['audience_fit', 'hook_clarity', 'quotability'],
  'ip_expansion_potential': ['franchise_expandability', 'lore_depth', 'longevity_of_meaning'],
  'localization_ease': ['cultural_resonance', 'voice_cast_requirements', 'medium_appropriateness'],
  
  // Concept-related clusters
  'concept_originality': ['familiarity_anchor', 'hook_clarity', 'thematic_spine_clarity'],
  'familiarity_anchor': ['concept_originality', 'audience_fit', 'cultural_resonance'],
  'hook_clarity': ['concept_originality', 'inciting_force_clarity', 'marketing_hook_density'],
  'concept_compressibility': ['hook_clarity', 'marketing_hook_density', 'concept_scalability'],
  'concept_scalability': ['concept_compressibility', 'franchise_expandability', 'ip_expansion_potential'],
  'franchise_expandability': ['concept_scalability', 'ip_expansion_potential', 'lore_depth'],
  
  // Execution clusters
  'production_complexity': ['technical_dependency', 'schedule_risk', 'budget_realism'],
  'talent_dependency': ['production_complexity', 'performative_range', 'voice_cast_requirements'],
  'technical_dependency': ['production_complexity', 'visual_storytelling', 'sound_design_cues'],
  'schedule_risk': ['production_complexity', 'talent_dependency', 'failure_modes'],
  'compliance_sensitivity_risk': ['cultural_resonance', 'moral_complexity', 'failure_modes'],
  'failure_modes': ['schedule_risk', 'compliance_sensitivity_risk', 'production_complexity'],
  
  // Comic-specific clusters
  'visual_storytelling': ['panel_composition', 'page_layout', 'action_clarity'],
  'panel_composition': ['visual_storytelling', 'spatial_system_logic', 'panel_to_panel_flow'],
  'page_layout': ['panel_composition', 'spatial_system_logic', 'issue_structure'],
  'action_clarity': ['visual_storytelling', 'panel_composition', 'sound_effects'],
  'balloon_efficiency': ['exposition_load', 'caption_voice', 'rhythm_and_silence'],
  'caption_voice': ['balloon_efficiency', 'voice_differentiation', 'audio_scene_setting'],
  'sound_effects': ['action_clarity', 'sound_design_cues', 'rhythm_and_silence'],
  'panel_to_panel_flow': ['structural_symmetry', 'issue_structure', 'fatigue_vs_variety'],
  'issue_structure': ['panel_to_panel_flow', 'consumption_pattern_alignment', 'cliffhangers'],
  'cliffhangers': ['issue_structure', 'payoff_delay', 'drop_off_risk'],
  'artist_guidance': ['reference_clarity', 'visual_storytelling', 'style_consistency'],
  'reference_clarity': ['artist_guidance', 'world_rule_consistency', 'setting_agency'],
  'style_consistency': ['artist_guidance', 'symbol_motif_consistency', 'continuity_integrity'],
  
  // Interactive-specific clusters
  'branching_quality': ['choice_impact', 'player_agency', 'replayability'],
  'choice_impact': ['branching_quality', 'decision_density', 'player_agency'],
  'player_agency': ['choice_impact', 'agency_level', 'exploration_reward'],
  'replayability': ['branching_quality', 'choice_impact', 'fatigue_vs_variety'],
  'lore_depth': ['world_rule_consistency', 'franchise_expandability', 'exploration_reward'],
  'world_consistency': ['world_rule_consistency', 'lore_depth', 'continuity_integrity'],
  'exploration_reward': ['lore_depth', 'player_agency', 'setting_agency'],
  'faction_clarity': ['lore_depth', 'character_balance', 'conflict_type_diversity'],
  
  // Audio-specific clusters
  'audio_scene_setting': ['medium_appropriateness', 'setting_agency', 'sound_design_cues'],
  'voice_cast_requirements': ['performative_range', 'talent_dependency', 'localization_ease'],
  'sound_design_cues': ['audio_scene_setting', 'technical_dependency', 'rhythm_and_silence'],
  'listener_engagement': ['drop_off_risk', 'hook_clarity', 'emotional_progression'],
  
  // Web Series clusters
  'hook_efficiency': ['retention_curve_design', 'serial_momentum', 'shareability_meme_potential', 'hook_clarity'],
  'episode_self_containment': ['serial_momentum', 'character_stickiness', 'platform_native_storytelling'],
  'serial_momentum': ['hook_efficiency', 'episode_self_containment', 'binge_continuity_pressure'],
  'retention_curve_design': ['hook_efficiency', 'mid_episode_rehooking', 'character_stickiness', 'drop_off_risk'],
  'character_stickiness': ['episode_self_containment', 'retention_curve_design', 'tonality_format_consistency', 'character_balance'],
  'platform_native_storytelling': ['shareability_meme_potential', 'monetization_readiness', 'production_simplicity_velocity', 'platform_fit'],
  'tonality_format_consistency': ['character_stickiness', 'episode_self_containment', 'platform_native_storytelling', 'style_consistency'],
  'production_simplicity_velocity': ['platform_native_storytelling', 'monetization_readiness', 'episode_self_containment', 'production_complexity'],
  'shareability_meme_potential': ['hook_efficiency', 'platform_native_storytelling', 'monetization_readiness', 'marketing_hook_density'],
  'monetization_readiness': ['production_simplicity_velocity', 'platform_native_storytelling', 'shareability_meme_potential', 'readiness_score'],
  'mid_episode_rehooking': ['retention_curve_design', 'soft_act_integrity', 'binge_continuity_pressure', 'hook_clarity'],
  'soft_act_integrity': ['mid_episode_rehooking', 'binge_continuity_pressure', 'serial_momentum', 'structural_symmetry'],
  'binge_continuity_pressure': ['serial_momentum', 'soft_act_integrity', 'mid_episode_rehooking', 'cliffhangers'],
  
  // Meta clusters
  'readiness_score': ['platform_fit', 'market_clarity', 'budget_realism'],
  'market_clarity': ['readiness_score', 'audience_fit', 'concept_compressibility'],
  'budget_realism': ['readiness_score', 'production_complexity', 'schedule_risk'],
  'improvements_detected': ['regressions_detected', 'confidence_shift', 'evolution_detected'],
  'regressions_detected': ['improvements_detected', 'failure_modes', 'reclassification_recommended'],
  'confidence_shift': ['improvements_detected', 'final_confidence', 'classification_confidence'],
  'evolution_detected': ['improvements_detected', 'reclassification_recommended', 'type_clarity'],
  'reclassification_recommended': ['evolution_detected', 'final_confidence', 'blend_complexity'],
  'decision_transparency': ['trace_completeness', 'final_confidence', 'rationale'],
  'trace_completeness': ['decision_transparency', 'confidence_shift', 'classification_confidence'],
};

// Format parameter name for display
const formatParamName = (param: string) => {
  return param
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Modern pill style - high contrast, readable on any background
const getPillStyle = () => {
  return 'bg-background text-foreground border-border shadow-sm hover:bg-accent hover:text-accent-foreground';
};

export function ParameterDependencyGraph() {
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null);

  // Build parameter nodes with their agents
  const parameterNodes = useMemo(() => {
    const nodes: Record<string, ParameterNode> = {};
    
    ALL_AGENTS.forEach(agent => {
      agent.parameters.forEach(param => {
        if (!nodes[param]) {
          nodes[param] = {
            id: param,
            name: formatParamName(param),
            agents: [],
            category: agent.category,
            connections: PARAMETER_RELATIONSHIPS[param] || []
          };
        }
        nodes[param].agents.push(agent.id);
      });
    });
    
    return nodes;
  }, []);

  // Find agent overlaps (shared parameters and report sections)
  const agentOverlaps = useMemo(() => {
    const overlaps: AgentOverlap[] = [];
    
    for (let i = 0; i < ALL_AGENTS.length; i++) {
      for (let j = i + 1; j < ALL_AGENTS.length; j++) {
        const agent1 = ALL_AGENTS[i];
        const agent2 = ALL_AGENTS[j];
        
        // Find shared report sections
        const sharedSections = agent1.reportSections.filter(s => 
          agent2.reportSections.includes(s)
        );
        
        // Find parameters that are semantically connected
        const connectedParams: string[] = [];
        agent1.parameters.forEach(p1 => {
          const connections = PARAMETER_RELATIONSHIPS[p1] || [];
          agent2.parameters.forEach(p2 => {
            if (connections.includes(p2)) {
              if (!connectedParams.includes(p1)) connectedParams.push(p1);
              if (!connectedParams.includes(p2)) connectedParams.push(p2);
            }
          });
        });
        
        if (sharedSections.length > 0 || connectedParams.length > 0) {
          overlaps.push({
            agent1,
            agent2,
            sharedParams: connectedParams,
            sharedSections
          });
        }
      }
    }
    
    return overlaps.sort((a, b) => 
      (b.sharedParams.length + b.sharedSections.length) - 
      (a.sharedParams.length + a.sharedSections.length)
    ).slice(0, 20); // Top 20 overlaps
  }, []);

  // Filter parameters by selected agent
  const filteredParameters = useMemo(() => {
    const params = Object.values(parameterNodes);
    if (selectedAgent === "all") return params;
    return params.filter(p => p.agents.includes(selectedAgent));
  }, [parameterNodes, selectedAgent]);

  // Get connected parameters for selection
  const connectedParameters = useMemo(() => {
    if (!selectedParameter) return new Set<string>();
    const connections = PARAMETER_RELATIONSHIPS[selectedParameter] || [];
    return new Set(connections);
  }, [selectedParameter]);

  return (
    <div className="space-y-6">
      {/* Parameter Relationship Network */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Parameter Dependency Network
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Click a parameter to see its semantic connections
              </p>
            </div>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="all">All Agents</SelectItem>
                {ALL_AGENTS.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selected parameter info */}
            {selectedParameter && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <CircleDot className="h-4 w-4 text-primary" />
                  <span className="font-medium">{formatParamName(selectedParameter)}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Used by: {parameterNodes[selectedParameter]?.agents.map(a => 
                    ALL_AGENTS.find(ag => ag.id === a)?.name
                  ).join(', ')}
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Connected to: </span>
                  {connectedParameters.size > 0 ? (
                    Array.from(connectedParameters).map(p => formatParamName(p)).join(', ')
                  ) : (
                    <span className="text-muted-foreground/60">No defined connections</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Parameter pills grid */}
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                {filteredParameters.map(param => {
                  const isSelected = selectedParameter === param.id;
                  const isConnected = connectedParameters.has(param.id);
                  const primaryAgent = param.agents[0];
                  
                  return (
                    <Tooltip key={param.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setSelectedParameter(isSelected ? null : param.id)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                            getPillStyle(),
                            isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background bg-primary text-primary-foreground",
                            isConnected && !isSelected && "ring-2 ring-primary/50 bg-primary/10",
                            selectedParameter && !isSelected && !isConnected && "opacity-40"
                          )}
                        >
                          {param.name}
                          {param.agents.length > 1 && (
                            <span className="ml-1.5 text-[10px] opacity-70">×{param.agents.length}</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <div className="font-medium">{param.name}</div>
                          <div className="text-muted-foreground">
                            Agents: {param.agents.map(a => 
                              ALL_AGENTS.find(ag => ag.id === a)?.name
                            ).join(', ')}
                          </div>
                          {param.connections.length > 0 && (
                            <div className="text-muted-foreground mt-1">
                              {param.connections.length} connections
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Overlap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-primary" />
            Agent Analysis Overlaps
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Agents that share report sections or analyze connected parameters
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agentOverlaps.slice(0, 10).map((overlap, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-background text-foreground border-border">
                    {overlap.agent1.name}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Layers className="h-3 w-3 text-muted-foreground" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="bg-background text-foreground border-border">
                    {overlap.agent2.name}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-xs">
                  {overlap.sharedSections.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Shared sections: </span>
                      {overlap.sharedSections.map((section, i) => (
                        <span key={section} className="ml-1 px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px]">
                          {section}
                        </span>
                      ))}
                    </div>
                  )}
                  {overlap.sharedParams.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Connected params: </span>
                      <span className="text-foreground">
                        {overlap.sharedParams.slice(0, 4).map(p => formatParamName(p)).join(', ')}
                        {overlap.sharedParams.length > 4 && ` +${overlap.sharedParams.length - 4} more`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ParameterDependencyGraph;
