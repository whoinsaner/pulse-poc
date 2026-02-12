

# Fix Comic Format Diagnosis Page Issues

## Issues Found

### 1. Inconsistent Bullet Points
Currently, bullets (orange dots) only appear next to parameters that have `weight >= 1.2` (core tier). This creates an inconsistent look where some cards show bullets and others don't. The fix is to remove the conditional bullet entirely since the weight tier distinction is already communicated by the CORE badge on the card header.

### 2. "+N more" Not Clickable
The "+N more" text at line 337 is a plain `<p>` tag with no click handler. It needs to become a button that expands to show all parameters in that metric group.

### 3. Issue Structure Parameter Filtering
The "Issue Structure" card filter at lines 200-204 uses:
```
p.category === 'Comic Structure' ||
p.parameterName.includes('issue') ||
p.parameterName.includes('arc_structure')
```
The `parameterName.includes('issue')` pattern is problematic -- it can match unrelated parameters from other categories that happen to mention "issue" in their name, while the actual Comic Structure parameter (`structural_modularity`) is already matched by the `category === 'Comic Structure'` check. The filter should rely solely on the category match for correctness.

Similarly, other metric groups have overlapping filters (e.g., "Visual Storytelling" matches both `category === 'Comic Visuals'` AND `parameterName.includes('panel')`, which could pull in parameters from other categories). All groups should filter primarily by category.

## Technical Plan

### File: `src/pages/report/ComicFormatDiagnosis.tsx`

**A. Remove conditional bullets (lines 322-335)**
- Remove the weight tier check and bullet dot
- Show all parameter names consistently without bullets

**B. Make "+N more" expandable (lines 320-338)**
- Add a `expandedGroups` state tracking which group IDs are expanded
- Change the `group.params.slice(0, 4)` to conditionally show all params when expanded
- Replace the `<p>` tag with a clickable `<button>` that toggles the expanded state

**C. Fix metric group filters (lines 114-206)**
- Simplify each group to filter by category only (remove `parameterName.includes(...)` patterns)
- Visual Storytelling: `p.category === 'Comic Visuals'`
- Lettering and Dialogue: `p.category === 'Comic Dialogue'`
- Pacing and Rhythm: `p.category === 'Comic Pacing'`
- Art-Script Synergy: `p.category === 'Comic Collaboration'`
- Visual Characters: `p.category === 'Comic Characters'`
- Production Pipeline: `p.category === 'Comic Production'`
- Comic Market: `p.category === 'Comic Market'`
- Issue Structure: `p.category === 'Comic Structure'`

This ensures each parameter appears in exactly one group based on its assigned category, preventing duplicates and missing entries.

## Files to Edit
| File | Change |
|------|--------|
| `src/pages/report/ComicFormatDiagnosis.tsx` | Remove conditional bullets, make "+N more" expandable, fix category filters |

