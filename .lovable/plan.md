

# Plan: Make Global Instructions Configurable and Visible

## Current State
The `GLOBAL_INSTRUCTIONS` prompt is a ~60-line hardcoded string constant in `supabase/functions/analyze-script/index.ts`. It is injected into every agent's system prompt. It is **not** stored in the database, **not** editable through the UI, and **not** visible on any settings page.

## Changes

### 1. Database — Store Global Instructions
Create a migration to add a row in `agent_configurations` for the global instructions, using the existing table structure:
- `agent_name`: `"GlobalInstructions"`
- `category`: `"system"`
- `display_name`: `"Global Agent Operating Rules"`
- `system_prompt`: the current hardcoded text
- `is_system`: `true`
- `is_active`: `true`
- `parameters`: `'{}'` (no parameters — it's a meta-prompt)

This reuses the existing `agent_configurations` table and its versioning/audit infrastructure rather than creating a new table.

### 2. Edge Function — Read Global Instructions from DB
In `analyze-script/index.ts`:
- At startup, query `agent_configurations` for `agent_name = 'GlobalInstructions'` (prefer org-specific override, fall back to system default)
- Use the fetched `system_prompt` as the `GLOBAL_INSTRUCTIONS` value instead of the hardcoded constant
- Keep the hardcoded version as a fallback if the DB query fails

### 3. Settings UI — Surface on Agent Prompts Page
In the Agent Configuration page (`src/pages/AgentConfiguration.tsx`):
- The `GlobalInstructions` entry will appear naturally in the agent list under the "system" category since it uses the same `agent_configurations` table
- Admins can view and edit the prompt text, with changes versioned in `agent_prompt_versions` just like any other agent prompt
- Add a visual indicator (badge or banner) to distinguish it as the "master prompt" that is injected into all agents

### 4. Settings UI — Surface on Parameters Schema Page
In `src/pages/settings/ParametersSchema.tsx`:
- Add a read-only "Global Rules" tab or card that displays the current global instructions text
- This gives non-admin users visibility into the evaluation rules without needing access to the Agent Prompts page

## Technical Details
- No new tables needed — reuses `agent_configurations` + `agent_prompt_versions`
- RLS policies already cover system-level configs (authenticated users can view, admins can edit)
- The edge function already queries `agent_configurations` for per-agent prompts; extending it to fetch GlobalInstructions follows the same pattern
- Version history and audit trail come for free through the existing prompt versioning system

