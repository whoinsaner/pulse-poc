/**
 * Universal Script Analysis Framework (USAF)
 * Centralized definitions for script types, agents, and their applicability
 */

// ============= SCRIPT TYPES =============

export type ScriptTypeCategory = 'film' | 'series' | 'stage' | 'audio' | 'interactive' | 'short_form' | 'corporate' | 'documentary' | 'experimental';

export interface ScriptType {
  value: string;
  label: string;
  description: string;
  category: ScriptTypeCategory;
  formatTags: string[];
  distributionTags: string[];
}

// Full taxonomy from Universal Script Type Classifier
export const SCRIPT_TYPES: ScriptType[] = [
  // Film Types
  { value: 'feature_film', label: 'Feature Film', description: 'Full-length theatrical film (90+ min)', category: 'film', formatTags: ['linear', 'long_form'], distributionTags: ['theatrical', 'ott'] },
  { value: 'short_film', label: 'Short Film', description: 'Short-form narrative (<40 min)', category: 'film', formatTags: ['linear', 'short_form'], distributionTags: ['festival', 'streaming'] },
  
  // Series Types
  { value: 'tv_series', label: 'TV Series', description: 'Multi-episode television series', category: 'series', formatTags: ['episodic', 'serialized'], distributionTags: ['broadcast', 'ott'] },
  { value: 'limited_series', label: 'Limited Series', description: 'Closed-ended mini-series (4-10 episodes)', category: 'series', formatTags: ['serialized'], distributionTags: ['ott', 'broadcast'] },
  { value: 'web_series', label: 'Web Series', description: 'Digital-first episodic content', category: 'series', formatTags: ['episodic', 'short_form'], distributionTags: ['youtube', 'social_media'] },
  
  // Stage & Audio
  { value: 'stage_play', label: 'Stage Play', description: 'Theatre/stage performance script', category: 'stage', formatTags: ['linear', 'single_location'], distributionTags: ['live_performance'] },
  { value: 'audio_drama', label: 'Audio Drama', description: 'Audio-only narrative fiction', category: 'audio', formatTags: ['linear', 'episodic'], distributionTags: ['audio_only', 'podcast'] },
  { value: 'podcast_fiction', label: 'Podcast Fiction', description: 'Serialized podcast narrative', category: 'audio', formatTags: ['episodic', 'serialized'], distributionTags: ['podcast', 'audio_only'] },
  
  // Interactive
  { value: 'game_narrative', label: 'Game Narrative', description: 'Video game story/screenplay', category: 'interactive', formatTags: ['branching', 'non_linear'], distributionTags: ['gaming_platform'] },
  { value: 'interactive_fiction', label: 'Interactive Fiction', description: 'Choice-based interactive narrative', category: 'interactive', formatTags: ['branching', 'choice_based', 'replayable'], distributionTags: ['streaming', 'gaming_platform'] },
  
  // Short Form & Corporate
  { value: 'micro_drama', label: 'Micro Drama', description: 'Ultra-short vertical content (30-180 sec)', category: 'short_form', formatTags: ['short_form', 'time_compressed', 'vertical'], distributionTags: ['social_media', 'tiktok', 'reels', 'shorts'] },
  { value: 'short_form_video', label: 'Short-Form Video', description: 'Hook-driven content (<5 min)', category: 'short_form', formatTags: ['short_form', 'time_compressed'], distributionTags: ['social_media', 'youtube'] },
  { value: 'brand_film', label: 'Brand Film', description: 'Branded narrative content', category: 'corporate', formatTags: ['linear', 'short_form'], distributionTags: ['social_media', 'internal_enterprise'] },
  { value: 'advertisement', label: 'Advertisement', description: 'Commercial/ad spot', category: 'corporate', formatTags: ['short_form', 'time_compressed'], distributionTags: ['broadcast', 'social_media'] },
  { value: 'corporate_training', label: 'Corporate Training', description: 'Educational/training content', category: 'corporate', formatTags: ['episodic', 'educational'], distributionTags: ['internal_enterprise'] },
  
  // Documentary & Experimental
  { value: 'documentary', label: 'Documentary', description: 'Non-fiction film/series', category: 'documentary', formatTags: ['linear', 'theme_driven'], distributionTags: ['theatrical', 'ott'] },
  { value: 'experimental', label: 'Experimental', description: 'Non-traditional narrative form', category: 'experimental', formatTags: ['non_linear', 'experimental'], distributionTags: ['festival', 'streaming'] },
  
  // Comic/Sequential Art - Extended Types
  { value: 'comic', label: 'Comic/Graphic Novel', description: 'Sequential art storytelling', category: 'film', formatTags: ['linear', 'episodic'], distributionTags: ['print', 'digital'] },
  { value: 'comic_series', label: 'Comic Series', description: 'Ongoing comic book series', category: 'film', formatTags: ['episodic', 'serialized'], distributionTags: ['print', 'digital'] },
  { value: 'graphic_novel', label: 'Graphic Novel', description: 'Complete graphic novel story', category: 'film', formatTags: ['linear', 'long_form'], distributionTags: ['print', 'digital'] },
  { value: 'limited_comic_series', label: 'Limited Series', description: 'Finite comic series (4-12 issues)', category: 'film', formatTags: ['serialized'], distributionTags: ['print', 'digital'] },
  { value: 'anthology_comic', label: 'Comic Anthology', description: 'Collection of short comic stories', category: 'film', formatTags: ['anthology', 'short_form'], distributionTags: ['print', 'digital'] },
];

