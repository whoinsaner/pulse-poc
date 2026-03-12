

# AI-Powered Script Breakdown Auto-Extraction

## Overview
Build a new edge function that uses AI to scan scene descriptions and `script_lines` data, automatically identifying production elements (cast, props, wardrobe, VFX, etc.) per scene. Results are inserted as `breakdown_tags` with a `source` field distinguishing AI-suggested vs. manually added tags. The UI gets an "Auto-Extract" button and visual indicators for AI suggestions that users can accept, dismiss, or edit.

## Database Changes

Add a `source` column to `breakdown_tags` and a `confidence` column for AI suggestions:

```sql
ALTER TABLE breakdown_tags 
  ADD COLUMN source text NOT NULL DEFAULT 'manual',
  ADD COLUMN confidence numeric DEFAULT NULL;
```

`source` values: `'manual'` (default, backward-compatible), `'ai'`, `'ai_accepted'`

## New Edge Function: `extract-breakdown`

**File**: `supabase/functions/extract-breakdown/index.ts`

- Accepts `script_id` and `quality_mode`
- Fetches all scenes + script_lines for the script
- Batches scenes (10 per batch) and sends each batch to Lovable AI (Gemini 3 Flash Preview) with a prompt that:
  - Receives scene heading, description, and all dialogue/action lines
  - Returns structured output via **tool calling** with a schema like:
    ```json
    { "elements": [{ "scene_number": 1, "category": "props", "element_name": "revolver", "confidence": 0.9 }] }
    ```
- Deduplicates against existing `breakdown_tags` for the script
- Inserts new tags with `source = 'ai'` and `confidence` value
- Uses existing model config system (`getAgentModelConfig`) for consistency
- Handles 429/402 errors properly

## UI Changes: `ScriptBreakdown.tsx`

1. **"Auto-Extract" button** in the header area — triggers the edge function, shows progress toast
2. **AI badge** on tags where `source = 'ai'` — a small sparkle icon or "AI" label
3. **Accept/Dismiss** controls on AI-suggested tags:
   - Accept: updates `source` to `'ai_accepted'`
   - Dismiss: deletes the tag
   - "Accept All" bulk action per scene or globally
4. **Confidence indicator** — subtle opacity or dot color based on confidence score
5. Manually added tags remain unchanged (`source = 'manual'`)

## Technical Details

- Edge function config: `verify_jwt = false` in `config.toml`
- Uses `LOVABLE_API_KEY` (already configured) via the AI gateway
- Tool calling extracts structured JSON — no fragile prompt-based JSON parsing
- Batching prevents token limit issues on large scripts (100+ scenes)
- Existing RLS policies on `breakdown_tags` apply — no changes needed since inserts go through the authenticated client

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/functions/extract-breakdown/index.ts` | Create |
| `supabase/config.toml` | Add function entry |
| `src/pages/report/ScriptBreakdown.tsx` | Add auto-extract button, AI tag indicators, accept/dismiss UI |
| Migration SQL | Add `source` and `confidence` columns to `breakdown_tags` |

