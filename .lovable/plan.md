
# Series Bible Extract View Implementation Plan

## Overview

This plan adds a dedicated **Series Bible Extract** view to the Pulse report pages. This view aggregates key information that would typically appear in a series bible: world rules, character long-arc trajectories, tonal guardrails, and core premise articulation. The view draws from existing parameter scores and provides a quick reference for creators, executives, and platform stakeholders.

## Key Features

The Series Bible Extract will aggregate and display:

1. **Core Premise & World Rules**
   - Extracted from `world_rule_consistency`, `setting_agency`, `spatial_system_logic`, `plausibility` parameters
   - Shows what can and cannot change in the story world

2. **Character Long-Arc Trajectories**
   - Derived from protagonist/antagonist data and `transformation_credibility`, `want_vs_need`, `psychological_flaw_depth` parameters
   - Maps character starting points to intended destinations

3. **Tonal Guardrails**
   - From `tone_genre_cohesion`, `symbol_motif_consistency`, `thematic_spine_clarity` parameters
   - Defines genre expectations and tonal boundaries

4. **Series Sustainability Metrics** (for episodic formats)
   - From `serial_momentum`, `episode_self_containment`, `franchise_expandability` parameters
   - Episode engine repeatability and season arc clarity

## Technical Implementation

### 1. Create New Report Page Component
**File:** `src/pages/report/SeriesBibleExtract.tsx`

This new page will:
- Import and use the existing report UI components (`SectionHeader`, `VerdictBox`, `ScoreBar`, etc.)
- Access report data via `useOutletContext` like other report pages
- Filter relevant parameters from categories: World & Logic, Theme, Character, and Web Series
- Display structured sections with visual hierarchy

### 2. Update Navigation Configuration
**File:** `src/lib/reportNavigation.ts`

Add a new navigation item to the "Reference" group:
```typescript
{ 
  id: 'bible', 
  label: 'Series Bible', 
  icon: BookOpen, 
  path: '/bible',
  requiredCategories: ['World & Logic', 'Character', 'Theme']
}
```

The page will be visible for all script types but will have enhanced content for series formats (web_series, pilot, episode).

### 3. Add Route Definition
**File:** `src/App.tsx`

Add the new route under each report layout:
- `/report/:runId/bible`
- `/sample-report/bible`
- `/sample-comic-report/bible`
- `/sample-web-series-report/bible`

### 4. Component Structure

The page will be organized into these visual sections:

```text
+------------------------------------------+
|  SECTION HEADER                          |
|  Series Bible Extract | World Icon | Score|
+------------------------------------------+

+------------------------------------------+
|  CORE PREMISE BOX                        |
|  Logline + Hook Clarity Score            |
|  One-line pitch + genre positioning      |
+------------------------------------------+

+------------------------------------------+
|  WORLD RULES & CONSTRAINTS               |
|  Grid: What's Fixed | What Can Change    |
|  Parameters: world_rule_consistency,     |
|  setting_agency, spatial_system_logic    |
+------------------------------------------+

+------------------------------------------+
|  TONAL GUARDRAILS                        |
|  Genre expectations, tonal boundaries    |
|  Parameters: tone_genre_cohesion,        |
|  symbol_motif_consistency                |
+------------------------------------------+

+------------------------------------------+
|  CHARACTER TRAJECTORIES                  |
|  Protagonist: Start → End                |
|  Antagonist: Philosophy + Threat         |
|  Parameters: want_vs_need, transformation|
+------------------------------------------+

+------------------------------------------+
|  SERIES ENGINE (episodic only)           |
|  Reset vs Accumulate Logic               |
|  Episode repeatability score             |
|  Season arc sustainability               |
+------------------------------------------+

+------------------------------------------+
|  QUICK REFERENCE EXPORT                  |
|  "Copy to Clipboard" for bible summary   |
+------------------------------------------+
```

### 5. Data Extraction Logic

The component will extract data from existing sources:

