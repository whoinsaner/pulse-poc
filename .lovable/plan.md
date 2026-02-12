

# Add Missing Comic Parameters

## Summary

6 of the old parameter concepts represent genuinely distinct analysis dimensions not covered by the current 13 comic parameters. Adding them brings comic coverage to 19 parameters across the 4 existing categories.

## New Parameters to Add

### PanelFlowAgent (Comic Visuals) -- add 1

| Name | Display Name | Description |
|------|-------------|-------------|
| `panel_economy` | Panel Economy | Efficient use of panels with no wasted or redundant panels diluting impact |

### LetteringBalloonAgent (Comic Dialogue) -- add 3

| Name | Display Name | Description |
|------|-------------|-------------|
| `dialogue_load` | Dialogue Load | Appropriate dialogue density per page avoiding overcrowded panels |
| `balloon_engineering` | Balloon Engineering | Strategic balloon placement, sizing, and tail direction for readability |
| `reading_flow` | Reading Flow | Natural eye-path guiding readers within and across panels |

### PageTurnImpactAgent (Comic Pacing) -- add 1

| Name | Display Name | Description |
|------|-------------|-------------|
| `emotional_payload_per_page` | Emotional Payload | Emotional impact density and weight distribution across pages |

### ArtScriptSynergyAgent (Comic Art Direction) -- add 1

| Name | Display Name | Description |
|------|-------------|-------------|
| `character_visual_identity` | Character Visual Identity | Distinct, memorable visual cues scripted for each character |

## Excluded (already covered elsewhere)

- `production_pipeline_awareness` -- too niche / production-ops territory
- `market_publishing_alignment` -- covered by core MarketAgent (platform_fit, commercial_viability)
- `sequential_storytelling_integrity` -- covered by visual_storytelling
- `page_architecture` -- covered by page_layout
- `page_turn_reveals` -- covered by cliffhangers
- `structural_modularity` -- covered by issue_structure
- `art_writing_synergy` -- covered by artist_guidance
- `collaboration_readiness` -- overlaps artist_guidance; borderline, excluded to avoid bloat

## Implementation Steps

### Step 1: Insert new parameters into database

Insert 6 new rows into the `parameters` table via migration (since RLS blocks inserts):

```sql
INSERT INTO public.parameters (name, display_name, description, category, agent_source, default_weight)
VALUES
  ('panel_economy', 'Panel Economy', 'Efficient use of panels with no wasted or redundant panels diluting impact', 'Comic Visuals', 'PanelFlowAgent', 1.0),
  ('dialogue_load', 'Dialogue Load', 'Appropriate dialogue density per page avoiding overcrowded panels', 'Comic Dialogue', 'LetteringBalloonAgent', 1.0),
  ('balloon_engineering', 'Balloon Engineering', 'Strategic balloon placement, sizing, and tail direction for readability', 'Comic Dialogue', 'LetteringBalloonAgent', 1.0),
  ('reading_flow', 'Reading Flow', 'Natural eye-path guiding readers within and across panels', 'Comic Dialogue', 'LetteringBalloonAgent', 1.0),
  ('emotional_payload_per_page', 'Emotional Payload', 'Emotional impact density and weight distribution across pages', 'Comic Pacing', 'PageTurnImpactAgent', 1.0),
  ('character_visual_identity', 'Character Visual Identity', 'Distinct, memorable visual cues scripted for each character', 'Comic Art Direction', 'ArtScriptSynergyAgent', 1.0);
```

### Step 2: Update agent_configurations parameters arrays

Add the new parameter names to each agent's `parameters` array in the `agent_configurations` table.

### Step 3: Update edge function agent definitions

In `supabase/functions/analyze-script/index.ts`, add the new parameters to each agent's `parameters` array and update the system prompts to instruct the AI to score them.

### Step 4: Update scriptFramework.ts

Add the 6 new parameters to the framework definition so the sync mechanism recognizes them.

### Step 5: Re-run analysis

After deployment, re-run the Moksh comic analysis to generate scores for all 19 parameters.

## Files Changed

| File | Change |
|------|--------|
| New migration SQL | Insert 6 parameter rows |
| `agent_configurations` table | Update parameter arrays for 4 agents |
| `supabase/functions/analyze-script/index.ts` | Add 6 params to agent definitions and prompts |
| `src/lib/scriptFramework.ts` | Add 6 new parameter definitions |

## Result

Comic analysis grows from 13 to 19 parameters, covering all meaningful dimensions from both the original and revised parameter sets. No frontend page changes needed -- the pages already filter by category and will automatically display the new parameters.

