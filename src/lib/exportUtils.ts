/**
 * Utility functions for exporting data to CSV format
 */

import {
  SCRIPT_TYPES,
  SIMPLE_SCRIPT_TYPES,
  CORE_AGENTS,
  COMIC_AGENTS,
  SYSTEM_AGENTS,
  META_AGENTS,
  INTERACTIVE_AGENTS,
  AUDIO_AGENTS,
  WEB_SERIES_AGENTS,
  ALL_AGENTS,
  getAnalysisAgentsForScriptType,
  type AgentDefinition,
} from './scriptFramework';

import {
  ALL_PARAMETERS,
  COMIC_PARAMETERS,
  CORE_PARAMETERS,
  WEB_SERIES_PARAMETERS,
  exportParametersToJSON,
  type ParameterDefinition,
} from './parameterDefinitions';

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
}

const LENS_ORDER = [
  'studio_executive',
  'producer',
  'actor',
  'director',
  'writer',
  'financier',
  'investor',
  'ott_platform',
  'theatrical',
];

const LENS_DISPLAY_NAMES: Record<string, string> = {
  studio_executive: 'Studio Executive',
  producer: 'Producer',
  actor: 'Actor',
  director: 'Director',
  writer: 'Writer',
  financier: 'Financier',
  investor: 'Investor',
  ott_platform: 'OTT Platform',
  theatrical: 'Theatrical',
};

// Parameter dependency relationships (semantic connections)
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
  'sequential_storytelling_integrity': ['panel_to_panel_flow', 'visual_storytelling', 'page_architecture'],
  'panel_economy': ['page_architecture', 'panel_composition', 'reading_flow'],
  'page_architecture': ['panel_economy', 'page_layout', 'page_turn_reveals'],
  'art_writing_synergy': ['show_vs_tell_ratio', 'visual_storytelling', 'collaboration_readiness'],
  'character_visual_identity': ['character_balance', 'visual_storytelling', 'style_consistency'],
  'collaboration_readiness': ['art_writing_synergy', 'production_pipeline_awareness', 'artist_guidance'],
  'production_pipeline_awareness': ['collaboration_readiness', 'production_complexity', 'schedule_risk'],
  'market_publishing_alignment': ['platform_fit', 'audience_fit', 'readiness_score'],
  'dialogue_load': ['balloon_efficiency', 'reading_flow', 'exposition_load'],
  'balloon_engineering': ['dialogue_load', 'reading_flow', 'panel_composition'],
  'reading_flow': ['balloon_engineering', 'panel_to_panel_flow', 'page_architecture'],
  'emotional_payload_per_page': ['emotional_timing', 'page_turn_reveals', 'catharsis_strength'],
  'structural_modularity': ['issue_structure', 'cliffhangers', 'serial_momentum'],
  'page_turn_reveals': ['page_architecture', 'emotional_payload_per_page', 'payoff_delay'],
  
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
};

/**
 * Escapes a value for CSV format
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Get parameter applicability for a specific script type
 */
function getParameterApplicability(paramName: string, scriptType: string): boolean {
  // Check from ALL_PARAMETERS definitions
  const paramDef = ALL_PARAMETERS.find(p => p.name === paramName || p.id === paramName);
  if (paramDef) {
    if (paramDef.applicableScriptTypes === 'all') return true;
    return paramDef.applicableScriptTypes.includes(scriptType);
  }
  
  // Fallback: check if agent is applicable
  const agent = ALL_AGENTS.find(a => a.parameters.includes(paramName));
  if (agent) {
    const applicableAgents = getAnalysisAgentsForScriptType(scriptType);
    return applicableAgents.some(a => a.id === agent.id);
  }
  
  return false;
}

/**
 * Generates CSV content for the parameters framework with script type applicability
 */