| Bible Section | Source Parameters |
|--------------|-------------------|
| Core Premise | `concept_originality`, `hook_clarity`, `concept_compressibility`, `familiarity_anchor` |
| World Rules | `world_rule_consistency`, `setting_agency`, `spatial_system_logic`, `plausibility` |
| Tonal Guardrails | `tone_genre_cohesion`, `symbol_motif_consistency`, `thematic_spine_clarity`, `moral_complexity` |
| Character Arcs | `want_vs_need`, `psychological_flaw_depth`, `transformation_credibility`, `agency_level` |
| Series Engine | `serial_momentum`, `episode_self_containment`, `franchise_expandability`, `retention_curve_design` |

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/report/SeriesBibleExtract.tsx` | **Create** | New page component (~300 lines) |
| `src/lib/reportNavigation.ts` | **Modify** | Add bible nav item to Reference group |
| `src/App.tsx` | **Modify** | Add route for `/bible` path in all report layouts |

## UI/UX Considerations

1. **Visual Consistency**: Uses existing glass-premium cards, SectionHeader, SubSectionHeader, and ScoreBar components
2. **Conditional Content**: Shows "Series Engine" section only for episodic formats (web_series, pilot, episode)
3. **Quick Export**: Includes a "Copy Summary" button that copies a plain-text version of the bible extract
4. **Parameter Links**: Each section shows relevant parameter scores with ability to see rationale

## Technical Details

### Parameter Filtering Approach

```typescript
// World-related parameters
const worldParams = reportData.parameterScores?.filter(p => 
  p.parameterName?.includes('world') || 
  p.parameterName?.includes('setting') ||
  p.parameterName?.includes('plausibility') ||
  p.category === 'World & Logic'
) || [];

// Tone-related parameters
const toneParams = reportData.parameterScores?.filter(p => 
  p.parameterName?.includes('tone') || 
  p.parameterName?.includes('genre') ||
  p.parameterName?.includes('thematic') ||
  p.parameterName?.includes('symbol')
) || [];

// Character arc parameters
const arcParams = reportData.parameterScores?.filter(p => 
  p.parameterName?.includes('want_vs_need') || 
  p.parameterName?.includes('transformation') ||
  p.parameterName?.includes('psychological') ||
  p.parameterName?.includes('agency')
) || [];

// Series sustainability (episodic only)
const seriesParams = reportData.parameterScores?.filter(p => 
  p.parameterName?.includes('serial') || 
  p.parameterName?.includes('episode') ||
  p.parameterName?.includes('franchise') ||
  p.parameterName?.includes('retention') ||
  p.category === 'Web Series'
) || [];
```

### Episodic Format Detection

```typescript
const isEpisodicFormat = ['web_series', 'pilot', 'episode'].includes(
  reportData.scriptMetadata?.scriptType || ''
);
```

## Integration Points

- **Report Context**: Uses `useOutletContext<ReportContextValue>()` for data access
- **Stakeholder Filtering**: Supports `useStakeholderFiltering` hook for lens-based filtering
- **Existing Components**: Reuses `VerdictBox`, `ScoreDisplay`, `ScoreBar`, `SubSectionHeader`, `Card`

## Sample Content Preview

For a web series like "The Algorithm":

**Core Premise:**
> "A content creator discovers the platform algorithm is predicting real-world deaths, and she might be next."
> Hook Clarity: 92/100 | Familiarity Anchor: 88/100

**World Rules:**
- Fixed: Algorithm predictions are accurate; 72-hour countdown is immutable
- Flexible: Character relationships, investigation methods, revelation timing

**Tonal Guardrails:**
- Genre: Sci-Fi Thriller with social commentary
- Tone: Suspenseful, paranoid, digitally anxious
- Avoid: Camp, overt comedy, slow exposition

**Character Trajectories:**
- Maya Chen: Influencer → Investigator → Whistleblower
- @PredictorX: Anonymous threat → Revealed connection → Moral complexity

**Series Engine:**
- Episode Reset: New countdown/victim per episode
- Accumulate: Maya's investigation, relationship with Devon
- Season Arc: Uncover algorithm origin and purpose
