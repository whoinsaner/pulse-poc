
# Plan: Integrate PDF.js for Proper PDF Text Extraction

## Problem Summary

The current PDF text extraction uses regex-based parsing that:
1. Fails with embedded fonts (glyph indices vs Unicode)
2. Bails out for PDFs over 50 pages
3. Results in low extraction coverage (17.8% for 191-page scripts)

## Proposed Solution

Integrate `pdfjs-dist` (Mozilla's PDF.js) via ESM.sh for proper PDF text extraction in Deno/Edge Functions. PDF.js handles font encoding tables, ToUnicode CMaps, and proper text extraction without vision models.

---

## Technical Implementation

### Step 1: Add PDF.js Import

**File:** `supabase/functions/script-parser-stream/index.ts`

Add the pdfjs-dist import using ESM.sh (Deno-compatible CDN):

```typescript
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.4.168/build/pdf.mjs";
```

**Note:** PDF.js requires a worker for heavy operations. In Deno/Edge Functions, we'll use the "fake worker" mode by setting:

```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = '';
```

---

### Step 2: Create New PDF.js Text Extraction Function

**File:** `supabase/functions/script-parser-stream/index.ts`

Add a new function that uses PDF.js for proper text extraction:

```typescript
async function extractPDFTextWithPDFJS(
  arrayBuffer: ArrayBuffer,
  onProgress?: (message: string, percent: number) => void
): Promise<{ 
  text: string; 
  pageCount: number; 
  success: boolean; 
  error?: string 
}> {
  try {
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const pageCount = pdf.numPages;
    const textParts: string[] = [];
    
    onProgress?.(`Extracting text from ${pageCount} pages...`, 10);
    
    // Process each page
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items with positioning
      let pageText = '';
      let lastY = 0;
      
      for (const item of textContent.items) {
        if ('str' in item) {
          // Check for line break (Y position changed significantly)
          if (lastY !== 0 && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n';
          }
          pageText += item.str;
          lastY = item.transform[5];
        }
      }
      
      textParts.push(`--- PAGE ${i} ---\n${pageText}`);
      
      // Progress update and CPU yield every 10 pages
      if (i % 10 === 0) {
        const percent = Math.round((i / pageCount) * 80) + 10;
        onProgress?.(`Extracted ${i}/${pageCount} pages`, percent);
        await cpuYield();
      }
    }
    
    const combinedText = textParts.join('\n\n');
    
    onProgress?.(`Extraction complete: ${combinedText.length} chars`, 90);
    
    return {
      text: combinedText,
      pageCount,
      success: combinedText.length > 500,
      error: combinedText.length <= 500 
        ? 'PDF appears to be scanned/image-based' 
        : undefined
    };
    
  } catch (error) {
    console.error('[script-parser-stream] PDF.js extraction error:', error);
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'PDF.js extraction failed'
    };
  }
}
```

---

### Step 3: Update Extraction Flow

**File:** `supabase/functions/script-parser-stream/index.ts`

Replace the current extraction logic with a fallback chain:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    PDF Extraction Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Try PDF.js extraction (proper font handling)                │
│        ↓                                                        │
│  2. If PDF.js fails or text < 500 chars:                        │
│     → Try AI vision extraction (chunked for large PDFs)         │
│        ↓                                                        │
│  3. If AI fails or rate limited:                                │
│     → Fall back to regex extraction (best effort)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Changes to main extraction block (around line 1900):**

```typescript
// For PDF files, use PDF.js first, then fallback chain
if (format === 'pdf') {
  sendSSE(controller, 'progress', { 
    stage: 'extract', 
    percent: 15, 
    message: 'Extracting text with PDF.js...' 
  });
  
  // Step 1: Try PDF.js extraction
  const pdfjsResult = await extractPDFTextWithPDFJS(
    arrayBuffer,
    (msg, pct) => sendSSE(controller, 'progress', { 
      stage: 'extract', 
      percent: 15 + Math.round(pct * 0.5), 
      message: msg 
    })
  );
  
  if (pdfjsResult.success && pdfjsResult.text.length > 500) {
    rawText = pdfjsResult.text;
    pageCount = pdfjsResult.pageCount;
    // Continue with Fountain normalization...
  } else {
    // Step 2: Try AI vision extraction
    // (existing AI extraction code, with chunking for large PDFs)
  }
}
```

---

### Step 4: Remove 50-Page Bailout

**File:** `supabase/functions/script-parser-stream/index.ts`  
**Lines:** 189-198

Remove the early return that skips extraction for large PDFs:

```typescript
// DELETE THIS BLOCK:
if (pageCount > 50) {
  console.log(`...`);
  return { text: '', pageCount, success: false, error: '...' };
}
```

PDF.js can handle large PDFs efficiently with proper chunking and CPU yields.

---

### Step 5: Add Chunked AI Fallback (for scanned PDFs)

**File:** `supabase/functions/script-parser-stream/index.ts`

For PDFs where PDF.js returns little/no text (scanned documents), implement chunked AI extraction:

```typescript
async function extractTextWithAIChunked(
  apiKey: string,
  pdfBase64: string,
  totalPages: number,
  isComic: boolean,
  onProgress?: (message: string, pagesProcessed: number) => void
): Promise<{ text: string; success: boolean; pagesExtracted: number; error?: string }> {
  
  // Process in chunks of 30 pages
  const chunkSize = 30;
  const chunks = Math.ceil(totalPages / chunkSize);
  const allText: string[] = [];
  
  for (let i = 0; i < chunks; i++) {
    const startPage = i * chunkSize + 1;
    const endPage = Math.min((i + 1) * chunkSize, totalPages);
    
    onProgress?.(`AI extracting pages ${startPage}-${endPage}...`, endPage);
    
    // Call AI extraction for this chunk
    // (implementation details for page-range extraction)
    
    await cpuYield();
  }
  
  return {
    text: allText.join('\n\n'),
    success: allText.length > 0,
    pagesExtracted: totalPages
  };
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/script-parser-stream/index.ts` | Add PDF.js import, new extraction function, update extraction flow, remove 50-page bailout |

---

## Potential Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| PDF.js bundle size impact | Use ESM.sh which handles tree-shaking; only import what's needed |
| Worker not available in Deno | Use workerless mode (`workerSrc = ''`) - slightly slower but functional |
| Memory issues with large PDFs | Process pages sequentially, not in parallel; yield frequently |
| Some PDFs still fail (encrypted, corrupted) | Maintain fallback chain to AI vision extraction |
| Edge function timeout | Add CPU yields every 10 pages; implement progress streaming |

---

## Expected Outcomes

After implementation:
- **191-page scripts**: Full text extraction via PDF.js (vs 17.8% currently)
- **Proper Unicode handling**: Font encoding tables properly decoded
- **No more bailouts**: All PDF sizes processed with same logic
- **Graceful degradation**: Scanned PDFs still use AI vision as fallback
- **Progress visibility**: Users see extraction progress via SSE updates
