
# Use Scene Enrichment Data for Pacing Analysis

## Overview
Update the PacingAnalysis component to use AI-analyzed `sceneAnalysis` data (dialogue density, action intensity, narrative function) instead of page-duration heuristics. This makes the chart meaningful for comics (where all scenes span ~1 page) and leverages the Scene Enrichment Agent output.

## Changes

### 1. Update `ReportNarrative.tsx`
- Pass `reportData.sceneAnalysis` as a new prop to `PacingAnalysis`.

### 2. Refactor `PacingAnalysis.tsx`

**Props**: Add `sceneAnalysis?: SceneAnalysisData[]` prop.

**Data source logic**:
- When `sceneAnalysis` is available, compute a **composite intensity score** per scene: `(dialogueDensity + actionIntensity) / 2` (0-100 scale).
- Use `narrativeFunction` from the AI data to drive pace categorization instead of duration thresholds:
  - `climax` / `escalation` = fast
  - `setup` / `transition` = slow  
  - `resolution` = medium
- Fall back to the existing page-duration heuristic when `sceneAnalysis` is absent.

**Rhythm Timeline bars**: Height driven by composite intensity (0-100) instead of page duration.

**Pacing Flow SVG**: Y-axis driven by composite intensity instead of duration.

**Distribution histogram**: Bucket by intensity score instead of page count.

**Quick stats**: Update labels from "Avg Pages/Scene" to "Avg Intensity" when using AI data. Show an "AI Analyzed" badge vs "Estimated" badge (matching the pattern from SceneHeatmap).

**Tooltips**: Show dialogue density and action intensity values alongside the composite score when AI data is available.

### 3. Technical Details

- The `SceneAnalysisData` type already has all needed fields: `dialogueDensity` (0-100), `actionIntensity` (0-100), `narrativeFunction`, `emotionalTone`.
- Match scenes by `sceneNumber` between `SceneData[]` and `SceneAnalysisData[]`.
- No database or backend changes required -- this is purely a frontend visualization improvement.
