

# Pulse Report Redesign: Matching the Reference POC for Feature Films

## Context

The reference POC at `whoinsane.github.io/pulse-poc` defines a **granular, section-per-page** report layout with 18 dedicated sections across 5 groups. The current Pulse v3 codebase has **two parallel report systems**:

1. **Live reports** (`/report/:runId/`) -- use the old granular pages (concept, plot, protagonist, etc.) but with generic, template-driven content
2. **Sample reports** (`/sample-report/`) -- use the USAF consolidated layout (story, characters, craft, commercial, development)

The goal is to make **live reports for feature films** produce output quality and depth comparable to the reference POC. This requires changes in two areas:
- **Agent prompts** (what the AI produces)
- **Report UI pages** (how results are displayed)

---

## Part 1: Agent Prompt Enhancements

The current agents produce parameter scores + generic insights. The reference POC sections expect **structured narrative content** -- not just numbers. Each agent needs to output **section-specific narrative blocks** alongside scores.

### 1.1 Expand Agent Output Contract

Add a `sectionContent` field to each agent's JSON output, containing pre-written narrative blocks that the UI can render directly. This eliminates the need for the UI to generate generic text from scores alone.

**New output structure per agent:**
```
{
  "scores": [...],       // existing
  "insights": [...],     // existing
  "sectionContent": {    // NEW
    "verdict": "One-sentence diagnostic verdict",
    "whatWorks": ["Strength 1 with evidence", ...],
    "whatsBroken": ["Issue 1 with evidence", ...],
    "whatsUnderdeveloped": ["Gap 1 with evidence", ...],
    "keyQuotes": [{"quote": "...", "context": "...", "page": 42}],
    "deepDive": "2-3 paragraph narrative analysis",
    "recommendations": [
      {"title": "...", "description": "...", "priority": "critical|high|medium", "effort": "easy|moderate|hard"}
    ]
  }
}
```

### 1.2 Per-Agent Prompt Updates

Each core analysis agent prompt needs enhancement to produce richer, section-specific output:

| Agent | Current Focus | Enhancement |
|-------|--------------|-------------|
| **ConceptAgent** | 6 parameters scored | Add: logline analysis, comparable titles, genre positioning verdict, commercial viability assessment |
| **StructureAgent** | 7 parameters scored | Add: act breakdown narrative, pacing diagnosis, structural pattern identification (3-act, 5-act, non-linear), turning point analysis |
| **CharacterAgent** | 7 parameters scored | Add: per-character profiles with want/need/flaw/arc, protagonist deep-dive, antagonist analysis, supporting cast assessment, psychology insights |
| **ConflictAgent** | 6 parameters scored | Add: stakes escalation timeline, conflict type mapping, tension curve analysis |
| **DialogueAgent** | 6 parameters scored | Add: voice distinctiveness examples, subtext analysis with quotes, exposition load verdict |
| **ThemeAgent** | 6 parameters scored | Add: thematic spine identification, motif tracking, moral complexity assessment |
| **WorldLogicAgent** | 6 parameters scored | Add: visual storytelling opportunities, setting analysis, atmosphere verdict |
| **EmotionalArcAgent** | 6 parameters scored | Add: emotional beat map, catharsis moments, tonal consistency verdict |
| **MarketAgent** | 6 parameters scored | Add: comparable titles analysis, target audience definition, platform fit assessment |
| **ExecutionAgent** | 6 parameters scored | Add: budget tier estimation, production complexity breakdown, talent requirements |

### 1.3 New Synthesis Agents

Add two new post-processing agents:

**RewritePrioritiesAgent**: Runs after all scoring. Synthesizes all low-scoring parameters into tiered rewrite recommendations (Tier A: Critical, Tier B: High-Impact, Tier C: Polish). Produces scene-level economy analysis.

**SceneScorecardAgent**: Produces the complete scorecard with final verdict, green/yellow/red classification per category, and executive-level summary.

---

## Part 2: Report Data Model Changes

### 2.1 Extend `full_report_data` Structure

The `reportData` stored in the `reports` table needs new fields:

```
reportData.agentContent: {
  ConceptAgent: { verdict, whatWorks, whatsBroken, ... },
  StructureAgent: { verdict, whatWorks, whatsBroken, ... },
  CharacterAgent: {
    protagonistProfile: { name, want, need, flaw, arc, ... },
    antagonistProfile: { ... },
    supportingCast: [{ ... }],
    psychologyInsights: { ... },
    ...
  },
  ...
}
```

