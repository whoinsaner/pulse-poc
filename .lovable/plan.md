
# Hide Series Bible from Feature Film Reports

## Problem
The "Series Bible" navigation item appears for all script types, including standalone feature films where it's irrelevant. A Series Bible covers episodic sustainability, series engine, and repeatability -- concepts that don't apply to one-off films.

## Solution
Make the Series Bible nav item conditionally visible only for episodic/serialized script types.

### Changes

**File: `src/lib/reportNavigation.ts`**

In both `ALL_NAV_GROUPS` and `USAF_NAV_GROUPS`, update the Reference group to split items so that "Series Bible" only appears for applicable types. Two approaches:

**Approach chosen**: Add an `applicableTypes` field to the `NavItem` interface (individual items), then filter items by script type in `getNavGroupsForScriptType()`.

1. **Add optional `applicableTypes` to `NavItem` interface** -- allows per-item filtering (currently only groups have this field).

2. **Tag the Series Bible item** with `applicableTypes: ['web_series', 'pilot', 'episode', 'micro_drama']` in both nav group arrays.

3. **Update `getNavGroupsForScriptType()`** to also filter out individual items whose `applicableTypes` don't match the current script type, after filtering groups.

This is a minimal, surgical change -- no new files, no UI changes, just conditional visibility.

### Technical Detail

```text
NavItem interface:
  + applicableTypes?: ScriptType[] | 'all'   (optional, defaults to 'all')

Series Bible item:
  { id: 'bible', label: 'Series Bible', ..., applicableTypes: ['web_series', 'pilot', 'episode', 'micro_drama'] }

getNavGroupsForScriptType():
  After filtering groups, also filter each group's items by applicableTypes
```

One file modified: `src/lib/reportNavigation.ts`
