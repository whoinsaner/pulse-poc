

# UI and PDF Changes Needed for Recent Pipeline Enhancements

The last 3-4 plans added these new data fields to the pipeline. Here is every gap between what's generated and what's displayed.

---

## New Fields Added (Pipeline → Types)

| Field | Source Agent | In UI? | In PDF? |
|---|---|---|---|
| `resolutionRole` | CharacterAgent | ProtagonistAnalysis.tsx — YES | fullReportPdfGenerator.ts — NO |
| `removalImpact` | CharacterAgent | ProtagonistAnalysis.tsx — YES | fullReportPdfGenerator.ts — NO |
| `protagonistSystemModel` | CharacterAgent | ProtagonistAnalysis.tsx — YES | fullReportPdfGenerator.ts — NO |
| `misinterpretationRisks` | All agents | ProtagonistAnalysis.tsx only | fullReportPdfGenerator.ts — NO |
| `loadBearingElements` | StructureAgent | NO | NO |
| `narrativeQuestions` | ThemeAgent | NO | NO |
| `motifLifecycle` | ThemeAgent | NO | NO |

---

## Required Changes

### 1. PDF Export — Add Protagonist System Model
**File**: `src/lib/fullReportPdfGenerator.ts` (~line 622-686)

The PDF already renders protagonist profiles with Want/Need/Flaw/Arc/arcType but is missing:
- **Protagonist System Model** badge (Single/Dual/Multi/Distributed + rationale) — render before the individual protagonist cards
- **Resolution Role** field per protagonist — add to the fields array alongside Want/Need/Flaw/Arc
- **Removal Impact** field per protagonist — render in italic/red styling below resolution role

Update the `allProtagonists` type to include `resolutionRole` and `removalImpact`.

### 2. PDF Export — Add Misinterpretation Risks
**File**: `src/lib/fullReportPdfGenerator.ts`

After rendering agent narrative content for each section, check for `misinterpretationRisks` in the agent's `sectionContent` and render a styled callout box (e.g., "Analyst Guidance" with bullet list). This should apply to CharacterAgent, StructureAgent, ConflictAgent, and ThemeAgent sections.

### 3. PDF Export — Add Load-Bearing Elements
**File**: `src/lib/fullReportPdfGenerator.ts`

In the Structure section of the PDF, render `loadBearingElements` as a table with columns: Element, Type (badge), Removal Impact.

### 4. PDF Export — Add Narrative Questions
**File**: `src/lib/fullReportPdfGenerator.ts`

In the Theme section of the PDF, render `narrativeQuestions` as a table: Question, Answer Location, Status (answered/unanswered badge).

### 5. PDF Export — Add Motif Lifecycle
**File**: `src/lib/fullReportPdfGenerator.ts`

In the Theme section of the PDF, render `motifLifecycle` as a table: Motif, Introduction, Transformation, Payoff.

### 6. UI — CraftTheme page: Add Motif Lifecycle + Narrative Questions
**File**: `src/pages/report/CraftTheme.tsx`

Read `ThemeAgent` content from `reportData.agentContent?.ThemeAgent` and display:
- **Motif Lifecycle** cards showing introduction → transformation → payoff as a visual timeline/flow
- **Narrative Questions** as a checklist (question, answer location, answered/unanswered badge)

### 7. UI — StoryStructure page: Add Load-Bearing Elements
**File**: `src/pages/report/StoryStructure.tsx`

Read `StructureAgent` content from `reportData.agentContent?.StructureAgent` and display:
- **Load-Bearing Elements** as cards grouped by type (character, symbol, line, event, image) with removal impact text

### 8. UI — StoryConflictStakes page: Add Misinterpretation Risks
**File**: `src/pages/report/StoryConflictStakes.tsx`

Read `ConflictAgent` content and display `misinterpretationRisks` using the same Analyst Guidance card pattern already in ProtagonistAnalysis.tsx.

### 9. UI — StoryStructure + CraftTheme: Add Misinterpretation Risks
**Files**: `src/pages/report/StoryStructure.tsx`, `src/pages/report/CraftTheme.tsx`

Same pattern — read `misinterpretationRisks` from StructureAgent / ThemeAgent content and render the warning card if present.

---

## Summary

| Category | Files | Count |
|---|---|---|
| PDF export | `fullReportPdfGenerator.ts` | 1 file, 5 additions |
| UI — existing pages | `CraftTheme.tsx`, `StoryStructure.tsx`, `StoryConflictStakes.tsx` | 3 files |
| UI — already done | `ProtagonistAnalysis.tsx` | No changes needed |
| No changes needed | `characterRoles.ts`, types, pipeline | Already complete |

Total: **4 files modified**, all backward-compatible (conditionally rendered when data exists).

