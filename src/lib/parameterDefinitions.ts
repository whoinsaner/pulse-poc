/**
 * Parameter Definitions with Descriptions
 * Each parameter includes a description of what it evaluates and how scoring works
 */

export interface ParameterDefinition {
  id: string;
  name: string;
  displayName: string;
  category: string;
  agentSource: string;
  description: string;
  scoringGuide: string;
  applicableScriptTypes: string[] | 'all';
  weight: number; // Default weight (1.0 = neutral)
  longFormOnly?: boolean; // For web series long-form parameters
}

// ============= COMICS-SPECIFIC PARAMETERS (10 Core Parameters) =============

export const COMIC_PARAMETERS: ParameterDefinition[] = [
  // Panel Flow Agent Parameters
  {
    id: 'sequential_storytelling_integrity',
    name: 'sequential_storytelling_integrity',
    displayName: 'Sequential Storytelling Integrity',
    category: 'Comic Visuals',
    agentSource: 'PanelFlowAgent',
    description: 'Measures cause-effect clarity across panels. Evaluates whether each panel logically follows from the previous one, creating a seamless narrative flow that readers can follow without confusion.',
    scoringGuide: '9-10: Crystal-clear panel transitions, perfect cause-effect chain. 7-8: Strong flow with minor ambiguities. 5-6: Readable but some confusing transitions. 3-4: Frequent logic gaps between panels. 1-2: Disjointed, incoherent panel sequences.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 1.4, // 14% weight as per framework
  },
  {
    id: 'panel_economy',
    name: 'panel_economy',
    displayName: 'Panel Economy & Page Architecture',
    category: 'Comic Visuals',
    agentSource: 'PanelFlowAgent',
    description: 'Evaluates panels-per-page efficiency, rhythm variation, and page-turn reveals. Assesses whether panel count and layout serve the story optimally without overcrowding or wasting space.',
    scoringGuide: '9-10: Perfect panel economy, intentional rhythm, masterful page-turns. 7-8: Strong layouts with occasional inefficiencies. 5-6: Functional but lacks dynamic variation. 3-4: Overcrowded or sparse pages, weak reveals. 1-2: No understanding of comic page architecture.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 1.2, // 12% weight
  },
  {
    id: 'page_architecture',
    name: 'page_architecture',
    displayName: 'Page Architecture',
    category: 'Comic Visuals',
    agentSource: 'PanelFlowAgent',
    description: 'Analyzes the structural design of each page including grid systems, panel shapes, bleeds, and how layout choices enhance storytelling moments.',
    scoringGuide: '9-10: Innovative layouts that serve story perfectly. 7-8: Strong, varied page designs. 5-6: Standard layouts, functional but unremarkable. 3-4: Repetitive or poorly suited layouts. 1-2: Chaotic or confusing page structures.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 1.0,
  },
  
  // Art-Script Synergy Agent Parameters
  {
    id: 'art_writing_synergy',
    name: 'art_writing_synergy',
    displayName: 'Art–Writing Synergy',
    category: 'Comic Collaboration',
    agentSource: 'ArtScriptSynergyAgent',
    description: 'Measures the balance between visual and textual storytelling. Evaluates dialogue redundancy versus visual storytelling, ensuring text enhances rather than describes what images already show.',
    scoringGuide: '9-10: Perfect harmony—art and text complement without overlap. 7-8: Strong synergy with rare redundancy. 5-6: Some "telling what we see" issues. 3-4: Heavy redundancy, underusing visuals. 1-2: Prose-in-panels syndrome, art ignored.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 1.3, // 13% weight
  },
  {
    id: 'character_visual_identity',
    name: 'character_visual_identity',
    displayName: 'Character Visual Identity',
    category: 'Comic Characters',
    agentSource: 'ArtScriptSynergyAgent',
    description: 'Evaluates distinctiveness of character silhouettes and emotional readability. Characters should be instantly recognizable from their visual design alone.',
    scoringGuide: '9-10: Iconic silhouettes, clear emotional expressions. 7-8: Distinct designs, good expressiveness. 5-6: Adequate distinction, some confusion possible. 3-4: Generic designs, hard to tell characters apart. 1-2: Indistinct, emotionally unreadable characters.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 1.0, // 10% weight
  },
  {
    id: 'collaboration_readiness',
    name: 'collaboration_readiness',
    displayName: 'Collaboration Readiness Index',
    category: 'Comic Production',
    agentSource: 'ArtScriptSynergyAgent',
    description: 'Measures script clarity for artists, letterers, and colorists. Evaluates whether the script provides sufficient direction without over-prescribing creative choices.',
    scoringGuide: '9-10: Production-ready script, clear for entire team. 7-8: Minor clarifications needed. 5-6: Requires artist interpretation or questions. 3-4: Ambiguous, will cause production delays. 1-2: Unusable without major revision.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.6, // 6% weight
  },
  {
    id: 'production_pipeline_awareness',
    name: 'production_pipeline_awareness',
    displayName: 'Production Pipeline Awareness',
    category: 'Comic Production',
    agentSource: 'ArtScriptSynergyAgent',
    description: 'Assesses feasibility across the full pipeline: penciling, inking, coloring, and lettering. Identifies demands that may bottleneck production.',
    scoringGuide: '9-10: Fully production-aware, smooth pipeline flow. 7-8: Minor production challenges identified. 5-6: Some demanding sequences to manage. 3-4: Significant pipeline bottlenecks. 1-2: Production-unaware, unrealistic demands.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.5, // 5% weight
  },
  {
    id: 'market_publishing_alignment',
    name: 'market_publishing_alignment',
    displayName: 'Market & Publishing Alignment',
    category: 'Comic Market',
    agentSource: 'ArtScriptSynergyAgent',
    description: 'Evaluates audience clarity, format fit (single issues vs. trades vs. OGN), and IP constraints. Assesses market positioning and publisher fit.',
    scoringGuide: '9-10: Perfect format/audience/publisher alignment. 7-8: Clear market positioning, minor adjustments. 5-6: Needs market clarification. 3-4: Unclear audience or format mismatch. 1-2: No market awareness.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.7, // 7% weight
  },

  // Lettering & Balloon Agent Parameters
  {
    id: 'dialogue_load',
    name: 'dialogue_load',
    displayName: 'Dialogue Load & Balloon Engineering',
    category: 'Comic Dialogue',
    agentSource: 'LetteringBalloonAgent',
    description: 'Measures balloon density, stacking, and reading flow. Evaluates whether dialogue fits comfortably in balloons and maintains readable panel flow.',
    scoringGuide: '9-10: Perfect balloon placement, optimal word counts. 7-8: Clean lettering with minor crowding. 5-6: Occasional balloon overload. 3-4: Frequent overcrowding, poor stacking. 1-2: Unreadable balloon density.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.9, // 9% weight
  },
  {
    id: 'balloon_engineering',
    name: 'balloon_engineering',
    displayName: 'Balloon Engineering',
    category: 'Comic Dialogue',
    agentSource: 'LetteringBalloonAgent',
    description: 'Evaluates technical aspects of balloon design including tail placement, reading order clarity, and integration with panel composition.',
    scoringGuide: '9-10: Expert-level balloon placement and flow. 7-8: Professional standard. 5-6: Adequate but could improve. 3-4: Confusing reading order. 1-2: Broken reading flow.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.8,
  },
  {
    id: 'reading_flow',
    name: 'reading_flow',
    displayName: 'Reading Flow',
    category: 'Comic Dialogue',
    agentSource: 'LetteringBalloonAgent',
    description: 'Measures how naturally the eye moves from balloon to balloon and panel to panel. Accounts for cultural reading direction (LTR/RTL) and natural eye movement.',
    scoringGuide: '9-10: Effortless reading flow, never lost. 7-8: Smooth with rare hesitation. 5-6: Occasional confusion about order. 3-4: Frequent backtracking required. 1-2: Incomprehensible reading path.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.8,
  },

  // Page-Turn Impact Agent Parameters
  {
    id: 'emotional_payload_per_page',
    name: 'emotional_payload_per_page',
    displayName: 'Emotional Payload per Page',
    category: 'Comic Pacing',
    agentSource: 'PageTurnImpactAgent',
    description: 'Evaluates whether each page carries clear emotional intention. Every page should contribute meaningfully to the emotional journey of the story.',
    scoringGuide: '9-10: Every page emotionally purposeful. 7-8: Strong emotional beats, few neutral pages. 5-6: Mixed—some pages feel empty. 3-4: Many pages lack emotional purpose. 1-2: Emotionally flat throughout.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.8, // 8% weight
  },
  {
    id: 'structural_modularity',
    name: 'structural_modularity',
    displayName: 'Structural Modularity',
    category: 'Comic Structure',
    agentSource: 'PageTurnImpactAgent',
    description: 'Measures issue-level arc quality and cliffhanger effectiveness. Each issue should work as a standalone unit while serving the larger story.',
    scoringGuide: '9-10: Perfect issue arcs, compelling cliffhangers. 7-8: Strong modularity, effective hooks. 5-6: Adequate structure, weak endings. 3-4: Issues feel incomplete or arbitrary. 1-2: No issue-level structure.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.8, // 8% weight
  },
  {
    id: 'page_turn_reveals',
    name: 'page_turn_reveals',
    displayName: 'Page-Turn Reveals',
    category: 'Comic Pacing',
    agentSource: 'PageTurnImpactAgent',
    description: 'Evaluates strategic use of page turns for reveals, surprises, and dramatic impact. The page turn is unique to comics and should be exploited effectively.',
    scoringGuide: '9-10: Masterful page-turn reveals, perfect timing. 7-8: Good use of page-turn drama. 5-6: Some missed opportunities. 3-4: Page turns feel random. 1-2: No awareness of page-turn potential.',
    applicableScriptTypes: ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'],
    weight: 0.9,
  },
];

