import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseRequest {
  scriptId: string;
  format: 'pdf' | 'fdx' | 'fountain' | 'highland' | 'txt' | 'docx';
  filePath: string;
  scriptType?: string;
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

interface ParseResult {
  scenes: Scene[];
  characters: Character[];
  rawText: string;
  isComplete: boolean;
  extractedPages: number;
  expectedPages: number | null;
  errorMessage: string | null;
}

// Estimate page count from file size and format
function estimatePageCount(fileSize: number, format: string): number {
  // Average bytes per page varies by format
  const bytesPerPage: Record<string, number> = {
    pdf: 3500,      // PDFs with formatting
    fdx: 5000,      // XML is verbose
    fountain: 2500, // Plain text screenplay
    highland: 2500, // Similar to fountain
    txt: 2500,      // Plain text
    docx: 4000,     // Word docs with formatting
  };
  
  const avgBytes = bytesPerPage[format] || 3000;
  return Math.max(1, Math.ceil(fileSize / avgBytes));
}

// Validate extraction completeness
function validateExtraction(
  result: Omit<ParseResult, 'isComplete' | 'extractedPages' | 'expectedPages' | 'errorMessage'>,
  expectedPages: number,
  format: string
): ParseResult {
  const extractedPages = Math.max(
    ...result.scenes.map(s => s.page_end || s.page_start || 0),
    Math.ceil(result.rawText.length / 3000)
  );
  
  // Calculate coverage percentage
  const coveragePercent = expectedPages > 0 ? (extractedPages / expectedPages) * 100 : 100;
  
  // Determine if extraction is complete (at least 90% coverage for AI formats, 100% for text formats)
  const minCoverage = ['pdf', 'docx'].includes(format) ? 85 : 95;
  const isComplete = coveragePercent >= minCoverage && result.scenes.length > 0;
  
  let errorMessage: string | null = null;
  
  if (!isComplete) {
    if (result.scenes.length === 0) {
      errorMessage = `Failed to extract any scenes from the ${format.toUpperCase()} file. The file may be corrupted, password-protected, or in an unsupported format.`;
    } else if (coveragePercent < minCoverage) {
      errorMessage = `Incomplete extraction: Only ${Math.round(coveragePercent)}% of the script was extracted (${extractedPages} of ~${expectedPages} pages). Some pages may be unreadable or in an unsupported format.`;
    }
  }
  
  return {
    ...result,
    isComplete,
    extractedPages,
    expectedPages,
    errorMessage,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptId, format, filePath, scriptType } = await req.json() as ParseRequest;
    
    console.log(`[script-parser] Starting parse for script ${scriptId}, format: ${format}, type: ${scriptType}`);

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

    const fileSize = fileData.size;
    const expectedPages = estimatePageCount(fileSize, format);
    
    console.log(`[script-parser] Downloaded file, size: ${fileSize} bytes, estimated pages: ${expectedPages}`);

    // Parse based on format and script type
    let rawResult: { scenes: Scene[]; characters: Character[]; rawText: string };
    const isComic = scriptType === 'comic';
    
    switch (format) {
      case 'fountain':
      case 'highland':
      case 'txt':
        const textContent = await fileData.text();
        rawResult = isComic ? parseComicFormat(textContent) : parseTextFormat(textContent, format);
        break;
      case 'fdx':
        const fdxContent = await fileData.text();
        rawResult = parseFinalDraft(fdxContent);
        break;
      case 'docx':
        const docxBytes = await fileData.arrayBuffer();
        rawResult = await parseDocxWithAI(supabase, docxBytes, scriptId, isComic, expectedPages);
        break;
      case 'pdf':
        const pdfBytes = await fileData.arrayBuffer();
        rawResult = isComic 
          ? await parseComicPDFWithAI(supabase, pdfBytes, scriptId, expectedPages)
          : await parsePDFWithAI(supabase, pdfBytes, scriptId, expectedPages);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Validate extraction completeness
    const parsedContent = validateExtraction(rawResult, expectedPages, format);

    console.log(`[script-parser] Parsed ${parsedContent.scenes.length} scenes, ${parsedContent.characters.length} characters`);
    console.log(`[script-parser] Extraction complete: ${parsedContent.isComplete}, pages: ${parsedContent.extractedPages}/${parsedContent.expectedPages}`);

    if (!parsedContent.isComplete) {
      console.error(`[script-parser] Incomplete extraction: ${parsedContent.errorMessage}`);
    }

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
        metadata: { 
          parsed_at: new Date().toISOString(),
          extraction_complete: parsedContent.isComplete,
          extracted_pages: parsedContent.extractedPages,
          expected_pages: parsedContent.expectedPages,
        },
      });

    if (graphError) {
      console.error('[script-parser] Graph insert error:', graphError);
    }

    // Update script with page count
    await supabase
      .from('scripts')
      .update({ page_count: parsedContent.extractedPages })
      .eq('id', scriptId);

    console.log(`[script-parser] Parse complete for script ${scriptId}, ready for AI: ${parsedContent.isComplete}`);

    return new Response(
      JSON.stringify({
        success: true,
        scenesCount: parsedContent.scenes.length,
        charactersCount: parsedContent.characters.length,
        estimatedPages: parsedContent.expectedPages,
        extractedPages: parsedContent.extractedPages,
        isComplete: parsedContent.isComplete,
        readyForAnalysis: parsedContent.isComplete,
        errorMessage: parsedContent.errorMessage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[script-parser] Error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        readyForAnalysis: false,
      }),
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
  let currentPage = 1;
  
  // Fountain scene heading pattern
  const sceneHeadingPattern = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.+?)(?:\s*-\s*(.+))?$/i;
  // Character name pattern (ALL CAPS at start of line, followed by dialogue)
  const characterPattern = /^([A-Z][A-Z\s\.']+)(\s*\(.*\))?$/;
  // Page break pattern
  const pageBreakPattern = /^={3,}$|^\*{3,}$|^-{3,}$|^PAGE\s*BREAK/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for page break
    if (pageBreakPattern.test(line)) {
      currentPage++;
      if (currentScene) {
        currentScene.page_end = currentPage - 1;
      }
      continue;
    }
    
    // Estimate page from line count (55 lines per page)
    const estimatedPage = Math.ceil((i + 1) / 55);
    currentPage = Math.max(currentPage, estimatedPage);
    
    // Check for scene heading
    const sceneMatch = line.match(sceneHeadingPattern);
    if (sceneMatch) {
      // Close previous scene
      if (currentScene) {
        currentScene.page_end = currentPage;
      }
      
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
        page_start: currentPage,
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
  
  // Close last scene
  if (currentScene) {
    currentScene.page_end = currentPage;
  }
  
  // Update scene_count for characters
  characterMap.forEach(char => {
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
  let currentPage = 1;
  
  // FDX page break pattern
  const pageBreakRegex = /<Paragraph[^>]*>\s*<Text[^>]*>={3,}<\/Text>/gi;
  
  // Simple XML parsing for FDX format
  const sceneHeadingRegex = /<Paragraph Type="Scene Heading"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/Paragraph>/gi;
  const characterRegex = /<Paragraph Type="Character"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/Paragraph>/gi;
  const textRegex = /<Text[^>]*>([^<]*)<\/Text>/gi;
  
  // Extract all text
  let textMatch;
  while ((textMatch = textRegex.exec(content)) !== null) {
    rawText += textMatch[1] + '\n';
    // Check for page breaks
    if (textMatch[1].match(/^={3,}$/)) {
      currentPage++;
    }
  }
  
  // Extract scene headings
  let sceneMatch;
  while ((sceneMatch = sceneHeadingRegex.exec(content)) !== null) {
    sceneNumber++;
    const headingText = sceneMatch[1].replace(/<[^>]+>/g, '').trim();
    
    const intExtMatch = headingText.match(/^(INT\.|EXT\.|INT\/EXT\.)/i);
    const intExt = intExtMatch ? intExtMatch[1].replace('.', '').toUpperCase() : null;
    
    // Estimate page based on position in file
    const positionPercent = sceneMatch.index / content.length;
    const estimatedPage = Math.ceil(positionPercent * currentPage) || 1;
    
    scenes.push({
      scene_number: sceneNumber,
      heading: headingText,
      int_ext: intExt,
      location: headingText.replace(/^(INT\.|EXT\.|INT\/EXT\.)\s*/i, '').split('-')[0]?.trim() || null,
      time_of_day: headingText.split('-')[1]?.trim() || null,
      description: null,
      page_start: estimatedPage,
      page_end: estimatedPage,
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
  scriptId: string,
  expectedPages: number
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string }> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.error('[script-parser] No Lovable API key available for PDF parsing');
    return {
      scenes: [],
      characters: [],
      rawText: '',
    };
  }

  // Process the entire PDF for complete extraction
  const totalBytes = pdfBytes.byteLength;
  const uint8Array = new Uint8Array(pdfBytes);
  
  // For larger files, we need to process in chunks
  const chunkSizeBytes = 150000; // 150KB per chunk
  const numChunks = Math.ceil(totalBytes / chunkSizeBytes);
  
  console.log(`[script-parser] Processing PDF: ${totalBytes} bytes in ${numChunks} chunk(s), expected ${expectedPages} pages`);
  
  const allScenes: Scene[] = [];
  const allCharacters: Map<string, Character> = new Map();
  let fullRawText = '';
  let totalPagesProcessed = 0;
  
  for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
    const startByte = chunkIndex * chunkSizeBytes;
    const endByte = Math.min((chunkIndex + 1) * chunkSizeBytes, totalBytes);
    const chunkData = uint8Array.slice(startByte, endByte);
    
    // Convert chunk to base64
    let base64 = '';
    const b64ChunkSize = 8192;
    for (let i = 0; i < chunkData.length; i += b64ChunkSize) {
      const chunk = chunkData.slice(i, Math.min(i + b64ChunkSize, chunkData.length));
      base64 += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64 = btoa(base64);
    
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: `You are a screenplay parser. Extract ALL scenes and characters from the provided screenplay content. This is chunk ${chunkIndex + 1} of ${numChunks}.
              
              IMPORTANT: Extract every single scene heading you find. Do not skip any scenes.
              
              Return JSON in this exact format:
              {
                "scenes": [{"scene_number": 1, "heading": "INT. LOCATION - DAY", "int_ext": "INT", "location": "LOCATION", "time_of_day": "DAY", "page_start": 1, "page_end": 2}],
                "characters": [{"name": "CHARACTER NAME", "dialogue_count": 5}],
                "pages_processed": 10,
                "extraction_notes": "Any issues or notes about extraction"
              }
              Only return valid JSON, no markdown or explanations.`
            },
            {
              role: 'user',
              content: `Parse this screenplay PDF chunk (base64 encoded). Extract ALL scenes with their page numbers: ${base64.substring(0, 50000)}`
            }
          ],
          max_tokens: 8000,
        }),
      });

      if (!response.ok) {
        console.error(`[script-parser] AI API error for chunk ${chunkIndex + 1}: ${response.status}`);
        continue;
      }

      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content || '';
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Add scenes with offset for chunk number
        const sceneOffset = allScenes.length;
        (parsed.scenes || []).forEach((s: any, i: number) => {
          allScenes.push({
            scene_number: sceneOffset + (s.scene_number || i + 1),
            heading: s.heading || 'UNKNOWN',
            int_ext: s.int_ext || null,
            location: s.location || null,
            time_of_day: s.time_of_day || null,
            description: s.description || null,
            page_start: s.page_start || null,
            page_end: s.page_end || null,
          });
        });
        
        // Merge characters
        (parsed.characters || []).forEach((c: any) => {
          const name = c.name || 'UNKNOWN';
          if (allCharacters.has(name)) {
            const existing = allCharacters.get(name)!;
            existing.dialogue_count += c.dialogue_count || 1;
          } else {
            allCharacters.set(name, {
              name,
              dialogue_count: c.dialogue_count || 1,
              scene_count: c.scene_count || 1,
              first_appearance: c.first_appearance || 1,
              description: c.description || null,
            });
          }
        });
        
        totalPagesProcessed += parsed.pages_processed || Math.ceil(chunkData.length / 3500);
        fullRawText += content + '\n';
        
        if (parsed.extraction_notes) {
          console.log(`[script-parser] Chunk ${chunkIndex + 1} notes: ${parsed.extraction_notes}`);
        }
      }
    } catch (aiError) {
      console.error(`[script-parser] AI parsing error for chunk ${chunkIndex + 1}:`, aiError);
    }
  }
  
  console.log(`[script-parser] PDF extraction complete: ${allScenes.length} scenes, ${allCharacters.size} characters, ${totalPagesProcessed} pages processed`);

  if (allScenes.length === 0) {
    console.error('[script-parser] Failed to extract any scenes from PDF');
  }

  return {
    scenes: allScenes,
    characters: Array.from(allCharacters.values()),
    rawText: fullRawText,
  };
}

