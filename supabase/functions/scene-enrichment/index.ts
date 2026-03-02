import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= TIMEOUT UTILITIES =============
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`TIMEOUT: ${label} exceeded ${Math.round(ms / 1000)}s limit`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

const AGENT_CALL_TIMEOUT_MS = 5 * 60 * 1000;

// System preset config IDs
const SYSTEM_PRESET_CONFIG_IDS: Record<string, string> = {
  fast: '00000000-0000-0000-0000-000000000001',
  balanced: '00000000-0000-0000-0000-000000000002',
  quality: '00000000-0000-0000-0000-000000000003',
};

const isUUID = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

interface ModelConfig {
  model: string;
  maxRetries: number;
  retryDelayMs: number;
  temperature?: number;
}

async function getAgentModelConfig(
  supabaseClient: any,
  agentName: string,
  qualityMode: string
): Promise<ModelConfig> {
  const configId = isUUID(qualityMode)
    ? qualityMode
    : SYSTEM_PRESET_CONFIG_IDS[qualityMode] || SYSTEM_PRESET_CONFIG_IDS['balanced'];

  try {
    const { data: mapping, error } = await supabaseClient
      .from('agent_model_mappings')
      .select('model, max_retries, retry_delay_ms, temperature')
      .eq('config_id', configId)
      .eq('agent_name', agentName)
      .maybeSingle();

    if (!error && mapping) {
      console.log(`[SceneEnrichment] Model from DB: ${mapping.model}`);
      return {
        model: mapping.model,
        maxRetries: mapping.max_retries || 3,
        retryDelayMs: mapping.retry_delay_ms || 2000,
        temperature: mapping.temperature,
      };
    }
  } catch (err) {
    console.log(`[SceneEnrichment] DB lookup failed, using fallback:`, err);
  }

  return { model: 'google/gemini-2.5-flash-lite', maxRetries: 3, retryDelayMs: 1500 };
}

function sanitizeJsonString(str: string): string {
  let cleaned = str.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  cleaned = cleaned.replace(/[\x00-\x1f\x7f]/g, (ch) => {
    if (ch === '\n' || ch === '\r' || ch === '\t') return ch;
    return '';
  });
  return cleaned.trim();
}

async function updateAgentProgress(
  supabase: any,
  analysisRunId: string,
  agentName: string,
  status: string,
  errorMessage?: string
) {
  const { data: currentRun } = await supabase
    .from('analysis_runs')
    .select('agent_progress')
    .eq('id', analysisRunId)
    .single();

  const progress = currentRun?.agent_progress || {};
  const existing = progress[agentName] || {};

  progress[agentName] = {
    ...existing,
    status,
    ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
    ...(errorMessage ? { error: errorMessage } : {}),
  };

  await supabase
    .from('analysis_runs')
    .update({ agent_progress: progress })
    .eq('id', analysisRunId);
}

