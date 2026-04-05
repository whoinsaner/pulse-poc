

# Add Dimension Tiles to Protagonist, Supporting Cast & PDF

## What
Add score dimension tiles (like the Antagonist's Physical/Psychological/Tactical/Dramatic/Overall grid) to the Protagonist and Supporting Cast pages, powered by real parameter data. Also render these tiles in the PDF export for all three character sub-pages.

## Changes

### 1. Protagonist — add 5 dimension tiles
**File**: `src/pages/report/ProtagonistAnalysis.tsx`

Add a `getParamScore` helper (same pattern as Antagonist) and a 5-tile grid after the DiagnosisSummary:

| Tile | Keywords matched against parameterScores |
|------|------------------------------------------|
| Empathy | `empathy`, `relatab`, `likab`, `audience` |
| Complexity | `complex`, `depth`, `dimension`, `psychology` |
| Agency | `agency`, `active`, `drive`, `motivation` |
| Growth | `arc`, `growth`, `transform`, `change` |
| Overall | Average of above 4 |

Icons: Heart, Brain, Target, Zap, User. Uses existing `ScoreDisplay` component, same card layout as Antagonist tiles.

### 2. Supporting Cast — add 4 dimension tiles
**File**: `src/pages/report/SupportingCast.tsx`

Replace the current 4 stat cards (Total Characters, Supporting Roles, Supporting Dialogue %, With Arcs) with a **combined row of 5 tiles**: keep the existing stats but add an Overall score tile using `ScoreDisplay`. Alternatively, add a separate row of dimension tiles below the stats:

| Tile | Keywords |
|------|----------|
| Diversity | `diversity`, `distinct`, `voice`, `variety` |
| Utility | `function`, `utility`, `purpose`, `role` |
| Balance | `balance`, `ensemble`, `distribution` |
| Depth | `depth`, `dimension`, `develop`, `arc` |
| Overall | Average of above 4 |

Icons: Users, Target, Scale, Layers, Shield. Same card + ScoreDisplay layout.

### 3. PDF Generator — render dimension tiles as a table
**File**: `src/lib/fullReportPdfGenerator.ts`

After rendering character profiles in the protagonist and antagonist sections (~lines 588-680), add a small inline table or labeled rows showing the dimension scores. Implementation:

- Extract the same keyword-matched scores from `reportData.parameterScores` in the PDF context
- Render as a simple 1-row table using `autoTable`: columns = dimension names, cells = scores
- Apply to protagonist, antagonist, and supporting cast sections

### 4. Pass parameterScores to PDF renderer
The PDF generator already receives `reportData` which contains `parameterScores`. The `getParamScore` logic will be extracted into a shared helper (or duplicated inline in the PDF generator since it's a simple 5-line function).

## Technical Details
- 2 page files edited (ProtagonistAnalysis.tsx, SupportingCast.tsx)
- 1 PDF generator file edited (fullReportPdfGenerator.ts)
- No new components needed — reuses existing `Card`, `ScoreDisplay`, icons
- All scores derived from real `parameterScores` via keyword matching (same proven pattern as Antagonist)
- No database or edge function changes

