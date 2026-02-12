

# Add Location Complexity to SceneEnrichmentAgent

## Overview
Add `locationComplexity` as the final AI-driven metric to the Scene Enrichment pipeline, eliminating the last heuristic in the SceneComplexityAnalyzer radar chart.

## Changes

### 1. Update `SceneAnalysisData` type (`src/types/database.ts`)
- Add `locationComplexity: number; // 0-100` to the interface.

### 2. Update SceneEnrichmentAgent prompt (`supabase/functions/analyze-script/index.ts`)
- Add `location_complexity` to the evaluation list in the prompt with scoring guide:
  - 0-20: Simple single interior (living room, office)
  - 20-50: Standard location (restaurant, street, park)
  - 50-80: Complex location (mansion, hospital, airport, period setting)
  - 80-100: Extreme location (underwater, mountaintop, active war zone, space)
- Add `location_complexity` to the JSON example object in the prompt.
- Add `location_complexity` to the system message description.
- Map `location_complexity` in the return mapping with clamping (default 30).

### 3. Update SceneComplexityAnalyzer (`src/components/report/SceneComplexityAnalyzer.tsx`)
- In `analyzeSceneComplexity`, use AI data for `locationComplexity` when available:
  ```
  const locationComplexity = hasAI ? aiData.locationComplexity : estimateLocation(scene);
  ```
- Update the Location stat card to show the AI badge when `aiSourced` is true (matching the pattern already used for the other 4 metrics).

### 4. Update framework parameters (`src/lib/scriptFramework.ts`)
- Add `'location_complexity'` to the SceneEnrichmentAgent's `parameters` array.

### 5. Redeploy edge function
- Deploy the updated `analyze-script` function.

## Impact
- No database schema changes needed -- `locationComplexity` is stored inside the `full_report_data` JSONB field.
- Existing reports without `locationComplexity` in their `sceneAnalysis` will gracefully fall back to the heuristic via the default value (30) and undefined check.
- New analyses will produce fully AI-driven radar charts with all 5 dimensions sourced from the SceneEnrichmentAgent.

