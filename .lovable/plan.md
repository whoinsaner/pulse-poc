

# Plan: Fix Reasoning Setting Not Reaching Edge Function

## Root Cause
The reasoning setting persists correctly in `localStorage`, but there are two issues:

1. **Missing code path**: `AnalysisRunHistory.tsx` (the retry-from-history flow) invokes `analyze-script` without `reasoningEffort` at all (line 139-148). This was missed in the previous fix.

2. **No verification log**: The previous plan included adding a `console.log` at invoke time to show the reasoning value being sent, but it was never implemented. This makes it impossible to confirm whether the client is sending the value.

3. **Origin mismatch risk**: `localStorage` is scoped per browser origin. If the user toggles reasoning on one preview URL and triggers analysis from another (or from the published site), the setting won't be found. Adding a visible indicator on the analysis trigger UI would make this transparent.

## Changes

### 1. Add `reasoningEffort` to AnalysisRunHistory retry path
**File: `src/components/AnalysisRunHistory.tsx`** (line ~139-148)
- Read reasoning from `localStorage` and include it in the invoke body, same pattern as the other files.

### 2. Add console.log at all invoke sites
**Files: `AnalysisTrigger.tsx`, `InProgressAnalysis.tsx`, `ReportLayout.tsx`, `AnalysisRunHistory.tsx`**
- Add `console.log('[analyze-script] Sending reasoningEffort:', reasoningEffort)` just before each invoke call so the browser console confirms what value is being sent.

### 3. Show active reasoning state on analysis trigger UI
**File: `src/components/AnalysisTrigger.tsx`**
- Display a small indicator (e.g., a Brain icon + "Reasoning: High") near the analyze button, reading directly from `localStorage` on render. This gives the user immediate visual confirmation that reasoning is active before they click analyze.

## Technical Details
- 4 frontend files changed, no edge function or database changes
- The `localStorage` reads are already correct; this plan adds the missing code path and diagnostic visibility

