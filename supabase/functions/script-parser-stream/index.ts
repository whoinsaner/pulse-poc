import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import JSZip from "https://esm.sh/jszip@3.10.1";
// Note: pdf-parse removed - uses Node fs.readFileSync which crashes Deno
// Using pdfjs-dist instead with proper Deno compatibility

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

// ============= TEXT EXTRACTION =============

// Extract text from PDF using regex-based extraction (Deno compatible)
// This doesn't rely on Node.js built-ins like fs.readFileSync
async function extractPDFText(arrayBuffer: ArrayBuffer): Promise<{ text: string; pageCount: number; success: boolean; error?: string }> {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Decode PDF content as text (lossy for binary, but we extract readable parts)
    const decoder = new TextDecoder('latin1', { fatal: false });
    const rawContent = decoder.decode(uint8Array);
    
    // Count pages from PDF structure
    const pageMatches = rawContent.match(/\/Type\s*\/Page[^s]/g);
    const pageCount = pageMatches ? pageMatches.length : 1;
    
    // Extract text from PDF streams
    const textParts: string[] = [];
    
    // Method 1: Extract from BT...ET text blocks (PDF text operators)
    const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
    let btMatch;
    while ((btMatch = btEtRegex.exec(rawContent)) !== null) {
      const block = btMatch[1];
      // Extract text from Tj, TJ, ', " operators
      const textMatches = block.match(/\(([^)]*)\)\s*(?:Tj|'|")/g);
      if (textMatches) {
        for (const tm of textMatches) {
          const inner = tm.match(/\(([^)]*)\)/);
          if (inner && inner[1]) {
            // Decode PDF escape sequences
            let decoded = inner[1]
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, '\r')
              .replace(/\\t/g, '\t')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')')
              .replace(/\\\\/g, '\\');
            if (decoded.length > 0) {
              textParts.push(decoded);
            }
          }
        }
      }
      
      // Also extract from TJ arrays: [(text) num (text) ...]
      const tjArrayRegex = /\[((?:\([^)]*\)|[^\]]+)*)\]\s*TJ/gi;
      let tjMatch;
      while ((tjMatch = tjArrayRegex.exec(block)) !== null) {
        const tjContent = tjMatch[1];
        const stringMatches = tjContent.match(/\(([^)]*)\)/g);
        if (stringMatches) {
          for (const sm of stringMatches) {
            const inner = sm.match(/\(([^)]*)\)/);
            if (inner && inner[1]) {
              textParts.push(inner[1].replace(/\\\(/g, '(').replace(/\\\)/g, ')'));
            }
          }
        }
      }
    }
    
    // Method 2: Extract from stream content (decompressed streams have plain text)
    const streamRegex = /stream\s*\n?([\s\S]*?)\n?\s*endstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(rawContent)) !== null) {
      const streamContent = streamMatch[1];
      // Check if stream looks like text content (has readable chars)
      const readableText = streamContent
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Only include if it has substantial readable content with words
      if (readableText.length > 50 && readableText.match(/[a-zA-Z]{3,}/)) {
        // Filter out PDF operators and keep likely content
        const filtered = readableText
          .replace(/\b(BT|ET|Tj|TJ|Tm|Td|Tf|Tc|Tw|Tz|TL|Tr|Ts)\b/g, '')
          .replace(/\b\d+(\.\d+)?\s+\d+(\.\d+)?\s+(Td|TD|Tm|cm|re|m|l|c|v|y|h|W|n|q|Q|BDC|EMC)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (filtered.length > 30) {
          textParts.push(filtered);
        }
      }
    }
    
    // Combine and clean
    let combinedText = textParts.join(' ');
    
    // If BT/ET extraction worked, try to reconstruct lines
    if (textParts.length > 10) {
      // Try to reconstruct lines by looking for capitals following lowercase (sentence breaks)
      combinedText = combinedText
        .replace(/([a-z])([A-Z])/g, '$1\n$2')
        .replace(/(\.)([A-Z])/g, '$1\n$2');
    }
    
    // Clean up final text
    combinedText = combinedText
      .replace(/\s+/g, ' ')
      .replace(/\n +/g, '\n')
      .replace(/ +\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    console.log(`[script-parser-stream] PDF text extraction: ${pageCount} pages, ${combinedText.length} chars extracted`);
    
    if (combinedText.length > 500) {
      return {
        text: combinedText,
        pageCount,
        success: true,
      };
    }
    
    // Not enough text extracted - likely scanned/image-based PDF
    return {
      text: combinedText,
      pageCount,
      success: false,
      error: 'PDF appears to be scanned or image-based. Limited text extracted.',
    };
    
  } catch (error) {
    console.error('[script-parser-stream] PDF extraction error:', error);
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'PDF extraction failed',
    };
  }
}

