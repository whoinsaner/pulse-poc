
# Wire Web Series Sub-Pages to Real Data and Standardize Styling

## Problem
1. **WebSeriesAnalysis.tsx** uses a completely custom layout (centered header, custom card grid, inline progress bars, hardcoded "Optimization Tips") that doesn't match the standardized report pattern used across all other pages.
2. **RetentionAnalysis.tsx** and **HooksAnalysis.tsx** are closer to standard but have some inconsistencies (custom score cards, gradient backgrounds).
3. The PDF export references a non-existent `WebSeriesFormatAgent` -- the actual agent is `WebSeriesAgent`.
4. All three pages use keyword-based parameter filtering instead of category-based filtering like the rest of the report.

## Standardized Pattern (from CraftDialogue, StoryConceptHook, etc.)
Every sub-page follows this structure:
```text
<div className="space-y-8">
  <SectionHeader title=... subtitle=... icon=... score=... />
  <AgentNarrativePanel /> (if agent content exists)
  <WeightedParameterList /> (all parameters for this section)
</div>
```
No custom grids, no gradient cards, no hardcoded tips. Data comes from `parameterScores` filtered by `category` and `agentContent` keyed by agent name.

## Changes

### 1. Fix PDF Export Agent Mapping (`src/lib/fullReportPdfGenerator.ts`)
- Change `'format-web-series': ['WebSeriesFormatAgent']` to `'format-web-series': ['WebSeriesAgent']`
- The actual agent is `WebSeriesAgent`, not `WebSeriesFormatAgent`

### 2. Rewrite WebSeriesAnalysis.tsx to Standard Pattern
Replace the entire custom layout with the standardized structure:
- **SectionHeader**: "Web Series Deep Dive" with episode length badge in subtitle
- **AgentNarrativePanel**: from `reportData.agentContent?.WebSeriesAgent`
- **Episode Length Context**: Keep as a simple Card showing the length class and weight modifiers (this is unique, valuable content)
- **Failure Pattern Warnings**: Keep as a Card when failures are detected (unique content)
- **WeightedParameterList**: All `Web Series` category parameters, using category-based filtering (`p.category === 'Web Series'`) instead of the `WEB_SERIES_PARAMETERS` import
- **Remove**: The custom 3-column parameter card grid with inline progress bars
- **Remove**: The hardcoded "Web Series Optimization" tips card (static content)
- Remove `max-w-7xl mx-auto` wrapper, use `space-y-8` root

### 3. Rewrite RetentionAnalysis.tsx to Standard Pattern
- **SectionHeader**: "Retention Curves" with BarChart3 icon
- **AgentNarrativePanel**: from `StructureAgent` or `WebSeriesAgent`
- **WeightedParameterList**: Filter parameters by keywords `retention`, `pacing`, `engagement`, `momentum` (keep existing filter since there's no dedicated retention category)
- **Remove**: The custom gradient "Retention Score" card (score is already in SectionHeader)
- **Remove**: The redundant fallback card (WeightedParameterList handles empty state)

### 4. Rewrite HooksAnalysis.tsx to Standard Pattern
- **SectionHeader**: "Hook Efficiency" with Zap icon
- **AgentNarrativePanel**: from `ConceptAgent` or `WebSeriesAgent`
- **WeightedParameterList**: Filter parameters by keywords `hook`, `share`, `viral`, `opening`, `attention`
- **Remove**: The custom gradient score cards for the first 2 params (redundant with parameter list)
- **Remove**: Unused `ScoreDisplay` import

## Files Modified
1. `src/lib/fullReportPdfGenerator.ts` -- Fix agent name mapping
2. `src/pages/report/WebSeriesAnalysis.tsx` -- Standardize to report pattern, keep episode length and failure pattern cards
3. `src/pages/report/RetentionAnalysis.tsx` -- Standardize to report pattern
4. `src/pages/report/HooksAnalysis.tsx` -- Standardize to report pattern
