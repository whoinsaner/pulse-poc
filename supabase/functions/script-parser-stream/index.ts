import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import JSZip from "https://esm.sh/jszip@3.10.1";
// Note: PDF.js not used due to Deno compatibility issues
// Using enhanced regex extraction + AI vision fallback for PDF text extraction

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

// Safe base64 encoding for large ArrayBuffers (avoids stack overflow)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // Process 8KB at a time to avoid stack overflow
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...chunk);
  }
  
  return btoa(binary);
}

// ============= TEXT EXTRACTION =============

// CPU yield helper - prevents CPU time exceeded errors by yielding control
async function cpuYield(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0));
}

// Note: PDF.js removed due to Deno/Edge Function compatibility issues
// The library requires web workers which aren't available in the Edge runtime
// Using enhanced regex extraction + AI vision fallback instead

// AI-powered PDF text extraction fallback using Lovable AI (for scanned/image PDFs)
async function extractTextWithAI(
  apiKey: string, 
  pdfBase64: string, 
  isComic: boolean,
  onProgress?: (message: string) => void
): Promise<{ text: string; success: boolean; error?: string }> {
  try {
    onProgress?.('Sending PDF to AI for text extraction...');
    
    const systemPrompt = isComic
      ? `You are a comic script text extractor. Extract ALL text from this PDF comic script.
Output the complete script text preserving:
- Page numbers (PAGE 1, PAGE 2, etc.)
- Panel descriptions (PANEL 1, PANEL 2, etc.)
- Character names in UPPERCASE before their dialogue
- All dialogue and captions
- Sound effects and action descriptions
Output ONLY the extracted text, no commentary.`
      : `You are a screenplay text extractor. Extract ALL text from this PDF screenplay.
Output the complete script text preserving:
- Scene headings (INT./EXT. LOCATION - TIME)
- Character names in UPPERCASE before dialogue
- All dialogue including parentheticals
- Action/description paragraphs
- Transitions (CUT TO, FADE OUT, etc.)
Output ONLY the extracted text, no commentary.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { 
                type: 'text', 
                text: 'Extract all text from this PDF script. Output ONLY the script text, preserving formatting.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 65000, // Increased from 16000 for better large PDF coverage
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[script-parser-stream] AI extraction failed:', response.status, errorText);
      
      if (response.status === 429) {
        return { text: '', success: false, error: 'Rate limit exceeded. Please try again in a moment.' };
      }
      if (response.status === 402) {
        return { text: '', success: false, error: 'AI credits exhausted. Please add credits to continue.' };
      }
      
      return { text: '', success: false, error: `AI extraction failed: ${response.status}` };
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';
    
    console.log(`[script-parser-stream] AI extraction complete: ${extractedText.length} chars`);
    
    if (extractedText.length > 200) {
      onProgress?.(`AI extracted ${extractedText.length} characters of text`);
      return { text: extractedText, success: true };
    }
    
    return { 
      text: extractedText, 
      success: false, 
      error: 'AI extraction returned insufficient text. PDF may be unsupported.' 
    };
    
  } catch (error) {
    console.error('[script-parser-stream] AI extraction error:', error);
    return { 
      text: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'AI extraction failed' 
    };
  }
}

// Chunked AI extraction for large scanned PDFs
async function extractTextWithAIChunked(
  apiKey: string,
  pdfBase64: string,
  totalPages: number,
  isComic: boolean,
  onProgress?: (message: string, pagesProcessed: number) => void
): Promise<{ text: string; success: boolean; pagesExtracted: number; error?: string }> {
  // For very large PDFs (50+ pages), we'd need to process in chunks
  // However, the Gemini model can handle reasonably large PDFs in one call
  // This function exists as a fallback for future chunking implementation
  
  console.log(`[script-parser-stream] Chunked AI extraction: ${totalPages} pages`);
  onProgress?.(`Starting AI extraction for ${totalPages} pages...`, 0);
  
  // For now, use single AI call with increased token limit
  const result = await extractTextWithAI(
    apiKey,
    pdfBase64,
    isComic,
    (msg) => onProgress?.(msg, totalPages)
  );
  
  return {
    text: result.text,
    success: result.success,
    pagesExtracted: result.success ? totalPages : 0,
    error: result.error
  };
}

// PyMuPDF-based PDF text extraction via external Python microservice (primary method)
async function extractPDFWithPython(
  pdfBytes: ArrayBuffer,
  onProgress?: (message: string) => void
): Promise<{ text: string; pageCount: number; success: boolean; error?: string }> {
  const serviceUrl = Deno.env.get('PDF_EXTRACTOR_URL');
  if (!serviceUrl) {
    console.log('[script-parser-stream] PDF_EXTRACTOR_URL not configured, skipping PyMuPDF extraction');
    return { text: '', pageCount: 0, success: false, error: 'Python extractor not configured' };
  }

  try {
    onProgress?.('Sending PDF to extraction service...');
    console.log(`[script-parser-stream] Calling PyMuPDF service at ${serviceUrl} (${(pdfBytes.byteLength / 1024).toFixed(0)}KB)`);

    const pdfBase64 = arrayBufferToBase64(pdfBytes);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdf_base64: pdfBase64 }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[script-parser-stream] PyMuPDF service error: ${response.status}`, errorText);
      return { text: '', pageCount: 0, success: false, error: `Service error: ${response.status}` };
    }

    const result = await response.json();
    const extractedText = result.text || '';
    const pageCount = result.page_count || 0;

    console.log(`[script-parser-stream] PyMuPDF extraction complete: ${extractedText.length} chars from ${pageCount} pages`);
    onProgress?.(`Extracted ${extractedText.length} chars from ${pageCount} pages`);

    return {
      text: extractedText,
      pageCount,
      success: extractedText.length > 500,
      error: extractedText.length <= 500 ? 'Insufficient text extracted by PyMuPDF' : undefined,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Python extraction failed';
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error(`[script-parser-stream] PyMuPDF extraction ${isTimeout ? 'timed out' : 'failed'}:`, errorMsg);
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: isTimeout ? 'Python extraction service timed out (30s)' : errorMsg,
    };
  }
}

