

# Fix Scene Heading Detection for Numbered Sluglines

## Problem

The uploaded screenplay uses numbered/lettered scene sluglines like:
- `1A. EXT. VILLAGE ROAD – NIGHT`
- `1B. INT. MANICKAM'S HOUSE – NIGHT`
- `52. EXT. HIGHWAY – DAY`

The current regex patterns require lines to **start with** `INT.`/`EXT.`, so any scene number prefix causes the match to fail. This resulted in only 4 scenes detected (from edge cases) instead of the full script, yielding 72.8% coverage and `isComplete=false`.

## Solution

Update scene heading regex patterns in **two places** within `supabase/functions/script-parser-stream/index.ts`:

1. **`normalizeToFountain` function** (line 563) -- the normalization pass
2. **`parseTextFormat` function** (line 2106) -- the actual scene extraction pass

Both need a new pattern that strips optional leading scene numbers before matching `INT.`/`EXT.`.

## Changes

**File: `supabase/functions/script-parser-stream/index.ts`**

### 1. `normalizeToFountain` -- update `sceneHeadingPattern` (line 563)

Change from:
```
/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*.+/i
```
To:
```
/^(?:\d+[A-Z]?\.\s*)?(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*.+/i
```

The `(?:\d+[A-Z]?\.\s*)?` prefix optionally matches patterns like `1.`, `1A.`, `52.`, `123B.` followed by a space.

### 2. `parseTextFormat` -- update `sceneHeadingPattern` (line 2106)

Change from:
```
/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.+?)(?:\s*-\s*(.+))?$/i
```
To:
```
/^(?:\d+[A-Z]?\.\s*)?(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*(.+?)(?:\s*[-–—]\s*(.+))?$/i
```

This also adds support for em-dash (`–`, `—`) separators in addition to hyphens, since the sample text uses `–` (en-dash) between location and time of day.

### 3. `normalizeToFountain` -- also handle dash variants in loose pattern matching

Update `looseScenePattern` (line 564) to handle en-dash/em-dash separators as well, so the time-of-day portion is correctly captured.

## Technical Details

- The `(?:\d+[A-Z]?\.\s*)?` is a non-capturing optional group, so capture group indices remain unchanged
- No other functions or files need changes
- The edge function will be automatically redeployed after the edit

## Verification

After deployment, re-upload the same PDF. Expected results:
- Scene count should jump from 4 to the full count (likely 50+ scenes based on a 191-page screenplay)
- Coverage should reach near 100%
- `isComplete` should be `true`
