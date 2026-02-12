

# Fix: PDF Report NaN Scores and Broken Formatting

## Problem 1: All Category Scores Show "NaN"

Category scores in the database are stored as objects (e.g., `{score: 85, maturity: "Strong"}`) rather than plain numbers. The PDF generator reads these values directly without extracting the numeric score, resulting in `NaN` throughout the Executive Summary and any page that displays category breakdowns.

### Fix
- Import `extractScore` from `scoreUtils.ts` into `fullReportPdfGenerator.ts`
- In `renderDiagnosisOverview` (line 672), wrap `categoryScores[cat]` with `extractScore()` so the numeric value is properly extracted
- Also update the function signature from `Record<string, number>` to `Record<string, unknown>` to match the actual data shape
- Apply the same fix anywhere else `categoryScores` values are used as raw numbers (e.g., line 714 for overall score, line 727 where the object is passed through)

## Problem 2: Garbled Bullet Characters

The PDF uses Unicode symbols that Helvetica (jsPDF's built-in font) cannot render:
- `✓` (U+2713) in "What Works" bullets -- renders as `'`
- `✗` (U+2717) in "What's Broken" bullets -- renders as `'`
- `◦` (U+25E6) in "What's Underdeveloped" bullets -- renders as `%ae`

### Fix
Replace these Unicode characters with ASCII equivalents that Helvetica supports:
- `✓` becomes `+` or `*`
- `✗` becomes `-` or `x`
- `◦` becomes `-` or `*`

Alternatively, use jsPDF bullet symbols like the em-dash or simple hyphen prefix.

## Problem 3: Narrative Items May Be Objects

The `whatWorks`, `whatsBroken`, and `whatsUnderdeveloped` arrays can contain either strings or structured objects (with `content`/`evidence` keys). The PDF generator assumes strings, which would render as `[object Object]`.

### Fix
Add a `toDisplayString` helper in the PDF generator (mirroring the one in `AgentNarrativePanel`) to safely convert items to strings before rendering.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/fullReportPdfGenerator.ts` | Import `extractScore`; use it in `renderDiagnosisOverview` and Executive Summary; replace unsupported Unicode bullets with ASCII; add `toDisplayString` helper for narrative items |

## Summary of Edits (all in `fullReportPdfGenerator.ts`)

1. **Line ~8**: Add `extractScore` to imports from `scoreUtils`
2. **Lines 362-404**: Replace Unicode bullet chars with ASCII (`+`, `x`, `-`)
3. **Lines 362-404**: Wrap each `item` in `toDisplayString()` before passing to `wrapText`
4. **Line 664-668**: Change `categoryScores` param type to `Record<string, unknown>`
5. **Line 672**: Use `extractScore(categoryScores[cat])` instead of raw value
6. **Line 727**: The call site already passes `data.categoryScores` which contains objects -- the fix in `renderDiagnosisOverview` handles it
7. Add a small `toDisplayString` helper near the top utility functions

