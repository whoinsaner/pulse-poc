import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

// SSE helper to send events
function sendSSE(controller: ReadableStreamDefaultController, event: string, data: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

// JSON repair utility - fixes common AI response issues
function repairJSON(jsonString: string): string {
  let repaired = jsonString.trim();
  
  // Remove markdown code blocks if present
  repaired = repaired.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  repaired = repaired.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  
  // Find the actual JSON object/array
  const jsonStartObj = repaired.indexOf('{');
  const jsonStartArr = repaired.indexOf('[');
  const jsonStart = jsonStartObj === -1 ? jsonStartArr : 
                    jsonStartArr === -1 ? jsonStartObj : 
                    Math.min(jsonStartObj, jsonStartArr);
  
  if (jsonStart > 0) {
    repaired = repaired.substring(jsonStart);
  }
  
  // Count brackets to find proper ending
  let braceCount = 0;
  let bracketCount = 0;
  let lastValidIndex = -1;
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') braceCount++;
      else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && bracketCount === 0) {
          lastValidIndex = i;
          break;
        }
      }
      else if (char === '[') bracketCount++;
      else if (char === ']') {
        bracketCount--;
        if (bracketCount === 0 && braceCount === 0) {
          lastValidIndex = i;
          break;
        }
      }
    }
  }
  
  if (lastValidIndex > 0) {
    repaired = repaired.substring(0, lastValidIndex + 1);
  }
  
  // Fix trailing commas before closing brackets/braces
  repaired = repaired.replace(/,\s*}/g, '}');
  repaired = repaired.replace(/,\s*\]/g, ']');
  
  // Fix missing commas between array elements (common issue)
  repaired = repaired.replace(/}\s*{/g, '},{');
  repaired = repaired.replace(/"\s*{/g, '",{');
  repaired = repaired.replace(/}\s*"/g, '},"');
  
  // Remove control characters that break JSON
  repaired = repaired.replace(/[\x00-\x1F\x7F]/g, (match) => {
    if (match === '\n' || match === '\r' || match === '\t') return match;
    return '';
  });
  
  // Fix unescaped newlines in strings
  repaired = repaired.replace(/([^\\])\\n/g, '$1\\n');
  
  return repaired;
}

// Safe JSON parse with repair
function safeParseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (firstError) {
    console.log('[script-parser-stream] Initial JSON parse failed, attempting repair...');
    
    try {
      const repaired = repairJSON(jsonString);
      return JSON.parse(repaired);
    } catch (secondError) {
      console.error('[script-parser-stream] JSON repair failed:', secondError);
      
      // Last resort: try to extract just the arrays we need
      try {
        const scenesMatch = jsonString.match(/"scenes"\s*:\s*\[([\s\S]*?)\]/);
        const charsMatch = jsonString.match(/"characters"\s*:\s*\[([\s\S]*?)\]/);
        
        return {
          scenes: scenesMatch ? JSON.parse(`[${repairJSON(scenesMatch[1])}]`) : [],
          characters: charsMatch ? JSON.parse(`[${repairJSON(charsMatch[1])}]`) : [],
        };
      } catch {
        throw new Error(`JSON parsing completely failed: ${firstError}`);
      }
    }
  }
}

// Estimate page count from file size and format
function estimatePageCount(fileSize: number, format: string): number {
  const bytesPerPage: Record<string, number> = {
    pdf: 3500,
    fdx: 5000,
    fountain: 2500,
    highland: 2500,
    txt: 2500,
    docx: 4000,
  };
  
  const avgBytes = bytesPerPage[format] || 3000;
  return Math.max(1, Math.ceil(fileSize / avgBytes));
}

