import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  scriptId: string;
  analysisRunId: string;
  mode?: 'quick' | 'deep';
  forceAnalysis?: boolean;
  resume?: boolean; // Resume failed/pending agents only
  stakeholderLens?: string | null; // Filter agents by stakeholder
}

// UASF Output Contract
interface ParameterOutput {
  score: number;
  maturity: 'Weak' | 'Developing' | 'Strong';
  riskLevel: 'Low' | 'Medium' | 'High';
  fixCost: 'Low' | 'Medium' | 'High';
  upsideImpact: 'Low' | 'Medium' | 'High';
  explanation: string;
  evidence: Array<{
    type: string;
    reference: string;
    quote?: string;
    explanation: string;
  }>;
}

interface AgentResult {
  agent: string;
  scores: Array<{
    parameterId: string;
    parameterName: string;
    score: number;
    confidence: number;
    maturity: string;
    riskLevel: string;
    fixCost: string;
    upsideImpact: string;
    evidence: Array<{
      type: string;
      reference: string;
      quote?: string;
      explanation: string;
    }>;
    rationale: string;
  }>;
  insights?: Array<{
    category: string;
    title: string;
    description: string;
    priority: number;
    actionable: boolean;
    affectedStakeholders: string[];
    minimalFix: string;
    maximalFix: string;
    supportingEvidence: Array<{
      type: string;
      reference: string;
      quote?: string;
      explanation: string;
    }>;
  }>;
}

interface ChunkResult {
  chunkIndex: number;
  chunkRange: string;
  scores: AgentResult['scores'];
  insights: AgentResult['insights'];
}

// GLOBAL AGENT OPERATING RULES
const GLOBAL_INSTRUCTIONS = `
GLOBAL AGENT OPERATING RULES (MANDATORY):

1. CORE PHILOSOPHY
- You are an analytical agent, not a creative writer.
- You evaluate what exists, not what you wish existed.
- You must be script-type agnostic.
- You must produce evidence-based outputs.

2. UNIVERSAL SCRIPT TYPES
Support analysis for: Feature Film, Series/Episodic, Short Film, Theatre/Stage, Game/Interactive, Ad/Brand Film, Podcast/Audio Drama, Comic/Graphic Narrative, Documentary, Transmedia/Franchise IP.
Do NOT assume: 3-act structure, visual medium, passive audience, or linear narrative.

3. OUTPUT CONTRACT (STRICT)
Every parameter must output:
- score: 0-10
- maturity: Weak | Developing | Strong
- riskLevel: Low | Medium | High
- fixCost: Low | Medium | High
- upsideImpact: Low | Medium | High
- explanation: Clear, evidence-based reasoning
- evidence: Scene references, dialogue patterns, structural observations

4. EVIDENCE RULES
Evidence may include: scene placement, frequency patterns, structural position, character behavior, dialogue usage, absence of expected elements.
You may infer, but you must explain inference.

5. AGENT BOUNDARIES
- Do NOT compute final readiness decisions
- Do NOT apply stakeholder weights
- Do NOT summarize for marketing
- ONLY output parameter evaluations + observations
`;