async function updateReportWithSceneAnalysis(
  supabase: any,
  analysisRunId: string,
  sceneAnalysisData: any[]
) {
  const { data: report, error } = await supabase
    .from('reports')
    .select('id, full_report_data')
    .eq('analysis_run_id', analysisRunId)
    .maybeSingle();

  if (error || !report) {
    console.log('[SceneEnrichment] No report found to update');
    return;
  }

  const updatedData = { ...report.full_report_data, sceneAnalysis: sceneAnalysisData };

  await supabase
    .from('reports')
    .update({ full_report_data: updatedData })
    .eq('id', report.id);

  console.log(`[SceneEnrichment] Updated report ${report.id} with ${sceneAnalysisData.length} scene analyses`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const scriptId = typeof body?.scriptId === 'string' && uuidRegex.test(body.scriptId) ? body.scriptId : null;
    const analysisRunId = typeof body?.analysisRunId === 'string' && uuidRegex.test(body.analysisRunId) ? body.analysisRunId : null;
    const qualityMode = typeof body?.qualityMode === 'string' && body.qualityMode.length <= 50 ? body.qualityMode : 'balanced';
    const scriptContext = typeof body?.scriptContext === 'string' ? body.scriptContext.substring(0, 200000) : undefined;

    if (!scriptId || !analysisRunId) {
      return new Response(
        JSON.stringify({ error: 'scriptId and analysisRunId must be valid UUIDs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already completed
    const { data: runData } = await supabase
      .from('analysis_runs')
      .select('agent_progress')
      .eq('id', analysisRunId)
      .single();

    const progress = runData?.agent_progress || {};
    if (progress['SceneEnrichmentAgent']?.status === 'completed') {
      console.log('[SceneEnrichment] Already completed, skipping');
      return new Response(
        JSON.stringify({ success: true, status: 'already_completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return immediately, do work in background
    const backgroundWork = async () => {
      try {
        console.log(`[SceneEnrichment] Starting for script ${scriptId}, run ${analysisRunId}`);
        await updateAgentProgress(supabase, analysisRunId, 'SceneEnrichmentAgent', 'running');

        // Fetch scenes
        const { data: scenes, error: scenesError } = await supabase
          .from('scenes')
          .select('*')
          .eq('script_id', scriptId)
          .order('scene_number');

        if (scenesError || !scenes || scenes.length === 0) {
          console.log('[SceneEnrichment] No scenes to enrich');
          await updateAgentProgress(supabase, analysisRunId, 'SceneEnrichmentAgent', 'completed');
          return;
        }

        // If no scriptContext provided, fetch from storage
        let context = scriptContext || '';
        if (!context) {
          const { data: script } = await supabase
            .from('scripts')
            .select('file_url, title, logline, genre, script_type')
            .eq('id', scriptId)
            .single();

          if (script) {
            // Use basic metadata as context fallback
            context = `Title: ${script.title}\nLogline: ${script.logline || 'N/A'}\nGenre: ${script.genre || 'N/A'}\nType: ${script.script_type || 'feature'}`;
          }
        }

        const modelConfig = await getAgentModelConfig(supabase, 'SceneEnrichmentAgent', qualityMode);
        const MAX_RETRIES = modelConfig.maxRetries || 3;

        // Batch scenes
        const BATCH_SIZE = 40;
        const batches: any[][] = [];
        for (let i = 0; i < scenes.length; i += BATCH_SIZE) {
          batches.push(scenes.slice(i, i + BATCH_SIZE));
        }

        console.log(`[SceneEnrichment] Processing ${scenes.length} scenes in ${batches.length} batch(es)`);

        const allSceneAnalysis: any[] = [];

        // Run batches in parallel (up to 3 concurrent)
        const CONCURRENCY = 3;
        for (let startIdx = 0; startIdx < batches.length; startIdx += CONCURRENCY) {
          const concurrentBatches = batches.slice(startIdx, startIdx + CONCURRENCY);

          const batchPromises = concurrentBatches.map(async (batch, offsetIdx) => {
            const batchIdx = startIdx + offsetIdx;
            const sceneList = batch.map((s: any) =>
              `Scene ${s.scene_number}: ${s.heading}${s.description ? ' - ' + s.description.substring(0, 200) : ''}${s.location ? ' [' + s.location + ']' : ''}${s.int_ext ? ' (' + s.int_ext + ')' : ''}`
            ).join('\n');

            const prompt = `You are SceneEnrichmentAgent. Analyze each scene from this script and produce per-scene metrics.

SCRIPT CONTEXT:
${context.substring(0, 60000)}

SCENES TO ANALYZE (batch ${batchIdx + 1}/${batches.length}):
${sceneList}

For each scene, evaluate:
- emotional_tone: One of "tense", "calm", "dramatic", "comedic", "romantic", "suspenseful", "melancholic", "hopeful", "exciting", "neutral"
- dialogue_density: 0-100 (how dialogue-heavy the scene is. 0=no dialogue, 100=entirely dialogue)
- action_intensity: 0-100 (how much physical action/movement. 0=static, 100=intense action)
- technical_requirements: 0-100 (production complexity. 0=simple single-setup shot, 100=extremely complex)
- vfx_potential: 0-100 (visual effects needed. 0=no VFX, 100=entirely VFX-dependent)
- location_complexity: 0-100 (how complex the location is. 0=simple interior, 100=extreme environment)
- narrative_function: One of "setup", "escalation", "climax", "resolution", "transition"
- key_moment: true if this is a pivotal/turning point scene
- brief_summary: 1-2 sentence summary of what happens

Return ONLY a valid JSON array with one object per scene:
[{"scene_number": 1, "emotional_tone": "tense", "dialogue_density": 70, "action_intensity": 30, "technical_requirements": 25, "vfx_potential": 5, "location_complexity": 15, "narrative_function": "setup", "key_moment": false, "brief_summary": "The protagonist arrives."}]`;

            let batchResult: any[] | null = null;

            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
              try {
                if (attempt > 0) {
                  const delay = modelConfig.retryDelayMs * Math.pow(2, attempt - 1);
                  await new Promise(r => setTimeout(r, delay));
                }

                console.log(`[SceneEnrichment] Batch ${batchIdx + 1}/${batches.length}, attempt ${attempt + 1}, model: ${modelConfig.model}`);

                const response = await withTimeout(
                  fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${lovableApiKey}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      model: modelConfig.model || 'google/gemini-2.5-flash',
                      messages: [
                        { role: 'system', content: 'You are SceneEnrichmentAgent. Return ONLY valid JSON arrays.' },
                        { role: 'user', content: prompt }
                      ],
                    }),
                  }),
                  AGENT_CALL_TIMEOUT_MS,
                  `SceneEnrichment batch ${batchIdx + 1}`
                );

                if (response.status === 429) {
                  if (attempt === MAX_RETRIES) throw new Error('Rate limited after all retries');
                  continue;
                }
                if (!response.ok) throw new Error(`API error: ${response.status}`);

                const result = await response.json();
                const content = result.choices?.[0]?.message?.content || '';
                if (!content.trim()) throw new Error('Empty response');

                const sanitized = sanitizeJsonString(content);
                const jsonMatch = sanitized.match(/\[[\s\S]*\]/);
                if (!jsonMatch) throw new Error('No JSON array found');

                batchResult = JSON.parse(jsonMatch[0]);
                break;
              } catch (err) {
                console.error(`[SceneEnrichment] Batch ${batchIdx + 1} attempt ${attempt + 1} failed:`, err instanceof Error ? err.message : err);
                if (attempt === MAX_RETRIES) break;
              }
            }

            return batchResult;
          });

          const results = await Promise.all(batchPromises);
          for (const result of results) {
            if (result && Array.isArray(result)) {
              allSceneAnalysis.push(...result);
            }
          }
        }

        if (allSceneAnalysis.length === 0) {
          console.error('[SceneEnrichment] All batches failed');
          await updateAgentProgress(supabase, analysisRunId, 'SceneEnrichmentAgent', 'failed', 'All batches failed');
          return;
        }

        // Update scenes in database
        for (const sa of allSceneAnalysis) {
          if (sa.scene_number && sa.emotional_tone) {
            const matchingScene = scenes.find((s: any) => s.scene_number === sa.scene_number);
            if (matchingScene) {
              await supabase
                .from('scenes')
                .update({
                  emotional_tone: sa.emotional_tone,
                  description: matchingScene.description || sa.brief_summary || null,
                })
                .eq('id', matchingScene.id);
            }
          }
        }

        const sceneAnalysisData = allSceneAnalysis.map((sa: any) => ({
          sceneNumber: sa.scene_number,
          emotionalTone: sa.emotional_tone || 'neutral',
          dialogueDensity: typeof sa.dialogue_density === 'number' ? Math.max(0, Math.min(100, sa.dialogue_density)) : 50,
          actionIntensity: typeof sa.action_intensity === 'number' ? Math.max(0, Math.min(100, sa.action_intensity)) : 50,
          technicalRequirements: typeof sa.technical_requirements === 'number' ? Math.max(0, Math.min(100, sa.technical_requirements)) : 20,
          vfxPotential: typeof sa.vfx_potential === 'number' ? Math.max(0, Math.min(100, sa.vfx_potential)) : 10,
          locationComplexity: typeof sa.location_complexity === 'number' ? Math.max(0, Math.min(100, sa.location_complexity)) : 30,
          narrativeFunction: sa.narrative_function || 'transition',
          keyMoment: sa.key_moment || false,
          briefSummary: sa.brief_summary || undefined,
        }));

        // Update the existing report with scene analysis data
        await updateReportWithSceneAnalysis(supabase, analysisRunId, sceneAnalysisData);

        console.log(`[SceneEnrichment] Enriched ${allSceneAnalysis.length}/${scenes.length} scenes`);
        await updateAgentProgress(supabase, analysisRunId, 'SceneEnrichmentAgent', 'completed');

      } catch (err) {
        console.error('[SceneEnrichment] Error:', err);
        await updateAgentProgress(supabase, analysisRunId, 'SceneEnrichmentAgent', 'failed',
          err instanceof Error ? err.message : 'Unknown error');
      }
    };

    EdgeRuntime.waitUntil(backgroundWork());

    return new Response(
      JSON.stringify({ success: true, status: 'started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[SceneEnrichment] Request error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
