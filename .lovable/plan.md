

# Wire Script Page to Real Extracted Data

## Problem
The Script page inside the report (`/report/:id/script`) renders the hardcoded `SampleScript` component with demo data ("The Last Signal"), not the actual parsed script. The sidebar Quick Stats show real numbers (91 pages, 74 scenes) while the content area shows sample data (8 scenes, 5 characters) -- a visible mismatch.

## Solution
Create a new `ReportScript.tsx` page that uses the existing `ScriptContentViewer` component (which already fetches real scenes, characters, and narrative graphs from the database) and wires it to the report's actual `script_id`.

## Changes

### 1. Create `src/pages/report/ReportScript.tsx`
A new page component that:
- Gets the `report` object from `useReport()` context (which has `script_id`)
- Fetches the script metadata (title, genre, page count, logline) from the `scripts` table using `report.script_id`
- Renders a header with real script metadata (title, genre, page count, script type)
- Embeds the existing `ScriptContentViewer` component, passing the real `script_id`
- Shows a loading skeleton while data loads
- Handles missing script gracefully

### 2. Update `src/App.tsx` routing
Replace the `SampleScript` import on the report script route with the new `ReportScript` component. Only the real report routes change -- sample report routes keep using `SampleScript`.

Specifically:
- Line ~149: Change `<Route path="script" element={<SampleScript />} />` inside the `/report/:runId` layout to use `<ReportScript />`
- Keep `SampleScript` for sample report routes (sample-report, sample-comic-report, etc.)

### Technical Details

**Data flow:**
```text
ReportLayout (fetches report with script_id)
  -> ReportScript (reads report from useReport() context)
    -> fetches script metadata from 'scripts' table
    -> ScriptContentViewer (fetches scenes, characters, narrative_graphs by script_id)
```

**Files modified:**
- `src/pages/report/ReportScript.tsx` -- new file
- `src/App.tsx` -- swap import on real report route only

**Files unchanged:**
- `src/components/ScriptContentViewer.tsx` -- already works with any script_id
- `src/pages/SampleScript.tsx` -- kept for sample/demo routes
