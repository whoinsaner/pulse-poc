

# Make Diagnosis Sections Expandable

## Problem
The "What's Working" / "What Needs Work" sections show only a few items with a "+N more" count, but there's no way to click and expand to see all items.

## Solution
Add expand/collapse functionality to the `DiagnosisSection` component inside `DiagnosisSummary.tsx`. By default, show only the first 3 items. Display a clickable "+N more" button that expands to reveal all items, and collapses back with a "Show less" button.

## Changes

### `src/components/report/ui/DiagnosisSummary.tsx`
- Import `useState` from React
- In `DiagnosisSection`, add a `collapsed` state (default `true`)
- Show only the first 3 items when collapsed
- If there are more than 3 items, render a clickable "+N more" button below the visible items
- When expanded, show all items and a "Show less" button
- Style the toggle button to match the section's color class (green for working, red for broken, amber for underdeveloped)

### Technical Detail
```text
Collapsed state:
  [icon] What's Working                    41
  * Item 1
  * Item 2
  * Item 3
  [+38 more]  <-- clickable button

Expanded state:
  [icon] What's Working                    41
  * Item 1
  * Item 2
  * Item 3
  * Item 4
  ...
  * Item 41
  [Show less]  <-- clickable button
```

The `INITIAL_VISIBLE_COUNT` constant will be set to 3 to match the current screenshot behavior. The expand button uses `ChevronDown`/`ChevronUp` icons for visual clarity.