### 2.2 Store sectionContent from Agent Responses

In `generateReport()`, collect the `sectionContent` from each agent result and store it in `reportData.agentContent`.

---

## Part 3: Live Report Route Upgrade

### 3.1 Add USAF Consolidated Routes to Live Reports

Currently live reports (`/report/:runId/`) only have old granular routes. Add the new USAF routes **alongside** the old ones:

```
/report/:runId/            -- ReportCover (new)
/report/:runId/story       -- StoryDiagnosis (new)
/report/:runId/characters  -- CharacterDiagnosis (new)
/report/:runId/craft       -- CraftDiagnosis (new)
/report/:runId/commercial  -- CommercialDiagnosis (new)
/report/:runId/development -- DevelopmentPriorities (new)
```

Keep legacy routes for backward compatibility but redirect to consolidated pages.

### 3.2 Update ReportLayout Navigation

The `CommandHeader` component for live reports should use `USAF_NAV_GROUPS` navigation instead of the legacy `ALL_NAV_GROUPS` structure.

---

## Part 4: Report Page UI Enhancements

### 4.1 Enrich Diagnosis Pages with Agent Narrative Content

Update `StoryDiagnosis`, `CharacterDiagnosis`, `CraftDiagnosis`, and `CommercialDiagnosis` to display `agentContent` narrative blocks when available:

- **Verdict box** at the top of each section (from `sectionContent.verdict`)
- **What's Working / What's Broken / What's Underdeveloped** panels using actual agent-written content instead of score-derived buckets
- **Key Quotes** callouts with page references
- **Deep Dive** narrative section for rich analytical text
- **Recommendations** with priority/effort badges

### 4.2 Character Diagnosis Enhancements

The reference POC has 4 separate character pages (Protagonist, Antagonist, Supporting Cast, Psychology). Map these into the consolidated `CharacterDiagnosis` page as expandable sections:

- Protagonist deep-dive panel with want/need/flaw/arc
- Antagonist analysis panel
- Supporting cast grid
- Psychology insights panel
- Character relationship network (already exists)

### 4.3 Development Priorities Enhancements

Match the reference POC's Rewrite Priorities and Scene Economy sections:

- Tiered rewrite recommendations (already partially implemented)
- Scene-by-scene economy analysis (scene necessity scores)
- Before/after improvement projections

---

## Part 5: Implementation Sequence

### Phase 1: Agent Output Contract (Edge Function)
1. Update the `runAgent()` user prompt to request `sectionContent` in the JSON output
2. Update `generateReport()` to collect and store `agentContent` in report data
3. Deploy updated `analyze-script` edge function

### Phase 2: Live Report Routes
4. Add USAF consolidated routes to the live report router in `App.tsx`
5. Add legacy route redirects for live reports
6. Update `CommandHeader` to use USAF navigation for live reports

### Phase 3: UI Enrichment
7. Update `StoryDiagnosis` to render `agentContent` narrative blocks
8. Update `CharacterDiagnosis` with protagonist/antagonist/cast/psychology panels
9. Update `CraftDiagnosis` with dialogue/theme/visual/emotional deep-dives
10. Update `CommercialDiagnosis` with market/production/audience panels
11. Update `DevelopmentPriorities` with enhanced rewrite/scene economy

### Phase 4: Testing
12. Re-run analysis on the Monster D script to verify richer output
13. Verify all report sections render correctly with new data

---

## Technical Notes

- **No database migration needed**: `full_report_data` is a JSONB column that already accepts arbitrary structure. The new `agentContent` field is just additional JSON.
- **Backward compatible**: Existing reports without `agentContent` will continue to work -- UI components fall back to score-derived content when narrative content is absent.
- **Token budget**: Adding `sectionContent` to each agent increases token usage by roughly 30-50%. The existing retry and model configuration system handles this.
- **The reference POC has 18 sections across 5 groups**: Overview (1), Story (3: concept-hook, plot-analysis, structural-engineering), Characters (4: protagonist, antagonist, supporting-cast, character-psychology), Craft (4: dialogue-subtext, theme-moral, visual-storytelling, emotional-resonance), Production and Market (3: marketability, production, audience-strategy), Recommendations (3: rewrite-priorities, scene-economy, scorecard), plus Script (1). These map into the 6 USAF consolidated pages (Cover, Story, Characters, Craft, Commercial, Development) with sub-sections.

