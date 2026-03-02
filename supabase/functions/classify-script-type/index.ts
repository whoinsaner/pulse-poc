import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VALID_SCRIPT_TYPES = [
  'feature', 'pilot', 'episode', 'short', 'documentary', 'comic',
  'web_series', 'micro_drama', 'stage_play', 'audio_drama', 'podcast_fiction', 'game_narrative'
];

function patternClassify(text: string): { scriptType: string; confidence: number } | null {
  const comicIndicators: string[] = [];
  const screenplayIndicators: string[] = [];
  const webSeriesIndicators: string[] = [];
  const stagePlayIndicators: string[] = [];
  const audioDramaIndicators: string[] = [];
  const gameNarrativeIndicators: string[] = [];

  // Comic patterns
  if (/\bPAGE\s*\d+/i.test(text)) comicIndicators.push('PAGE markers');
  if (/\bPANEL\s*\d+/i.test(text)) comicIndicators.push('PANEL markers');
  if (/\bSFX[:\s]/i.test(text)) comicIndicators.push('SFX notation');
  if (/\bCAPTION[:\s]/i.test(text)) comicIndicators.push('CAPTION blocks');
  if (/\bSPLASH\s*PAGE/i.test(text)) comicIndicators.push('SPLASH PAGE');
  if (/\bBALLOON[:\s]/i.test(text)) comicIndicators.push('BALLOON');

  // Screenplay patterns
  if (/\b(INT\.|EXT\.)\s+[A-Z]/i.test(text)) screenplayIndicators.push('INT./EXT. sluglines');
  if (/\bFADE\s*(IN|OUT)/i.test(text)) screenplayIndicators.push('FADE transitions');
  if (/\bCUT\s*TO:/i.test(text)) screenplayIndicators.push('CUT TO transitions');
  if (/\bCONTINUOUS\b/i.test(text)) screenplayIndicators.push('CONTINUOUS');
  if (/^\s*[A-Z]{2,}[A-Z\s]*\n\s*\(/m.test(text)) screenplayIndicators.push('Character cues');

  // Web series patterns
  if (/\bEPISODE\s*\d+/i.test(text)) webSeriesIndicators.push('EPISODE markers');
  if (/\bWEBISODE/i.test(text)) webSeriesIndicators.push('WEBISODE');
  if (/\bSEASON\s*\d+/i.test(text)) webSeriesIndicators.push('SEASON markers');
  if (/\bEND\s*OF\s*EPISODE/i.test(text)) webSeriesIndicators.push('END OF EPISODE');

  // Stage play patterns
  if (/\bACT\s+(ONE|TWO|THREE|I{1,3}|[1-3])\b/i.test(text)) stagePlayIndicators.push('ACT markers');
  if (/\bSCENE\s+\d+/i.test(text) && !screenplayIndicators.length) stagePlayIndicators.push('SCENE markers');
  if (/\bSTAGE\s*DIRECTION/i.test(text)) stagePlayIndicators.push('STAGE DIRECTION');
  if (/\bENTERS?\b.*\bSTAGE\b/i.test(text)) stagePlayIndicators.push('ENTERS STAGE');

  // Audio drama patterns
  if (/\bSOUND\s*EFFECT/i.test(text)) audioDramaIndicators.push('SOUND EFFECT');
  if (/\bNARRATOR[:\s]/i.test(text)) audioDramaIndicators.push('NARRATOR');
  if (/\bMUSIC\s*(CUE|STING|BED)/i.test(text)) audioDramaIndicators.push('MUSIC CUE');

  // Game narrative patterns
  if (/\bDIALOGUE\s*TREE/i.test(text)) gameNarrativeIndicators.push('DIALOGUE TREE');
  if (/\bBRANCH[:\s]/i.test(text)) gameNarrativeIndicators.push('BRANCH');
  if (/\bCUTSCENE/i.test(text)) gameNarrativeIndicators.push('CUTSCENE');
  if (/\bQUEST\b/i.test(text)) gameNarrativeIndicators.push('QUEST');

  const scores: { type: string; score: number }[] = [
    { type: 'comic', score: comicIndicators.length },
    { type: 'feature', score: screenplayIndicators.length },
    { type: 'web_series', score: webSeriesIndicators.length + (screenplayIndicators.length > 0 ? 0.5 : 0) },
    { type: 'stage_play', score: stagePlayIndicators.length },
    { type: 'audio_drama', score: audioDramaIndicators.length },
    { type: 'game_narrative', score: gameNarrativeIndicators.length },
  ];

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const second = scores[1];

  if (best.score === 0) return null;

  // High confidence if clear winner
  if (best.score >= 3 && best.score > second.score * 2) {
    return { scriptType: best.type, confidence: Math.min(0.92, 0.6 + best.score * 0.08) };
  }

  if (best.score >= 2 && best.score > second.score) {
    return { scriptType: best.type, confidence: Math.min(0.8, 0.5 + best.score * 0.1) };
  }

  return null; // Ambiguous — let AI decide
}

async function aiClassify(apiKey: string, textSample: string, fileName: string): Promise<{ scriptType: string; confidence: number }> {
  const prompt = `You are a script format classifier. Analyze this text sample and determine the script type.

Possible types: feature (feature film), pilot (TV pilot), episode (TV episode), short (short film), documentary, comic (comic book script), web_series, micro_drama (short-form vertical drama), stage_play, audio_drama, podcast_fiction, game_narrative.

Consider these indicators:
- Comics: PAGE/PANEL markers, SFX, CAPTION, BALLOON, SPLASH PAGE
- Screenplays (feature/pilot/episode/short): INT./EXT. sluglines, FADE IN/OUT, CUT TO, character cues in ALL CAPS
- Web series: EPISODE markers, shorter format, web-native structure
- Micro drama: Very short (1-3 pages), mobile-first, vertical video indicators
- Stage play: ACT/SCENE markers, stage directions, enters/exits
- Audio drama: Sound effects, narrator cues, music cues
- Documentary: Interview segments, B-ROLL, archival footage references
- Game narrative: Dialogue trees, branches, cutscenes, quests

File name for context: "${fileName}"

Text sample:
"""
${textSample.substring(0, 4000)}
"""

Respond with ONLY a JSON object: {"scriptType": "type_here", "confidence": 0.0_to_1.0}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*?\}/);
  if (!jsonMatch) throw new Error('No JSON in AI response');
  
  const parsed = JSON.parse(jsonMatch[0]);
  const scriptType = parsed.scriptType || parsed.script_type || 'feature';
  const confidence = Math.min(1, Math.max(0, parsed.confidence || 0.5));

  if (!VALID_SCRIPT_TYPES.includes(scriptType)) {
    return { scriptType: 'feature', confidence: 0.3 };
  }

  return { scriptType, confidence };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    if (!body?.textSample || typeof body.textSample !== 'string') {
      return new Response(
        JSON.stringify({ error: 'textSample is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sample = body.textSample.substring(0, 5000);
    const fileName = typeof body?.fileName === 'string' ? body.fileName.substring(0, 255) : '';

    // Try pattern-based classification first (instant, no AI cost)
    const patternResult = patternClassify(sample);
    if (patternResult && patternResult.confidence >= 0.7) {
      console.log(`[classify-script-type] Pattern match: ${patternResult.scriptType} (${patternResult.confidence})`);
      return new Response(
        JSON.stringify(patternResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fall back to AI classification
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      // No API key — return pattern result if any, or default
      const fallback = patternResult || { scriptType: 'feature', confidence: 0.2 };
      return new Response(
        JSON.stringify(fallback),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await aiClassify(apiKey, sample, fileName);
    console.log(`[classify-script-type] AI result: ${aiResult.scriptType} (${aiResult.confidence})`);

    // If pattern result exists, merge confidence
    if (patternResult && patternResult.scriptType === aiResult.scriptType) {
      aiResult.confidence = Math.min(0.98, aiResult.confidence + 0.1);
    }

    return new Response(
      JSON.stringify(aiResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[classify-script-type] Error:', error);
    return new Response(
      JSON.stringify({ scriptType: 'feature', confidence: 0.1 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
