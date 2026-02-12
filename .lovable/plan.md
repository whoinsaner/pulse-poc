# Wire Web Series Sub-Pages Under Format Diagnosis

## Problem

Comics have 4 dedicated sub-pages under Format Diagnosis (Panel Flow, Lettering, Page Turns, Art-Script Synergy), but web series has **none**. Three fully-built web series pages exist but are orphaned -- their routes just redirect to `/format`:

- `WebSeriesAnalysis.tsx` -- 13-parameter digital series evaluation with episode length tiers
- `RetentionAnalysis.tsx` -- Retention curve design and engagement metrics
- `HooksAnalysis.tsx` -- Hook efficiency and shareability scoring

These pages are data-driven and ready to use but inaccessible from the sidebar.

## Solution

Add 3 web series sub-pages to the Format navigation group, mirroring the comic pattern. Wire the routes to point to the existing pages instead of redirecting.

## Changes

### 1. Navigation Config (`src/lib/reportNavigation.ts`)

Add 3 new nav items under the Format group, after the comic-specific items:

- **Web Series Deep Dive** (`/format/web-series`) -- `applicableTypes: ['web_series']`
- **Retention Curves** (`/format/retention`) -- `applicableTypes: ['web_series']`
- **Hook Efficiency** (`/format/hooks`) -- `applicableTypes: ['web_series']`

### 2. Route Definitions (`src/App.tsx`)

Replace the 3 redirect routes with actual page renders:

- `format/web-series` renders `WebSeriesAnalysis` (instead of redirecting to `/format`)
- `format/retention` renders `RetentionAnalysis` (instead of redirecting to `/format`)
- `format/hooks` renders `HooksAnalysis` (instead of redirecting to `/format`)

Keep the old top-level redirect routes (`/web-series`, `/retention`, `/hooks`) as-is for backward compatibility with bookmarks.

### 3. PDF Export Mapping (`src/lib/fullReportPdfGenerator.ts`)

Add section-to-agent and section-to-category mappings for the new section IDs:

- `format-web-series`: agents `['WebSeriesFormatAgent']`, categories `['Web Series']`
- `format-retention`: agents `['StructureAgent', 'ConflictAgent']`, categories `['Web Series']`
- `format-hooks`: agents `['ConceptAgent']`, categories `['Web Series']`

### Files Modified

1. `src/lib/reportNavigation.ts` -- Add 3 nav items
2. `src/App.tsx` -- Wire 3 sub-routes under format
3. `src/lib/fullReportPdfGenerator.ts` -- Add PDF export mappings

Ensure all touchpoints across the system are addressed and the report pages are powered by real data produced by the pipeline. 