import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseRequest {
  scriptId: string;
  format: 'pdf' | 'fdx' | 'fountain' | 'highland' | 'txt';
  filePath: string;
}

interface Scene {
  scene_number: number;
  heading: string;
  int_ext: string | null;
  location: string | null;
  time_of_day: string | null;
  description: string | null;
  page_start: number | null;
  page_end: number | null;
}

interface Character {
  name: string;
  dialogue_count: number;
  scene_count: number;
  first_appearance: number | null;
  description: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptId, format, filePath } = await req.json() as ParseRequest;
    
    console.log(`[script-parser] Starting parse for script ${scriptId}, format: ${format}`);

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('scripts')
      .download(filePath);

    if (downloadError) {
      console.error('[script-parser] Download error:', downloadError);
      throw new Error(`Failed to download script: ${downloadError.message}`);
    }

    console.log(`[script-parser] Downloaded file, size: ${fileData.size} bytes`);

    // Parse based on format
    let parsedContent: { scenes: Scene[]; characters: Character[]; rawText: string };
    
    switch (format) {
      case 'fountain':
      case 'highland':
      case 'txt':
        const textContent = await fileData.text();
        parsedContent = parseTextFormat(textContent, format);
        break;
      case 'fdx':
        const fdxContent = await fileData.text();
        parsedContent = parseFinalDraft(fdxContent);
        break;
      case 'pdf':
        // For PDF, we'll use AI to extract structure
        const pdfBytes = await fileData.arrayBuffer();
        parsedContent = await parsePDFWithAI(supabase, pdfBytes, scriptId);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    console.log(`[script-parser] Parsed ${parsedContent.scenes.length} scenes, ${parsedContent.characters.length} characters`);

    // Insert scenes
    if (parsedContent.scenes.length > 0) {
      const scenesWithScriptId = parsedContent.scenes.map(scene => ({
        ...scene,
        script_id: scriptId,
      }));

      const { error: scenesError } = await supabase
        .from('scenes')
        .insert(scenesWithScriptId);

      if (scenesError) {
        console.error('[script-parser] Scenes insert error:', scenesError);
      }
    }

    // Insert characters
    if (parsedContent.characters.length > 0) {
      const charactersWithScriptId = parsedContent.characters.map(char => ({
        ...char,
        script_id: scriptId,
      }));

      const { error: charsError } = await supabase
        .from('characters')
        .insert(charactersWithScriptId);

      if (charsError) {
        console.error('[script-parser] Characters insert error:', charsError);
      }
    }

    // Create initial narrative graph
    const narrativeGraph = buildNarrativeGraph(parsedContent.scenes, parsedContent.characters);
    
    const { error: graphError } = await supabase
      .from('narrative_graphs')
      .insert({
        script_id: scriptId,
        graph_type: 'scene_flow',
        nodes: narrativeGraph.nodes,
        edges: narrativeGraph.edges,
        metadata: { parsed_at: new Date().toISOString() },
      });

    if (graphError) {
      console.error('[script-parser] Graph insert error:', graphError);
    }

    // Update script with page count estimate
    const estimatedPages = Math.ceil(parsedContent.rawText.length / 3000); // ~3000 chars per page
    await supabase
      .from('scripts')
      .update({ page_count: estimatedPages })
      .eq('id', scriptId);

    console.log(`[script-parser] Parse complete for script ${scriptId}`);

    return new Response(
      JSON.stringify({
        success: true,
        scenesCount: parsedContent.scenes.length,
        charactersCount: parsedContent.characters.length,
        estimatedPages,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[script-parser] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Parse Fountain/Highland/TXT format
function parseTextFormat(content: string, format: string): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  const lines = content.split('\n');
  
  let currentSceneNumber = 0;
  let currentScene: Scene | null = null;
  let inDialogue = false;
  let currentCharacter: string | null = null;
  
  // Fountain scene heading pattern
  const sceneHeadingPattern = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.+?)(?:\s*-\s*(.+))?$/i;
  // Character name pattern (ALL CAPS at start of line, followed by dialogue)
  const characterPattern = /^([A-Z][A-Z\s\.']+)(\s*\(.*\))?$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for scene heading
    const sceneMatch = line.match(sceneHeadingPattern);
    if (sceneMatch) {
      currentSceneNumber++;
      const intExt = sceneMatch[1].replace('.', '').toUpperCase();
      const locationAndTime = sceneMatch[2] || '';
      const timeOfDay = sceneMatch[3] || null;
      
      currentScene = {
        scene_number: currentSceneNumber,
        heading: line,
        int_ext: intExt.includes('INT') && intExt.includes('EXT') ? 'INT/EXT' : intExt.includes('INT') ? 'INT' : 'EXT',
        location: locationAndTime.trim(),
        time_of_day: timeOfDay?.trim() || null,
        description: null,
        page_start: Math.ceil(i / 55), // Estimate page from line number
        page_end: null,
      };
      scenes.push(currentScene);
      inDialogue = false;
      continue;
    }
    
    // Check for character name (dialogue cue)
    if (line.length > 0 && line.length < 50) {
      const charMatch = line.match(characterPattern);
      if (charMatch && !line.includes(':') && lines[i + 1]?.trim()) {
        const charName = charMatch[1].trim();
        // Skip common non-character words
        if (!['FADE', 'CUT', 'DISSOLVE', 'CONTINUED', 'THE', 'END'].some(w => charName.startsWith(w))) {
          currentCharacter = charName;
          inDialogue = true;
          
          if (!characterMap.has(charName)) {
            characterMap.set(charName, {
              name: charName,
              dialogue_count: 0,
              scene_count: 0,
              first_appearance: currentSceneNumber,
              description: null,
            });
          }
          
          const char = characterMap.get(charName)!;
          char.dialogue_count++;
          if (char.first_appearance === currentSceneNumber) {
            char.scene_count++;
          }
        }
      }
    }
  }
  
  // Update scene_count for characters
  characterMap.forEach(char => {
    // Simple heuristic: count unique scenes
    char.scene_count = Math.max(1, Math.ceil(char.dialogue_count / 5));
  });
  
  return {
    scenes,
    characters: Array.from(characterMap.values()),
    rawText: content,
  };
}

// Parse Final Draft XML format
function parseFinalDraft(content: string): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  
  let sceneNumber = 0;
  let rawText = '';
  
  // Simple XML parsing for FDX format
  const sceneHeadingRegex = /<Paragraph Type="Scene Heading"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/Paragraph>/gi;
  const characterRegex = /<Paragraph Type="Character"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/Paragraph>/gi;
  const textRegex = /<Text[^>]*>([^<]*)<\/Text>/gi;
  
  // Extract all text
  let textMatch;
  while ((textMatch = textRegex.exec(content)) !== null) {
    rawText += textMatch[1] + '\n';
  }
  
  // Extract scene headings
  let sceneMatch;
  while ((sceneMatch = sceneHeadingRegex.exec(content)) !== null) {
    sceneNumber++;
    const headingText = sceneMatch[1].replace(/<[^>]+>/g, '').trim();
    
    const intExtMatch = headingText.match(/^(INT\.|EXT\.|INT\/EXT\.)/i);
    const intExt = intExtMatch ? intExtMatch[1].replace('.', '').toUpperCase() : null;
    
    scenes.push({
      scene_number: sceneNumber,
      heading: headingText,
      int_ext: intExt,
      location: headingText.replace(/^(INT\.|EXT\.|INT\/EXT\.)\s*/i, '').split('-')[0]?.trim() || null,
      time_of_day: headingText.split('-')[1]?.trim() || null,
      description: null,
      page_start: null,
      page_end: null,
    });
  }
  
  // Extract characters
  let charMatch;
  while ((charMatch = characterRegex.exec(content)) !== null) {
    const charName = charMatch[1].replace(/<[^>]+>/g, '').trim().toUpperCase();
    
    if (!characterMap.has(charName)) {
      characterMap.set(charName, {
        name: charName,
        dialogue_count: 0,
        scene_count: 1,
        first_appearance: scenes.length || 1,
        description: null,
      });
    }
    characterMap.get(charName)!.dialogue_count++;
  }
  
  return {
    scenes,
    characters: Array.from(characterMap.values()),
    rawText,
  };
}

// Parse PDF using AI assistance (Lovable AI Gateway)
async function parsePDFWithAI(
  supabase: any,
  pdfBytes: ArrayBuffer,
  scriptId: string
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string }> {
  // For PDF, we'll use a simpler extraction approach
  // In production, you'd use a PDF parsing library or OCR service
  
  // Convert PDF bytes to base64 for potential AI processing
  const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
  
  // Use Lovable AI to extract structure from PDF
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.log('[script-parser] No Lovable API key, using placeholder parsing for PDF');
    // Return placeholder data for now
    return {
      scenes: [{
        scene_number: 1,
        heading: 'PDF CONTENT - PARSING PENDING',
        int_ext: null,
        location: 'Unknown',
        time_of_day: null,
        description: 'PDF parsing requires AI assistance. Please re-upload in Fountain or FDX format for better results.',
        page_start: 1,
        page_end: null,
      }],
      characters: [],
      rawText: 'PDF content - full text extraction pending',
    };
  }

  try {
    // Call Lovable AI for PDF analysis
    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a screenplay parser. Extract scenes and characters from the provided screenplay content. 
            Return JSON in this exact format:
            {
              "scenes": [{"scene_number": 1, "heading": "INT. LOCATION - DAY", "int_ext": "INT", "location": "LOCATION", "time_of_day": "DAY"}],
              "characters": [{"name": "CHARACTER NAME", "dialogue_count": 5}]
            }
            Only return valid JSON, no markdown or explanations.`
          },
          {
            role: 'user',
            content: `Parse this screenplay PDF (base64 encoded, first 50KB): ${base64.substring(0, 50000)}`
          }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    
    // Try to parse the AI response as JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        scenes: (parsed.scenes || []).map((s: any, i: number) => ({
          scene_number: s.scene_number || i + 1,
          heading: s.heading || 'UNKNOWN',
          int_ext: s.int_ext || null,
          location: s.location || null,
          time_of_day: s.time_of_day || null,
          description: s.description || null,
          page_start: s.page_start || null,
          page_end: s.page_end || null,
        })),
        characters: (parsed.characters || []).map((c: any) => ({
          name: c.name || 'UNKNOWN',
          dialogue_count: c.dialogue_count || 1,
          scene_count: c.scene_count || 1,
          first_appearance: c.first_appearance || 1,
          description: c.description || null,
        })),
        rawText: content,
      };
    }
  } catch (aiError) {
    console.error('[script-parser] AI parsing error:', aiError);
  }

  // Fallback
  return {
    scenes: [{
      scene_number: 1,
      heading: 'PDF CONTENT',
      int_ext: null,
      location: null,
      time_of_day: null,
      description: 'PDF parsing completed with limited extraction',
      page_start: 1,
      page_end: null,
    }],
    characters: [],
    rawText: '',
  };
}

// Build narrative graph from scenes and characters
function buildNarrativeGraph(scenes: Scene[], characters: Character[]) {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  // Add scene nodes
  scenes.forEach((scene, index) => {
    nodes.push({
      id: `scene-${scene.scene_number}`,
      type: 'scene',
      label: scene.heading,
      data: {
        scene_number: scene.scene_number,
        location: scene.location,
        int_ext: scene.int_ext,
        time_of_day: scene.time_of_day,
      },
    });
    
    // Connect consecutive scenes
    if (index > 0) {
      edges.push({
        id: `edge-${index - 1}-${index}`,
        source: `scene-${scenes[index - 1].scene_number}`,
        target: `scene-${scene.scene_number}`,
        type: 'sequence',
      });
    }
  });
  
  // Add character nodes
  characters.forEach((char) => {
    nodes.push({
      id: `char-${char.name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'character',
      label: char.name,
      data: {
        dialogue_count: char.dialogue_count,
        scene_count: char.scene_count,
        first_appearance: char.first_appearance,
      },
    });
  });
  
  return { nodes, edges };
}
