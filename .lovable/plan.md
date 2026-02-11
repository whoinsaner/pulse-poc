
# Add Sub-Navigation to Characters Section

## New Sidebar Structure

```text
Characters
  +-- Character Diagnosis (overview with scores + diagnosis summary + parameters)
  +-- Protagonist (dedicated protagonist analysis page - already exists)
  +-- Antagonist (dedicated antagonist analysis page - already exists)
  +-- Supporting Cast (dedicated supporting cast page - already exists)
  +-- Development Focus (character-specific low-scoring parameters and priorities)
```

## Implementation Steps

### 1. Update Navigation Config (`src/lib/reportNavigation.ts`)

Replace the single "Characters" nav item with 5 sub-items:

| Nav Item | Route Path | Icon | Notes |
|----------|-----------|------|-------|
| Character Diagnosis | `/characters` | Users | Existing page, simplified |
| Protagonist | `/characters/protagonist` | User | Reuses existing `ProtagonistAnalysis` page |
| Antagonist | `/characters/antagonist` | UserX | Reuses existing `AntagonistAnalysis` page |
| Supporting Cast | `/characters/cast` | Users | Reuses existing `SupportingCast` page |
| Development Focus | `/characters/focus` | Target | New page for character development priorities |

### 2. Simplify CharacterDiagnosis Page (`src/pages/report/CharacterDiagnosis.tsx`)

Keep as the overview/landing page:
- Retain: SectionHeader, DiagnosisSummary, WeightedParameterList, CharacterAgent narrative
- Remove: DimensionCard deep-dives (Agency/Arc, Internal Depth, Voice/Distinction) and DevelopmentFocus section -- these are covered by the sub-pages

### 3. Create New Page: `src/pages/report/CharacterDevelopmentFocus.tsx`

- Extracts the development focus content from CharacterDiagnosis
- Shows character parameters scoring below 70, sorted by score
- Links to related sections (Story, Craft)
- Same pattern as `StoryDevelopmentFocus.tsx`

### 4. Add Routes (`src/App.tsx`)

Register new nested routes under all report route groups:

```
<Route path="characters/protagonist" element={<ProtagonistAnalysis />} />
<Route path="characters/antagonist" element={<AntagonistAnalysis />} />
<Route path="characters/cast" element={<SupportingCast />} />
<Route path="characters/focus" element={<CharacterDevelopmentFocus />} />
```

The existing `ProtagonistAnalysis`, `AntagonistAnalysis`, and `SupportingCast` page components are reused as-is -- no new components needed for those three.

### 5. Sidebar Rendering

No changes needed to `ReportSidebar.tsx` -- it already supports rendering multiple items per group with indentation (added during the Story Analysis work).

## Technical Details

- All pages use `useOutletContext<ReportContextValue>()` for report data access
- Navigation paths use relative routing consistent with existing architecture
- Three existing page components (`ProtagonistAnalysis`, `AntagonistAnalysis`, `SupportingCast`) are mapped to new nested paths -- no code duplication
- Only one new file is created (`CharacterDevelopmentFocus.tsx`)
