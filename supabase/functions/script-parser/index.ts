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

interface ScriptValidation {
  isParsable: boolean;
  formatQuality: 'good' | 'poor' | 'unreadable';
  issues: string[];
  suggestions: string[];
  normalizedContent?: string;
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

// Pre-validation: Check if script is in parsable state
function validateScriptFormat(content: string, format: string, isComic: boolean): ScriptValidation {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let formatQuality: ScriptValidation['formatQuality'] = 'good';
  
  // Check basic content validity
  if (!content || content.trim().length < 100) {
    return {
      isParsable: false,
      formatQuality: 'unreadable',
      issues: ['The script appears to be empty or too short to parse.'],
      suggestions: ['Please upload a complete script file with at least one scene.'],
    };
  }
  
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const totalLines = lines.length;
  
  // Check for minimum content
  if (totalLines < 10) {
    issues.push('Very few lines of content detected.');
    suggestions.push('The script may be incomplete or corrupted.');
    formatQuality = 'poor';
  }
  
  // Check for screenplay formatting indicators
  const sceneHeadingPattern = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*.+/im;
  const characterPattern = /^[A-Z][A-Z\s\.']{2,}$/m;
  const dialoguePattern = /^\s{10,}.+/m;
  const parentheticalPattern = /^\s*\([^)]+\)\s*$/m;
  
  // Comic-specific patterns
  const panelPattern = /^(PANEL|PAGE)\s*\d+/im;
  const comicDialoguePattern = /^[A-Z]+\s*:\s*.+/im;
  
  if (isComic) {
    const hasPanelMarkers = panelPattern.test(content);
    const hasComicDialogue = comicDialoguePattern.test(content);
    
    if (!hasPanelMarkers && !hasComicDialogue) {
      issues.push('No comic panel or page markers detected.');
      suggestions.push('Consider formatting with PANEL 1, PAGE 1, etc. for better extraction.');
      formatQuality = 'poor';
    }
  } else {
    const hasSceneHeadings = sceneHeadingPattern.test(content);
    const hasCharacterCues = characterPattern.test(content);
    
    if (!hasSceneHeadings) {
      issues.push('No standard scene headings (INT./EXT.) detected.');
      suggestions.push('Ensure scene headings start with INT. or EXT. followed by location.');
      formatQuality = 'poor';
    }
    
    if (!hasCharacterCues) {
      issues.push('No character dialogue cues detected.');
      suggestions.push('Character names should be in ALL CAPS before their dialogue.');
      formatQuality = 'poor';
    }
  }
  
  // Check for common formatting issues
  const excessiveWhitespace = content.match(/\n{5,}/g);
  if (excessiveWhitespace && excessiveWhitespace.length > 5) {
    issues.push('Excessive blank lines detected which may affect parsing.');
  }
  
  // Check for encoding issues
  const hasEncodingIssues = /[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content);
  if (hasEncodingIssues) {
    issues.push('Encoding issues detected (special characters or corruption).');
    suggestions.push('Try saving the file as UTF-8 encoded text.');
    formatQuality = 'poor';
  }
  
  // Determine if parsable
  const isParsable = issues.length < 3 && (
    isComic 
      ? (panelPattern.test(content) || comicDialoguePattern.test(content) || totalLines > 20)
      : (sceneHeadingPattern.test(content) || totalLines > 50)
  );

  if (!isParsable && issues.length === 0) {
    issues.push('Script structure could not be identified.');
    suggestions.push('Please ensure the script follows standard formatting conventions.');
    formatQuality = 'unreadable';
  }
  
  return {
    isParsable,
    formatQuality,
    issues,
    suggestions,
  };
}

// AI-powered format rescue: attempt to parse poorly formatted scripts using AI
async function rescueParsingWithAI(
  content: string,
  format: string,
  isComic: boolean,
  validation: ScriptValidation
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string; rescued: boolean }> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.log('[script-parser] No API key for AI rescue');
    return { scenes: [], characters: [], rawText: content, rescued: false };
  }
  
  console.log('[script-parser] Attempting AI-powered parsing rescue...');
  
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
            content: `You are an expert ${isComic ? 'comic script' : 'screenplay'} parser that can extract structure from poorly formatted scripts.

The script has these issues: ${validation.issues.join('; ')}

Your task is to:
1. Identify all scenes ${isComic ? 'or panels' : ''} even without standard formatting
2. Extract character names from dialogue
3. Estimate page numbers based on content length

Return JSON ONLY in this exact format (no markdown, no explanation):
{
  "scenes": [
    {
      "scene_number": 1,
      "heading": "Scene heading or description",
      "int_ext": "INT" | "EXT" | null,
      "location": "Location name",
      "time_of_day": "DAY" | "NIGHT" | null,
      "description": "Brief scene description",
      "page_start": 1,
      "page_end": 2
    }
  ],
  "characters": [
    {
      "name": "CHARACTER NAME",
      "dialogue_count": 10,
      "scene_count": 3,
      "first_appearance": 1,
      "description": "Brief character description"
    }
  ],
  "parsing_notes": "Any notes about the extraction process"
}`
          },
          {
            role: 'user',
            content: `Parse this ${isComic ? 'comic script' : 'screenplay'} and extract all scenes and characters. The script may be poorly formatted:\n\n${content.substring(0, 80000)}`
          }
        ],
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[script-parser] AI rescue API error:', response.status, errorText);
      return { scenes: [], characters: [], rawText: content, rescued: false };
    }

    const aiResult = await response.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[script-parser] AI rescue: No valid JSON in response');
      return { scenes: [], characters: [], rawText: content, rescued: false };
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    const scenes: Scene[] = (parsed.scenes || []).map((s: any, i: number) => ({
      scene_number: s.scene_number || i + 1,
      heading: s.heading || `Scene ${i + 1}`,
      int_ext: s.int_ext || null,
      location: s.location || null,
      time_of_day: s.time_of_day || null,
      description: s.description || null,
      page_start: s.page_start || null,
      page_end: s.page_end || null,
    }));
    
    const characters: Character[] = (parsed.characters || []).map((c: any) => ({
      name: c.name || 'UNKNOWN',
      dialogue_count: c.dialogue_count || 1,
      scene_count: c.scene_count || 1,
      first_appearance: c.first_appearance || 1,
      description: c.description || null,
    }));
    
    if (parsed.parsing_notes) {
      console.log('[script-parser] AI rescue notes:', parsed.parsing_notes);
    }
    
    console.log(`[script-parser] AI rescue successful: ${scenes.length} scenes, ${characters.length} characters`);
    
    return {
      scenes,
      characters,
      rawText: content,
      rescued: scenes.length > 0,
    };
  } catch (error) {
    console.error('[script-parser] AI rescue error:', error);
    return { scenes: [], characters: [], rawText: content, rescued: false };
  }
}

