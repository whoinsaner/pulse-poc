

# Add `script_lines` Table for Granular Line Storage — ✅ IMPLEMENTED

## Status: Complete
- [x] Database table `script_lines` created with RLS policies (SELECT, INSERT, DELETE via script org membership)
- [x] Composite index on `(script_id, scene_number)` 
- [x] `parseTextFormat` updated to collect lines (dialogue, action, parenthetical, scene_heading, transition)
- [x] `parseComicFormat` updated to collect lines
- [x] All 5 call sites in `script-parser-stream` updated to capture `scriptLines`
- [x] Database save stage: cleanup (`DELETE`) + batch insert (chunks of 500)
- [x] TypeScript types added to `src/types/database.ts`

## Next Steps
- Re-parse a script to populate the `script_lines` table
- Query lines to verify data quality (e.g., Jeevanandam's 135 dialogues in Khaaki Squad)