// Extract text from DOCX by parsing XML
async function extractDOCXText(arrayBuffer: ArrayBuffer): Promise<{ text: string; success: boolean; error?: string }> {
  try {
    const zip = new JSZip();
    await zip.loadAsync(arrayBuffer);
    
    // DOCX stores content in word/document.xml
    const documentXml = await zip.file('word/document.xml')?.async('string');
    
    if (!documentXml) {
      throw new Error('No document.xml found in DOCX');
    }
    
    // Extract text from XML
    const textParts: string[] = [];
    
    // Match paragraph content
    const paragraphRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    
    let pMatch;
    while ((pMatch = paragraphRegex.exec(documentXml)) !== null) {
      const paragraph = pMatch[1];
      const texts: string[] = [];
      
      let tMatch;
      while ((tMatch = textRegex.exec(paragraph)) !== null) {
        texts.push(tMatch[1]);
      }
      
      if (texts.length > 0) {
        textParts.push(texts.join(''));
      } else {
        // Empty paragraph = line break
        textParts.push('');
      }
    }
    
    console.log(`[script-parser-stream] DOCX extracted: ${textParts.length} paragraphs`);
    
    return {
      text: textParts.join('\n'),
      success: true,
    };
  } catch (error) {
    console.error('[script-parser-stream] DOCX extraction error:', error);
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'DOCX extraction failed',
    };
  }
}

// ============= FOUNTAIN NORMALIZATION =============

