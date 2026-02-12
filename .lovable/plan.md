

# Deep Scan: Hardcoded vs. Real Data in Report Pages

## Summary

After scanning all 40+ report pages, I found **13 pages with significant hardcoded/template content** that should be wired to the AI pipeline output (`agentContent` from `full_report_data`). There are also **8 "clean" sub-pages** that already properly use `AgentNarrativePanel` + real parameter data, and several diagnosis/overview pages that correctly use real parameter scores.

---

## Pages Already Properly Wired (No Changes Needed)

These pages correctly use `AgentNarrativePanel` with real `agentContent` data and `WeightedParameterList` with real parameters:

- `StoryConceptHook.tsx` -- uses `ConceptAgent`
- `StoryStructure.tsx` -- uses `StructureAgent`
- `StoryConflictStakes.tsx` -- uses `ConflictAgent`
- `CraftDialogue.tsx` -- uses `DialogueAgent`
- `CraftTheme.tsx` -- uses `ThemeAgent`
- `CraftEmotional.tsx` -- uses `EmotionalArcAgent`
- `CraftVisual.tsx` -- uses `WorldLogicAgent`
- `CommercialMarket.tsx` -- uses `MarketAgent`
- `CommercialProduction.tsx` -- uses `ExecutionAgent`
- `ComicPageTurns.tsx` -- uses `PageTurnImpactAgent`
- `ComicPanelFlow.tsx` -- uses `PanelFlowAgent`
- `ReportCover.tsx` -- uses real parameter scores for diagnostics
- `StoryDiagnosis.tsx`, `CharacterDiagnosis.tsx`, `CraftDiagnosis.tsx`, `CommercialDiagnosis.tsx` -- use real parameters for diagnosis summaries
- `DevelopmentPriorities.tsx` -- uses real parameter scores for priority buckets
- `SceneEconomy.tsx` -- uses real parameter scores throughout

---

## Pages With Hardcoded Content (Need Refactoring)

### 1. `CharacterPsychology.tsx` -- HEAVILY HARDCODED
**Hardcoded sections:**
- "Psychological Pillars" grid: 6 scores generated with `Math.random()` (lines 48-55)
- "Want vs. Need Dynamic" section: entirely template text
- "Flaw & Fear Architecture" section: entirely template text
- VerdictBox: static text based on score thresholds
- Recommendations: all static template cards

**Fix:** Wire to `CharacterAgent.psychologyInsights` and `protagonistProfile` (want, need, flaw, arc). Replace random scores with actual parameter scores. Use `AgentNarrativePanel` for narrative content.

---

### 2. `ProtagonistAnalysis.tsx` -- PARTIALLY HARDCODED
**Hardcoded sections:**
- "Character Arc Breakdown" (Act I/II/III): completely static template (lines 207-227)
- VerdictBox: static template text based on score threshold
- Sub-score cards (Empathy, Uniqueness, Arc Quality, Agency): derived via keyword matching, fallback to category score when no match
- Fallback recommendations when no `agentRecs` (lines 258-285)

**Fix:** Wire to `CharacterAgent.protagonistProfile` (want, need, flaw, arc). Replace Act I/II/III template with `AgentNarrativePanel`. Already partially uses `agentRecs` but fallback is generic.

---

### 3. `ConceptHook.tsx` -- PARTIALLY HARDCODED
**Hardcoded sections:**
- "Concept Assessment" grid: 4 assessment items with static labels and template logic (lines 53-74)
- "Why This Works" bullets under logline: completely static text (lines 136-149)
- Recommendations: all static template cards (lines 183-209)

**Fix:** Wire to `ConceptAgent` narrative content. Replace static assessments and recommendations with `AgentNarrativePanel` + agent recommendations.

---

### 4. `ThemeMoral.tsx` -- HEAVILY HARDCODED
**Hardcoded sections:**
- 4 "Theme Metrics" cards: scores derived as `categoryScore +/- 0.x` (lines 43-48)
- VerdictBox: static template text
- "Moral Complexity Analysis" section: entirely template (lines 121-159)
- Fallback Strengths/Weaknesses: hardcoded strings when no params match (lines 168-179)
- Recommendations: all 4 are static template cards (lines 182-211)

**Fix:** Wire to `ThemeAgent` content. Use `AgentNarrativePanel` for narrative. Replace derived metrics with real parameter scores.

---

