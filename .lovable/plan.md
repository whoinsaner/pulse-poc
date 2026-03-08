

# Align PDF Report with Web Report

## Gaps Identified

Comparing web navigation (USAF_NAV_GROUPS) with PDF generator sections:

| Web Section | PDF Status |
|---|---|
| Cover | ✓ |
| Story (Diagnosis, Concept, Structure, Conflict) | ✓ |
| Characters (Diagnosis, Protagonist, Antagonist, Cast) | ✓ |
| Craft (Diagnosis, Dialogue, Theme, Visual, Emotional, Scene Economy) | ✓ |
| **Scene Analysis** (Narrative Timeline, Scene Heatmap, Pacing, Complexity) | **Missing** |
| Format sections (conditional by type) | ✓ |
| **Series Bible** (for pilot/episode/web_series/micro_drama) | **Missing** |
| Commercial (Diagnosis, Market, Production) | ✓ |
| Development Priorities | ✓ |
| Scorecard | ✓ |
| Script | Skipped (impractical for PDF) |

PDF-only extras (acceptable): Executive Summary, Character Reference appendix, Scene Index appendix.

## Plan

### 1. Add Scene Analysis to PDF (in Part III Craft, after Scene Economy)
- **File**: `src/lib/fullReportPdfGenerator.ts`
- Add `scene-analysis` to `SECTION_AGENT_MAP` mapping to relevant agents
- After the craft sections loop, render a "Scene Analysis" page with:
  - Scene-level data table using `autoTable` (scene #, heading, emotional tone, tension level, page)
  - Pacing summary from scene data (avg scene length, scene count)
  - This is a data-table approximation since visual charts (heatmaps, timelines) can't render in jsPDF

### 2. Add Series Bible to PDF (conditional, after Format sections)
- **File**: `src/lib/fullReportPdfGenerator.ts`
- Add `bible` to `SECTION_AGENT_MAP` mapping to relevant agent keys (ThemeAgent, CharacterAgent, WorldAgent as fallbacks)
- For applicable script types (web_series, pilot, episode, micro_drama), render a "Series Bible" section with agent narrative content
- Extract structured bible data (core premise, world rules, tonal guardrails, character trajectories, series engine) from agent content and render as formatted subsections

### 3. Update SECTION_AGENT_MAP
- **File**: `src/lib/fullReportPdfGenerator.ts`
- Add entries:
  - `'scene-analysis': ['SceneEconomyAgent', 'StructureAgent']`
  - `'bible': ['SeriesBibleAgent', 'WorldAgent', 'ThemeAgent', 'CharacterDiagnosisAgent']`

### Files
- **Edit**: `src/lib/fullReportPdfGenerator.ts` — add Scene Analysis section in Part III, add Series Bible section in Part IV (conditional), update agent mappings

