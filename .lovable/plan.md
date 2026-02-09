

# Plan: Integrate Python PDF Extraction Microservice as Primary Extraction Step

## Architecture Overview

A dedicated Python microservice using **PyMuPDF (fitz)** will serve as the primary PDF text extraction method. The existing `script-parser-stream` edge function will call this service first, falling back to AI Vision and regex only if the Python service fails.

```text
Current Flow:
  PDF Upload --> [AI Vision (large)] or [Regex (small)] --> [AI Vision fallback] --> Parse

New Flow:
  PDF Upload --> [PyMuPDF Service] --> [AI Vision fallback] --> [Regex fallback] --> Parse
```

## Why PyMuPDF?

- Handles font encoding tables and Unicode CMap correctly (solves the gibberish problem)
- Extracts text with proper line breaks and positioning
- No page limit -- handles 191+ page scripts easily
- Fast: ~0.5s for a 200-page PDF (vs seconds for AI Vision)
- Zero API cost (no AI credits consumed)

---

## Technical Implementation

### Step 1: Create Python Extraction Service

Deploy a lightweight **FastAPI** microservice that accepts a PDF file and returns extracted text.

**Service endpoint:** `POST /extract-pdf`
- Accepts: multipart/form-data with PDF file, or JSON with base64-encoded PDF
- Returns: JSON with extracted text, page count, and quality metadata

**Key PyMuPDF logic:**
- Opens PDF with `fitz.open()`
- Iterates each page calling `page.get_text("text")` for layout-aware extraction
- Applies line-break detection and screenplay formatting heuristics
- Returns per-page text with `--- PAGE N ---` markers (matching current format)
- Reports extraction quality (chars per page, blank page detection)

**Hosting options** (requires user decision):
- Google Cloud Run (serverless, auto-scaling, free tier available)
- AWS Lambda with container image
- Railway / Render / Fly.io (simple deploy)
- Self-hosted VPS

### Step 2: Store Python Service URL as a Secret

Add a new secret `PDF_EXTRACTOR_URL` to the project that points to the deployed Python service endpoint (e.g., `https://pdf-extractor-xyz.run.app/extract-pdf`).

### Step 3: Update Edge Function -- Add Python Extraction Call

**File:** `supabase/functions/script-parser-stream/index.ts`

Add a new function `extractPDFWithPython()` that calls the microservice:

```typescript
async function extractPDFWithPython(
  pdfBytes: ArrayBuffer,
  onProgress?: (message: string) => void
): Promise<{ text: string; pageCount: number; success: boolean; error?: string }> {
  const serviceUrl = Deno.env.get('PDF_EXTRACTOR_URL');
  if (!serviceUrl) {
    return { text: '', pageCount: 0, success: false, error: 'Python extractor not configured' };
  }

  try {
    onProgress?.('Sending PDF to extraction service...');

    const pdfBase64 = arrayBufferToBase64(pdfBytes);

    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdf_base64: pdfBase64 }),
    });

    if (!response.ok) {
      return { text: '', pageCount: 0, success: false, error: `Service error: ${response.status}` };
    }

    const result = await response.json();
    onProgress?.(`Extracted ${result.text.length} chars from ${result.page_count} pages`);

    return {
      text: result.text,
      pageCount: result.page_count,
      success: result.text.length > 500,
      error: result.text.length <= 500 ? 'Insufficient text extracted' : undefined,
    };
  } catch (error) {
    return {
      text: '',
      pageCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Python extraction failed',
    };
  }
}
```

### Step 4: Update PDF Extraction Flow

**File:** `supabase/functions/script-parser-stream/index.ts`  
**Lines:** ~1383-1507 (the PDF format block)

Replace the current routing logic with the new priority chain:

```text
if (format === 'pdf') {
  // STEP 1: Try Python PyMuPDF extraction (primary -- best quality)
  const pythonResult = await extractPDFWithPython(bytes, progressCallback);

  if (pythonResult.success) {
    extractedText = pythonResult.text;
    actualPdfPageCount = pythonResult.pageCount;
    extractionSuccess = true;
    extractionMethod = 'pymupdf';
  }

  // STEP 2: If Python failed, try AI Vision (for scanned/image PDFs)
  if (!extractionSuccess && lovableApiKey && bytes.byteLength <= maxAISize) {
    const aiResult = await extractTextWithAI(lovableApiKey, pdfBase64, isComic, progressCallback);
    if (aiResult.success) {
      extractedText = aiResult.text;
      extractionSuccess = true;
      extractionMethod = 'ai-vision';
    }
  }

  // STEP 3: Final fallback -- regex (best effort)
  if (!extractionSuccess) {
    const regexResult = await extractPDFText(bytes);
    if (regexResult.text.length > 200) {
      extractedText = regexResult.text;
      extractionSuccess = true;
      extractionMethod = 'regex';
    }
  }
}
```

### Step 5: Update Extraction Method Types

**File:** `src/hooks/useStreamingParser.ts`

Add `'pymupdf'` to the `ExtractionMethod` type:

```typescript
export type ExtractionMethod = 'pymupdf' | 'pdfjs' | 'ai_vision' | 'ai_vision_chunked' | 'regex' | 'native' | 'unknown';
```

### Step 6: Update UI Badge Config

**File:** `src/components/StreamingParsingStatus.tsx`

Add PyMuPDF to the extraction method display config:

```typescript
pymupdf: { label: 'PDF Text Extraction', icon: FileCode, variant: 'default' },
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/script-parser-stream/index.ts` | Add `extractPDFWithPython()` function; restructure PDF extraction flow to call Python service first |
| `src/hooks/useStreamingParser.ts` | Add `'pymupdf'` to `ExtractionMethod` type |
| `src/components/StreamingParsingStatus.tsx` | Add PyMuPDF badge config |

## New Files to Create

| File | Purpose |
|------|---------|
| Python service (external repo) | FastAPI app with PyMuPDF extraction endpoint |

## Secrets Required

| Secret | Purpose |
|--------|---------|
| `PDF_EXTRACTOR_URL` | URL of the deployed Python extraction microservice |

---

## Sequence of Operations

1. User uploads PDF
2. Edge function downloads PDF from storage
3. Edge function sends PDF (base64) to Python microservice via HTTP
4. Python service extracts text with PyMuPDF, returns clean text + page count
5. If Python service succeeds (text > 500 chars): use result, skip AI/regex
6. If Python service fails or returns insufficient text: fall through to AI Vision
7. If AI Vision also fails: fall through to regex (best effort)
8. Continue with existing classification, normalization, and structural parsing

---

## Considerations

| Concern | Mitigation |
|---------|------------|
| Additional latency from HTTP call to Python service | PyMuPDF is fast (~0.5s for 200 pages); network overhead is small compared to AI Vision calls |
| Python service availability | Graceful fallback to AI Vision if service is down or unreachable (3-second timeout) |
| File size limits | Python service should accept up to 20MB (matching upload limit); base64 encoding increases size ~33% |
| Cost | PyMuPDF is open source; hosting cost is minimal on serverless platforms |
| Security | Service should be behind authentication (API key header) to prevent abuse |
| The Python service is outside Lovable | User must deploy and maintain it separately; the edge function only calls it via HTTP |

---

## User Action Required

Before implementation can proceed:
1. **Choose a hosting platform** for the Python service (Cloud Run, Railway, etc.)
2. **Deploy the Python service** (can provide the code)
3. **Add the service URL** as a secret (`PDF_EXTRACTOR_URL`)

The edge function changes and UI updates can be implemented immediately -- they will gracefully skip the Python step if the URL is not configured.

