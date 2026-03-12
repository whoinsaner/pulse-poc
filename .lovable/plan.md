

## Plan: Pre-populate Breakdown Tags from Parsed Data

### Problem
The extraction function sends all 16 categories to the LLM, including **cast** and **locations** (set_dressing/notes), even though characters and locations are already stored in the `characters` and `scenes` tables from the parser.

### Approach
Add a **pre-tagging step** in the `extract-breakdown` edge function that runs before the AI loop. It will:

1. **Characters → `cast` tags**: Query the `characters` table for the script, then cross-reference with `script_lines` to determine which characters appear in which scenes. Insert breakdown tags with `source: 'parser'` and `confidence: 1.0`.

2. **Locations → `set_dressing` tags**: Use each scene's `location` field from the `scenes` table to create a location tag per scene, also with `source: 'parser'` and `confidence: 1.0`.

3. **Exclude pre-tagged categories from AI prompt**: When building the AI prompt for each batch, inform the LLM that `cast` members have already been identified and it should skip them, focusing on the remaining categories (props, wardrobe, VFX, stunts, etc.).

4. **UI distinction**: Tags with `source: 'parser'` will be visually distinct (e.g., a different badge) so users know they came from parsed data, not AI inference.

### Files to Change

1. **`supabase/functions/extract-breakdown/index.ts`**
   - After fetching scenes/lines/existing tags, query the `characters` table
   - Build cast tags per scene by matching `script_lines.character_name` to character names per `scene_number`
   - Build location tags from `scenes.location`
   - Insert these as `source: 'parser'`, `confidence: 1.0` before the AI loop
   - Update the AI system prompt to exclude `cast` from extraction (already handled)

2. **`src/pages/report/ScriptBreakdown.tsx`**
   - Add visual indicator for `source: 'parser'` tags (e.g., a small icon or badge color)

3. **`src/lib/breakdownCategories.ts`** (if needed)
   - Verify no changes needed; categories already include `cast`

### Technical Detail

```text
Pipeline flow:
  1. Fetch characters, scenes, script_lines, existing_tags
  2. Pre-tag: characters → cast tags per scene (via script_lines grouping)
  3. Pre-tag: scene.location → set_dressing tag per scene
  4. Dedup against existing tags
  5. Bulk insert parser tags
  6. AI loop for remaining categories (exclude cast from prompt)
  7. Bulk insert AI tags
```

The `source` field already exists on `breakdown_tags` with values `manual`, `ai`, `ai_accepted`. We'll add `parser` as a new source value. No schema migration needed since `source` is a `text` column.

