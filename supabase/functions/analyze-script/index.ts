import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  scriptId: string;
  analysisRunId: string;
}

// UASF Output Contract
interface ParameterOutput {
  score: number; // 0-10
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
const AGENTS = {
  // STRUCTURE AGENT - Module B
  StructureAgent: {
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

  // CONCEPT AGENT - Module A (NEW)
  ConceptAgent: {
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

  // COMIC-SPECIFIC AGENTS
  ComicVisualAgent: {
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
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptId, analysisRunId } = await req.json() as AnalyzeRequest;
    
    console.log(`[analyze-script] Starting UASF analysis for script ${scriptId}, run ${analysisRunId}`);

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

    // Determine which agents to run based on script type
    const isComic = script?.script_type === 'comic';
    const comicAgents = ['ComicVisualAgent', 'ComicDialogueAgent', 'ComicPacingAgent', 'ComicArtDirectionAgent'];
    
    // Core agents for all script types (UASF Modules A-J)
    const coreAgents = [
      'ConceptAgent', 'StructureAgent', 'CharacterAgent', 'ConflictAgent',
      'ThemeAgent', 'DialogueAgent', 'WorldLogicAgent', 'EmotionalArcAgent',
      'MarketAgent', 'ExecutionAgent'
    ];
    
    // Filter agents based on script type
    const agentsToRun = Object.entries(AGENTS).filter(([agentName]) => {
      if (isComic) {
        // For comics: run comic agents + core agents
        return coreAgents.includes(agentName) || comicAgents.includes(agentName);
      } else {
        // For non-comics: exclude comic-specific agents
        return !comicAgents.includes(agentName);
      }
    });

    console.log(`[analyze-script] Script type: ${script.script_type}, running ${agentsToRun.length} agents`);

    // Update analysis run status
    await supabase
      .from('analysis_runs')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString(),
        agent_progress: Object.fromEntries(
          agentsToRun.map(([agent]) => [agent, { status: 'pending' }])
        )
      })
      .eq('id', analysisRunId);

    // Fetch scenes and characters
    const [scenesResult, charsResult] = await Promise.all([
      supabase.from('scenes').select('*').eq('script_id', scriptId).order('scene_number'),
      supabase.from('characters').select('*').eq('script_id', scriptId).order('dialogue_count', { ascending: false }),
    ]);

    const scenes = scenesResult.data || [];
    const characters = charsResult.data || [];

    // Fetch parameters
    const { data: parameters } = await supabase.from('parameters').select('*');
    const parameterMap = new Map(parameters?.map(p => [p.name, p]) || []);

    // Build context for AI
    const scriptContext = buildScriptContext(script, scenes, characters);

    console.log(`[analyze-script] Context built: ${scenes.length} scenes, ${characters.length} characters`);

    // Run selected agents in parallel
    const agentPromises = agentsToRun.map(async ([agentName, agentConfig]) => {
      try {
        // Update agent progress
        await updateAgentProgress(supabase, analysisRunId, agentName, 'running');

        const result = await runAgent(
          lovableApiKey,
          agentName,
          agentConfig,
          scriptContext,
          parameterMap
        );

        // Save scores with UASF output contract
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

        // Save insights if any
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
        console.log(`[analyze-script] ${agentName} completed`);
        
        return { agent: agentName, success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[analyze-script] ${agentName} failed:`, errorMessage);
        await updateAgentProgress(supabase, analysisRunId, agentName, 'failed', errorMessage);
        return { agent: agentName, success: false, error: errorMessage };
      }
    });

    const agentResults = await Promise.all(agentPromises);
    
    // Run InsightSynthesisAgent after all others complete
    await runInsightSynthesis(supabase, lovableApiKey, analysisRunId, scriptContext);

    // Run StakeholderLensAgent to apply weighted scoring
    await runStakeholderLensAgent(supabase, lovableApiKey, analysisRunId);

    // Calculate overall scores and create report
    await generateReport(supabase, analysisRunId, scriptId, script);

    // Update analysis run status
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

    console.log(`[analyze-script] UASF Analysis complete: ${finalStatus}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: finalStatus,
        results: agentResults 
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

function buildScriptContext(script: any, scenes: any[], characters: any[]): string {
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

Only return valid JSON, no markdown.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 6000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const aiResult = await response.json();
  const content = aiResult.choices?.[0]?.message?.content || '';

  // Parse JSON response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response as JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Map scores to parameter IDs and convert to 0-100 scale for storage
  const scores = (parsed.scores || []).map((s: any) => {
    const param = parameterMap.get(s.parameter);
    return {
      parameterId: param?.id,
      parameterName: s.parameter,
      score: Math.min(100, Math.max(0, (s.score || 0) * 10)), // Convert 0-10 to 0-100
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
  // Fetch all scores
  const { data: scores } = await supabase
    .from('parameter_scores')
    .select('*, parameters(*)')
    .eq('analysis_run_id', analysisRunId);

  const scoresSummary = scores?.map((s: any) => {
    const evidence = s.evidence || {};
    return `${s.parameters?.display_name}: ${s.score}/100 (${evidence.maturity || 'N/A'}) - ${s.rationale}`;
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
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are InsightSynthesisAgent, a senior script analyst synthesizing findings into executive-level actionable insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
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
  } catch (error) {
    console.error('[analyze-script] InsightSynthesis error:', error);
  }
}

async function runStakeholderLensAgent(
  supabase: any,
  apiKey: string,
  analysisRunId: string
) {
  console.log('[analyze-script] Running StakeholderLensAgent...');

  // Fetch all parameter scores
  const { data: scores } = await supabase
    .from('parameter_scores')
    .select('*, parameters(*)')
    .eq('analysis_run_id', analysisRunId);

  if (!scores?.length) return;

  // Fetch lens weights
  const { data: lensWeights } = await supabase
    .from('lens_weights')
    .select('*');

  const stakeholders = ['studio_executive', 'producer', 'actor', 'director', 'writer', 'financier', 'ott_platform', 'theatrical'];
  
  // Calculate lens-specific scores based on weights
  const lensScores: Record<string, number> = {};
  
  for (const lens of stakeholders) {
    const weightsForLens = lensWeights?.filter((lw: any) => lw.lens === lens) || [];
    
    if (weightsForLens.length === 0) {
      // No specific weights, use average
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
  
  // Fetch current agent_progress, merge with new data, then update
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
  script: any
) {
  // Fetch all data for report
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

  // Calculate overall score (average of all parameter scores)
  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length)
    : 0;

  // Calculate category scores with UASF metadata
  const categoryScores: Record<string, { total: number; count: number; risks: string[] }> = {};
  for (const score of scores) {
    const category = score.parameters?.category || 'Other';
    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, count: 0, risks: [] };
    }
    categoryScores[category].total += score.score;
    categoryScores[category].count += 1;
    
    // Track high-risk parameters
    const evidence = score.evidence || {};
    if (evidence.riskLevel === 'High') {
      categoryScores[category].risks.push(score.parameters?.display_name || score.parameters?.name);
    }
  }

  // Calculate lens scores
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

  // Build UASF-compliant report data
  const reportData = {
    uasfVersion: '3.0',
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

  // Generate executive summary with UASF insights
  const topInsights = insights.sort((a: any, b: any) => a.priority - b.priority).slice(0, 3);
  const highRiskCount = scores.filter((s: any) => s.evidence?.riskLevel === 'High').length;
  
  const executiveSummary = `"${script.title}" scores ${overallScore}/100 overall. ${
    highRiskCount > 0 ? `${highRiskCount} high-risk parameters identified. ` : ''
  }${
    topInsights.length > 0 
      ? `Key findings: ${topInsights.map((i: any) => i.title).join('; ')}.`
      : ''
  }`;

  // Insert report
  const { data: scriptData } = await supabase
    .from('scripts')
    .select('organization_id')
    .eq('id', scriptId)
    .single();

  await supabase.from('reports').insert({
    analysis_run_id: analysisRunId,
    script_id: scriptId,
    organization_id: scriptData?.organization_id,
    title: `UASF Analysis: ${script.title}`,
    overall_score: overallScore,
    lens_scores: lensScores,
    executive_summary: executiveSummary,
    full_report_data: reportData,
  });

  console.log(`[analyze-script] UASF Report generated with overall score: ${overallScore}`);
}
