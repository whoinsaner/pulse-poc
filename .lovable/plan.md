

# Wire MicroDramaAgent + Fix Pilot/Episode Pipeline Gaps

## Summary

After auditing all touchpoints, here are the gaps found and the fixes needed.

## Gap Analysis

### 1. AnalysisTrigger -- MicroDramaAgent Not Dispatched (CRITICAL)
The `getFormatSpecificAgents()` function (line 112-116) only handles `comic` and `web_series`. Micro drama falls through to an empty array, so `MicroDramaAgent` never appears in the UI panel and never gets counted.

### 2. Edge Function -- MicroDramaAgent Not Dispatched (CRITICAL)
In `supabase/functions/analyze-script/index.ts` (lines 2035-2044), the comprehensive analysis block adds agents for comic, web series, interactive, and audio -- but there is no `isMicroDrama` check. The `MicroDramaAgent` is defined in the AGENTS map (line 1226) but never added to `activeAgentNames`, so it is **never actually run**.

### 3. getCategoriesForScriptType Missing Micro Drama
In `reportNavigation.ts` (line 330-366), `getCategoriesForScriptType` returns base categories for micro_drama scripts but never adds `'Micro Drama'` to the list. This affects category-based filtering.

### 4. getAgentCountForScriptType Incomplete
In `reportNavigation.ts` (line 396-399), specialized agent count is hardcoded to only handle comic (4). Web series (1) and micro drama (1) are not counted.

### 5. PDF Export -- Pilot/Episode Gets No Format Section
In `fullReportPdfGenerator.ts` (lines 1133-1178), the format part is only rendered for comic, web_series, and micro_drama. Pilots and episodes (which have a Format Diagnosis nav item and page) get nothing in the PDF.

### 6. Stakeholder Config -- MicroDramaAgent Not in Stakeholder Mappings
In the edge function's `STAKEHOLDER_AGENTS` (lines 2003-2013), no stakeholder lens includes `MicroDramaAgent`. So stakeholder-specific runs on micro drama scripts will skip it entirely.

## Changes

### File 1: `src/components/AnalysisTrigger.tsx`
- Add `MICRO_DRAMA_AGENTS` array (similar to `WEB_SERIES_AGENTS`):
  ```
  const MICRO_DRAMA_AGENTS = [
    { name: 'MicroDramaAgent', label: 'Micro Drama', module: 'MD', icon: Smartphone },
  ];
  ```
- Update `getFormatSpecificAgents()` to include a check for `scriptType === 'micro_drama'` returning `MICRO_DRAMA_AGENTS`
- Import `Smartphone` icon (already imported at line 12 -- verify)

### File 2: `supabase/functions/analyze-script/index.ts`
- Add `microDramaAgents` constant: `const microDramaAgents = ['MicroDramaAgent'];`
- Add `isMicroDrama` check: `const isMicroDrama = scriptType === 'micro_drama';`
- In the comprehensive block (line 2042), add: `if (isMicroDrama) activeAgentNames.push(...microDramaAgents);`
- In the stakeholder block, add micro drama agent for relevant stakeholders (ott_platform, investor, producer, writer)
- Update the log line to include `micro_drama: ${isMicroDrama}`

### File 3: `src/lib/reportNavigation.ts`
- In `getCategoriesForScriptType`, add a micro drama check returning `[...baseCategories, 'Micro Drama']`
- In `getAgentCountForScriptType`, update specialized count logic:
  - comic: 4, web_series: 1, micro_drama: 1, others: 0

### File 4: `src/lib/fullReportPdfGenerator.ts`
- After the micro_drama block (line 1178), add a pilot/episode block:
  ```
  else if (scriptType === 'pilot' || scriptType === 'episode') {
    renderPartDivider(doc, pageNum, 'PART IV', 'FORMAT ANALYSIS', toc);
    const formatSections = [
      { id: 'format', title: 'Format Diagnosis', subtitle: 'Structure and pacing for pilot/episode format' },
    ];
    for (const sec of formatSections) { ... }
  }
  ```
- Update `marketPartNum` on line 1181 to also include pilot/episode in the "PART V" condition

### File 5: No changes needed
- `MicroDramaAnalysis.tsx` -- already properly wired (uses `MicroDramaFormatAgent` agent content, filters by `'Micro Drama'` category, uses standard report UI components)
- `FormatDiagnosis.tsx` -- already handles pilot/episode gracefully with a simplified view
- `App.tsx` routes -- `format/micro-drama` route already exists at line 156
- `reportNavigation.ts` nav items -- micro drama and pilot/episode already listed in the format group
- PDF agent/category maps -- `format-micro-drama` already mapped at lines 92 and 118

## Files Modified
1. `src/components/AnalysisTrigger.tsx` -- Add MicroDramaAgent to the analysis panel
2. `supabase/functions/analyze-script/index.ts` -- Wire MicroDramaAgent into agent dispatch
3. `src/lib/reportNavigation.ts` -- Add Micro Drama category, fix agent counts
4. `src/lib/fullReportPdfGenerator.ts` -- Add pilot/episode format section to PDF