// Legacy script type mapping for database compatibility
export const LEGACY_SCRIPT_TYPE_MAP: Record<string, string> = {
  'feature': 'feature_film',
  'pilot': 'tv_series',
  'episode': 'tv_series',
  'short': 'short_film',
  'documentary': 'documentary',
  'comic': 'comic',
};

// Simplified types for backward compatibility with existing DB enum
export const SIMPLE_SCRIPT_TYPES = [
  { value: 'feature', label: 'Feature Film', description: 'Full-length theatrical film' },
  { value: 'pilot', label: 'TV Pilot', description: 'First episode of a TV series' },
  { value: 'episode', label: 'TV Episode', description: 'Regular series episode' },
  { value: 'short', label: 'Short Film', description: 'Short-form narrative' },
  { value: 'documentary', label: 'Documentary', description: 'Non-fiction film' },
  { value: 'comic', label: 'Comic/Graphic Novel', description: 'Sequential art storytelling' },
  { value: 'web_series', label: 'Web Series', description: 'Digital-first episodic content' },
  { value: 'micro_drama', label: 'Micro Drama', description: 'Ultra-short vertical content (30-180 sec)' },
];

// ============= FORMAT, DISTRIBUTION, NARRATIVE, INTERACTION TAGS =============

export const FORMAT_TAGS = [
  'linear', 'non_linear', 'episodic', 'serialized', 'anthology',
  'single_location', 'multi_location', 'time_compressed', 'long_form', 'short_form'
];

export const DISTRIBUTION_TAGS = [
  'theatrical', 'ott', 'streaming', 'youtube', 'social_media',
  'gaming_platform', 'live_performance', 'audio_only', 'internal_enterprise'
];

export const NARRATIVE_TAGS = [
  'character_driven', 'plot_driven', 'theme_driven', 'spectacle_driven',
  'dialogue_heavy', 'action_heavy', 'psychological', 'experimental', 'educational'
];

export const INTERACTION_TAGS = [
  'passive_viewing', 'choice_based', 'branching', 'replayable', 'adaptive', 'audience_influenced'
];

// ============= AGENT DEFINITIONS =============

export type AgentCategory = 'system' | 'analysis' | 'comic' | 'meta' | 'enrichment';

export interface AgentDefinition {
  id: string;
  name: string;
  category: AgentCategory;
  description: string;
  parameters: string[];
  reportSections: string[];
  applicableScriptTypes: string[] | 'all';
  color: string;
  icon: string; // Lucide icon name
}

// System Agents (Pre-processing & Meta)
export const SYSTEM_AGENTS: AgentDefinition[] = [
  {
    id: 'IntakeNormalizerAgent',
    name: 'Intake Normalizer',
    category: 'system',
    description: 'Converts any incoming narrative material into canonical format for downstream agents',
    parameters: ['input_completeness', 'normalization_quality'],
    reportSections: [],
    applicableScriptTypes: 'all',
    color: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
    icon: 'FileInput'
  },
  {
    id: 'ScriptTypeClassifierAgent',
    name: 'Script Type Classifier',
    category: 'system',
    description: 'Determines the most appropriate script type(s) and context tags',
    parameters: ['classification_confidence', 'type_clarity'],
    reportSections: ['Project Snapshot'],
    applicableScriptTypes: 'all',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    icon: 'Tag'
  },
  {
    id: 'ClassifierArbitrationAgent',
    name: 'Classifier Arbitration',
    category: 'system',
    description: 'Validates and arbitrates classification when confidence is below threshold',
    parameters: ['arbitration_required', 'final_confidence'],
    reportSections: ['Project Snapshot'],
    applicableScriptTypes: 'all',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    icon: 'Scale'
  },
  {
    id: 'MultiTypeBlendingAgent',
    name: 'Multi-Type Blending',
    category: 'system',
    description: 'Handles hybrid scripts that span multiple types, adjusting parameter weights',
    parameters: ['blend_complexity', 'weight_adjustments'],
    reportSections: [],
    applicableScriptTypes: 'all',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    icon: 'Blend'
  },
];

