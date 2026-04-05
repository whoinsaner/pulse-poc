

# Plan: Persist `reasoningEffort` in `analysis_runs` Table

## What
Add a `reasoning_effort` column to the `analysis_runs` table and store the value when creating/updating a run, so any run's reasoning setting can be verified from the database.

## Changes

### 1. Database migration — add column
Add a nullable `text` column `reasoning_effort` to `analysis_runs`, defaulting to `NULL` (meaning reasoning was off).

```sql
ALTER TABLE public.analysis_runs ADD COLUMN reasoning_effort text DEFAULT NULL;
```

### 2. Edge function — store value on run start
In `supabase/functions/analyze-script/index.ts`, after parsing the request body (around line 2257), update the analysis run to set `reasoning_effort`:

```typescript
// After parsing reasoningEffort from request body
await supabase.from('analysis_runs')
  .update({ reasoning_effort: reasoningEffort || null })
  .eq('id', analysisRunId);
```

### 3. Client — pass value when creating runs
In `AnalysisRunHistory.tsx` (retry path) and `AnalysisTrigger.tsx` (new run creation), include `reasoning_effort` in the `.insert()` call when creating the `analysis_runs` row.

### 4. Display in Analysis Run History UI
In `AnalysisRunHistory.tsx`, show a badge when `reasoning_effort` is set (e.g., "⚡ Reasoning: Medium") alongside the existing quality mode and stakeholder lens badges.

## Technical Details
- 1 migration (add column)
- 1 edge function edit (store value)
- 2 frontend files edited (pass on insert + display badge)
- No RLS changes needed — existing update/insert policies cover this column automatically

