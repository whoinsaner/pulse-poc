

# Fix: Resume Button Disabled for Stuck Analysis

## Problem

The Resume button in `InProgressAnalysis.tsx` (line 358) is disabled when `status === 'processing'`:

```tsx
disabled={isRetrying || (realtimeStatus || analysis.status) === 'processing'}
```

The Kadavul Valthu run has been stuck in `processing` for over 20 minutes, but the button treats it as actively running and stays disabled.

## Solution

Add a "stuck" detection check: if the run has been in `processing` for more than 5 minutes (matching the existing stuck threshold in `Scripts.tsx`), enable the Resume button regardless of status.

## Change

**File**: `src/components/report/InProgressAnalysis.tsx`

1. Add a `isStuck` calculation that checks if the run has been processing for longer than 5 minutes (using `started_at` or `created_at`).

2. Update the disabled condition on line 358 from:
   ```tsx
   disabled={isRetrying || (realtimeStatus || analysis.status) === 'processing'}
   ```
   to:
   ```tsx
   disabled={isRetrying || ((realtimeStatus || analysis.status) === 'processing' && !isStuck)}
   ```

3. Optionally update the button label to show "Resume Stuck" when the analysis is stuck, giving the user clear feedback.

This is a single-file, 3-line change. No backend or database modifications needed.

