

# Fix: PDF Export Crash and .md Downloads

## Root Cause

Two separate issues are causing `.md` downloads:

### Issue 1: PDF Generator Crashes
The `renderDiagnosisOverview` function in `fullReportPdfGenerator.ts` (line 688) calls `doc.roundedRect()` with a width of `0` when a category score is `0`. jsPDF rejects zero-width rounded rectangles. This causes the "Export Failed" toast.

The same risk exists on line 619 in `renderParameterCards` and line 686.

### Issue 2: "Full Report" and "Executive Summary" Always Download as .md
The `getFilename` function (line 66 of ExportDialog.tsx) maps `summary` and `full` formats to the `.md` extension. When the PDF fails and the user clicks "Full Report" instead, they get a `.md` file.

## Fix

### File 1: `src/lib/fullReportPdfGenerator.ts`
Guard all `roundedRect` calls against zero or negative width/height:

- **Line 686-688**: Clamp the bar width to a minimum of 0.5 when score > 0, and skip the filled bar entirely when score is 0
- **Line 619**: Same guard for parameter card background bars
- Apply `Math.max(0.5, ...)` to any computed dimension passed to `roundedRect`

### File 2: `src/components/report/ExportDialog.tsx`
No change needed for the extension -- the real fix is making the PDF generator not crash. Once it works, clicking "PDF Report" will produce a `.pdf` file correctly.

However, as a safety measure: in the edge-function fallback path (lines 108-112), when markdown content is returned instead of PDF binary, convert it to a simple PDF using jsPDF `doc.text()` rather than saving raw markdown with a `.pdf` extension.

### Summary of Changes

| File | Change |
|------|--------|
| `src/lib/fullReportPdfGenerator.ts` | Guard `roundedRect` calls against zero/negative dimensions (lines 619, 686, 688) |
| `src/components/report/ExportDialog.tsx` | Convert markdown fallback to simple PDF instead of saving as raw markdown with `.pdf` extension (lines 108-112) |
