

# Standardize Series Bible Page Styling

## Problem
The Series Bible page uses custom, one-off card layouts (gradient headers, colored border boxes, inline score grids, hardcoded bullet lists) that don't match the clean, standardized pattern used by other report pages like Story Diagnosis, Character Diagnosis, etc.

## Standard Pattern (used by all other diagnosis pages)
Every report sub-page follows this structure:
1. **SectionHeader** -- title, subtitle, icon, score, InlineMaturity badge
2. **DiagnosisSummary** -- 3-column grid (Working / Broken / Underdeveloped)
3. **WeightedParameterList** -- collapsible parameter cards with scores and rationale
4. **DevelopmentFocus** -- low-scoring items with links to related sections

## What Will Change

The Series Bible page will be refactored to follow this exact pattern:

1. **SectionHeader** stays mostly as-is, but add `InlineMaturity` badge (matching other pages). Remove the "Copy Summary" button from the header (move it to a small action at the bottom).
2. **Replace all custom cards** (Core Premise, World Rules, Tonal Guardrails, Character Trajectories, Series Engine) with a single `DiagnosisSummary` component that auto-generates the Working/Broken/Underdeveloped columns from parameter scores.
3. **Replace inline ScoreBar lists** with a `WeightedParameterList` that groups all Series Bible-relevant parameters into a single collapsible breakdown.
4. **Add DevelopmentFocus** at the bottom for low-scoring parameters, linking to related sections (Story, Character, Format).
5. **Keep the "Copy Summary" action** as a small card/button at the very bottom of the page.

## Technical Details

### File: `src/pages/report/SeriesBibleExtract.tsx`

- Remove imports: `ScoreBar`, `VerdictBox`, `Badge`, `Lock`, `Unlock`, `ArrowRight`, `Sparkles`, `Globe`, `Palette`, `Repeat`, `User`
- Add imports: `DiagnosisSummary`, `WeightedParameterList`, `DevelopmentFocus`, `InlineMaturity` (matching StoryDiagnosis pattern)
- Consolidate all parameter filtering (premise, world, tone, arc, series) into a single combined list mapped to `WeightedParameterList` format (with `parameterName`, `displayName`, `score`, `rationale`, `weight`)
- Replace the entire JSX body with the standard 4-section layout
- Keep the `generatePlainTextSummary` and clipboard logic, but render it as a minimal footer card instead of the current "Quick Reference Export" block

### Visual Result
The page will look identical to Story Diagnosis, Character Diagnosis, and other standardized pages -- clean cards, consistent spacing, no custom colored borders or gradient headers.