// Meta Agents (Post-processing & Feedback)
export const META_AGENTS: AgentDefinition[] = [
  {
    id: 'ScriptEvolutionAgent',
    name: 'Script Evolution Detection',
    category: 'meta',
    description: 'Detects when a project shifts format over multiple versions',
    parameters: ['evolution_detected', 'reclassification_recommended'],
    reportSections: ['Project Snapshot'],
    applicableScriptTypes: 'all',
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/30',
    icon: 'GitBranch'
  },
  {
    id: 'CreatorFeedbackLoopAgent',
    name: 'Creator Feedback Loop',
    category: 'meta',
    description: 'Learns from creator revisions without rewriting, updates confidence',
    parameters: ['improvements_detected', 'regressions_detected', 'confidence_shift'],
    reportSections: ['Rewrite Priorities'],
    applicableScriptTypes: 'all',
    color: 'bg-green-500/10 text-green-500 border-green-500/30',
    icon: 'RefreshCw'
  },
  {
    id: 'ExplainabilityTraceAgent',
    name: 'Explainability Trace',
    category: 'meta',
    description: 'Provides transparent reasoning trails for all Pulse decisions',
    parameters: ['decision_transparency', 'trace_completeness'],
    reportSections: [],
    applicableScriptTypes: 'all',
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
    icon: 'Search'
  },
  {
    id: 'InvestorReadinessAgent',
    name: 'Investor & Studio Readiness',
    category: 'meta',
    description: 'Re-scores analysis from commercial decision-maker lens',
    parameters: ['readiness_score', 'market_clarity', 'budget_realism', 'platform_fit', 'franchise_scalability'],
    reportSections: ['Stakeholder Report', 'Marketability'],
    applicableScriptTypes: 'all',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    icon: 'Briefcase'
  },
  {
    id: 'SeriesBibleAgent',
    name: 'Series Bible',
    category: 'meta',
    description: 'Synthesizes core premise, world rules, tonal guardrails, character trajectories, and series engine from existing agent outputs into a structured series bible',
    parameters: ['bible_premise_clarity', 'bible_world_rules', 'bible_tonal_consistency', 'bible_character_trajectories', 'bible_series_engine'],
    reportSections: ['Series Bible'],
    applicableScriptTypes: 'all',
    color: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
    icon: 'BookOpen'
  },
];

