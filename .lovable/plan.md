
# Move "Viewing As" to Header, Remove Top Insights & Group Labels from Sidebar

## Changes

### 1. Move "Viewing As" lens selector to the CommandHeader (top nav bar)

The `LensSelector` dropdown currently lives in the sidebar under a "Viewing As" heading. It will be relocated to the top header bar, positioned to the left of the Export button.

**CommandHeader.tsx changes:**
- Import `LensSelector` from `@/components/LensToggle`
- Add `activeLens` and `setActiveLens` props (already available via `activeLens` prop; add `onLensChange` callback prop)
- Render `<LensSelector>` in the right-side actions area, before the `ExportDialog`
- Only show when `stakeholderLens` is null (same condition as sidebar)

**ReportSidebar.tsx changes:**
- Remove the "Viewing As" section (lines 220-232) including the `LensSelector` import usage in sidebar
- Keep the "Stakeholder Report" badge section as-is (it shows when viewing a locked stakeholder report)

### 2. Remove Top Insights section from the sidebar

Remove the entire "Top Insights" block (lines 248-268) from `ReportSidebar.tsx`. This includes the heading, the insight cards, and the `Sparkles` icon import (if no longer used).

### 3. Remove non-clickable group labels from sidebar navigation

Remove the group label headers (e.g., "Story Analysis", "Characters", "Craft") that appear as uppercase text above each nav group. These are non-interactive text elements at lines 122-126. The nav items themselves remain -- only the category headings are removed.

## Technical Details

**Files modified:**
- `src/components/report/CommandHeader.tsx` -- add `LensSelector`, add `onLensChange` prop
- `src/components/report/ReportSidebar.tsx` -- remove 3 sections (Viewing As, Top Insights, group labels)
- `src/components/report/ReportLayout.tsx` -- pass `setActiveLens` to `CommandHeader` (it already passes `activeLens`)

**Props flow:**
- `ReportLayout` already has `activeLens` and `setActiveLens` state
- `CommandHeader` needs a new `onLensChange` prop mapped to `setActiveLens`
- The existing `stakeholderLens` null-check gates visibility in the header, same as it did in the sidebar
