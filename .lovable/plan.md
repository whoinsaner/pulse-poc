

# Make PDF Format Analysis Section Adaptive by Script Type

## Problem
The PDF generator's "PART IV: FORMAT ANALYSIS" section (lines 1131-1154) is script-type-aware for comics (renders 5 sub-sections), but for web series it only renders a single generic "Format Diagnosis" page. The three web series sub-pages just wired into the UI (Web Series Deep Dive, Retention Curves, Hook Efficiency) are completely missing from the PDF output.

## Current State
```text
Comic:    Format Diagnosis + Panel Flow + Lettering + Page Turns + Art-Script Synergy  (5 pages)
Web Series: Format Diagnosis only  (1 page -- missing 3 sub-pages)
Micro Drama: Format Diagnosis only  (1 page)
```

## Target State
```text
Comic:      Format Diagnosis + Panel Flow + Lettering + Page Turns + Art-Script Synergy  (5 pages)
Web Series: Format Diagnosis + Web Series Deep Dive + Retention Curves + Hook Efficiency  (4 pages)
Micro Drama: Format Diagnosis  (1 page, unchanged)
```

## Changes

### File: `src/lib/fullReportPdfGenerator.ts`

**1. Expand the web series branch (lines 1148-1154)**

Replace the single-page web series/micro_drama block with branching logic:
- **Web Series**: Render "Format Diagnosis" followed by the 3 sub-pages using `renderSection()` with the existing `SECTION_AGENT_MAP` and `SECTION_CATEGORY_MAP` entries (`format-web-series`, `format-retention`, `format-hooks`)
- **Micro Drama**: Keep the single "Format Diagnosis" page as-is (no sub-pages exist for micro_drama)

The new web series sections definition:
```text
format         -> "Format Diagnosis"       / "Web series format overview"
format-web-series -> "Web Series Deep Dive" / "Episode length tiers, digital-first optimization"
format-retention  -> "Retention Curves"     / "Retention design, pacing, and engagement metrics"
format-hooks      -> "Hook Efficiency"      / "Opening hooks, shareability, and attention capture"
```

Each section uses the already-configured agent and category mappings from earlier work, so `renderSection()` will pull agent narratives and parameter cards automatically.

**2. Update Part IV title for web series**

Change the part divider title from generic "FORMAT ANALYSIS" to "WEB SERIES FORMAT" when the script type is `web_series`, matching how comics get "COMIC FORMAT".

No other files need changes -- the agent mappings, category mappings, and navigation config are already correct from the previous implementation.

