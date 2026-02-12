

# Add SeriesBibleAgent to the Analysis Pipeline

## Problem
The Series Bible page currently stitches together data from other agents' parameter scores, but critical narrative content is hardcoded or derived with generic fallbacks:
- **World Rules**: Fixed/Flexible labels are parameter display names, not actual story rules
- **Tonal Guardrails "Avoid"**: Hardcoded as "Camp, slapstick, tonal whiplash"
- **Series Engine**: Reset/Accumulate bullet points are static strings ("New case/problem/conflict", "Guest characters", etc.)
- **Character Trajectories**: Start/End badges are generic -- no actual arc data

## Solution
Add a **SeriesBibleAgent** as a synthesis agent that runs after the core analysis agents, reads their outputs, and produces structured bible-specific content. This follows the same pattern as the existing InsightSynthesisAgent.

## Changes Required

### 1. Framework Definition (`src/lib/scriptFramework.ts`)
Add `SeriesBibleAgent` to the `META_AGENTS` array:
- **id**: `SeriesBibleAgent`
- **category**: `meta`
- **parameters**: `['bible_premise_clarity', 'bible_world_rules', 'bible_tonal_consistency', 'bible_character_trajectories', 'bible_series_engine']`
- **reportSections**: `['Series Bible']`
- **applicableScriptTypes**: `'all'` (bible-relevant data exists for all script types, though series engine section is episodic-only)

### 2. Parameter Definitions (`src/lib/parameterDefinitions.ts`)
Add 5 new parameters under a "Series Bible" category:
- `bible_premise_clarity` -- How clearly the core premise is defined for a writers' room bible
- `bible_world_rules` -- How well the world's fixed vs. flexible rules are documented
- `bible_tonal_consistency` -- Clarity of tonal guardrails and genre boundaries
- `bible_character_trajectories` -- Clarity of character transformation arcs for the series
- `bible_series_engine` -- Strength of episodic engine (reset vs. accumulate logic)

All with `agentSource: 'SeriesBibleAgent'`, weight `0.8`, and `applicableScriptTypes: 'all'`.

### 3. Edge Function Agent Definition (`supabase/functions/analyze-script/index.ts`)

**3a. Add `SeriesBibleAgent` to the AGENTS object:**
- Category: `meta`
- Parameters: the 5 bible parameters
- System prompt instructs it to synthesize from existing agent outputs (ConceptAgent, WorldLogicAgent, ThemeAgent, CharacterAgent, MarketAgent) and produce:
  - Parameter scores for all 5 bible parameters
  - A specialized `sectionContent` with structured fields

**3b. Add `sectionContent` instructions via `getSectionContentInstructions`:**
New case for `SeriesBibleAgent` returning structured fields:
```
"verdict": "...",
"whatWorks": [...],
"whatsBroken": [...],
"whatsUnderdeveloped": [...],
"deepDive": "...",
"recommendations": [...],
"corePremise": { "logline": "...", "hook": "...", "genre": "..." },
"worldRules": { "fixed": ["..."], "flexible": ["..."] },
"tonalGuardrails": { "genre": "...", "tone": "...", "avoid": ["..."] },
"characterTrajectories": [{ "name": "...", "startState": "...", "endState": "...", "arc": "..." }],
"seriesEngine": { "reset": ["..."], "accumulate": ["..."] }
```

**3c. Add to `SectionContent` interface:**
Add the new fields (`corePremise`, `worldRules`, `tonalGuardrails`, `characterTrajectories`, `seriesEngine`) as optional properties.

**3d. Add to `SYNTHESIS_AGENTS` set:**
So it gets an upgraded model tier for reliable output.

**3e. Add to agent orchestration (agent list building):**
Add `SeriesBibleAgent` to the `metaAgents` array so it runs for all script types.

### 4. Series Bible Page (`src/pages/report/SeriesBibleExtract.tsx`)
Update the UI to consume real data from `agentContent.SeriesBibleAgent`:

- **Core Premise card**: Use `bibleContent.corePremise.logline` and `bibleContent.corePremise.hook` instead of fallbacks
- **World Rules card**: Use `bibleContent.worldRules.fixed` and `bibleContent.worldRules.flexible` arrays instead of deriving from parameter names
- **Tonal Guardrails card**: Use `bibleContent.tonalGuardrails.avoid` instead of the hardcoded "Camp, slapstick, tonal whiplash"
- **Character Trajectories card**: Use `bibleContent.characterTrajectories` array with real `name`, `startState`, `endState` fields instead of generic Start/End badges
- **Series Engine card**: Use `bibleContent.seriesEngine.reset` and `bibleContent.seriesEngine.accumulate` instead of static strings
- Retain graceful fallbacks to the existing parameter-derived approach when `agentContent.SeriesBibleAgent` is not available (backward compatibility with older reports)

### 5. Parameter Sync (`src/lib/parameterSync.ts`)
No changes needed -- it already imports from `parameterDefinitions.ts` dynamically.

### 6. Agent Sync (`src/lib/agentSync.ts`)
No changes needed -- it already imports `ALL_AGENTS` from `scriptFramework.ts` and auto-syncs on mount.

## Data Flow

```text
Core Agents (Concept, World, Theme, Character, Market)
        |
        v  (agent_progress.sectionContent)
SeriesBibleAgent (reads existing agent outputs + script context)
        |
        v  (agent_progress.SeriesBibleAgent.sectionContent)
generateReport() collects into agentContent
        |
        v  (full_report_data.agentContent.SeriesBibleAgent)
SeriesBibleExtract.tsx reads structured bible fields
```

## Backward Compatibility
- Existing reports without `SeriesBibleAgent` data continue to work -- the page falls back to the current parameter-derived approach
- The agent auto-syncs to the database via the existing sync mechanism
- New parameters auto-seed via the existing parameter sync mechanism

## Files Modified
1. `src/lib/scriptFramework.ts` -- Add SeriesBibleAgent definition
2. `src/lib/parameterDefinitions.ts` -- Add 5 bible parameters
3. `supabase/functions/analyze-script/index.ts` -- Add agent prompt, sectionContent instructions, orchestration
4. `src/pages/report/SeriesBibleExtract.tsx` -- Consume real agentContent data with fallbacks
