

# Plan: Reasoning as a Feature Configuration

## Summary
Add a "Reasoning" feature flag to the Features Settings page with two sub-settings: an on/off toggle and a default effort level (low/medium/high). On the analysis start screen, show a reasoning effort selector only when the feature is enabled. Pass the reasoning preference through to the edge function.

## Changes

### 1. Features Settings Page — `src/pages/settings/FeaturesSettings.tsx`
Add a new feature card below the existing auto-classify toggle:
- **Reasoning toggle** (`pulse_reasoning_enabled`): on/off switch stored in localStorage
- **Default effort selector** (`pulse_reasoning_effort`): a radio group or select with options `low`, `medium`, `high` — only visible when reasoning is toggled on
- Both values persist in localStorage for simplicity (no DB migration needed since this is a client-side preference)

### 2. Analysis Start Screen — `src/components/AnalysisTrigger.tsx`
Before the "Analyze Script" button (lines 564-577), conditionally render a reasoning effort picker:
- Read `pulse_reasoning_enabled` from localStorage
- If enabled, show a small inline selector (low/medium/high) defaulting to the value from `pulse_reasoning_effort`
- Store the selected effort in component state (e.g. `reasoningEffort`)
- If disabled, `reasoningEffort` is `null` (no reasoning)
- Pass `reasoningEffort` into the `startAnalysis` call body alongside `qualityMode`

### 3. Edge Function — `supabase/functions/analyze-script/index.ts`
- Accept an optional `reasoningEffort` field from the request body (`'low' | 'medium' | 'high' | null`)
- When `reasoningEffort` is provided, override the preset's reasoning config for complex agents: `{ reasoning: { effort: reasoningEffort } }`
- When `reasoningEffort` is `null` or absent, strip the `reasoning` field entirely from the API call (no reasoning used)
- This replaces the current hardcoded `effort: 'medium'` in the quality preset — reasoning is now user-controlled

### 4. No database changes required
All configuration is stored in localStorage. The edge function receives reasoning preferences per-request.

## Technical Details

**localStorage keys:**
- `pulse_reasoning_enabled` → `'true'` | `'false'` (default: `'false'`)
- `pulse_reasoning_effort` → `'low'` | `'medium'` | `'high'` (default: `'medium'`)

**Edge function request body addition:**
```typescript
reasoningEffort?: 'low' | 'medium' | 'high' | null
```

**Model call logic change:**
```typescript
// Before: hardcoded from preset
...(modelConfig.reasoning ? { reasoning: modelConfig.reasoning } : {}),

// After: use request-level override
...(reasoningConfig ? { reasoning: reasoningConfig } : {}),
```

Where `reasoningConfig` is derived from the request's `reasoningEffort` field when present, falling back to the preset's value otherwise.

