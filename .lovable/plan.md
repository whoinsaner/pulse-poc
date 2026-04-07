

# Preventing CharacterAgent from Being Skipped or Missed

## Current Vulnerability Chain

The CharacterAgent can be "lost" through this sequence:

1. CharacterAgent is a `COMPLEX_AGENT` and `CRITICAL_AGENT` — it gets a heavier model, which means longer response times
2. `runSingleAgent` calls `runAgent()` **without a per-call timeout** — the `fetch()` at line 4415 can hang for the full duration of the global watchdog
3. The **global watchdog** (25 min) kills the entire pipeline when it fires, but agents that already returned have their `agent_progress` marked "completed" with `sectionContent` saved — while agents still in-flight (or whose score persistence was interrupted) become "ghost completed"
4. On resume, ghost-completed agents were previously skipped (now fixed), but the timeout that caused the problem in the first place remains

## Three-Layer Fix

### Layer 1 — Per-agent timeout on `runAgent` (prevents hang)

**File**: `supabase/functions/analyze-script/index.ts` (~line 3607)

Wrap the `runAgent()` call inside `runSingleAgent` with `withTimeout`:

```typescript
const result = await withTimeout(
  runAgent(apiKey, agentName, promptConfig, scriptContext, parameterMap, modelConfig, dynamicGlobalInstructions),
  AGENT_CALL_TIMEOUT_MS,  // 5 minutes
  agentName
);
```

This ensures no single agent can hang longer than 5 minutes. If it times out, the retry logic in `runSingleAgent` catches the error and retries up to `maxRetries` times. CharacterAgent gets 3 retries × 5 min = 15 min max before being marked failed (not ghost-completed).

### Layer 2 — Atomic score persistence (prevents ghost-completed)

**File**: `supabase/functions/analyze-script/index.ts` (~line 3609-3659)

Currently, `runSingleAgent` does three sequential DB writes after `runAgent` returns:
1. Delete old scores
2. Insert new scores
3. Update `agent_progress` to "completed"

If the global watchdog fires between step 2 and step 3 (or between 1 and 2), the agent is either ghost-completed or has no scores. Fix: **only mark "completed" after scores are successfully persisted**, and wrap the score persistence in a try-catch that marks the agent as "failed" if the DB writes fail.

```typescript
// After runAgent returns successfully:
try {
  await supabase.from('parameter_scores').delete()...;
  await supabase.from('parameter_scores').insert(scoresToInsert);
  await supabase.from('insights').insert(insightsToInsert);
  // Only NOW mark completed
  await updateAgentProgress(..., 'completed', ..., result.sectionContent);
} catch (dbErr) {
  await updateAgentProgress(..., 'failed', 'Score persistence failed: ' + dbErr.message);
  return { agent: agentName, success: false, error: 'DB write failed' };
}
```

This is actually the current flow already (lines 3609-3659), but the issue is the global watchdog can kill the process between these steps. The per-agent timeout in Layer 1 prevents this by ensuring agents complete well within the global timeout.

### Layer 3 — Ghost-completed recovery (already deployed)

The fix we just deployed handles recovery if Layers 1-2 fail: on resume, agents marked "completed" but with no `parameter_scores` rows are re-run.

## Summary

| Layer | Change | Purpose |
|-------|--------|---------|
| 1 | `withTimeout(runAgent(...), 5min)` in `runSingleAgent` | Prevent any single agent from hanging |
| 2 | Error-guard DB writes, only mark "completed" after persist | Prevent ghost-completed state |
| 3 | Ghost-completed detection on resume (already live) | Recovery safety net |

All changes are in `supabase/functions/analyze-script/index.ts`. No database migrations needed.

