

# Integrate Narrative System Analysis Framework into Pipeline

## Context

The user's framework is a comprehensive "reverse-engineering a narrative system" methodology. Much of it **already exists** in `GLOBAL_INSTRUCTIONS` and agent-specific prompts — Grammar Identification, Intent Reconstruction, Internal Logic validation, Critique Discipline, and the Final Self-Check are all present. The character removal test and protagonist system model were added recently.

What's **genuinely new** and needs integration:

| New Concept | Where It Goes |
|---|---|
| Story Engine Decomposition (5 systems: Character, Conflict, Resolution, Thematic, Structural) | GLOBAL_INSTRUCTIONS — new section |
| Resolution System with ownership mapping | ConflictAgent + CharacterAgent prompts |
| "Distributed protagonist system" model | CharacterAgent prompt + schema |
| Sequence function analysis (emotion + purpose, not surface similarity) | StructureAgent prompt |
| Misinterpretation Risks output | Section content templates |
| Final Self-Correction Loop (extended) | GLOBAL_INSTRUCTIONS section 6 |

## Changes

### 1. Enhance `GLOBAL_INSTRUCTIONS` (~4 additions, no removals)

**Add section 1.5: "NARRATIVE SYSTEM REVERSE-ENGINEERING"** between Core Philosophy and Grammar Identification:

- Frame the agent's role: "You are reverse-engineering a narrative system, not imposing standards."
- Add Story Engine Decomposition: agents should understand how Character, Conflict, Resolution, Thematic, and Structural systems interact — even though each agent focuses on one module.

**Extend section 2 (Grammar Identification):**
- Add "Operating Rules" sub-bullet: what does this system prioritize?
- Add "Reality Model": realistic / heightened / mythic / symbolic / absurd
- Add "Audience Contract": what is the audience expected to accept as truth?
- These complement the existing grammar fields without duplicating them.

**Extend section 6 (Final Self-Check):**
- Add: "Did I confuse prominence with importance?"
- Add: "Did I evaluate the system or judge the style?"
- Add: "Did I correctly map resolution ownership?"

### 2. Enhance CharacterAgent prompt

**Add "distributed" to protagonist system models.** Currently supports single/dual/multi — add "distributed" for ensemble narratives where no single character dominates but the collective drives resolution.

**Add step-by-step classification order** to the existing tradition-aware evaluation:
- Step 1: Identify narrative function (driver, reactor, observer, disruptor, executor)
- Step 2: Map thematic role (belief, counter-belief, transformation, witness)  
- Step 3: Classify AFTER mapping — not before

This reinforces the existing removal test with a clearer methodology.

### 3. Enhance ConflictAgent prompt

**Add Resolution System awareness:**
- Determine resolution type: Physical / Emotional / Thematic / Symbolic / Ambiguous
- Map resolution ownership: which character delivers which part
- Evaluate completeness within the story's own model

### 4. Enhance StructureAgent prompt

**Add Sequence Function analysis:**
- Analyze sequences by emotional function + narrative purpose + character transformation
- Do NOT group by surface similarity
- Only flag redundancy when function + emotion + outcome are all duplicated

### 5. Update section content templates

**CharacterAgent template:** Add `"distributed"` as valid type in `protagonistSystemModel`.

**All agent templates:** Add optional `"misinterpretationRisks"` field:
```
"misinterpretationRisks": ["Where analysts may go wrong about this aspect"]
```

### 6. Update `enforceAgentPromptRequirements`

Add `'distributed'` check alongside existing `'removal test'` check so DB-stored prompts without the new distributed model get overridden.

### 7. Update Protagonist Analysis UI

- Add "Distributed" as a valid badge type in the Protagonist System Model card
- Display `misinterpretationRisks` if present in any agent content

## What Does NOT Change

- CinemaTraditionAgent already handles Grammar, Intent, Realism Spectrum, and Stakes Model — no changes needed there
- ThemeAgent already evaluates thematic spine, show-vs-tell, and moral complexity
- The removal test and protagonist profiles schema stay as-is
- No database migrations needed — all new fields are optional within existing JSONB

## Technical Details

- **Files modified**: `supabase/functions/analyze-script/index.ts` (GLOBAL_INSTRUCTIONS, 3 agent prompts, section content templates, enforceAgentPromptRequirements), `src/pages/report/ProtagonistAnalysis.tsx` (distributed badge)
- **Prompt token impact**: ~300 additional tokens in GLOBAL_INSTRUCTIONS, ~100 per affected agent — negligible
- **Backward compatible**: All new fields are optional; existing reports render without them
- **No conflicts**: Every addition extends existing logic rather than replacing it