// Core Analysis Agents (Modules A-J)
export const CORE_AGENTS: AgentDefinition[] = [
  {
    id: 'ConceptAgent',
    name: 'Concept & Hook',
    category: 'analysis',
    description: 'Evaluates foundational concept, originality, and pitch clarity',
    parameters: ['concept_originality', 'familiarity_anchor', 'hook_clarity', 'concept_compressibility', 'concept_scalability', 'franchise_expandability'],
    reportSections: ['Concept & Hook', 'Marketability'],
    applicableScriptTypes: 'all',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    icon: 'Lightbulb'
  },
  {
    id: 'StructureAgent',
    name: 'Structure',
    category: 'analysis',
    description: 'Analyzes narrative structure without assuming fixed format',
    parameters: ['inciting_force_clarity', 'escalation_logic', 'midpoint_transformation', 'structural_symmetry', 'repetition_vs_progression', 'resolution_satisfaction', 'drop_off_risk'],
    reportSections: ['Structural Engineering', 'Plot Analysis', 'Scene Economy'],
    applicableScriptTypes: 'all',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    icon: 'GitBranch'
  },
  {
    id: 'CharacterAgent',
    name: 'Character & Agency',
    category: 'analysis',
    description: 'Analyzes character depth, arcs, and performative opportunities',
    parameters: ['want_vs_need', 'psychological_flaw_depth', 'agency_level', 'decision_density', 'transformation_credibility', 'character_balance', 'performative_range'],
    reportSections: ['Protagonist Analysis', 'Antagonist Analysis', 'Supporting Cast', 'Character Psychology'],
    applicableScriptTypes: 'all',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    icon: 'Users'
  },
  {
    id: 'ConflictAgent',
    name: 'Conflict & Stakes',
    category: 'analysis',
    description: 'Evaluates conflict diversity, density, and stakes escalation',
    parameters: ['conflict_type_diversity', 'conflict_density', 'stakes_personalization', 'escalation_irreversibility', 'cost_of_failure', 'internal_external_balance'],
    reportSections: ['Plot Analysis', 'Structural Engineering'],
    applicableScriptTypes: 'all',
    color: 'bg-red-500/10 text-red-500 border-red-500/30',
    icon: 'Swords'
  },
  {
    id: 'ThemeAgent',
    name: 'Theme & Meaning',
    category: 'analysis',
    description: 'Extracts thematic spine and evaluates depth, resonance, and tonal consistency',
    parameters: ['thematic_spine_clarity', 'show_vs_tell_ratio', 'symbol_motif_consistency', 'moral_complexity', 'cultural_resonance', 'longevity_of_meaning', 'tone_genre_cohesion'],
    reportSections: ['Theme & Moral', 'Emotional Resonance'],
    applicableScriptTypes: 'all',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    icon: 'Palette'
  },
  {
    id: 'DialogueAgent',
    name: 'Dialogue & Language',
    category: 'analysis',
    description: 'Analyzes dialogue quality, subtext, and medium appropriateness',
    parameters: ['exposition_load', 'subtext_density', 'voice_differentiation', 'rhythm_and_silence', 'quotability', 'medium_appropriateness'],
    reportSections: ['Dialogue & Subtext'],
    applicableScriptTypes: 'all',
    color: 'bg-violet-500/10 text-violet-500 border-violet-500/30',
    icon: 'MessageSquare'
  },
  {
    id: 'WorldLogicAgent',
    name: 'World & Logic',
    category: 'analysis',
    description: 'Evaluates internal logic, setting agency, and continuity',
    parameters: ['world_rule_consistency', 'setting_agency', 'spatial_system_logic', 'plausibility', 'continuity_integrity', 'suspension_of_disbelief'],
    reportSections: ['Visual Storytelling', 'Production'],
    applicableScriptTypes: 'all',
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
    icon: 'Globe'
  },
  {
    id: 'EmotionalArcAgent',
    name: 'Emotional Arc',
    category: 'analysis',
    description: 'Maps emotional intensity and evaluates audience experience',
    parameters: ['emotional_range', 'emotional_timing', 'emotional_progression', 'catharsis_strength', 'fatigue_vs_variety', 'payoff_delay'],
    reportSections: ['Emotional Resonance', 'Character Psychology'],
    applicableScriptTypes: 'all',
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
    icon: 'Heart'
  },
  {
    id: 'MarketAgent',
    name: 'Market & Platform',
    category: 'analysis',
    description: 'Evaluates commercial positioning and platform fit',
    parameters: ['audience_fit', 'platform_fit', 'consumption_pattern_alignment', 'marketing_hook_density', 'ip_expansion_potential', 'localization_ease'],
    reportSections: ['Marketability', 'Audience Strategy'],
    applicableScriptTypes: 'all',
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    icon: 'TrendingUp'
  },
  {
    id: 'ExecutionAgent',
    name: 'Execution & Feasibility',
    category: 'analysis',
    description: 'Assesses production risks and execution challenges',
    parameters: ['production_complexity', 'talent_dependency', 'technical_dependency', 'schedule_risk', 'compliance_sensitivity_risk', 'failure_modes'],
    reportSections: ['Production', 'Rewrite Priorities'],
    applicableScriptTypes: 'all',
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    icon: 'Cog'
  },
];