### 5. `EmotionalResonance.tsx` -- HEAVILY HARDCODED
**Hardcoded sections:**
- 4 "Emotional Metrics" cards: scores derived as `categoryScore +/- 0.x` (lines 44-49)
- VerdictBox: static template text
- Fallback Strengths/Weaknesses: hardcoded strings (lines 128-139)
- Recommendations: all 4 are static template cards (lines 142-172)

**Fix:** Wire to `EmotionalArcAgent` content. Use `AgentNarrativePanel`. Replace derived metrics with real parameter scores.

---

### 6. `DialogueSubtext.tsx` -- PARTIALLY HARDCODED
**Hardcoded sections:**
- 4 "Dialogue Metrics" cards: scores derived as `categoryScore +/- 0.x` (lines 54-59)
- VerdictBox: static template text
- Fallback Strengths/Weaknesses: hardcoded strings (lines 159-171)
- Recommendations: all 4 are static template cards (lines 174-206)

**Fix:** Wire to `DialogueAgent` content. Use `AgentNarrativePanel`. Replace derived metrics with real parameter scores.

---

### 7. `VisualStorytelling.tsx` -- PARTIALLY HARDCODED
**Hardcoded sections:**
- 4 "Visual Metrics" cards: scores derived as `categoryScore +/- 0.x` (lines 48-53)
- VerdictBox: static template text
- "Director's Opportunities": 3 entirely hardcoded items (lines 140-161)
- Fallback Strengths/Weaknesses: hardcoded strings (lines 170-182)
- Recommendations: all 4 are static template cards (lines 185-215)

**Fix:** Wire to `WorldLogicAgent` content. Use `AgentNarrativePanel`. Replace Director's Opportunities with agent recommendations.

---

### 8. `StructuralEngineering.tsx` -- HEAVILY HARDCODED
**Hardcoded sections:**
- Act Quality cards: scores generated with `Math.random()` (lines 49-53)
- "Structural Identity" section: template text with heuristic beat placement (lines 137-192)
- "Key Beat Placement": 5 items with scores derived from random act scores
- VerdictBox: static template text
- Recommendations: static template cards with random-based conditions

**Fix:** Wire to `StructureAgent` content. Use `AgentNarrativePanel`. Replace random act scores with real parameter scores.

---

### 9. `PlotAnalysis.tsx` -- PARTIALLY HARDCODED
**Hardcoded sections:**
- "Plot Fundamentals Grid": 2 sub-scores using `Math.random()` (lines 86-87)
- VerdictBox: static template text
- "Act Structure Analysis": scene counts derived from simple 25/50/25 split (lines 54-61)
- Recommendations: static template cards

**Fix:** Wire to `ConflictAgent` or `StructureAgent` content. Use `AgentNarrativePanel`. Replace random sub-scores.

---

### 10. `Marketability.tsx` -- PARTIALLY HARDCODED
**Hardcoded sections:**
- 4 "Market Metrics" cards: scores derived as `categoryScore +/- 0.x` (lines 52-57)
- "Platform Fit Analysis" table: entirely hardcoded data (lines 70-75)
- VerdictBox: static template text
- Fallback Strengths/Weaknesses: hardcoded strings (lines 169-180)
- Recommendations: all 4 are static template cards

**Fix:** Wire to `MarketAgent` content (includes `comparableTitles`, `platformFit`, `targetAudience`). Use `AgentNarrativePanel`.

---

### 11. `Production.tsx` -- PARTIALLY HARDCODED
**Hardcoded sections:**
- 4 "Production Metrics" cards: scores derived as `categoryScore +/- 0.x` (lines 54-59)
- Budget Estimate: entirely heuristic (location/character count only, lines 62-74)
- VerdictBox: static template text
- Fallback Strengths/Weaknesses: hardcoded strings (lines 200-212)
- Recommendations: static template cards

**Fix:** Wire to `ExecutionAgent` content (includes `budgetTier`, `productionComplexity`, `talentRequirements`). Use `AgentNarrativePanel`.

---

### 12. `HooksAnalysis.tsx` -- ENTIRELY HARDCODED
**Hardcoded sections:**
- `hookElements` array: 4 completely mock items (lines 22-47)
- `shareableMoments` array: 3 completely mock items with fake timestamps/descriptions (lines 49-68)
- "Hook Optimization Tips": 4 entirely static tips (lines 218-265)
- Scores fall back to static values (7.5, 6.8) when no parameter found

**Fix:** Wire to appropriate agent content. Replace all mock data with real analysis output. This page needs the most work.