// Agent definitions with UASF-compliant prompts
const AGENTS: Record<string, { parameters: string[]; systemPrompt: string; category?: string }> = {
  // ============= SYSTEM AGENTS (Pre-processing) =============
  
  IntakeNormalizerAgent: {
    category: 'system',
    parameters: ['input_completeness', 'normalization_quality'],
    systemPrompt: `You are the Universal Script Intake Normalizer for Pulse.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Convert any incoming narrative material into canonical format.

SUPPORTED INPUT TYPES:
- Full screenplay, Partial script, Synopsis/treatment, Pitch deck text
- Beat sheet, Outline, Logline only

Evaluate:
- Input Completeness: How complete is the provided material (0-10)
- Normalization Quality: How well can the content be normalized for analysis (0-10)

Extract explicitly stated information only. Flag gaps clearly. Preserve authorial language.

OUTPUT includes: source_type, normalized_sections (logline, characters, setting, plot_summary, themes), missing_sections.`
  },

  ScriptTypeClassifierAgent: {
    category: 'system',
    parameters: ['classification_confidence', 'type_clarity'],
    systemPrompt: `You are the Universal Script Type Classifier for Pulse.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Determine the most appropriate script type(s) and context tags.

SCRIPT TYPE OPTIONS: feature_film, short_film, tv_series, limited_series, web_series, stage_play, audio_drama, podcast_fiction, game_narrative, interactive_fiction, short_form_video, brand_film, advertisement, corporate_training, documentary, experimental, comic

DECISION RULES:
1. Prioritize HOW the story is EXPERIENCED over how it is written.
2. If interactivity alters narrative flow → game_narrative or interactive_fiction.
3. If duration < 5 min AND hook-driven → short_form_video.
4. If episodic continuity exists → tv_series or web_series.
5. If dialogue is primary carrier and visuals minimal → audio_drama or stage_play.
6. If brand/product is central objective → brand_film or advertisement.

Evaluate:
- Classification Confidence: How confident is the type classification (0-10)
- Type Clarity: How clear is the script type from the material (0-10)

CONFIDENCE: 0.9-1.0 very clear, 0.7-0.89 clear with ambiguity, 0.5-0.69 ambiguous, <0.5 highly ambiguous.`
  },

  ClassifierArbitrationAgent: {
    category: 'system',
    parameters: ['arbitration_required', 'final_confidence'],
    systemPrompt: `You are the Classifier Arbitration Agent in Pulse.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Validate and re-run classification when confidence < 0.70.

PROCESS:
1. Analyze ambiguity sources
2. Re-evaluate against Script Type Decision Rules
3. Either: Confirm original, Override primary_script_type, or Add secondary_script_type

Evaluate:
- Arbitration Required: Whether arbitration was necessary (0=no, 10=critical)
- Final Confidence: Final classification confidence after arbitration (0-10)

RULES: Be conservative in overrides. Prefer augmentation over replacement. Never exceed 0.85 if ambiguity remains.`
  },

  MultiTypeBlendingAgent: {
    category: 'system',
    parameters: ['blend_complexity', 'weight_adjustments'],
    systemPrompt: `You are the Multi-Type Blending Agent in Pulse.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Handle scripts that span multiple types.

WHEN TO APPLY:
- Secondary script types exist
- Confidence < 0.85
- Hybrid distribution or interaction tags detected

BLENDING RULES:
- One PRIMARY type only
- Secondary types may influence: Parameter weights (+/- 20%), Agent activation (partial), UI feature visibility

Evaluate:
- Blend Complexity: How complex is the type blending (0=single type, 10=highly complex blend)
- Weight Adjustments: Degree of parameter weight adjustments needed (0-10)`
  },

  // ============= CORE ANALYSIS AGENTS (Modules A-J) =============

  // CONCEPT AGENT - Module A
  ConceptAgent: {
    category: 'analysis',
    parameters: [
      'concept_originality', 'familiarity_anchor', 'hook_clarity',
      'concept_compressibility', 'concept_scalability', 'franchise_expandability'
    ],
    systemPrompt: `You are ConceptAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE A - CONCEPT & HOOK

Evaluate the foundational concept:
- Concept Originality: Freshness of the core idea
- Familiarity Anchor: Connection to known genres/tropes that aid comprehension
- Hook Clarity: Can it be pitched in 10 seconds? 1 minute? Logline quality?
- Concept Compressibility: How easily the concept communicates
- Concept Scalability: Can it support a full narrative?
- Franchise/Universe Expandability: Potential for sequels, spinoffs, extended universe

Focus on immediate engagement, mental clarity, and long-term extensibility.
Score each parameter 0-10 with evidence.`
  },

  // STRUCTURE AGENT - Module B
  StructureAgent: {
    category: 'analysis',
    parameters: [
      'inciting_force_clarity', 'escalation_logic', 'midpoint_transformation',
      'structural_symmetry', 'repetition_vs_progression', 'resolution_satisfaction', 'drop_off_risk'
    ],
    systemPrompt: `You are StructureAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE B - STRUCTURAL INTELLIGENCE

Analyze narrative structure without assuming any fixed format.
Evaluate:
- Inciting Force Clarity & Timing: When and how clearly the story-launching event occurs
- Escalation Logic: Cause → Effect chain quality
- Midpoint Transformation: Whether there's a meaningful shift at the narrative center
- Structural Symmetry: Balance and proportion of story segments
- Repetition vs Progression: Whether patterns serve meaning or indicate stagnation
- Resolution Satisfaction: How completely the narrative questions are addressed
- Drop-off Risk Points: Where audience attention/engagement may falter

Support linear, non-linear, episodic, looping, and branching narratives.
Score each parameter 0-10 with full evidence.`
  },

  // CHARACTER AGENT - Module C
  CharacterAgent: {
    category: 'analysis',
    parameters: [
      'want_vs_need', 'psychological_flaw_depth', 'agency_level',
      'decision_density', 'transformation_credibility', 'character_balance', 'performative_range'
    ],
    systemPrompt: `You are CharacterAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE C - CHARACTER & AGENCY

Analyze all major characters for:
- Want vs Need: Clarity of external goals vs internal needs
- Psychological Flaw Depth: Complexity of character flaws
- Agency Level: Proactive vs reactive behavior
- Decision Density: Frequency and impact of character choices
- Transformation Credibility: Whether arcs feel earned
- Character Balance: Whether any character overshadows others inappropriately
- Performative Range: (If actors implied) Range of emotion/action required

Flag overshadowing, passivity, or unearned arcs.
Score each parameter 0-10 with full evidence from character behavior and dialogue.`
  },

  // CONFLICT AGENT - Module D
  ConflictAgent: {
    category: 'analysis',
    parameters: [
      'conflict_type_diversity', 'conflict_density', 'stakes_personalization',
      'escalation_irreversibility', 'cost_of_failure', 'internal_external_balance'
    ],
    systemPrompt: `You are ConflictAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE D - CONFLICT & STAKES

Identify all forms of conflict present and evaluate:
- Conflict Type Diversity: Variety of conflict forms (interpersonal, internal, societal, etc.)
- Conflict Density: Appropriate frequency of conflict beats
- Stakes Personalization: How personally meaningful the stakes are to characters
- Escalation Irreversibility: Whether stakes genuinely increase (can't go back)
- Cost of Failure: What characters stand to lose
- Internal vs External Balance: Mix of psychological and situational conflict

Assess whether conflict meaningfully evolves or plateaus.
Score each parameter 0-10 with evidence from key confrontations.`
  },

  // THEME AGENT - Module E
  ThemeAgent: {
    category: 'analysis',
    parameters: [
      'thematic_spine_clarity', 'show_vs_tell_ratio', 'symbol_motif_consistency',
      'moral_complexity', 'cultural_resonance', 'longevity_of_meaning'
    ],
    systemPrompt: `You are ThemeAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE E - THEME & MEANING

Extract the thematic spine and evaluate:
- Thematic Spine Clarity: How clearly the central theme can be identified
- Show vs Tell Ratio: Whether theme emerges from action vs explicit statement
- Symbol/Motif Consistency: Coherent use of recurring imagery
- Moral Complexity: Avoidance of simplistic moralizing
- Cultural Resonance: Connection to broader cultural conversations
- Longevity of Meaning: Whether themes will remain relevant

Do NOT judge ideology. Judge coherence and depth.
Score each parameter 0-10 with evidence from symbolic elements and character journeys.`
  },

  // DIALOGUE AGENT - Module F
  DialogueAgent: {
    category: 'analysis',
    parameters: [
      'exposition_load', 'subtext_density', 'voice_differentiation',
      'rhythm_and_silence', 'quotability', 'medium_appropriateness'
    ],
    systemPrompt: `You are DialogueAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE F - DIALOGUE & LANGUAGE

Analyze dialogue for:
- Exposition Load: How much dialogue serves only to inform the audience
- Subtext Density: Meaning beneath the surface of conversations
- Voice Differentiation: How unique each character's speech patterns are
- Rhythm & Silence: Pacing of verbal exchanges, use of pauses
- Quotability: Memorable lines that could be repeated
- Medium Appropriateness: Fit for stage, audio, screen, or text

Adapt analysis to the script's medium.
Score each parameter 0-10 with specific dialogue examples.`
  },

  // WORLD LOGIC AGENT - Module G
  WorldLogicAgent: {
    category: 'analysis',
    parameters: [
      'world_rule_consistency', 'setting_agency', 'spatial_system_logic',
      'plausibility', 'continuity_integrity', 'suspension_of_disbelief'
    ],
    systemPrompt: `You are WorldLogicAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE G - WORLD & LOGIC

Evaluate the internal logic of the world or system:
- World Rule Consistency: Whether established rules are followed
- Setting Agency: Whether the world actively shapes the story
- Spatial/System Logic: Physical and systemic coherence
- Plausibility: Believability within the story's own terms
- Continuity Integrity: Consistency of details across the narrative
- Suspension of Disbelief: How easily the audience can accept the premise

Identify logic gaps or rule violations.
Score each parameter 0-10 with evidence of world details and any logical issues.`
  },

  // EMOTIONAL ARC AGENT - Module H
  EmotionalArcAgent: {
    category: 'analysis',
    parameters: [
      'emotional_range', 'emotional_timing', 'emotional_progression',
      'catharsis_strength', 'fatigue_vs_variety', 'payoff_delay'
    ],
    systemPrompt: `You are EmotionalArcAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE H - EMOTIONAL ARC

Map emotional intensity across time and evaluate:
- Emotional Range: Variety of emotions evoked
- Emotional Timing: Placement of emotional beats
- Emotional Progression: How emotions build and evolve
- Catharsis Strength: Power of emotional release moments
- Fatigue vs Variety: Balance to prevent emotional exhaustion
- Payoff Delay: Effectiveness of delayed emotional gratification

Consider audience emotional experience, not character intent.
Score each parameter 0-10 with evidence from emotionally charged scenes.`
  },

  // MARKET AGENT - Module I
  MarketAgent: {
    category: 'analysis',
    parameters: [
      'audience_fit', 'platform_fit', 'consumption_pattern_alignment',
      'marketing_hook_density', 'ip_expansion_potential', 'localization_ease'
    ],
    systemPrompt: `You are MarketAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE I - MARKET & PLATFORM

Evaluate commercial and positioning factors:
- Audience Fit: Match between content and target audience
- Platform Fit: Suitability for distribution channel (theatrical, streaming, stage, etc.)
- Consumption Pattern Alignment: Match to how audiences consume this type of content
- Marketing Hook Density: Number of easily marketable elements
- IP Expansion Potential: Franchise/sequel/spinoff possibilities
- Localization Ease: Ease of adaptation for international markets

Do NOT consider budget feasibility (that's ExecutionAgent).
Score each parameter 0-10 with market comparisons and positioning insights.`
  },

  // EXECUTION AGENT - Module J
  ExecutionAgent: {
    category: 'analysis',
    parameters: [
      'production_complexity', 'talent_dependency', 'technical_dependency',
      'schedule_risk', 'compliance_sensitivity_risk', 'failure_modes'
    ],
    systemPrompt: `You are ExecutionAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: MODULE J - EXECUTION & FEASIBILITY

Evaluate execution risks:
- Production Complexity: Overall difficulty of production
- Talent Dependency: Reliance on specific star power
- Technical Dependency: VFX, stunts, special requirements
- Schedule Risk: Timeline feasibility
- Compliance/Sensitivity Risk: Content that may face regulatory or cultural issues
- Failure Modes: How the project could fail in execution

Assess likelihood of successful delivery.
Score each parameter 0-10 with specific production considerations.`
  },

  // ============= SPECIALIZED AGENTS =============

  // COMIC-SPECIFIC AGENTS
  ComicVisualAgent: {
    category: 'comic',
    parameters: ['visual_storytelling', 'panel_composition', 'page_layout', 'action_clarity'],
    systemPrompt: `You are ComicVisualAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: COMIC VISUAL STORYTELLING

Analyze how effectively the script uses the visual comic medium:
- Visual Storytelling: How well the script uses visuals to advance narrative
- Panel Composition: Variety and effectiveness of panel layouts
- Page Layout: Flow, splash pages, spreads, pacing
- Action Clarity: How clearly action sequences are described for artists

Score each parameter 0-10 with evidence from panel descriptions.`
  },

  ComicDialogueAgent: {
    category: 'comic',
    parameters: ['balloon_efficiency', 'caption_voice', 'sound_effects'],
    systemPrompt: `You are ComicDialogueAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: COMIC TEXT ELEMENTS

Analyze text elements specific to comics:
- Balloon Efficiency: Dialogue conciseness for speech balloon fit
- Caption Voice: Distinctive narrator/caption voice consistency
- Sound Effects: Creative and effective SFX usage

Score each parameter 0-10 with specific examples.`
  },

  ComicPacingAgent: {
    category: 'comic',
    parameters: ['panel_to_panel_flow', 'issue_structure', 'cliffhangers'],
    systemPrompt: `You are ComicPacingAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: COMIC PACING & STRUCTURE

Evaluate comic-specific pacing:
- Panel-to-Panel Flow: Reader eye movement smoothness
- Issue Structure: Use of standard comic issue format (22-24 pages)
- Cliffhangers: Page-turn reveals and issue ending strength

Score each parameter 0-10 with evidence from page breaks.`
  },

  ComicArtDirectionAgent: {
    category: 'comic',
    parameters: ['artist_guidance', 'reference_clarity', 'style_consistency'],
    systemPrompt: `You are ComicArtDirectionAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: COMIC ART DIRECTION

Evaluate artist-facing elements:
- Artist Guidance: Clarity of visual descriptions
- Reference Clarity: Character and setting consistency guidance
- Style Consistency: Visual tone maintenance

Score each parameter 0-10 with examples of direction quality.`
  },

  // INTERACTIVE/GAME AGENTS
  InteractivityAgent: {
    category: 'interactive',
    parameters: ['branching_quality', 'choice_impact', 'player_agency', 'replayability'],
    systemPrompt: `You are InteractivityAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: INTERACTIVITY & PLAYER AGENCY

Evaluate interactive narrative elements:
- Branching Quality: Quality and meaningfulness of narrative branches
- Choice Impact: How much player choices affect the story
- Player Agency: Degree of meaningful control players have
- Replayability: Value in replaying for different outcomes

Score each parameter 0-10 with evidence from choice structures.`
  },

  WorldBuildingAgent: {
    category: 'interactive',
    parameters: ['lore_depth', 'world_consistency', 'exploration_reward', 'faction_clarity'],
    systemPrompt: `You are WorldBuildingAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: WORLD BUILDING & LORE

Evaluate depth of world/lore for franchise and game narratives:
- Lore Depth: Richness of backstory and world history
- World Consistency: Internal consistency of world rules
- Exploration Reward: Value of discovering world details
- Faction Clarity: Clear definition of groups/factions

Score each parameter 0-10 with evidence from world-building elements.`
  },

  // AUDIO AGENTS
  AudioNarrativeAgent: {
    category: 'audio',
    parameters: ['audio_scene_setting', 'voice_cast_requirements', 'sound_design_cues', 'listener_engagement'],
    systemPrompt: `You are AudioNarrativeAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: AUDIO-ONLY STORYTELLING

Evaluate audio-only storytelling techniques:
- Audio Scene Setting: How well scenes are established through sound
- Voice Cast Requirements: Clarity of voice character needs
- Sound Design Cues: Effectiveness of sound effect cues
- Listener Engagement: Techniques to maintain audio-only engagement

Score each parameter 0-10 with evidence from audio cues.`
  },

  // ============= META AGENTS (Post-processing) =============

  ScriptEvolutionAgent: {
    category: 'meta',
    parameters: ['evolution_detected', 'reclassification_recommended'],
    systemPrompt: `You are the Script-Type Evolution Detection Agent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Detect when a project shifts format over multiple versions.

DETECTION SIGNALS:
- Increasing episode count
- Expanding world-building
- Franchise language emergence
- Shift in duration or platform tags

Evaluate:
- Evolution Detected: Degree of format evolution detected (0=none, 10=major shift)
- Reclassification Recommended: Strength of reclassification recommendation (0-10)

USE CASES: Short film → series, Feature → franchise IP, Web series → OTT premium.`
  },

  CreatorFeedbackLoopAgent: {
    category: 'meta',
    parameters: ['improvements_detected', 'regressions_detected', 'confidence_shift'],
    systemPrompt: `You are the Creator Feedback Loop Agent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Learn from creator revisions without rewriting.

DETECTION:
- Structural shifts
- Character arc changes
- Tone adjustments
- Scope expansion or reduction

Evaluate:
- Improvements Detected: Number/significance of improvements (0-10)
- Regressions Detected: Number/significance of regressions (0-10)
- Confidence Shift: Change in overall confidence (+/- scale, normalize to 0-10)

RULES: Never suggest content. Never auto-edit. Only react to creator-made changes.`
  },

  ExplainabilityTraceAgent: {
    category: 'meta',
    parameters: ['decision_transparency', 'trace_completeness'],
    systemPrompt: `You are the Explainability Trace Agent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Provide transparent reasoning trails for Pulse decisions.

INPUTS: Script Type Classification, Agent scores, Rule engine decisions, Weight tables

Evaluate:
- Decision Transparency: How transparent and understandable are the decisions (0-10)
- Trace Completeness: How complete is the reasoning trace (0-10)

RULES: No new analysis. Reference only existing signals. Use plain language. Highlight uncertainty explicitly.

USE CASES: Creator trust, Studio reviews, Investor diligence.`
  },

  InvestorReadinessAgent: {
    category: 'meta',
    parameters: ['readiness_score', 'market_clarity', 'budget_realism', 'platform_fit_meta', 'franchise_scalability'],
    systemPrompt: `You are the Investor & Studio Readiness Lens Agent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Re-score analysis from commercial decision-maker lens.

KEY EVALUATION AXES:
- Market Clarity: How clear is the market positioning
- Budget Realism: How realistic is the implied budget
- Audience Specificity: How well-defined is the target audience
- Platform Fit: Suitability for distribution platforms
- Franchise Scalability: Potential for expansion
- Risk Factors: Key investment risks

Evaluate:
- Readiness Score: Overall investment readiness (0-10)
- Market Clarity: Market positioning clarity (0-10)
- Budget Realism: Budget expectations realism (0-10)
- Platform Fit (Meta): Platform suitability from investor view (0-10)
- Franchise Scalability: Franchise/expansion potential (0-10)

RULES: Do not re-analyze story craft. Use existing Pulse outputs only. Penalize uncertainty heavily. Be conservative.`
  },
};