// Parse DOCX using AI assistance
async function parseDocxWithAI(
  supabase: any,
  docxBytes: ArrayBuffer,
  scriptId: string,
  isComic: boolean,
  expectedPages: number
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string }> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.error('[script-parser] No Lovable API key available for DOCX parsing');
    return {
      scenes: [],
      characters: [],
      rawText: '',
    };
  }

  // Process entire DOCX
  const totalBytes = docxBytes.byteLength;
  const uint8Array = new Uint8Array(docxBytes);
  
  const chunkSizeBytes = 150000;
  const numChunks = Math.ceil(totalBytes / chunkSizeBytes);
  
  console.log(`[script-parser] Processing DOCX: ${totalBytes} bytes in ${numChunks} chunk(s), expected ${expectedPages} pages`);
  
  const allScenes: Scene[] = [];
  const allCharacters: Map<string, Character> = new Map();
  let fullRawText = '';
  
  for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
    const startByte = chunkIndex * chunkSizeBytes;
    const endByte = Math.min((chunkIndex + 1) * chunkSizeBytes, totalBytes);
    const chunkData = uint8Array.slice(startByte, endByte);
    
    let base64 = '';
    const b64ChunkSize = 8192;
    for (let i = 0; i < chunkData.length; i += b64ChunkSize) {
      const chunk = chunkData.slice(i, Math.min(i + b64ChunkSize, chunkData.length));
      base64 += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64 = btoa(base64);

    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: `You are a ${isComic ? 'comic script' : 'screenplay'} parser. Extract ALL scenes/panels and characters. This is chunk ${chunkIndex + 1} of ${numChunks}.
              
              IMPORTANT: Extract every single scene heading or panel you find. Do not skip any.
              
              Return JSON in this exact format:
              {
                "scenes": [{"scene_number": 1, "heading": "INT. LOCATION - DAY", "int_ext": "INT", "location": "LOCATION", "time_of_day": "DAY", "page_start": 1, "page_end": 2}],
                "characters": [{"name": "CHARACTER NAME", "dialogue_count": 5}],
                "pages_processed": 10
              }
              Only return valid JSON, no markdown or explanations.`
            },
            {
              role: 'user',
              content: `Parse this ${isComic ? 'comic script' : 'screenplay'} DOCX chunk (base64 encoded): ${base64.substring(0, 50000)}`
            }
          ],
          max_tokens: 8000,
        }),
      });

      if (!response.ok) {
        console.error(`[script-parser] AI API error for DOCX chunk ${chunkIndex + 1}: ${response.status}`);
        continue;
      }
      
      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content || '';
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const sceneOffset = allScenes.length;
        (parsed.scenes || []).forEach((s: any, i: number) => {
          allScenes.push({
            scene_number: sceneOffset + (s.scene_number || i + 1),
            heading: s.heading || 'UNKNOWN',
            int_ext: s.int_ext || null,
            location: s.location || null,
            time_of_day: s.time_of_day || null,
            description: s.description || null,
            page_start: s.page_start || null,
            page_end: s.page_end || null,
          });
        });
        
        (parsed.characters || []).forEach((c: any) => {
          const name = c.name || 'UNKNOWN';
          if (allCharacters.has(name)) {
            const existing = allCharacters.get(name)!;
            existing.dialogue_count += c.dialogue_count || 1;
          } else {
            allCharacters.set(name, {
              name,
              dialogue_count: c.dialogue_count || 1,
              scene_count: c.scene_count || 1,
              first_appearance: c.first_appearance || 1,
              description: c.description || null,
            });
          }
        });
        
        fullRawText += content + '\n';
      }
    } catch (aiError) {
      console.error(`[script-parser] DOCX AI parsing error for chunk ${chunkIndex + 1}:`, aiError);
    }
  }

  console.log(`[script-parser] DOCX extraction complete: ${allScenes.length} scenes, ${allCharacters.size} characters`);

  return {
    scenes: allScenes,
    characters: Array.from(allCharacters.values()),
    rawText: fullRawText,
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

// Parse comic script format (panels, splash pages, captions)
function parseComicFormat(content: string): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  const lines = content.split('\n');
  
  let currentPanelNumber = 0;
  let currentPageNumber = 0;
  
  // Comic script patterns
  const pagePattern = /^PAGE\s*(\d+)/i;
  const panelPattern = /^PANEL\s*(\d+)/i;
  const splashPattern = /^SPLASH\s*PAGE/i;
  const spreadPattern = /^(DOUBLE[- ]?PAGE\s*)?SPREAD/i;
  const characterDialoguePattern = /^([A-Z][A-Z\s\.']+)(?:\s*\(.*\))?:\s*(.+)/;
  const captionPattern = /^(?:CAPTION|CAP|NARRATION|NARRATOR)\s*(?:\(.*\))?:\s*(.+)/i;
  const sfxPattern = /^SFX:\s*(.+)/i;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Check for page marker
    const pageMatch = line.match(pagePattern);
    if (pageMatch) {
      currentPageNumber = parseInt(pageMatch[1]);
      continue;
    }
    
    // Check for splash page
    if (splashPattern.test(line) || spreadPattern.test(line)) {
      currentPanelNumber++;
      currentPageNumber = currentPageNumber || 1;
      
      scenes.push({
        scene_number: currentPanelNumber,
        heading: line,
        int_ext: null,
        location: 'SPLASH',
        time_of_day: null,
        description: null,
        page_start: currentPageNumber,
        page_end: currentPageNumber,
      });
      continue;
    }
    
    // Check for panel
    const panelMatch = line.match(panelPattern);
    if (panelMatch) {
      currentPanelNumber++;
      
      // Look ahead for description
      let description = '';
      let j = i + 1;
      while (j < lines.length && !pagePattern.test(lines[j].trim()) && !panelPattern.test(lines[j].trim())) {
        const nextLine = lines[j].trim();
        if (nextLine && !characterDialoguePattern.test(nextLine) && !captionPattern.test(nextLine) && !sfxPattern.test(nextLine)) {
          description += (description ? ' ' : '') + nextLine;
          if (description.length > 200) break;
        }
        j++;
      }
      
      scenes.push({
        scene_number: currentPanelNumber,
        heading: `PAGE ${currentPageNumber} - PANEL ${panelMatch[1]}`,
        int_ext: null,
        location: null,
        time_of_day: null,
        description: description || null,
        page_start: currentPageNumber,
        page_end: currentPageNumber,
      });
      continue;
    }
    
    // Check for character dialogue
    const dialogueMatch = line.match(characterDialoguePattern);
    if (dialogueMatch) {
      const charName = dialogueMatch[1].trim();
      
      if (!['CAPTION', 'CAP', 'NARRATION', 'NARRATOR', 'SFX', 'SOUND'].includes(charName.toUpperCase())) {
        if (!characterMap.has(charName)) {
          characterMap.set(charName, {
            name: charName,
            dialogue_count: 0,
            scene_count: 0,
            first_appearance: currentPanelNumber || 1,
            description: null,
          });
        }
        
        const char = characterMap.get(charName)!;
        char.dialogue_count++;
        char.scene_count = Math.ceil(char.dialogue_count / 3);
      }
    }
  }
  
  // If no panels were found, create a basic structure
  if (scenes.length === 0) {
    console.warn('[script-parser] No panels found in comic format, may indicate parsing failure');
  }
  
  return {
    scenes,
    characters: Array.from(characterMap.values()),
    rawText: content,
  };
}

// Parse comic PDF using AI
async function parseComicPDFWithAI(
  supabase: any,
  pdfBytes: ArrayBuffer,
  scriptId: string,
  expectedPages: number
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string }> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.error('[script-parser] No Lovable API key available for comic PDF parsing');
    return {
      scenes: [],
      characters: [],
      rawText: '',
    };
  }

  // Process entire PDF for complete extraction
  const totalBytes = pdfBytes.byteLength;
  const uint8Array = new Uint8Array(pdfBytes);
  
  const chunkSizeBytes = 150000;
  const numChunks = Math.ceil(totalBytes / chunkSizeBytes);
  
  console.log(`[script-parser] Processing comic PDF: ${totalBytes} bytes in ${numChunks} chunk(s), expected ${expectedPages} pages`);
  
  const allScenes: Scene[] = [];
  const allCharacters: Map<string, Character> = new Map();
  let fullRawText = '';

  for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
    const startByte = chunkIndex * chunkSizeBytes;
    const endByte = Math.min((chunkIndex + 1) * chunkSizeBytes, totalBytes);
    const chunkData = uint8Array.slice(startByte, endByte);
    
    let base64 = '';
    const b64ChunkSize = 8192;
    for (let i = 0; i < chunkData.length; i += b64ChunkSize) {
      const chunk = chunkData.slice(i, Math.min(i + b64ChunkSize, chunkData.length));
      base64 += String.fromCharCode.apply(null, Array.from(chunk));
    }
    base64 = btoa(base64);

    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: `You are a comic script parser. Extract ALL pages, panels, and characters. This is chunk ${chunkIndex + 1} of ${numChunks}.
              
              IMPORTANT: Extract every single page and panel you find. Do not skip any.
              
              Return JSON in this exact format:
              {
                "panels": [{"page": 1, "panel": 1, "description": "Panel description"}],
                "characters": [{"name": "CHARACTER NAME", "dialogue_count": 5}],
                "pages_processed": 10
              }
              Only return valid JSON, no markdown or explanations.`
            },
            {
              role: 'user',
              content: `Parse this comic script PDF chunk (base64 encoded): ${base64.substring(0, 50000)}`
            }
          ],
          max_tokens: 8000,
        }),
      });

      if (!response.ok) {
        console.error(`[script-parser] AI API error for comic chunk ${chunkIndex + 1}: ${response.status}`);
        continue;
      }

      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content || '';
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const panelOffset = allScenes.length;
        (parsed.panels || []).forEach((p: any, i: number) => {
          allScenes.push({
            scene_number: panelOffset + i + 1,
            heading: `PAGE ${p.page || 1} - PANEL ${p.panel || i + 1}`,
            int_ext: null,
            location: null,
            time_of_day: null,
            description: p.description || null,
            page_start: p.page || 1,
            page_end: p.page || null,
          });
        });
        
        (parsed.characters || []).forEach((c: any) => {
          const name = c.name || 'UNKNOWN';
          if (allCharacters.has(name)) {
            const existing = allCharacters.get(name)!;
            existing.dialogue_count += c.dialogue_count || 1;
          } else {
            allCharacters.set(name, {
              name,
              dialogue_count: c.dialogue_count || 1,
              scene_count: Math.ceil((c.dialogue_count || 1) / 3),
              first_appearance: 1,
              description: c.description || null,
            });
          }
        });
        
        fullRawText += content + '\n';
      }
    } catch (aiError) {
      console.error(`[script-parser] AI comic parsing error for chunk ${chunkIndex + 1}:`, aiError);
    }
  }

  console.log(`[script-parser] Comic PDF extraction complete: ${allScenes.length} panels, ${allCharacters.size} characters`);

  return {
    scenes: allScenes,
    characters: Array.from(allCharacters.values()),
    rawText: fullRawText,
  };
}
