# Plan: Cinema Tradition-Aware Analysis & Deeper Reasoning

## The Problem

The script writer of *Kadavul Valthu* provided detailed feedback identifying systemic weaknesses in the USAF analysis pipeline. The core issues:

1. **Hollywood bias baked into every agent prompt** -- The GLOBAL_INSTRUCTIONS and all 10 core agent prompts assume American prestige drama conventions (3-act structure, page-per-minute, psychologically vulnerable antagonists, procedural closure, decompression beats). There is zero awareness of regional cinema traditions (Kollywood, Bollywood, Korean, Japanese, European arthouse, etc.).
2. **Shallow reasoning from lightweight models** -- The balanced quality mode uses `gemini-2.5-flash-lite` for most agents. The writer's Claude analysis was deeper because it was conversational and iterative -- the AI was challenged to justify every claim with specific scene evidence. Our agents make a single pass with a cheap model.
3. **Structural blind spots** -- The pipeline missed: dual-protagonist architecture, silent protagonists, philosophical (not psychological) villain construction, moral closure vs procedural closure, director's spec screenplay format, and motif payoff systems.

---

## Plan

### 1. Add Cinema Tradition Detection & Context Layer

**What**: Add a `CinemaTraditionClassifier` step during the system agent phase that identifies the script's cinema tradition/industry origin.

**Where**: `supabase/functions/analyze-script/index.ts` -- new system agent + additions to GLOBAL_INSTRUCTIONS.

**How**:

