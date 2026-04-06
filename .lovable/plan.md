

# Fix Character Role Inconsistencies Across Report

## Problem

Six different pages and components use six different heuristics to identify character roles, while the AI pipeline already provides authoritative data via `agentContent.CharacterAgent.protagonistProfiles[]` and `antagonistProfile`. This causes characters to appear in wrong roles across pages.

## All Inconsistencies Found

| File | Method Used | Problem |
|------|-------------|---------|
| **CharacterDiagnosis.tsx** (line 85) | Array index: `index === 0` → Protagonist | Depends on arbitrary array order |
| **ProtagonistAnalysis.tsx** (line 38-41) | `reduce` by highest `dialogueCount` as fallback | Dialogue count ≠ protagonist role |
| **AntagonistAnalysis.tsx** (line 40-41) | 2nd highest `dialogueCount` → antagonist | Completely wrong — 2nd most talkative is not necessarily the antagonist |
| **CharacterPsychology.tsx** (line 28-31) | `reduce` by highest `dialogueCount` | Same dialogue-count fallback issue |
| **SupportingCast.tsx** (line 34-35) | `slice(2, 12)` after sort by dialogue | Skips top 2 by dialogue instead of filtering out actual protagonists/antagonists |
| **FullCharactersSection.tsx** (line 43-46) | `slice(0, 3)` = "main", `slice(3, 9)` = "supporting" | Arbitrary grouping by dialogue count |
| **CharactersSection.tsx** (line 15-16) | `slice(0, 6)` = "main" | Same arbitrary grouping |
| **BudgetEstimator.tsx** (line 129-131) | `slice(0, 3)` = leads, `slice(3, 10)` = supporting | Affects budget calculations |
| **budgetEngine.ts** (line 155-157) | Same `slice(0, 3)` / `slice(3, 10)` | Same issue in budget logic |

## Solution

### 1. Create shared utility: `src/lib/characterRoles.ts`

Single source of truth that reads from `agentContent.CharacterAgent`:

- `getProtagonistNames(agentContent)` → extracts names from `protagonistProfiles[]`
- `getAntagonistName(agentContent)` → extracts name from `antagonistProfile`
- `getCharacterRole(name, agentContent)` → returns `'Protagonist' | 'Antagonist' | 'Supporting'`
- `getSupportingCast(characters, agentContent)` → filters out identified protagonists and antagonists, returns the rest sorted by dialogue count
- `getLeadCharacters(characters, agentContent)` → returns protagonist + antagonist characters for budget/display purposes

All name matching is case-insensitive and trimmed.

### 2. Update report pages (6 files)

- **CharacterDiagnosis.tsx**: Replace `index === 0 ? 'Protagonist'` with `getCharacterRole(character.name, reportData.agentContent)`
- **ProtagonistAnalysis.tsx**: Keep `protagonistProfiles` from agentContent (already correct for AI profiles). Fix the fallback `protagonist` variable to use `getProtagonistNames` instead of dialogue count
- **AntagonistAnalysis.tsx**: Replace `sortedByPresence[1]` fallback with lookup by `getAntagonistName`, falling back to the character whose name matches `antagonistProfile.name`
- **CharacterPsychology.tsx**: Replace dialogue-count `reduce` with `getProtagonistNames` lookup
- **SupportingCast.tsx**: Replace `slice(2, 12)` with `getSupportingCast(characters, reportData.agentContent)`
- **FullCharactersSection.tsx**: Use `getCharacterRole` to group characters into lead/supporting/minor instead of arbitrary slicing

### 3. Update budget components (2 files)

- **BudgetEstimator.tsx** and **budgetEngine.ts**: Use `getLeadCharacters` for lead identification. This is lower priority since dialogue count is a reasonable proxy for budget (more lines = more screen time = higher casting cost), but should still be consistent.

### 4. Leave unchanged

- **DialogueAnalysis.tsx**, **CharacterArcVisualization.tsx**, **DialogueSubtext.tsx**: These sort by dialogue count for display ranking (top talkers), not role assignment — this is correct behavior.
- **CharactersSection.tsx**: Legacy component, appears unused in current routes.

## Technical Details

- New file: `src/lib/characterRoles.ts` (~50 lines)
- Modified: 6 report page files + 2 budget files
- No database or pipeline changes needed — all data already exists in `agentContent`
- Backward compatible: Falls back gracefully when `protagonistProfiles` or `antagonistProfile` is missing (uses dialogue count as last resort)

