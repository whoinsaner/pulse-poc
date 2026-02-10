

# Add PDF_EXTRACTOR_URL Secret

## What needs to happen

Store the Railway deployment URL as a backend secret so the edge function can call the Python PDF extraction service.

## Secret Details

| Secret Name | Value |
|------------|-------|
| `PDF_EXTRACTOR_URL` | `https://pdf-extractor-production-ac24.up.railway.app/extract-pdf` |

## Technical Details

- The `script-parser-stream` edge function already reads this secret via `Deno.env.get('PDF_EXTRACTOR_URL')`
- Once configured, all PDF uploads will attempt PyMuPDF extraction first before falling back to AI Vision or regex
- If the secret is removed later, the system gracefully skips the Python step

## After Adding the Secret

Upload a test PDF screenplay to verify:
1. The extraction method badge shows "PDF Text Extraction" (pymupdf)
2. The parsed text quality is correct
3. Fallback works if the service is temporarily unavailable

