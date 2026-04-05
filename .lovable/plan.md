

# Plan: Fix Reasoning Flag Not Reaching Edge Function

## Problem
Two bugs prevent the reasoning setting from being sent to the analysis pipeline:

1. **Resume/retry paths omit reasoning entirely.** `InProgressAnalysis.tsx` (lines 173-180, 215-221) and `ReportLayout.tsx` (line 183-186) invoke `analyze-script` with `resume: true` but never include `reasoningEffort`. This means any resumed or retried analysis always runs with `reasoning: off`.

2. **Same-tab sync is unreliable.** The `storage` event in `AnalysisTrigger.tsx` only fires for cross-tab changes. When a user toggles reasoning in Settings and navigates back (same tab), the sync relies on the `focus` event, which uses `prev ?? effort` — this won't update if the effort level changed.

## Changes

### 1. Add `reasoningEffort` to all resume/retry invoke calls
**File: `src/components/report/InProgressAnalysis.tsx`**
- In `handleResumeAnalysis` (line ~174) and `handleRetryAgent` (line ~215), read `reasoningEffort` from `localStorage` and include it in the request body:
  ```
  reasoningEffort: localStorage.getItem('pulse_reasoning_enabled') === 'true'
    ? (localStorage.getItem('pulse_reasoning_effort') || 'medium')
    : null
  ```

**File: `src/components/report/ReportLayout.tsx`**
- Same fix at line ~183 where it invokes `analyze-script` with resume.

### 2. Fix same-tab reasoning sync in AnalysisTrigger
**File: `src/components/AnalysisTrigger.tsx`**
- Change line 115 from `setReasoningEffort(prev => prev ?? effort)` to `setReasoningEffort(effort)` so updated effort levels are always picked up.
- Read `reasoningEffort` directly from `localStorage` at invoke time (line 401) instead of relying on React state, to guarantee the freshest value. The state is still used for the UI toggle display.

### 3. Add a console log for verification
Add a log line in `AnalysisTrigger.tsx` at the invoke call showing the reasoning value being sent, so future debugging is easier.

## Technical Details
- All changes are in 3 frontend files; no edge function or database changes needed
- The edge function already handles `reasoningEffort` correctly — the bug is purely that the client never sends it in certain code paths
- The `localStorage` read at invoke time is the safest approach since it eliminates any stale React state issues

