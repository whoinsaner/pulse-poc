
# Remove Redundant Information from Report Pages

## Problem
Multiple report pages display the same information twice through different components, creating visual clutter and confusing stakeholders.

## Redundancies Found

### 1. CharacterDiagnosis -- DOUBLE verdict + working/broken/underdeveloped (Critical)
- `DiagnosisSummary` renders: Verdict + What's Working + What's Broken + Underdeveloped (from parameter scores)
- `CharacterNarrativePanel` (which wraps `AgentNarrativePanel`) renders: Verdict + What's Working + What's Broken + Underdeveloped (from agent content)
- **Result**: Two verdict boxes and two sets of 3-column grids stacked on the same page

### 2. Sub-pages showing full AgentNarrativePanel for CharacterAgent (4 pages)
The `AgentNarrativePanel` for CharacterAgent shows verdict, working/broken/underdeveloped, key quotes, deep dive, AND recommendations. When sub-pages also render their own page-specific content from the same agent data, it creates duplication:

- **ProtagonistAnalysis**: `CharacterNarrativePanel` already shows protagonist profile, then the page renders its own "Character Fundamentals" card from the same data
- **AntagonistAnalysis**: `AgentNarrativePanel` shows the full CharacterAgent output (verdict, working/broken, etc.), then the page shows its own antagonist profile card from the same `agentContent.antagonistProfile`
- **SupportingCast**: `AgentNarrativePanel` renders supporting cast list, then the page renders its own "AI-Analyzed Supporting Cast" section from `agentContent.supportingCast`
- **CharacterPsychology**: `AgentNarrativePanel` renders CharacterAgent output, then the page renders "Want vs Need" and "Flaw & Arc" sections from the same `agentContent.protagonistProfile`

### 3. StrengthWeaknessList on sub-pages (10 pages)
The `StrengthWeaknessList` component (showing "What Works" / "Needs Improvement") is redundant with `WeightedParameterList` on the same page. Both display the same parameters -- one as scored cards, the other as a split strengths/weaknesses view. Affected pages:
- ConceptHook, ThemeMoral, EmotionalResonance, DialogueSubtext, VisualStorytelling
- Production, Marketability, AudienceStrategy, StructuralEngineering, PlotAnalysis, SceneEconomy

### 4. SceneEconomy -- triple redundancy
- Top metrics cards show top 4 parameter scores
- VerdictBox summarizes the same working/broken counts
- WeightedParameterList shows all parameters with scores
- StrengthWeaknessList shows the same split again
- RecommendationCards repeat rationale text from broken/underdeveloped params

### 5. StrengthWeaknessList uses legacy `glass-premium` class
Lines 28 and 56 of `StrengthWeaknessList.tsx` still use `glass-premium`, contradicting the standardization done earlier.

## Plan

### Fix 1: CharacterDiagnosis -- remove AgentNarrativePanel
Remove the `CharacterNarrativePanel` from CharacterDiagnosis. The `DiagnosisSummary` already provides the verdict and 3-column diagnosis grid. The character cards fallback section should remain as unique content.

### Fix 2: Sub-pages -- strip redundant sections from AgentNarrativePanel usage
For character sub-pages, instead of rendering the full `AgentNarrativePanel` (which dumps everything), render only the page-specific agent content:

- **ProtagonistAnalysis**: Remove `CharacterNarrativePanel`. Keep only the page's own "Character Fundamentals" card (which shows parsed character data). If agent content has deep dive or key quotes relevant to protagonist, extract just those.
- **AntagonistAnalysis**: Remove `AgentNarrativePanel`. Keep the page's own antagonist profile card and power breakdown.
- **SupportingCast**: Remove `AgentNarrativePanel`. Keep the page's own supporting cast table and relationship map. Remove the duplicate "AI-Analyzed Supporting Cast" card since the table below covers it.
- **CharacterPsychology**: Remove `AgentNarrativePanel`. Keep the page's own psychology pillars, want/need, and flaw/arc sections.

### Fix 3: Remove StrengthWeaknessList from all sub-pages
Remove `StrengthWeaknessList` from all 10+ sub-pages listed above. The `WeightedParameterList` already shows every parameter with its score, rationale, and weight tier -- the strengths/weaknesses split adds no new information.

### Fix 4: Clean up SceneEconomy
- Remove VerdictBox (redundant with parameter data)
- Remove StrengthWeaknessList (redundant)
- Remove RecommendationCards (redundant -- rationale is already in WeightedParameterList)
- Keep: SectionHeader, Scene Stats card, WeightedParameterList

### Fix 5: Remove glass-premium from StrengthWeaknessList component
Update lines 28 and 56 of `StrengthWeaknessList.tsx` to remove `glass-premium` class. (This component will still be used by other parts of the app even after removal from report sub-pages.)

## Files to Edit

| File | Change |
|------|--------|
| `CharacterDiagnosis.tsx` | Remove `CharacterNarrativePanel` import and usage |
| `ProtagonistAnalysis.tsx` | Remove `CharacterNarrativePanel`, keep character fundamentals |
| `AntagonistAnalysis.tsx` | Remove `AgentNarrativePanel`, keep antagonist profile + power grid |
| `SupportingCast.tsx` | Remove `AgentNarrativePanel`, remove duplicate AI supporting cast card |
| `CharacterPsychology.tsx` | Remove `AgentNarrativePanel`, keep pillars + want/need + flaw/arc |
| `ConceptHook.tsx` | Remove `StrengthWeaknessList` |
| `ThemeMoral.tsx` | Remove `StrengthWeaknessList` |
| `EmotionalResonance.tsx` | Remove `StrengthWeaknessList` |
| `DialogueSubtext.tsx` | Remove `StrengthWeaknessList` |
| `VisualStorytelling.tsx` | Remove `StrengthWeaknessList` |
| `Production.tsx` | Remove `StrengthWeaknessList` |
| `Marketability.tsx` | Remove `StrengthWeaknessList` |
| `AudienceStrategy.tsx` | Remove `StrengthWeaknessList` |
| `StructuralEngineering.tsx` | Remove `StrengthWeaknessList` |
| `PlotAnalysis.tsx` | Remove `StrengthWeaknessList` |
| `SceneEconomy.tsx` | Remove VerdictBox, StrengthWeaknessList, RecommendationCards |
| `StrengthWeaknessList.tsx` | Remove `glass-premium` from 2 locations |

Total: 17 files edited. No new components needed. No database changes.
