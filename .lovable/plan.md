

# Plan: Update All Agent Model Mappings to Gemini 3.1 Pro Preview

## Summary

Update the system "Quality" model configuration so every non-system agent uses `google/gemini-3.1-pro-preview`, while system agents keep their current lightweight model (`google/gemini-2.5-flash`). Also update the edge function's MODEL_REGISTRY, fallback presets, and AVAILABLE_MODELS list.

## Changes

### 1. Database Migration — Update agent_model_mappings

Write a migration that:
- Upserts all agent_model_mappings for the system Quality config (`00000000-0000-0000-0000-000000000003`) setting model to `google/gemini-3.1-pro-preview` for every non-system agent
- System agents (`IntakeNormalizerAgent`, `ScriptTypeClassifierAgent`, `ClassifierArbitrationAgent`, `MultiTypeBlendingAgent`, `CinemaTraditionAgent`) keep `google/gemini-2.5-flash`
- Ensure `quality` config `is_default = true` on `model_configurations` table

Non-system agents to update (all get `google/gemini-3.1-pro-preview`):
- Core: ConceptAgent, StructureAgent, CharacterAgent, ConflictAgent, ThemeAgent, DialogueAgent, WorldLogicAgent, EmotionalArcAgent, MarketAgent, ExecutionAgent
- Comic: PanelFlowAgent, LetteringBalloonAgent, PageTurnImpactAgent, ArtScriptSynergyAgent
- Interactive: InteractivityAgent, WorldBuildingAgent
- Audio: AudioNarrativeAgent
- Web Series: WebSeriesAgent
- Micro Drama: MicroDramaAgent
- Enrichment: SceneEnrichmentAgent
- Production: BreakdownExtractorAgent
- Meta: ScriptEvolutionAgent, CreatorFeedbackLoopAgent, ExplainabilityTraceAgent, InvestorReadinessAgent, SeriesBibleAgent, InsightSynthesisAgent

### 2. Edge Function — `analyze-script/index.ts`

- Add `google/gemini-3.1-pro-preview` to the `MODEL_REGISTRY`
- Update `QUALITY_MODE_PRESETS.quality` so `default`, `complex`, and `synthesis` tiers all use `google/gemini-3.1-pro-preview` (system tier stays `google/gemini-2.5-flash`)
- Keep reasoning `{ effort: 'medium' }` on complex agents

### 3. Frontend — `ModelConfiguration.tsx`

- No structural changes needed; `google/gemini-3.1-pro-preview` is already in `AVAILABLE_MODELS`

### 4. Classify Script Type — `classify-script-type/index.ts`

- No change needed; this is a system/utility function already using flash-lite

## Technical Details

The migration will use `INSERT ... ON CONFLICT` to upsert mappings. The Quality config UUID is `00000000-0000-0000-0000-000000000003`. Each mapping row needs `config_id`, `agent_name`, `model`, `temperature` (0.3 for most, 0.1 for system), `max_retries` (3), `retry_delay_ms` (2000-3000).

