

# Add Metadata Pills to Report Cover

## What Changes

Add a row of styled pill badges below the script title on the Report Cover page showing: **Script Type**, **Pages**, **Scenes**, **Characters**, **Genre**, **Subgenre**, and **Theme**.

Currently, only "Comic . 90 pages" appears as plain text. This will be replaced with distinct, visually scannable pills.

## Data Availability

| Field | Currently Available? | Source |
|-------|---------------------|--------|
| Script Type | Yes | `scriptMetadata.scriptType` |
| Pages | Yes | `scriptMetadata.pageCount` |
| Scenes | Yes | `reportData.scenes.length` |
| Characters | Yes | `reportData.characters.length` |
| Genre | Yes | `scriptMetadata.genre` (from `scripts.genre`) |
| Subgenre | No -- needs new DB column + extraction | New |
| Theme | No -- needs new DB column + extraction | New |

## Implementation Steps

### Step 1: Database Migration -- Add columns to `scripts` table

Add `subgenre` (text, nullable) and `theme` (text, nullable) columns to the `scripts` table so they can be stored after parsing.

### Step 2: Update `scriptMetadata` in ReportData type

Add `subgenre`, `theme`, `sceneCount`, and `characterCount` to the `scriptMetadata` interface in `src/types/database.ts`.

### Step 3: Update the parser to extract genre, subgenre, and theme

Modify `supabase/functions/script-parser-stream/index.ts` to add a lightweight AI classification step during the finalize stage. After scenes and characters are extracted, send the raw text (first ~3000 chars) to AI to identify:
- Genre (if not already set on the script)
- Subgenre
- Primary theme

Then update the `scripts` table with these values alongside the existing `page_count` update.

### Step 4: Update the analyze-script function

In `supabase/functions/analyze-script/index.ts`, include the new fields when building `scriptMetadata` in the report data object (~line 3451):
- `subgenre: script.subgenre`
- `theme: script.theme`
- `sceneCount: scenes.length`
- `characterCount: characters.length`

### Step 5: Update ReportCover UI with pills

Modify `src/pages/report/ReportCover.tsx` to replace the current plain-text metadata line (lines 130-144) with styled Badge pills:

```text
[Comic]  [90 pages]  [42 scenes]  [12 characters]  [Sci-Fi]  [Dystopian]  [Redemption]
```

Each pill will use the existing `Badge` component with `variant="secondary"` styling, displayed in a flex-wrap row below the title.

### Step 6: Update ReportHero (secondary view)

Also update `src/components/report/ReportHero.tsx` to include the new fields in its quick stats section for consistency.

### Step 7: Deploy edge functions

Deploy both `script-parser-stream` and `analyze-script` after updates.

## Technical Details

### AI Classification Prompt (Parser)

A single lightweight AI call during the finalize stage extracts genre/subgenre/theme:

```
Analyze this script excerpt and return JSON:
{"genre": "...", "subgenre": "...", "theme": "..."}
- genre: Primary genre (e.g., Action, Drama, Comedy, Sci-Fi, Horror)
- subgenre: More specific classification (e.g., Dystopian, Coming-of-Age, Noir)  
- theme: Central thematic concern in 1-3 words (e.g., Redemption, Identity, Power)
```

This uses `google/gemini-2.5-flash-lite` for speed and low cost.

### Files Changed

| File | Change |
|------|--------|
| New migration SQL | Add `subgenre`, `theme` columns to `scripts` |
| `src/types/database.ts` | Add fields to `scriptMetadata` interface |
| `supabase/functions/script-parser-stream/index.ts` | Add AI classification step at finalize |
| `supabase/functions/analyze-script/index.ts` | Include new fields in reportData |
| `src/pages/report/ReportCover.tsx` | Replace text metadata with pill badges |
| `src/components/report/ReportHero.tsx` | Add new fields to quick stats |

### Backward Compatibility

- New columns are nullable, so existing scripts won't break
- Pills gracefully hide when data is missing (conditional rendering)
- Re-parsing existing scripts will populate the new fields

