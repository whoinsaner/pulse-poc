

# Integrate Critical Structure Detection Layer into Pipeline

## What Already Exists vs What's New

The user's full framework (Sections 1-10 + Final Self-Correction) is **already implemented** across `GLOBAL_INSTRUCTIONS`, `CharacterAgent`, `ConflictAgent`, and `StructureAgent`. The new content is the **Critical Structure Detection Layer** — 8 additional validation checks that agents must perform before finalizing output.

| New Concept | Where It Goes | Conflict Risk |
|---|---|---|
| Load-Bearing Elements detection | GLOBAL_INSTRUCTIONS — new section 6.5 | None — extends existing motif/load-bearing mentions |
| Question → Answer Tracking | ThemeAgent + StructureAgent prompts | None — new analytical dimension |
| Motif Lifecycle Tracking (intro → transform → payoff) | ThemeAgent prompt | Complements existing motif evaluation |
| Resolution Ownership (enforced) | Already in ConflictAgent — just needs GLOBAL reinforcement | None — already present, just elevate |
| Sequence Differentiation Check | Already in StructureAgent — reinforce in GLOBAL | None — already present |
| Character Complexity Types (trauma/philosophy/ideology/power/symbolic) | CharacterAgent prompt | Complements existing philosophical villain logic |
| Intentional Discomfort vs Error | GLOBAL_INSTRUCTIONS critique discipline | Extends existing flaw classification |
| Medium Awareness | GLOBAL_INSTRUCTIONS | New — prevents over-penalizing edit-dependent elements |

## Changes

### 1. Extend GLOBAL_INSTRUCTIONS — Add "CRITICAL STRUCTURE DETECTION LAYER"

Insert after section 6 (Final Self-Check), before section 7 (Universal Script Types). Add a new section 6.5:

**Load-Bearing Elements:** Before finalizing, identify all elements without which the story collapses — key characters, symbols, lines, events, images. For each, state what breaks if removed. Elements that resolve theme, complete arcs, or deliver final meaning are load-bearing and must be surfaced.

**Question → Answer Tracking:** Identify what questions the story explicitly or implicitly asks, and where each is answered. If a question exists without a tracked answer, re-evaluate before concluding.

**Intentional Discomfort vs Error:** When something appears problematic, ask "Is the audience meant to feel discomfort here?" If yes, classify as intentional device, not flaw. Add to existing critique discipline (section 5).

**Medium Awareness:** Identify elements that depend on editing, performance, sound, or visual contrast. Do not over-evaluate these purely from script form. Flag as "performance-dependent" or "edit-dependent" rather than penalizing.

**Expanded Final Validation:** Add to section 6:
- Have I identified all load-bearing elements?
- Have I mapped every major question to an answer?
- Have I tracked motif completion?
- Have I mistaken absence of evidence for absence of meaning?

### 2. Enhance ThemeAgent prompt

Add **Motif Lifecycle Tracking** instruction:
- For each major symbol/motif: track introduction, transformation, and final payoff
- If payoff is missing in analysis, re-evaluate before concluding
- This complements existing "motif payoff systems" mention with explicit lifecycle tracking

Add **Question → Answer Tracking** to ThemeAgent:
- Identify narrative questions (thematic, philosophical) the story asks
- Map each to its answer location in the script

### 3. Enhance CharacterAgent prompt

Add **Character Complexity Types** to the existing 3-step classification:
- After Step 2 (Map Thematic Role), add: "Identify what drives this character: trauma (wound), philosophy (belief system), ideology, power instinct, or symbolic role. Evaluate within that type — do not assume one model of depth."
- This complements the existing philosophical villain instruction and extends it to all characters.

### 4. Enhance StructureAgent prompt

Add **Sequence Differentiation Check** reinforcement (extends existing instruction):
- For sequences that appear similar, explicitly evaluate differences in: emotional register, power dynamics, character POV, narrative function
- Do NOT group unless ALL match
- This is mostly present already but the explicit 4-dimension checklist is new

### 5. Update SectionContent interface and templates

Add optional fields to `SectionContent`:
- `loadBearingElements?: Array<{ element: string; type: 'character' | 'symbol' | 'line' | 'event' | 'image'; removalImpact: string }>`
- `narrativeQuestions?: Array<{ question: string; answerLocation: string; answered: boolean }>`
- `motifLifecycle?: Array<{ motif: string; introduction: string; transformation: string; payoff: string }>`

Add these to CharacterAgent, ThemeAgent, and StructureAgent section content templates respectively.

### 6. Update `enforceAgentPromptRequirements`

Extend to also check StructureAgent and ThemeAgent prompts for the new instructions, ensuring DB-stored prompts get upgraded.

### 7. Update TypeScript types

Add the 3 new optional fields to `AgentSectionContent` in `src/types/database.ts`.

## What Does NOT Change

- ConflictAgent resolution ownership — already implemented
- Existing removal test and protagonist system model — already complete
- CinemaTraditionAgent — no changes needed
- No database migrations — all new fields are optional JSONB
- No UI changes in this phase (data must be generated first before building display components)

## Technical Details

- **Files modified**: `supabase/functions/analyze-script/index.ts` (GLOBAL_INSTRUCTIONS, 3 agent prompts, section content templates, enforceAgentPromptRequirements), `src/types/database.ts` (3 new optional fields)
- **Prompt token impact**: ~250 additional tokens in GLOBAL_INSTRUCTIONS, ~50-80 per affected agent
- **Backward compatible**: All new fields are optional; existing reports unaffected
- **Zero conflicts**: Every addition extends existing logic — nothing is replaced or contradicted

