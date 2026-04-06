

# Integrate Universal Narrative Grammar Framework into Analysis Pipeline

## What This Does

Upgrades the analysis pipeline from a tradition-specific bias-prevention system to a universal **narrative grammar detection and evaluation** framework. Instead of listing specific traditions and their rules, the system will first identify the script's governing storytelling grammar, then evaluate entirely within that system.

## Current State

The pipeline already has strong tradition-aware foundations:
- `GLOBAL_INSTRUCTIONS` contains an anti-bias framework listing specific traditions (Kollywood, Bollywood, Korean, etc.)
- `CinemaTraditionAgent` detects tradition and injects a `traditionPreamble` into core agents
- Individual agents (Structure, Character, Conflict, Theme) have tradition-aware evaluation blocks
- `enforceAgentPromptRequirements` ensures CharacterAgent always supports multi-protagonist

**Gap**: The current approach is *enumerative* (listing known traditions) rather than *generative* (detecting any narrative grammar and deriving evaluation rules from it). The user's framework is more universal and self-correcting.

## Changes

### 1. Upgrade `GLOBAL_INSTRUCTIONS` (hardcoded fallback)

Replace the current "ANTI-BIAS FRAMEWORK" section (§2) with the user's universal framework, restructured as:

- **§2 GRAMMAR IDENTIFICATION**: Before evaluating, identify the governing narrative grammar (realist, mythic, mass cinema, satire, hybrid, etc.) and its rules. This replaces the current enumerated tradition list.
- **§3 INTENT RECONSTRUCTION**: Infer filmmaker's intended experience and design goal.
- **§4 INTERNAL LOGIC OVER EXTERNAL STANDARDS**: Evaluate consistency with the script's own rules. Add the self-check: "Is this breaking the film's own rules — or just my expectations?"
- **§5 CRITIQUE DISCIPLINE**: Classify all issues as true flaw / trade-off / misalignment / personal bias risk.
- **§6 FINAL SELF-CHECK**: Mandatory verification before concluding.

Keep existing sections on Universal Script Types (§3→§7), Output Contract (§4→§8), Evidence Rules (§5→§9), Agent Boundaries (§6→§10), and Cinema Tradition Context (§7→§11).

### 2. Upgrade `CinemaTraditionAgent` prompt

Expand its output schema to include new fields from the universal framework:
- `narrativeGrammar`: The detected storytelling system (not just industry origin)
- `grammarRules`: What this grammar prioritizes (emotional realism vs heightened drama, subtext vs explicit, etc.)
- `intendedExperience`: What experience the script is designing (catharsis, discomfort, reflection, etc.)
- `realismSpectrum`: Where on the realism←→stylization scale the script sits
- `stakesModel`: How the story defines stakes (personal, social, existential)

Keep existing fields (`tradition`, `formatType`, `resolutionModel`, `audienceGrammar`, `structuralConventions`).

### 3. Expand `traditionPreamble` injection

After Phase 1 system agents complete, inject the new fields into the context passed to core agents:
- Add `Narrative Grammar` and `Grammar Rules` lines
- Add `Intended Experience` line
- Add `Realism Spectrum` positioning
- Add `Stakes Model` line
- Add a new warning: "⚠️ CRITIQUE DISCIPLINE: Classify issues as true flaw / trade-off / misalignment / bias risk"

### 4. Upgrade core agent TRADITION-AWARE blocks

For each core agent (Concept, Structure, Character, Conflict, Theme, Dialogue, WorldLogic, EmotionalArc, Market, Execution), add to their tradition-aware evaluation section:

- **Universal self-check**: "Before flagging an issue, verify: Is this breaking the script's own grammar, or my external expectations?"
- **Sequence interpretation** (StructureAgent): Only flag redundancy when two sequences serve the same emotional + structural function
- **Character evaluation** (CharacterAgent): Identify functional roles (emotional anchor, thematic carrier, narrative driver, symbolic presence) — already partially there, reinforce
- **Resolution model** (ConflictAgent, StructureAgent): Already supports moral/poetic/cyclical — add emotional resolution and open-ended ambiguity as explicit models
- **Conflict stakes** (ConflictAgent): Add explicit stakes model evaluation (personal → social → existential alignment check)

### 5. Update PDF report to surface new metadata

In `src/lib/fullReportPdfGenerator.ts`, when rendering the tradition context section:
- Add "Narrative Grammar" and "Intended Experience" to the tradition metadata tile
- Add "Stakes Model" and "Realism Spectrum" if available in the CinemaTraditionAgent output

### 6. Update report UI for new fields

In `src/pages/report/StoryDiagnosis.tsx` or the tradition context callout:
- Display `narrativeGrammar`, `intendedExperience`, `realismSpectrum`, and `stakesModel` if present in the tradition data

---

## Technical Details

- **Primary file**: `supabase/functions/analyze-script/index.ts` — GLOBAL_INSTRUCTIONS constant, CinemaTraditionAgent prompt, traditionPreamble builder, and core agent prompts
- **Secondary files**: `src/lib/fullReportPdfGenerator.ts` (PDF metadata), report UI components (tradition display)
- **No schema changes needed**: New fields are stored within existing `sectionContent` JSONB in `agent_results`
- **Backward compatible**: Existing tradition detection still works; new fields are additive
- **DB-stored GlobalInstructions**: The hardcoded fallback updates here; organizations using DB-stored global instructions will need to update via the admin UI

