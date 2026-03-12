import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Categories the AI should extract (cast excluded — handled by parser pre-tagging)
const AI_CATEGORIES = [
  'extras', 'props', 'wardrobe', 'makeup', 'vehicles',
  'animals', 'vfx', 'sfx', 'stunts', 'music', 'sound',
  'set_dressing', 'greenery', 'special_equipment', 'notes',
];

const VALID_CATEGORIES = [
  'cast', 'extras', 'props', 'wardrobe', 'makeup', 'vehicles',
  'animals', 'vfx', 'sfx', 'stunts', 'music', 'sound',
  'set_dressing', 'greenery', 'special_equipment', 'notes',
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function processExtraction(
  jobId: string,
  scriptId: string,
  userId: string,
  supabaseUrl: string,
  serviceRoleKey: string,
  lovableApiKey: string,
) {
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch scenes, lines, existing tags, and characters in parallel
    const [scenesRes, linesRes, existingTagsRes, charactersRes] = await Promise.all([
      adminClient.from('scenes').select('*').eq('script_id', scriptId).order('scene_number'),
      adminClient.from('script_lines').select('*').eq('script_id', scriptId).order('scene_number').order('line_number'),
      adminClient.from('breakdown_tags').select('scene_id, category, element_name').eq('script_id', scriptId),
      adminClient.from('characters').select('name').eq('script_id', scriptId),
    ]);

    if (scenesRes.error) throw new Error(`Failed to fetch scenes: ${scenesRes.error.message}`);
    if (linesRes.error) throw new Error(`Failed to fetch script lines: ${linesRes.error.message}`);

    const scenes = scenesRes.data || [];
    const lines = linesRes.data || [];
    const existingTags = existingTagsRes.data || [];
    const characters = charactersRes.data || [];

    if (scenes.length === 0) {
      await adminClient.from('extraction_jobs').update({
        status: 'failed', error: 'No scenes found for this script', updated_at: new Date().toISOString(),
      }).eq('id', jobId);
      return;
    }

    // Update job with total scenes
    await adminClient.from('extraction_jobs').update({
      total_scenes: scenes.length, updated_at: new Date().toISOString(),
    }).eq('id', jobId);

    // Build dedup set
    const existingSet = new Set(
      existingTags.map(t => `${t.scene_id}::${t.category}::${t.element_name.toLowerCase().trim()}`)
    );

    // Group lines by scene
    const linesByScene: Record<number, typeof lines> = {};
    for (const line of lines) {
      if (!linesByScene[line.scene_number]) linesByScene[line.scene_number] = [];
      linesByScene[line.scene_number].push(line);
    }

    // ── STEP 1: Pre-tag from parsed data ──
    const parserInserts: any[] = [];

    // Build a set of known character names (normalized)
    const characterNameSet = new Set(characters.map(c => c.name.toLowerCase().trim()));

    for (const scene of scenes) {
      const sceneLines = linesByScene[scene.scene_number] || [];

      // Cast: find unique character_names in this scene's script_lines that match known characters
      const seenCharacters = new Set<string>();
      for (const line of sceneLines) {
        if (line.character_name) {
          const normalized = line.character_name.toLowerCase().trim();
          if (characterNameSet.has(normalized) && !seenCharacters.has(normalized)) {
            seenCharacters.add(normalized);

            // Use the original casing from the characters table
            const originalName = characters.find(c => c.name.toLowerCase().trim() === normalized)?.name || line.character_name;

            const dedupeKey = `${scene.id}::cast::${originalName.toLowerCase().trim()}`;
            if (!existingSet.has(dedupeKey)) {
              existingSet.add(dedupeKey);
              parserInserts.push({
                scene_id: scene.id,
                script_id: scriptId,
                category: 'cast',
                element_name: originalName,
                confidence: 1.0,
                source: 'parser',
                created_by: userId,
              });
            }
          }
        }
      }

      // Location → set_dressing tag
      if (scene.location && scene.location.trim()) {
        const locationName = scene.location.trim();
        const dedupeKey = `${scene.id}::set_dressing::${locationName.toLowerCase()}`;
        if (!existingSet.has(dedupeKey)) {
          existingSet.add(dedupeKey);
          parserInserts.push({
            scene_id: scene.id,
            script_id: scriptId,
            category: 'set_dressing',
            element_name: locationName,
            confidence: 1.0,
            source: 'parser',
            created_by: userId,
          });
        }
      }
    }

    // Bulk insert parser tags
    if (parserInserts.length > 0) {
      const { error: parserInsertError } = await adminClient
        .from('breakdown_tags')
        .insert(parserInserts);

      if (parserInsertError) {
        console.error('Parser tag insert error:', parserInsertError);
        // Non-fatal — continue with AI extraction
      } else {
        console.log(`Pre-tagged ${parserInserts.length} elements from parsed data (cast + locations)`);
      }
    }

    // ── STEP 2: AI extraction for remaining categories ──

    // Fetch model configuration
    let aiModel = 'google/gemini-3-flash-preview';
    let aiTemperature = 0.3;

    try {
      const { data: defaultConfig } = await adminClient
        .from('model_configurations')
        .select('id')
        .or('is_default.eq.true,and(is_system.eq.true,name.eq.quality)')
        .order('is_default', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (defaultConfig) {
        const { data: mapping } = await adminClient
          .from('agent_model_mappings')
          .select('model, temperature')
          .eq('config_id', defaultConfig.id)
          .eq('agent_name', 'BreakdownExtractorAgent')
          .maybeSingle();

        if (mapping) {
          aiModel = mapping.model;
          aiTemperature = mapping.temperature ?? 0.3;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch model config, using default:', e);
    }

    const BATCH_SIZE = 10;
    const aiInserts: any[] = [];
    let scenesProcessed = 0;

    for (let i = 0; i < scenes.length; i += BATCH_SIZE) {
      const batch = scenes.slice(i, i + BATCH_SIZE);

      const sceneDescriptions = batch.map(scene => {
        const sceneLines = linesByScene[scene.scene_number] || [];
        const lineText = sceneLines
          .map(l => {
            if (l.line_type === 'dialogue' && l.character_name) return `${l.character_name}: ${l.content}`;
            if (l.line_type === 'action') return `[ACTION] ${l.content}`;
            if (l.line_type === 'scene_heading') return `[HEADING] ${l.content}`;
            return l.content;
          })
          .join('\n');

        return `--- SCENE ${scene.scene_number} ---\nHeading: ${scene.heading}\nLocation: ${scene.location || 'Unknown'}\nTime: ${scene.time_of_day || 'Unknown'}\nInt/Ext: ${scene.int_ext || 'Unknown'}\nDescription: ${scene.description || 'None'}\n\nScript Content:\n${lineText || '(no lines parsed)'}`;
      }).join('\n\n');

      const systemPrompt = `You are a professional script breakdown artist working on a film/TV production. Your job is to identify production elements from scene descriptions and dialogue.

IMPORTANT: Cast members and location/set_dressing have already been extracted automatically. Do NOT include them. Focus ONLY on these categories:
- extras: Background actors, crowds, groups
- props: Hand props, set props, any physical objects handled or referenced
- wardrobe: Specific costume pieces, uniforms, distinctive clothing mentioned
- makeup: Special makeup, prosthetics, blood, aging effects
- vehicles: Cars, trucks, boats, aircraft
- animals: Any animals mentioned
- vfx: Visual effects needed (CGI, compositing, green screen)
- sfx: Practical special effects (explosions, fire, rain, fog)
- stunts: Fight choreography, falls, car chases, physical stunts
- music: Source music, live performances, instruments
- sound: Specific sound design needs (gunshots, ambient sounds mentioned in action)
- greenery: Plants, trees, landscaping
- special_equipment: Camera rigs, cranes, specialty gear implied by the scene
- notes: Important production notes or considerations

Be thorough but precise. Only extract elements explicitly mentioned or clearly implied. Assign a confidence score (0.0 to 1.0) based on how clearly the element is referenced.`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: aiModel,
            temperature: aiTemperature,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Extract all production elements from these scenes:\n\n${sceneDescriptions}` },
            ],
            tools: [{
              type: 'function',
              function: {
                name: 'extract_breakdown_elements',
                description: 'Extract production breakdown elements from script scenes',
                parameters: {
                  type: 'object',
                  properties: {
                    elements: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          scene_number: { type: 'number', description: 'The scene number' },
                          category: { type: 'string', enum: AI_CATEGORIES },
                          element_name: { type: 'string', description: 'Name of the production element' },
                          confidence: { type: 'number', description: 'Confidence score 0.0-1.0' },
                        },
                        required: ['scene_number', 'category', 'element_name', 'confidence'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['elements'],
                  additionalProperties: false,
                },
              },
            }],
            tool_choice: { type: 'function', function: { name: 'extract_breakdown_elements' } },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`AI gateway error (batch ${i / BATCH_SIZE}):`, response.status, errText);
          if (response.status === 429 || response.status === 402) {
            const errorMsg = response.status === 429
              ? 'Rate limit exceeded. Please try again in a moment.'
              : 'AI credits exhausted. Please add credits to continue.';
            await adminClient.from('extraction_jobs').update({
              status: 'failed', error: errorMsg, extracted_count: parserInserts.length + aiInserts.length, updated_at: new Date().toISOString(),
            }).eq('id', jobId);
            return;
          }
          continue;
        }

        const aiResult = await response.json();
        const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall?.function?.arguments) {
          console.error(`No tool call in batch ${i / BATCH_SIZE}`);
          continue;
        }

        let parsed: { elements: Array<{ scene_number: number; category: string; element_name: string; confidence: number }> };
        try {
          parsed = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          console.error(`Failed to parse tool call arguments in batch ${i / BATCH_SIZE}:`, e);
          continue;
        }

        const sceneMap = new Map(batch.map(s => [s.scene_number, s.id]));

        for (const el of parsed.elements) {
          const sceneId = sceneMap.get(el.scene_number);
          if (!sceneId) continue;
          if (!VALID_CATEGORIES.includes(el.category)) continue;
          if (!el.element_name?.trim()) continue;

          const dedupeKey = `${sceneId}::${el.category}::${el.element_name.toLowerCase().trim()}`;
          if (existingSet.has(dedupeKey)) continue;
          existingSet.add(dedupeKey);

          aiInserts.push({
            scene_id: sceneId,
            script_id: scriptId,
            category: el.category,
            element_name: el.element_name.trim(),
            confidence: Math.max(0, Math.min(1, Number(el.confidence) || 0.5)),
            source: 'ai',
            created_by: userId,
          });
        }
      } catch (batchError) {
        console.error(`Batch ${i / BATCH_SIZE} error:`, batchError);
        continue;
      }

      scenesProcessed += batch.length;

      // Update progress
      const progress = Math.round((scenesProcessed / scenes.length) * 100);
      await adminClient.from('extraction_jobs').update({
        progress, extracted_count: parserInserts.length + aiInserts.length, updated_at: new Date().toISOString(),
      }).eq('id', jobId);

      // Small delay between batches
      if (i + BATCH_SIZE < scenes.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    // Bulk insert AI tags
    if (aiInserts.length > 0) {
      const { error: insertError } = await adminClient
        .from('breakdown_tags')
        .insert(aiInserts);

      if (insertError) {
        console.error('Insert error:', insertError);
        await adminClient.from('extraction_jobs').update({
          status: 'failed', error: `Failed to save: ${insertError.message}`, updated_at: new Date().toISOString(),
        }).eq('id', jobId);
        return;
      }
    }

    const totalExtracted = parserInserts.length + aiInserts.length;

    // Mark complete
    await adminClient.from('extraction_jobs').update({
      status: 'completed',
      progress: 100,
      extracted_count: totalExtracted,
      updated_at: new Date().toISOString(),
    }).eq('id', jobId);

    console.log(`Extraction complete: ${totalExtracted} elements (${parserInserts.length} parser + ${aiInserts.length} AI) from ${scenes.length} scenes`);

  } catch (error) {
    console.error('processExtraction error:', error);
    await adminClient.from('extraction_jobs').update({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      updated_at: new Date().toISOString(),
    }).eq('id', jobId);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { script_id } = await req.json();
    if (!script_id || !UUID_REGEX.test(script_id)) {
      return new Response(JSON.stringify({ error: 'Invalid script_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('extraction_jobs')
      .insert({
        script_id,
        status: 'processing',
        created_by: user.id,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Failed to create extraction job:', jobError);
      return new Response(JSON.stringify({ error: 'Failed to create extraction job' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Start background processing
    (globalThis as any).EdgeRuntime.waitUntil(
      processExtraction(job.id, script_id, user.id, supabaseUrl, serviceRoleKey, lovableApiKey)
    );

    // Return immediately with job ID
    return new Response(JSON.stringify({
      job_id: job.id,
      status: 'processing',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('extract-breakdown error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
