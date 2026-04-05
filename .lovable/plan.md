

# Plan: Rate Limit Resilience for Analysis Pipeline

## Problem
The analysis pipeline fires up to 7 agents simultaneously per batch. When the AI gateway rate-limits (429), all agents retry at the same time with identical backoff timers, creating a "thundering herd" that exhausts all retry attempts without recovery. This is worse when reasoning is enabled because reasoning requests consume more tokens and take longer, increasing the likelihood of hitting rate limits.

## Changes

### 1. Reduce Batch Concurrency
In `supabase/functions/analyze-script/index.ts`, reduce `BATCH_SIZE` for medium/large agent counts:
- Medium (9-16 agents): `BATCH_SIZE = 4` (was 7), `BATCH_DELAY_MS = 500` (was 200)
- Large (17+ agents): `BATCH_SIZE = 3` (was 6), `BATCH_DELAY_MS = 1000` (was 500)
- When reasoning is enabled: further reduce by 1 (e.g., 3 becomes 2) since reasoning requests are heavier

### 2. Add Jittered Backoff per Agent
Replace the synchronized exponential backoff with per-agent randomized jitter:
- Current: `delay = retryDelayMs * 2^attempt` (all agents retry at exact same time)
- New: `delay = retryDelayMs * 2^attempt + random(0, retryDelayMs)` (agents stagger retries)
- Apply this in the inner retry loop inside `runAgent` (line ~3920)

### 3. Add Staggered Launch Within Each Batch
Instead of firing all agents in a batch simultaneously via `Promise.all`, introduce a small stagger (300ms) between each agent launch within a batch. Agents still run concurrently, but their requests hit the gateway at slightly different times:
```text
Batch of 4 agents:
  t=0ms    Agent A starts
  t=300ms  Agent B starts
  t=600ms  Agent C starts
  t=900ms  Agent D starts
  (all 4 run concurrently, just staggered starts)
```

### 4. Increase Max Retries for Rate Limits Specifically
Currently `maxRetries` (default 3) governs both empty-response retries and 429 retries. Add a separate counter for rate-limit retries with a higher limit (6 attempts) and longer backoff ceiling (30s), so transient rate limits don't permanently kill agents.

### 5. Fix the `supabase.rpc(...).catch is not a function` Error
The edge function logs show `Background analysis error: supabase.rpc(...).catch is not a function`. This is the error that causes the final status update to fail. Fix the `.catch()` call on the RPC invocation (likely needs `await` or `.then().catch()` pattern).

## Technical Details
- All changes are in `supabase/functions/analyze-script/index.ts`
- The stagger-within-batch approach uses a helper that wraps each agent call with a delay: `agents.map((a, i) => new Promise(r => setTimeout(r, i * 300)).then(() => runSingleAgent(a)))`
- Rate-limit-specific retry counter is separate from the general retry counter so non-429 errors still fail fast
- Reasoning-aware batch sizing reads the `reasoningEffort` parameter already passed to `runStandardAnalysis`
- No database changes required

