
# Fix: Analysis Popup Auto-Closing After Script Upload

## Problem Identified

The analysis popup auto-closes approximately 2 seconds after opening because of a race condition between two navigation actions:

1. User clicks "Run AI Analysis" in `ScriptUpload.tsx`
2. `handleRunAnalysis` navigates to `/scripts?analyze=<id>` AND calls `onUploadComplete`
3. `onUploadComplete` in `Upload.tsx` contains a **2-second delayed navigation to /dashboard**
4. This delayed navigation fires after the user has already navigated to `/scripts`, causing the page to redirect and close the dialog

## Root Cause Location

**File:** `src/pages/Upload.tsx` (lines 26-32)
```typescript
const handleUploadComplete = (scriptId: string) => {
  setUploadComplete(true);
  // Navigate to analysis page after a brief delay
  setTimeout(() => {
    navigate(`/dashboard`);
  }, 2000);
};
```

**File:** `src/components/ScriptUpload.tsx` (lines 221-226)
```typescript
const handleRunAnalysis = () => {
  if (currentScriptId) {
    navigate(`/scripts?analyze=${currentScriptId}`);
    onUploadComplete?.(currentScriptId); // This triggers the problematic timeout
  }
};
```

## Solution

Modify `ScriptUpload.tsx` to NOT call `onUploadComplete` when navigating to analysis, since the user is explicitly choosing to run analysis (not returning to dashboard).

### Implementation Steps

**Step 1: Update handleRunAnalysis in ScriptUpload.tsx**

Remove the `onUploadComplete` call from `handleRunAnalysis` since navigation to the analysis page is the intended action:

```typescript
const handleRunAnalysis = () => {
  if (currentScriptId) {
    navigate(`/scripts?analyze=${currentScriptId}`);
    // Don't call onUploadComplete - user chose analysis, not dashboard return
  }
};
```

**Step 2: Update handleViewScript in ScriptUpload.tsx** 

Similarly update `handleViewScript` to not call `onUploadComplete`:

```typescript
const handleViewScript = () => {
  if (currentScriptId) {
    navigate(`/scripts`);
    // Don't call onUploadComplete - user chose to view scripts
  }
};
```

**Step 3: Clean up Upload.tsx**

Simplify `handleUploadComplete` since it should only be used for the "Upload Another" flow or when no explicit navigation is chosen:

```typescript
const handleUploadComplete = (scriptId: string) => {
  setUploadComplete(true);
  // Only navigate to dashboard if not already navigating elsewhere
  // (handled by ScriptUpload's explicit navigation functions)
};
```

Remove the timeout-based navigation entirely - it creates unexpected UX behavior.

## Files to Modify

1. `src/components/ScriptUpload.tsx` - Remove `onUploadComplete` call from `handleRunAnalysis` and `handleViewScript`
2. `src/pages/Upload.tsx` - Remove the setTimeout navigation to prevent any residual issues

## Why This Fix Works

- When user clicks "Run AI Analysis", they navigate directly to `/scripts?analyze=<id>` without triggering the dashboard redirect
- When user clicks "View Scripts", they navigate directly to `/scripts` without triggering the dashboard redirect  
- The `onUploadComplete` callback remains available for other flows but won't interfere with explicit navigation choices
- No more race condition between two competing navigation targets
