
# Standardize Report Layout Across All Script Types and Samples

## Problem

The "Vaddi Kaasula Vaada" report uses the USAF consolidated layout with a **left sidebar navigation** (ReportSidebar), **CommandHeader**, and diagnosis-first page structure. However, the four sample reports use inconsistent patterns:

| Report | Layout | Navigation | Status |
|--------|--------|-----------|--------|
| Live reports (`/report/:runId`) | Sidebar + CommandHeader | USAF nav groups | Standard (the target) |
| Sample Feature Film | ActionRail (right) + SampleCommandHeader (tabs) | USAF nav groups | Needs sidebar conversion |
| Sample Comic | ActionRail (right) + SampleCommandHeader (tabs) | USAF nav groups | Needs sidebar conversion |
| Sample Web Series | WebSeriesActionRail + WebSeriesCommandHeader | USAF nav groups | Needs sidebar conversion |
| Sample Micro Drama | ActionRail + SampleCommandHeader | **Legacy routes** (old pages) | Needs full overhaul |

Additionally, the **micro-drama sample** still uses legacy routes (`/concept`, `/plot`, `/protagonist`, etc.) pointing to old page components instead of the consolidated USAF pages.

## Solution

### Part 1: Create a Unified Sample Report Layout

Replace the 4 separate sample layout files with a single `UnifiedSampleReportLayout` component that mirrors the live `ReportLayout` structure:

- **Left sidebar** using `ReportSidebar` (or a sample-specific variant that doesn't need `runId`)
- **CommandHeader** with a "Sample" banner
- Dynamic navigation via `getUSAFNavGroups(scriptType)` -- already working for most
- Passes the same `ReportContextValue` shape via `Outlet context`

**Files to create:**
- `src/components/report/SampleReportSidebar.tsx` -- A sidebar variant for sample reports that accepts `basePath` instead of `runId`

**Files to modify:**
- `src/pages/SampleReport.tsx` -- Replace ActionRail layout with sidebar layout
- `src/pages/SampleComicReport.tsx` -- Replace ActionRail layout with sidebar layout
- `src/pages/SampleWebSeriesReport.tsx` -- Replace WebSeriesActionRail layout with sidebar layout
- `src/pages/SampleMicroDramaReport.tsx` -- Replace legacy layout with sidebar layout, update context to match standard shape

### Part 2: Standardize Micro-Drama Routes

Update `src/App.tsx` to replace the micro-drama sample's legacy routes with the USAF consolidated routes:

**Before (legacy):**
```
/sample-micro-drama-report/concept -> ConceptHook
/sample-micro-drama-report/plot -> PlotAnalysis
/sample-micro-drama-report/protagonist -> ProtagonistAnalysis
/sample-micro-drama-report/micro-drama -> MicroDramaAnalysis
```

**After (USAF standard):**
```
/sample-micro-drama-report/ -> ReportCover
/sample-micro-drama-report/story -> StoryDiagnosis
/sample-micro-drama-report/story/concept -> StoryConceptHook
/sample-micro-drama-report/characters -> CharacterDiagnosis
/sample-micro-drama-report/craft -> CraftDiagnosis
/sample-micro-drama-report/format -> FormatDiagnosis (micro-drama specific)
/sample-micro-drama-report/commercial -> CommercialDiagnosis
/sample-micro-drama-report/development -> DevelopmentPriorities
/sample-micro-drama-report/scorecard -> CompleteScorecard
/sample-micro-drama-report/narrative -> ReportNarrative
```

Legacy micro-drama routes will redirect to their USAF counterparts.

### Part 3: Add Scene Analysis Route to All Sample Reports

The `narrative` route (Scene Analysis) currently exists for Feature Film and Comic samples but is missing from the navigation config for some types. Ensure all sample reports include the route and the nav item appears correctly.

### Part 4: Ensure Navigation Visibility Rules

Update `USAF_NAV_GROUPS` in `reportNavigation.ts` to handle micro-drama correctly:

- **Format group**: Already includes `micro_drama` in applicable types -- verify it shows the right FormatDiagnosis content
- **Series Bible**: Already restricted to episodic types including `micro_drama`
- **Scene Analysis**: Already added to Craft group with no type restriction (shows for all)

### Part 5: Ensure Correct Context Shape

All report pages consume context via `useOutletContext<ReportContextValue>()`. The context must include:
- `reportData: ReportData`
- `activeLens: StakeholderLens`
- `currentScore: number`
- `isComic: boolean`
- `scriptType: ScriptType`

Currently the sample layouts provide slightly different shapes. Standardize all of them to match the live `ReportLayout` context shape.

## Technical Details

### SampleReportSidebar Component

A lightweight adaptation of `ReportSidebar` that:
- Accepts `basePath` (e.g., `/sample-report`) instead of `runId`
- Navigates to `basePath + item.path` instead of `/report/${runId}${item.path}`
- Includes the same score ring, readiness label, and collapsible nav
- No export dialog or stakeholder lens section (sample-specific)

### Sample Layout Consolidation

Each of the 4 sample layouts will be updated to use the same structure:

```
<div className="min-h-screen bg-background flex flex-col">
  <SampleBanner ... />
  <CommandHeader-like top bar />
  <div className="flex-1 flex">
    <SampleReportSidebar ... />
    <main className="flex-1 overflow-auto">
      <Outlet context={contextValue} />
    </main>
  </div>
</div>
```

### Route Changes in App.tsx

**Micro-drama sample** -- full USAF route replacement (same pattern as other samples):
- Add: `index -> ReportCover`, `story -> StoryDiagnosis`, all USAF sub-routes
- Add: `format -> FormatDiagnosis` (for micro-drama format analysis)
- Add: `narrative -> ReportNarrative`
- Redirect legacy routes (`/concept`, `/plot`, etc.) to USAF equivalents

**All sample reports** -- ensure `narrative` route exists (already present for Feature Film and Comic, needs adding for Web Series and Micro Drama if missing).

### Files Changed Summary

| File | Change |
|------|--------|
| `src/components/report/SampleReportSidebar.tsx` | New: sidebar for sample reports |
| `src/pages/SampleReport.tsx` | Replace ActionRail with SampleReportSidebar |
| `src/pages/SampleComicReport.tsx` | Replace ActionRail with SampleReportSidebar |
| `src/pages/SampleWebSeriesReport.tsx` | Replace WebSeriesActionRail with SampleReportSidebar |
| `src/pages/SampleMicroDramaReport.tsx` | Full overhaul to USAF layout with sidebar |
| `src/App.tsx` | Micro-drama routes to USAF; ensure narrative route for all samples |
| `src/lib/reportNavigation.ts` | Add `micro_drama` to Format group if missing; verify all nav items |

### No Pipeline/Agent/Prompt Changes Needed

The report structure is purely a frontend concern. The analysis pipeline, agents, and prompts already produce the same `full_report_data` shape regardless of script type. The USAF pages (StoryDiagnosis, CraftDiagnosis, etc.) already handle all script types by reading from `reportData.parameterScores` and `reportData.agentContent` dynamically.
