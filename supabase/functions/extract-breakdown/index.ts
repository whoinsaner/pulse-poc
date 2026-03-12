import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const VALID_CATEGORIES = [
  'cast', 'extras', 'props', 'wardrobe', 'makeup', 'vehicles',
  'animals', 'vfx', 'sfx', 'stunts', 'music', 'sound',
  'set_dressing', 'greenery', 'special_equipment', 'notes',
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
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
    const userId = user.id;

    // Parse and validate input
    const { script_id } = await req.json();
    if (!script_id || !UUID_REGEX.test(script_id)) {
      return new Response(JSON.stringify({ error: 'Invalid script_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch scenes and script_lines
    const [scenesRes, linesRes, existingTagsRes] = await Promise.all([
      supabase.from('scenes').select('*').eq('script_id', script_id).order('scene_number'),
      supabase.from('script_lines').select('*').eq('script_id', script_id).order('scene_number').order('line_number'),
      supabase.from('breakdown_tags').select('scene_id, category, element_name').eq('script_id', script_id),
    ]);

    if (scenesRes.error) throw new Error(`Failed to fetch scenes: ${scenesRes.error.message}`);
    if (linesRes.error) throw new Error(`Failed to fetch script lines: ${linesRes.error.message}`);

    const scenes = scenesRes.data || [];
    const lines = linesRes.data || [];
    const existingTags = existingTagsRes.data || [];

    if (scenes.length === 0) {
      return new Response(JSON.stringify({ error: 'No scenes found for this script', extracted: 0 }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Build existing tags lookup for deduplication
    const existingSet = new Set(
      existingTags.map(t => `${t.scene_id}::${t.category}::${t.element_name.toLowerCase().trim()}`)
    );

    // Group lines by scene_number
    const linesByScene: Record<number, typeof lines> = {};
    for (const line of lines) {
      if (!linesByScene[line.scene_number]) linesByScene[line.scene_number] = [];
      linesByScene[line.scene_number].push(line);
    }

    // Batch scenes (10 per batch)
    const BATCH_SIZE = 10;
    const allInserts: any[] = [];

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

      const systemPrompt = `You are a professional script breakdown artist working on a film/TV production. Your job is to identify all production elements from scene descriptions and dialogue.

For each scene, identify elements in these categories:
- cast: Named speaking characters appearing in the scene
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
- set_dressing: Furniture, decorations, environmental details
- greenery: Plants, trees, landscaping
- special_equipment: Camera rigs, cranes, specialty gear implied by the scene
- notes: Important production notes or considerations

Be thorough but precise. Only extract elements explicitly mentioned or clearly implied. Assign a confidence score (0.0 to 1.0) based on how clearly the element is referenced.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
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
                        category: { type: 'string', enum: VALID_CATEGORIES },
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
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.', extracted: allInserts.length }), {
            status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.', extracted: allInserts.length }), {
            status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const errText = await response.text();
        console.error(`AI gateway error (batch ${i / BATCH_SIZE}):`, response.status, errText);
        continue; // Skip batch on error, continue with others
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

      // Map scene_number to scene_id and deduplicate
      const sceneMap = new Map(batch.map(s => [s.scene_number, s.id]));

      for (const el of parsed.elements) {
        const sceneId = sceneMap.get(el.scene_number);
        if (!sceneId) continue;
        if (!VALID_CATEGORIES.includes(el.category)) continue;
        if (!el.element_name?.trim()) continue;

        const dedupeKey = `${sceneId}::${el.category}::${el.element_name.toLowerCase().trim()}`;
        if (existingSet.has(dedupeKey)) continue;
        existingSet.add(dedupeKey); // Prevent intra-batch duplicates

        const confidence = Math.max(0, Math.min(1, Number(el.confidence) || 0.5));

        allInserts.push({
          scene_id: sceneId,
          script_id: script_id,
          category: el.category,
          element_name: el.element_name.trim(),
          confidence,
          source: 'ai',
          created_by: userId,
        });
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < scenes.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Bulk insert
    if (allInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('breakdown_tags')
        .insert(allInserts);

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(JSON.stringify({ error: `Failed to save extracted elements: ${insertError.message}`, extracted: 0 }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      extracted: allInserts.length,
      scenes_processed: scenes.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('extract-breakdown error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
