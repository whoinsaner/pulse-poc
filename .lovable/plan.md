

# Make PDF Table of Contents Clickable

## What Changes
The Table of Contents in the exported PDF currently shows page numbers but the entries are plain text. This update will make each TOC entry a clickable link that jumps directly to the corresponding page in the PDF.

## Technical Approach

### File: `src/lib/fullReportPdfGenerator.ts`

In the `renderTocPage` function, after rendering each TOC entry's text and page number, add a clickable link region using jsPDF's `doc.link()` method. This creates an invisible rectangle over the text that, when clicked, navigates to the target page.

For each TOC entry:
1. Calculate the bounding box of the text line (x, y, width, height)
2. Call `doc.link(x, y - lineHeight, fullWidth, lineHeight, { pageNumber: entry.page })` to overlay a clickable region

This applies to both level-0 entries (part headers like "STORY ANALYSIS") and level-1 entries (sections like "Concept and Hook").

No changes needed to the TOC data structure since `TocEntry` already stores the target `page` number.

### Scope
| File | Change |
|------|--------|
| `src/lib/fullReportPdfGenerator.ts` | Add `doc.link()` calls in `renderTocPage` for each entry |

