

# Plan: Fix Reasoning Not Applied to Analysis Runs

## Root Cause

The `isReasoningEnabled` flag in `AnalysisTrigger.tsx` is read from `localStorage` once at component mount time (line 99). It is a plain `const`, not reactive state. If you enable reasoning in Settings and then navigate to the Scripts page (where AnalysisTrigger is already mounted or was mounted before the setting change), the component still holds the stale `false` value. The invoke call on line 378 then sends `reasoningEffort: null`, meaning reasoning is never applied.

Additionally, the reasoning UI selector (lines 580-600) is gated on `isReasoningEnabled`, so it would not have been visible on the analysis screen if the component mounted before the toggle was turned on.

## Fix

### 1. Make `isReasoningEnabled` reactive -- `src/components/AnalysisTrigger.tsx`

Move the localStorage reads into state and re-read them when the component becomes visible or when the invoke fires:

- Read `pulse_reasoning_enabled` fresh at **invoke time** (inside the `startAnalysis` function) rather than relying on the mount-time const
- Also re-read it for the UI selector so the reasoning picker appears/disappears if the user toggled the setting in another tab/page
- Use a `useSyncExternalStore` or simply re-read localStorage in a `useEffect` with a `storage` event listener, or read it fresh on each render since localStorage reads are synchronous and cheap

The simplest correct fix:
- Keep `isReasoningEnabled` as state (`useState`) 
- Add a `useEffect` that listens for the `storage` event and also re-reads on focus/visibility change
- At invoke time (line 378), do a fresh `localStorage.getItem('pulse_reasoning_enabled') === 'true'` check instead of using the potentially stale const

### 2. No edge function changes needed

The edge function code already correctly handles `reasoningEffort` -- the problem is entirely on the client side not sending it.

## Technical Details

**Current (broken)**:
```typescript
// Line 99 - read once at mount, never updates
const isReasoningEnabled = localStorage.getItem('pulse_reasoning_enabled') === 'true';
```

**Fixed**:
```typescript
const [isReasoningEnabled, setIsReasoningEnabled] = useState(
  () => localStorage.getItem('pulse_reasoning_enabled') === 'true'
);

useEffect(() => {
  const sync = () => setIsReasoningEnabled(
    localStorage.getItem('pulse_reasoning_enabled') === 'true'
  );
  window.addEventListener('storage', sync);
  window.addEventListener('focus', sync);
  return () => {
    window.removeEventListener('storage', sync);
    window.removeEventListener('focus', sync);
  };
}, []);
```

And at invoke time, do a fresh read as a safety net:
```typescript
reasoningEffort: localStorage.getItem('pulse_reasoning_enabled') === 'true' 
  ? reasoningEffort : null,
```