// Comic-Specific Agents (Updated per Comics & Graphic Novels Framework)
export const COMIC_AGENTS: AgentDefinition[] = [
  {
    id: 'PanelFlowAgent',
    name: 'Panel Flow',
    category: 'comic',
    description: 'Analyzes panel composition, page layout, visual storytelling, action clarity, and panel economy',
    parameters: ['panel_composition', 'page_layout', 'visual_storytelling', 'action_clarity', 'panel_economy'],
    reportSections: ['Visual Storytelling', 'Panel Flow', 'Sequential Art'],
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
    icon: 'Layers'
  },
  {
    id: 'LetteringBalloonAgent',
    name: 'Lettering & Balloon',
    category: 'comic',
    description: 'Evaluates balloon efficiency, caption voice, sound effects, dialogue load, balloon engineering, and reading flow',
    parameters: ['balloon_efficiency', 'caption_voice', 'sound_effects', 'dialogue_load', 'balloon_engineering', 'reading_flow'],
    reportSections: ['Dialogue & Subtext', 'Lettering', 'Balloon Efficiency'],
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/30',
    icon: 'MessageCircle'
  },
  {
    id: 'PageTurnImpactAgent',
    name: 'Page-Turn Impact',
    category: 'comic',
    description: 'Evaluates panel-to-panel flow, cliffhangers, issue structure, and emotional payload per page',
    parameters: ['panel_to_panel_flow', 'cliffhangers', 'issue_structure', 'emotional_payload_per_page'],
    reportSections: ['Scene Economy', 'Pacing', 'Issue Structure'],
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    color: 'bg-lime-500/10 text-lime-500 border-lime-500/30',
    icon: 'BookOpen'
  },
  {
    id: 'ArtScriptSynergyAgent',
    name: 'Art-Script Synergy',
    category: 'comic',
    description: 'Evaluates artist guidance, reference clarity, style consistency, and character visual identity',
    parameters: ['artist_guidance', 'reference_clarity', 'style_consistency', 'character_visual_identity'],
    reportSections: ['Visual Storytelling', 'Art Direction'],
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    color: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/30',
    icon: 'Palette'
  },
];

// Interactive/Game-Specific Agents
export const INTERACTIVE_AGENTS: AgentDefinition[] = [
  {
    id: 'InteractivityAgent',
    name: 'Interactivity',
    category: 'analysis',
    description: 'Evaluates branching, choice design, and player agency',
    parameters: ['branching_quality', 'choice_impact', 'player_agency', 'replayability'],
    reportSections: ['Interactivity Analysis'],
    applicableScriptTypes: ['game_narrative', 'interactive_fiction'],
    color: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
    icon: 'Gamepad2'
  },
  {
    id: 'WorldBuildingAgent',
    name: 'World Building',
    category: 'analysis',
    description: 'Deep evaluation of world/lore for franchise and game narratives',
    parameters: ['lore_depth', 'world_consistency', 'exploration_reward', 'faction_clarity'],
    reportSections: ['World Building'],
    applicableScriptTypes: ['game_narrative', 'feature_film', 'tv_series'],
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    icon: 'Map'
  },
];

// Audio-Specific Agents
export const AUDIO_AGENTS: AgentDefinition[] = [
  {
    id: 'AudioNarrativeAgent',
    name: 'Audio Narrative',
    category: 'analysis',
    description: 'Evaluates audio-only storytelling techniques',
    parameters: ['audio_scene_setting', 'voice_cast_requirements', 'sound_design_cues', 'listener_engagement'],
    reportSections: ['Audio Production'],
    applicableScriptTypes: ['audio_drama', 'podcast_fiction'],
    color: 'bg-violet-500/10 text-violet-500 border-violet-500/30',
    icon: 'Mic'
  },
];

// Web Series Agents
export const WEB_SERIES_AGENTS: AgentDefinition[] = [
  {
    id: 'WebSeriesAgent',
    name: 'Web Series',
    category: 'analysis',
    description: 'Analyzes digital-first episodic content with algorithmic discovery optimization. Evaluates hook efficiency, retention curves, and platform-native storytelling for web-native formats.',
    parameters: [
      'hook_efficiency', 'episode_self_containment', 'serial_momentum',
      'retention_curve_design', 'character_stickiness', 'platform_native_storytelling',
      'tonality_format_consistency', 'production_simplicity_velocity',
      'shareability_meme_potential', 'monetization_readiness',
      'mid_episode_rehooking', 'soft_act_integrity', 'binge_continuity_pressure'
    ],
    reportSections: ['Web Series Analysis', 'Retention Analysis', 'Hooks Analysis', 'Platform Strategy'],
    applicableScriptTypes: ['web_series'],
    color: 'bg-pink-500/10 text-pink-500 border-pink-500/30',
    icon: 'Play'
  },
];

