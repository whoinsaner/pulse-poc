-- Add UASF Module A-J parameters
INSERT INTO public.parameters (name, display_name, description, category, agent_source) VALUES
-- MODULE A: CONCEPT & HOOK (ConceptAgent)
('concept_originality', 'Concept Originality', 'Freshness of the core idea', 'Concept & Hook', 'ConceptAgent'),
('familiarity_anchor', 'Familiarity Anchor', 'Connection to known genres/tropes that aid comprehension', 'Concept & Hook', 'ConceptAgent'),
('hook_clarity', 'Hook Clarity', 'Can it be pitched in 10 seconds? 1 minute? Logline quality?', 'Concept & Hook', 'ConceptAgent'),
('concept_compressibility', 'Concept Compressibility', 'How easily the concept communicates', 'Concept & Hook', 'ConceptAgent'),
('concept_scalability', 'Concept Scalability', 'Can it support a full narrative?', 'Concept & Hook', 'ConceptAgent'),
('franchise_expandability', 'Franchise Expandability', 'Potential for sequels, spinoffs, extended universe', 'Concept & Hook', 'ConceptAgent'),

-- MODULE B: STRUCTURAL INTELLIGENCE (StructureAgent)
('inciting_force_clarity', 'Inciting Force Clarity', 'When and how clearly the story-launching event occurs', 'Structure', 'StructureAgent'),
('escalation_logic', 'Escalation Logic', 'Cause-effect chain quality', 'Structure', 'StructureAgent'),
('midpoint_transformation', 'Midpoint Transformation', 'Whether there is a meaningful shift at the narrative center', 'Structure', 'StructureAgent'),
('structural_symmetry', 'Structural Symmetry', 'Balance and proportion of story segments', 'Structure', 'StructureAgent'),
('repetition_vs_progression', 'Repetition vs Progression', 'Whether patterns serve meaning or indicate stagnation', 'Structure', 'StructureAgent'),
('resolution_satisfaction', 'Resolution Satisfaction', 'How completely the narrative questions are addressed', 'Structure', 'StructureAgent'),
('drop_off_risk', 'Drop-off Risk Points', 'Where audience attention/engagement may falter', 'Structure', 'StructureAgent'),

-- MODULE C: CHARACTER & AGENCY (CharacterAgent)
('want_vs_need', 'Want vs Need', 'Clarity of external goals vs internal needs', 'Character', 'CharacterAgent'),
('psychological_flaw_depth', 'Psychological Flaw Depth', 'Complexity of character flaws', 'Character', 'CharacterAgent'),
('agency_level', 'Agency Level', 'Proactive vs reactive behavior', 'Character', 'CharacterAgent'),
('decision_density', 'Decision Density', 'Frequency and impact of character choices', 'Character', 'CharacterAgent'),
('transformation_credibility', 'Transformation Credibility', 'Whether arcs feel earned', 'Character', 'CharacterAgent'),
('character_balance', 'Character Balance', 'Whether any character overshadows others inappropriately', 'Character', 'CharacterAgent'),
('performative_range', 'Performative Range', 'Range of emotion/action required for actors', 'Character', 'CharacterAgent'),

-- MODULE D: CONFLICT & STAKES (ConflictAgent)
('conflict_type_diversity', 'Conflict Type Diversity', 'Variety of conflict forms (interpersonal, internal, societal, etc.)', 'Conflict', 'ConflictAgent'),
('conflict_density', 'Conflict Density', 'Appropriate frequency of conflict beats', 'Conflict', 'ConflictAgent'),
('stakes_personalization', 'Stakes Personalization', 'How personally meaningful the stakes are to characters', 'Conflict', 'ConflictAgent'),
('escalation_irreversibility', 'Escalation Irreversibility', 'Whether stakes genuinely increase (cannot go back)', 'Conflict', 'ConflictAgent'),
('cost_of_failure', 'Cost of Failure', 'What characters stand to lose', 'Conflict', 'ConflictAgent'),
('internal_external_balance', 'Internal vs External Balance', 'Mix of psychological and situational conflict', 'Conflict', 'ConflictAgent'),

-- MODULE E: THEME & MEANING (ThemeAgent)
('thematic_spine_clarity', 'Thematic Spine Clarity', 'How clearly the central theme can be identified', 'Theme', 'ThemeAgent'),
('show_vs_tell_ratio', 'Show vs Tell Ratio', 'Whether theme emerges from action vs explicit statement', 'Theme', 'ThemeAgent'),
('symbol_motif_consistency', 'Symbol/Motif Consistency', 'Coherent use of recurring imagery', 'Theme', 'ThemeAgent'),
('moral_complexity', 'Moral Complexity', 'Avoidance of simplistic moralizing', 'Theme', 'ThemeAgent'),
('cultural_resonance', 'Cultural Resonance', 'Connection to broader cultural conversations', 'Theme', 'ThemeAgent'),
('longevity_of_meaning', 'Longevity of Meaning', 'Whether themes will remain relevant', 'Theme', 'ThemeAgent'),

