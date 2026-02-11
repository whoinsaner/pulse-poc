

# Scene-by-Scene Analysis: Enrichment Plan

## Current Problem

The Narrative Analysis page exists with 5 visualization components, but they all display **estimated/guessed data** because the underlying scene fields are empty:

| Field | Status | Impact |
|-------|--------|--------|
| `description` | Always null (regex parser) | SceneHeatmap guesses dialogue/action from heading keywords |
| `emotional_tone` | Always null (all parsers) | NarrativeTimeline shows "neutral" for everything |
| `page_start` / `page_end` | Partially populated | PacingAnalysis scene durations are inaccurate |

All 5 components (NarrativeTimeline, SceneHeatmap, PacingAnalysis, SceneComplexityAnalyzer, NarrativeGraphViewer) use fallback `estimateMetrics()` functions that produce unreliable results.

---

## Solution: Two-Phase Approach

### Phase 1: Enrich the Script Parser (script-parser-stream)

Capture scene descriptions during the extraction stage so that every scene has at least a `description` and accurate `page_start`/`page_end` values.

**Changes to `parseTextFormat()` function:**
- After detecting a scene heading, accumulate the following non-heading, non-character lines as the scene's `description` text
- Cap description at ~500 characters to keep database payload reasonable
- This provides the raw material for Phase 2

**Changes to `parseComicFormat()` function:**
- Similarly capture panel description text between panel markers

**Changes to `parseWithAI()` function:**
- Already requests `description` in the prompt (confirmed in code) - just ensure it flows through properly
- Add `emotional_tone` to the AI parsing prompt so AI-rescued scripts get tone data

### Phase 2: Add Scene Enrichment Agent (analyze-script)

Add a lightweight `SceneEnrichmentAgent` that runs as part of the analysis pipeline to evaluate each scene individually.

**What it does:**
- Takes the parsed scenes + raw script text as context
- For each scene, produces: `emotional_tone`, `dialogue_density` (0-100), `action_intensity` (0-100), `narrative_function` (setup/escalation/climax/resolution/transition)
- Updates the `scenes` table directly with `emotional_tone`
- Stores full per-scene metrics in the report's `full_report_data.sceneAnalysis` field

**Why a separate agent instead of modifying the parser:**
- The parser runs before analysis and doesn't have AI context about the story as a whole
- Emotional tone requires understanding narrative context (e.g., a "quiet" scene after a chase is "tense calm", not "peaceful")
- Per-scene dialogue/action metrics need the full script to calculate accurately
- Keeps parser fast and deterministic; analysis is where AI reasoning belongs

**Database changes:**
- Add UPDATE RLS policy for `scenes` table (currently missing) so the analysis function can write `emotional_tone` back
- No new columns needed - `description` and `emotional_tone` already exist

### Phase 3: Update Visualization Components

Replace heuristic estimation with real data rendering.

**SceneHeatmap.tsx:**
- Use actual `emotional_tone` for emotional intensity instead of keyword guessing
- Use `sceneAnalysis` data from report for dialogue density and action level
- Show "Estimated" badge when data is from heuristics (fallback for old reports)

**PacingAnalysis.tsx:**
- Use real `page_start`/`page_end` for scene duration instead of `sceneNumber` fallback

**SceneComplexityAnalyzer.tsx:**
- Replace `analyzeSceneComplexity()` heuristic with real scene analysis data
- Remove `Math.floor(Math.random() * 8) + 2` for cast size (line 109) - use actual character data

**NarrativeTimeline.tsx:**
- Use real emotional tone data for the emotional arc visualization
- Reference actual scene descriptions in beat details

---

## Technical Details

### Parser Changes (script-parser-stream/index.ts)

In `parseTextFormat()` around line 2170-2290:
- Add a `descriptionLines` accumulator that collects non-structural lines after a scene heading
- When a new scene heading is detected, join the accumulated lines and store as `description` on the previous scene
- Trim to 500 chars max

In `parseWithAI()` around line 2597-2698:
- Add `emotional_tone` field to the AI prompt's JSON schema
- Values: "tense", "calm", "dramatic", "comedic", "romantic", "suspenseful", "melancholic", "hopeful", "neutral"

### Database Migration

```text
-- Allow service role to update scenes (for analysis enrichment)
-- The analyze-script function uses service role key, so this policy
-- allows the enrichment agent to write emotional_tone back to scenes
CREATE POLICY "Service can update scenes" ON public.scenes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

Note: Since the analyze-script function already uses the service role key (which bypasses RLS), no migration is actually needed for the enrichment write. The existing INSERT policy covers the parser.

### SceneEnrichmentAgent (analyze-script/index.ts)

Add to the agent pipeline (runs after core agents, before report generation):
- Input: scenes list + raw script text (first 80,000 chars)
- Output: per-scene analysis stored in `sceneAnalysis` field of `full_report_data`
- Model: `google/gemini-2.5-flash` (fast, cost-effective for structured output)
- Prompt asks for JSON array matching scene numbers with: `emotional_tone`, `dialogue_density`, `action_intensity`, `narrative_function`, `key_moment` (boolean)

### Report Data Schema Extension

Add new field to `ReportData` type:

```text
interface SceneAnalysisData {
  sceneNumber: number;
  emotionalTone: string;
  dialogueDensity: number;   // 0-100
  actionIntensity: number;   // 0-100
  narrativeFunction: 'setup' | 'escalation' | 'climax' | 'resolution' | 'transition';
  keyMoment: boolean;
  briefSummary?: string;     // 1-2 sentence summary
}

// Added to ReportData interface
sceneAnalysis?: SceneAnalysisData[];
```

### Component Updates

Each visualization component gets a data precedence strategy:

```text
1. Use sceneAnalysis data from report (best - AI-analyzed)
2. Fall back to scene.emotionalTone / scene.description (good - parser-enriched)
3. Fall back to estimateMetrics() heuristic (worst - legacy/old reports)
4. Show "Estimated" indicator when using fallback
```

---

## Execution Order

1. **Parser enrichment** - Modify `parseTextFormat()` and `parseComicFormat()` to capture descriptions
2. **Database type update** - Add `SceneAnalysisData` to `ReportData` TypeScript type
3. **SceneEnrichmentAgent** - Add to analysis pipeline in `analyze-script`
4. **Component updates** - Update all 4 visualization components to use real data
5. **Indicator badges** - Add "AI Analyzed" vs "Estimated" visual indicators
6. **Testing** - Deploy and test with a new script upload + analysis run

