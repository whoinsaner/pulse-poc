

# Diagnostic: Pipeline Coverage vs Director's Feedback + Palani Fix

## Director's 9 Concerns — Pipeline Coverage Diagnostic

| # | Director's Concern | Already in Pipeline? | Gap? |
|---|---|---|---|
| 1 | **Page count ≠ runtime for Director's Spec** | YES — `directors_spec` format detection, `traditionPreamble` warning, explicit "do NOT apply page-per-minute" in GLOBAL, Structure, Market agents | No gap |
| 2 | **Palani missed as second protagonist** | PARTIALLY — removal test logic exists, silent/action-driven arcTypes exist, 3+ scenes threshold exists. BUT the removal test depends on the AI actually executing it correctly against characters with low dialogue counts | Gap: needs reinforcement (see below) |
| 3 | **George = thematic resolution (not procedural)** | YES — resolution models include "moral, poetic, emotional, symbolic". "Do NOT default to procedural/institutional closure" is in GLOBAL. Narrative Questions tracking exists in ThemeAgent | Weak: needs explicit "named resolution" as valid type |
| 4 | **Three sequences are NOT repetitive** — hospital/playground/railway have different emotional registers | YES — Sequence Differentiation Check (4-dimension: emotional register, power dynamics, POV, function) is in GLOBAL and StructureAgent. "Mechanically similar plot functions that operate in different emotional registers are distinct" | No gap |
| 5 | **Crosscutting = edit-dependent, not staccato** | YES — Medium Awareness + "edit-dependent" flag + "rhythm-driven crosscutting" vs "information-driven crosscutting" distinction in StructureAgent | No gap |
| 6 | **Coumba = system critique, not sensitivity problem** | YES — "distinguish between scripts that endorse stereotypes and scripts that dramatize systems exploiting those stereotypes" in both GLOBAL and MarketAgent | No gap |
| 7 | **Sundaram = philosophical villain, not flat** | YES — `worldview` + `philosophyType` fields, "philosophical villain construction is legitimate", "A villain who believes they are right is not underdeveloped" | No gap |
| 8 | **Periyavar = self-believing villain, complete** | YES — covered by same philosophical villain logic + "systemic/institutional" philosophyType | No gap |
| 9 | **Balan's final line = thematic resolution** | PARTIALLY — Narrative Questions tracking maps Q→A, but there's no explicit instruction to track **who delivers the final spoken line** and whether it answers an earlier challenge | Gap: minor |

## Root Cause: Why Palani Was Missed

The pipeline has all the right instructions. The problem is **execution weighting**. When the AI sees a character with 49 dialogue lines vs one with 200+, the removal test instruction competes with the raw statistical signal. The AI needs stronger **anti-bias anchoring** specifically for silent/low-dialogue characters. The current instructions say "evaluate by actions taken, not words spoken" — but this is a single line buried in a long prompt. It needs to be elevated to a **non-negotiable checkpoint**.

## Plan: 3 Targeted Changes (Generic, Not KV-Specific)

### Change 1: Strengthen CharacterAgent's Silent Protagonist Detection

**File**: `supabase/functions/analyze-script/index.ts` — CharacterAgent prompt (~line 973-1003)

Add after STEP 1 (line 980), before STEP 2:

```
STEP 1.5 — SILENT/ACTION PROTAGONIST CHECK (MANDATORY):
For each character with low dialogue (<60 lines) but 5+ scene appearances:
- Does this character execute actions that deliver justice, resolution, or irreversible consequences?
- Does this character operate in a parallel narrative track to the primary protagonist?
- Does this character's removal collapse a distinct dimension of the story's resolution?
If ANY answer is YES → this character MUST proceed to Step 3 classification as potential protagonist.
Do NOT dismiss characters based on dialogue volume. A character who acts in silence and darkness can carry an entire resolution axis.
```

Also add to the NON-NEGOTIABLE OUTPUT RULES (~line 4272):
```
6. SILENT PROTAGONIST CHECK: Before finalizing protagonistProfiles, verify that no character with 5+ scenes and low dialogue has been classified as "supporting" without explicitly confirming their removal does NOT break the story's resolution. If uncertain, default to protagonist-tier and explain in misinterpretationRisks.
```

### Change 2: Add "Named/Symbolic Resolution" as Explicit Resolution Type

**File**: `supabase/functions/analyze-script/index.ts` — GLOBAL_INSTRUCTIONS (~line 904) and ConflictAgent

The pipeline lists resolution models as "procedural, moral, poetic, cyclical, emotional, ambiguous". Add **"symbolic"** and **"naming"** as resolution types:

In GLOBAL_INSTRUCTIONS (after existing resolution models list):
```
- Naming resolution: The act of speaking a name, identifying a person, or declaring truth publicly IS a valid and complete resolution in traditions where institutional justice is absent or irrelevant. Do not require arrests, warrants, or visible institutional consequences when the story's resolution grammar is moral or symbolic.
- Object/symbol return: A symbol completing its journey (returning to origin, passing through hands, arriving at its final destination) can deliver thematic closure equal to any plot-level resolution.
```

### Change 3: Add Final Line / Closing Symmetry Tracking

**File**: `supabase/functions/analyze-script/index.ts` — CharacterAgent or ConflictAgent section content template

Add to the ConflictAgent section content template:
```
"closingSymmetry": {"finalLine": "Last spoken line of the script", "answersChallenge": "What earlier challenge/statement this line responds to", "deliveredBy": "Character name", "symmetryType": "thematic|personal|philosophical"}
```

Add instruction to ConflictAgent:
```
CLOSING SYMMETRY CHECK: Identify the last spoken line of the script. Determine if it answers an earlier challenge, question, or statement made by another character. If so, map the symmetry: who posed the challenge, who answers it, and what type of closure it provides (thematic, personal, philosophical). A child answering a villain's worldview in the final line is dramatically complete — do not require additional institutional resolution.
```

Add `closingSymmetry` to the `AgentSectionContent` interface in `src/types/database.ts`.

## What This Does NOT Do

- Does not mention Kadavul Valthu, Palani, Sundaram, or any specific script
- Every instruction is generic and applies to any screenplay
- No existing instructions are removed or contradicted
- All new fields are optional — backward compatible

## Files Modified

| File | Changes |
|---|---|
| `supabase/functions/analyze-script/index.ts` | CharacterAgent: Step 1.5 + Rule 6. GLOBAL: 2 new resolution types. ConflictAgent: closingSymmetry template + instruction. |
| `src/types/database.ts` | Add `closingSymmetry` to `AgentSectionContent` |

## Impact

- **Palani-type characters**: The Step 1.5 checkpoint forces the AI to explicitly evaluate every low-dialogue/high-scene character before classification, preventing silent protagonists from being dismissed
- **Resolution scoring**: "Naming" and "symbolic return" resolution types prevent the framework from requiring procedural closure in traditions that don't use it
- **Closing symmetry**: Captures the dramatic weight of final lines that answer earlier challenges, which is common across many cinema traditions (not just Kollywood)

