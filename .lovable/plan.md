

# Comparable Titles Table with Similarity Score

## What
Replace the current simple list rendering of comparable titles in `CommercialNarrativePanel` with a proper table using shadcn `Table` components. Add a `similarityScore` field to the data contract so the AI pipeline returns a numeric similarity percentage for each comparable title.

## Changes

### 1. Update the data contract
- **`src/types/database.ts`** — Extend `comparableTitles` type from `{ title: string; relevance: string }` to `{ title: string; relevance: string; similarityScore?: number }`.
- **`supabase/functions/analyze-script/index.ts`** — Update the MarketAgent output schema prompt to include `"similarityScore": 0-100` for each comparable title entry. Also update the ConceptAgent comparableTitles prompt similarly.

### 2. Render as a table
- **`src/components/report/AgentNarrativePanel.tsx`** — Replace the comparable titles `<div>` list (lines 276-287) with a `<Table>` using columns: Title, Relevance, Similarity Score. The similarity score column shows a colored progress bar + numeric value. Gracefully handle missing `similarityScore` (show "—" if not present from older reports).

### 3. PDF export update
- **`src/lib/fullReportPdfGenerator.ts`** — Update the comparable titles PDF section to render as an autoTable with 3 columns (Title, Relevance, Similarity %) instead of the current plain text list.

## Table Design
```text
┌──────────────────────┬──────────────────────────────────────┬────────────┐
│ Title                │ Relevance                            │ Similarity │
├──────────────────────┼──────────────────────────────────────┼────────────┤
│ Vikram (2022)        │ Indian action-thriller with branded… │ ██████ 78% │
│ Jigarthanda DX (23) │ Tamil commercial storytelling that…  │ █████  72% │
│ Daredevil (Netflix)  │ Grounded vigilante superhero tone…   │ ████   65% │
└──────────────────────┴──────────────────────────────────────┴────────────┘
```

## Files
- **Edit**: `src/types/database.ts` — add `similarityScore` to comparableTitles type
- **Edit**: `supabase/functions/analyze-script/index.ts` — add similarityScore to MarketAgent + ConceptAgent prompt schemas
- **Edit**: `src/components/report/AgentNarrativePanel.tsx` — table rendering with progress bar
- **Edit**: `src/lib/fullReportPdfGenerator.ts` — PDF table for comparables

