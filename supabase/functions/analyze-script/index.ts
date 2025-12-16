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

interface AgentResult {
  agent: string;
  scores: Array<{
    parameterId: string;
    score: number;
    confidence: number;
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
    supportingEvidence: Array<{
      type: string;
      reference: string;
      quote?: string;
      explanation: string;
    }>;
  }>;
}

// Agent definitions with their parameters and prompts
const AGENTS = {
  StructureAgent: {
    parameters: ['structural_integrity', 'inciting_incident', 'midpoint_turn', 'climax_resolution'],
    systemPrompt: `You are a screenplay structure analyst. Analyze the script's three-act structure, plot points, and narrative architecture.
    
Focus on:
- Structural Integrity: How well the script follows classic screenplay structure (setup, confrontation, resolution)
- Inciting Incident: Clarity and timing of the event that sets the story in motion
- Midpoint Turn: Effectiveness of the midpoint reversal or revelation
- Climax & Resolution: Strength of the climactic sequence and satisfaction of resolution

Provide scores 0-100, with evidence from specific scenes.`
  },
  CharacterAgent: {
    parameters: ['protagonist_arc', 'character_motivation', 'character_distinctiveness', 'supporting_characters'],
    systemPrompt: `You are a character development specialist. Analyze the depth, growth, and distinctiveness of characters.

Focus on:
- Protagonist Arc: Completeness and believability of the main character's transformation
- Character Motivation: Clarity and strength of character goals and desires
- Character Distinctiveness: How unique and memorable each character's voice and personality is
- Supporting Characters: Depth and purpose of secondary characters

Provide scores 0-100, with evidence from dialogue and actions.`
  },
  ConflictAgent: {
    parameters: ['central_conflict', 'escalation', 'obstacles'],
    systemPrompt: `You are a dramatic conflict analyst. Evaluate the story's conflicts and tensions.

Focus on:
- Central Conflict: Clarity and stakes of the main dramatic question
- Escalation: How well conflicts build and intensify throughout the story
- Obstacles: Variety and challenge level of barriers facing protagonists

Provide scores 0-100, with evidence from key confrontations.`
  },
  ThemeAgent: {
    parameters: ['thematic_coherence', 'thematic_depth'],
    systemPrompt: `You are a thematic analyst. Evaluate the script's underlying themes and messages.

Focus on:
- Thematic Coherence: How consistently themes are woven throughout the story
- Thematic Depth: Sophistication and resonance of the themes explored

Provide scores 0-100, with evidence from symbolic elements and character journeys.`
  },
  DialogueAgent: {
    parameters: ['dialogue_authenticity', 'dialogue_efficiency', 'subtext'],
    systemPrompt: `You are a dialogue specialist. Analyze the quality and effectiveness of spoken lines.

Focus on:
- Dialogue Authenticity: How natural and character-specific the dialogue sounds
- Dialogue Efficiency: Whether dialogue advances plot or reveals character (not just exposition)
- Subtext: Depth of meaning beneath the surface of conversations

Provide scores 0-100, with specific dialogue examples.`
  },
  EmotionalArcAgent: {
    parameters: ['emotional_engagement', 'emotional_variety'],
    systemPrompt: `You are an emotional journey analyst. Evaluate the script's ability to evoke feelings.

Focus on:
- Emotional Engagement: How deeply the script connects with audience emotions
- Emotional Variety: Range of emotional beats and tones throughout

Provide scores 0-100, with evidence from emotionally charged scenes.`
  },
  WorldLogicAgent: {
    parameters: ['world_building', 'world_consistency'],
    systemPrompt: `You are a world and logic analyst. Evaluate the story's setting and internal consistency.

Focus on:
- World Building: Richness and immersion of the story's world
- World Consistency: Internal logic and rule adherence

Provide scores 0-100, with evidence of world details and any logical issues.`
  },
  MarketAgent: {
    parameters: ['commercial_viability', 'genre_fit', 'originality'],
    systemPrompt: `You are a market analyst. Evaluate commercial and creative positioning.

Focus on:
- Commercial Viability: Box office/streaming potential based on concept and execution
- Genre Fit: How well the script delivers on genre expectations
- Originality: Fresh perspective or unique elements that differentiate it

Provide scores 0-100, with market comparisons and positioning insights.`
  },
  ExecutionAgent: {
    parameters: ['budget_feasibility', 'casting_appeal', 'technical_demands'],
    systemPrompt: `You are a production feasibility analyst. Evaluate practical production considerations.

Focus on:
- Budget Feasibility: Realistic assessment of production costs based on locations, VFX, period settings
- Casting Appeal: Roles attractive to A-list talent
- Technical Demands: Complexity of visual effects, stunts, and technical requirements

Provide scores 0-100, with specific production considerations.`
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptId, analysisRunId } = await req.json() as AnalyzeRequest;
    
    console.log(`[analyze-script] Starting analysis for script ${scriptId}, run ${analysisRunId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update analysis run status
    await supabase
      .from('analysis_runs')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString(),
        agent_progress: Object.fromEntries(
          Object.keys(AGENTS).map(agent => [agent, { status: 'pending' }])
        )
      })
      .eq('id', analysisRunId);

    // Fetch script data
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', scriptId)
      .single();

    if (scriptError || !script) {
      throw new Error(`Script not found: ${scriptError?.message}`);
    }

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

    // Run all agents in parallel
    const agentPromises = Object.entries(AGENTS).map(async ([agentName, agentConfig]) => {
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

        // Save scores
        for (const score of result.scores) {
          await supabase.from('parameter_scores').insert({
            analysis_run_id: analysisRunId,
            parameter_id: score.parameterId,
            score: score.score,
            confidence: score.confidence,
            evidence: score.evidence,
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
              supporting_evidence: insight.supportingEvidence,
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

    console.log(`[analyze-script] Analysis complete: ${finalStatus}`);

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

  const charList = characters.slice(0, 10).map(c => 
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

  const userPrompt = `Analyze this screenplay and score the following parameters:

${parametersToScore.map(p => `- ${p.display_name} (${p.name}): ${p.description || 'Score quality'}`).join('\n')}

SCRIPT CONTEXT:
${context}

Return a JSON object with this exact structure:
{
  "scores": [
    {
      "parameter": "parameter_name",
      "score": 75,
      "confidence": 0.85,
      "evidence": [
        {
          "type": "scene",
          "reference": "Scene 1",
          "quote": "Relevant quote if applicable",
          "explanation": "Why this supports the score"
        }
      ],
      "rationale": "Brief explanation of the score"
    }
  ],
  "insights": [
    {
      "category": "${agentName.replace('Agent', '')}",
      "title": "Key finding title",
      "description": "Detailed explanation",
      "priority": 1,
      "actionable": true,
      "supportingEvidence": []
    }
  ]
}

Score from 0-100 where: 0-40=Weak, 41-60=Needs Work, 61-75=Competent, 76-90=Strong, 91-100=Exceptional.
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
      max_tokens: 4000,
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

  // Map scores to parameter IDs
  const scores = (parsed.scores || []).map((s: any) => {
    const param = parameterMap.get(s.parameter);
    return {
      parameterId: param?.id,
      score: Math.min(100, Math.max(0, s.score)),
      confidence: Math.min(1, Math.max(0, s.confidence || 0.8)),
      evidence: s.evidence || [],
      rationale: s.rationale || '',
    };
  }).filter((s: any) => s.parameterId);

  return {
    agent: agentName,
    scores,
    insights: parsed.insights || [],
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

  const scoresSummary = scores?.map((s: any) => 
    `${s.parameters?.display_name}: ${s.score}/100 - ${s.rationale}`
  ).join('\n') || '';

  const prompt = `Based on the screenplay analysis scores below, synthesize 3-5 high-priority insights that would be most valuable for decision-makers.

SCRIPT CONTEXT:
${context.slice(0, 2000)}

ANALYSIS SCORES:
${scoresSummary}

Generate strategic insights that:
1. Identify the script's key strengths (opportunities)
2. Highlight critical weaknesses (risks)
3. Provide actionable recommendations

Return JSON array:
[
  {
    "category": "Synthesis",
    "title": "Insight title",
    "description": "Detailed actionable insight",
    "priority": 1,
    "actionable": true,
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
          { role: 'system', content: 'You are a senior script analyst synthesizing findings into executive-level insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
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
          supporting_evidence: insight.supportingEvidence || [],
        });
      }
    }
  } catch (error) {
    console.error('[analyze-script] InsightSynthesis error:', error);
  }
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

  // Calculate category scores
  const categoryScores: Record<string, { total: number; count: number }> = {};
  for (const score of scores) {
    const category = score.parameters?.category || 'Other';
    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, count: 0 };
    }
    categoryScores[category].total += score.score;
    categoryScores[category].count += 1;
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

  // Build report data
  const reportData = {
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
      Object.entries(categoryScores).map(([cat, data]) => [cat, Math.round(data.total / data.count)])
    ),
    parameterScores: scores.map((s: any) => ({
      parameterId: s.parameter_id,
      parameterName: s.parameters?.name,
      displayName: s.parameters?.display_name,
      category: s.parameters?.category,
      score: s.score,
      confidence: s.confidence,
      evidence: s.evidence,
      rationale: s.rationale,
    })),
    insights: insights.map((i: any) => ({
      category: i.category,
      title: i.title,
      description: i.description,
      priority: i.priority,
      actionable: i.actionable,
      supportingEvidence: i.supporting_evidence,
    })),
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

  // Generate executive summary
  const topInsights = insights.sort((a: any, b: any) => a.priority - b.priority).slice(0, 3);
  const executiveSummary = `"${script.title}" scores ${overallScore}/100 overall. ${
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
    title: `Analysis: ${script.title}`,
    overall_score: overallScore,
    lens_scores: lensScores,
    executive_summary: executiveSummary,
    full_report_data: reportData,
  });

  console.log(`[analyze-script] Report generated with overall score: ${overallScore}`);
}