// Micro Drama Agents
export const MICRO_DRAMA_AGENTS: AgentDefinition[] = [
  {
    id: 'MicroDramaAgent',
    name: 'Micro Drama',
    category: 'analysis',
    description: 'Analyzes ultra-short vertical content (30-180 sec) optimized for scroll-stopping, emotional compression, and cliff density. Evaluates hook velocity, cliff density, and character legibility at speed.',
    parameters: [
      'hook_velocity', 'cliff_density', 'emotional_compression',
      'character_legibility_at_speed', 'scroll_stop_power', 'vertical_format_optimization',
      'dialogue_efficiency', 'visual_hook_density', 'replay_value', 'series_hook'
    ],
    reportSections: ['Micro Drama Analysis', 'Hook Analysis', 'Compression Analysis'],
    applicableScriptTypes: ['micro_drama'],
    color: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/30',
    icon: 'Zap'
  },
];

// Enrichment Agents (Scene-level AI analysis)
export const ENRICHMENT_AGENTS: AgentDefinition[] = [
  {
    id: 'SceneEnrichmentAgent',
    name: 'Scene Enrichment',
    category: 'enrichment',
    description: 'Analyzes each scene for emotional tone, dialogue density, action intensity, technical requirements, VFX potential, and narrative function',
    parameters: ['dialogue_density', 'action_intensity', 'technical_requirements', 'vfx_potential', 'location_complexity', 'emotional_tone', 'narrative_function'],
    reportSections: ['Scene Complexity', 'Pacing Analysis', 'Scene Heatmap'],
    applicableScriptTypes: 'all',
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
    icon: 'ScanSearch'
  },
];

// All agents combined
export const ALL_AGENTS: AgentDefinition[] = [
  ...SYSTEM_AGENTS,
  ...CORE_AGENTS,
  ...COMIC_AGENTS,
  ...INTERACTIVE_AGENTS,
  ...AUDIO_AGENTS,
  ...WEB_SERIES_AGENTS,
  ...MICRO_DRAMA_AGENTS,
  ...ENRICHMENT_AGENTS,
  ...META_AGENTS,
];

// Agent name lookup for quick access
export const AGENT_BY_ID = Object.fromEntries(ALL_AGENTS.map(a => [a.id, a]));

// Get agents applicable for a script type
export function getAgentsForScriptType(scriptType: string): AgentDefinition[] {
  const normalizedType = LEGACY_SCRIPT_TYPE_MAP[scriptType] || scriptType;
  
  return ALL_AGENTS.filter(agent => {
    if (agent.applicableScriptTypes === 'all') return true;
    return agent.applicableScriptTypes.includes(normalizedType) || 
           agent.applicableScriptTypes.includes(scriptType);
  });
}

// Get analysis agents only (no system/meta)
export function getAnalysisAgentsForScriptType(scriptType: string): AgentDefinition[] {
  return getAgentsForScriptType(scriptType).filter(a => 
    a.category === 'analysis' || a.category === 'comic' || a.category === 'enrichment'
  );
}

// Get all agent IDs for a script type (for backward compatibility)
export function getAgentIdsForScriptType(scriptType: string): string[] {
  return getAnalysisAgentsForScriptType(scriptType).map(a => a.id);
}

// ============= CONFIDENCE VISUALIZATION =============

export interface ConfidenceLevel {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}

export const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  { min: 0.9, max: 1.0, label: 'Very High', color: 'text-green-500', description: 'Very clear classification' },
  { min: 0.7, max: 0.89, label: 'High', color: 'text-emerald-500', description: 'Clear with minor ambiguity' },
  { min: 0.5, max: 0.69, label: 'Medium', color: 'text-amber-500', description: 'Ambiguous but best-fit' },
  { min: 0, max: 0.49, label: 'Low', color: 'text-red-500', description: 'Highly ambiguous - review recommended' },
];

export function getConfidenceLevel(score: number): ConfidenceLevel {
  return CONFIDENCE_LEVELS.find(l => score >= l.min && score <= l.max) || CONFIDENCE_LEVELS[3];
}

// ============= PROMPT VERSIONING =============

export interface PromptVersion {
  version: string;
  changeDate: string;
  changeSummary: string;
}

export const CURRENT_PROMPT_VERSION = '2.0.0';
export const PROMPT_VERSION_HISTORY: PromptVersion[] = [
  { version: '2.0.0', changeDate: '2024-12-29', changeSummary: 'Universal Script Analysis Framework - expanded script types, system agents, meta agents' },
  { version: '1.0.0', changeDate: '2024-12-01', changeSummary: 'Initial USAF implementation with 10 core agents + 4 comic agents' },
];