-- MODULE F: DIALOGUE & LANGUAGE (DialogueAgent)
('exposition_load', 'Exposition Load', 'How much dialogue serves only to inform the audience', 'Dialogue', 'DialogueAgent'),
('subtext_density', 'Subtext Density', 'Meaning beneath the surface of conversations', 'Dialogue', 'DialogueAgent'),
('voice_differentiation', 'Voice Differentiation', 'How unique each character speech patterns are', 'Dialogue', 'DialogueAgent'),
('rhythm_and_silence', 'Rhythm & Silence', 'Pacing of verbal exchanges, use of pauses', 'Dialogue', 'DialogueAgent'),
('quotability', 'Quotability', 'Memorable lines that could be repeated', 'Dialogue', 'DialogueAgent'),
('medium_appropriateness', 'Medium Appropriateness', 'Fit for stage, audio, screen, or text', 'Dialogue', 'DialogueAgent'),

-- MODULE G: WORLD & LOGIC (WorldLogicAgent)
('world_rule_consistency', 'World Rule Consistency', 'Whether established rules are followed', 'World & Logic', 'WorldLogicAgent'),
('setting_agency', 'Setting Agency', 'Whether the world actively shapes the story', 'World & Logic', 'WorldLogicAgent'),
('spatial_system_logic', 'Spatial/System Logic', 'Physical and systemic coherence', 'World & Logic', 'WorldLogicAgent'),
('plausibility', 'Plausibility', 'Believability within the story own terms', 'World & Logic', 'WorldLogicAgent'),
('continuity_integrity', 'Continuity Integrity', 'Consistency of details across the narrative', 'World & Logic', 'WorldLogicAgent'),
('suspension_of_disbelief', 'Suspension of Disbelief', 'How easily the audience can accept the premise', 'World & Logic', 'WorldLogicAgent'),

-- MODULE H: EMOTIONAL ARC (EmotionalArcAgent)
('emotional_range', 'Emotional Range', 'Variety of emotions evoked', 'Emotional Arc', 'EmotionalArcAgent'),
('emotional_timing', 'Emotional Timing', 'Placement of emotional beats', 'Emotional Arc', 'EmotionalArcAgent'),
('emotional_progression', 'Emotional Progression', 'How emotions build and evolve', 'Emotional Arc', 'EmotionalArcAgent'),
('catharsis_strength', 'Catharsis Strength', 'Power of emotional release moments', 'Emotional Arc', 'EmotionalArcAgent'),
('fatigue_vs_variety', 'Fatigue vs Variety', 'Balance to prevent emotional exhaustion', 'Emotional Arc', 'EmotionalArcAgent'),
('payoff_delay', 'Payoff Delay', 'Effectiveness of delayed emotional gratification', 'Emotional Arc', 'EmotionalArcAgent'),

-- MODULE I: MARKET & PLATFORM (MarketAgent)
('audience_fit', 'Audience Fit', 'Match between content and target audience', 'Market', 'MarketAgent'),
('platform_fit', 'Platform Fit', 'Suitability for distribution channel', 'Market', 'MarketAgent'),
('consumption_pattern_alignment', 'Consumption Pattern Alignment', 'Match to how audiences consume this type of content', 'Market', 'MarketAgent'),
('marketing_hook_density', 'Marketing Hook Density', 'Number of easily marketable elements', 'Market', 'MarketAgent'),
('ip_expansion_potential', 'IP Expansion Potential', 'Franchise/sequel/spinoff possibilities', 'Market', 'MarketAgent'),
('localization_ease', 'Localization Ease', 'Ease of adaptation for international markets', 'Market', 'MarketAgent'),

-- MODULE J: EXECUTION & FEASIBILITY (ExecutionAgent)
('production_complexity', 'Production Complexity', 'Overall difficulty of production', 'Execution', 'ExecutionAgent'),
('talent_dependency', 'Talent Dependency', 'Reliance on specific star power', 'Execution', 'ExecutionAgent'),
('technical_dependency', 'Technical Dependency', 'VFX, stunts, special requirements', 'Execution', 'ExecutionAgent'),
('schedule_risk', 'Schedule Risk', 'Timeline feasibility', 'Execution', 'ExecutionAgent'),
('compliance_sensitivity_risk', 'Compliance/Sensitivity Risk', 'Content that may face regulatory or cultural issues', 'Execution', 'ExecutionAgent'),
('failure_modes', 'Failure Modes', 'How the project could fail in execution', 'Execution', 'ExecutionAgent')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  agent_source = EXCLUDED.agent_source;