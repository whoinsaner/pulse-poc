
# Fix Comic Agent Parameter Alignment

## Root Cause

The 4 comic agents in the edge function (`analyze-script`) are configured to score parameters that **don't exist** in the `parameters` database table. This means:

- The agents produce `agentContent` (narrative analysis) correctly -- this works fine
- But the parameter **scores** are never stored because the parameter names don't match any rows in the `parameters` table

### The Mismatch

| Agent | Edge Function Parameters (scored) | Database Parameters (actual) |
|-------|----------------------------------|------------------------------|
| PanelFlowAgent | `sequential_storytelling_integrity`, `panel_economy`, `page_architecture` | `panel_composition`, `page_layout`, `action_clarity`, `visual_storytelling` |
| LetteringBalloonAgent | `dialogue_load`, `balloon_engineering`, `reading_flow` | `balloon_efficiency`, `caption_voice`, `sound_effects` |
| PageTurnImpactAgent | `emotional_payload_per_page`, `structural_modularity`, `page_turn_reveals` | `cliffhangers`, `issue_structure`, `panel_to_panel_flow` |
| ArtScriptSynergyAgent | `art_writing_synergy`, `character_visual_identity`, `collaboration_readiness`, `production_pipeline_awareness`, `market_publishing_alignment` | `artist_guidance`, `reference_clarity`, `style_consistency` |

The database has 13 comic parameters across 4 categories (`Comic Visuals`, `Comic Dialogue`, `Comic Pacing`, `Comic Art Direction`), but the agents reference 14 completely different parameter names that don't exist in the table.

## Fix Strategy

**Option A (Recommended):** Update the agent configurations and edge function hardcoded definitions to use the parameter names that already exist in the `parameters` table. This aligns agents with the database schema.

**Option B:** Add the 14 missing parameters to the database and remove the 13 unused ones. This is riskier because it changes the scoring schema.

Going with **Option A**:

### Step 1: Update Agent Parameter Mappings in Edge Function

Remap each agent in `supabase/functions/analyze-script/index.ts` to use the correct database parameter names:

- **PanelFlowAgent**: `panel_composition`, `page_layout`, `visual_storytelling`, `action_clarity`
  - Category: Comic Visuals
- **LetteringBalloonAgent**: `balloon_efficiency`, `caption_voice`, `sound_effects`
  - Category: Comic Dialogue
- **PageTurnImpactAgent**: `panel_to_panel_flow`, `cliffhangers`, `issue_structure`
  - Category: Comic Pacing
- **ArtScriptSynergyAgent**: `artist_guidance`, `reference_clarity`, `style_consistency`
  - Category: Comic Art Direction

### Step 2: Update Agent Configurations in Database

Sync the `agent_configurations` table to match:

```sql
UPDATE agent_configurations 
SET parameters = ARRAY['panel_composition','page_layout','visual_storytelling','action_clarity']
WHERE agent_name = 'PanelFlowAgent';

UPDATE agent_configurations 
SET parameters = ARRAY['balloon_efficiency','caption_voice','sound_effects']
WHERE agent_name = 'LetteringBalloonAgent';

UPDATE agent_configurations 
SET parameters = ARRAY['panel_to_panel_flow','cliffhangers','issue_structure']
WHERE agent_name = 'PageTurnImpactAgent';

UPDATE agent_configurations 
SET parameters = ARRAY['artist_guidance','reference_clarity','style_consistency']
WHERE agent_name = 'ArtScriptSynergyAgent';
```

### Step 3: Update Agent System Prompts

Adjust the system prompts in the edge function to reference the correct parameter names and descriptions so the AI scores them properly.

### Step 4: Update Comic Page Components

Update the filter logic in the 4 comic page components to match the actual database categories:

- `ComicPanelFlow.tsx`: Filter by `category === 'Comic Visuals'`
- `ComicLettering.tsx`: Filter by `category === 'Comic Dialogue'`
- `ComicPageTurns.tsx`: Filter by `category === 'Comic Pacing'`
- `ComicArtSynergy.tsx`: Filter by `category === 'Comic Art Direction'`

### Step 5: Re-run Moksh Analysis

After deploying the fix, the Moksh analysis needs to be re-run to generate proper parameter scores with the correct names.

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-script/index.ts` | Update 4 comic agent parameter arrays and system prompts |
| `agent_configurations` table (migration) | Sync parameter arrays to match database |
| `src/pages/report/ComicPanelFlow.tsx` | Fix category filter to `Comic Visuals` |
| `src/pages/report/ComicLettering.tsx` | Fix category filter to `Comic Dialogue` |
| `src/pages/report/ComicPageTurns.tsx` | Fix category filter to `Comic Pacing` |
| `src/pages/report/ComicArtSynergy.tsx` | Fix category filter to `Comic Art Direction` |
