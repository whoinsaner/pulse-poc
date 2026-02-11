
# Merge Development Focus into Parent Diagnosis Pages

## What Changes
Each report section (Story, Characters, Craft, Commercial) currently has a separate "Development Focus" sub-page accessible via sidebar navigation. This change merges that content directly into the bottom of each section's main diagnosis page, then removes the standalone pages, nav items, and routes.

## Affected Sections
- **Story Diagnosis** -- absorb StoryDevelopmentFocus content
- **Character Diagnosis** -- absorb CharacterDevelopmentFocus content
- **Craft Diagnosis** -- already has inline development items (just needs the full `DevelopmentFocus` component added)
- **Commercial Diagnosis** -- already has inline development items (just needs the full `DevelopmentFocus` component added)

## Changes by File

### 1. `src/pages/report/StoryDiagnosis.tsx`
- Import `DevelopmentFocus` from report UI components
- Add a `developmentItems` memo that filters story parameters scoring below 70, sorted ascending
- Render a `DevelopmentFocus` card at the bottom of the page with cross-links to Characters and Craft

### 2. `src/pages/report/CharacterDiagnosis.tsx`
- Import `DevelopmentFocus` from report UI components
- Add a `developmentItems` memo filtering character parameters below 70
- Render a `DevelopmentFocus` card at the bottom with cross-links to Story and Craft

### 3. `src/pages/report/CraftDiagnosis.tsx`
- Already computes `developmentItems` (lines 70-79) but doesn't render them
- Add a `DevelopmentFocus` card at the bottom using the existing `developmentItems` with cross-links to Story and Characters

### 4. `src/pages/report/CommercialDiagnosis.tsx`
- Already computes `developmentItems` (lines 71-80) but doesn't render them
- Add a `DevelopmentFocus` card at the bottom using the existing `developmentItems` with cross-links to Story and Craft

### 5. `src/lib/reportNavigation.ts`
- Remove 4 nav items from `USAF_NAV_GROUPS`:
  - `story-focus` (line 96)
  - `character-focus` (line 108)
  - `craft-focus` (line 122)
  - `commercial-focus` (line 141)

### 6. `src/App.tsx`
- Remove all `*/focus` route registrations (appears in 3 route groups for real reports, sample reports, and comic reports)
- Remove the imports for `StoryDevelopmentFocus`, `CharacterDevelopmentFocus`, `CraftDevelopmentFocus`, `CommercialDevelopmentFocus`

### 7. Delete standalone pages (4 files)
- `src/pages/report/StoryDevelopmentFocus.tsx`
- `src/pages/report/CharacterDevelopmentFocus.tsx`
- `src/pages/report/CraftDevelopmentFocus.tsx`
- `src/pages/report/CommercialDevelopmentFocus.tsx`

## Result
- 4 fewer sidebar nav items
- 4 fewer routes
- 4 deleted page files
- Development focus content appears inline at the bottom of each diagnosis page, keeping all relevant information in one place