// AI-powered content normalization for badly formatted text
async function normalizeWithAI(content: string, isComic: boolean): Promise<string> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey || content.length < 500) {
    return content;
  }
  
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a ${isComic ? 'comic script' : 'screenplay'} format fixer. 
            
Your task is to fix formatting issues while preserving all content:
1. Add proper scene headings (INT./EXT.) if missing
2. Format character names in ALL CAPS before dialogue
3. Standardize panel/page markers for comics
4. Fix encoding issues and normalize whitespace

Return ONLY the corrected script text, no explanations.`
          },
          {
            role: 'user',
            content: `Fix the formatting of this ${isComic ? 'comic script' : 'screenplay'}:\n\n${content.substring(0, 30000)}`
          }
        ],
        max_tokens: 32000,
      }),
    });

    if (!response.ok) {
      return content;
    }

    const aiResult = await response.json();
    const normalized = aiResult.choices?.[0]?.message?.content || content;
    
    // Only use AI result if it's substantial
    if (normalized.length > content.length * 0.5) {
      console.log('[script-parser] AI normalization applied');
      return normalized;
    }
    
    return content;
  } catch {
    return content;
  }
}

// Normalize script content for better parsing
function normalizeScriptContent(content: string, format: string, isComic: boolean): string {
  let normalized = content;
  
  // Remove BOM and control characters
  normalized = normalized.replace(/^\uFEFF/, '');
  normalized = normalized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  
  // Normalize line endings
  normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Reduce excessive blank lines (more than 3 to 2)
  normalized = normalized.replace(/\n{4,}/g, '\n\n\n');
  
  // Trim trailing whitespace from lines
  normalized = normalized.split('\n').map(line => line.trimEnd()).join('\n');
  
  // Fix common OCR/scan issues
  normalized = normalized.replace(/['']/g, "'");
  normalized = normalized.replace(/[""]/g, '"');
  normalized = normalized.replace(/—/g, '--');
  normalized = normalized.replace(/…/g, '...');
  
  // Standardize scene heading formats
  if (!isComic) {
    // Fix variations of INT/EXT
    normalized = normalized.replace(/^(INT|INTERIOR)[\s.:]+/gim, 'INT. ');
    normalized = normalized.replace(/^(EXT|EXTERIOR)[\s.:]+/gim, 'EXT. ');
    normalized = normalized.replace(/^(INT\/EXT|INT\.\/EXT\.|INTERIOR\/EXTERIOR)[\s.:]+/gim, 'INT/EXT. ');
    
    // Standardize time of day markers
    normalized = normalized.replace(/\s*-\s*(DAY|NIGHT|MORNING|EVENING|DUSK|DAWN|LATER|CONTINUOUS|SAME)\s*$/gim, ' - $1');
  }
  
  // Comic-specific normalization
  if (isComic) {
    // Standardize panel markers
    normalized = normalized.replace(/^(PANEL|PNL)[\s#.:]*(\d+)/gim, 'PANEL $2');
    normalized = normalized.replace(/^(PAGE|PG)[\s#.:]*(\d+)/gim, 'PAGE $2');
  }
  
  return normalized.trim();
}

// Validate extraction completeness
function validateExtraction(
  result: Omit<ParseResult, 'isComplete' | 'extractedPages' | 'expectedPages' | 'errorMessage'>,
  expectedPages: number,
  format: string,
  validation?: ScriptValidation
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
      if (validation && validation.issues.length > 0) {
        errorMessage = `Script format issues: ${validation.issues.join(' ')} ${validation.suggestions.join(' ')}`;
      } else {
        errorMessage = `Failed to extract any scenes from the ${format.toUpperCase()} file. The file may be corrupted, password-protected, or in an unsupported format.`;
      }
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
    let usedAIRescue = false;
    let validation: ScriptValidation | undefined;
    
    // For text-based formats, pre-validate and potentially normalize
    if (['fountain', 'highland', 'txt'].includes(format)) {
      const textContent = await fileData.text();
      
      // Step 1: Validate format
      validation = validateScriptFormat(textContent, format, isComic);
      console.log(`[script-parser] Format validation: ${validation.formatQuality}, parsable: ${validation.isParsable}`);
      
      let contentToParse = textContent;
      
      // Step 2: If format is poor, try AI normalization first
      if (validation.formatQuality === 'poor' && validation.isParsable) {
        console.log('[script-parser] Attempting AI normalization for poor format...');
        contentToParse = await normalizeWithAI(textContent, isComic);
      }
      
      // Step 3: Normalize content
      contentToParse = normalizeScriptContent(contentToParse, format, isComic);
      
      // Step 4: Try traditional parsing
      rawResult = isComic ? parseComicFormat(contentToParse) : parseTextFormat(contentToParse, format);
      
      // Step 5: If traditional parsing failed or produced poor results, use AI rescue
      if (rawResult.scenes.length === 0 || (validation.formatQuality !== 'good' && rawResult.scenes.length < 3)) {
        console.log('[script-parser] Traditional parsing insufficient, attempting AI rescue...');
        const rescueResult = await rescueParsingWithAI(textContent, format, isComic, validation);
        
        if (rescueResult.rescued && rescueResult.scenes.length > rawResult.scenes.length) {
          rawResult = {
            scenes: rescueResult.scenes,
            characters: rescueResult.characters,
            rawText: rescueResult.rawText,
          };
          usedAIRescue = true;
          console.log('[script-parser] AI rescue improved results');
        }
      }
    } else {
      // For binary formats, use AI parsing directly
      switch (format) {
        case 'fdx':
          const fdxContent = await fileData.text();
          
          // Validate FDX content
          validation = validateScriptFormat(fdxContent.replace(/<[^>]+>/g, ' '), format, isComic);
          
          rawResult = parseFinalDraft(fdxContent);
          
          // If FDX parsing failed, try AI rescue on extracted text
          if (rawResult.scenes.length === 0) {
            const textContent = fdxContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
            const rescueResult = await rescueParsingWithAI(textContent, format, isComic, validation);
            if (rescueResult.rescued) {
              rawResult = rescueResult;
              usedAIRescue = true;
            }
          }
          break;
        case 'docx':
          const docxBytes = await fileData.arrayBuffer();
          rawResult = await parseDocxWithAI(supabase, docxBytes, scriptId, isComic, expectedPages);
          usedAIRescue = true;
          break;
        case 'pdf':
          const pdfBytes = await fileData.arrayBuffer();
          rawResult = isComic 
            ? await parseComicPDFWithAI(supabase, pdfBytes, scriptId, expectedPages)
            : await parsePDFWithAI(supabase, pdfBytes, scriptId, expectedPages);
          usedAIRescue = true;
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    }

    // Validate extraction completeness
    const parsedContent = validateExtraction(rawResult, expectedPages, format, validation);

    console.log(`[script-parser] Parsed ${parsedContent.scenes.length} scenes, ${parsedContent.characters.length} characters`);
    console.log(`[script-parser] Extraction complete: ${parsedContent.isComplete}, pages: ${parsedContent.extractedPages}/${parsedContent.expectedPages}, AI rescued: ${usedAIRescue}`);

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
          ai_assisted: usedAIRescue,
          format_quality: validation?.formatQuality || 'unknown',
          format_issues: validation?.issues || [],
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
        aiAssisted: usedAIRescue,
        formatQuality: validation?.formatQuality || 'unknown',
        formatIssues: validation?.issues || [],
        formatSuggestions: validation?.suggestions || [],
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

// Helper: retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.log(`[script-parser] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// Parse PDF by extracting text content first, then using AI for structure
async function parsePDFWithAI(
  supabase: any,
  pdfBytes: ArrayBuffer,
  scriptId: string,
  expectedPages: number
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string }> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.error('[script-parser] No Lovable API key available for PDF parsing');
    return { scenes: [], characters: [], rawText: '' };
  }

  const totalBytes = pdfBytes.byteLength;
  const uint8Array = new Uint8Array(pdfBytes);
  
  console.log(`[script-parser] Processing PDF: ${totalBytes} bytes, expected ${expectedPages} pages`);

  // Convert entire PDF to base64 - Gemini can handle up to ~20MB
  let base64 = '';
  const b64ChunkSize = 32768;
  for (let i = 0; i < uint8Array.length; i += b64ChunkSize) {
    const chunk = uint8Array.slice(i, Math.min(i + b64ChunkSize, uint8Array.length));
    base64 += String.fromCharCode.apply(null, Array.from(chunk));
  }
  base64 = btoa(base64);
  
  console.log(`[script-parser] PDF base64 length: ${base64.length} chars`);

  // For very large files (>2MB base64), we need to process in logical text chunks
  // But first, try processing the whole thing with vision
  const allScenes: Scene[] = [];
  const allCharacters: Map<string, Character> = new Map();
  let fullRawText = '';
  
  // Try processing the entire document in one shot first
  if (base64.length <= 3000000) { // ~2.2MB of original PDF
    try {
      const result = await retryWithBackoff(async () => {
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
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `You are a screenplay parser. Analyze this complete screenplay PDF and extract ALL scenes and characters. 
                    
CRITICAL: You must extract EVERY scene from the ENTIRE document. Do not skip any scenes.
Expected pages: approximately ${expectedPages}

Return JSON in this exact format:
{
  "scenes": [
    {"scene_number": 1, "heading": "INT. LOCATION - DAY", "int_ext": "INT", "location": "LOCATION", "time_of_day": "DAY", "page_start": 1, "page_end": 2, "description": "brief scene description"}
  ],
  "characters": [
    {"name": "CHARACTER NAME", "dialogue_count": 5, "first_appearance": 1}
  ],
  "total_pages": 120,
  "raw_text_sample": "First 2000 characters of extracted text..."
}

Only return valid JSON, no markdown or explanations.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:application/pdf;base64,${base64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 16000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }
        return response.json();
      });

      const content = result.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        (parsed.scenes || []).forEach((s: any, i: number) => {
          allScenes.push({
            scene_number: s.scene_number || i + 1,
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
          allCharacters.set(name, {
            name,
            dialogue_count: c.dialogue_count || 1,
            scene_count: c.scene_count || Math.ceil((c.dialogue_count || 1) / 5),
            first_appearance: c.first_appearance || 1,
            description: c.description || null,
          });
        });
        
        fullRawText = parsed.raw_text_sample || '';
        
        console.log(`[script-parser] Single-pass PDF extraction: ${allScenes.length} scenes, ${allCharacters.size} characters`);
      }
    } catch (error) {
      console.error('[script-parser] Single-pass PDF parsing failed:', error);
    }
  }
  
  // If single-pass failed or file too large, use chunked text extraction approach
  if (allScenes.length === 0) {
    console.log('[script-parser] Using chunked text extraction for large PDF');
    
    // Extract text representations in chunks for AI processing
    const textChunkSize = 80000; // ~80KB of base64 per chunk for text extraction
    const numChunks = Math.ceil(base64.length / textChunkSize);
    
    for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
      const chunkStart = chunkIndex * textChunkSize;
      const chunkEnd = Math.min((chunkIndex + 1) * textChunkSize, base64.length);
      const chunkBase64 = base64.substring(chunkStart, chunkEnd);
      
      // Calculate approximate page range for this chunk
      const startPage = Math.floor((chunkIndex / numChunks) * expectedPages) + 1;
      const endPage = Math.floor(((chunkIndex + 1) / numChunks) * expectedPages);
      
      try {
        const result = await retryWithBackoff(async () => {
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
                  content: `You are a screenplay parser. Extract scenes and characters from screenplay content.
This is chunk ${chunkIndex + 1} of ${numChunks} (approximately pages ${startPage}-${endPage}).
Scene numbers should continue from ${allScenes.length + 1}.

Return JSON:
{
  "scenes": [{"scene_number": N, "heading": "...", "int_ext": "INT|EXT", "location": "...", "time_of_day": "...", "page_start": N, "page_end": N}],
  "characters": [{"name": "...", "dialogue_count": N}],
  "extracted_text": "Full text content from this section..."
}
Only return valid JSON.`
                },
                {
                  role: 'user',
                  content: `Parse this screenplay PDF section (base64): ${chunkBase64}`
                }
              ],
              max_tokens: 12000,
            }),
          });

          if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
          }
          return response.json();
        }, 2);

        const content = result.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          (parsed.scenes || []).forEach((s: any, i: number) => {
            allScenes.push({
              scene_number: s.scene_number || allScenes.length + i + 1,
              heading: s.heading || 'UNKNOWN',
              int_ext: s.int_ext || null,
              location: s.location || null,
              time_of_day: s.time_of_day || null,
              description: s.description || null,
              page_start: s.page_start || startPage,
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
                scene_count: 1,
                first_appearance: startPage,
                description: null,
              });
            }
          });
          
          fullRawText += (parsed.extracted_text || '') + '\n';
        }
        
        console.log(`[script-parser] Chunk ${chunkIndex + 1}/${numChunks}: ${allScenes.length} total scenes`);
        
        // Small delay between chunks to avoid rate limits
        if (chunkIndex < numChunks - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`[script-parser] Chunk ${chunkIndex + 1} failed:`, error);
      }
    }
  }
  
  // Re-number scenes sequentially
  allScenes.forEach((scene, index) => {
    scene.scene_number = index + 1;
  });
  
  // Update character scene counts based on dialogue
  allCharacters.forEach(char => {
    char.scene_count = Math.max(1, Math.ceil(char.dialogue_count / 5));
  });
  
  console.log(`[script-parser] PDF extraction complete: ${allScenes.length} scenes, ${allCharacters.size} characters`);

  return {
    scenes: allScenes,
    characters: Array.from(allCharacters.values()),
    rawText: fullRawText,
  };
}

// Parse DOCX using AI assistance - improved with retry and proper handling
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
    return { scenes: [], characters: [], rawText: '' };
  }

  const totalBytes = docxBytes.byteLength;
  const uint8Array = new Uint8Array(docxBytes);
  
  console.log(`[script-parser] Processing DOCX: ${totalBytes} bytes, expected ${expectedPages} pages`);

  // Convert entire DOCX to base64
  let base64 = '';
  const b64ChunkSize = 32768;
  for (let i = 0; i < uint8Array.length; i += b64ChunkSize) {
    const chunk = uint8Array.slice(i, Math.min(i + b64ChunkSize, uint8Array.length));
    base64 += String.fromCharCode.apply(null, Array.from(chunk));
  }
  base64 = btoa(base64);

  const allScenes: Scene[] = [];
  const allCharacters: Map<string, Character> = new Map();
  let fullRawText = '';

  // Try single-pass for smaller files
  if (base64.length <= 2000000) {
    try {
      const result = await retryWithBackoff(async () => {
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
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `You are a ${isComic ? 'comic script' : 'screenplay'} parser. Analyze this complete document and extract ALL ${isComic ? 'panels' : 'scenes'} and characters.

CRITICAL: Extract EVERY ${isComic ? 'panel/page' : 'scene'} from the ENTIRE document. Do not skip any.
Expected pages: approximately ${expectedPages}

Return JSON:
{
  "scenes": [{"scene_number": N, "heading": "${isComic ? 'PAGE X - PANEL Y' : 'INT. LOCATION - DAY'}", "int_ext": "${isComic ? 'null' : 'INT|EXT'}", "location": "...", "time_of_day": "...", "page_start": N, "page_end": N, "description": "..."}],
  "characters": [{"name": "CHARACTER", "dialogue_count": N, "first_appearance": N}],
  "total_pages": N
}
Only return valid JSON.`
                  },
                  {
                    type: 'image_url',
                    image_url: { url: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}` }
                  }
                ]
              }
            ],
            max_tokens: 16000,
          }),
        });

        if (!response.ok) throw new Error(`AI error: ${response.status}`);
        return response.json();
      });

      const content = result.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        (parsed.scenes || []).forEach((s: any, i: number) => {
          allScenes.push({
            scene_number: s.scene_number || i + 1,
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
          allCharacters.set(name, {
            name,
            dialogue_count: c.dialogue_count || 1,
            scene_count: Math.ceil((c.dialogue_count || 1) / 5),
            first_appearance: c.first_appearance || 1,
            description: c.description || null,
          });
        });
        
        console.log(`[script-parser] Single-pass DOCX: ${allScenes.length} scenes, ${allCharacters.size} characters`);
      }
    } catch (error) {
      console.error('[script-parser] Single-pass DOCX failed:', error);
    }
  }

  // Chunked processing for large files or if single-pass failed
  if (allScenes.length === 0) {
    console.log('[script-parser] Using chunked processing for DOCX');
    
    const textChunkSize = 60000;
    const numChunks = Math.ceil(base64.length / textChunkSize);
    
    for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
      const chunkStart = chunkIndex * textChunkSize;
      const chunkEnd = Math.min((chunkIndex + 1) * textChunkSize, base64.length);
      const chunkBase64 = base64.substring(chunkStart, chunkEnd);
      const startPage = Math.floor((chunkIndex / numChunks) * expectedPages) + 1;
      
      try {
        const result = await retryWithBackoff(async () => {
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
                  content: `Parse ${isComic ? 'comic script' : 'screenplay'}. Chunk ${chunkIndex + 1}/${numChunks}. Start scene numbering from ${allScenes.length + 1}.
Return JSON: {"scenes": [...], "characters": [...], "extracted_text": "..."}`
                },
                { role: 'user', content: `Parse DOCX section: ${chunkBase64}` }
              ],
              max_tokens: 10000,
            }),
          });
          if (!response.ok) throw new Error(`AI error: ${response.status}`);
          return response.json();
        }, 2);

        const content = result.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          (parsed.scenes || []).forEach((s: any, i: number) => {
            allScenes.push({
              scene_number: allScenes.length + 1,
              heading: s.heading || 'UNKNOWN',
              int_ext: s.int_ext || null,
              location: s.location || null,
              time_of_day: s.time_of_day || null,
              description: s.description || null,
              page_start: s.page_start || startPage,
              page_end: s.page_end || null,
            });
          });
          
          (parsed.characters || []).forEach((c: any) => {
            const name = c.name || 'UNKNOWN';
            if (allCharacters.has(name)) {
              allCharacters.get(name)!.dialogue_count += c.dialogue_count || 1;
            } else {
              allCharacters.set(name, {
                name, dialogue_count: c.dialogue_count || 1, scene_count: 1,
                first_appearance: startPage, description: null,
              });
            }
          });
          
          fullRawText += (parsed.extracted_text || '') + '\n';
        }
        
        if (chunkIndex < numChunks - 1) await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.error(`[script-parser] DOCX chunk ${chunkIndex + 1} failed:`, error);
      }
    }
  }

  allCharacters.forEach(char => { char.scene_count = Math.max(1, Math.ceil(char.dialogue_count / 5)); });
  
  console.log(`[script-parser] DOCX complete: ${allScenes.length} scenes, ${allCharacters.size} characters`);

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