---

### 13. `RetentionAnalysis.tsx` -- ENTIRELY HARDCODED
**Hardcoded sections:**
- `retentionCheckpoints` array: 8 completely mock data points (lines 17-26)
- "Effective Strategies" list: 3 entirely static items (lines 99-121)
- "Risk Areas" list: 3 entirely static items (lines 124-154)
- "Attention Reset Points": 4 entirely static items (lines 167-194)
- Score falls back to static 7.2

**Fix:** Wire to appropriate agent content or scene-level analysis data. This page needs the most work.

---

### 14. `AudienceStrategy.tsx` -- HEAVILY HARDCODED
**Hardcoded sections:**
- 4 "Audience Metrics" cards: scores derived as `categoryScore +/- 0.x` (lines 44-49)
- "Primary Audience Profile": template text based on score thresholds
- "Marketing Hooks" table: 4 entirely hardcoded items (lines 63-68)
- "Release Window Analysis": 4 entirely hardcoded items (lines 72-76)
- VerdictBox: static template text
- Fallback Strengths/Weaknesses: hardcoded strings (lines 192-202)
- Recommendations: all 4 are static template cards

**Fix:** Wire to `MarketAgent` content (includes `targetAudience`, `comparableTitles`, `platformFit`). Use `AgentNarrativePanel`.

---

### 15. `SupportingCast.tsx` -- PARTIALLY HARDCODED
**Hardcoded sections:**
- VerdictBox: static template text based on dialogue balance thresholds (lines 97-113)
- Recommendations: all 3 are static template cards (lines 191-219)
- "Utility Score" calculation: heuristic formula, not AI-analyzed (lines 47-52)

**Fix:** Wire to `CharacterAgent.supportingCast` data. Use `AgentNarrativePanel` for narrative. Replace template recommendations with agent recommendations.

---

## Implementation Approach

For each page, the refactoring follows a consistent pattern:

1. **Add `AgentNarrativePanel`** at the top of the page body, wired to the correct agent name from `reportData.agentContent`
2. **Replace derived/random metric cards** with real parameter scores (filter by relevant keywords from `parameterScores`)
3. **Replace static VerdictBox** with AI-generated `verdict` from `agentContent`
4. **Replace static recommendations** with `agentContent.recommendations`, keeping current template as fallback
5. **Replace hardcoded strengths/weaknesses** with `agentContent.whatWorks` / `agentContent.whatsBroken` / `agentContent.whatsUnderdeveloped`
6. **Remove `Math.random()`** calls entirely -- derive all scores from real parameter data only

### Agent-to-Page Mapping

```text
CharacterAgent   --> ProtagonistAnalysis, AntagonistAnalysis, SupportingCast, CharacterPsychology
ConceptAgent     --> ConceptHook
StructureAgent   --> StructuralEngineering, PlotAnalysis
ConflictAgent    --> PlotAnalysis (conflict params)
ThemeAgent       --> ThemeMoral
DialogueAgent    --> DialogueSubtext
EmotionalArcAgent --> EmotionalResonance
WorldLogicAgent  --> VisualStorytelling
MarketAgent      --> Marketability, AudienceStrategy
ExecutionAgent   --> Production
(TBD/format)     --> HooksAnalysis, RetentionAnalysis
```

### Priority Order

1. **Critical (Math.random):** `CharacterPsychology`, `StructuralEngineering`, `PlotAnalysis` -- these use random values
2. **High (Entirely mock):** `HooksAnalysis`, `RetentionAnalysis` -- 100% fake data
3. **Medium (Template-heavy):** `ThemeMoral`, `EmotionalResonance`, `DialogueSubtext`, `VisualStorytelling`, `AudienceStrategy`
4. **Lower (Partial):** `ConceptHook`, `Marketability`, `Production`, `ProtagonistAnalysis`, `SupportingCast`

### Technical Details

- Each page will import `AgentNarrativePanel` from `@/components/report/AgentNarrativePanel`
- Agent content is accessed via `reportData.agentContent?.AgentName`
- Recommendations come from `agentContent?.recommendations` array
- Profile data from `agentContent?.protagonistProfile`, `antagonistProfile`, `supportingCast`, `comparableTitles`, `targetAudience`, `platformFit`, `budgetTier`, `productionComplexity`
- All fallback template content is preserved for cases where agent data is missing
- No database schema changes needed -- all data already exists in `full_report_data` JSONB