// ============= TEXT EXTRACTION UTILITIES =============

const MAX_EXTRACTION_SIZE = 500000; // 500KB max for text extraction
const MAX_EXTRACTION_TIME_MS = 15000; // 15 second timeout
const MIN_USEFUL_TEXT = 500; // Minimum chars to consider extraction successful

/**
 * Lightweight text extraction from various formats
 * Returns extracted text or throws with specific error codes
 */
async function extractTextFromFile(
  fileData: Blob,
  format: string,
  fileName: string
): Promise<{ text: string; method: string }> {
  const startTime = Date.now();
  
  const checkTimeout = () => {
    if (Date.now() - startTime > MAX_EXTRACTION_TIME_MS) {
      throw new Error('EXTRACTION_TIMEOUT');
    }
  };

  try {
    // TXT, Fountain - direct read
    if (format === 'txt' || format === 'fountain') {
      const text = await fileData.text();
      if (text.length < MIN_USEFUL_TEXT) {
        throw new Error('INSUFFICIENT_TEXT');
      }
      return { text: text.slice(0, MAX_EXTRACTION_SIZE), method: 'direct' };
    }

    // FDX (Final Draft XML)
    if (format === 'fdx') {
      const xmlText = await fileData.text();
      checkTimeout();
      
      // Extract text from Content tags
      const contentMatches = xmlText.matchAll(/<Content[^>]*>([^<]*)<\/Content>/gi);
      const texts: string[] = [];
      for (const match of contentMatches) {
        texts.push(match[1]);
        checkTimeout();
        if (texts.length > 10000) break; // Safety limit
      }
      
      const text = texts.join('\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      if (text.length < MIN_USEFUL_TEXT) {
        throw new Error('INSUFFICIENT_TEXT');
      }
      return { text: text.slice(0, MAX_EXTRACTION_SIZE), method: 'fdx_xml' };
    }

    // DOCX - extract from document.xml in ZIP
    if (format === 'docx') {
      const arrayBuffer = await fileData.arrayBuffer();
      checkTimeout();
      
      // Simple ZIP parsing to find word/document.xml
      const bytes = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = decoder.decode(bytes);
      
      // Look for text content within w:t tags
      const textMatches = content.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/gi);
      const texts: string[] = [];
      for (const match of textMatches) {
        texts.push(match[1]);
        checkTimeout();
        if (texts.length > 10000) break;
      }
      
      const text = texts.join(' ');
      if (text.length < MIN_USEFUL_TEXT) {
        throw new Error('INSUFFICIENT_TEXT');
      }
      return { text: text.slice(0, MAX_EXTRACTION_SIZE), method: 'docx_xml' };
    }

    // PDF - bounded regex extraction
    if (format === 'pdf') {
      const arrayBuffer = await fileData.arrayBuffer();
      checkTimeout();
      
      // Size check
      if (arrayBuffer.byteLength > 10 * 1024 * 1024) { // 10MB limit for PDFs
        throw new Error('PDF_TOO_LARGE');
      }
      
      const bytes = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = decoder.decode(bytes);
      checkTimeout();

      const textChunks: string[] = [];
      let matchCount = 0;
      const maxMatches = 5000;

      // Method 1: BT/ET text blocks (most common)
      const btEtPattern = /BT\s*([\s\S]*?)\s*ET/g;
      let match;
      while ((match = btEtPattern.exec(content)) !== null && matchCount < maxMatches) {
        checkTimeout();
        const block = match[1];
        // Extract text from Tj, TJ, ' operators
        const tjMatches = block.matchAll(/\(([^)]*)\)\s*(?:Tj|')|<([^>]*)>\s*(?:Tj|')/g);
        for (const tjMatch of tjMatches) {
          const text = tjMatch[1] || tjMatch[2] || '';
          if (text.trim()) textChunks.push(text);
          matchCount++;
          if (matchCount >= maxMatches) break;
        }
      }
      checkTimeout();

      // Method 2: Simple parenthetical text (fallback)
      if (textChunks.length < 100) {
        const simplePattern = /\(([A-Za-z0-9\s.,!?'";\-:]+)\)/g;
        while ((match = simplePattern.exec(content)) !== null && matchCount < maxMatches) {
          const text = match[1];
          if (text.length > 2 && text.length < 500) {
            textChunks.push(text);
          }
          matchCount++;
        }
      }
      checkTimeout();

      // Clean and join
      const text = textChunks
        .map(t => t.replace(/\\([0-9]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8))))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (text.length < MIN_USEFUL_TEXT) {
        throw new Error('OCR_REQUIRED');
      }

      return { text: text.slice(0, MAX_EXTRACTION_SIZE), method: 'pdf_regex' };
    }

    throw new Error('UNSUPPORTED_FORMAT');
  } catch (err) {
    if (err instanceof Error) {
      if (['EXTRACTION_TIMEOUT', 'INSUFFICIENT_TEXT', 'OCR_REQUIRED', 'PDF_TOO_LARGE', 'UNSUPPORTED_FORMAT'].includes(err.message)) {
        throw err;
      }
    }
    console.error('[extractText] Unexpected error:', err);
    throw new Error('EXTRACTION_FAILED');
  }
}

