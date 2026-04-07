

# Fix: Missing Character Diagnosis Section After Resume

## Root Cause

The resume logic (line 2590) skips agents whose `agent_progress` status is "completed" — but the original run's edge function timed out **after** marking CharacterAgent/ConflictAgent/EmotionalArcAgent as completed in `agent_progress`, yet **before** their `parameter_scores` were persisted to the database. The report's `categoryScores` is built entirely from `parameter_scores`, so Character, Conflict, and Emotional Arc categories are absent from navigation.

**Evidence**: `agent_progress` has full `sectionContent` for all 15 agents, but `parameter_scores` only contains 8 categories (missing Character, Conflict, Emotional Arc).

## Fix: Two-Part Solution

### Part 1 — Resume: Detect "ghost completed" agents (systemic fix)

**File**: `supabase/functions/analyze-script/index.ts` (~line 2588)

After loading `existingProgress`, query `parameter_scores` for this run to get a set of agent names that actually have persisted scores. In the retry filter, treat an agent as needing re-run if it's marked "completed" in progress but has **zero** parameter scores in the database.

```
Logic change in the resume filter (line 2590):
1. Query: SELECT DISTINCT agent_name FROM parameter_scores WHERE analysis_run_id = ?
2. Build a Set of agents with persisted scores
3. In the filter: also retry agents where progress.status === 'completed' 
   BUT agent_name is NOT in the persisted scores set
```

This ensures resumed runs recover from the exact scenario that caused this bug.

### Part 2 — Report generation: Reconstruct missing categoryScores from agentContent (resilience layer)

**File**: `supabase/functions/analyze-script/index.ts` (~line 5028, in `generateReport`)

After building `categoryScores` from `parameter_scores`, check if any expected categories are missing but have `agentContent` with scores data. If so, reconstruct those category scores from the `sectionContent.scores` array stored in `agent_progress`. This is a fallback — Part 1 prevents the scenario, Part 2 handles it gracefully if it still occurs.

```
After line 5041, add:
- Define expected categories per agent (CharacterAgent→Character, ConflictAgent→Conflict, etc.)
- For each agent in agentContent, if its category is missing from categoryScores,
  extract scores from sectionContent and add them to categoryScores
```

### Summary

| Change | File | Purpose |
|--------|------|---------|
| Ghost-completed detection | analyze-script/index.ts (resume filter) | Re-run agents that completed but lost their scores |
| categoryScores fallback | analyze-script/index.ts (generateReport) | Resilience layer for reports with partial score data |

Both changes are in a single file. No database migrations needed. After deployment, a fresh analysis (or another resume) for Kadavul Valthu will properly persist all parameter scores and show the Character Diagnosis section.

