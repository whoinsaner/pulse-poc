
# Pipeline Performance and Resilience Optimizations

## Current Bottlenecks Identified

1. **Redundant DB queries per agent**: Every `runSingleAgent` call fetches `organization_id` from `analysis_runs` joined with `scripts` -- the same query repeated 10-16 times per run.
2. **`updateAgentProgress` is read-then-write**: Each status update does a SELECT then an UPDATE on `analysis_runs.agent_progress` (a JSONB column). With agents running in parallel, this creates race conditions and ~2 DB round-trips per update.
3. **`getAgentModelConfig` hits DB per agent**: Each agent queries `agent_model_mappings` individually -- 10-16 identical queries (same `config_id`, different `agent_name`) that could be a single batch query.
4. **Sequential score inserts**: After each agent completes, parameter scores are inserted one-by-one in a loop rather than batched.
5. **Scene count query is done twice**: Lines 2362-2372 query scene count with two separate approaches back-to-back.
6. **3-second batch delay is still used for large scripts**: Even for medium scripts (e.g., 20 pages) with simple structure, the conservative 3s delay adds 15+ seconds of idle time.

## Proposed Optimizations

### Optimization 1: Hoist organization_id lookup (eliminate N redundant queries)
- Fetch `organization_id` once before entering the agent loop in `runStandardAnalysis`
- Pass it as a parameter to `runSingleAgent` instead of each agent querying it independently
- Saves 10-16 DB round-trips per run

### Optimization 2: Batch-load all model configs upfront
- Before the agent loop, query `agent_model_mappings` for ALL agent names in one query filtered by `config_id`
- Build a local map and use it in `runSingleAgent` instead of per-agent DB calls
- Saves 10-16 DB round-trips per run

### Optimization 3: Batch-load all prompt configs upfront
- Similarly, query `agent_configurations` for all active agent names in one query (org-specific first, then system fallback)
- Build a local map; each agent just does a map lookup
- Saves 10-16 DB round-trips per run

### Optimization 4: Batch insert parameter scores
- After each agent completes, collect all scores into an array and do a single `.insert([...scores])` call instead of looping
- Saves 5-10 DB round-trips per agent (50-100+ total per run)

### Optimization 5: Reduce updateAgentProgress race conditions
- Use a Postgres `jsonb_set` via `.rpc()` or a raw update with JSON path operators instead of read-modify-write
- Alternative: queue progress updates and flush them periodically (e.g., every 2 seconds) to reduce total DB calls
- This prevents parallel agents from overwriting each other's progress

### Optimization 6: Adaptive batch delays based on script size
- Currently: small scripts get 1s delay, large scripts get 3s
- Proposed tiered approach:
  - Scripts with 5 or fewer pages: 0ms delay, run all agents at once (single batch)
  - Scripts with 6-30 pages: 1s delay, batch size 4
  - Scripts with 30+ pages: 2s delay, batch size 3
- This reduces idle time for medium scripts by ~30%

### Optimization 7: Deduplicate scene count query
- Replace the two sequential scene count queries (lines 2362-2372) with a single `select('*', { count: 'exact', head: true })` call

### Optimization 8: Graceful degradation for non-critical agents
- If a non-critical agent (e.g., SceneEnrichmentAgent, MarketAgent) fails after retries, continue without blocking the pipeline
- Currently this is mostly handled, but explicitly categorize agents as "critical" vs "supplementary" so failures in supplementary agents don't inflate error messages or confuse users
- Add a `partialFailures` field to the report metadata listing which agents failed, so the UI can show targeted "re-run X agent" options

## Technical Details

### Files to modify:
- `supabase/functions/analyze-script/index.ts` -- all optimizations target this single file

### Estimated impact:
- Optimizations 1-4 combined: **save 80-150+ DB round-trips per analysis run**
- Optimization 6: **save 5-15 seconds of idle time** for medium scripts
- Optimization 5: **eliminate race conditions** in progress tracking for parallel agents
- Optimization 8: **improve perceived reliability** by surfacing partial results cleanly

### Risk mitigation:
- All optimizations are backward-compatible (no schema changes, no new tables)
- Batch queries use the same Supabase client methods, just with broader filters
- The prompt/model config caching already exists (5-minute TTL), so upfront loading is a natural extension
- Progress update changes will be tested to ensure realtime UI updates still work