// Legacy regex-based PDF text extraction (used as fallback when PyMuPDF and AI vision fail)
// This processes the PDF in chunks to avoid CPU time exceeded errors
async function extractPDFText(arrayBuffer: ArrayBuffer): Promise<{ text: string; pageCount: number; success: boolean; error?: string }> {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const fileSize = uint8Array.length;
    
    // Decode PDF content as text (lossy for binary, but we extract readable parts)
    const decoder = new TextDecoder('latin1', { fatal: false });
    const rawContent = decoder.decode(uint8Array);
    
    await cpuYield(); // Yield after decode
    
    // Count pages from PDF structure FIRST - this determines processing mode
    const pageMatches = rawContent.match(/\/Type\s*\/Page[^s]/g);
    const pageCount = pageMatches ? pageMatches.length : 1;
    
    // Use page count AND file size for large file detection
    // 30+ pages OR 500KB+ → use fast path to avoid CPU timeout
    const isLargeFile = fileSize > 500 * 1024 || pageCount > 30;
    
    console.log(`[script-parser-stream] Regex PDF extraction (fallback): ${(fileSize / 1024).toFixed(0)}KB, ${pageCount} pages, fast mode: ${isLargeFile}`);
    
    // NOTE: 50-page bailout removed - PDF.js handles large PDFs as primary method
    // This regex extraction is now only a fallback for edge cases
    
    // Extract text from PDF streams
    const textParts: string[] = [];
    
    // Scale iteration limits based on page count for large files
    const baseIterations = isLargeFile ? 300 : 1000;
    const maxIterations = Math.min(5000, baseIterations + (pageCount * 20));
    let iterations = 0;
    
    // Method 1: Extract from BT...ET text blocks (PDF text operators)
    // Use simpler regex for large files to reduce CPU usage
    if (isLargeFile) {
      // Fast path: simplified extraction for large PDFs
      // Split content into chunks to process incrementally
      const chunkSize = 100000; // 100KB chunks
      const chunks = Math.ceil(rawContent.length / chunkSize);
      
      for (let i = 0; i < chunks && iterations < maxIterations; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize + 1000, rawContent.length); // overlap for continuity
        const chunk = rawContent.slice(start, end);
        
        // Simple text extraction - look for parenthesized strings followed by Tj
        const simpleTextRegex = /\(([^()]{1,200})\)\s*Tj/gi;
        let match;
        while ((match = simpleTextRegex.exec(chunk)) !== null && iterations < maxIterations) {
          iterations++;
          const text = match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          if (text.length > 0 && text.match(/[a-zA-Z]/)) {
            textParts.push(text);
          }
        }
        
        // Also extract from TJ arrays (common in many PDFs)
        const tjArrayRegex = /\[((?:\([^)]*\)|[-\d.]+\s*)+)\]\s*TJ/gi;
        let tjMatch;
        while ((tjMatch = tjArrayRegex.exec(chunk)) !== null && iterations < maxIterations) {
          const stringMatches = tjMatch[1].match(/\(([^)]*)\)/g);
          if (stringMatches) {
            for (const sm of stringMatches.slice(0, 50)) { // Limit per array
              const inner = sm.match(/\(([^)]*)\)/);
              if (inner?.[1]) {
                const text = inner[1]
                  .replace(/\\n/g, '\n')
                  .replace(/\\r/g, '')
                  .replace(/\\\(/g, '(')
                  .replace(/\\\)/g, ')')
                  .replace(/\\\\/g, '\\');
                if (text.length > 0 && text.match(/[a-zA-Z]/)) {
                  textParts.push(text);
                  iterations++;
                }
              }
              if (iterations >= maxIterations) break;
            }
          }
        }
        
        // Yield every chunk to prevent CPU timeout
        if (i % 2 === 0) await cpuYield();
      }
      
      console.log(`[script-parser-stream] Fast-path extraction: ${iterations} iterations, ${textParts.length} text parts`);
      
    } else {
      // Standard path for smaller files - more thorough extraction
      const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
      let btMatch;
      
      while ((btMatch = btEtRegex.exec(rawContent)) !== null && iterations < maxIterations) {
        iterations++;
        const block = btMatch[1];
        
        // Extract text from Tj operator
        const textMatches = block.match(/\(([^)]*)\)\s*(?:Tj|'|")/g);
        if (textMatches) {
          for (const tm of textMatches.slice(0, 50)) { // Limit per block
            const inner = tm.match(/\(([^)]*)\)/);
            if (inner && inner[1]) {
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
        
        // TJ arrays - simplified for performance
        const tjArrayMatches = block.match(/\[((?:\([^)]*\)|[^\]]+)*)\]\s*TJ/gi);
        if (tjArrayMatches) {
          for (const tjMatch of tjArrayMatches.slice(0, 20)) { // Limit per block
            const stringMatches = tjMatch.match(/\(([^)]*)\)/g);
            if (stringMatches) {
              for (const sm of stringMatches.slice(0, 30)) {
                const inner = sm.match(/\(([^)]*)\)/);
                if (inner && inner[1]) {
                  textParts.push(inner[1].replace(/\\\(/g, '(').replace(/\\\)/g, ')'));
                }
              }
            }
          }
        }
        
        // Yield more frequently to prevent CPU timeout
        if (iterations % 25 === 0) await cpuYield();
      }
    }
    
    await cpuYield();
    
    // Method 2: Extract from stream content (skip for large files - too CPU intensive)
    if (!isLargeFile) {
      const streamRegex = /stream\s*\n?([\s\S]{50,5000}?)\n?\s*endstream/g;
      let streamMatch;
      let streamIterations = 0;
      
      // Reduced from 100 to 50 iterations to prevent timeout
      while ((streamMatch = streamRegex.exec(rawContent)) !== null && streamIterations < 50) {
        streamIterations++;
        const streamContent = streamMatch[1];
        
        // Quick check for readable content
        if (streamContent.match(/[a-zA-Z]{3,}/)) {
          const readableText = streamContent
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (readableText.length > 50 && readableText.length < 5000) {
            // Simplified filter
            const filtered = readableText
              .replace(/\b(BT|ET|Tj|TJ|Tm|Td|Tf)\b/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (filtered.length > 30 && filtered.match(/[a-zA-Z]{3,}/)) {
              textParts.push(filtered);
            }
          }
        }
        
        if (streamIterations % 20 === 0) await cpuYield();
      }
    }
    
    await cpuYield();
    
    // Combine and clean
    let combinedText = textParts.join(' ');
    
    // Reconstruct lines - simplified for performance
    if (textParts.length > 10) {
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
    
    console.log(`[script-parser-stream] PDF text extraction complete: ${pageCount} pages, ${combinedText.length} chars, ${iterations} iterations`);
    
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

// Normalize extracted text to Fountain format for better parsing (SCREENPLAYS ONLY)
function normalizeToFountain(rawText: string): { 
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
  
  // Scene heading patterns - includes Hindi transliterated terms
  const sceneHeadingPattern = /^(?:\d+[A-Z]?\.\s*)?(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*.+/i;
  const looseScenePattern = /^(INTERIOR|EXTERIOR|INT|EXT|ANDAR|BAHAR|अंदर|बाहर)[\s\.\/:\-–—]+(.+)/i;
  // Additional scene patterns for unusual formats
  const numberedScenePattern = /^(SCENE|SC\.?|SEQ\.?)\s*#?\s*(\d+)/i;
  const markerPattern = /^(FADE IN|FADE OUT|SMASH CUT|JUMP CUT|TIME CUT):/i;
  const locationOnlyPattern = /^([A-Z][A-Z\s]+)\s*-\s*(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|CONTINUOUS|LATER|SAME)/i;
  
  // Character patterns - Unicode-aware for multilingual names (Hinglish, Hindi, etc.)
  const characterCuePattern = /^([\p{Lu}][\p{L}\s\.']{1,}|[\u0900-\u097F][\u0900-\u097F\s]+)(\s*\(.*\))?$/u;
  
  // Non-character words to filter - includes Hindi/Hinglish terms
  const nonCharacterWords = new Set([
    'INT', 'EXT', 'INTERIOR', 'EXTERIOR', 'FADE', 'CUT', 'DISSOLVE',
    'THE', 'CONTINUED', 'CONTINUOUS', 'LATER', 'DAY', 'NIGHT', 'MORNING',
    'EVENING', 'DUSK', 'DAWN', 'SAME', 'TRANSITION', 'TITLE', 'SUPER',
    'INSERT', 'ANGLE', 'CLOSE', 'WIDE', 'MEDIUM', 'POV', 'BACK', 'SMASH',
    'MATCH', 'JUMP', 'TIME', 'CUT TO', 'FADE TO', 'FADE IN', 'FADE OUT',
    'ANDAR', 'BAHAR', 'DIN', 'RAAT', 'SUBAH', 'SHAAM', 'DOPAHAR',
    'अंदर', 'बाहर', 'दिन', 'रात', 'सुबह', 'शाम', 'दोपहर',
    'SCENE', 'SHOT', 'FLASHBACK', 'MONTAGE', 'INTERCUT',
  ]);
  
  let lastWasCharacter = false;
  let inDialogue = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const nextLine = lines[i + 1]?.trim() || '';
    
    if (!trimmed) {
      normalizedLines.push('');
      lastWasCharacter = false;
      inDialogue = false;
      continue;
    }
    
    // Check for standard scene heading
    if (sceneHeadingPattern.test(trimmed)) {
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
    
    // Check for numbered scene (SCENE 1:, SC. 2, etc.)
    const numberedMatch = trimmed.match(numberedScenePattern);
    if (numberedMatch) {
      normalizedLines.push('');
      normalizedLines.push(trimmed.toUpperCase());
      normalizedLines.push('');
      scenesDetected++;
      lastWasCharacter = false;
      inDialogue = false;
      continue;
    }
    
    // Check for location-only pattern (OFFICE - DAY)
    const locationMatch = trimmed.match(locationOnlyPattern);
    if (locationMatch) {
      normalizedLines.push('');
      normalizedLines.push(`INT. ${trimmed.toUpperCase()}`);
      normalizedLines.push('');
      scenesDetected++;
      lastWasCharacter = false;
      inDialogue = false;
      continue;
    }
    
    // Check for transition markers that indicate scene breaks
    if (markerPattern.test(trimmed)) {
      normalizedLines.push('');
      normalizedLines.push(trimmed.toUpperCase());
      normalizedLines.push('');
      continue;
    }
    
    // Check for character cue
    if (characterCuePattern.test(trimmed) && trimmed.length < 40) {
      const potentialName = trimmed.replace(/\s*\(.*\)$/, '').trim();
      
      if (!nonCharacterWords.has(potentialName) && potentialName.length > 1) {
        if (nextLine && !sceneHeadingPattern.test(nextLine) && !characterCuePattern.test(nextLine)) {
          characterNames.add(potentialName);
          normalizedLines.push('');
          normalizedLines.push(trimmed);
          lastWasCharacter = true;
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
      normalizedLines.push(trimmed);
      inDialogue = true;
      lastWasCharacter = false;
    } else if (inDialogue && trimmed.length < 60 && !trimmed.includes('  ')) {
      normalizedLines.push(trimmed);
    } else {
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

// ============= COMIC SCRIPT NORMALIZATION =============

// Normalize comic script directly without Fountain conversion (COMICS ONLY)
// Returns detected character names for propagation to parseComicFormat
function normalizeComicScript(rawText: string): {
  normalizedText: string;
  quality: 'good' | 'fair' | 'poor';
  pagesDetected: number;
  panelsDetected: number;
  charactersDetected: number;
  characterNames: string[];  // NEW: Return actual character names for propagation
} {
  const lines = rawText.split('\n');
  const normalizedLines: string[] = [];
  let pagesDetected = 0;
  let panelsDetected = 0;
  const characterNames = new Set<string>();
  
  // Comic page patterns - handle various formats
  const pagePatterns = [
    /^PAGE\s*#?\s*(\d+)/i,           // PAGE 1, PAGE #1
    /^PG\.?\s*#?\s*(\d+)/i,          // PG 1, PG. 1
    /^P(\d+)\b/i,                     // P1, P2
    /^\[PAGE\s*(\d+)\]/i,            // [PAGE 1]
    /^-+\s*PAGE\s*(\d+)\s*-+/i,      // --- PAGE 1 ---
  ];
  
  // Comic panel patterns
  const panelPatterns = [
    /^PANEL\s*#?\s*(\d+)/i,          // PANEL 1
    /^PNL\.?\s*#?\s*(\d+)/i,         // PNL 1
    /^P\d+\s*[-:]\s*PANEL\s*(\d+)/i, // P1 - PANEL 1
    /^\[PANEL\s*(\d+)\]/i,           // [PANEL 1]
    /^PANEL\s+([A-Z])\b/i,           // PANEL A, PANEL B
  ];
  
  // Character dialogue patterns for comics
  const comicDialoguePatterns = [
    /^([A-Z][A-Z\s\.']+):\s*(.+)/,           // CHARACTER: dialogue
    /^([A-Z][A-Z\s\.']+)\s*\(.*?\):\s*(.+)/, // CHARACTER (CAPTION): dialogue
    /^([A-Z][A-Z\s\.']+)\s*\[.*?\]:\s*(.+)/, // CHARACTER [V.O.]: dialogue
  ];
  
  // Non-character words specific to comics
  const nonCharacterWords = new Set([
    'PAGE', 'PANEL', 'PG', 'PNL', 'CAPTION', 'SFX', 'SOUND', 'EFFECT',
    'CONTINUED', 'CONT', 'OFF', 'OP', 'BURST', 'BALLOON', 'BUBBLE',
    'TITLE', 'CREDITS', 'SPLASH', 'SPREAD', 'BLEED', 'GUTTER',
    'INSET', 'CLOSE', 'WIDE', 'ESTABLISHING', 'INSERT', 'TIER',
    'NARRATOR', 'NARRATION', 'SCENE', 'DESCRIPTION', 'ACTION',
  ]);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      normalizedLines.push('');
      continue;
    }
    
    // Check for page markers
    let foundPage = false;
    for (const pattern of pagePatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        normalizedLines.push('');
        normalizedLines.push(`PAGE ${match[1]}`);
        normalizedLines.push('');
        pagesDetected++;
        foundPage = true;
        break;
      }
    }
    if (foundPage) continue;
    
    // Check for panel markers
    let foundPanel = false;
    for (const pattern of panelPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        normalizedLines.push('');
        normalizedLines.push(`PANEL ${match[1]}`);
        panelsDetected++;
        foundPanel = true;
        break;
      }
    }
    if (foundPanel) continue;
    
    // Check for character dialogue (colon-based)
    let foundDialogue = false;
    for (const pattern of comicDialoguePatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const name = match[1].trim();
        if (!nonCharacterWords.has(name)) {
          characterNames.add(name);
          normalizedLines.push('');
          normalizedLines.push(name);
          normalizedLines.push(match[2]);
        }
        foundDialogue = true;
        break;
      }
    }
    if (foundDialogue) continue;
    
    // Check for standalone character name (ALL CAPS, followed by text on next line)
    const nextLine = lines[i + 1]?.trim() || '';
    const standaloneCharPattern = /^[A-Z][A-Z\s\.']{1,30}$/;
    if (standaloneCharPattern.test(trimmed) && nextLine && !nonCharacterWords.has(trimmed)) {
      // Additional validation: next line should look like dialogue (not a panel/page marker)
      const nextIsStructure = pagePatterns.some(p => p.test(nextLine)) || 
                              panelPatterns.some(p => p.test(nextLine)) ||
                              standaloneCharPattern.test(nextLine);
      if (!nextIsStructure && nextLine.length > 0) {
        characterNames.add(trimmed);
        normalizedLines.push('');
        normalizedLines.push(trimmed);
        continue;
      }
    }
    
    // Regular line (action, description)
    normalizedLines.push(trimmed);
  }
  
  // Determine quality
  let quality: 'good' | 'fair' | 'poor' = 'fair';
  if (pagesDetected >= 5 && panelsDetected >= 10) {
    quality = 'good';
  } else if (pagesDetected >= 2 || panelsDetected >= 5) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }
  
  const charNamesArray = Array.from(characterNames);
  console.log(`[script-parser-stream] Comic normalization: ${pagesDetected} pages, ${panelsDetected} panels, ${charNamesArray.length} characters, quality: ${quality}`);
  console.log(`[script-parser-stream] Detected characters: ${charNamesArray.slice(0, 10).join(', ')}${charNamesArray.length > 10 ? '...' : ''}`);
  
  return {
    normalizedText: normalizedLines.join('\n'),
    quality,
    pagesDetected,
    panelsDetected,
    charactersDetected: charNamesArray.length,
    characterNames: charNamesArray,  // Return actual names
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

// ============= SCRIPT TYPE CLASSIFICATION =============

// Lightweight classifier to verify user-selected script type
async function classifyScriptType(
  apiKey: string,
  textSample: string,
  userSelectedType: string
): Promise<{
  detected: 'comic' | 'screenplay' | 'unknown';
  confidence: number;
  mismatch: boolean;
  indicators: string[];
  suggestion?: string;
}> {
  try {
    // Quick pattern-based pre-check (no AI needed for obvious cases)
    const comicIndicators: string[] = [];
    const screenplayIndicators: string[] = [];
    
    // Check for comic patterns
    if (/\bPAGE\s*\d+/i.test(textSample)) comicIndicators.push('PAGE markers');
    if (/\bPANEL\s*\d+/i.test(textSample)) comicIndicators.push('PANEL markers');
    if (/\bSFX[:\s]/i.test(textSample)) comicIndicators.push('SFX notation');
    if (/\bCAPTION[:\s]/i.test(textSample)) comicIndicators.push('CAPTION blocks');
    if (/\bSPLASH\s*PAGE/i.test(textSample)) comicIndicators.push('SPLASH PAGE');
    
    // Check for screenplay patterns
    if (/\b(INT\.|EXT\.)\s+[A-Z]/i.test(textSample)) screenplayIndicators.push('INT./EXT. sluglines');
    if (/\bFADE\s*(IN|OUT)/i.test(textSample)) screenplayIndicators.push('FADE transitions');
    if (/\bCUT\s*TO:/i.test(textSample)) screenplayIndicators.push('CUT TO transitions');
    if (/\bCONTINUOUS\b/i.test(textSample)) screenplayIndicators.push('CONTINUOUS marker');
    if (/^\s*[A-Z]{2,}[A-Z\s]*\n\s*\(/m.test(textSample)) screenplayIndicators.push('Character cues with parentheticals');
    
    // Calculate confidence based on pattern matches
    const comicScore = comicIndicators.length;
    const screenplayScore = screenplayIndicators.length;
    const totalScore = comicScore + screenplayScore;
    
    let detected: 'comic' | 'screenplay' | 'unknown' = 'unknown';
    let confidence = 0;
    
    if (totalScore > 0) {
      if (comicScore > screenplayScore) {
        detected = 'comic';
        confidence = Math.min(0.95, 0.5 + (comicScore - screenplayScore) * 0.15);
      } else if (screenplayScore > comicScore) {
        detected = 'screenplay';
        confidence = Math.min(0.95, 0.5 + (screenplayScore - comicScore) * 0.15);
      } else {
        // Equal scores - need AI to decide
        confidence = 0.3;
      }
    }
    
    const userIsComic = userSelectedType === 'comic';
    const detectedIsComic = detected === 'comic';
    const mismatch = detected !== 'unknown' && userIsComic !== detectedIsComic;
    
    console.log(`[script-parser-stream] Classification: detected=${detected}, confidence=${confidence.toFixed(2)}, mismatch=${mismatch}`);
    console.log(`[script-parser-stream] Indicators - Comic: [${comicIndicators.join(', ')}], Screenplay: [${screenplayIndicators.join(', ')}]`);
    
    return {
      detected,
      confidence,
      mismatch,
      indicators: detected === 'comic' ? comicIndicators : screenplayIndicators,
      suggestion: mismatch 
        ? `Script appears to be a ${detected} based on: ${(detected === 'comic' ? comicIndicators : screenplayIndicators).join(', ')}`
        : undefined
    };
    
  } catch (error) {
    console.error('[script-parser-stream] Classification error:', error);
    return {
      detected: 'unknown',
      confidence: 0,
      mismatch: false,
      indicators: [],
    };
  }
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

  // Authentication check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - No auth token provided' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  
  // Create client with user's token to verify auth and check access
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { scriptId, format, filePath, scriptType } = await req.json() as ParseRequest;

  // Verify user has access to the script via RLS
  const { data: scriptAccess, error: accessError } = await supabaseAuth
    .from('scripts')
    .select('id, organization_id')
    .eq('id', scriptId)
    .single();

  if (accessError || !scriptAccess) {
    return new Response(
      JSON.stringify({ error: 'Not found or unauthorized' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  console.log(`[script-parser-stream] === STARTING SSE PARSE ===`);
  console.log(`[script-parser-stream] scriptId: ${scriptId}`);
  console.log(`[script-parser-stream] format: ${format}`);
  console.log(`[script-parser-stream] filePath: ${filePath}`);
  console.log(`[script-parser-stream] scriptType: ${scriptType}`);

  // Create SSE response stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log(`[script-parser-stream] Step 1: Initializing Supabase client`);
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
        console.log(`[script-parser-stream] Supabase initialized, AI key available: ${!!lovableApiKey}`);
        
        // Stage 1: Download
        console.log(`[script-parser-stream] Step 2: Downloading file from storage`);
        sendSSE(controller, 'stage', { stage: 'download', message: 'Downloading script from storage...' });
        
        // Normalize filePath - handle both full URLs and relative paths
        let normalizedFilePath = filePath;
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
          // Extract the relative path from the full URL
          // URL format: https://<project>.supabase.co/storage/v1/object/public/scripts/<path>
          // or: https://<project>.supabase.co/storage/v1/object/scripts/<path>
          const urlMatch = filePath.match(/\/storage\/v1\/object(?:\/public)?\/scripts\/(.+)$/);
          if (urlMatch) {
            normalizedFilePath = urlMatch[1];
            console.log(`[script-parser-stream] Extracted relative path from URL: ${normalizedFilePath}`);
          } else {
            console.log(`[script-parser-stream] Could not extract path from URL, attempting direct fetch`);
            // Try to fetch directly from the URL as a fallback
            try {
              const response = await fetch(filePath);
              if (!response.ok) {
                throw new Error(`Direct fetch failed: ${response.status} ${response.statusText}`);
              }
              const fileData = await response.blob();
              const fileSize = fileData.size;
              const expectedPages = estimatePageCount(fileSize, format);
              console.log(`[script-parser-stream] Direct fetch succeeded: ${fileSize} bytes, ~${expectedPages} pages`);
              
              sendSSE(controller, 'progress', { 
                stage: 'download', 
                percent: 100, 
                message: `Downloaded ${(fileSize / 1024).toFixed(0)}KB, ~${expectedPages} pages` 
              });
              
              // Continue with the rest of the parsing using fileData
              // Set up variables for the rest of the flow
              (globalThis as any).__directFetchData = fileData;
              (globalThis as any).__directFetchSize = fileSize;
              (globalThis as any).__directFetchPages = expectedPages;
            } catch (fetchError) {
              console.error(`[script-parser-stream] Direct fetch error:`, fetchError);
              throw new Error(`Failed to download from URL: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
            }
          }
        }
        
        // If we didn't do a direct fetch, download from storage
        let fileData: Blob;
        let fileSize: number;
        let expectedPages: number;
        
        if ((globalThis as any).__directFetchData) {
          fileData = (globalThis as any).__directFetchData;
          fileSize = (globalThis as any).__directFetchSize;
          expectedPages = (globalThis as any).__directFetchPages;
          delete (globalThis as any).__directFetchData;
          delete (globalThis as any).__directFetchSize;
          delete (globalThis as any).__directFetchPages;
        } else {
          const { data: downloadedData, error: downloadError } = await supabase.storage
            .from('scripts')
            .download(normalizedFilePath);

          if (downloadError) {
            console.error(`[script-parser-stream] Download error:`, downloadError);
            throw new Error(`Failed to download: ${downloadError.message}`);
          }
          
          fileData = downloadedData;
          fileSize = fileData.size;
          expectedPages = estimatePageCount(fileSize, format);
          console.log(`[script-parser-stream] Downloaded: ${fileSize} bytes, ~${expectedPages} pages`);
          
          sendSSE(controller, 'progress', { 
            stage: 'download', 
            percent: 100, 
            message: `Downloaded ${(fileSize / 1024).toFixed(0)}KB, ~${expectedPages} pages` 
          });
        }

        // Stage 2: Validate
        console.log(`[script-parser-stream] Step 3: Validating file`);
        sendSSE(controller, 'stage', { stage: 'validate', message: 'Validating file format...' });
        
        const validation = validateFile(fileSize, format);
        console.log(`[script-parser-stream] Validation: valid=${validation.valid}, warnings=${validation.warnings.length}`);
        if (validation.warnings.length > 0) {
          console.log(`[script-parser-stream] Validation warnings:`, validation.warnings);
          sendSSE(controller, 'warning', { 
            warnings: validation.warnings, 
            recommendations: validation.recommendations 
          });
        }
        
        sendSSE(controller, 'progress', { stage: 'validate', percent: 100, message: 'Format validated' });

        // Stage 2.5: Classify script type (verify user selection)
        console.log(`[script-parser-stream] Step 3.5: Classifying script type`);
        sendSSE(controller, 'stage', { stage: 'classify', message: 'Verifying script type...' });
        
        let effectiveScriptType = scriptType || 'feature';
        let classificationResult: {
          detected: 'comic' | 'screenplay' | 'unknown';
          confidence: number;
          mismatch: boolean;
          corrected: boolean;
          userSelected?: string;
        } | null = null;
        
        // For text-based formats, we can classify before extraction
        // For binary formats (PDF/DOCX), we'll classify after extraction
        const canClassifyEarly = ['fountain', 'highland', 'txt', 'fdx'].includes(format);
        
        if (canClassifyEarly) {
          sendSSE(controller, 'progress', { stage: 'classify', percent: 30, message: 'Reading content for classification...' });
          
          // Read text content for classification
          const textForClassification = await fileData.text();
          const sampleText = textForClassification.substring(0, 5000);
          
          sendSSE(controller, 'progress', { stage: 'classify', percent: 50, message: 'Analyzing script patterns...' });
          
          // Run classifier
          const classifyResult = await classifyScriptType(lovableApiKey || '', sampleText, effectiveScriptType);
          
          classificationResult = {
            detected: classifyResult.detected,
            confidence: classifyResult.confidence,
            mismatch: classifyResult.mismatch,
            corrected: false,
            userSelected: scriptType,
          };
          
          // Auto-correct if high confidence mismatch
          if (classifyResult.mismatch && classifyResult.confidence > 0.7) {
            effectiveScriptType = classifyResult.detected === 'comic' ? 'comic' : scriptType || 'feature';
            classificationResult.corrected = true;
            
            sendSSE(controller, 'warning', {
              warnings: [`Script type adjusted: ${scriptType} → ${effectiveScriptType}`],
              recommendations: [classifyResult.suggestion || 'Classification corrected based on content analysis']
            });
            
            sendSSE(controller, 'progress', { 
              stage: 'classify', 
              percent: 100, 
              message: `Corrected to: ${effectiveScriptType} (${Math.round(classifyResult.confidence * 100)}% confidence)` 
            });
          } else {
            sendSSE(controller, 'progress', { 
              stage: 'classify', 
              percent: 100, 
              message: `Verified: ${effectiveScriptType} (${Math.round(classifyResult.confidence * 100)}% confidence)` 
            });
          }
        } else {
          sendSSE(controller, 'progress', { stage: 'classify', percent: 50, message: 'Will verify after text extraction...' });
          sendSSE(controller, 'progress', { stage: 'classify', percent: 100, message: `Using type: ${effectiveScriptType}` });
        }

        // Stage 3: Extract content
        console.log(`[script-parser-stream] Step 4: Extracting content for format: ${format}`);
        sendSSE(controller, 'stage', { stage: 'extract', message: 'Extracting script content...' });
        
        let isComic = effectiveScriptType === 'comic';
        console.log(`[script-parser-stream] Script type: ${isComic ? 'comic' : 'screenplay'}`);
        let allScenes: Scene[] = [];
        let allCharacters: Map<string, Character> = new Map();
        let rawText = '';
        let usedAIRescue = false;
        let extractionMethod = 'regex';
        let actualPdfPageCount: number | null = null; // Track actual PDF structure page count
        
        if (['fountain', 'highland', 'txt'].includes(format)) {
          // Text-based formats - parse directly
          console.log(`[script-parser-stream] Processing text-based format: ${format}`);
          const textContent = await fileData.text();
          rawText = textContent;
          console.log(`[script-parser-stream] Text content length: ${textContent.length} chars`);
          
          sendSSE(controller, 'progress', { stage: 'extract', percent: 50, message: 'Parsing text content...' });
          
          // For comics, normalize first to get character names, then pass to parseComicFormat
          if (isComic) {
            const comicNorm = normalizeComicScript(textContent);
            const parsed = parseComicFormat(comicNorm.normalizedText, comicNorm.characterNames);
            allScenes = parsed.scenes;
            parsed.characters.forEach(c => allCharacters.set(c.name, c));
          } else {
            const parsed = parseTextFormat(textContent);
            allScenes = parsed.scenes;
            parsed.characters.forEach(c => allCharacters.set(c.name, c));
          }
          extractionMethod = 'regex';
          console.log(`[script-parser-stream] Regex parse result: ${allScenes.length} scenes, ${allCharacters.size} characters`);
          
          // If parsing produced poor results, try AI rescue
          if (allScenes.length < 3 && lovableApiKey) {
            console.log(`[script-parser-stream] AI rescue triggered: only ${allScenes.length} scenes found`);
            sendSSE(controller, 'progress', { stage: 'extract', percent: 70, message: 'Using AI to improve extraction...' });
            
            const aiResult = await parseWithAI(lovableApiKey, textContent, isComic, expectedPages, (progress, message) => {
              sendSSE(controller, 'progress', { stage: 'extract', percent: 70 + (progress * 0.3), message });
            });
            console.log(`[script-parser-stream] AI result: ${aiResult.scenes.length} scenes, ${aiResult.characters.length} characters`);
            
            if (aiResult.scenes.length > allScenes.length) {
              console.log(`[script-parser-stream] Using AI results (${aiResult.scenes.length} > ${allScenes.length})`);
              allScenes = aiResult.scenes;
              allCharacters = new Map(aiResult.characters.map(c => [c.name, c]));
              usedAIRescue = true;
              extractionMethod = 'ai';
            } else {
              console.log(`[script-parser-stream] Keeping regex results`);
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
          
          // AI fallback if FDX parsing found 0 scenes but has content
          if (allScenes.length === 0 && rawText.length > 500 && lovableApiKey) {
            console.log(`[script-parser-stream] FDX parsing found 0 scenes - using AI fallback`);
            sendSSE(controller, 'progress', { stage: 'extract', percent: 50, message: 'FDX structure unclear - using AI to parse...' });
            
            const aiResult = await parseWithAI(lovableApiKey, rawText, isComic, expectedPages, (progress, message) => {
              sendSSE(controller, 'progress', { stage: 'extract', percent: 50 + (progress * 0.3), message });
            });
            
            if (aiResult.scenes.length > 0) {
              console.log(`[script-parser-stream] AI rescue found ${aiResult.scenes.length} scenes`);
              allScenes = aiResult.scenes;
              aiResult.characters.forEach(c => allCharacters.set(c.name, c));
              usedAIRescue = true;
              extractionMethod = 'fdx-ai-rescue';
            }
          }
          
        } else if (format === 'pdf' || format === 'docx') {
          // Binary formats - NEW: Use text extraction first!
          const bytes = await fileData.arrayBuffer();
          
          sendSSE(controller, 'progress', { stage: 'extract', percent: 15, message: 'Extracting text from document...' });
          
          let extractedText = '';
          let extractionSuccess = false;
          
          if (format === 'pdf') {
            const fileSizeKB = bytes.byteLength / 1024;
            const estimatedPages = Math.ceil(fileSizeKB / 3.5);
            const maxAISize = 5 * 1024 * 1024; // 5MB limit for AI vision

            // STEP 1: Try PyMuPDF extraction (primary -- best quality, no AI cost)
            sendSSE(controller, 'progress', { stage: 'extract', percent: 15, message: 'Extracting text from PDF...' });
            
            const pythonResult = await extractPDFWithPython(
              bytes,
              (msg: string) => sendSSE(controller, 'progress', { stage: 'extract', percent: 18, message: msg })
            );

            if (pythonResult.success) {
              extractedText = pythonResult.text;
              actualPdfPageCount = pythonResult.pageCount;
              extractionSuccess = true;
              extractionMethod = 'pymupdf';
              sendSSE(controller, 'progress', { 
                stage: 'extract', 
                percent: 30, 
                message: `Extracted ${pythonResult.text.length} chars from ${pythonResult.pageCount} pages (PyMuPDF)` 
              });
              console.log(`[script-parser-stream] PyMuPDF succeeded: ${pythonResult.text.length} chars, ${pythonResult.pageCount} pages`);
            } else {
              console.log(`[script-parser-stream] PyMuPDF skipped/failed: ${pythonResult.error}`);
            }

            // STEP 2: If PyMuPDF failed, try AI Vision (handles scanned/image PDFs)
            if (!extractionSuccess && lovableApiKey && bytes.byteLength <= maxAISize) {
              const isLargePDF = estimatedPages > 40 || bytes.byteLength > 400 * 1024;
              
              if (isLargePDF) {
                console.log(`[script-parser-stream] Large PDF (~${estimatedPages} pages) - using AI vision directly`);
              } else {
                console.log(`[script-parser-stream] Trying AI vision as fallback`);
              }
              
              sendSSE(controller, 'progress', { stage: 'extract', percent: 20, message: 'Using AI vision for text extraction...' });
              
              // Quick page count from PDF structure
              const decoder = new TextDecoder('latin1', { fatal: false });
              const rawContent = decoder.decode(new Uint8Array(bytes).slice(0, 50000));
              const pageMatches = rawContent.match(/\/Type\s*\/Page[^s]/g);
              actualPdfPageCount = pageMatches ? pageMatches.length : estimatedPages;
              
              const pdfBase64 = arrayBufferToBase64(bytes);
              const aiResult = await extractTextWithAI(
                lovableApiKey, 
                pdfBase64, 
                effectiveScriptType === 'comic',
                (msg: string) => sendSSE(controller, 'progress', { stage: 'extract', percent: 25, message: msg })
              );
              
              if (aiResult.success && aiResult.text.length > 500) {
                extractedText = aiResult.text;
                extractionSuccess = true;
                extractionMethod = 'ai-vision';
                sendSSE(controller, 'progress', { 
                  stage: 'extract', 
                  percent: 30, 
                  message: `AI extracted ${aiResult.text.length} chars from ~${actualPdfPageCount} pages` 
                });
              } else if (aiResult.error) {
                sendSSE(controller, 'warning', { 
                  warnings: [aiResult.error],
                  recommendations: ['AI vision extraction had issues. Falling back to pattern matching.']
                });
              }
            }

            // STEP 3: Final fallback -- regex (best effort)
            if (!extractionSuccess) {
              sendSSE(controller, 'progress', { stage: 'extract', percent: 15, message: 'Extracting text with pattern matching...' });
              
              const regexResult = await extractPDFText(bytes);
              
              if (regexResult.pageCount > 0) {
                actualPdfPageCount = regexResult.pageCount;
              }
              
              if (regexResult.success && regexResult.text.length > 500) {
                extractedText = regexResult.text;
                extractionSuccess = true;
                extractionMethod = 'regex';
                sendSSE(controller, 'progress', { 
                  stage: 'extract', 
                  percent: 30, 
                  message: `Extracted ${regexResult.text.length} chars from ${regexResult.pageCount} pages` 
                });
              } else if (regexResult.text.length > 200) {
                extractedText = regexResult.text;
                extractionSuccess = true;
                extractionMethod = 'regex-partial';
              } else {
                // Nothing worked
                if (regexResult.text.length > 0) {
                  extractedText = regexResult.text;
                  extractionMethod = 'regex-only';
                }
                sendSSE(controller, 'warning', { 
                  warnings: ['PDF text extraction was limited. The PDF may be scanned or use embedded fonts.'],
                  recommendations: ['Consider uploading a text-based version of the script for better results.']
                });
              }
            }
          } // End PDF format block
          
          if (format === 'docx') {
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
          
          // If text extraction succeeded, use BIFURCATED parsing based on script type
          if (extractionSuccess && extractedText.length > 0) {
            // Log sample text for debugging
            console.log(`[script-parser-stream] Sample text (first 500 chars): ${extractedText.substring(0, 500).replace(/\n/g, '\\n')}`);
            
            // For binary formats (PDF/DOCX), classify AFTER extraction
            if (!classificationResult) {
              console.log(`[script-parser-stream] Running post-extraction classification`);
              const sampleText = extractedText.substring(0, 5000);
              const classifyResult = await classifyScriptType(lovableApiKey || '', sampleText, effectiveScriptType);
              
              classificationResult = {
                detected: classifyResult.detected,
                confidence: classifyResult.confidence,
                mismatch: classifyResult.mismatch,
                corrected: false,
                userSelected: scriptType,
              };
              
              // Auto-correct if high confidence mismatch
              if (classifyResult.mismatch && classifyResult.confidence > 0.7) {
                const newType = classifyResult.detected === 'comic' ? 'comic' : (scriptType || 'feature');
                if (newType !== effectiveScriptType) {
                  effectiveScriptType = newType;
                  isComic = effectiveScriptType === 'comic';
                  classificationResult.corrected = true;
                  
                  sendSSE(controller, 'warning', {
                    warnings: [`Script type adjusted: ${scriptType} → ${effectiveScriptType}`],
                    recommendations: [classifyResult.suggestion || 'Classification corrected based on content analysis']
                  });
                  
                  console.log(`[script-parser-stream] Type corrected: ${scriptType} → ${effectiveScriptType}`);
                }
              }
            }
            
            if (isComic) {
              // COMIC PATH: Direct comic normalization (skip Fountain)
              sendSSE(controller, 'progress', { stage: 'extract', percent: 40, message: 'Detecting comic script structure...' });
              
              const comicNorm = normalizeComicScript(extractedText);
              rawText = comicNorm.normalizedText;
              
              sendSSE(controller, 'progress', { 
                stage: 'extract', 
                percent: 50, 
                message: `Detected ${comicNorm.pagesDetected} pages, ${comicNorm.panelsDetected} panels, ${comicNorm.charactersDetected} characters` 
              });
              
              sendSSE(controller, 'progress', { stage: 'extract', percent: 60, message: 'Parsing comic elements...' });
              
              // Pass character names from normalization to preserve them through parsing
              const parsed = parseComicFormat(comicNorm.normalizedText, comicNorm.characterNames);
              allScenes = parsed.scenes;
              parsed.characters.forEach(c => allCharacters.set(c.name, c));
              extractionMethod = 'comic-text-extraction';
              
              // AI fallback if comic parsing found 0 panels/pages
              if (allScenes.length === 0 && extractedText.length > 1000 && lovableApiKey) {
                console.log(`[script-parser-stream] Comic parsing found 0 scenes - using AI fallback`);
                sendSSE(controller, 'progress', { stage: 'extract', percent: 70, message: 'Format unusual - using AI to detect comic structure...' });
                
                const aiResult = await parseWithAI(lovableApiKey, extractedText, true, expectedPages, (progress, message) => {
                  sendSSE(controller, 'progress', { stage: 'extract', percent: 70 + (progress * 0.2), message });
                });
                
                if (aiResult.scenes.length > 0) {
                  allScenes = aiResult.scenes;
                  allCharacters = new Map(aiResult.characters.map(c => [c.name, c]));
                  usedAIRescue = true;
                  extractionMethod = 'comic-text-extraction+ai';
                }
              } else if (comicNorm.quality === 'poor' && lovableApiKey) {
                sendSSE(controller, 'progress', { stage: 'extract', percent: 70, message: 'Using AI to improve extraction...' });
                
                const aiResult = await parseWithAI(lovableApiKey, extractedText, true, expectedPages, (progress, message) => {
                  sendSSE(controller, 'progress', { stage: 'extract', percent: 70 + (progress * 0.2), message });
                });
                
                if (aiResult.scenes.length > allScenes.length) {
                  allScenes = aiResult.scenes;
                  allCharacters = new Map(aiResult.characters.map(c => [c.name, c]));
                  usedAIRescue = true;
                  extractionMethod = 'comic-text-extraction+ai';
                }
              }
              
            } else {
              // SCREENPLAY PATH: Fountain normalization
              sendSSE(controller, 'progress', { stage: 'extract', percent: 40, message: 'Normalizing to Fountain format...' });
              
              const normalized = normalizeToFountain(extractedText);
              rawText = normalized.fountainText;
              
              sendSSE(controller, 'progress', { 
                stage: 'extract', 
                percent: 50, 
                message: `Normalized: detected ${normalized.scenesDetected} scenes, ${normalized.charactersDetected} characters` 
              });
              
              sendSSE(controller, 'progress', { stage: 'extract', percent: 60, message: 'Parsing screenplay elements...' });
              
              const parsed = parseTextFormat(normalized.fountainText);
              allScenes = parsed.scenes;
              parsed.characters.forEach(c => allCharacters.set(c.name, c));
              extractionMethod = 'text-extraction';
              
              // AI fallback if screenplay parsing found 0 scenes
              if (allScenes.length === 0 && extractedText.length > 1000 && lovableApiKey) {
                console.log(`[script-parser-stream] Screenplay parsing found 0 scenes - using AI fallback`);
                console.log(`[script-parser-stream] Patterns tried: standard scene, loose scene, numbered scene, location-only`);
                sendSSE(controller, 'progress', { stage: 'extract', percent: 70, message: 'Format unusual - using AI to detect scenes...' });
                
                const aiResult = await parseWithAI(lovableApiKey, extractedText, false, expectedPages, (progress, message) => {
                  sendSSE(controller, 'progress', { stage: 'extract', percent: 70 + (progress * 0.2), message });
                });
                
                if (aiResult.scenes.length > 0) {
                  allScenes = aiResult.scenes;
                  allCharacters = new Map(aiResult.characters.map(c => [c.name, c]));
                  usedAIRescue = true;
                  extractionMethod = 'text-extraction+ai';
                }
              } else if (normalized.quality === 'poor' && lovableApiKey) {
                sendSSE(controller, 'progress', { stage: 'extract', percent: 70, message: 'Using AI to improve extraction...' });
                
                const aiResult = await parseWithAI(lovableApiKey, extractedText, false, expectedPages, (progress, message) => {
                  sendSSE(controller, 'progress', { stage: 'extract', percent: 70 + (progress * 0.2), message });
                });
                
                if (aiResult.scenes.length > allScenes.length) {
                  allScenes = aiResult.scenes;
                  allCharacters = new Map(aiResult.characters.map(c => [c.name, c]));
                  usedAIRescue = true;
                  extractionMethod = 'text-extraction+ai';
                }
              }
            }
            
            sendSSE(controller, 'progress', { stage: 'extract', percent: 90, message: `Extracted ${allScenes.length} ${isComic ? 'panels' : 'scenes'}` });
            
          } else {
            // Text extraction failed - try AI-powered extraction as fallback
            console.log('[script-parser-stream] Regex extraction failed, trying AI fallback...');
            
            if (lovableApiKey && format === 'pdf') {
              // Check file size limit for AI vision extraction (5MB max)
              const maxSizeForVision = 5 * 1024 * 1024;
              if (bytes.byteLength > maxSizeForVision) {
                sendSSE(controller, 'error', {
                  code: 'FILE_TOO_LARGE',
                  message: 'PDF is too large for AI vision extraction (>5MB).',
                  recommendations: [
                    'Export as plain text (.txt) or Fountain format for best results',
                    'Split the script into smaller sections',
                    'Use DOCX format which handles large files better'
                  ]
                });
                controller.close();
                return;
              }
              
              sendSSE(controller, 'progress', { 
                stage: 'extract', 
                percent: 40, 
                message: 'Using AI vision to extract text from PDF...' 
              });
              
              // Convert PDF to base64 for AI vision (chunked to avoid stack overflow)
              console.log(`[script-parser-stream] Converting ${bytes.byteLength} bytes to base64...`);
              const base64 = arrayBufferToBase64(bytes);
              console.log(`[script-parser-stream] Base64 conversion complete: ${base64.length} chars`);
              
              console.log('[script-parser-stream] Starting AI vision extraction...');
              const aiExtractResult = await extractTextWithAI(
                lovableApiKey, 
                base64, 
                isComic,
                (message) => {
                  sendSSE(controller, 'progress', { stage: 'extract', percent: 60, message });
                }
              );
              
              if (aiExtractResult.success && aiExtractResult.text.length > 200) {
                extractedText = aiExtractResult.text;
                extractionSuccess = true;
                extractionMethod = 'ai-vision';
                usedAIRescue = true;
                
                sendSSE(controller, 'progress', { 
                  stage: 'extract', 
                  percent: 70, 
                  message: `AI extracted ${aiExtractResult.text.length} characters` 
                });
                
                // Now use BIFURCATED parsing on AI-extracted text
                if (isComic) {
                  const comicNorm = normalizeComicScript(extractedText);
                  rawText = comicNorm.normalizedText;
                  const parsed = parseComicFormat(comicNorm.normalizedText);
                  allScenes = parsed.scenes;
                  parsed.characters.forEach(c => allCharacters.set(c.name, c));
                  
                  // If regex parsing returned 0 scenes, use AI structure detection
                  if (allScenes.length === 0 && lovableApiKey) {
                    console.log(`[script-parser-stream] AI vision comic: 0 panels after regex - using AI structure detection`);
                    const aiParsed = await parseWithAI(lovableApiKey, extractedText, true, expectedPages, (p, m) => {
                      sendSSE(controller, 'progress', { stage: 'extract', percent: 80 + (p * 0.05), message: m });
                    });
                    if (aiParsed.scenes.length > 0) {
                      allScenes = aiParsed.scenes;
                      allCharacters = new Map(aiParsed.characters.map(c => [c.name, c]));
                      extractionMethod = 'ai-vision+ai-structure';
                    }
                  }
                } else {
                  const normalized = normalizeToFountain(extractedText);
                  rawText = normalized.fountainText;
                  const parsed = parseTextFormat(normalized.fountainText);
                  allScenes = parsed.scenes;
                  parsed.characters.forEach(c => allCharacters.set(c.name, c));
                  
                  // If regex parsing returned 0 scenes, use AI structure detection
                  if (allScenes.length === 0 && lovableApiKey) {
                    console.log(`[script-parser-stream] AI vision screenplay: 0 scenes after regex - using AI structure detection`);
                    const aiParsed = await parseWithAI(lovableApiKey, extractedText, false, expectedPages, (p, m) => {
                      sendSSE(controller, 'progress', { stage: 'extract', percent: 80 + (p * 0.05), message: m });
                    });
                    if (aiParsed.scenes.length > 0) {
                      allScenes = aiParsed.scenes;
                      allCharacters = new Map(aiParsed.characters.map(c => [c.name, c]));
                      extractionMethod = 'ai-vision+ai-structure';
                    }
                  }
                }
                
                sendSSE(controller, 'progress', { 
                  stage: 'extract', 
                  percent: 85, 
                  message: `AI extraction found ${allScenes.length} ${isComic ? 'panels' : 'scenes'}, ${allCharacters.size} characters` 
                });
                
              } else {
                // AI extraction also failed
                console.log('[script-parser-stream] AI extraction failed:', aiExtractResult.error);
                
                sendSSE(controller, 'error', { 
                  code: 'EXTRACTION_FAILED',
                  message: aiExtractResult.error || 'Could not extract text from this PDF.',
                  recommendations: [
                    'This PDF may be scanned, image-based, or have an unsupported format.',
                    'Try exporting your script as plain text (.txt) or Fountain (.fountain)',
                    'Final Draft (.fdx) and DOCX formats are also well-supported.'
                  ]
                });
                
                sendSSE(controller, 'result', {
                  success: false,
                  scenes: 0,
                  characters: 0,
                  error: 'EXTRACTION_FAILED',
                  message: 'Could not extract text from PDF. Please try a different format.',
                  extractionMethod: 'failed'
                });
                
                try { controller.close(); } catch (e) { /* already closed */ }
                return;
              }
              
            } else {
              // No AI key available or not a PDF
              sendSSE(controller, 'error', { 
                code: 'EXTRACTION_FAILED',
                message: 'Text extraction failed and AI fallback is not available.',
                recommendations: [
                  'Please upload a text-based PDF (created digitally, not scanned)',
                  'Or export your script as DOCX, Fountain (.fountain), or plain text (.txt)',
                  'Final Draft (.fdx) format is also supported'
                ]
              });
              
              sendSSE(controller, 'result', {
                success: false,
                scenes: 0,
                characters: 0,
                error: 'EXTRACTION_FAILED',
                message: 'Cannot parse this file. Please upload a text-based format.',
                extractionMethod: 'failed'
              });
              
              try { controller.close(); } catch (e) { /* already closed */ }
              return;
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
        console.log(`[script-parser-stream] Step 6: Saving to database`);
        console.log(`[script-parser-stream] Final counts: ${allScenes.length} scenes, ${characters.length} characters`);
        sendSSE(controller, 'stage', { stage: 'finalize', message: 'Saving extracted data...' });
        
        // Re-number scenes
        allScenes.forEach((scene, index) => {
          scene.scene_number = index + 1;
        });
        
        // Insert scenes
        console.log(`[script-parser-stream] Inserting ${allScenes.length} scenes`);
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
            sendSSE(controller, 'warning', { message: 'Some scenes could not be saved' });
          } else {
            console.log(`[script-parser-stream] Scenes inserted successfully`);
          }
        }
        
        sendSSE(controller, 'progress', { stage: 'finalize', percent: 40, message: 'Scenes saved...' });

        // Insert characters
        console.log(`[script-parser-stream] Inserting ${characters.length} characters`);
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
            sendSSE(controller, 'warning', { message: 'Some characters could not be saved' });
          } else {
            console.log(`[script-parser-stream] Characters inserted successfully`);
          }
        }
        
        sendSSE(controller, 'progress', { stage: 'finalize', percent: 70, message: 'Characters saved...' });

        // Build and save narrative graph
        console.log(`[script-parser-stream] Building narrative graph`);
        const narrativeGraph = buildNarrativeGraph(allScenes, characters);
        console.log(`[script-parser-stream] Graph: ${narrativeGraph.nodes.length} nodes, ${narrativeGraph.edges.length} edges`);
        
        const { error: graphError } = await supabase.from('narrative_graphs').insert({
          script_id: scriptId,
          graph_type: 'scene_flow',
          nodes: narrativeGraph.nodes,
          edges: narrativeGraph.edges,
          metadata: { 
            parsed_at: new Date().toISOString(),
            ai_assisted: usedAIRescue,
            extraction_method: extractionMethod,
            streaming: true,
            classification: classificationResult,
          },
        });

        if (graphError) {
          console.error('[script-parser-stream] Graph insert error:', graphError);
          sendSSE(controller, 'warning', { message: 'Narrative graph could not be saved' });
        } else {
          console.log(`[script-parser-stream] Narrative graph inserted successfully`);
        }

        // Update script with page count
        console.log(`[script-parser-stream] Updating script page count`);
        
        // Calculate extracted pages - consider scene count as alternative for FDX/text formats
        // where page numbers aren't embedded in the format
        const scenePageMax = Math.max(...allScenes.map(s => s.page_end || s.page_start || 0), 0);
        const textBasedPages = Math.ceil(rawText.length / 3000);
        
        // For FDX and text formats, estimate pages from scene count (avg ~1 page per scene for features)
        // This is more reliable than text length for XML formats
        const sceneBasedPages = format === 'fdx' || ['fountain', 'highland', 'txt'].includes(format)
          ? Math.ceil(allScenes.length * 0.9) // ~0.9 pages per scene average
          : 0;
        
        const extractedPages = Math.max(scenePageMax, textBasedPages, sceneBasedPages);
        
        const { error: updateError } = await supabase
          .from('scripts')
          .update({ page_count: extractedPages })
          .eq('id', scriptId);

        if (updateError) {
          console.error('[script-parser-stream] Script update error:', updateError);
        }

        sendSSE(controller, 'progress', { stage: 'finalize', percent: 100, message: 'All data saved!' });

        // Calculate extraction quality
        // IMPORTANT: Use actual PDF page count when available, not file-size heuristic
        // For FDX files, file-size heuristics are unreliable (XML overhead)
        // Use scene count as primary quality indicator for structured formats
        const effectiveExpectedPages = actualPdfPageCount || expectedPages;
        
        // For FDX and structured formats, quality is determined by scene extraction success
        // not page coverage (since page numbers aren't in the format)
        const isStructuredFormat = format === 'fdx' || ['fountain', 'highland'].includes(format);
        
        let coveragePercent: number;
        let isComplete: boolean;
        
        if (isStructuredFormat && allScenes.length > 0) {
          // For structured formats: 
          // - 50+ scenes = excellent (feature film)
          // - 20+ scenes = good (short/pilot)
          // - 5+ scenes = acceptable
          // - Also consider if we got substantial text and characters
          const sceneQuality = allScenes.length >= 50 ? 100 : 
                              allScenes.length >= 20 ? 90 : 
                              allScenes.length >= 10 ? 80 :
                              allScenes.length >= 5 ? 70 : 50;
          const hasCharacters = characters.length >= 3;
          const hasSubstantialText = rawText.length > 10000;
          
          coveragePercent = sceneQuality;
          isComplete = allScenes.length >= 5 && hasCharacters;
          
          console.log(`[script-parser-stream] Structured format quality: ${allScenes.length} scenes → ${coveragePercent}%, hasChars=${hasCharacters}, hasText=${hasSubstantialText}`);
        } else {
          // For PDF/DOCX: use page-based coverage
          coveragePercent = effectiveExpectedPages > 0 
            ? Math.min(100, (extractedPages / effectiveExpectedPages) * 100)
            : 100;
          isComplete = coveragePercent >= 85 && allScenes.length > 0;
        }
        
        console.log(`[script-parser-stream] Coverage calculation: extractedPages=${extractedPages}, effectiveExpectedPages=${effectiveExpectedPages} (actual PDF: ${actualPdfPageCount}, file-size estimate: ${expectedPages}), coverage=${coveragePercent.toFixed(1)}%, isComplete=${isComplete}`);

        // Send final result
        sendSSE(controller, 'complete', {
          success: true,
          scenesCount: allScenes.length,
          charactersCount: characters.length,
          estimatedPages: effectiveExpectedPages, // Use the more accurate estimate
          extractedPages,
          isComplete,
          readyForAnalysis: isComplete,
          aiAssisted: usedAIRescue,
          extractionMethod,
          coveragePercent: Math.round(coveragePercent),
          classification: classificationResult,
          // Debug info for transparency
          pdfPageCount: actualPdfPageCount,
          fileSizeEstimate: expectedPages,
        });

        console.log(`[script-parser-stream] === COMPLETE ===`);
        console.log(`[script-parser-stream] Scenes: ${allScenes.length}, Characters: ${characters.length}, Method: ${extractionMethod}`);
        
      } catch (error) {
        console.error('[script-parser-stream] === ERROR ===');
        console.error('[script-parser-stream] Error type:', error?.constructor?.name);
        console.error('[script-parser-stream] Error message:', error instanceof Error ? error.message : String(error));
        console.error('[script-parser-stream] Error stack:', error instanceof Error ? error.stack : 'no stack');
        sendSSE(controller, 'error', {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          readyForAnalysis: false,
        });
      } finally {
        console.log(`[script-parser-stream] Closing stream controller`);
        try {
          controller.close();
        } catch (closeError) {
          console.log(`[script-parser-stream] Controller already closed:`, closeError);
        }
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

// Parse text formats with expanded scene detection
function parseTextFormat(content: string): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  const lines = content.split('\n');
  
  let currentSceneNumber = 0;
  let currentScene: Scene | null = null;
  let currentPage = 1;
  
  // Scene heading patterns - standard + expanded
  const sceneHeadingPattern = /^(?:\d+[A-Z]?\.\s*)?(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.+?)(?:\s*[-–—]\s*(.+))?$/i;
  const hindiScenePattern = /^(ANDAR|BAHAR|अंदर|बाहर)[\s\.\/:-]+(.+?)(?:\s*-\s*(.+))?$/i;
  // Additional scene patterns for unusual formats
  const numberedScenePattern = /^(SCENE|SC\.?|SEQ\.?)\s*#?\s*(\d+)/i;
  const locationOnlyPattern = /^([A-Z][A-Z\s]+)\s*-\s*(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|CONTINUOUS|LATER|SAME)/i;
  
  // Character pattern - Unicode-aware for multilingual names (Hinglish, Hindi, etc.)
  const characterPattern = /^([\p{Lu}][\p{L}\s\.']+|[\u0900-\u097F][\u0900-\u097F\s]+)(\s*\(.*\))?$/u;
  
  // Non-character words - includes Hindi/Hinglish terms
  const nonCharacterWords = new Set([
    'INT', 'EXT', 'INTERIOR', 'EXTERIOR', 'FADE', 'CUT', 'DISSOLVE',
    'THE', 'CONTINUED', 'CONTINUOUS', 'LATER', 'DAY', 'NIGHT',
    'MORNING', 'EVENING', 'DUSK', 'DAWN', 'SCENE', 'SHOT',
    'ANDAR', 'BAHAR', 'DIN', 'RAAT', 'SUBAH', 'SHAAM', 'DOPAHAR',
    'अंदर', 'बाहर', 'दिन', 'रात', 'सुबह', 'शाम', 'दोपहर',
  ]);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Estimate page
    currentPage = Math.max(currentPage, Math.ceil((i + 1) / 55));
    
    // Standard scene heading (INT./EXT.)
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
    
    // Hindi scene pattern
    const hindiMatch = line.match(hindiScenePattern);
    if (hindiMatch) {
      if (currentScene) currentScene.page_end = currentPage;
      
      currentSceneNumber++;
      const intExt = hindiMatch[1].toUpperCase().includes('ANDAR') || hindiMatch[1].includes('अंदर') ? 'INT' : 'EXT';
      
      currentScene = {
        scene_number: currentSceneNumber,
        heading: line,
        int_ext: intExt,
        location: hindiMatch[2]?.trim() || null,
        time_of_day: hindiMatch[3]?.trim() || null,
        description: null,
        page_start: currentPage,
        page_end: null,
      };
      scenes.push(currentScene);
      continue;
    }
    
    // Numbered scene pattern (SCENE 1:, SC. 2)
    const numberedMatch = line.match(numberedScenePattern);
    if (numberedMatch) {
      if (currentScene) currentScene.page_end = currentPage;
      
      currentSceneNumber++;
      
      currentScene = {
        scene_number: currentSceneNumber,
        heading: line,
        int_ext: null,
        location: null,
        time_of_day: null,
        description: null,
        page_start: currentPage,
        page_end: null,
      };
      scenes.push(currentScene);
      continue;
    }
    
    // Location-only pattern (OFFICE - DAY)
    const locationMatch = line.match(locationOnlyPattern);
    if (locationMatch) {
      if (currentScene) currentScene.page_end = currentPage;
      
      currentSceneNumber++;
      
      currentScene = {
        scene_number: currentSceneNumber,
        heading: `INT. ${line}`,
        int_ext: 'INT',
        location: locationMatch[1]?.trim() || null,
        time_of_day: locationMatch[2]?.trim() || null,
        description: null,
        page_start: currentPage,
        page_end: null,
      };
      scenes.push(currentScene);
      continue;
    }
    
    // Character detection
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
  
  console.log(`[script-parser-stream] parseTextFormat: ${scenes.length} scenes, ${characterMap.size} characters from ${lines.length} lines`);
  
  return {
    scenes,
    characters: Array.from(characterMap.values()),
    rawText: content,
  };
}

// Parse comic format with expanded pattern detection
// Now accepts pre-detected characters from normalizeComicScript to preserve character data
function parseComicFormat(
  content: string, 
  preDetectedCharacters?: string[]
): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  const lines = content.split('\n');
  
  let panelNumber = 0;
  let pageNumber = 0;
  
  // Seed character map with pre-detected characters from normalization stage
  if (preDetectedCharacters && preDetectedCharacters.length > 0) {
    console.log(`[script-parser-stream] parseComicFormat: Seeding with ${preDetectedCharacters.length} pre-detected characters`);
    for (const name of preDetectedCharacters) {
      characterMap.set(name, {
        name,
        dialogue_count: 0,
        scene_count: 0,
        first_appearance: 1,
        description: null,
      });
    }
  }
  
  // Expanded page patterns
  const pagePatterns = [
    /^PAGE\s*#?\s*(\d+)/i,           // PAGE 1, PAGE #1
    /^PG\.?\s*#?\s*(\d+)/i,          // PG 1, PG. 1
    /^P(\d+)\b/i,                     // P1, P2
    /^\[PAGE\s*(\d+)\]/i,            // [PAGE 1]
    /^-+\s*PAGE\s*(\d+)\s*-+/i,      // --- PAGE 1 ---
  ];
  
  // Expanded panel patterns
  const panelPatterns = [
    /^PANEL\s*#?\s*(\d+)/i,          // PANEL 1
    /^PNL\.?\s*#?\s*(\d+)/i,         // PNL 1
    /^P\d+\s*[-:]\s*PANEL\s*(\d+)/i, // P1 - PANEL 1
    /^\[PANEL\s*(\d+)\]/i,           // [PANEL 1]
    /^PANEL\s+([A-Z])\b/i,           // PANEL A, PANEL B
  ];
  
  // Expanded dialogue patterns - colon-based
  const dialoguePatterns = [
    /^([A-Z][A-Z\s\.']+)(?:\s*\(.*\))?:\s*(.+)/,  // CHARACTER: dialogue
    /^([A-Z][A-Z\s\.']+)\s*\[.*?\]:\s*(.+)/,      // CHARACTER [V.O.]: dialogue
  ];
  
  // Standalone character pattern (name on one line, dialogue on next)
  const standaloneCharPattern = /^[A-Z][A-Z\s\.']{1,30}$/;
  
  // Non-character words for comics
  const nonCharacterWords = new Set([
    'CAPTION', 'SFX', 'NARRATOR', 'SOUND', 'EFFECT', 'BURST',
    'PAGE', 'PANEL', 'PG', 'PNL', 'TITLE', 'CREDITS', 'SPLASH',
    'CONTINUED', 'CONT', 'OFF', 'OP', 'INSET', 'TIER',
    'NARRATION', 'SCENE', 'DESCRIPTION', 'ACTION',
    'SPREAD', 'BLEED', 'GUTTER', 'ESTABLISHING', 'INSERT',
  ]);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for page markers
    let foundPage = false;
    for (const pattern of pagePatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        pageNumber = parseInt(match[1]);
        foundPage = true;
        break;
      }
    }
    if (foundPage) continue;
    
    // Check for panel markers
    let foundPanel = false;
    for (const pattern of panelPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        panelNumber++;
        const panelId = match[1];
        scenes.push({
          scene_number: panelNumber,
          heading: `PAGE ${pageNumber || 1} - PANEL ${panelId}`,
          int_ext: null,
          location: null,
          time_of_day: null,
          description: null,
          page_start: pageNumber || 1,
          page_end: pageNumber || 1,
        });
        foundPanel = true;
        break;
      }
    }
    if (foundPanel) continue;
    
    // Check for colon-based dialogue patterns (CHARACTER: dialogue)
    let foundDialogue = false;
    for (const pattern of dialoguePatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const charName = match[1].trim();
        if (!nonCharacterWords.has(charName)) {
          if (!characterMap.has(charName)) {
            characterMap.set(charName, {
              name: charName,
              dialogue_count: 0,
              scene_count: 0,
              first_appearance: panelNumber || 1,
              description: null,
            });
          }
          characterMap.get(charName)!.dialogue_count++;
        }
        foundDialogue = true;
        break;
      }
    }
    if (foundDialogue) continue;
    
    // Check for standalone character name (name on one line, dialogue on next)
    const nextLine = lines[i + 1]?.trim() || '';
    if (standaloneCharPattern.test(trimmed) && !nonCharacterWords.has(trimmed)) {
      // Verify next line looks like dialogue (not another structure element)
      const nextIsStructure = pagePatterns.some(p => p.test(nextLine)) || 
                              panelPatterns.some(p => p.test(nextLine)) ||
                              (standaloneCharPattern.test(nextLine) && !nonCharacterWords.has(nextLine));
      
      if (nextLine && nextLine.length > 0 && !nextIsStructure) {
        // This is a standalone character name followed by dialogue
        if (!characterMap.has(trimmed)) {
          characterMap.set(trimmed, {
            name: trimmed,
            dialogue_count: 0,
            scene_count: 0,
            first_appearance: panelNumber || 1,
            description: null,
          });
        }
        characterMap.get(trimmed)!.dialogue_count++;
      }
    }
  }
  
  console.log(`[script-parser-stream] parseComicFormat: ${scenes.length} panels, ${characterMap.size} characters from ${lines.length} lines`);
  
  return {
    scenes,
    characters: Array.from(characterMap.values()),
    rawText: content,
  };
}

// Parse Final Draft XML - IMPROVED to handle variations
function parseFinalDraft(content: string): { scenes: Scene[]; characters: Character[]; rawText: string } {
  const scenes: Scene[] = [];
  const characterMap = new Map<string, Character>();
  let rawText = '';
  let sceneNumber = 0;
  
  // Multiple patterns for scene headings - FDX variations
  const sceneHeadingPatterns = [
    // Standard FDX format (case-insensitive)
    /<Paragraph[^>]*Type\s*=\s*["']Scene Heading["'][^>]*>([\s\S]*?)<\/Paragraph>/gi,
    // Slug Line variant (some exporters use this)
    /<Paragraph[^>]*Type\s*=\s*["']Slug Line["'][^>]*>([\s\S]*?)<\/Paragraph>/gi,
    // Scene Heading element (FDX 10+)
    /<SceneHeading[^>]*>([\s\S]*?)<\/SceneHeading>/gi,
    // General Action with scene heading content pattern
    /<Paragraph[^>]*Type\s*=\s*["']General["'][^>]*>([\s\S]*?)<\/Paragraph>/gi,
  ];
  
  // Multiple patterns for character cues
  const characterPatterns = [
    /<Paragraph[^>]*Type\s*=\s*["']Character["'][^>]*>([\s\S]*?)<\/Paragraph>/gi,
    /<Character[^>]*>([\s\S]*?)<\/Character>/gi,
  ];
  
  // Extract all text content first
  const textRegex = /<Text[^>]*>([^<]*)<\/Text>/gi;
  let textMatch;
  while ((textMatch = textRegex.exec(content)) !== null) {
    rawText += textMatch[1] + '\n';
  }
  
  // Also try Content elements (some FDX versions)
  const contentRegex = /<Content[^>]*>([^<]*)<\/Content>/gi;
  while ((textMatch = contentRegex.exec(content)) !== null) {
    rawText += textMatch[1] + '\n';
  }
  
  console.log(`[script-parser-stream] FDX raw text extracted: ${rawText.length} chars`);
  
  // Try each scene heading pattern
  for (const regex of sceneHeadingPatterns) {
    let match;
    // Reset regex lastIndex for each pattern
    regex.lastIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      const headingText = match[1].replace(/<[^>]+>/g, '').trim();
      
      // Only count as scene if it looks like a scene heading (INT./EXT. or location pattern)
      const looksLikeScene = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.|INTERIOR|EXTERIOR)/i.test(headingText) ||
                            /^[A-Z][A-Z\s]+\s*-\s*(DAY|NIGHT|MORNING|EVENING|DAWN|DUSK|CONTINUOUS|LATER)/i.test(headingText);
      
      if (looksLikeScene && headingText.length > 3) {
        sceneNumber++;
        const intExtMatch = headingText.match(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i);
        
        scenes.push({
          scene_number: sceneNumber,
          heading: headingText,
          int_ext: intExtMatch ? intExtMatch[1].replace('.', '').replace('/', '').toUpperCase() : null,
          location: headingText.replace(/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*/i, '').split('-')[0]?.trim() || null,
          time_of_day: headingText.split('-')[1]?.trim() || null,
          description: null,
          page_start: null,
          page_end: null,
        });
      }
    }
    
    // If we found scenes with this pattern, don't try others
    if (scenes.length > 0) {
      console.log(`[script-parser-stream] FDX scenes found with pattern ${sceneHeadingPatterns.indexOf(regex) + 1}: ${scenes.length}`);
      break;
    }
  }
  
  // If still no scenes, try to extract from raw text using Fountain-style detection
  if (scenes.length === 0 && rawText.length > 100) {
    console.log(`[script-parser-stream] FDX: No structured scenes found, falling back to text analysis`);
    const lines = rawText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^(INT\.|EXT\.|INT\/EXT\.)\s*.+/i.test(trimmed)) {
        sceneNumber++;
        const intExtMatch = trimmed.match(/^(INT\.|EXT\.|INT\/EXT\.)/i);
        scenes.push({
          scene_number: sceneNumber,
          heading: trimmed,
          int_ext: intExtMatch ? intExtMatch[1].replace('.', '').toUpperCase() : null,
          location: trimmed.replace(/^(INT\.|EXT\.|INT\/EXT\.)\s*/i, '').split('-')[0]?.trim() || null,
          time_of_day: trimmed.split('-')[1]?.trim() || null,
          description: null,
          page_start: null,
          page_end: null,
        });
      }
    }
    console.log(`[script-parser-stream] FDX text-based scene detection: ${scenes.length} scenes`);
  }
  
  // Extract characters with multiple patterns
  for (const regex of characterPatterns) {
    regex.lastIndex = 0;
    let charMatch;
    while ((charMatch = regex.exec(content)) !== null) {
      const charName = charMatch[1].replace(/<[^>]+>/g, '').trim().toUpperCase();
      if (charName.length > 0 && charName.length < 50 && !/^(INT|EXT|FADE|CUT|DISSOLVE|THE|CONTINUED)/.test(charName)) {
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
    }
    
    // If we found characters, stop trying patterns
    if (characterMap.size > 0) break;
  }
  
  console.log(`[script-parser-stream] FDX parsing complete: ${scenes.length} scenes, ${characterMap.size} characters`);
  
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
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional script parser. Parse this ${isComic ? 'comic script' : 'screenplay'} and extract ALL scenes and characters.

Return ONLY valid JSON with this exact structure:
{
  "scenes": [
    {
      "scene_number": 1,
      "heading": "INT. LOCATION - DAY",
      "int_ext": "INT",
      "location": "LOCATION NAME",
      "time_of_day": "DAY",
      "description": "Brief scene description",
      "page_start": 1,
      "page_end": 2
    }
  ],
  "characters": [
    {
      "name": "CHARACTER NAME",
      "dialogue_count": 10,
      "scene_count": 5,
      "first_appearance": 1,
      "description": "Brief character description"
    }
  ]
}

Rules:
- Extract EVERY scene heading (INT./EXT. LOCATION - TIME)
- int_ext must be "INT", "EXT", or "INT/EXT"
- time_of_day: "DAY", "NIGHT", "DAWN", "DUSK", "MORNING", "EVENING", or null
- Extract ALL speaking characters with accurate dialogue counts
- Estimate page_start/page_end based on script position
- Expected ~${expectedPages} pages total`
          },
          {
            role: 'user',
            content: content.substring(0, 80000)
          }
        ],
        max_tokens: 16000,
        temperature: 0.1,
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[script-parser-stream] AI API error:', res.status, errorText);
      throw new Error(`AI API error: ${res.status}`);
    }
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