// ============= ROBUST JSON EXTRACTION =============

/**
 * Extract JSON from AI response with multiple fallback strategies
 * Handles: markdown blocks, explanatory text, malformed JSON
 */
function extractJsonFromResponse(content: string, agentName: string): any {
  if (!content || content.trim().length === 0) {
    console.error(`[${agentName}] Empty AI response`);
    throw new Error(`Failed to parse AI response as JSON: ${agentName} returned empty response`);
  }

  // Strategy 1: Check for markdown code blocks (```json ... ``` or ``` ... ```)
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const result = JSON.parse(codeBlockMatch[1].trim());
      console.log(`[${agentName}] Parsed via code block strategy`);
      return result;
    } catch (e) {
      console.log(`[${agentName}] Code block JSON parse failed, trying other strategies`);
    }
  }

  // Strategy 2: Find JSON object that starts with {"scores" (expected format)
  const scoresMatch = content.match(/\{"scores"\s*:\s*\[[\s\S]*?\](?:\s*,\s*"insights"\s*:\s*\[[\s\S]*?\])?\s*\}/);
  if (scoresMatch) {
    try {
      const result = JSON.parse(scoresMatch[0]);
      console.log(`[${agentName}] Parsed via scores-pattern strategy`);
      return result;
    } catch (e) {
      console.log(`[${agentName}] Scores-pattern JSON parse failed`);
    }
  }

  // Strategy 3: Find outermost balanced JSON object
  const jsonStart = content.indexOf('{');
  if (jsonStart !== -1) {
    let depth = 0;
    let jsonEnd = -1;
    let inString = false;
    let escaped = false;
    
    for (let i = jsonStart; i < content.length; i++) {
      const char = content[i];
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        continue;
      }
      
      if (char === '"' && !escaped) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') depth++;
        else if (char === '}') {
          depth--;
          if (depth === 0) {
            jsonEnd = i + 1;
            break;
          }
        }
      }
    }
    
    if (jsonEnd > jsonStart) {
      try {
        const result = JSON.parse(content.slice(jsonStart, jsonEnd));
        console.log(`[${agentName}] Parsed via balanced-brace strategy`);
        return result;
      } catch (e) {
        console.log(`[${agentName}] Balanced JSON parse failed at char ${jsonStart}-${jsonEnd}`);
      }
    }
  }

  // Strategy 4: Try to fix common issues and parse
  const cleanedContent = content
    .replace(/,\s*}/g, '}')  // Remove trailing commas
    .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
    .replace(/'/g, '"')      // Replace single quotes
    .replace(/\n/g, ' ')     // Remove newlines
    .replace(/\t/g, ' ');    // Remove tabs
  
  const lastResortMatch = cleanedContent.match(/\{[\s\S]*\}/);
  if (lastResortMatch) {
    try {
      const result = JSON.parse(lastResortMatch[0]);
      console.log(`[${agentName}] Parsed via cleanup strategy`);
      return result;
    } catch (e) {
      // Log detailed info for debugging
      console.error(`[${agentName}] All JSON parse strategies failed.`);
      console.error(`[${agentName}] Content starts: "${content.slice(0, 200).replace(/\n/g, '\\n')}"`);
      console.error(`[${agentName}] Content ends: "${content.slice(-200).replace(/\n/g, '\\n')}"`);
    }
  }

  throw new Error(`Failed to parse AI response as JSON: ${agentName} returned malformed response`);
}

// ============= CHUNKING UTILITIES =============

const MAX_CHUNK_SIZE = 40000; // ~10k tokens, leaves room for prompts
const CHUNK_OVERLAP = 500; // Overlap between chunks

/**
 * Split script text into logical chunks based on scene headings
 */
