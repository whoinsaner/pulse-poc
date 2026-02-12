
# Standardize Report Page Layouts

## Problem

Report pages currently use two different layout patterns with inconsistent wrapper classes, parameter components, and visual styling. This creates a fragmented user experience.

## Key Inconsistencies Found

### 1. Root Container
- **Diagnosis pages** (`StoryDiagnosis`, `CharacterDiagnosis`, `CraftDiagnosis`, `CommercialDiagnosis`, `DevelopmentPriorities`): Use `<div className="space-y-8">` (no max-width)
- **Sub-pages** (`ConceptHook`, `ThemeMoral`, `EmotionalResonance`, `DialogueSubtext`, `VisualStorytelling`, `Production`, `Marketability`, `AudienceStrategy`, `StructuralEngineering`, `PlotAnalysis`, `CharacterPsychology`, `ProtagonistAnalysis`, `SupportingCast`, `AntagonistAnalysis`, `HooksAnalysis`, `RetentionAnalysis`, `SceneEconomy`): Use `<div className="space-y-8 max-w-6xl mx-auto">`

**Standard**: Remove `max-w-6xl mx-auto` from all sub-pages -- the report layout container already handles width constraints. All pages should use `<div className="space-y-8">`.

### 2. Parameter Display Component
- **Diagnosis pages**: Use `WeightedParameterList` (collapsible, with weight tiers, show/hide toggle)
- **Sub-pages**: Use `ParameterBreakdown` (Card wrapper with `SubSectionHeader`, non-collapsible)

**Standard**: Sub-pages should use `WeightedParameterList` with `initiallyExpanded={true}` to match the bordered card style from the `WeightedParameterBar` update. This keeps the collapsible behavior and weight tier display consistent.

### 3. `glass-premium` Class
Several pages use `glass-premium` on Cards (e.g., `VisualStorytelling`, `Production`, `PlotAnalysis`, `ProtagonistAnalysis`, `SupportingCast`, `SceneEconomy`). This is inconsistent -- other pages just use plain `Card`.

**Standard**: Remove `glass-premium` from all report page Cards for consistency.

### 4. Custom Parameter Rendering in `SceneEconomy`
`SceneEconomy.tsx` renders its own inline parameter bars (lines 171-198) with a completely different style (inline div-based progress bar) instead of using `WeightedParameterBar`.

**Standard**: Replace with `WeightedParameterList`.

### 5. Old `CategoryCard` in `StoryDiagnosis`
`StoryDiagnosis.tsx` has a local `CategoryCard` component (lines 137-181) that renders parameters with the old inline progress bar style instead of the new `WeightedParameterBar` card style.

**Standard**: Remove `CategoryCard` and rely on the existing `WeightedParameterList` which already renders all story parameters.

## Pages Requiring Changes

### Batch 1: Remove `max-w-6xl mx-auto` (17 pages)
All sub-pages listed above -- change root div from `space-y-8 max-w-6xl mx-auto` to `space-y-8`.

### Batch 2: Replace `ParameterBreakdown` with `WeightedParameterList` (12 pages)
- `ConceptHook.tsx`
- `ThemeMoral.tsx`
- `EmotionalResonance.tsx`
- `DialogueSubtext.tsx`
- `VisualStorytelling.tsx`
- `Production.tsx`
- `Marketability.tsx`
- `AudienceStrategy.tsx`
- `StructuralEngineering.tsx`
- `PlotAnalysis.tsx`
- `CharacterPsychology.tsx`
- `AntagonistAnalysis.tsx`
- `HooksAnalysis.tsx`
- `RetentionAnalysis.tsx`

Each will:
- Import `WeightedParameterList` instead of `ParameterBreakdown`
- Convert parameter arrays to include `weight: 1.0` if missing
- Use `initiallyExpanded={true}` and `defaultVisibleCount={8}`

### Batch 3: Remove `glass-premium` class (6 pages)
- `VisualStorytelling.tsx`
- `Production.tsx`
- `PlotAnalysis.tsx`
- `ProtagonistAnalysis.tsx`
- `SupportingCast.tsx`
- `SceneEconomy.tsx`
- `DialogueSubtext.tsx`
- `ThemeMoral.tsx`

### Batch 4: Fix custom rendering
- **StoryDiagnosis.tsx**: Remove local `CategoryCard` component and its usage in the fallback section
- **SceneEconomy.tsx**: Replace custom inline parameter rendering (lines 171-198) with `WeightedParameterList`

## Technical Details

The standard page layout pattern after this refactor:

```text
<div className="space-y-8">
  <SectionHeader ... />
  {stakeholderFilter && <StakeholderFilterNotice ... />}
  {agentContent && <AgentNarrativePanel ... />}
  {/* Page-specific content (profile cards, metrics, etc.) */}
  <WeightedParameterList
    parameters={params}
    title="[Section] Parameters"
    initiallyExpanded={true}
    defaultVisibleCount={8}
  />
  {/* Optional: StrengthWeaknessList */}
</div>
```

No database changes required. No new components needed.
