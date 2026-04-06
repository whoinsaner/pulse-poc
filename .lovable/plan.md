

# Enhance Protagonist Identification with Narrative-Function Validation

## What This Does

Upgrades the CharacterAgent's protagonist identification from a basic "who drives an arc" check to a rigorous **narrative-function validation** system. The AI will apply a removal test ("does the story still resolve without this character?"), explicitly classify the protagonist system model (Single/Dual/Multi), and output each protagonist's resolution role. This ensures characters like Palani are not misclassified as supporting cast when they deliver irreplaceable resolution outcomes.

## Changes

### 1. Update CharacterAgent prompt and schema (`supabase/functions/analyze-script/index.ts`)

**Prompt enhancement** — Add the advanced protagonist identification instructions to the CharacterAgent's system prompt (around line 3925) and the `enforceAgentPromptRequirements` fallback:

- Add the **removal test** instruction: "For each major character, ask: if removed, does the story still resolve fully? If NO, protagonist-tier."
- Add classification criteria: resolution-driven identification over screen time / dialogue volume / narrative focus alone
- Require explicit **Protagonist System Model** output

**Schema expansion** — Extend the `protagonistProfiles` array schema and TypeScript interface (line 428-429) to include new fields:
- `resolutionRole`: string — What irreplaceable resolution outcome this character delivers
- `removalImpact`: string — What collapses if this character is removed

Add a new top-level field to `SectionContent`:
- `protagonistSystemModel`: `{ type: 'single' | 'dual' | 'multi', rationale: string }`

**Section content template** (line 3920) — Add the new fields to the JSON schema example so the AI knows to output them.

**NON-NEGOTIABLE rules** (line 4094) — Strengthen the existing CharacterAgent override to include: "Apply the removal test to every character with 3+ scenes. If removal breaks the story's resolution, classify as protagonist regardless of dialogue count or screen time."

### 2. Update `enforceAgentPromptRequirements` (line 3180-3197)

Add a check for the new instructions (e.g., `'removal test'`) to the `needsUpgrade` condition, so DB-stored prompts that lack the new logic get overridden with the updated hardcoded prompt.

### 3. Update Protagonist Analysis UI (`src/pages/report/ProtagonistAnalysis.tsx`)

- Display `resolutionRole` and `removalImpact` for each protagonist profile card
- Add a **Protagonist System Model** badge/card at the top showing Single/Dual/Multi classification with rationale

### 4. Update characterRoles utility (`src/lib/characterRoles.ts`)

No structural changes needed — the utility already reads from `protagonistProfiles[]`. The fix is upstream: ensuring the AI correctly populates that array with all true protagonists.

## Technical Details

- **Files modified**: `supabase/functions/analyze-script/index.ts` (prompt + schema), `src/pages/report/ProtagonistAnalysis.tsx` (UI)
- **No database migration needed** — new fields are stored within the existing `sectionContent` JSONB
- **Backward compatible** — new fields are optional; existing reports render without them
- **Cost impact**: Zero additional API calls. The prompt additions are ~200 tokens, negligible within the existing CharacterAgent call

