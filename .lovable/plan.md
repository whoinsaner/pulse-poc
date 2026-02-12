

# Review: Comic-Specific Adaptation Needs Across All Core USAF Agents

## Summary

After reviewing all 10 core agents (Modules A-J), the DialogueAgent (F) has already been updated. Of the remaining 9, **5 agents need meaningful comic adaptations**, 2 need minor tweaks, and 2 are already universal enough.

## Agent-by-Agent Assessment

### Already Done
| Agent | Status |
|-------|--------|
| **DialogueAgent (F)** | Adapted -- caption economy, visual-text interplay, narrative voice identity |

### High Priority -- Significant Comic Adaptation Needed

| Agent | Why It Needs Adaptation | Key Changes |
|-------|------------------------|-------------|
| **StructureAgent (B)** | Assumes act-based screenplay structure. Comics use issue arcs, page-turn pacing, and spread-based rhythm. | Reinterpret "Midpoint Transformation" as mid-issue pivot; "Drop-off Risk" as page-turn engagement drops; "Structural Symmetry" as issue-level pacing balance |
| **CharacterAgent (C)** | "Performative Range" assumes actors. Comic characters are conveyed through visual design cues in script directions, not performance. | Drop actor-centric language; evaluate character through visual description clarity, design distinctiveness, and expression scripting; "Agency Level" should account for visual action beats |
| **EmotionalArcAgent (H)** | "Emotional Timing" assumes scene-based pacing. Comics deliver emotion through splash pages, wordless sequences, and page-turn reveals. | Reinterpret timing as page-based; "Catharsis Strength" as visual reveal impact; "Fatigue vs Variety" as panel density variation |
| **MarketAgent (I)** | "Platform Fit" references theatrical/streaming. Comics have entirely different distribution (single issues, trades, webtoon, digital-first). | Add comic platforms; "Audience Fit" should reference comic reader demographics; "IP Expansion Potential" should note transmedia from comics |
| **ExecutionAgent (J)** | "Production Complexity" assumes film production. Comic production means art complexity, page count, and coloring. | "Talent Dependency" becomes artist dependency; "Technical Dependency" becomes print/digital format needs; "Schedule Risk" becomes pages-per-month feasibility |

### Low Priority -- Minor Tweaks

| Agent | Why | Suggested Change |
|-------|-----|-----------------|
| **ThemeAgent (E)** | "Symbol/Motif Consistency" should emphasize visual symbols (recurring imagery, color scripting) not just dialogue-based themes | Add note about evaluating visual motif cues described in panel directions |
| **ConceptAgent (A)** | Mostly universal, but "Hook Clarity" could note that comics use cover art and visual hooks | Add brief note about visual hook potential |

### No Changes Needed

| Agent | Why |
|-------|-----|
| **ConflictAgent (D)** | Conflict evaluation is genuinely medium-agnostic. The parameters work as-is for comics. |
| **WorldLogicAgent (G)** | World consistency, spatial logic, and plausibility apply identically to comics. No adaptation needed. |

## Implementation

All changes go in one file: `supabase/functions/analyze-script/index.ts`

For each agent needing adaptation, the pattern is identical to what was done for DialogueAgent: append a `COMIC/GRAPHIC NARRATIVE ADAPTATION:` block to the end of the existing system prompt. This block activates only when the script type is "comic" (which is already passed in context). No other files change.

### Estimated scope
- 5 high-priority agent prompt updates
- 2 low-priority agent prompt tweaks
- 1 edge function redeployment
- No UI changes, no database changes