- Add a new system agent `CinemaTraditionAgent` that classifies the script's tradition: Hollywood mainstream, Hollywood indie/A24, Kollywood, Bollywood, Tollywood, Korean, Japanese, European arthouse, Latin American, African, Middle Eastern, etc.
- Detect from: language cues, character naming conventions, cultural references, format conventions (director's spec vs shooting script), structural patterns (interval placement, song sequences, mass-hero conventions).
- Output a `traditionContext` object: `{ tradition, formatType (shooting_script | directors_spec | literary), audienceGrammar, structuralConventions[], resolutionModel (procedural | moral | poetic | cyclical) }`
- This context gets injected into every subsequent agent's prompt as a preamble.

### 2. Rewrite GLOBAL_INSTRUCTIONS with Anti-Bias Framework

**What**: Replace the current GLOBAL_INSTRUCTIONS with tradition-aware operating rules.

**Key additions**:

- "You MUST NOT apply Hollywood prestige drama conventions as universal standards."
- "Different cinema traditions have different grammar: Kollywood social thrillers use mass-hero logic, interval structure, moral closure, extended first acts for emotional investment, and philosophical villains. Korean cinema uses radically different act proportions. European arthouse uses ambiguity as resolution."
- "A director's spec screenplay CANNOT be measured by page-per-minute. Explicitly check for format type before applying page count assessments."
- "Dual-protagonist and ensemble-protagonist architectures are valid. Do not assume a single-protagonist model."
- "Resolution satisfaction must be evaluated against the tradition's resolution grammar, not against procedural/institutional closure."
- "Villain complexity can manifest as philosophical conviction, not only psychological vulnerability or wounded backstory."
- "Silence, physical action, and visual motif payoff are valid resolution mechanisms equal to dialogue and institutional consequence."

### 3. Enhance Agent Prompts for Deeper Analysis

**What**: Update the 6 most affected agent prompts (StructureAgent, CharacterAgent, ConflictAgent, ThemeAgent, DialogueAgent, EmotionalArcAgent) with tradition-aware evaluation criteria.

**Key changes per agent**:

- **StructureAgent**: Add "Check for dual-protagonist architectures. Evaluate interval placement for traditions that use intervals. Do not penalize extended first acts if they are load-bearing (earning grief, establishing motif systems). Evaluate resolution against the script's own tradition, not procedural closure."
- **CharacterAgent**: Add "Silent protagonists who act through physical choices are valid. Philosophical villain construction (worldview, not wound) is a legitimate form of complexity. Evaluate characters by their function in the moral architecture, not just by dialogue line count."
- **ConflictAgent**: Add "Moral closure (a name spoken, a truth revealed) is a valid resolution model. Physical justice (retribution that mirrors the original crime) is complete resolution in many traditions."
- **ThemeAgent**: Add "Motif payoff systems (objects that accumulate meaning across the full script) should be evaluated as load-bearing structural elements, not decorative."
- **DialogueAgent**: Add "Evaluate silence as a dialogue tool. Assess economy by meaning-per-word, not word count. Two-word exchanges that convey character, relationship, and comedy simultaneously should score highest."
- **EmotionalArcAgent**: Add "Different traditions have different fatigue thresholds. Kollywood audiences sustain longer emotional sequences. Do not apply Western decompression beat expectations universally."

### 4. Upgrade Model Tier for Core Analysis

**What**: Use stronger reasoning models for the core analysis agents to produce deeper, more evidence-backed analysis.

**Where**: Quality mode presets and model configuration in `analyze-script/index.ts`.

**Changes**:

- **Balanced mode**: Upgrade `default` tier from `gemini-2.5-flash-lite` to `gemini-2.5-flash`. Upgrade `complex` tier to `gemini-2.5-pro`.
- **Quality mode**: Upgrade `default` to `gemini-2.5-flash`, `complex` to `openai/gpt-5` or `openai/gpt-5.2` for deepest reasoning.
- Add reasoning parameters (`reasoning: { effort: "medium" }`) for complex agents in quality mode to enable extended thinking on character, structure, and theme analysis.
- Keep `fast` mode unchanged for cost-sensitive quick analyses.

### 5. Add Evidence Depth Requirements to Output Contract

**What**: Strengthen the evidence requirements in the output contract so agents must cite specific scenes, dialogue lines, and structural positions.

**Where**: GLOBAL_INSTRUCTIONS output contract section.

**Changes**:

- Require minimum 3 evidence items per parameter score.
- Evidence must include specific scene numbers or page references when available.
- For scores below 7, require a "tradition check": "Is this score based on a universal craft weakness or a tradition-specific convention being misread?"
- For character classification, require justification: "Why is this character classified as supporting vs protagonist? Consider dialogue count, narrative function, thematic weight, and arc completeness separately."

### 6. Add Script Format Detection to IntakeNormalizerAgent

**What**: Detect whether the script is a shooting script, director's spec, literary screenplay, or treatment, and flag this for downstream agents.

**Where**: `IntakeNormalizerAgent` prompt.

**Changes**:

- Add format detection to normalized output: `scriptFormat: 'shooting_script' | 'directors_spec' | 'literary' | 'treatment' | 'unknown'`
- Detection signals: detailed action line descriptions (director's spec), minimal camera directions (literary), technical camera/lens notes (shooting script), prose-style scene descriptions (treatment).
- This prevents page-per-minute misapplication.

### 7. Upload UI: Add Cinema Tradition Selector

**What**: Allow users to optionally specify the cinema tradition during upload, similar to how script type is selected.

**Where**: `src/pages/Upload.tsx` and related components.

**Changes**:

- Add an optional "Cinema Tradition" dropdown with options: Auto-detect, Hollywood, Kollywood/Tamil, Bollywood/Hindi, Tollywood/Telugu, Korean, Japanese, European, Latin American, African, Independent/Arthouse, Other.
- Store in `scripts` table as `cinema_tradition` column.
- Pass to analysis pipeline as context.

---

## Summary of File Changes


| File                                         | Change                                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/functions/analyze-script/index.ts` | Rewrite GLOBAL_INSTRUCTIONS, update 6+ agent prompts, add CinemaTraditionAgent, upgrade model tiers, strengthen evidence contract |
| `src/pages/Upload.tsx`                       | Add cinema tradition selector                                                                                                     |
| DB migration                                 | Add `cinema_tradition` column to `scripts` table                                                                                  |
| `src/lib/scriptFramework.ts`                 | Add cinema tradition types and constants                                                                                          |


## Implementation Order

1. DB migration (add column)
2. GLOBAL_INSTRUCTIONS rewrite + CinemaTraditionAgent
3. Core agent prompt updates (Structure, Character, Conflict, Theme, Dialogue, EmotionalArc)
4. Model tier upgrades and make quality mode a default for every single user, including new registrations.
5. Upload UI cinema tradition selector
6. Test with the Kadavul Valthu script