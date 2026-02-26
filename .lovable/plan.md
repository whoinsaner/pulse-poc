

# Add `script_lines` Table for Granular Line Storage

## Overview
Create a new `script_lines` table to store every parsed line (dialogue, action, parenthetical) from a script. The parser already processes these lines individually but currently only stores aggregate counts. This change captures the raw data as a permanent, queryable asset.

## Why This Matters
- **Audit stopword filtering**: Query exactly which lines were attributed to which character
- **Dialogue quality analysis**: Agents can assess voice consistency, subtext, vocabulary per character
- **Character interaction mapping**: Find scenes where characters talk to each other
- **No re-parsing needed**: Future analysis features can query lines directly instead of re-processing PDFs

## Database Changes

### New table: `script_lines`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | auto-generated |
| script_id | uuid (FK) | references scripts |
| scene_number | integer | which scene this line belongs to |
| line_number | integer | sequential within the script |
| character_name | text (nullable) | null for action/direction lines |
| line_type | text | `dialogue`, `action`, `parenthetical`, `scene_heading`, `transition` |
| content | text | the actual line text |
| page_number | integer (nullable) | estimated page |
| created_at | timestamptz | default now() |

### RLS Policies
- **SELECT**: org members via script join (same pattern as `scenes`/`characters`)
- **INSERT**: org members via script join
- **DELETE**: org members via script join (needed for re-parse cleanup)

### Index
- Composite index on `(script_id, scene_number)` for fast per-scene queries

## Edge Function Changes (`script-parser-stream/index.ts`)

### In `parseTextFormat`:
- As the function iterates lines and detects character cues + dialogue, collect each line into a `scriptLines` array with `line_type`, `character_name`, `content`, `scene_number`, and `page_number`

### In `parseComicFormat`:
- Same approach: capture panel descriptions, character dialogue, and captions as individual lines

### In the main handler (Stage 5 - Save to database):
- Add cleanup: `DELETE FROM script_lines WHERE script_id = ?` (idempotent re-parse)
- Batch insert collected lines (chunk into groups of 500 to avoid payload limits)

## Technical Considerations
- For a 120-page script, expect roughly 2,000-4,000 lines -- well within database limits
- Batch inserts in chunks of 500 rows to stay under edge function memory/payload constraints
- No UI changes in this phase -- this is a data infrastructure addition for future features

