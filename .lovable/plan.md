

## Plan: Fix PDF Report Formatting Issues

### Problem Analysis

After reviewing the full 1483-line `fullReportPdfGenerator.ts` and the uploaded 2-page PDF, there are several root causes for the broken output:

### Root Causes

**1. `autoTable` return value not captured — `finalY` unreliable**
Every `autoTable` call uses `(doc as any).lastAutoTable?.finalY` to get the Y position after the table. In `jspdf-autotable` v5.0.7 (the installed version), the standalone `autoTable(doc, opts)` function **returns the table object** directly. The `.lastAutoTable` plugin property may not be set reliably, causing `y` to fall back to stale values and subsequent content to render on top of tables or off-page.

Affected locations: lines 648, 963, 1020, 1077, 1330.

**2. Font state corruption after `autoTable` calls**
`autoTable` internally changes font size, style, and color. After each call, the generator must call `resetFontStyle()`. This is missing after every `autoTable` invocation in `renderAgentNarrative` (comparable titles table), `renderCompleteScorecardAppendix`, `renderCharacterAppendix`, `renderSceneAppendix`, and the Scene Analysis section.

**3. `didDrawPage` skips first page of each table**
The `didDrawPage` callback only fires headers/footers when `getNumberOfPages() > startPages`. But for tables that span multiple pages, the **first continuation page** may also be skipped if the condition is off by one. The fix is to track `currentPage` and compare properly.

**4. TOC renders blank**
The TOC is rendered on page 2, but `renderTocPage` navigates to page 2 and renders there. If the content generation crashed before reaching `renderTocPage`, the TOC remains blank. The underlying crash cascades from issues #1/#2 causing a jsPDF internal state corruption.

### Implementation Plan

**File: `src/lib/fullReportPdfGenerator.ts`**

1. **Capture `autoTable` return value for `finalY`** — Replace all `(doc as any).lastAutoTable?.finalY` patterns with:
   ```typescript
   const result = autoTable(doc, { ... });
   y = (result as any)?.finalY ?? y + 20;
   ```
   This ensures correct Y tracking regardless of plugin property behavior.

2. **Add `resetFontStyle(doc)` after every `autoTable` call** — Insert after each of the 6 `autoTable` invocations to prevent font state from leaking into subsequent text rendering.

3. **Fix `didDrawPage` callbacks** — Simplify to always add headers/footers on continuation pages by tracking via a local `let isFirstPage = true` flag:
   ```typescript
   let isFirstPage = true;
   autoTable(doc, {
     didDrawPage: () => {
       if (!isFirstPage) {
         addRunningHeader(doc, sectionName, { value: doc.getNumberOfPages() });
         addRunningFooter(doc);
       }
       isFirstPage = false;
     },
   });
   ```

4. **Ensure `pageNum` sync after every `autoTable`** — Already present but verify each location also has `pageNum.value = doc.getNumberOfPages();`.

5. **Add defensive guards in text rendering** — Wrap each `doc.text()` call for agent narrative content with null/empty checks to prevent crashes from unexpected data shapes.

### Files to Edit
- `src/lib/fullReportPdfGenerator.ts` — All changes are in this single file

### Expected Outcome
- Full multi-page PDF renders with all sections (Cover, TOC, Executive Summary, Story, Characters, Craft, Market, Appendices)
- Consistent font sizes and styles across all pages
- Tables don't corrupt subsequent content positioning
- TOC populates with correct page numbers and clickable links