// Parse comic PDF using AI - improved with retry and proper handling
async function parseComicPDFWithAI(
  supabase: any,
  pdfBytes: ArrayBuffer,
  scriptId: string,
  expectedPages: number
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string }> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.error('[script-parser] No Lovable API key available for comic PDF parsing');
    return { scenes: [], characters: [], rawText: '' };
  }

  const totalBytes = pdfBytes.byteLength;
  const uint8Array = new Uint8Array(pdfBytes);
  
  console.log(`[script-parser] Processing comic PDF: ${totalBytes} bytes, expected ${expectedPages} pages`);

  // Convert entire PDF to base64
  let base64 = '';
  const b64ChunkSize = 32768;
  for (let i = 0; i < uint8Array.length; i += b64ChunkSize) {
    const chunk = uint8Array.slice(i, Math.min(i + b64ChunkSize, uint8Array.length));
    base64 += String.fromCharCode.apply(null, Array.from(chunk));
  }
  base64 = btoa(base64);

  const allScenes: Scene[] = [];
  const allCharacters: Map<string, Character> = new Map();
  let fullRawText = '';

  // Try single-pass for smaller files
  if (base64.length <= 3000000) {
    try {
      const result = await retryWithBackoff(async () => {
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
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `You are a comic script parser. Analyze this complete comic script PDF and extract ALL pages, panels, and characters.

CRITICAL: Extract EVERY page and panel from the ENTIRE document. Do not skip any.
Expected pages: approximately ${expectedPages}

Return JSON:
{
  "panels": [{"page": 1, "panel": 1, "description": "Panel description"}],
  "characters": [{"name": "CHARACTER", "dialogue_count": N}],
  "total_pages": N
}
Only return valid JSON.`
                  },
                  {
                    type: 'image_url',
                    image_url: { url: `data:application/pdf;base64,${base64}` }
                  }
                ]
              }
            ],
            max_tokens: 16000,
          }),
        });

        if (!response.ok) throw new Error(`AI error: ${response.status}`);
        return response.json();
      });

      const content = result.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        (parsed.panels || []).forEach((p: any, i: number) => {
          allScenes.push({
            scene_number: i + 1,
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
          allCharacters.set(name, {
            name,
            dialogue_count: c.dialogue_count || 1,
            scene_count: Math.ceil((c.dialogue_count || 1) / 3),
            first_appearance: 1,
            description: c.description || null,
          });
        });
        
        console.log(`[script-parser] Single-pass comic PDF: ${allScenes.length} panels, ${allCharacters.size} characters`);
      }
    } catch (error) {
      console.error('[script-parser] Single-pass comic PDF failed:', error);
    }
  }

  // Chunked processing for large files
  if (allScenes.length === 0) {
    console.log('[script-parser] Using chunked processing for comic PDF');
    
    const textChunkSize = 80000;
    const numChunks = Math.ceil(base64.length / textChunkSize);
    
    for (let chunkIndex = 0; chunkIndex < numChunks; chunkIndex++) {
      const chunkStart = chunkIndex * textChunkSize;
      const chunkEnd = Math.min((chunkIndex + 1) * textChunkSize, base64.length);
      const chunkBase64 = base64.substring(chunkStart, chunkEnd);
      const startPage = Math.floor((chunkIndex / numChunks) * expectedPages) + 1;
      
      try {
        const result = await retryWithBackoff(async () => {
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
                  content: `Parse comic script. Chunk ${chunkIndex + 1}/${numChunks}. Start panel numbering from ${allScenes.length + 1}.
Return JSON: {"panels": [{"page": N, "panel": N, "description": "..."}], "characters": [...]}`
                },
                { role: 'user', content: `Parse comic PDF section: ${chunkBase64}` }
              ],
              max_tokens: 10000,
            }),
          });
          if (!response.ok) throw new Error(`AI error: ${response.status}`);
          return response.json();
        }, 2);

        const content = result.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          (parsed.panels || []).forEach((p: any) => {
            allScenes.push({
              scene_number: allScenes.length + 1,
              heading: `PAGE ${p.page || startPage} - PANEL ${p.panel || allScenes.length + 1}`,
              int_ext: null, location: null, time_of_day: null,
              description: p.description || null,
              page_start: p.page || startPage, page_end: p.page || null,
            });
          });
          
          (parsed.characters || []).forEach((c: any) => {
            const name = c.name || 'UNKNOWN';
            if (allCharacters.has(name)) {
              allCharacters.get(name)!.dialogue_count += c.dialogue_count || 1;
            } else {
              allCharacters.set(name, {
                name, dialogue_count: c.dialogue_count || 1,
                scene_count: 1, first_appearance: startPage, description: null,
              });
            }
          });
          
          fullRawText += content + '\n';
        }
        
        if (chunkIndex < numChunks - 1) await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        console.error(`[script-parser] Comic chunk ${chunkIndex + 1} failed:`, error);
      }
    }
  }

  allCharacters.forEach(char => { char.scene_count = Math.max(1, Math.ceil(char.dialogue_count / 3)); });
  
  console.log(`[script-parser] Comic PDF complete: ${allScenes.length} panels, ${allCharacters.size} characters`);

  return {
    scenes: allScenes,
    characters: Array.from(allCharacters.values()),
    rawText: fullRawText,
  };
}