export function generateParametersCSV(
  parameters: Parameter[],
  lensWeights: LensWeight[]
): string {
  const weightMap = new Map<string, Map<string, number>>();
  lensWeights.forEach((lw) => {
    if (!weightMap.has(lw.parameter_id)) {
      weightMap.set(lw.parameter_id, new Map());
    }
    weightMap.get(lw.parameter_id)!.set(lw.lens, lw.weight);
  });

  const scriptTypes = SIMPLE_SCRIPT_TYPES;
  
  const headers = [
    'Agent',
    'Agent Category',
    'Parameter Category',
    'Parameter Name',
    'Display Name',
    'Description',
    'Default Weight',
    ...LENS_ORDER.map((lens) => LENS_DISPLAY_NAMES[lens] || lens),
    ...scriptTypes.map(st => st.label),
  ];

  const rows = parameters.map((param) => {
    const paramWeights = weightMap.get(param.id) || new Map();
    const agentDef = ALL_AGENTS.find(a => a.id === param.agent_source);
    return [
      param.agent_source.replace('Agent', ''),
      agentDef?.category || 'analysis',
      param.category,
      param.name,
      param.display_name,
      param.description || '',
      param.default_weight,
      ...LENS_ORDER.map((lens) => paramWeights.get(lens) ?? ''),
      ...scriptTypes.map(st => getParameterApplicability(param.name, st.value) ? '✓' : '—'),
    ];
  });

  rows.sort((a, b) => {
    const agentCompare = String(a[0]).localeCompare(String(b[0]));
    if (agentCompare !== 0) return agentCompare;
    const categoryCompare = String(a[2]).localeCompare(String(b[2]));
    if (categoryCompare !== 0) return categoryCompare;
    return String(a[4]).localeCompare(String(b[4]));
  });

  return [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');
}

/**
 * Generates a matrix showing agents and parameters by script type
 */
export function generateScriptTypeMatrixCSV(parameters: Parameter[]): string {
  // Group parameters by agent
  const paramsByAgent = new Map<string, Parameter[]>();
  parameters.forEach((param) => {
    if (!paramsByAgent.has(param.agent_source)) {
      paramsByAgent.set(param.agent_source, []);
    }
    paramsByAgent.get(param.agent_source)!.push(param);
  });

  // Get all unique agents from parameters
  const allAgentIds = [...new Set(parameters.map(p => p.agent_source))];
  
  // Use simple script types for backward compatibility with DB
  const scriptTypes = SIMPLE_SCRIPT_TYPES;

  // Sheet 1: Agent × Script Type Matrix
  const agentMatrixHeaders = ['Agent', 'Category', 'Type', ...scriptTypes.map((t) => t.label)];
  const agentMatrixRows: (string | number)[][] = [];

  // Group agents by category
  const agentCategories = [
    { label: 'System Agents', agents: SYSTEM_AGENTS },
    { label: 'Core Analysis Agents', agents: CORE_AGENTS },
    { label: 'Comic Agents', agents: COMIC_AGENTS },
    { label: 'Interactive Agents', agents: INTERACTIVE_AGENTS },
    { label: 'Audio Agents', agents: AUDIO_AGENTS },
    { label: 'Web Series Agents', agents: WEB_SERIES_AGENTS },
    { label: 'Meta Agents', agents: META_AGENTS },
  ];

  agentCategories.forEach(({ label, agents }) => {
    agents.forEach((agent) => {
      const agentParams = paramsByAgent.get(agent.id) || [];
      const paramCount = agentParams.length;
      
      agentMatrixRows.push([
        agent.name,
        label,
        agent.category,
        ...scriptTypes.map((scriptType) => {
          const applicableAgents = getAnalysisAgentsForScriptType(scriptType.value);
          const isApplicable = applicableAgents.some(a => a.id === agent.id);
          if (isApplicable) {
            return paramCount > 0 ? `✓ (${paramCount} params)` : '✓';
          }
          return '—';
        }),
      ]);
    });
  });

  // Sheet 2: Detailed Parameter × Script Type Matrix
  const paramMatrixHeaders = ['Agent', 'Parameter', 'Category', ...scriptTypes.map((t) => t.label)];
  const paramMatrixRows: (string | number)[][] = [];

  allAgentIds.forEach((agentId) => {
    const agentParams = paramsByAgent.get(agentId) || [];
    const agentDef = ALL_AGENTS.find(a => a.id === agentId);
    agentParams.forEach((param) => {
      paramMatrixRows.push([
        agentDef?.name || agentId.replace('Agent', ''),
        param.display_name,
        param.category,
        ...scriptTypes.map((scriptType) => {
          return getParameterApplicability(param.name, scriptType.value) ? '✓' : '—';
        }),
      ]);
    });
  });

  // Summary stats
  const summaryHeaders = ['Script Type', 'Active Agents', 'Total Parameters'];
  const summaryRows = scriptTypes.map((scriptType) => {
    const activeAgents = getAnalysisAgentsForScriptType(scriptType.value);
    const totalParams = activeAgents.reduce((sum, agent) => {
      return sum + (paramsByAgent.get(agent.id)?.length || 0);
    }, 0);
    return [
      scriptType.label,
      activeAgents.length,
      totalParams,
    ];
  });

  // Agent category summary
  const categoryHeaders = ['Agent Category', 'Count', 'Description'];
  const categoryRows = agentCategories.map(({ label, agents }) => [
    label,
    agents.length,
    agents.map(a => a.name).join(', '),
  ]);

  // Combine all sections with clear separators
  const sections = [
    '=== AGENT CATEGORIES ===',
    '',
    categoryHeaders.map(escapeCSV).join(','),
    ...categoryRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== SUMMARY BY SCRIPT TYPE ===',
    '',
    summaryHeaders.map(escapeCSV).join(','),
    ...summaryRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== AGENT APPLICABILITY MATRIX ===',
    '',
    agentMatrixHeaders.map(escapeCSV).join(','),
    ...agentMatrixRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== DETAILED PARAMETER MATRIX ===',
    '',
    paramMatrixHeaders.map(escapeCSV).join(','),
    ...paramMatrixRows.map((row) => row.map(escapeCSV).join(',')),
  ];

  return sections.join('\n');
}

/**
 * Generates a dependency matrix showing parameter relationships
 */
export function generateDependencyMatrixCSV(): string {
  // Get all parameters that have dependencies defined
  const parameterKeys = Object.keys(PARAMETER_RELATIONSHIPS);
  
  // Build unique list of all parameters (both source and target)
  const allDependencyParams = new Set<string>();
  parameterKeys.forEach(key => {
    allDependencyParams.add(key);
    PARAMETER_RELATIONSHIPS[key].forEach(dep => allDependencyParams.add(dep));
  });
  
  const sortedParams = Array.from(allDependencyParams).sort();
  
  // Format parameter name for display
  const formatParamName = (param: string) => {
    return param
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get agent for a parameter
  const getAgentForParam = (paramName: string): string => {
    const paramDef = ALL_PARAMETERS.find(p => p.name === paramName || p.id === paramName);
    if (paramDef) return paramDef.agentSource.replace('Agent', '');
    const agent = ALL_AGENTS.find(a => a.parameters.includes(paramName));
    return agent ? agent.name : 'Unknown';
  };
  
  // Get category for a parameter
  const getCategoryForParam = (paramName: string): string => {
    const paramDef = ALL_PARAMETERS.find(p => p.name === paramName || p.id === paramName);
    if (paramDef) return paramDef.category;
    return 'Unknown';
  };
  
  // Section 1: Dependency List (adjacency list format)
  const listHeaders = ['Parameter', 'Display Name', 'Agent', 'Category', 'Dependencies', 'Dependency Count'];
  const listRows = parameterKeys.map(param => {
    const deps = PARAMETER_RELATIONSHIPS[param] || [];
    return [
      param,
      formatParamName(param),
      getAgentForParam(param),
      getCategoryForParam(param),
      deps.map(d => formatParamName(d)).join('; '),
      deps.length,
    ];
  }).sort((a, b) => (b[5] as number) - (a[5] as number)); // Sort by dependency count descending
  
  // Section 2: Bi-directional relationship pairs
  const pairsHeaders = ['Parameter A', 'Parameter B', 'Agent A', 'Agent B', 'Relationship Type'];
  const pairsSet = new Set<string>();
  const pairsRows: (string | number)[][] = [];
  
  parameterKeys.forEach(param => {
    const deps = PARAMETER_RELATIONSHIPS[param] || [];
    deps.forEach(dep => {
      // Create normalized pair key to avoid duplicates
      const pairKey = [param, dep].sort().join('|');
      if (!pairsSet.has(pairKey)) {
        pairsSet.add(pairKey);
        // Check if bi-directional
        const isBidirectional = PARAMETER_RELATIONSHIPS[dep]?.includes(param);
        pairsRows.push([
          formatParamName(param),
          formatParamName(dep),
          getAgentForParam(param),
          getAgentForParam(dep),
          isBidirectional ? 'Bi-directional' : 'Uni-directional',
        ]);
      }
    });
  });
  
  // Section 3: Dependency matrix (sparse representation)
  // Only show parameters with actual connections
  const matrixHeaders = ['From Parameter', ...sortedParams.slice(0, 30).map(formatParamName)]; // Limit to first 30 for readability
  const matrixRows = sortedParams.slice(0, 30).map(param => {
    const deps = PARAMETER_RELATIONSHIPS[param] || [];
    return [
      formatParamName(param),
      ...sortedParams.slice(0, 30).map(target => deps.includes(target) ? '1' : ''),
    ];
  });
  
  // Section 4: Cross-format dependencies (parameters connecting different formats)
  const crossFormatHeaders = ['Parameter', 'Format', 'Connected Parameters', 'Connected Formats'];
  const crossFormatRows: (string | number)[][] = [];
  
  const getFormatForParam = (paramName: string): string => {
    const paramDef = ALL_PARAMETERS.find(p => p.name === paramName || p.id === paramName);
    if (!paramDef) return 'Core';
    
    if (COMIC_PARAMETERS.find(p => p.name === paramName)) return 'Comic';
    if (WEB_SERIES_PARAMETERS.find(p => p.name === paramName)) return 'Web Series';
    return 'Core';
  };
  
  parameterKeys.forEach(param => {
    const paramFormat = getFormatForParam(param);
    const deps = PARAMETER_RELATIONSHIPS[param] || [];
    const crossFormatDeps = deps.filter(d => getFormatForParam(d) !== paramFormat);
    
    if (crossFormatDeps.length > 0) {
      const connectedFormats = [...new Set(crossFormatDeps.map(d => getFormatForParam(d)))];
      crossFormatRows.push([
        formatParamName(param),
        paramFormat,
        crossFormatDeps.map(d => formatParamName(d)).join('; '),
        connectedFormats.join(', '),
      ]);
    }
  });
  
  // Section 5: Statistics
  const statsHeaders = ['Metric', 'Value'];
  const totalRelationships = Object.values(PARAMETER_RELATIONSHIPS).reduce((sum, deps) => sum + deps.length, 0);
  const avgConnections = totalRelationships / parameterKeys.length;
  const maxConnections = Math.max(...Object.values(PARAMETER_RELATIONSHIPS).map(deps => deps.length));
  const mostConnected = parameterKeys.find(p => PARAMETER_RELATIONSHIPS[p].length === maxConnections);
  
  const statsRows = [
    ['Total Parameters with Dependencies', parameterKeys.length],
    ['Total Dependency Relationships', totalRelationships],
    ['Unique Bi-directional Pairs', pairsRows.filter(r => r[4] === 'Bi-directional').length],
    ['Average Connections per Parameter', avgConnections.toFixed(2)],
    ['Maximum Connections', maxConnections],
    ['Most Connected Parameter', mostConnected ? formatParamName(mostConnected) : 'N/A'],
    ['Cross-Format Connections', crossFormatRows.length],
  ];
  
  // Combine all sections
  const sections = [
    '=== PARAMETER DEPENDENCY MATRIX ===',
    '',
    '=== STATISTICS ===',
    '',
    statsHeaders.map(escapeCSV).join(','),
    ...statsRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== DEPENDENCY LIST (By Connection Count) ===',
    '',
    listHeaders.map(escapeCSV).join(','),
    ...listRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== RELATIONSHIP PAIRS ===',
    '',
    pairsHeaders.map(escapeCSV).join(','),
    ...pairsRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== CROSS-FORMAT DEPENDENCIES ===',
    '',
    crossFormatHeaders.map(escapeCSV).join(','),
    ...crossFormatRows.map((row) => row.map(escapeCSV).join(',')),
    '',
    '',
    '=== ADJACENCY MATRIX (First 30 Parameters) ===',
    '',
    matrixHeaders.map(escapeCSV).join(','),
    ...matrixRows.map((row) => row.map(escapeCSV).join(',')),
  ];
  
  return sections.join('\n');
}

/**
 * Downloads a string as a file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports the full parameters framework to CSV (single file with multiple sheets)
 */
export function exportParametersToCSV(
  parameters: Parameter[],
  lensWeights: LensWeight[]
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Generate all sheets
  const sheet1 = generateParametersCSV(parameters, lensWeights);
  const sheet2 = generateScriptTypeMatrixCSV(parameters);
  const sheet3 = generateDependencyMatrixCSV();
  
  const combinedContent = [
    '========================================',
    'PULSE UNIVERSAL SCRIPT ANALYSIS FRAMEWORK',
    '========================================',
    '',
    'SHEET 1: PARAMETERS WITH LENS WEIGHTS & SCRIPT TYPE APPLICABILITY',
    '-------------------------------------------------------------------',
    '',
    sheet1,
    '',
    '',
    '========================================',
    'SHEET 2: SCRIPT TYPE APPLICABILITY MATRIX',
    '========================================',
    '',
    sheet2,
    '',
    '',
    '========================================',
    'SHEET 3: PARAMETER DEPENDENCY MATRIX',
    '========================================',
    '',
    sheet3,
  ].join('\n');
  
  downloadCSV(combinedContent, `pulse-framework-${timestamp}.csv`);
}

/**
 * Exports the full parameter definitions with descriptions to JSON
 */
export function exportParameterDefinitionsJSON(): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const content = exportParametersToJSON();
  
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `pulse-parameters-${timestamp}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get all parameter definitions for a script type
 */
export function getParameterDefinitionsForExport(scriptType: string): ParameterDefinition[] {
  const isComic = ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'].includes(scriptType);
  const isWebSeries = scriptType === 'web_series';
  
  if (isComic) {
    return [...CORE_PARAMETERS, ...COMIC_PARAMETERS];
  }
  if (isWebSeries) {
    return [...CORE_PARAMETERS, ...WEB_SERIES_PARAMETERS];
  }
  return CORE_PARAMETERS;
}