// ============= CORE PARAMETERS (All Script Types) =============

export const CORE_PARAMETERS: ParameterDefinition[] = [
  // Concept Agent Parameters
  {
    id: 'concept_originality',
    name: 'concept_originality',
    displayName: 'Concept Originality',
    category: 'Concept & Hook',
    agentSource: 'ConceptAgent',
    description: 'Measures the freshness and uniqueness of the core story idea. Evaluates whether the concept offers something new to audiences while remaining accessible.',
    scoringGuide: '9-10: Genuinely fresh concept, never seen before. 7-8: Original take on familiar elements. 5-6: Competent but derivative. 3-4: Too familiar, hard to distinguish. 1-2: Completely unoriginal.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'familiarity_anchor',
    name: 'familiarity_anchor',
    displayName: 'Familiarity Anchor',
    category: 'Concept & Hook',
    agentSource: 'ConceptAgent',
    description: 'Evaluates connection to known genres, tropes, or cultural touchpoints that help audiences quickly understand the concept. The "X meets Y" factor.',
    scoringGuide: '9-10: Perfect balance of fresh and familiar. 7-8: Clear anchors without being derivative. 5-6: Adequate positioning. 3-4: Hard to categorize or too generic. 1-2: No recognizable anchors.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'hook_clarity',
    name: 'hook_clarity',
    displayName: 'Hook Clarity',
    category: 'Concept & Hook',
    agentSource: 'ConceptAgent',
    description: 'Measures how quickly and clearly the central hook can be communicated. Can it be pitched in 10 seconds? Does the logline immediately grab attention?',
    scoringGuide: '9-10: Instantly compelling, perfect logline. 7-8: Clear hook, strong pitch potential. 5-6: Hook exists but needs refinement. 3-4: Unclear or weak hook. 1-2: No discernible hook.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'concept_compressibility',
    name: 'concept_compressibility',
    displayName: 'Concept Compressibility',
    category: 'Concept & Hook',
    agentSource: 'ConceptAgent',
    description: 'Evaluates how easily the concept communicates across different formats—from tagline to synopsis to trailer. Essential for marketing.',
    scoringGuide: '9-10: Works at every length, highly marketable. 7-8: Strong compression, minor nuances lost. 5-6: Loses something in compression. 3-4: Requires lengthy explanation. 1-2: Cannot be effectively compressed.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'concept_scalability',
    name: 'concept_scalability',
    displayName: 'Concept Scalability',
    category: 'Concept & Hook',
    agentSource: 'ConceptAgent',
    description: 'Measures whether the concept can support a full narrative at the intended scope. For series, can it sustain multiple seasons?',
    scoringGuide: '9-10: Endless potential, naturally expandable. 7-8: Strong runway, clear extensions. 5-6: Adequate for intended format. 3-4: Struggles to fill runtime. 1-2: Cannot sustain full narrative.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'franchise_expandability',
    name: 'franchise_expandability',
    displayName: 'Franchise Expandability',
    category: 'Concept & Hook',
    agentSource: 'ConceptAgent',
    description: 'Evaluates potential for sequels, spinoffs, prequels, and extended universe development. Assesses IP exploitation potential.',
    scoringGuide: '9-10: Natural franchise DNA, multiple spin-off paths. 7-8: Strong sequel/expansion potential. 5-6: Could expand with effort. 3-4: Limited expansion potential. 1-2: Definitively closed story.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  
  // Structure Agent Parameters
  {
    id: 'inciting_force_clarity',
    name: 'inciting_force_clarity',
    displayName: 'Inciting Force Clarity',
    category: 'Structure',
    agentSource: 'StructureAgent',
    description: 'Measures when and how clearly the story-launching event occurs. The inciting incident should be unmistakable and properly timed.',
    scoringGuide: '9-10: Perfect timing, crystal-clear inciting moment. 7-8: Clear with strong placement. 5-6: Identifiable but could be sharper. 3-4: Muddy or poorly timed. 1-2: No clear inciting incident.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'escalation_logic',
    name: 'escalation_logic',
    displayName: 'Escalation Logic',
    category: 'Structure',
    agentSource: 'StructureAgent',
    description: 'Evaluates the cause-and-effect chain quality. Each story beat should logically follow from previous events, building tension progressively.',
    scoringGuide: '9-10: Flawless causal chain, inevitable escalation. 7-8: Strong logic with minor leaps. 5-6: Generally logical, some gaps. 3-4: Frequent logic gaps. 1-2: Random event sequences.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'midpoint_transformation',
    name: 'midpoint_transformation',
    displayName: 'Midpoint Transformation',
    category: 'Structure',
    agentSource: 'StructureAgent',
    description: 'Evaluates whether a meaningful shift occurs at the narrative center. The midpoint should change the direction or stakes of the story.',
    scoringGuide: '9-10: Powerful midpoint that redefines everything. 7-8: Clear transformation, raises stakes. 5-6: Some shift but could be stronger. 3-4: Weak or unclear midpoint. 1-2: No midpoint transformation.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'structural_symmetry',
    name: 'structural_symmetry',
    displayName: 'Structural Symmetry',
    category: 'Structure',
    agentSource: 'StructureAgent',
    description: 'Measures balance and proportion of story segments. Are acts appropriately weighted? Does the structure feel balanced?',
    scoringGuide: '9-10: Perfectly balanced, intentional structure. 7-8: Well-proportioned with purpose. 5-6: Adequate balance. 3-4: Unbalanced, rushed or dragging sections. 1-2: Severely imbalanced.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'repetition_vs_progression',
    name: 'repetition_vs_progression',
    displayName: 'Repetition vs Progression',
    category: 'Structure',
    agentSource: 'StructureAgent',
    description: 'Evaluates whether patterns serve meaning or indicate stagnation. Intentional repetition builds theme; unintentional repetition stalls narrative.',
    scoringGuide: '9-10: All repetition serves thematic purpose. 7-8: Mostly progressive, purposeful echoes. 5-6: Some stagnation. 3-4: Noticeable wheel-spinning. 1-2: Severely repetitive.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'resolution_satisfaction',
    name: 'resolution_satisfaction',
    displayName: 'Resolution Satisfaction',
    category: 'Structure',
    agentSource: 'StructureAgent',
    description: 'Measures how completely narrative questions are addressed. Endings should be satisfying (not necessarily happy) and earned.',
    scoringGuide: '9-10: Deeply satisfying, all threads resolved appropriately. 7-8: Strong resolution, minor loose ends. 5-6: Adequate closure. 3-4: Unsatisfying or rushed ending. 1-2: No resolution.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'drop_off_risk',
    name: 'drop_off_risk',
    displayName: 'Drop-off Risk Points',
    category: 'Structure',
    agentSource: 'StructureAgent',
    description: 'Identifies where audience attention/engagement may falter. Critical for streaming where viewers can easily stop watching.',
    scoringGuide: '9-10: No significant drop-off risks. 7-8: Minor lull points, recoverable. 5-6: Some risky slow sections. 3-4: Multiple drop-off danger zones. 1-2: High abandonment risk.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },

  // Character Agent Parameters
  {
    id: 'want_vs_need',
    name: 'want_vs_need',
    displayName: 'Want vs Need',
    category: 'Character',
    agentSource: 'CharacterAgent',
    description: 'Evaluates clarity of external goals versus internal needs. Great characters have a clear want (conscious goal) and a contrasting need (unconscious growth requirement).',
    scoringGuide: '9-10: Crystal-clear want/need distinction and tension. 7-8: Strong want/need, perhaps one is subtle. 5-6: Present but could be clearer. 3-4: Vague or absent. 1-2: No character want/need.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'psychological_flaw_depth',
    name: 'psychological_flaw_depth',
    displayName: 'Psychological Flaw Depth',
    category: 'Character',
    agentSource: 'CharacterAgent',
    description: 'Measures complexity of character flaws. Surface flaws are less interesting than deep psychological wounds that drive behavior.',
    scoringGuide: '9-10: Complex, layered psychological depth. 7-8: Meaningful flaws with history. 5-6: Standard flaws, functional. 3-4: Shallow or cliché flaws. 1-2: No discernible flaws.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'agency_level',
    name: 'agency_level',
    displayName: 'Agency Level',
    category: 'Character',
    agentSource: 'CharacterAgent',
    description: 'Evaluates proactive versus reactive behavior. Protagonists should drive the story through their choices, not be pushed by events.',
    scoringGuide: '9-10: Protagonist drives all major events. 7-8: Mostly proactive with some reaction. 5-6: Balanced but could be more active. 3-4: Mostly reactive. 1-2: Completely passive.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'decision_density',
    name: 'decision_density',
    displayName: 'Decision Density',
    category: 'Character',
    agentSource: 'CharacterAgent',
    description: 'Measures frequency and impact of character choices. Stories are built on decisions, and each significant choice reveals character.',
    scoringGuide: '9-10: Rich with meaningful decisions. 7-8: Regular impactful choices. 5-6: Adequate decision points. 3-4: Too few decisions. 1-2: No real choices made.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'transformation_credibility',
    name: 'transformation_credibility',
    displayName: 'Transformation Credibility',
    category: 'Character',
    agentSource: 'CharacterAgent',
    description: 'Evaluates whether character arcs feel earned. Change must be motivated, gradual where appropriate, and believable.',
    scoringGuide: '9-10: Deeply earned, fully believable transformation. 7-8: Strong arc, well-motivated. 5-6: Adequate but could use more setup. 3-4: Rushed or unmotivated change. 1-2: Unbelievable transformation.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'character_balance',
    name: 'character_balance',
    displayName: 'Character Balance',
    category: 'Character',
    agentSource: 'CharacterAgent',
    description: 'Assesses whether any character overshadows others inappropriately. Ensemble stories need balance; focused stories need clear hierarchy.',
    scoringGuide: '9-10: Perfect character balance for story type. 7-8: Well-balanced with clear focus. 5-6: Some characters underdeveloped. 3-4: Significant imbalance. 1-2: Characters completely unbalanced.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'performative_range',
    name: 'performative_range',
    displayName: 'Performative Range',
    category: 'Character',
    agentSource: 'CharacterAgent',
    description: 'Evaluates the range of emotion and action required from performers. Roles that demand range are more attractive to talent.',
    scoringGuide: '9-10: Award-worthy range opportunities. 7-8: Strong showcase role. 5-6: Adequate but limited range. 3-4: One-note performance required. 1-2: No performance demands.',
    applicableScriptTypes: 'all',
    weight: 0.6,
  },

  // Conflict Agent Parameters
  {
    id: 'conflict_type_diversity',
    name: 'conflict_type_diversity',
    displayName: 'Conflict Type Diversity',
    category: 'Conflict',
    agentSource: 'ConflictAgent',
    description: 'Measures variety of conflict forms present. The best stories layer interpersonal, internal, societal, and situational conflicts.',
    scoringGuide: '9-10: Rich tapestry of conflict types. 7-8: Multiple conflict layers. 5-6: Two or three types present. 3-4: Single conflict type dominates. 1-2: No conflict variety.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'conflict_density',
    name: 'conflict_density',
    displayName: 'Conflict Density',
    category: 'Conflict',
    agentSource: 'ConflictAgent',
    description: 'Evaluates appropriate frequency of conflict beats. Too sparse and the story drags; too dense and it exhausts.',
    scoringGuide: '9-10: Perfect conflict rhythm, no lulls or fatigue. 7-8: Strong density, well-paced. 5-6: Adequate but uneven. 3-4: Too sparse or too overwhelming. 1-2: No conflict rhythm.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'stakes_personalization',
    name: 'stakes_personalization',
    displayName: 'Stakes Personalization',
    category: 'Conflict',
    agentSource: 'ConflictAgent',
    description: 'Measures how personally meaningful the stakes are to characters. Global stakes mean nothing without personal stakes.',
    scoringGuide: '9-10: Deeply personal, emotionally devastating stakes. 7-8: Clear personal investment. 5-6: Stakes feel somewhat personal. 3-4: Abstract or impersonal stakes. 1-2: No personal stakes.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'escalation_irreversibility',
    name: 'escalation_irreversibility',
    displayName: 'Escalation Irreversibility',
    category: 'Conflict',
    agentSource: 'ConflictAgent',
    description: 'Evaluates whether stakes genuinely increase and cannot be undone. Each escalation should close doors, not just open new ones.',
    scoringGuide: '9-10: True point-of-no-return moments. 7-8: Strong irreversible escalations. 5-6: Some escalation but reversible. 3-4: Stakes easily undone. 1-2: No real escalation.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'cost_of_failure',
    name: 'cost_of_failure',
    displayName: 'Cost of Failure',
    category: 'Conflict',
    agentSource: 'ConflictAgent',
    description: 'Measures what characters stand to lose. Clear, meaningful consequences create tension.',
    scoringGuide: '9-10: Devastating, clearly defined consequences. 7-8: Significant costs established. 5-6: Adequate but could be higher. 3-4: Vague consequences. 1-2: No clear cost of failure.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'internal_external_balance',
    name: 'internal_external_balance',
    displayName: 'Internal/External Balance',
    category: 'Conflict',
    agentSource: 'ConflictAgent',
    description: 'Evaluates the mix of psychological and situational conflict. Great stories balance internal struggle with external challenges.',
    scoringGuide: '9-10: Perfect interplay of internal and external. 7-8: Well-balanced, intentional emphasis. 5-6: Present but one dominates. 3-4: Significantly imbalanced. 1-2: Only one type present.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },

  // Theme Agent Parameters
  {
    id: 'thematic_spine_clarity',
    name: 'thematic_spine_clarity',
    displayName: 'Thematic Spine Clarity',
    category: 'Theme',
    agentSource: 'ThemeAgent',
    description: 'Measures how clearly the central theme can be identified. The thematic spine is the idea the story explores—what it is "about" beyond plot.',
    scoringGuide: '9-10: Unmistakable theme, perfectly woven through story. 7-8: Clear theme with strong expression. 5-6: Theme present but could be clearer. 3-4: Vague or conflicting themes. 1-2: No discernible theme.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'show_vs_tell_ratio',
    name: 'show_vs_tell_ratio',
    displayName: 'Show vs Tell Ratio',
    category: 'Theme',
    agentSource: 'ThemeAgent',
    description: 'Evaluates whether theme emerges from action versus explicit statement. Theme should be demonstrated, not preached.',
    scoringGuide: '9-10: Theme entirely shown, never stated. 7-8: Mostly shown with subtle tells. 5-6: Balance of show and tell. 3-4: Too much telling. 1-2: Theme only stated, never shown.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'symbol_motif_consistency',
    name: 'symbol_motif_consistency',
    displayName: 'Symbol/Motif Consistency',
    category: 'Theme',
    agentSource: 'ThemeAgent',
    description: 'Measures coherent use of recurring imagery, symbols, and motifs. Visual and verbal patterns should reinforce thematic concerns.',
    scoringGuide: '9-10: Rich, consistent symbolic language. 7-8: Strong motifs, well-deployed. 5-6: Some symbolism present. 3-4: Inconsistent or missing. 1-2: No symbolic elements.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'moral_complexity',
    name: 'moral_complexity',
    displayName: 'Moral Complexity',
    category: 'Theme',
    agentSource: 'ThemeAgent',
    description: 'Evaluates avoidance of simplistic moralizing. The best themes explore nuance and resist easy answers.',
    scoringGuide: '9-10: Profound moral nuance, no easy answers. 7-8: Good complexity, some simplification. 5-6: Standard moral landscape. 3-4: Simplistic morality. 1-2: Black-and-white moralizing.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'cultural_resonance',
    name: 'cultural_resonance',
    displayName: 'Cultural Resonance',
    category: 'Theme',
    agentSource: 'ThemeAgent',
    description: 'Measures connection to broader cultural conversations. Themes that tap into current discourse have stronger audience connection.',
    scoringGuide: '9-10: Taps directly into cultural moment. 7-8: Strong cultural relevance. 5-6: Some cultural connection. 3-4: Feels disconnected from now. 1-2: No cultural resonance.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'longevity_of_meaning',
    name: 'longevity_of_meaning',
    displayName: 'Longevity of Meaning',
    category: 'Theme',
    agentSource: 'ThemeAgent',
    description: 'Evaluates whether themes will remain relevant over time. Universal themes endure; topical themes date.',
    scoringGuide: '9-10: Timeless, universal themes. 7-8: Strong longevity, enduring relevance. 5-6: Will age adequately. 3-4: May feel dated quickly. 1-2: Extremely topical, will not endure.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'tone_genre_cohesion',
    name: 'tone_genre_cohesion',
    displayName: 'Tone & Genre Cohesion',
    category: 'Theme',
    agentSource: 'ThemeAgent',
    description: 'Evaluates consistency of tonal approach throughout the narrative and adherence to genre conventions. Measures how well the script fulfills its genre promise to the audience while maintaining tonal integrity across scenes, acts, and character interactions.',
    scoringGuide: '9-10: Perfect tonal control, masterful genre execution, seamless tone shifts when intentional. 7-8: Consistent tone with strong genre awareness, rare unintentional shifts. 5-6: Some tonal inconsistencies or genre confusion, occasionally breaks promise. 3-4: Significant tonal shifts that confuse, genre mismatch with audience expectations. 1-2: No tonal coherence, broken genre promise, audience cannot trust the narrative.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },

  // Dialogue Agent Parameters
  {
    id: 'exposition_load',
    name: 'exposition_load',
    displayName: 'Exposition Load',
    category: 'Dialogue',
    agentSource: 'DialogueAgent',
    description: 'Measures how gracefully information is conveyed through dialogue. Heavy-handed exposition breaks immersion.',
    scoringGuide: '9-10: Invisible exposition, seamlessly woven. 7-8: Mostly smooth, rare clunky moments. 5-6: Noticeable but acceptable exposition. 3-4: Heavy-handed, breaks immersion. 1-2: "As you know, Bob" everywhere.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'subtext_density',
    name: 'subtext_density',
    displayName: 'Subtext Density',
    category: 'Dialogue',
    agentSource: 'DialogueAgent',
    description: 'Evaluates how much is communicated beneath the surface. Great dialogue says more than it appears to say.',
    scoringGuide: '9-10: Rich subtext, every line has layers. 7-8: Strong subtext in key scenes. 5-6: Some subtext present. 3-4: Too on-the-nose. 1-2: No subtext at all.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'voice_differentiation',
    name: 'voice_differentiation',
    displayName: 'Voice Differentiation',
    category: 'Dialogue',
    agentSource: 'DialogueAgent',
    description: 'Measures how distinctly different characters speak. Each character should have a recognizable voice, word choice, and rhythm.',
    scoringGuide: '9-10: Every character unmistakably distinct. 7-8: Strong differentiation, minor overlaps. 5-6: Main characters distinct, supporting blur. 3-4: Characters sound similar. 1-2: Everyone sounds the same.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'rhythm_and_silence',
    name: 'rhythm_and_silence',
    displayName: 'Rhythm & Silence',
    category: 'Dialogue',
    agentSource: 'DialogueAgent',
    description: 'Evaluates the musicality of dialogue including pacing, pauses, and what is left unsaid. Silence can be as powerful as speech.',
    scoringGuide: '9-10: Masterful rhythm, powerful silences. 7-8: Good musical quality. 5-6: Functional rhythm. 3-4: Monotonous pace. 1-2: No rhythmic awareness.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'quotability',
    name: 'quotability',
    displayName: 'Quotability',
    category: 'Dialogue',
    agentSource: 'DialogueAgent',
    description: 'Measures memorable lines that audiences will remember and repeat. Iconic lines become part of cultural vocabulary.',
    scoringGuide: '9-10: Multiple instantly quotable lines. 7-8: Several memorable moments. 5-6: One or two good lines. 3-4: Nothing stands out. 1-2: Completely forgettable dialogue.',
    applicableScriptTypes: 'all',
    weight: 0.6,
  },
  {
    id: 'medium_appropriateness',
    name: 'medium_appropriateness',
    displayName: 'Medium Appropriateness',
    category: 'Dialogue',
    agentSource: 'DialogueAgent',
    description: 'Evaluates whether dialogue is suited to the intended medium. Film dialogue differs from stage; comics from prose.',
    scoringGuide: '9-10: Perfect for the medium. 7-8: Well-suited with minor adjustments. 5-6: Adequate for medium. 3-4: Wrong medium feel. 1-2: Completely inappropriate for format.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },

  // World Logic Agent Parameters
  {
    id: 'world_rule_consistency',
    name: 'world_rule_consistency',
    displayName: 'World Rule Consistency',
    category: 'World & Logic',
    agentSource: 'WorldLogicAgent',
    description: 'Measures internal consistency of world rules. Once established, rules must be followed or intentionally broken for effect.',
    scoringGuide: '9-10: Perfectly consistent world logic. 7-8: Consistent with rare minor issues. 5-6: Some inconsistencies. 3-4: Frequent rule violations. 1-2: No internal consistency.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'setting_agency',
    name: 'setting_agency',
    displayName: 'Setting Agency',
    category: 'World & Logic',
    agentSource: 'WorldLogicAgent',
    description: 'Evaluates whether the setting actively shapes the story. The world should feel like a character, not just a backdrop.',
    scoringGuide: '9-10: Setting is essential, shapes every beat. 7-8: Setting strongly influences story. 5-6: Setting is functional. 3-4: Generic, interchangeable setting. 1-2: Setting is irrelevant.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'spatial_system_logic',
    name: 'spatial_system_logic',
    displayName: 'Spatial/System Logic',
    category: 'World & Logic',
    agentSource: 'WorldLogicAgent',
    description: 'Measures coherence of physical space and systemic elements. Geography, technology, and social systems should make sense.',
    scoringGuide: '9-10: Fully coherent spatial/systemic logic. 7-8: Well-thought-out with minor gaps. 5-6: Adequate logic. 3-4: Confusing geography or systems. 1-2: Incoherent world logic.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'plausibility',
    name: 'plausibility',
    displayName: 'Plausibility',
    category: 'World & Logic',
    agentSource: 'WorldLogicAgent',
    description: 'Evaluates believability within the story\'s own terms. Even fantasy must be plausible within its established rules.',
    scoringGuide: '9-10: Everything feels true to the world. 7-8: Strong plausibility, minor stretches. 5-6: Generally plausible. 3-4: Frequent plausibility issues. 1-2: Nothing feels believable.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'continuity_integrity',
    name: 'continuity_integrity',
    displayName: 'Continuity Integrity',
    category: 'World & Logic',
    agentSource: 'WorldLogicAgent',
    description: 'Measures consistency of details across the story. Characters, objects, and facts must remain consistent.',
    scoringGuide: '9-10: Perfect continuity, no errors. 7-8: Minor continuity issues only. 5-6: Some noticeable gaps. 3-4: Frequent continuity breaks. 1-2: No continuity awareness.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'suspension_of_disbelief',
    name: 'suspension_of_disbelief',
    displayName: 'Suspension of Disbelief',
    category: 'World & Logic',
    agentSource: 'WorldLogicAgent',
    description: 'Evaluates how well the story maintains audience buy-in. Breaking suspension of disbelief is the cardinal sin of world-building.',
    scoringGuide: '9-10: Never breaks immersion. 7-8: Rare minor breaks. 5-6: Occasional doubt. 3-4: Frequent breaks. 1-2: Constantly pulls audience out.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },

  // Emotional Arc Agent Parameters
  {
    id: 'emotional_range',
    name: 'emotional_range',
    displayName: 'Emotional Range',
    category: 'Emotional Arc',
    agentSource: 'EmotionalArcAgent',
    description: 'Measures variety of emotional experiences offered. Great stories take audiences through multiple emotional states.',
    scoringGuide: '9-10: Full emotional spectrum explored. 7-8: Wide range, well-deployed. 5-6: Several emotions present. 3-4: Limited emotional palette. 1-2: One-note emotionally.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'emotional_timing',
    name: 'emotional_timing',
    displayName: 'Emotional Timing',
    category: 'Emotional Arc',
    agentSource: 'EmotionalArcAgent',
    description: 'Evaluates the placement of emotional beats. Timing is everything—emotional moments need proper setup.',
    scoringGuide: '9-10: Perfect emotional timing. 7-8: Well-timed with minor issues. 5-6: Adequate timing. 3-4: Poorly timed emotions. 1-2: No sense of emotional timing.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'emotional_progression',
    name: 'emotional_progression',
    displayName: 'Emotional Progression',
    category: 'Emotional Arc',
    agentSource: 'EmotionalArcAgent',
    description: 'Measures the journey of emotional intensity through the narrative. Emotions should build and release with purpose.',
    scoringGuide: '9-10: Masterful emotional journey. 7-8: Strong progression with peaks and valleys. 5-6: Adequate arc. 3-4: Flat emotional line. 1-2: No emotional progression.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'catharsis_strength',
    name: 'catharsis_strength',
    displayName: 'Catharsis Strength',
    category: 'Emotional Arc',
    agentSource: 'EmotionalArcAgent',
    description: 'Evaluates the power of emotional release. Stories should build to moments of catharsis that leave lasting impact.',
    scoringGuide: '9-10: Devastating catharsis, unforgettable. 7-8: Strong emotional payoff. 5-6: Adequate release. 3-4: Underwhelming catharsis. 1-2: No cathartic release.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'fatigue_vs_variety',
    name: 'fatigue_vs_variety',
    displayName: 'Fatigue vs Variety',
    category: 'Emotional Arc',
    agentSource: 'EmotionalArcAgent',
    description: 'Measures whether emotional intensity is sustainable without exhausting the audience. Too much of any emotion becomes numbing.',
    scoringGuide: '9-10: Perfect variety, never exhausting. 7-8: Good balance, rare fatigue. 5-6: Some exhausting sections. 3-4: Frequent emotional fatigue. 1-2: Emotionally exhausting.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'payoff_delay',
    name: 'payoff_delay',
    displayName: 'Payoff Delay',
    category: 'Emotional Arc',
    agentSource: 'EmotionalArcAgent',
    description: 'Evaluates optimal delay before emotional payoffs. Too quick feels cheap; too slow loses impact.',
    scoringGuide: '9-10: Perfect payoff timing. 7-8: Well-delayed for maximum impact. 5-6: Adequate delay. 3-4: Too quick or too slow. 1-2: No understanding of payoff timing.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },

  // Market Agent Parameters
  {
    id: 'audience_fit',
    name: 'audience_fit',
    displayName: 'Audience Fit',
    category: 'Market',
    agentSource: 'MarketAgent',
    description: 'Measures how well the content matches its intended audience. Target demographics should be clear and well-served.',
    scoringGuide: '9-10: Perfect audience alignment. 7-8: Strong fit with minor gaps. 5-6: Adequate audience appeal. 3-4: Unclear or mismatched audience. 1-2: No audience fit.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'platform_fit',
    name: 'platform_fit',
    displayName: 'Platform Fit',
    category: 'Market',
    agentSource: 'MarketAgent',
    description: 'Evaluates suitability for intended distribution platform. Content should match platform expectations and capabilities.',
    scoringGuide: '9-10: Perfect platform match. 7-8: Well-suited with minor adjustments. 5-6: Adequate fit. 3-4: Platform mismatch. 1-2: Wrong platform entirely.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'consumption_pattern_alignment',
    name: 'consumption_pattern_alignment',
    displayName: 'Consumption Pattern Alignment',
    category: 'Market',
    agentSource: 'MarketAgent',
    description: 'Measures alignment with how audiences consume content (binge, weekly, theatrical event). Structure should match consumption mode.',
    scoringGuide: '9-10: Perfectly structured for consumption mode. 7-8: Well-aligned. 5-6: Adequate alignment. 3-4: Misaligned structure. 1-2: Completely wrong for platform.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'marketing_hook_density',
    name: 'marketing_hook_density',
    displayName: 'Marketing Hook Density',
    category: 'Market',
    agentSource: 'MarketAgent',
    description: 'Evaluates number of marketable moments (trailer beats, poster images, taglines). Content should be promotable.',
    scoringGuide: '9-10: Marketing goldmine, endless hooks. 7-8: Many promotable elements. 5-6: Adequate marketing material. 3-4: Hard to market. 1-2: Nothing marketable.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'ip_expansion_potential',
    name: 'ip_expansion_potential',
    displayName: 'IP Expansion Potential',
    category: 'Market',
    agentSource: 'MarketAgent',
    description: 'Measures potential for merchandise, games, experiences beyond the core content. IP value extends beyond the initial product.',
    scoringGuide: '9-10: Natural IP empire, multiple verticals. 7-8: Strong expansion potential. 5-6: Some IP opportunities. 3-4: Limited expansion. 1-2: No IP potential.',
    applicableScriptTypes: 'all',
    weight: 0.6,
  },
  {
    id: 'localization_ease',
    name: 'localization_ease',
    displayName: 'Localization Ease',
    category: 'Market',
    agentSource: 'MarketAgent',
    description: 'Evaluates how easily content can be adapted for international markets. Global appeal requires localization consideration.',
    scoringGuide: '9-10: Universal appeal, easy localization. 7-8: Travels well internationally. 5-6: Some localization challenges. 3-4: Difficult to localize. 1-2: Impossible to adapt.',
    applicableScriptTypes: 'all',
    weight: 0.5,
  },

  // Execution Agent Parameters
  {
    id: 'production_complexity',
    name: 'production_complexity',
    displayName: 'Production Complexity',
    category: 'Execution',
    agentSource: 'ExecutionAgent',
    description: 'Measures overall difficulty of production. Higher complexity means higher risk and cost.',
    scoringGuide: '9-10: Simple, straightforward production. 7-8: Manageable complexity. 5-6: Moderate challenges. 3-4: High complexity, significant challenges. 1-2: Extremely complex, major risks.',
    applicableScriptTypes: 'all',
    weight: 1.0,
  },
  {
    id: 'talent_dependency',
    name: 'talent_dependency',
    displayName: 'Talent Dependency',
    category: 'Execution',
    agentSource: 'ExecutionAgent',
    description: 'Evaluates reliance on specific star power for success. High dependency creates casting risk.',
    scoringGuide: '9-10: Works with any qualified talent. 7-8: Low star dependency. 5-6: Moderate talent needs. 3-4: Requires specific talent types. 1-2: Needs A-list stars to work.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'technical_dependency',
    name: 'technical_dependency',
    displayName: 'Technical Dependency',
    category: 'Execution',
    agentSource: 'ExecutionAgent',
    description: 'Measures VFX, stunts, and special requirements. Heavy technical needs increase risk and cost.',
    scoringGuide: '9-10: Minimal technical requirements. 7-8: Standard technical needs. 5-6: Moderate VFX/technical work. 3-4: Significant technical demands. 1-2: Cutting-edge technical requirements.',
    applicableScriptTypes: 'all',
    weight: 0.9,
  },
  {
    id: 'schedule_risk',
    name: 'schedule_risk',
    displayName: 'Schedule Risk',
    category: 'Execution',
    agentSource: 'ExecutionAgent',
    description: 'Evaluates timeline feasibility. Schedule overruns destroy budgets and morale.',
    scoringGuide: '9-10: Easily scheduled, low risk. 7-8: Manageable timeline. 5-6: Some scheduling challenges. 3-4: Significant schedule risks. 1-2: Schedule disaster likely.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
  {
    id: 'compliance_sensitivity_risk',
    name: 'compliance_sensitivity_risk',
    displayName: 'Compliance/Sensitivity Risk',
    category: 'Execution',
    agentSource: 'ExecutionAgent',
    description: 'Measures content that may face regulatory or cultural issues. Controversial content creates distribution risk.',
    scoringGuide: '9-10: No compliance concerns. 7-8: Minor sensitivity considerations. 5-6: Some content flags. 3-4: Significant compliance challenges. 1-2: Major regulatory/cultural barriers.',
    applicableScriptTypes: 'all',
    weight: 0.7,
  },
  {
    id: 'failure_modes',
    name: 'failure_modes',
    displayName: 'Failure Modes',
    category: 'Execution',
    agentSource: 'ExecutionAgent',
    description: 'Identifies how the project could fail in execution. Understanding failure modes enables mitigation.',
    scoringGuide: '9-10: Few failure points, easily mitigated. 7-8: Limited failure modes. 5-6: Standard risk profile. 3-4: Multiple failure possibilities. 1-2: Many ways to fail.',
    applicableScriptTypes: 'all',
    weight: 0.8,
  },
];

// ============= WEB SERIES PARAMETERS =============
// Based on Pulse Web Series Framework document
// These parameters are specifically designed for web series analysis

export const WEB_SERIES_PARAMETERS: ParameterDefinition[] = [
  // Core Web Series Parameters (10 - always active for web series)
  {
    id: 'hook_efficiency',
    name: 'hook_efficiency',
    displayName: 'Hook Efficiency',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'First 30 seconds viewer capture and retention triggers. Critical for algorithmic discovery and preventing scroll-past.',
    scoringGuide: '9-10: Immediate hook within 10 seconds, irresistible scroll-stop. 7-8: Strong hook by 30 seconds. 5-6: Hook present but delayed. 3-4: Weak or generic opening. 1-2: No clear hook, viewers leave.',
    applicableScriptTypes: ['web_series'],
    weight: 1.6,
  },
  {
    id: 'episode_self_containment',
    name: 'episode_self_containment',
    displayName: 'Episode Self-Containment',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Balance between standalone value and serialized dependency. Each episode must work as an entry point while contributing to series arc.',
    scoringGuide: '9-10: Episode works perfectly standalone, new viewers welcomed. 7-8: Strong standalone with series enhancement. 5-6: Somewhat accessible to new viewers. 3-4: Requires prior episode knowledge. 1-2: Completely dependent on prior viewing.',
    applicableScriptTypes: ['web_series'],
    weight: 1.0,
  },
  {
    id: 'serial_momentum',
    name: 'serial_momentum',
    displayName: 'Serial Momentum',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Narrative thrust driving next-episode clicks. The "one more episode" factor that drives binge behavior and return viewing.',
    scoringGuide: '9-10: Irresistible cliffhangers, urgent next-click drive. 7-8: Strong momentum, compelling continuity. 5-6: Adequate forward motion. 3-4: Weak momentum, easy to stop. 1-2: No reason to continue.',
    applicableScriptTypes: ['web_series'],
    weight: 1.2,
  },
  {
    id: 'retention_curve_design',
    name: 'retention_curve_design',
    displayName: 'Retention Curve Design',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Viewer engagement maintenance throughout episode runtime. Strategic pacing to prevent drop-off at known abandon points.',
    scoringGuide: '9-10: Retention hooks every 2-3 minutes, minimal drop-off predicted. 7-8: Strong mid-episode engagement. 5-6: Standard retention pattern. 3-4: Predicted significant drop-off. 1-2: No retention design visible.',
    applicableScriptTypes: ['web_series'],
    weight: 1.4,
  },
  {
    id: 'character_stickiness',
    name: 'character_stickiness',
    displayName: 'Character Stickiness',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Audience attachment to recurring characters that drives return viewing. Characters worth following across multiple episodes.',
    scoringGuide: '9-10: Iconic characters, audience investment guaranteed. 7-8: Strong attachment, memorable ensemble. 5-6: Likeable but generic characters. 3-4: Forgettable characters. 1-2: No character differentiation.',
    applicableScriptTypes: ['web_series'],
    weight: 1.0,
  },
  {
    id: 'platform_native_storytelling',
    name: 'platform_native_storytelling',
    displayName: 'Platform-Native Storytelling',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Awareness of digital platform grammar and viewing context. Mobile-first formatting, comment-bait moments, shareable segments.',
    scoringGuide: '9-10: Perfect platform fit, leverages digital-native behavior. 7-8: Strong platform awareness. 5-6: Adequate digital adaptation. 3-4: Feels like traditional TV on digital. 1-2: Ignores platform context entirely.',
    applicableScriptTypes: ['web_series'],
    weight: 0.9,
  },
  {
    id: 'tonality_format_consistency',
    name: 'tonality_format_consistency',
    displayName: 'Tonality & Format Consistency',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Episode-to-episode tonal coherence. Audience knows what to expect while still being surprised.',
    scoringGuide: '9-10: Perfect tonal consistency with satisfying variations. 7-8: Strong brand identity. 5-6: Generally consistent. 3-4: Tonal whiplash between episodes. 1-2: No consistent identity.',
    applicableScriptTypes: ['web_series'],
    weight: 0.7,
  },
  {
    id: 'production_simplicity_velocity',
    name: 'production_simplicity_velocity',
    displayName: 'Production Simplicity & Velocity',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Sustainable production cadence balance. Can the series be produced at the pace platform algorithms reward?',
    scoringGuide: '9-10: Minimal locations/cast, rapid production possible. 7-8: Efficient production design. 5-6: Standard production requirements. 3-4: Complex production, slow cadence. 1-2: Feature-film complexity, unsustainable.',
    applicableScriptTypes: ['web_series'],
    weight: 0.6,
  },
  {
    id: 'shareability_meme_potential',
    name: 'shareability_meme_potential',
    displayName: 'Shareability & Meme Potential',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Social media amplification hooks. Moments designed for clips, quotes, reaction GIFs, and organic sharing.',
    scoringGuide: '9-10: Built for virality, multiple clip-worthy moments per episode. 7-8: Strong share potential. 5-6: Some shareable moments. 3-4: Limited social appeal. 1-2: Nothing share-worthy.',
    applicableScriptTypes: ['web_series'],
    weight: 0.8,
  },
  {
    id: 'monetization_readiness',
    name: 'monetization_readiness',
    displayName: 'Monetization Readiness',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Ad-supported or hybrid revenue model fit. Natural ad break points, brand-safe content, sponsorship integration potential.',
    scoringGuide: '9-10: Perfect for multiple revenue streams, natural ad breaks. 7-8: Strong monetization potential. 5-6: Adequate revenue model fit. 3-4: Limited monetization options. 1-2: Monetization-hostile content.',
    applicableScriptTypes: ['web_series'],
    weight: 0.8,
  },

  // Long-Form Only Parameters (3 - activated when episode_length_class = 'long_form_web')
  {
    id: 'mid_episode_rehooking',
    name: 'mid_episode_rehooking',
    displayName: 'Mid-Episode Re-Hooking',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Attention reset points every 12-15 minutes for long-form episodes. Required when runtime exceeds 45 minutes.',
    scoringGuide: '9-10: Strategic re-hooks at 12-15 minute intervals, prevents attention decay. 7-8: Strong mid-episode engagement points. 5-6: Some attention resets. 3-4: Long stretches without re-engagement. 1-2: No mid-episode hooks.',
    applicableScriptTypes: ['web_series'],
    weight: 0.6,
    longFormOnly: true,
  },
  {
    id: 'soft_act_integrity',
    name: 'soft_act_integrity',
    displayName: 'Soft Act Integrity',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Internal act-like pivots without broadcast rigidity. Natural story breathing points that feel organic, not commercial-break forced.',
    scoringGuide: '9-10: Organic act-like structure, natural story rhythm. 7-8: Good soft act design. 5-6: Basic structural pivots. 3-4: Rigid or absent act structure. 1-2: No discernible structure.',
    applicableScriptTypes: ['web_series'],
    weight: 0.7,
    longFormOnly: true,
  },
  {
    id: 'binge_continuity_pressure',
    name: 'binge_continuity_pressure',
    displayName: 'Binge Continuity Pressure',
    category: 'Web Series',
    agentSource: 'WebSeriesAgent',
    description: 'Episode endings that drive next-click behavior in binge-watch context. Different from weekly release hooks.',
    scoringGuide: '9-10: Endings designed for immediate next-episode consumption. 7-8: Strong binge pressure. 5-6: Adequate continuity. 3-4: Satisfying endings that reduce urgency. 1-2: No binge consideration.',
    applicableScriptTypes: ['web_series'],
    weight: 0.6,
    longFormOnly: true,
  },
];

// ============= EPISODE LENGTH WEIGHT MODIFIERS =============
// These modifiers adjust parameter weights based on episode length class

export type EpisodeLengthClass = 'short_form_web' | 'mid_form_web' | 'long_form_web';

export const EPISODE_LENGTH_WEIGHT_MODIFIERS: Record<EpisodeLengthClass, Record<string, number>> = {
  short_form_web: {
    hook_efficiency: 1.3,           // Higher priority for short form
    retention_curve_design: 1.2,    // Critical in short form
    shareability_meme_potential: 1.4, // Most important for short form
    character_stickiness: 0.7,      // Less time for character development
    platform_native_storytelling: 1.3,
    episode_self_containment: 1.2,  // Must be more standalone
  },
  mid_form_web: {
    // Default weights (1.0 multiplier for all) - balanced evaluation
  },
  long_form_web: {
    character_stickiness: 1.3,      // More time for character work
    serial_momentum: 1.2,           // More important in long form
    platform_native_storytelling: 0.8, // Less critical in long form
    mid_episode_rehooking: 1.5,     // Activate and prioritize
    soft_act_integrity: 1.4,        // Important for long runtime
    binge_continuity_pressure: 1.3, // More relevant in binge context
  },
};

// ============= WEB SERIES FAILURE PATTERNS =============
// Auto-detected failure modes from the framework document

export const WEB_SERIES_FAILURE_PATTERNS = [
  { id: 'tv_pacing_no_rehooks', name: 'TV Pacing Without Re-Hooks', description: 'Long-form content with traditional TV pacing but no mid-episode attention resets.', triggerParam: 'mid_episode_rehooking', threshold: 5 },
  { id: 'over_serialization', name: 'Over-Serialization', description: 'Too much serialized dependency killing discoverability and new viewer entry.', triggerParam: 'episode_self_containment', threshold: 4 },
  { id: 'film_cold_opens', name: 'Film-Style Cold Opens', description: 'Using cinematic slow-burn openings instead of immediate digital hooks.', triggerParam: 'hook_efficiency', threshold: 5 },
  { id: 'unsustainable_scope', name: 'Unsustainable Production Scope', description: 'Production complexity exceeding sustainable release cadence.', triggerParam: 'production_simplicity_velocity', threshold: 4 },
  { id: 'no_clip_moments', name: 'Missing Clip Moments', description: 'Episodes without any obviously shareable or meme-worthy segments.', triggerParam: 'shareability_meme_potential', threshold: 4 },
  { id: 'weak_episode_endings', name: 'Weak Episode Endings', description: 'Satisfying resolutions that reduce next-episode urgency.', triggerParam: 'serial_momentum', threshold: 5 },
];

// ============= OTT VS WEB SERIES DISAMBIGUATION =============
// Rules from framework document for classifying projects

export const CLASSIFICATION_RULES = {
  webSeries: {
    primaryDiscovery: 'algorithmic',
    episodeFunction: 'can function as entry points',
    monetization: 'creator-led, hybrid, or ad-supported',
    releaseCadence: 'flexible',
    examples: ['YouTube Originals', 'Creator-led episodic content', 'Platform algorithm-discovered shows'],
  },
  ottSeries: {
    primaryDiscovery: 'platform homepage curation',
    episodeFunction: 'strict episode-to-episode continuity assumed',
    monetization: 'subscription-first',
    releasePattern: 'designed for binge blocks',
    examples: ['Netflix Originals', 'Premium streaming series', 'Prestige limited series'],
  },
  disambiguationRule: 'If runtime > 45 min AND episodic AND platform-curated-first → OTT Series. If runtime > 45 min AND episodic AND algorithmic discovery → Long-Form Web Series.',
};

// ============= MICRO DRAMA PARAMETERS =============
// Ultra-short vertical content (30-180 sec) parameters
// Hook Velocity and Cliff Density at MAXIMUM weight (2.0)

export const MICRO_DRAMA_PARAMETERS: ParameterDefinition[] = [
  {
    id: 'hook_velocity',
    name: 'hook_velocity',
    displayName: 'Hook Velocity',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Speed at which the hook captures viewer attention. For micro-dramas, this must happen within the first 2-3 seconds to prevent scroll-past behavior. Measures how quickly tension, curiosity, or emotional investment is established.',
    scoringGuide: '9-10: Hook within 2 seconds, instant scroll-stop. 7-8: Hook by 3-5 seconds. 5-6: Hook present but too slow (5-10 sec). 3-4: Hook delayed beyond 10 seconds. 1-2: No discernible hook, viewer scrolls past.',
    applicableScriptTypes: ['micro_drama'],
    weight: 2.0, // MAXIMUM WEIGHT - Critical for micro-drama
  },
  {
    id: 'cliff_density',
    name: 'cliff_density',
    displayName: 'Cliff Density',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Frequency and intensity of tension peaks and mini-cliffhangers within the ultra-short runtime. Measures how many "want to see what happens next" moments are packed into 30-180 seconds.',
    scoringGuide: '9-10: Cliffhanger every 15-20 seconds, relentless tension. 7-8: Strong cliffs with good pacing. 5-6: One or two tension peaks. 3-4: Weak or predictable escalation. 1-2: Flat tension curve, no cliffs.',
    applicableScriptTypes: ['micro_drama'],
    weight: 2.0, // MAXIMUM WEIGHT - Critical for micro-drama
  },
  {
    id: 'emotional_compression',
    name: 'emotional_compression',
    displayName: 'Emotional Compression',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Efficiency of emotional delivery in compressed format. Measures whether the story achieves meaningful emotional impact despite extreme time constraints.',
    scoringGuide: '9-10: Full emotional journey in under 3 minutes. 7-8: Strong emotional beats, efficient delivery. 5-6: Some emotional resonance but rushed. 3-4: Emotional moments feel forced. 1-2: No emotional impact achievable.',
    applicableScriptTypes: ['micro_drama'],
    weight: 1.6,
  },
  {
    id: 'character_legibility_at_speed',
    name: 'character_legibility_at_speed',
    displayName: 'Character Legibility at Speed',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Instant character recognition and understanding. Characters must be immediately legible through visual design, voice, or archetype within first appearance.',
    scoringGuide: '9-10: Characters understood in one look/line. 7-8: Quick character establishment. 5-6: Characters require context. 3-4: Confusing character introductions. 1-2: Characters indistinguishable.',
    applicableScriptTypes: ['micro_drama'],
    weight: 1.5,
  },
  {
    id: 'scroll_stop_power',
    name: 'scroll_stop_power',
    displayName: 'Scroll-Stop Power',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Visual and conceptual impact that stops the infinite scroll. Opening frame must be arresting enough to interrupt passive scrolling behavior.',
    scoringGuide: '9-10: Impossible to scroll past, demands attention. 7-8: Strong visual/concept hook. 5-6: Moderate stopping power. 3-4: Blends into feed. 1-2: Easily scrolled past.',
    applicableScriptTypes: ['micro_drama'],
    weight: 1.8,
  },
  {
    id: 'vertical_format_optimization',
    name: 'vertical_format_optimization',
    displayName: 'Vertical Format Optimization',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Native design for 9:16 vertical viewing. Composition, blocking, and visual storytelling optimized for mobile-first consumption.',
    scoringGuide: '9-10: Perfect vertical composition, mobile-native. 7-8: Good vertical awareness. 5-6: Adaptable to vertical. 3-4: Horizontal thinking in vertical space. 1-2: Ignores format constraints.',
    applicableScriptTypes: ['micro_drama'],
    weight: 1.2,
  },
  {
    id: 'dialogue_efficiency',
    name: 'dialogue_efficiency',
    displayName: 'Dialogue Efficiency',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Maximum information and emotion conveyed in minimum words. Every line must be essential; no dialogue fat allowed in micro-format.',
    scoringGuide: '9-10: Every word essential, no waste. 7-8: Tight dialogue with minor trims possible. 5-6: Some unnecessary lines. 3-4: Dialogue-heavy for format. 1-2: Excessive dialogue, format mismatch.',
    applicableScriptTypes: ['micro_drama'],
    weight: 1.4,
  },
  {
    id: 'visual_hook_density',
    name: 'visual_hook_density',
    displayName: 'Visual Hook Density',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Frequency of visually striking moments designed for engagement. Measures how many share-worthy, screenshot-able moments exist per 30 seconds.',
    scoringGuide: '9-10: Multiple visual hooks per 30 seconds. 7-8: Strong visual variety. 5-6: Adequate visual interest. 3-4: Visually flat stretches. 1-2: No visual hooks.',
    applicableScriptTypes: ['micro_drama'],
    weight: 1.3,
  },
  {
    id: 'replay_value',
    name: 'replay_value',
    displayName: 'Replay Value',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Incentive to rewatch for details, reactions, or sharing. Algorithm-friendly content is rewatched; replay loops boost distribution.',
    scoringGuide: '9-10: Demands rewatches, layers to discover. 7-8: Worth rewatching once. 5-6: Satisfying but single-watch. 3-4: No replay incentive. 1-2: Actively discourages rewatch.',
    applicableScriptTypes: ['micro_drama'],
    weight: 1.1,
  },
  {
    id: 'series_hook',
    name: 'series_hook',
    displayName: 'Series Hook',
    category: 'Micro Drama',
    agentSource: 'MicroDramaAgent',
    description: 'Ending that drives viewers to seek more episodes. The "Part 2?" comment generator. Measures how effectively the ending creates demand for continuation.',
    scoringGuide: '9-10: Viewers demand Part 2, comment "WHERE IS PART 2??". 7-8: Strong continuation desire. 5-6: Mild interest in more. 3-4: Self-contained, no pull. 1-2: Viewer satisfied, no series potential.',
    applicableScriptTypes: ['micro_drama'],
    weight: 1.5,
  },
];

// Micro Drama failure patterns
export const MICRO_DRAMA_FAILURE_PATTERNS = [
  { id: 'slow_hook', name: 'Slow Hook', description: 'Hook takes more than 3 seconds, viewer scrolls past.', triggerParam: 'hook_velocity', threshold: 5 },
  { id: 'flat_tension', name: 'Flat Tension Curve', description: 'No mini-cliffhangers or tension peaks throughout runtime.', triggerParam: 'cliff_density', threshold: 5 },
  { id: 'dialogue_overload', name: 'Dialogue Overload', description: 'Too much dialogue for ultra-short format.', triggerParam: 'dialogue_efficiency', threshold: 4 },
  { id: 'horizontal_thinking', name: 'Horizontal Thinking', description: 'Composition designed for 16:9 applied to 9:16.', triggerParam: 'vertical_format_optimization', threshold: 4 },
  { id: 'forgettable_characters', name: 'Forgettable Characters', description: 'Characters not immediately legible or memorable.', triggerParam: 'character_legibility_at_speed', threshold: 4 },
  { id: 'weak_ending', name: 'Weak Episode Ending', description: 'Ending satisfies without driving series continuation.', triggerParam: 'series_hook', threshold: 5 },
];

// ============= COMBINED PARAMETER LIST =============

export const ALL_PARAMETERS: ParameterDefinition[] = [
  ...CORE_PARAMETERS,
  ...COMIC_PARAMETERS,
  ...WEB_SERIES_PARAMETERS,
  ...MICRO_DRAMA_PARAMETERS,
];

// ============= UTILITY FUNCTIONS =============

export function getParametersForScriptType(scriptType: string): ParameterDefinition[] {
  const isComic = ['comic', 'comic_series', 'graphic_novel', 'limited_comic_series', 'anthology_comic'].includes(scriptType);
  const isWebSeries = scriptType === 'web_series';
  const isMicroDrama = scriptType === 'micro_drama';
  
  const params = ALL_PARAMETERS.filter(p => {
    if (p.applicableScriptTypes === 'all') return true;
    return p.applicableScriptTypes.includes(scriptType);
  });
  
  return params;
}

export function getParametersForWebSeries(episodeLengthClass?: EpisodeLengthClass): ParameterDefinition[] {
  // Get base web series parameters
  let params = WEB_SERIES_PARAMETERS.filter(p => {
    // Always include core web series parameters
    if (['hook_efficiency', 'episode_self_containment', 'serial_momentum', 'retention_curve_design',
         'character_stickiness', 'platform_native_storytelling', 'tonality_format_consistency',
         'production_simplicity_velocity', 'shareability_meme_potential', 'monetization_readiness'].includes(p.id)) {
      return true;
    }
    // Only include long-form parameters if applicable
    if (['mid_episode_rehooking', 'soft_act_integrity', 'binge_continuity_pressure'].includes(p.id)) {
      return episodeLengthClass === 'long_form_web';
    }
    return false;
  });

  // Apply weight modifiers based on episode length class
  if (episodeLengthClass && EPISODE_LENGTH_WEIGHT_MODIFIERS[episodeLengthClass]) {
    const modifiers = EPISODE_LENGTH_WEIGHT_MODIFIERS[episodeLengthClass];
    params = params.map(p => {
      const modifier = modifiers[p.id];
      if (modifier) {
        return { ...p, weight: p.weight * modifier };
      }
      return p;
    });
  }

  return params;
}

export function getParameterById(id: string): ParameterDefinition | undefined {
  return ALL_PARAMETERS.find(p => p.id === id || p.name === id);
}

export function getParametersByCategory(category: string): ParameterDefinition[] {
  return ALL_PARAMETERS.filter(p => p.category === category);
}

export function getParametersByAgent(agentSource: string): ParameterDefinition[] {
  return ALL_PARAMETERS.filter(p => p.agentSource === agentSource);
}

// Comics maturity scale from framework
export const COMICS_MATURITY_SCALE = {
  '9-10': 'Production-ready',
  '7-8': 'Strong',
  '5-6': 'Developing',
  '3-4': 'Weak',
  '1-2': 'Underdeveloped',
};

// Web Series maturity scale
export const WEB_SERIES_MATURITY_SCALE = {
  '9-10': 'Platform-ready',
  '7-8': 'Strong potential',
  '5-6': 'Developing',
  '3-4': 'Needs work',
  '1-2': 'Not viable',
};

// Auto-detected failure patterns for comics
export const COMIC_FAILURE_PATTERNS = [
  { id: 'prose_in_panels', name: 'Prose-in-Panels Syndrome', description: 'Treating comic pages as prose pages with illustrations instead of visual storytelling.' },
  { id: 'balloon_overload', name: 'Balloon Overload', description: 'Too much dialogue crowding panels and obscuring art.' },
  { id: 'page_turn_waste', name: 'Page-Turn Waste', description: 'Failing to use page turns for reveals and dramatic effect.' },
  { id: 'redundant_narration', name: 'Redundant Narration', description: 'Captions describing exactly what the art already shows.' },
  { id: 'art_underutilization', name: 'Art Underutilization', description: 'Not leveraging visual medium for storytelling, relying on text.' },
];

// Comic secondary tags
export const COMIC_SECONDARY_TAGS = [
  { id: 'writer_led', name: 'Writer-Led', description: 'Project driven primarily by the writer.' },
  { id: 'artist_led', name: 'Artist-Led', description: 'Project driven primarily by the artist.' },
  { id: 'writer_artist_hybrid', name: 'Writer-Artist Hybrid', description: 'Creator handling both writing and art.' },
  { id: 'franchise_ip', name: 'Franchise IP', description: 'Based on existing franchise or intellectual property.' },
  { id: 'creator_owned', name: 'Creator-Owned', description: 'Original IP owned by creators.' },
];

// Export format for downloadable parameter file
export function exportParametersToJSON(): string {
  return JSON.stringify({
    version: '3.1.0',
    exportDate: new Date().toISOString(),
    coreParameters: CORE_PARAMETERS,
    comicParameters: COMIC_PARAMETERS,
    webSeriesParameters: WEB_SERIES_PARAMETERS,
    microDramaParameters: MICRO_DRAMA_PARAMETERS,
    episodeLengthWeightModifiers: EPISODE_LENGTH_WEIGHT_MODIFIERS,
    comicsMaturityScale: COMICS_MATURITY_SCALE,
    webSeriesMaturityScale: WEB_SERIES_MATURITY_SCALE,
    comicFailurePatterns: COMIC_FAILURE_PATTERNS,
    webSeriesFailurePatterns: WEB_SERIES_FAILURE_PATTERNS,
    microDramaFailurePatterns: MICRO_DRAMA_FAILURE_PATTERNS,
    comicSecondaryTags: COMIC_SECONDARY_TAGS,
    classificationRules: CLASSIFICATION_RULES,
  }, null, 2);
}

// Get parameters specifically for micro drama
export function getParametersForMicroDrama(): ParameterDefinition[] {
  return MICRO_DRAMA_PARAMETERS;
}

// Micro Drama maturity scale
export const MICRO_DRAMA_MATURITY_SCALE = {
  '9-10': 'Viral-ready',
  '7-8': 'Platform-ready',
  '5-6': 'Developing',
  '3-4': 'Needs work',
  '1-2': 'Format mismatch',
};