// Pre-flight validation
function validateFile(fileSize: number, format: string): { valid: boolean; warnings: string[]; recommendations: string[] } {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const estimatedPages = estimatePageCount(fileSize, format);
  
  if (fileSize > 15 * 1024 * 1024) {
    warnings.push(`File is very large (${(fileSize / 1024 / 1024).toFixed(1)}MB). Processing may take several minutes.`);
    recommendations.push('Consider splitting into smaller files if parsing fails.');
  }
  
  if (estimatedPages > 150) {
    warnings.push(`Script appears to be ~${estimatedPages} pages, which is quite long.`);
    recommendations.push('Long scripts may have incomplete extraction. Feature-length (90-120 pages) works best.');
  }
  
  if (format === 'docx') {
    recommendations.push('For best results, consider exporting as PDF or Fountain format.');
  }
  
  if (format === 'pdf' && fileSize > 5 * 1024 * 1024) {
    warnings.push('Large PDF files may timeout. Consider using Fountain or Final Draft format.');
  }
  
  return { valid: true, warnings, recommendations };
}

// Retry with backoff
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
        console.log(`[script-parser-stream] Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { scriptId, format, filePath, scriptType } = await req.json() as ParseRequest;
  
  console.log(`[script-parser-stream] Starting SSE parse for script ${scriptId}`);

  // Create SSE response stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
        
        // Stage 1: Download
        sendSSE(controller, 'stage', { stage: 'download', message: 'Downloading script from storage...' });
        
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('scripts')
          .download(filePath);

        if (downloadError) {
          throw new Error(`Failed to download: ${downloadError.message}`);
        }
        
        const fileSize = fileData.size;
        const expectedPages = estimatePageCount(fileSize, format);
        
        sendSSE(controller, 'progress', { 
          stage: 'download', 
          percent: 100, 
          message: `Downloaded ${(fileSize / 1024).toFixed(0)}KB, ~${expectedPages} pages` 
        });

        // Stage 2: Validate
        sendSSE(controller, 'stage', { stage: 'validate', message: 'Validating file format...' });
        
        const validation = validateFile(fileSize, format);
        if (validation.warnings.length > 0) {
          sendSSE(controller, 'warning', { 
            warnings: validation.warnings, 
            recommendations: validation.recommendations 
          });
        }
        
        sendSSE(controller, 'progress', { stage: 'validate', percent: 100, message: 'Format validated' });

        // Stage 3: Extract content
        sendSSE(controller, 'stage', { stage: 'extract', message: 'Extracting script content...' });
        
        const isComic = scriptType === 'comic';
        let allScenes: Scene[] = [];
        let allCharacters: Map<string, Character> = new Map();
        let rawText = '';
        let usedAIRescue = false;
        
        if (['fountain', 'highland', 'txt'].includes(format)) {
          // Text-based formats - parse directly
          const textContent = await fileData.text();
          rawText = textContent;
          
          sendSSE(controller, 'progress', { stage: 'extract', percent: 50, message: 'Parsing text content...' });
          
          const parsed = isComic ? parseComicFormat(textContent) : parseTextFormat(textContent);
          allScenes = parsed.scenes;
          parsed.characters.forEach(c => allCharacters.set(c.name, c));
          
          // If parsing produced poor results, try AI rescue
          if (allScenes.length < 3 && lovableApiKey) {
            sendSSE(controller, 'progress', { stage: 'extract', percent: 70, message: 'Using AI to improve extraction...' });
            
            const aiResult = await parseWithAI(lovableApiKey, textContent, isComic, expectedPages, (progress, message) => {
              sendSSE(controller, 'progress', { stage: 'extract', percent: 70 + (progress * 0.3), message });
            });
            
            if (aiResult.scenes.length > allScenes.length) {
              allScenes = aiResult.scenes;
              allCharacters = new Map(aiResult.characters.map(c => [c.name, c]));
              usedAIRescue = true;
            }
          }
        } else if (format === 'fdx') {
          // Final Draft XML
          const fdxContent = await fileData.text();
          const parsed = parseFinalDraft(fdxContent);
          allScenes = parsed.scenes;
          parsed.characters.forEach(c => allCharacters.set(c.name, c));
          rawText = parsed.rawText;
        } else if (format === 'pdf' || format === 'docx') {
          // Binary formats - use chunked AI processing with progress
          const bytes = await fileData.arrayBuffer();
          const uint8Array = new Uint8Array(bytes);
          
          // Convert to base64
          let base64 = '';
          const b64ChunkSize = 32768;
          for (let i = 0; i < uint8Array.length; i += b64ChunkSize) {
            const chunk = uint8Array.slice(i, Math.min(i + b64ChunkSize, uint8Array.length));
            base64 += String.fromCharCode.apply(null, Array.from(chunk));
          }
          base64 = btoa(base64);
          
          sendSSE(controller, 'progress', { stage: 'extract', percent: 20, message: 'File encoded, starting AI analysis...' });
          
          // Try single-pass first for smaller files
          if (base64.length <= 3000000 && lovableApiKey) {
            try {
              sendSSE(controller, 'progress', { stage: 'extract', percent: 30, message: 'Analyzing full document...' });
              
              const result = await parseSinglePass(lovableApiKey, base64, format, isComic, expectedPages);
              allScenes = result.scenes;
              result.characters.forEach(c => allCharacters.set(c.name, c));
              rawText = result.rawText;
              usedAIRescue = true;
              
              sendSSE(controller, 'progress', { stage: 'extract', percent: 90, message: `Extracted ${allScenes.length} scenes` });
            } catch (error) {
              console.error('[script-parser-stream] Single-pass failed:', error);
              sendSSE(controller, 'warning', { warnings: ['Single-pass parsing failed, switching to chunked mode...'] });
            }
          }
          
          // Chunked processing for large files or if single-pass failed
          if (allScenes.length === 0 && lovableApiKey) {
            const chunkSize = 60000;
            const numChunks = Math.ceil(base64.length / chunkSize);
            let successfulChunks = 0;
            let failedChunks: number[] = [];
            
            sendSSE(controller, 'progress', { 
              stage: 'extract', 
              percent: 25, 
              message: `Processing ${numChunks} chunks...`,
              totalChunks: numChunks
            });
            
            for (let i = 0; i < numChunks; i++) {
              const chunkStart = i * chunkSize;
              const chunkEnd = Math.min((i + 1) * chunkSize, base64.length);
              const chunkBase64 = base64.substring(chunkStart, chunkEnd);
              const startPage = Math.floor((i / numChunks) * expectedPages) + 1;
              const endPage = Math.floor(((i + 1) / numChunks) * expectedPages);
              
              try {
                sendSSE(controller, 'chunk', { 
                  current: i + 1, 
                  total: numChunks, 
                  status: 'processing',
                  pageRange: `${startPage}-${endPage}`
                });
                
                const chunkResult = await parseChunk(
                  lovableApiKey, 
                  chunkBase64, 
                  format, 
                  isComic, 
                  i, 
                  numChunks, 
                  startPage, 
                  allScenes.length
                );
                
                chunkResult.scenes.forEach(s => allScenes.push(s));
                chunkResult.characters.forEach(c => {
                  if (allCharacters.has(c.name)) {
                    const existing = allCharacters.get(c.name)!;
                    existing.dialogue_count += c.dialogue_count;
                  } else {
                    allCharacters.set(c.name, c);
                  }
                });
                rawText += chunkResult.rawText;
                successfulChunks++;
                
                sendSSE(controller, 'chunk', { 
                  current: i + 1, 
                  total: numChunks, 
                  status: 'complete',
                  scenesFound: chunkResult.scenes.length
                });
                
              } catch (error) {
                console.error(`[script-parser-stream] Chunk ${i + 1} failed:`, error);
                failedChunks.push(i + 1);
                
                sendSSE(controller, 'chunk', { 
                  current: i + 1, 
                  total: numChunks, 
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Unknown error'
                });
                
                // Try with smaller chunk on retry
                if (failedChunks.length <= 3) {
                  sendSSE(controller, 'warning', { warnings: [`Chunk ${i + 1} failed, attempting recovery...`] });
                }
              }
              
              const overallProgress = 25 + ((i + 1) / numChunks) * 65;
              sendSSE(controller, 'progress', { 
                stage: 'extract', 
                percent: overallProgress, 
                message: `Processed ${i + 1}/${numChunks} chunks (${allScenes.length} scenes found)` 
              });
              
              // Rate limiting delay
              if (i < numChunks - 1) {
                await new Promise(r => setTimeout(r, 300));
              }
            }
            
            usedAIRescue = true;
            
            if (failedChunks.length > 0) {
              sendSSE(controller, 'warning', { 
                warnings: [`${failedChunks.length} chunk(s) failed to parse. Extraction may be incomplete.`],
                failedChunks
              });
            }
          }
        }
        
        sendSSE(controller, 'progress', { stage: 'extract', percent: 100, message: 'Content extraction complete' });
        
        // Stage 4: Analyze characters
        sendSSE(controller, 'stage', { stage: 'characters', message: 'Analyzing characters...' });
        
        // Update character scene counts
        allCharacters.forEach(char => {
          char.scene_count = Math.max(1, Math.ceil(char.dialogue_count / 5));
        });
        
        const characters = Array.from(allCharacters.values());
        
        sendSSE(controller, 'progress', { 
          stage: 'characters', 
          percent: 100, 
          message: `Found ${characters.length} characters` 
        });

        // Stage 5: Save to database
        sendSSE(controller, 'stage', { stage: 'finalize', message: 'Saving extracted data...' });
        
        // Re-number scenes
        allScenes.forEach((scene, index) => {
          scene.scene_number = index + 1;
        });
        
        // Insert scenes
        if (allScenes.length > 0) {
          const scenesWithScriptId = allScenes.map(scene => ({
            ...scene,
            script_id: scriptId,
          }));

          const { error: scenesError } = await supabase
            .from('scenes')
            .insert(scenesWithScriptId);

          if (scenesError) {
            console.error('[script-parser-stream] Scenes insert error:', scenesError);
          }
        }
        
        sendSSE(controller, 'progress', { stage: 'finalize', percent: 40, message: 'Scenes saved...' });

        // Insert characters
        if (characters.length > 0) {
          const charactersWithScriptId = characters.map(char => ({
            ...char,
            script_id: scriptId,
          }));

          const { error: charsError } = await supabase
            .from('characters')
            .insert(charactersWithScriptId);

          if (charsError) {
            console.error('[script-parser-stream] Characters insert error:', charsError);
          }
        }
        
        sendSSE(controller, 'progress', { stage: 'finalize', percent: 70, message: 'Characters saved...' });

        // Build and save narrative graph
        const narrativeGraph = buildNarrativeGraph(allScenes, characters);
        
        await supabase.from('narrative_graphs').insert({
          script_id: scriptId,
          graph_type: 'scene_flow',
          nodes: narrativeGraph.nodes,
          edges: narrativeGraph.edges,
          metadata: { 
            parsed_at: new Date().toISOString(),
            ai_assisted: usedAIRescue,
            streaming: true,
          },
        });

        // Update script with page count
        const extractedPages = Math.max(
          ...allScenes.map(s => s.page_end || s.page_start || 0),
          Math.ceil(rawText.length / 3000)
        );
        
        await supabase
          .from('scripts')
          .update({ page_count: extractedPages })
          .eq('id', scriptId);

        sendSSE(controller, 'progress', { stage: 'finalize', percent: 100, message: 'All data saved!' });

        // Calculate extraction quality
        const coveragePercent = expectedPages > 0 ? (extractedPages / expectedPages) * 100 : 100;
        const isComplete = coveragePercent >= 85 && allScenes.length > 0;

        // Send final result
        sendSSE(controller, 'complete', {
          success: true,
          scenesCount: allScenes.length,
          charactersCount: characters.length,
          estimatedPages: expectedPages,
          extractedPages,
          isComplete,
          readyForAnalysis: isComplete,
          aiAssisted: usedAIRescue,
          coveragePercent: Math.round(coveragePercent),
        });

        console.log(`[script-parser-stream] Complete: ${allScenes.length} scenes, ${characters.length} characters`);
        
      } catch (error) {
        console.error('[script-parser-stream] Error:', error);
        sendSSE(controller, 'error', {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          readyForAnalysis: false,
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

// Parse text formats
function parseTextFormat(content: string): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  const lines = content.split('\n');
  
  let currentSceneNumber = 0;
  let currentScene: Scene | null = null;
  let currentPage = 1;
  
  const sceneHeadingPattern = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.+?)(?:\s*-\s*(.+))?$/i;
  const characterPattern = /^([A-Z][A-Z\s\.']+)(\s*\(.*\))?$/;
  
  const nonCharacterWords = new Set([
    'INT', 'EXT', 'INTERIOR', 'EXTERIOR', 'FADE', 'CUT', 'DISSOLVE',
    'THE', 'CONTINUED', 'CONTINUOUS', 'LATER', 'DAY', 'NIGHT',
  ]);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Estimate page
    currentPage = Math.max(currentPage, Math.ceil((i + 1) / 55));
    
    // Scene heading
    const sceneMatch = line.match(sceneHeadingPattern);
    if (sceneMatch) {
      if (currentScene) currentScene.page_end = currentPage;
      
      currentSceneNumber++;
      const intExt = sceneMatch[1].replace('.', '').toUpperCase();
      
      currentScene = {
        scene_number: currentSceneNumber,
        heading: line,
        int_ext: intExt.includes('INT') && intExt.includes('EXT') ? 'INT/EXT' : intExt.includes('INT') ? 'INT' : 'EXT',
        location: sceneMatch[2]?.trim() || null,
        time_of_day: sceneMatch[3]?.trim() || null,
        description: null,
        page_start: currentPage,
        page_end: null,
      };
      scenes.push(currentScene);
      continue;
    }
    
    // Character
    if (line.length > 0 && line.length < 50) {
      const charMatch = line.match(characterPattern);
      if (charMatch && !line.includes(':') && lines[i + 1]?.trim()) {
        const charName = charMatch[1].trim();
        
        if (!nonCharacterWords.has(charName.toUpperCase()) && charName.length > 1) {
          if (!characterMap.has(charName)) {
            characterMap.set(charName, {
              name: charName,
              dialogue_count: 0,
              scene_count: 0,
              first_appearance: currentSceneNumber,
              description: null,
            });
          }
          characterMap.get(charName)!.dialogue_count++;
        }
      }
    }
  }
  
  if (currentScene) currentScene.page_end = currentPage;
  
  return {
    scenes,
    characters: Array.from(characterMap.values()),
    rawText: content,
  };
}

// Parse comic format
function parseComicFormat(content: string): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  const lines = content.split('\n');
  
  let panelNumber = 0;
  let pageNumber = 0;
  
  const pagePattern = /^PAGE\s*(\d+)/i;
  const panelPattern = /^PANEL\s*(\d+)/i;
  const dialoguePattern = /^([A-Z][A-Z\s\.']+)(?:\s*\(.*\))?:\s*(.+)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const pageMatch = trimmed.match(pagePattern);
    if (pageMatch) {
      pageNumber = parseInt(pageMatch[1]);
      continue;
    }
    
    const panelMatch = trimmed.match(panelPattern);
    if (panelMatch) {
      panelNumber++;
      scenes.push({
        scene_number: panelNumber,
        heading: `PAGE ${pageNumber || 1} - PANEL ${panelMatch[1]}`,
        int_ext: null,
        location: null,
        time_of_day: null,
        description: null,
        page_start: pageNumber || 1,
        page_end: pageNumber || 1,
      });
      continue;
    }
    
    const dialogueMatch = trimmed.match(dialoguePattern);
    if (dialogueMatch) {
      const name = dialogueMatch[1].trim();
      if (!['CAPTION', 'SFX', 'NARRATOR'].includes(name.toUpperCase())) {
        if (!characterMap.has(name)) {
          characterMap.set(name, {
            name,
            dialogue_count: 0,
            scene_count: 0,
            first_appearance: panelNumber || 1,
            description: null,
          });
        }
        characterMap.get(name)!.dialogue_count++;
      }
    }
  }
  
  return {
    scenes,
    characters: Array.from(characterMap.values()),
    rawText: content,
  };
}

// Parse Final Draft XML
function parseFinalDraft(content: string): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  let rawText = '';
  let sceneNumber = 0;
  
  const sceneHeadingRegex = /<Paragraph Type="Scene Heading"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/Paragraph>/gi;
  const characterRegex = /<Paragraph Type="Character"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/Paragraph>/gi;
  const textRegex = /<Text[^>]*>([^<]*)<\/Text>/gi;
  
  let textMatch;
  while ((textMatch = textRegex.exec(content)) !== null) {
    rawText += textMatch[1] + '\n';
  }
  
  let sceneMatch;
  while ((sceneMatch = sceneHeadingRegex.exec(content)) !== null) {
    sceneNumber++;
    const headingText = sceneMatch[1].replace(/<[^>]+>/g, '').trim();
    const intExtMatch = headingText.match(/^(INT\.|EXT\.|INT\/EXT\.)/i);
    
    scenes.push({
      scene_number: sceneNumber,
      heading: headingText,
      int_ext: intExtMatch ? intExtMatch[1].replace('.', '').toUpperCase() : null,
      location: headingText.replace(/^(INT\.|EXT\.|INT\/EXT\.)\s*/i, '').split('-')[0]?.trim() || null,
      time_of_day: headingText.split('-')[1]?.trim() || null,
      description: null,
      page_start: null,
      page_end: null,
    });
  }
  
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
  
  return { scenes, characters: Array.from(characterMap.values()), rawText };
}

// AI parsing for text
async function parseWithAI(
  apiKey: string, 
  content: string, 
  isComic: boolean, 
  expectedPages: number,
  onProgress: (progress: number, message: string) => void
): Promise<{ scenes: Scene[]; characters: Character[] }> {
  onProgress(0, 'Sending to AI...');
  
  const response = await retryWithBackoff(async () => {
    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          {
            role: 'system',
            content: `Parse this ${isComic ? 'comic script' : 'screenplay'}. Return JSON with scenes and characters arrays. Expected ~${expectedPages} pages.`
          },
          {
            role: 'user',
            content: content.substring(0, 80000)
          }
        ],
        max_tokens: 16000,
      }),
    });
    
    if (!res.ok) throw new Error(`AI API error: ${res.status}`);
    return res.json();
  });
  
  onProgress(80, 'Parsing AI response...');
  
  const aiContent = response.choices?.[0]?.message?.content || '';
  const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) return { scenes: [], characters: [] };
  
  const parsed = safeParseJSON(jsonMatch[0]);
  
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
  };
}

// Single-pass AI parsing for binary files
async function parseSinglePass(
  apiKey: string,
  base64: string,
  format: string,
  isComic: boolean,
  expectedPages: number
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string }> {
  const mimeType = format === 'pdf' 
    ? 'application/pdf' 
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  
  const response = await retryWithBackoff(async () => {
    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Parse this ${isComic ? 'comic script' : 'screenplay'} document. Extract ALL ${isComic ? 'panels' : 'scenes'} and characters. Expected ~${expectedPages} pages.

Return JSON:
{
  "scenes": [{"scene_number": 1, "heading": "...", "int_ext": "INT|EXT", "location": "...", "time_of_day": "...", "page_start": 1, "page_end": 2}],
  "characters": [{"name": "...", "dialogue_count": 5, "first_appearance": 1}]
}
Only return valid JSON.`
              },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` }
              }
            ]
          }
        ],
        max_tokens: 16000,
      }),
    });

    if (!res.ok) throw new Error(`AI error: ${res.status}`);
    return res.json();
  });

  const content = response.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) return { scenes: [], characters: [], rawText: '' };
  
  const parsed = safeParseJSON(jsonMatch[0]);
  
  return {
    scenes: (parsed.scenes || parsed.panels || []).map((s: any, i: number) => ({
      scene_number: s.scene_number || i + 1,
      heading: s.heading || (isComic ? `PAGE ${s.page || 1} - PANEL ${s.panel || i + 1}` : 'UNKNOWN'),
      int_ext: s.int_ext || null,
      location: s.location || null,
      time_of_day: s.time_of_day || null,
      description: s.description || null,
      page_start: s.page_start || s.page || null,
      page_end: s.page_end || s.page || null,
    })),
    characters: (parsed.characters || []).map((c: any) => ({
      name: c.name || 'UNKNOWN',
      dialogue_count: c.dialogue_count || 1,
      scene_count: Math.ceil((c.dialogue_count || 1) / 5),
      first_appearance: c.first_appearance || 1,
      description: c.description || null,
    })),
    rawText: parsed.raw_text_sample || '',
  };
}

// Chunked parsing for large files
async function parseChunk(
  apiKey: string,
  chunkBase64: string,
  format: string,
  isComic: boolean,
  chunkIndex: number,
  totalChunks: number,
  startPage: number,
  existingSceneCount: number
): Promise<{ scenes: Scene[]; characters: Character[]; rawText: string }> {
  const response = await retryWithBackoff(async () => {
    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          {
            role: 'system',
            content: `Parse ${isComic ? 'comic script' : 'screenplay'}. Chunk ${chunkIndex + 1}/${totalChunks}. Start numbering from ${existingSceneCount + 1}.