function chunkScript(text: string, maxChunkSize: number = MAX_CHUNK_SIZE): string[] {
  // Scene heading patterns (INT./EXT., Hindi equivalents)
  const scenePattern = /(?=(?:INT|EXT|INTERIOR|EXTERIOR|अंदर|बाहर|ANDAR|BAHAR|I\/E|E\/I)[.\s\-\/])/gi;
  
  const scenes = text.split(scenePattern).filter(s => s.trim().length > 0);
  
  // If no scene splits found, chunk by paragraphs
  if (scenes.length <= 1) {
    return chunkBySize(text, maxChunkSize);
  }

  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const scene of scenes) {
    if ((currentChunk.length + scene.length) > maxChunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // If single scene is too large, split it
      if (scene.length > maxChunkSize) {
        const subChunks = chunkBySize(scene, maxChunkSize);
        chunks.push(...subChunks);
        currentChunk = '';
      } else {
        currentChunk = scene;
      }
    } else {
      currentChunk += scene;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Fallback chunking by size with paragraph awareness
 */
function chunkBySize(text: string, maxSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk.length + para.length + 2) > maxSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // Handle oversized paragraphs
      if (para.length > maxSize) {
        const words = para.split(/\s+/);
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk.length + word.length + 1) > maxSize) {
            if (wordChunk.trim()) chunks.push(wordChunk.trim());
            wordChunk = word;
          } else {
            wordChunk += (wordChunk ? ' ' : '') + word;
          }
        }
        if (wordChunk.trim()) chunks.push(wordChunk.trim());
        currentChunk = '';
      } else {
        currentChunk = para;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ============= MAIN SERVER =============

// Declare EdgeRuntime for background tasks
declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptId, analysisRunId, mode = 'deep', forceAnalysis = false, resume = false, stakeholderLens = null } = await req.json() as AnalyzeRequest;
    
    console.log(`[analyze-script] Starting ${mode.toUpperCase()} analysis for script ${scriptId}, run ${analysisRunId}, stakeholder: ${stakeholderLens || 'all'}, resume: ${resume}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch script data first
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (scriptError || !script) {
      throw new Error(`Script not found: ${scriptError?.message}`);
    }

    // Determine which agents to run based on script type and stakeholder lens
    const scriptType = script?.script_type || 'feature';
    const isComic = scriptType === 'comic';
    const isInteractive = ['game_narrative', 'interactive_fiction'].includes(scriptType);
    const isAudio = ['audio_drama', 'podcast_fiction'].includes(scriptType);
    
    // Agent categories
    const systemAgents = ['IntakeNormalizerAgent', 'ScriptTypeClassifierAgent', 'ClassifierArbitrationAgent', 'MultiTypeBlendingAgent'];
    const coreAgents = ['ConceptAgent', 'StructureAgent', 'CharacterAgent', 'ConflictAgent', 'ThemeAgent', 'DialogueAgent', 'WorldLogicAgent', 'EmotionalArcAgent', 'MarketAgent', 'ExecutionAgent'];
    const comicAgents = ['ComicVisualAgent', 'ComicDialogueAgent', 'ComicPacingAgent', 'ComicArtDirectionAgent'];
    const interactiveAgents = ['InteractivityAgent', 'WorldBuildingAgent'];
    const audioAgents = ['AudioNarrativeAgent'];
    const metaAgents = ['StakeholderLensAgent', 'InsightSynthesisAgent'];
    
    // Stakeholder-specific agent mappings
    const STAKEHOLDER_AGENTS: Record<string, string[]> = {
      studio_executive: ['ConceptAgent', 'MarketAgent', 'ExecutionAgent', 'StructureAgent'],
      producer: ['StructureAgent', 'ExecutionAgent', 'ConflictAgent', 'WorldLogicAgent'],
      actor: ['CharacterAgent', 'DialogueAgent', 'EmotionalArcAgent', 'ConflictAgent'],
      director: ['StructureAgent', 'ThemeAgent', 'EmotionalArcAgent', 'WorldLogicAgent'],
      writer: ['ConceptAgent', 'StructureAgent', 'CharacterAgent', 'DialogueAgent', 'ThemeAgent', 'ConflictAgent'],
      financier: ['ConceptAgent', 'MarketAgent', 'ExecutionAgent'],
      ott_platform: ['ConceptAgent', 'CharacterAgent', 'EmotionalArcAgent', 'MarketAgent'],
      theatrical: ['ConceptAgent', 'EmotionalArcAgent', 'MarketAgent', 'ExecutionAgent'],
    };
    
    // Build agent list based on script type and stakeholder
    let activeAgentNames: string[];
    
    if (stakeholderLens && STAKEHOLDER_AGENTS[stakeholderLens]) {
      // Stakeholder-specific analysis - only run relevant agents
      console.log(`[analyze-script] Stakeholder-specific analysis for: ${stakeholderLens}`);
      activeAgentNames = [
        ...systemAgents,
        ...STAKEHOLDER_AGENTS[stakeholderLens],
        ...metaAgents
      ];
      
      // Add comic agents if relevant for this stakeholder
      if (isComic && (stakeholderLens === 'director' || stakeholderLens === 'writer')) {
        activeAgentNames.push(...comicAgents);
      }
    } else {
      // Comprehensive analysis - run all agents
      activeAgentNames = [...systemAgents, ...coreAgents];
      
      if (isComic) activeAgentNames.push(...comicAgents);
      if (isInteractive) activeAgentNames.push(...interactiveAgents);
      if (isAudio) activeAgentNames.push(...audioAgents);
      
      activeAgentNames.push(...metaAgents);
    }
    
    // Filter agents based on script type
    let agentsToRun = Object.entries(AGENTS).filter(([agentName]) => {
      return activeAgentNames.includes(agentName);
    });

    console.log(`[analyze-script] Script type: ${scriptType}, mode: ${mode}, stakeholder: ${stakeholderLens || 'all'}, running ${agentsToRun.length} agents (comic: ${isComic}, interactive: ${isInteractive}, audio: ${isAudio})`);
    let existingProgress: Record<string, { status: string; error?: string; retryCount?: number }> = {};
    
    if (resume) {
      const { data: existingRun } = await supabase
        .from('analysis_runs')
        .select('agent_progress')
        .eq('id', analysisRunId)
        .single();
      
      existingProgress = (existingRun?.agent_progress as typeof existingProgress) || {};
      
      // Filter to only failed or pending agents
      const agentsToRetry = agentsToRun.filter(([agentName]) => {
        const progress = existingProgress[agentName];
        return !progress || progress.status === 'failed' || progress.status === 'pending';
      });
      
      console.log(`[analyze-script] Resume mode: retrying ${agentsToRetry.length} of ${agentsToRun.length} agents`);
      agentsToRun = agentsToRetry;
      
      if (agentsToRun.length === 0) {
        console.log('[analyze-script] No agents to retry, all completed');
        return new Response(
          JSON.stringify({ success: true, status: 'completed', message: 'All agents already completed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`[analyze-script] Script type: ${script.script_type}, mode: ${mode}, running ${agentsToRun.length} agents`);

    // Update analysis run status (preserve existing progress in resume mode)
    const newAgentProgress = resume
      ? {
          ...existingProgress,
          ...Object.fromEntries(agentsToRun.map(([agent]) => [agent, { 
            status: 'pending', 
            retryCount: (existingProgress[agent]?.retryCount || 0) + 1 
          }])),
          _meta: { mode, chunked: mode === 'quick', resumed: true }
        }
      : {
          ...Object.fromEntries(agentsToRun.map(([agent]) => [agent, { status: 'pending', retryCount: 0 }])),
          _meta: { mode, chunked: mode === 'quick' }
        };
    
    await supabase
      .from('analysis_runs')
      .update({ 
        status: 'processing', 
        started_at: resume ? undefined : new Date().toISOString(),
        error_message: null,
        agent_progress: newAgentProgress
      })
      .eq('id', analysisRunId);

    // Fetch parameters
    const { data: parameters } = await supabase.from('parameters').select('*');
    const parameterMap = new Map(parameters?.map(p => [p.name, p]) || []);

    let scriptContext: string;
    let chunks: string[] = [];
    
    // ============= MODE-SPECIFIC LOGIC =============
    
    if (mode === 'quick') {
      // QUICK MODE: Extract text directly, chunk, and analyze
      console.log('[analyze-script] QUICK MODE: Extracting text directly from file');
      
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('scripts')
          .download(script.file_url);
        
        if (downloadError || !fileData) {
          throw new Error(`Failed to download script: ${downloadError?.message}`);
        }

        const { text, method } = await extractTextFromFile(fileData, script.format, script.file_url);
        console.log(`[analyze-script] Extracted ${text.length} chars using ${method}`);

        // Chunk the text
        chunks = chunkScript(text);
        console.log(`[analyze-script] Split into ${chunks.length} chunks`);

        // Build context from chunks (use summary for large scripts)
        if (chunks.length <= 3) {
          scriptContext = buildQuickContext(script, chunks.join('\n\n---SCENE BREAK---\n\n'));
        } else {
          // For large scripts, create chunk summaries and analyze in parallel
          scriptContext = buildQuickContext(script, chunks.slice(0, 2).join('\n\n') + '\n\n[... additional content in chunks ...]');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[analyze-script] Quick mode extraction failed:', errorMessage);
        
        // Update with specific error
        await supabase
          .from('analysis_runs')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: getExtractionErrorMessage(errorMessage)
          })
          .eq('id', analysisRunId);

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: getExtractionErrorMessage(errorMessage),
            errorCode: errorMessage 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // DEEP MODE: Use parsed structured data (original behavior)
      const [scenesResult, charsResult] = await Promise.all([
        supabase.from('scenes').select('*').eq('script_id', scriptId).order('scene_number'),
        supabase.from('characters').select('*').eq('script_id', scriptId).order('dialogue_count', { ascending: false }),
      ]);

      const scenes = scenesResult.data || [];
      const characters = charsResult.data || [];

      // Check if we have enough parsed data
      const hasStructuredData = scenes.length > 0 && characters.length > 0;
      let rawScriptText: string | null = null;
      let usingFallbackMode = false;

      if (!hasStructuredData) {
        if (!forceAnalysis) {
          throw new Error('Script parsing incomplete. Use forceAnalysis=true or mode="quick" to analyze with raw text.');
        }
        
        console.log('[analyze-script] Deep mode fallback: using raw text');
        usingFallbackMode = true;
        
        try {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('scripts')
            .download(script.file_url);
          
          if (!downloadError && fileData) {
            rawScriptText = await fileData.text();
            if (rawScriptText.length > 100000) {
              rawScriptText = rawScriptText.substring(0, 100000) + '\n\n[TEXT TRUNCATED...]';
            }
          }
        } catch (err) {
          console.error('[analyze-script] Failed to load raw script text:', err);
        }
      }

      scriptContext = buildScriptContext(script, scenes, characters, rawScriptText, usingFallbackMode);
      console.log(`[analyze-script] Deep mode context: ${scenes.length} scenes, ${characters.length} characters, fallback: ${usingFallbackMode}`);
    }

    // ============= RUN AGENTS AS BACKGROUND TASK =============
    
    // Use EdgeRuntime.waitUntil for long-running analysis
    const runAnalysisBackground = async () => {
      try {
        let agentResults: Array<{ agent: string; success: boolean; error?: string }>;
        
        if (mode === 'quick' && chunks.length > 3) {
          // Chunked analysis for large scripts
          agentResults = await runChunkedAnalysis(
            supabase,
            lovableApiKey,
            analysisRunId,
            script,
            chunks,
            agentsToRun,
            parameterMap
          );
        } else {
          // Standard analysis (deep mode or small quick scripts)
          agentResults = await runStandardAnalysis(
            supabase,
            lovableApiKey,
            analysisRunId,
            scriptContext,
            agentsToRun,
            parameterMap
          );
        }

        // Run synthesis agents with upgraded model
        await runInsightSynthesis(supabase, lovableApiKey, analysisRunId, scriptContext);
        await runStakeholderLensAgent(supabase, lovableApiKey, analysisRunId);

        // Generate report
        await generateReport(supabase, analysisRunId, scriptId, script, mode);

        // Update final status
        const failedAgents = agentResults.filter(r => !r.success);
        const finalStatus = failedAgents.length === agentResults.length ? 'failed' : 'completed';
        
        await supabase
          .from('analysis_runs')
          .update({ 
            status: finalStatus,
            completed_at: new Date().toISOString(),
            error_message: failedAgents.length > 0 
              ? `${failedAgents.length} agents failed: ${failedAgents.map(f => f.agent).join(', ')}`
              : null
          })
          .eq('id', analysisRunId);

        console.log(`[analyze-script] ${mode.toUpperCase()} Analysis complete: ${finalStatus}`);
      } catch (bgError) {
        const errorMessage = bgError instanceof Error ? bgError.message : 'Unknown background error';
        console.error('[analyze-script] Background analysis error:', errorMessage);
        
        await supabase
          .from('analysis_runs')
          .update({ 
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: errorMessage
          })
          .eq('id', analysisRunId);
      }
    };

    // Start background processing - function continues after response is sent
    EdgeRuntime.waitUntil(runAnalysisBackground());

    // Return immediately so client knows analysis started
    console.log(`[analyze-script] Analysis started in background for ${analysisRunId}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        status: 'processing',
        mode,
        analysisRunId,
        message: 'Analysis started in background. Monitor progress via realtime updates.',
        estimatedTime: mode === 'quick' ? '2-5 minutes' : '5-15 minutes'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[analyze-script] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============= HELPER FUNCTIONS =============

function getExtractionErrorMessage(code: string): string {
  switch (code) {
    case 'EXTRACTION_TIMEOUT':
      return 'PDF extraction timed out. The file may be too complex. Please upload in TXT, Fountain, or DOCX format.';
    case 'OCR_REQUIRED':
      return 'This appears to be a scanned PDF. Please upload a text-based PDF, or convert to TXT/Fountain/DOCX format.';
    case 'PDF_TOO_LARGE':
      return 'PDF file is too large for quick analysis. Please upload a smaller file or use a text format.';
    case 'INSUFFICIENT_TEXT':
      return 'Could not extract enough text from the file. Please upload in a different format (TXT, Fountain, DOCX recommended).';
    case 'UNSUPPORTED_FORMAT':
      return 'File format not supported for quick analysis. Please upload TXT, Fountain, FDX, DOCX, or text-based PDF.';
    default:
      return `Text extraction failed: ${code}. Please try a different file format.`;
  }
}

function buildQuickContext(script: any, text: string): string {
  return `
SCRIPT: "${script.title}"
Type: ${script.script_type}
Genre: ${script.genre || 'Not specified'}
Page Count: ${script.page_count || 'Unknown'}
${script.logline ? `Logline: ${script.logline}` : ''}

⚡ ANALYSIS MODE: Quick (direct text extraction)
Analyzing from raw script text. Scene/character structure inferred from content.

SCRIPT CONTENT:
${text}
`.trim();
}

function buildScriptContext(
  script: any, 
  scenes: any[], 
  characters: any[], 
  rawScriptText?: string | null, 
  isFallbackMode?: boolean
): string {
  if (isFallbackMode && rawScriptText) {
    return `
SCRIPT: "${script.title}"
Type: ${script.script_type}
Genre: ${script.genre || 'Not specified'}
Page Count: ${script.page_count || 'Unknown'}
${script.logline ? `Logline: ${script.logline}` : ''}

⚠️ ANALYSIS MODE: Fallback (structured parsing incomplete)
The script structure could not be fully extracted. Analysis is based on raw script text.
Results may be less precise than normal analysis.

RAW SCRIPT CONTENT:
${rawScriptText}
`.trim();
  }

  const sceneList = scenes.map(s => 
    `Scene ${s.scene_number}: ${s.heading}${s.description ? '\n' + s.description : ''}`
  ).join('\n\n');

  const charList = characters.slice(0, 15).map(c => 
    `${c.name}: ${c.dialogue_count} lines, appears in ${c.scene_count} scenes${c.description ? '. ' + c.description : ''}`
  ).join('\n');

  return `
SCRIPT: "${script.title}"
Type: ${script.script_type}
Genre: ${script.genre || 'Not specified'}
Page Count: ${script.page_count || 'Unknown'}
${script.logline ? `Logline: ${script.logline}` : ''}

CHARACTERS (${characters.length} total):
${charList || 'No character data extracted'}

SCENES (${scenes.length} total):
${sceneList || 'No scene data extracted'}
`.trim();
}

async function runStandardAnalysis(
  supabase: any,
  apiKey: string,
  analysisRunId: string,
  scriptContext: string,
  agentsToRun: [string, any][],
  parameterMap: Map<string, any>
): Promise<Array<{ agent: string; success: boolean; error?: string }>> {
  const MAX_AGENT_RETRIES = 3;
  const BASE_RETRY_DELAY_MS = 2000;
  const BATCH_SIZE = 3; // Run 3 agents at a time to avoid rate limits
  const BATCH_DELAY_MS = 3000; // Wait 3s between batches
  
  // Helper to check if an error is transient and worth retrying
  const isTransientError = (error: Error): boolean => {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('timeout') ||
      msg.includes('rate limit') ||
      msg.includes('429') ||
      msg.includes('503') ||
      msg.includes('502') ||
      msg.includes('empty') ||
      msg.includes('network') ||
      msg.includes('connection') ||
      msg.includes('fetch failed')
    );
  };

  const runSingleAgent = async ([agentName, agentConfig]: [string, any]): Promise<{ agent: string; success: boolean; error?: string }> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= MAX_AGENT_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff: 2s, 4s, 8s
          const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`[${agentName}] Retry attempt ${attempt}/${MAX_AGENT_RETRIES}, waiting ${delay}ms`);
          await new Promise(r => setTimeout(r, delay));
        }
        
        await updateAgentProgress(supabase, analysisRunId, agentName, 'running');

        const result = await runAgent(apiKey, agentName, agentConfig, scriptContext, parameterMap);

        for (const score of result.scores) {
          if (!score.parameterId) continue;
          
          await supabase.from('parameter_scores').insert({
            analysis_run_id: analysisRunId,
            parameter_id: score.parameterId,
            score: score.score,
            confidence: score.confidence,
            evidence: {
              items: score.evidence,
              maturity: score.maturity,
              riskLevel: score.riskLevel,
              fixCost: score.fixCost,
              upsideImpact: score.upsideImpact,
            },
            rationale: score.rationale,
            agent_name: agentName,
          });
        }

        if (result.insights?.length) {
          for (const insight of result.insights) {
            await supabase.from('insights').insert({
              analysis_run_id: analysisRunId,
              category: insight.category,
              title: insight.title,
              description: insight.description,
              priority: insight.priority,
              actionable: insight.actionable,
              supporting_evidence: {
                evidence: insight.supportingEvidence,
                affectedStakeholders: insight.affectedStakeholders,
                minimalFix: insight.minimalFix,
                maximalFix: insight.maximalFix,
              },
            });
          }
        }

        await updateAgentProgress(supabase, analysisRunId, agentName, 'completed');
        console.log(`[analyze-script] ${agentName} completed${attempt > 0 ? ` (after ${attempt} retries)` : ''}`);
        
        return { agent: agentName, success: true };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.error(`[analyze-script] ${agentName} attempt ${attempt + 1} failed:`, lastError.message);
        
        // Only retry on transient errors
        if (!isTransientError(lastError) || attempt === MAX_AGENT_RETRIES) {
          break;
        }
      }
    }
    
    // All retries exhausted or non-transient error
    const errorMessage = lastError?.message || 'Unknown error';
    await updateAgentProgress(supabase, analysisRunId, agentName, 'failed', errorMessage);
    return { agent: agentName, success: false, error: errorMessage };
  };

  // Run agents in batches to avoid rate limiting
  const results: Array<{ agent: string; success: boolean; error?: string }> = [];
  
  for (let i = 0; i < agentsToRun.length; i += BATCH_SIZE) {
    const batch = agentsToRun.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(agentsToRun.length / BATCH_SIZE);
    
    console.log(`[analyze-script] Running batch ${batchNum}/${totalBatches}: ${batch.map(([name]) => name).join(', ')}`);
    
    // Run batch in parallel
    const batchResults = await Promise.all(batch.map(runSingleAgent));
    results.push(...batchResults);
    
    // Wait between batches (except for last batch)
    if (i + BATCH_SIZE < agentsToRun.length) {
      console.log(`[analyze-script] Batch ${batchNum} complete, waiting ${BATCH_DELAY_MS}ms before next batch`);
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  return results;
}

async function runChunkedAnalysis(
  supabase: any,
  apiKey: string,
  analysisRunId: string,
  script: any,
  chunks: string[],
  agentsToRun: [string, any][],
  parameterMap: Map<string, any>
): Promise<Array<{ agent: string; success: boolean; error?: string }>> {
  console.log(`[analyze-script] Running chunked analysis with ${chunks.length} chunks`);

  // Update progress with chunk info
  await supabase
    .from('analysis_runs')
    .update({
      agent_progress: {
        ...Object.fromEntries(agentsToRun.map(([agent]) => [agent, { status: 'pending' }])),
        _meta: { mode: 'quick', chunked: true, totalChunks: chunks.length }
      }
    })
    .eq('id', analysisRunId);

  // For each agent, analyze chunks and aggregate
  const agentPromises = agentsToRun.map(async ([agentName, agentConfig]) => {
    try {
      await updateAgentProgress(supabase, analysisRunId, agentName, 'running');

      // Analyze each chunk
      const chunkResults: ChunkResult[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkContext = buildQuickContext(script, chunks[i]);
        const chunkLabel = `Chunk ${i + 1}/${chunks.length}`;
        
        console.log(`[analyze-script] ${agentName} analyzing ${chunkLabel}`);
        
        const result = await runAgent(apiKey, agentName, agentConfig, chunkContext, parameterMap);
        
        chunkResults.push({
          chunkIndex: i,
          chunkRange: chunkLabel,
          scores: result.scores,
          insights: result.insights,
        });
      }

      // Aggregate chunk results
      const aggregatedScores = aggregateChunkScores(chunkResults, parameterMap);
      const aggregatedInsights = aggregateChunkInsights(chunkResults);

      // Save aggregated scores
      for (const score of aggregatedScores) {
        if (!score.parameterId) continue;
        
        await supabase.from('parameter_scores').insert({
          analysis_run_id: analysisRunId,
          parameter_id: score.parameterId,
          score: score.score,
          confidence: score.confidence,
          evidence: {
            items: score.evidence,
            maturity: score.maturity,
            riskLevel: score.riskLevel,
            fixCost: score.fixCost,
            upsideImpact: score.upsideImpact,
            chunkedAnalysis: true,
            chunkCount: chunks.length,
          },
          rationale: score.rationale,
          agent_name: agentName,
        });
      }

      // Save aggregated insights
      for (const insight of aggregatedInsights) {
        await supabase.from('insights').insert({
          analysis_run_id: analysisRunId,
          category: insight.category,
          title: insight.title,
          description: insight.description,
          priority: insight.priority,
          actionable: insight.actionable,
          supporting_evidence: {
            evidence: insight.supportingEvidence,
            affectedStakeholders: insight.affectedStakeholders,
            minimalFix: insight.minimalFix,
            maximalFix: insight.maximalFix,
          },
        });
      }

      await updateAgentProgress(supabase, analysisRunId, agentName, 'completed');
      console.log(`[analyze-script] ${agentName} completed (${chunks.length} chunks aggregated)`);
      
      return { agent: agentName, success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[analyze-script] ${agentName} failed:`, errorMessage);
      await updateAgentProgress(supabase, analysisRunId, agentName, 'failed', errorMessage);
      return { agent: agentName, success: false, error: errorMessage };
    }
  });

  return Promise.all(agentPromises);
}

function aggregateChunkScores(
  chunkResults: ChunkResult[],
  parameterMap: Map<string, any>
): AgentResult['scores'] {
  const scoresByParam: Map<string, { scores: number[]; rationales: string[]; evidences: any[]; maturity: string[]; risk: string[]; fix: string[]; upside: string[] }> = new Map();

  for (const chunk of chunkResults) {
    for (const score of chunk.scores) {
      if (!score.parameterId) continue;
      
      if (!scoresByParam.has(score.parameterId)) {
        scoresByParam.set(score.parameterId, {
          scores: [],
          rationales: [],
          evidences: [],
          maturity: [],
          risk: [],
          fix: [],
          upside: []
        });
      }
      
      const param = scoresByParam.get(score.parameterId)!;
      param.scores.push(score.score);
      if (score.rationale) param.rationales.push(`[Chunk ${chunk.chunkIndex + 1}] ${score.rationale}`);
      param.evidences.push(...(score.evidence || []));
      param.maturity.push(score.maturity);
      param.risk.push(score.riskLevel);
      param.fix.push(score.fixCost);
      param.upside.push(score.upsideImpact);
    }
  }

  const aggregated: AgentResult['scores'] = [];
  
  for (const [paramId, data] of scoresByParam) {
    // Weighted average: beginning and end chunks slightly more important
    const weights = data.scores.map((_, i) => {
      const position = i / (data.scores.length - 1 || 1);
      // Higher weight for first and last chunks
      return 1 + 0.2 * (1 - Math.abs(position - 0.5) * 2);
    });
    
    const weightedSum = data.scores.reduce((sum, score, i) => sum + score * weights[i], 0);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const avgScore = Math.round(weightedSum / totalWeight);

    // Mode for categorical values
    const getMode = (arr: string[]) => {
      const counts: Record<string, number> = {};
      arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Medium';
    };

    aggregated.push({
      parameterId: paramId,
      parameterName: Array.from(parameterMap.values()).find(p => p.id === paramId)?.name || '',
      score: avgScore,
      confidence: 0.8, // Slightly lower confidence for aggregated
      maturity: getMode(data.maturity),
      riskLevel: getMode(data.risk),
      fixCost: getMode(data.fix),
      upsideImpact: getMode(data.upside),
      evidence: data.evidences.slice(0, 5), // Limit evidence items
      rationale: data.rationales.join(' | ').slice(0, 1000),
    });
  }

  return aggregated;
}

function aggregateChunkInsights(chunkResults: ChunkResult[]): NonNullable<AgentResult['insights']> {
  const allInsights: NonNullable<AgentResult['insights']> = [];
  
  for (const chunk of chunkResults) {
    if (chunk.insights) {
      for (const insight of chunk.insights) {
        // Add chunk context to title
        allInsights.push({
          ...insight,
          title: `${insight.title}`,
          description: `[From chunk ${chunk.chunkIndex + 1}] ${insight.description}`,
        });
      }
    }
  }

  // Deduplicate similar insights (basic title similarity)
  const uniqueInsights: typeof allInsights = [];
  const seenTitles = new Set<string>();
  
  for (const insight of allInsights) {
    const normalizedTitle = insight.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      uniqueInsights.push(insight);
    }
  }

  // Sort by priority and limit
  return uniqueInsights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 10);
}

async function runAgent(
  apiKey: string,
  agentName: string,
  config: { parameters: string[]; systemPrompt: string },
  context: string,
  parameterMap: Map<string, any>
): Promise<AgentResult> {
  const parametersToScore = config.parameters
    .map(name => parameterMap.get(name))
    .filter(Boolean);

  const userPrompt = `Analyze this script and score the following parameters using the UASF Output Contract:

PARAMETERS TO EVALUATE:
${parametersToScore.map(p => `- ${p.display_name} (${p.name}): ${p.description || 'Evaluate quality'}`).join('\n')}

SCRIPT CONTEXT:
${context}

Return a JSON object with this EXACT structure (UASF Output Contract):
{
  "scores": [
    {
      "parameter": "parameter_name",
      "score": 7,
      "maturity": "Developing",
      "riskLevel": "Medium",
      "fixCost": "Low",
      "upsideImpact": "High",
      "evidence": [
        {
          "type": "scene",
          "reference": "Scene 1",
          "quote": "Relevant quote if applicable",
          "explanation": "Why this supports the score"
        }
      ],
      "explanation": "Clear, evidence-based reasoning for this score"
    }
  ],
  "insights": [
    {
      "category": "${agentName.replace('Agent', '')}",
      "title": "Key finding title",
      "description": "Detailed explanation",
      "priority": 1,
      "actionable": true,
      "affectedStakeholders": ["Writer", "Director"],
      "minimalFix": "Quick fix suggestion",
      "maximalFix": "Comprehensive fix approach",
      "supportingEvidence": []
    }
  ]
}

SCORING GUIDE (0-10):
- 0-3: Weak (fundamental issues)
- 4-6: Developing (needs work but has foundation)
- 7-10: Strong (competent to exceptional)

MATURITY MAPPING:
- Score 0-3 → "Weak"
- Score 4-6 → "Developing"
- Score 7-10 → "Strong"

CRITICAL: You MUST respond with ONLY the JSON object. No text before or after. No markdown code blocks. Start your response with { and end with }.`;


  // Retry logic for empty responses with exponential backoff
  const MAX_RETRIES = 3;
  let content = '';
  let lastStatusCode = 0;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 2s, 4s, 8s
      const delay = 2000 * Math.pow(2, attempt - 1);
      console.log(`[${agentName}] Retry attempt ${attempt} after ${lastStatusCode === 429 ? 'rate limit' : 'empty response'}, waiting ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
    
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash', // Switch to Gemini for better rate limits
          messages: [
            { role: 'system', content: config.systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        }),
      });

      lastStatusCode = response.status;
      
      if (response.status === 429) {
        console.log(`[${agentName}] Rate limited (429), will retry`);
        if (attempt === MAX_RETRIES) {
          throw new Error(`AI API rate limited after ${MAX_RETRIES + 1} attempts`);
        }
        continue;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const aiResult = await response.json();
      content = aiResult.choices?.[0]?.message?.content || '';
      
      // Log content length and first chars for debugging
      console.log(`[${agentName}] AI response length: ${content.length}, starts with: "${content.slice(0, 50).replace(/\n/g, '\\n')}"`);
      
      // If we got content, break out of retry loop
      if (content && content.trim().length > 0) {
        break;
      }
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Empty response from AI after ${MAX_RETRIES + 1} attempts`);
      }
    } catch (fetchErr) {
      console.error(`[${agentName}] Fetch error on attempt ${attempt + 1}:`, fetchErr);
      if (attempt === MAX_RETRIES) {
        throw fetchErr;
      }
    }
  }
  // Robust JSON extraction with multiple strategies
  const parsed = extractJsonFromResponse(content, agentName);

  // STANDARDIZED 10-POINT SCORING: Store scores as 0-10 directly
  const scores = (parsed.scores || []).map((s: any) => {
    const param = parameterMap.get(s.parameter);
    // Clamp score to 0-10 range (AI outputs 0-10)
    const normalizedScore = Math.min(10, Math.max(0, s.score || 0));
    return {
      parameterId: param?.id,
      parameterName: s.parameter,
      score: normalizedScore, // Store as 0-10
      confidence: 0.85,
      maturity: s.maturity || 'Developing',
      riskLevel: s.riskLevel || 'Medium',
      fixCost: s.fixCost || 'Medium',
      upsideImpact: s.upsideImpact || 'Medium',
      evidence: s.evidence || [],
      rationale: s.explanation || '',
    };
  }).filter((s: any) => s.parameterId);

  return {
    agent: agentName,
    scores,
    insights: (parsed.insights || []).map((i: any) => ({
      ...i,
      affectedStakeholders: i.affectedStakeholders || [],
      minimalFix: i.minimalFix || '',
      maximalFix: i.maximalFix || '',
    })),
  };
}

async function updateAgentProgress(
  supabase: any,
  analysisRunId: string,
  agentName: string,
  status: string,
  error?: string
) {
  const { data: run } = await supabase
    .from('analysis_runs')
    .select('agent_progress')
    .eq('id', analysisRunId)
    .single();

  const progress = run?.agent_progress || {};
  progress[agentName] = {
    status,
    ...(status === 'running' && { startedAt: new Date().toISOString() }),
    ...(status === 'completed' && { completedAt: new Date().toISOString() }),
    ...(error && { error }),
  };

  await supabase
    .from('analysis_runs')
    .update({ agent_progress: progress })
    .eq('id', analysisRunId);
}

async function runInsightSynthesis(
  supabase: any,
  apiKey: string,
  analysisRunId: string,
  context: string
) {
  const { data: scores } = await supabase
    .from('parameter_scores')
    .select('*, parameters(*)')
    .eq('analysis_run_id', analysisRunId);

  const scoresSummary = scores?.map((s: any) => {
    const evidence = s.evidence || {};
    return `${s.parameters?.display_name}: ${s.score}/10 (${evidence.maturity || 'N/A'}) - ${s.rationale}`;
  }).join('\n') || '';

  const prompt = `You are InsightSynthesisAgent.

${GLOBAL_INSTRUCTIONS}

YOUR RESPONSIBILITY: Convert weaknesses into prescriptive insights.

Based on the script analysis scores below, synthesize 3-5 high-priority insights.

SCRIPT CONTEXT:
${context.slice(0, 2000)}

ANALYSIS SCORES:
${scoresSummary}

For each low or risky parameter:
- Identify systemic issues
- Explain why they matter
- Identify affected stakeholders (Writer, Actor, Director, Studio, Investor, Audience)
- Propose minimal fix (quick improvement) and maximal fix (comprehensive solution)

Insights must be actionable and evidence-based.

Return JSON array:
[
  {
    "category": "Synthesis",
    "title": "Insight title",
    "description": "Detailed actionable insight",
    "priority": 1,
    "actionable": true,
    "affectedStakeholders": ["Writer", "Director"],
    "minimalFix": "Quick fix",
    "maximalFix": "Comprehensive fix",
    "supportingEvidence": []
  }
]`;

  try {
    // Use Gemini Pro for synthesis - better reasoning for executive insights
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Upgraded for synthesis tasks
        messages: [
          { role: 'system', content: 'You are InsightSynthesisAgent, a senior script analyst synthesizing findings into executive-level actionable insights.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) return;

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      for (const insight of insights) {
        await supabase.from('insights').insert({
          analysis_run_id: analysisRunId,
          category: insight.category || 'Synthesis',
          title: insight.title,
          description: insight.description,
          priority: insight.priority || 1,
          actionable: insight.actionable !== false,
          supporting_evidence: {
            evidence: insight.supportingEvidence || [],
            affectedStakeholders: insight.affectedStakeholders || [],
            minimalFix: insight.minimalFix || '',
            maximalFix: insight.maximalFix || '',
          },
        });
      }
    }
    
    // Update agent progress
    await updateAgentProgress(supabase, analysisRunId, 'InsightSynthesisAgent', 'completed');
  } catch (error) {
    console.error('[analyze-script] InsightSynthesis error:', error);
    await updateAgentProgress(supabase, analysisRunId, 'InsightSynthesisAgent', 'failed', String(error));
  }
}

async function runStakeholderLensAgent(
  supabase: any,
  apiKey: string,
  analysisRunId: string
) {
  console.log('[analyze-script] Running StakeholderLensAgent...');

  const { data: scores } = await supabase
    .from('parameter_scores')
    .select('*, parameters(*)')
    .eq('analysis_run_id', analysisRunId);

  if (!scores?.length) return;

  const { data: lensWeights } = await supabase
    .from('lens_weights')
    .select('*');

  const stakeholders = ['studio_executive', 'producer', 'actor', 'director', 'writer', 'financier', 'ott_platform', 'theatrical'];
  
  const lensScores: Record<string, number> = {};
  
  for (const lens of stakeholders) {
    const weightsForLens = lensWeights?.filter((lw: any) => lw.lens === lens) || [];
    
    if (weightsForLens.length === 0) {
      lensScores[lens] = Math.round(
        scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length
      );
    } else {
      let weightedSum = 0;
      let totalWeight = 0;
      
      for (const lw of weightsForLens) {
        const paramScore = scores.find((s: any) => s.parameter_id === lw.parameter_id);
        if (paramScore) {
          weightedSum += paramScore.score * lw.weight;
          totalWeight += lw.weight;
        }
      }
      
      lensScores[lens] = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }
  }

  console.log('[analyze-script] StakeholderLensAgent computed lens scores:', lensScores);
  
  const { data: currentRun } = await supabase
    .from('analysis_runs')
    .select('agent_progress')
    .eq('id', analysisRunId)
    .single();

  const updatedProgress = {
    ...(currentRun?.agent_progress || {}),
    StakeholderLensAgent: {
      status: 'completed',
      completedAt: new Date().toISOString(),
      lensScores,
    }
  };

  await supabase
    .from('analysis_runs')
    .update({ agent_progress: updatedProgress })
    .eq('id', analysisRunId);
}

async function generateReport(
  supabase: any,
  analysisRunId: string,
  scriptId: string,
  script: any,
  mode: string = 'deep'
) {
  const [scoresResult, insightsResult, scenesResult, charsResult, lensWeightsResult] = await Promise.all([
    supabase.from('parameter_scores').select('*, parameters(*)').eq('analysis_run_id', analysisRunId),
    supabase.from('insights').select('*').eq('analysis_run_id', analysisRunId),
    supabase.from('scenes').select('*').eq('script_id', scriptId),
    supabase.from('characters').select('*').eq('script_id', scriptId),
    supabase.from('lens_weights').select('*'),
  ]);

  const scores = scoresResult.data || [];
  const insights = insightsResult.data || [];
  const lensWeights = lensWeightsResult.data || [];

  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length)
    : 0;

  const categoryScores: Record<string, { total: number; count: number; risks: string[] }> = {};
  for (const score of scores) {
    const category = score.parameters?.category || 'Other';
    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, count: 0, risks: [] };
    }
    categoryScores[category].total += score.score;
    categoryScores[category].count += 1;
    
    const evidence = score.evidence || {};
    if (evidence.riskLevel === 'High') {
      categoryScores[category].risks.push(score.parameters?.display_name || score.parameters?.name);
    }
  }

  const lensScores: Record<string, number> = {};
  const lenses = ['studio_executive', 'producer', 'actor', 'director', 'writer', 'financier', 'ott_platform', 'theatrical'];
  
  for (const lens of lenses) {
    const lensWeightsForLens = lensWeights.filter((lw: any) => lw.lens === lens);
    if (lensWeightsForLens.length === 0) {
      lensScores[lens] = overallScore;
      continue;
    }

    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const lw of lensWeightsForLens) {
      const paramScore = scores.find((s: any) => s.parameter_id === lw.parameter_id);
      if (paramScore) {
        weightedSum += paramScore.score * lw.weight;
        totalWeight += lw.weight;
      }
    }

    lensScores[lens] = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : overallScore;
  }

  const reportData = {
    uasfVersion: '3.0',
    analysisMode: mode,
    scriptMetadata: {
      title: script.title,
      logline: script.logline,
      genre: script.genre,
      scriptType: script.script_type,
      pageCount: script.page_count,
    },
    overallScore,
    lensScores,
    categoryScores: Object.fromEntries(
      Object.entries(categoryScores).map(([cat, data]) => [cat, {
        score: Math.round(data.total / data.count),
        highRiskParameters: data.risks,
      }])
    ),
    parameterScores: scores.map((s: any) => {
      const evidence = s.evidence || {};
      return {
        parameterId: s.parameter_id,
        parameterName: s.parameters?.name,
        displayName: s.parameters?.display_name,
        category: s.parameters?.category,
        score: s.score,
        confidence: s.confidence,
        maturity: evidence.maturity || 'Developing',
        riskLevel: evidence.riskLevel || 'Medium',
        fixCost: evidence.fixCost || 'Medium',
        upsideImpact: evidence.upsideImpact || 'Medium',
        evidence: evidence.items || [],
        rationale: s.rationale,
        chunkedAnalysis: evidence.chunkedAnalysis || false,
      };
    }),
    insights: insights.map((i: any) => {
      const supportingEvidence = i.supporting_evidence || {};
      return {
        category: i.category,
        title: i.title,
        description: i.description,
        priority: i.priority,
        actionable: i.actionable,
        affectedStakeholders: supportingEvidence.affectedStakeholders || [],
        minimalFix: supportingEvidence.minimalFix || '',
        maximalFix: supportingEvidence.maximalFix || '',
        supportingEvidence: supportingEvidence.evidence || [],
      };
    }),
    characters: (charsResult.data || []).map((c: any) => ({
      name: c.name,
      dialogueCount: c.dialogue_count,
      sceneCount: c.scene_count,
      firstAppearance: c.first_appearance,
      description: c.description,
      arcSummary: c.arc_summary,
      relationships: c.relationships || [],
    })),
    scenes: (scenesResult.data || []).map((s: any) => ({
      sceneNumber: s.scene_number,
      heading: s.heading,
      location: s.location,
      timeOfDay: s.time_of_day,
      intExt: s.int_ext,
      pageStart: s.page_start,
      pageEnd: s.page_end,
      description: s.description,
      emotionalTone: s.emotional_tone,
    })),
  };

  const topInsights = insights.sort((a: any, b: any) => a.priority - b.priority).slice(0, 3);
  const highRiskCount = scores.filter((s: any) => s.evidence?.riskLevel === 'High').length;
  
  const modeLabel = mode === 'quick' ? '⚡ Quick' : '🔬 Deep';
  const executiveSummary = `${modeLabel} Analysis: "${script.title}" scores ${overallScore}/100 overall. ${
    highRiskCount > 0 ? `${highRiskCount} high-risk parameters identified. ` : ''
  }${
    topInsights.length > 0 
      ? `Key findings: ${topInsights.map((i: any) => i.title).join('; ')}.`
      : ''
  }`;

  const { data: scriptData } = await supabase
    .from('scripts')
    .select('organization_id')
    .eq('id', scriptId)
    .single();

  await supabase.from('reports').insert({
    analysis_run_id: analysisRunId,
    script_id: scriptId,
    organization_id: scriptData?.organization_id,
    title: `UASF ${mode === 'quick' ? 'Quick' : 'Deep'} Analysis: ${script.title}`,
    overall_score: overallScore,
    lens_scores: lensScores,
    executive_summary: executiveSummary,
    full_report_data: reportData,
  });

  console.log(`[analyze-script] UASF ${mode} Report generated with overall score: ${overallScore}`);
}
