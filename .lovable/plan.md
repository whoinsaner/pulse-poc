

# Add Sub-Navigation to Story Analysis

## What Changes

The "Story Analysis" group in the left sidebar currently has a single "Story" link. This plan adds 4 sub-navigation items under it and splits the current Story Diagnosis page into 4 standalone pages.

## New Sidebar Structure

```text
Story Analysis
  +-- Story Diagnosis (overview with scores + diagnosis summary)
  +-- Concept & Hook (ConceptAgent content + concept parameters)
  +-- Conflict & Stakes (ConflictAgent content + conflict parameters)  
  +-- Development Focus (story-specific development priorities)
```

## Implementation Steps

### 1. Update Navigation Config (`src/lib/reportNavigation.ts`)

Add sub-items to the Story Analysis nav group in `USAF_NAV_GROUPS`:

| Nav Item | Route Path | Icon |
|----------|-----------|------|
| Story Diagnosis | `/story` | BookOpen |
| Concept & Hook | `/story/concept` | Lightbulb |
| Conflict & Stakes | `/story/conflict` | Zap |
| Development Focus | `/story/focus` | Target |

### 2. Create 3 New Page Components

**`src/pages/report/StoryConceptHook.tsx`**
- Extracts the "Concept & Hook" section from StoryDiagnosis
- Shows ConceptAgent narrative panel
- Shows parameters filtered to `Concept & Hook` category
- Reuses existing `AgentNarrativePanel`, `WeightedParameterList` components

**`src/pages/report/StoryConflictStakes.tsx`**
- Extracts the "Conflict & Stakes" section from StoryDiagnosis
- Shows ConflictAgent narrative panel
- Shows parameters filtered to `Conflict` category

**`src/pages/report/StoryDevelopmentFocus.tsx`**
- Shows story-specific development priorities (low-scoring story parameters)
- Uses the existing `DevelopmentFocus` component with story parameters
- Links to related sections (Characters, Craft)

### 3. Simplify StoryDiagnosis Page (`src/pages/report/StoryDiagnosis.tsx`)

- Keep as the overview/landing page for Story Analysis
- Retain: SectionHeader, DiagnosisSummary, WeightedParameterList
- Remove: Individual agent content sections (ConceptAgent, ConflictAgent) and DevelopmentFocus -- these move to their own pages
- Keep StructureAgent content inline (no dedicated sub-page)

### 4. Add Routes (`src/App.tsx`)

Add nested routes under the report layout for all report route groups (live reports, sample reports):

```
<Route path="story/concept" element={<StoryConceptHook />} />
<Route path="story/conflict" element={<StoryConflictStakes />} />
<Route path="story/focus" element={<StoryDevelopmentFocus />} />
```

### 5. Update Sidebar Rendering (`src/components/report/ReportSidebar.tsx`)

The sidebar already renders nav items from `navGroups`. Since the new items are added to the nav config, they will automatically appear. The sub-items will be visually indented under the "Story Analysis" group label using slightly smaller text and left padding.

## Technical Details

- All new pages use `useOutletContext<ReportContextValue>()` to access report data (same pattern as existing pages)
- Navigation paths use relative routing (`/report/:runId/story/concept`) consistent with the existing architecture
- The sidebar active-state logic (`item.path === currentPath`) works automatically since paths are unique
- Sub-items get `pl-6` indentation to visually nest under the parent group
