
# Add Sample Series Script with Bible + Sample Series Report

## Overview
Add a TV series pilot sample script and a comprehensive sample report to the library, showcasing the Series Bible Extract feature. This gives users a demo of how Pulse analyzes serialized TV content.

## What Gets Created

### 1. Sample Series Script Data (`src/data/sampleSeriesScript.ts`)
A new pilot script with rich series-appropriate content. The script will be a serialized drama pilot (e.g., a crime/conspiracy thriller) that naturally lends itself to series bible extraction -- world rules, recurring characters, tonal guardrails, and serialization engine.

Exports:
- `SAMPLE_SERIES_SCRIPT` -- metadata (title, logline, genre, scriptType: 'pilot', pageCount)
- `SAMPLE_SERIES_SCENES` -- scene breakdowns with emotional tones
- `SAMPLE_SERIES_CHARACTERS` -- cast with relationships, arc summaries, and dialogue counts

### 2. Sample Series Report Data (`src/data/sampleSeriesReport.ts`)
A full report data file following the same pattern as `sampleReport.ts` and `sampleWebSeriesReport.ts`. This includes:
- All 10 core USAF agent parameter scores (~60 parameters)
- Category scores across all 10 modules
- Lens scores for all stakeholder perspectives
- Rich insights (strengths, opportunities, risks)
- Characters, scenes, and narrative graph
- Series-relevant scores that feed the Series Bible Extract view (world logic, theme, character arc parameters)

Exports:
- `SAMPLE_SERIES_REPORT_DATA` -- full ReportData object
- `SAMPLE_SERIES_REPORT` -- Report object with executive summary

### 3. Sample Series Report Layout Page (`src/pages/SampleSeriesReport.tsx`)
A layout component following the exact pattern of `SampleWebSeriesReport.tsx`:
- Creates a context provider for the report
- Uses `SampleCommandHeader` and `SampleReportSidebar`
- Renders `Outlet` for child routes
- Sets `scriptType` to `'pilot'` so the sidebar shows the "Series Bible" nav item

### 4. Sample Series Script Page (`src/pages/SampleSeriesScript.tsx`)
A dedicated script viewer for the series sample, following the `SampleComicScript.tsx` pattern. Displays the script content, scenes, and characters.

### 5. Add to Sample Scripts Library (`src/data/sampleScripts.ts`)
Add the new series pilot to the `SAMPLE_SCRIPTS` array so it appears in the scripts library.

### 6. Routes (`src/App.tsx`)
Add new routes:
- `/sample-series-report` -- layout with all USAF consolidated child routes (story, characters, craft, commercial, development, scorecard, bible, script)
- `/sample-series-script` -- standalone script viewer

The `/sample-series-report/bible` route will render `SeriesBibleExtract`, which already handles pilot/episode types with the Series Engine section.

## Pipeline Support
The analysis pipeline already fully supports `pilot` and `episode` script types:
- All 10 core USAF agents run for these types
- The `SeriesBibleExtract` page is already wired up in the nav for pilot/episode types via `reportNavigation.ts`
- No pipeline changes needed -- just sample data to demonstrate it

## Files Changed
| File | Action |
|------|--------|
| `src/data/sampleSeriesScript.ts` | New -- script data with scenes and characters |
| `src/data/sampleSeriesReport.ts` | New -- full report data with 60+ parameter scores |
| `src/pages/SampleSeriesReport.tsx` | New -- report layout page |
| `src/pages/SampleSeriesScript.tsx` | New -- script viewer page |
| `src/data/sampleScripts.ts` | Edit -- add series pilot to SAMPLE_SCRIPTS array and update SampleScriptData type |
| `src/App.tsx` | Edit -- add routes for sample-series-report and sample-series-script |

## Technical Details

### Script Concept
Working title: **"The Compound"** -- a conspiracy thriller pilot about a journalist who infiltrates a secretive desert commune only to discover it's a front for a shadowy government experiment. Strong series bible potential: fixed world rules (the compound's structure, hierarchy), tonal guardrails (paranoid thriller), character trajectories (infiltrator to true believer tension), and series engine (weekly revelations about the experiment).

### Report Scores Profile
The pilot format will score:
- High on Concept/Hook (~87), Character (~85), World & Logic (~88)
- Medium on Structure (~80), Market (~78)
- The Series Bible Extract will have rich world rules (fixed vs flexible), clear character arcs, and strong series engine scores

### No Database or Edge Function Changes
This is purely frontend sample data. The analysis pipeline already handles pilot scripts correctly through the existing agent orchestration.