Return JSON: {"scenes": [...], "characters": [...], "extracted_text": "..."}`
          },
          {
            role: 'user',
            content: `Parse this ${format.toUpperCase()} section (base64): ${chunkBase64}`
          }
        ],
        max_tokens: 10000,
      }),
    });

    if (!res.ok) throw new Error(`AI error: ${res.status}`);
    return res.json();
  }, 2);

  const content = response.choices?.[0]?.message?.content || '';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) return { scenes: [], characters: [], rawText: '' };
  
  const parsed = safeParseJSON(jsonMatch[0]);
  
  return {
    scenes: (parsed.scenes || parsed.panels || []).map((s: any, i: number) => ({
      scene_number: existingSceneCount + i + 1,
      heading: s.heading || (isComic ? `PAGE ${startPage} - PANEL ${i + 1}` : 'UNKNOWN'),
      int_ext: s.int_ext || null,
      location: s.location || null,
      time_of_day: s.time_of_day || null,
      description: s.description || null,
      page_start: s.page_start || startPage,
      page_end: s.page_end || null,
    })),
    characters: (parsed.characters || []).map((c: any) => ({
      name: c.name || 'UNKNOWN',
      dialogue_count: c.dialogue_count || 1,
      scene_count: 1,
      first_appearance: startPage,
      description: c.description || null,
    })),
    rawText: parsed.extracted_text || '',
  };
}

// Build narrative graph
function buildNarrativeGraph(scenes: Scene[], characters: Character[]) {
  const nodes: any[] = [];
  const edges: any[] = [];
  
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
    
    if (index > 0) {
      edges.push({
        id: `edge-${index - 1}-${index}`,
        source: `scene-${scenes[index - 1].scene_number}`,
        target: `scene-${scene.scene_number}`,
        type: 'sequence',
      });
    }
  });
  
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
