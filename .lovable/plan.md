

# Pipeline Improvement Plan: Feedback-Driven + Graph Enrichment

## Overview
Address all 9 concerns from the Kadavul Valthu feedback plus add a relationship graph that powers smarter character analysis. The root fix is a **two-phase execution model** where system agents (especially CinemaTraditionAgent) complete first and their outputs are injected into all downstream agent prompts.

## Architecture Change: Two-Phase Agent Execution

**Problem discovered**: Currently all agents (system + core) run in parallel batches. CinemaTraditionAgent detects `resolutionModel`, `formatType`, `tradition` but these values are **never passed to downstream agents**. This is the root cause of most feedback issues.

**Fix**: Split `runStandardAnalysis` into two phases:
1. **Phase 1**: Run system agents (5 agents). Wait for completion.
2. **Phase 2**: Read CinemaTraditionAgent's `sectionContent` from `agent_progress`. Build a `traditionPreamble` string and prepend it to `scriptContext` for all core agents.

The `traditionPreamble` would include:
- Detected tradition + audience grammar
- Resolution model (moral/poetic/procedural/cyclical)
- Format type + page-count calibration note for director's spec
- Structural conventions (interval placement, dual protagonist, etc.)

**File**: `supabase/functions/analyze-script/index.ts` — modify `runStandardAnalysis` and `runChunkedAnalysis`

---

## Change 1: Multi-Protagonist Data Model (P0)

**Problem**: `protagonistProfile` is a single object. Palani (the second protagonist) was missed entirely.

### Edge Function
- Update CharacterAgent's output schema: `protagonistProfile` becomes `protagonistProfiles` (array), with backward compat accepting either shape
- Add `arcType` field per protagonist: `"public"`, `"private"`, `"silent"`, `"action-driven"`
- Add prompt instruction: *"Identify ALL protagonists by narrative function, not dialogue count. A silent character driving a parallel justice arc is a protagonist."*

### Types
- `src/types/database.ts`: Add `protagonistProfiles` array type to `AgentSectionContent`, keep `protagonistProfile` for backward compat

### UI — ProtagonistAnalysis.tsx
- Detect array vs single object in `agentContent.CharacterAgent`
- Render multiple protagonist profile cards when array is present
- Show `arcType` badge on each card

### PDF Generator
- Render multiple protagonist profiles in character section

**Files**: `analyze-script/index.ts`, `src/types/database.ts`, `src/pages/report/ProtagonistAnalysis.tsx`, `src/lib/fullReportPdfGenerator.ts`

---

## Change 2: Relationship Graph Enrichment (P0)

**Problem**: Current `buildNarrativeGraph` creates only sequential scene edges and standalone character nodes — no co-occurrence, no relationship edges, no weight.

### Parser Enhancement (`script-parser-stream/index.ts`)
Enrich `buildNarrativeGraph` to:
- Build **character co-occurrence edges** from parsed scene data (which characters appear in which scenes)
- Weight edges by shared scene count
- Add `relationship` edge type alongside existing `sequence` type
- Include `weight` and `sharedScenes` on each edge

### Inject Graph Summary into Agent Context
In `buildScriptContext`, append a "CHARACTER RELATIONSHIP GRAPH" section:
```
CHARACTER RELATIONSHIPS (co-occurrence):
- Aadhan ↔ Palani: 8 shared scenes (strong bond)
- Aadhan ↔ Sundaram: 5 shared scenes (antagonistic)
- Palani ↔ George: 3 shared scenes
```

This gives CharacterAgent structural evidence to identify narrative hubs (characters central to multiple story threads) regardless of dialogue count.

### UI — NarrativeGraphViewer / CharacterNetwork
Already uses graph data. The enriched edges will automatically appear as weighted connections in the existing visualization.

**Files**: `supabase/functions/script-parser-stream/index.ts`, `supabase/functions/script-parser/index.ts`, `supabase/functions/analyze-script/index.ts` (buildScriptContext)

