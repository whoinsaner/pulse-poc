

# Fix: Pass Script Type to Analysis Dialog

## Problem

The "Analyze Script" dialog on the Scripts page does not pass `scriptType` to the `AnalysisTrigger` component. It defaults to `'feature'` regardless of the actual script type, causing:

- Comic scripts to show 12 agents instead of 16 (missing 4 comic agents)
- Incorrect parameter count (~86 instead of ~105 for comics)
- No "Comic-Specific Agents" section in the progress UI

The backend analysis itself works correctly since it reads script type from the database -- this is purely a UI display issue.

## Fix

One-line change in `src/pages/Scripts.tsx`:

Add `scriptType={selectedScript.script_type}` to the `AnalysisTrigger` component at line 555.

```
Before:
  <AnalysisTrigger
    scriptId={selectedScript.id}
    scriptTitle={selectedScript.title}
    onAnalysisComplete={...}
  />

After:
  <AnalysisTrigger
    scriptId={selectedScript.id}
    scriptTitle={selectedScript.title}
    scriptType={selectedScript.script_type}
    onAnalysisComplete={...}
  />
```

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Scripts.tsx` | Add `scriptType` prop to `AnalysisTrigger` (line 557) |

