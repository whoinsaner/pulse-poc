
# Fix `extractScore` Usage Across the Board

## Problem
Category scores are stored as objects (`{score: 85, maturity: 'Strong'}`) but many files still read them as raw numbers. This causes scores to display as `0`, `NaN`, or `[object Object]`. Two files were already fixed (`ReportCover.tsx`, `ComicFormatDiagnosis.tsx`), but the same bug exists in **10+ other files**.

## Files to Fix

### 1. Direct raw access (will show 0 or wrong values)

| File | Current Code | Fix |
|------|-------------|-----|
| `src/components/report/AgentAnalysisGrid.tsx` | `categoryScores[category] \|\| 0` | Use `extractScore(categoryScores[category])` |
| `src/components/report/RiskMap.tsx` | `categoryScores['Character'] \|\| 60` (typed as `Record<string, number>`) | Change type to `Record<string, unknown>`, use `extractScore()` with fallbacks |
| `src/lib/sampleReportPdfGenerator.ts` | `categoryScores['Character'] \|\| 60` | Use `extractScore()` with fallbacks |

### 2. Verbose inline typeof checks (working but should use extractScore for consistency)

These files have a correct but verbose pattern. Replace with `extractScore()`:

| File | Category Key |
|------|-------------|
| `src/pages/report/ConceptHook.tsx` | `'Concept & Hook'` |
| `src/pages/report/ProtagonistAnalysis.tsx` | `'Character'` |
| `src/pages/report/EmotionalResonance.tsx` | `'Emotional Arc'` |
| `src/pages/report/Production.tsx` | `'Execution'` |
| `src/pages/report/VisualStorytelling.tsx` | `'World & Logic'` |
| `src/pages/report/ThemeMoral.tsx` | `'Theme'` |
| `src/pages/report/StructuralEngineering.tsx` | `'Structure'` |
| `src/pages/report/Marketability.tsx` | `'Market'` |
| `src/pages/report/DialogueSubtext.tsx` | `'Dialogue'` |
| `src/pages/report/SupportingCast.tsx` | `'Character'` |
| `src/pages/report/AudienceStrategy.tsx` | `'Market'` |
| `src/pages/report/AntagonistAnalysis.tsx` | `'Conflict'` |
| `src/pages/report/ReportOverview.tsx` | All categories |
| `src/pages/report/CompleteScorecard.tsx` | All categories |

### 3. Fallback line also broken in Production.tsx and others

Line like `reportData.categoryScores?.['Execution'] || currentScore` also reads raw objects. These fallback lines need `extractScore()` too.

## Approach

For each file:
1. Import `extractScore` from `@/lib/scoreUtils`
2. Replace raw `categoryScores[key]` access or verbose `typeof` checks with `extractScore(categoryScores[key])`
3. Keep fallback values (e.g., `|| currentScore`) where they exist

## Technical Details

The `extractScore` function (already in `src/lib/scoreUtils.ts`) handles both formats:
- If value is a number, returns it directly
- If value is an object with `.score`, extracts the number
- Otherwise returns 0

Total files changed: ~17 files (3 broken + 14 verbose/inconsistent)