// Normalize extracted text to Fountain format for better parsing
function normalizeToFountain(rawText: string, isComic: boolean): { 
  fountainText: string; 
  quality: 'good' | 'fair' | 'poor';
  scenesDetected: number;
  charactersDetected: number;
} {
  const lines = rawText.split('\n');
  const normalizedLines: string[] = [];
  let quality: 'good' | 'fair' | 'poor' = 'fair';
  let scenesDetected = 0;
  let charactersDetected = 0;
  const characterNames = new Set<string>();
  
  // Scene heading patterns
  const sceneHeadingPattern = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*.+/i;
  const looseScenePattern = /^(INTERIOR|EXTERIOR|INT|EXT)[\s\.\/:-]+(.+)/i;
  
  // Character patterns (ALL CAPS followed by dialogue)
  const characterCuePattern = /^([A-Z][A-Z\s\.']{2,})$/;
  const dialogueFollowsPattern = /^[a-z]/; // Dialogue typically starts lowercase or mixed
  
  // Comic patterns
  const pagePattern = /^(PAGE|PG)[\s#.:]*(\d+)/i;
  const panelPattern = /^(PANEL|PNL)[\s#.:]*(\d+)/i;
  
  // Non-character words to filter
  const nonCharacterWords = new Set([
    'INT', 'EXT', 'INTERIOR', 'EXTERIOR', 'FADE', 'CUT', 'DISSOLVE',
    'THE', 'CONTINUED', 'CONTINUOUS', 'LATER', 'DAY', 'NIGHT', 'MORNING',
    'EVENING', 'DUSK', 'DAWN', 'SAME', 'TRANSITION', 'TITLE', 'SUPER',
    'INSERT', 'ANGLE', 'CLOSE', 'WIDE', 'MEDIUM', 'POV', 'BACK', 'SMASH',
    'MATCH', 'JUMP', 'TIME', 'CUT TO', 'FADE TO', 'FADE IN', 'FADE OUT',
  ]);
  
  let lastWasCharacter = false;
  let lastCharacterName = '';
  let inDialogue = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = lines[i + 1]?.trim() || '';
    
    // Skip empty lines but preserve them
    if (!trimmed) {
      normalizedLines.push('');
      lastWasCharacter = false;
      inDialogue = false;
      continue;
    }
    
    // Handle comic format
    if (isComic) {
      const pageMatch = trimmed.match(pagePattern);
      if (pageMatch) {
        normalizedLines.push(`\nPAGE ${pageMatch[2]}\n`);
        scenesDetected++;
        continue;
      }
      
      const panelMatch = trimmed.match(panelPattern);
      if (panelMatch) {
        normalizedLines.push(`\nPANEL ${panelMatch[2]}`);
        continue;
      }
      
      // Comic dialogue format: CHARACTER: dialogue
      const comicDialogueMatch = trimmed.match(/^([A-Z][A-Z\s\.']+):\s*(.+)/);
      if (comicDialogueMatch) {
        const name = comicDialogueMatch[1].trim();
        if (!nonCharacterWords.has(name)) {
          characterNames.add(name);
          normalizedLines.push(`\n${name}`);
          normalizedLines.push(comicDialogueMatch[2]);
        }
        continue;
      }
    }
    
    // Check for scene heading
    if (sceneHeadingPattern.test(trimmed)) {
      // Already properly formatted
      normalizedLines.push('');
      normalizedLines.push(trimmed.toUpperCase());
      normalizedLines.push('');
      scenesDetected++;
      lastWasCharacter = false;
      inDialogue = false;
      continue;
    }
    
    // Check for loose scene pattern and normalize
    const looseMatch = trimmed.match(looseScenePattern);
    if (looseMatch) {
      const intExt = looseMatch[1].toUpperCase().startsWith('INT') ? 'INT.' : 'EXT.';
      const location = looseMatch[2].trim().toUpperCase();
      normalizedLines.push('');
      normalizedLines.push(`${intExt} ${location}`);
      normalizedLines.push('');
      scenesDetected++;
      lastWasCharacter = false;
      inDialogue = false;
      continue;
    }
    
    // Check for character cue (ALL CAPS, followed by text on next line)
    if (characterCuePattern.test(trimmed) && trimmed.length < 40) {
      const potentialName = trimmed.replace(/\s*\(.*\)$/, '').trim();
      
      if (!nonCharacterWords.has(potentialName) && potentialName.length > 1) {
        // Check if next line looks like dialogue
        if (nextLine && !sceneHeadingPattern.test(nextLine) && !characterCuePattern.test(nextLine)) {
          characterNames.add(potentialName);
          normalizedLines.push('');
          normalizedLines.push(trimmed); // Character name as-is
          lastWasCharacter = true;
          lastCharacterName = potentialName;
          inDialogue = false;
          continue;
        }
      }
    }
    
    // Check for parenthetical
    if (trimmed.startsWith('(') && trimmed.endsWith(')') && lastWasCharacter) {
      normalizedLines.push(trimmed);
      continue;
    }
    
    // Regular line - could be action or dialogue
    if (lastWasCharacter) {
      // This is dialogue
      normalizedLines.push(trimmed);
      inDialogue = true;
      lastWasCharacter = false;
    } else if (inDialogue && trimmed.length < 60 && !trimmed.includes('  ')) {
      // Continuation of dialogue (no double space, reasonable length)
      normalizedLines.push(trimmed);
    } else {
      // Action line
      normalizedLines.push(trimmed);
      inDialogue = false;
    }
    
    lastWasCharacter = false;
  }
  
  charactersDetected = characterNames.size;
  
  // Determine quality
  if (scenesDetected >= 10 && charactersDetected >= 3) {
    quality = 'good';
  } else if (scenesDetected >= 3 || charactersDetected >= 2) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }
  
  console.log(`[script-parser-stream] Fountain normalization: ${scenesDetected} scenes, ${charactersDetected} characters, quality: ${quality}`);
  
  return {
    fountainText: normalizedLines.join('\n'),
    quality,
    scenesDetected,
    charactersDetected,
  };
}

// ============= JSON UTILITIES =============

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

// ============= VALIDATION & UTILITIES =============

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
    recommendations.push('Text extraction enabled for DOCX - faster and more reliable than AI vision.');
  }
  
  if (format === 'pdf') {
    recommendations.push('Text extraction enabled for PDF - works best with digital PDFs (not scanned).');
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

// ============= MAIN SERVER =============

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { scriptId, format, filePath, scriptType } = await req.json() as ParseRequest;
  
  console.log(`[script-parser-stream] Starting SSE parse for script ${scriptId}, format: ${format}`);

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
        let extractionMethod = 'regex';
        
        if (['fountain', 'highland', 'txt'].includes(format)) {
          // Text-based formats - parse directly
          const textContent = await fileData.text();
          rawText = textContent;
          
          sendSSE(controller, 'progress', { stage: 'extract', percent: 50, message: 'Parsing text content...' });
          
          const parsed = isComic ? parseComicFormat(textContent) : parseTextFormat(textContent);
          allScenes = parsed.scenes;
          parsed.characters.forEach(c => allCharacters.set(c.name, c));
          extractionMethod = 'regex';
          
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
              extractionMethod = 'ai';
            }
          }
          
        } else if (format === 'fdx') {
          // Final Draft XML
          const fdxContent = await fileData.text();
          const parsed = parseFinalDraft(fdxContent);
          allScenes = parsed.scenes;
          parsed.characters.forEach(c => allCharacters.set(c.name, c));
          rawText = parsed.rawText;
          extractionMethod = 'fdx-xml';
          
        } else if (format === 'pdf' || format === 'docx') {
          // Binary formats - NEW: Use text extraction first!
          const bytes = await fileData.arrayBuffer();
          
          sendSSE(controller, 'progress', { stage: 'extract', percent: 15, message: 'Extracting text from document...' });
          
          let extractedText = '';
          let extractionSuccess = false;
          
          if (format === 'pdf') {
            const pdfResult = await extractPDFText(bytes);
            if (pdfResult.success && pdfResult.text.length > 500) {
              extractedText = pdfResult.text;
              extractionSuccess = true;
              sendSSE(controller, 'progress', { 
                stage: 'extract', 
                percent: 30, 
                message: `Extracted text from ${pdfResult.pageCount} PDF pages` 
              });
            } else if (pdfResult.error) {
              sendSSE(controller, 'warning', { 
                warnings: [pdfResult.error],
                recommendations: ['Will attempt AI-based extraction as fallback.']
              });
            }
          } else if (format === 'docx') {
            const docxResult = await extractDOCXText(bytes);
            if (docxResult.success && docxResult.text.length > 500) {
              extractedText = docxResult.text;
              extractionSuccess = true;
              sendSSE(controller, 'progress', { 
                stage: 'extract', 
                percent: 30, 
                message: 'Extracted text from DOCX document' 
              });
            } else if (docxResult.error) {
              sendSSE(controller, 'warning', { 
                warnings: [docxResult.error],
                recommendations: ['Will attempt AI-based extraction as fallback.']
              });
            }
          }
          
          // If text extraction succeeded, normalize to Fountain and parse
          if (extractionSuccess && extractedText.length > 0) {
            sendSSE(controller, 'progress', { stage: 'extract', percent: 40, message: 'Normalizing to Fountain format...' });
            
            const normalized = normalizeToFountain(extractedText, isComic);
            rawText = normalized.fountainText;
            
            sendSSE(controller, 'progress', { 
              stage: 'extract', 
              percent: 50, 
              message: `Normalized: detected ${normalized.scenesDetected} scenes, ${normalized.charactersDetected} characters` 
            });
            
            // Parse the normalized Fountain text
            sendSSE(controller, 'progress', { stage: 'extract', percent: 60, message: 'Parsing screenplay elements...' });
            
            const parsed = isComic ? parseComicFormat(normalized.fountainText) : parseTextFormat(normalized.fountainText);
            allScenes = parsed.scenes;
            parsed.characters.forEach(c => allCharacters.set(c.name, c));
            extractionMethod = 'text-extraction';
            
            // If parsing quality is poor, use AI to enhance
            if (normalized.quality === 'poor' && lovableApiKey) {
              sendSSE(controller, 'progress', { stage: 'extract', percent: 70, message: 'Using AI to improve extraction...' });
              
              // Use extracted text (not base64!) for AI enhancement
              const aiResult = await parseWithAI(lovableApiKey, extractedText, isComic, expectedPages, (progress, message) => {
                sendSSE(controller, 'progress', { stage: 'extract', percent: 70 + (progress * 0.2), message });
              });
              
              if (aiResult.scenes.length > allScenes.length) {
                allScenes = aiResult.scenes;
                allCharacters = new Map(aiResult.characters.map(c => [c.name, c]));
                usedAIRescue = true;
                extractionMethod = 'text-extraction+ai';
              }
            }
            
            sendSSE(controller, 'progress', { stage: 'extract', percent: 90, message: `Extracted ${allScenes.length} scenes` });
            
          } else {
            // Text extraction failed - likely scanned/image-based PDF requiring OCR
            // Instead of using expensive AI vision, halt and ask user to upload text format
            console.log('[script-parser-stream] Text extraction failed, halting - OCR not supported');
            
            sendSSE(controller, 'error', { 
              code: 'OCR_REQUIRED',
              message: 'This PDF appears to be scanned or image-based. Text extraction failed.',
              recommendations: [
                'Please upload a text-based PDF (created digitally, not scanned)',
                'Or export your script as DOCX, Fountain (.fountain), or plain text (.txt)',
                'Final Draft (.fdx) format is also supported'
              ]
            });
            
            // Close the stream with an error result
            sendSSE(controller, 'result', {
              success: false,
              scenes: 0,
              characters: 0,
              error: 'OCR_REQUIRED',
              message: 'Cannot parse scanned/image PDFs. Please upload a text-based format.',
              extractionMethod: 'failed'
            });
            
            controller.close();
            return;
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
            extraction_method: extractionMethod,
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
          extractionMethod,
          coveragePercent: Math.round(coveragePercent),
        });

        console.log(`[script-parser-stream] Complete: ${allScenes.length} scenes, ${characters.length} characters, method: ${extractionMethod}`);
        
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

// ============= PARSING FUNCTIONS =============

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

// ============= AI PARSING FUNCTIONS =============

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
        max_completion_tokens: 16000,
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

// Single-pass AI parsing for binary files (fallback)
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
        max_completion_tokens: 16000,
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

// Chunked parsing for large files (fallback)
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
        max_completion_tokens: 10000,
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

// ============= GRAPH BUILDING =============

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