---

## Change 3: Antagonist Philosophy Model (P1)

**Problem**: Antagonist evaluation assumes Hollywood psychological complexity (wounds, self-justification). Sundaram and Periyavar operate through conviction/worldview.

### Edge Function
- Expand `antagonistProfile` schema: add `worldview`, `philosophyType` (`psychological` | `philosophical` | `systemic` | `institutional`)
- Update CharacterAgent prompt: *"Not all antagonists operate through psychological vulnerability. Evaluate antagonist complexity based on whether their opposition is coherent and dramatically effective. A villain whose worldview is answered by a child is dramatically complete."*

### UI — AntagonistAnalysis.tsx
- Display `worldview` and `philosophyType` fields when present

### Types
- Update `AgentSectionContent.antagonistProfile` type

**Files**: `analyze-script/index.ts`, `src/types/database.ts`, `src/pages/report/AntagonistAnalysis.tsx`

---

## Change 4: Prompt-Level Fixes for Remaining Concerns (P1-P2)

All in `analyze-script/index.ts` agent prompts:

| Concern | Agent | Prompt Addition |
|---------|-------|----------------|
| Page count calibration | Injected via traditionPreamble (Change 0) | "Director's spec: page count ≠ runtime. Do not penalize length." |
| Emotional register diversity | StructureAgent + EmotionalArcAgent | "Action sequences with different emotional registers are distinct narrative units." |
| Edit-dependent crosscutting | StructureAgent | "Distinguish information-driven vs rhythm-driven crosscutting. Flag edit-dependent sequences rather than penalizing them." |
| Systemic critique vs sensitivity | ConceptAgent / MarketAgent | "Distinguish scripts endorsing stereotypes from scripts dramatizing systems that exploit them." |
| Thematic call-and-response | ThemeAgent | "Track thematic call-and-response: one character's claim answered by another. This is valid resolution." |

---

## Change 5: Resolution Model Display in Report (P1)

### ReportCover.tsx
- Read `agentContent.CinemaTraditionAgent.resolutionModel` and display as a badge (e.g., "Resolution Model: Moral")

### Story Diagnosis
- Show detected tradition, format type, and resolution model in StoryDiagnosis header

**Files**: `src/pages/report/ReportCover.tsx`, `src/pages/report/StoryDiagnosis.tsx`

---

## Implementation Priority

| Order | Change | Effort | Impact |
|-------|--------|--------|--------|
| 1 | Two-phase execution + traditionPreamble injection | Medium | Unlocks all tradition-aware fixes |
| 2 | Multi-protagonist model + CharacterAgent prompt | Medium | Fixes the core analysis failure |
| 3 | Graph enrichment (co-occurrence edges + context injection) | Medium | Gives CharacterAgent structural evidence |
| 4 | Antagonist philosophy model | Small | Fixes false "flat villain" diagnosis |
| 5 | Prompt-level fixes (5 agents) | Small | Addresses remaining 5 concerns |
| 6 | Resolution model display in report UI | Small | Surfaces tradition context to users |

## Files Modified

- `supabase/functions/analyze-script/index.ts` — Two-phase execution, agent prompts, schema updates, buildScriptContext graph summary
- `supabase/functions/script-parser-stream/index.ts` — Graph enrichment (co-occurrence edges)
- `supabase/functions/script-parser/index.ts` — Same graph enrichment
- `src/types/database.ts` — protagonistProfiles array, antagonist worldview fields
- `src/pages/report/ProtagonistAnalysis.tsx` — Multi-protagonist rendering
- `src/pages/report/AntagonistAnalysis.tsx` — Worldview/philosophy display
- `src/pages/report/ReportCover.tsx` — Resolution model badge
- `src/pages/report/StoryDiagnosis.tsx` — Tradition context display
- `src/lib/fullReportPdfGenerator.ts` — Multi-protagonist PDF rendering

No database migrations needed — all data flows through existing JSONB columns.

