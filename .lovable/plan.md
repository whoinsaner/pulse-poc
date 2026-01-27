

# Report Redesign: USAF Philosophy Implementation

## Executive Overview

This plan redesigns the Web Series report to embody five core USAF framework philosophies: **Universal Evaluation**, **Diagnosis Over Judgment**, **Weighted Reality**, **Maturity vs Quality**, and **Actionability**. The redesign will serve as a template for all report types.

---

## Philosophy Alignment

### Current State Issues

1. **Judgment-Heavy Language**: Labels like "Production-Ready" and readiness percentages imply binary good/bad
2. **Scattered Information**: Data spread across 20+ pages causes redundancy and cognitive overload
3. **Score Overload**: Raw numbers dominate without explaining "what this means for you"
4. **Weak Maturity Distinction**: No clear visual separation between "weak script" vs "strong but unfinished"
5. **Buried Actionability**: Recommendations buried deep in individual sections

### Target State

| Philosophy | Implementation |
|------------|----------------|
| **Universal** | Category headers describe story fundamentals, not format specifics |
| **Diagnosis** | Replace "Score: 74" with "What's Working / What's Broken / What's Underdeveloped" |
| **Weighted Reality** | Visual weight indicators showing core vs polish issues |
| **Maturity Scale** | Prominent maturity badge: Draft / Developing / Polished / Production |
| **Actionability** | Every section ends with "Development Focus" or links to Rewrite Priorities |

---

## Structural Changes

### 1. Report Cover (New: Birds-Eye Dashboard)

Create a new **Report Cover** page that serves as the entry point with navigation to all sections.

**File**: `src/pages/report/ReportCover.tsx` (New)

```text
+----------------------------------------------------------+
|  REPORT COVER                                             |
+----------------------------------------------------------+
|                                                          |
|  [Script Title]                                          |
|  [Logline]                                               |
|  [Genre] • [Format] • [Page Count]                       |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  DECISION SIGNAL (GO / ITERATE / HOLD)                   |
|  "What this means: [one-line explanation]"               |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  MATURITY STATUS                                         |
|  ┌─────────────────────────────────────────────────────┐ |
|  │ ○ Draft  ◐ Developing  ◑ Polished  ● Production    │ |
|  └─────────────────────────────────────────────────────┘ |
|  "Strong concepts, underdeveloped character arcs"        |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  WHAT'S WORKING / WHAT NEEDS WORK                        |
|  ┌────────────────────┐ ┌──────────────────────────────┐ |
|  │ ✓ Concept & Hook   │ │ ⚠ Character Flaw Depth      │ |
|  │ ✓ Platform Fit     │ │ ⚠ Dialogue Subtext          │ |
|  │ ✓ Structure        │ │ ✗ Exposition Balance        │ |
|  └────────────────────┘ └──────────────────────────────┘ |
|                                                          |
+----------------------------------------------------------+
|                                                          |
|  QUICK NAVIGATION                                        |
|  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        |
|  │ Story   │ │Character│ │ Craft   │ │ Market  │        |
|  │ 82/100  │ │ 74/100  │ │ 78/100  │ │ 86/100  │        |
|  └─────────┘ └─────────┘ └─────────┘ └─────────┘        |
|                                                          |
|  [View Full Diagnosis →]  [Jump to Rewrite Priorities →] |
|                                                          |
+----------------------------------------------------------+
```

### 2. Simplified Navigation Structure

Consolidate 31 report pages into **7 focused sections** + **2 action pages**:

**Modifications**: `src/lib/reportNavigation.ts`

| Current (31 pages) | New (9 pages) |
|-------------------|---------------|
| Snapshot, Overview | **Cover** (entry dashboard) |
| Concept, Plot, Structure | **Story Diagnosis** |
| Protagonist, Antagonist, Cast, Psychology | **Character Diagnosis** |
| Dialogue, Theme, Visual, Emotional | **Craft Diagnosis** |
| Web Series (specialized) | **Format Diagnosis** (conditional) |
| Market, Production, Audience, Platform | **Commercial Diagnosis** |
| Rewrite, Scenes | **Development Priorities** |
| Bible, Scorecard, Script | **Reference** (collapsible) |

### 3. Diagnosis-First Section Design Pattern

Each section page follows a consistent diagnostic pattern:

**Template for all section pages:**

```text
+----------------------------------------------------------+
|  SECTION HEADER                                           |
|  [Icon] [Section Name] • Maturity: [Developing]          |
+----------------------------------------------------------+

+----------------------------------------------------------+
|  DIAGNOSIS SUMMARY                                        |
|  ┌──────────────────────────────────────────────────────┐|
|  │ What's Working                                       │|
|  │ • [Strength 1 with evidence quote]                   │|
|  │ • [Strength 2 with evidence quote]                   │|
|  └──────────────────────────────────────────────────────┘|
|  ┌──────────────────────────────────────────────────────┐|
|  │ What's Structurally Broken                           │|
|  │ • [Issue 1 - Score < 40] [FIX COST: High] [→ Link]   │|
|  └──────────────────────────────────────────────────────┘|
|  ┌──────────────────────────────────────────────────────┐|
|  │ What's Underdeveloped                                │|
|  │ • [Issue 2 - Score 40-60] [FIX COST: Medium]         │|
|  │ • [Issue 3 - Score 40-60] [FIX COST: Low]            │|
|  └──────────────────────────────────────────────────────┘|
+----------------------------------------------------------+

+----------------------------------------------------------+
|  WEIGHTED PARAMETER BREAKDOWN (Expandable)                |
|  ┌──────────────────────────────────────────────────────┐|
|  │ ████████████████░░░░ 78 [Hook Efficiency] ⬤ CORE     │|
|  │ ████████████░░░░░░░░ 62 [Character Arc] ⬤ CORE       │|
|  │ ██████████████████░░ 88 [Pacing] ○ POLISH            │|
|  └──────────────────────────────────────────────────────┘|
|  [Show all 12 parameters ▼]                              |
+----------------------------------------------------------+

+----------------------------------------------------------+
|  DEVELOPMENT FOCUS                                        |
|  "For this section, prioritize: [Top 2 actionable items]" |
|  [Jump to Rewrite Priorities →]                          |
+----------------------------------------------------------+
```

---

## New Components

### 1. MaturityBadge Component

**File**: `src/components/report/ui/MaturityBadge.tsx` (New)

Displays script maturity stage with visual progression:

- **Draft** (< 40): "Early concepts, major structural work needed"
- **Developing** (40-65): "Strong foundation, focused development required"
- **Polished** (65-80): "Near-complete, polish pass recommended"
- **Production** (80+): "Ready for production consideration"

### 2. DiagnosisSummary Component

**File**: `src/components/report/ui/DiagnosisSummary.tsx` (New)

Replaces score-first displays with diagnostic language:

```typescript
interface DiagnosisSummaryProps {
  parameters: ParameterScoreData[];
  categoryName: string;
}

// Groups parameters into:
// - Working (score >= 70)
// - Broken (score < 40, high risk)
// - Underdeveloped (score 40-70, medium risk)
```

### 3. WeightedParameterBar Component

**File**: `src/components/report/ui/WeightedParameterBar.tsx` (New)

Shows parameter importance with visual weight indicators:

- **Core Story** (weight >= 1.2): Solid dot, larger bar, prominent color
- **Standard** (weight 0.8-1.2): Half dot, normal bar
- **Polish** (weight < 0.8): Empty dot, subtle bar

### 4. SectionNavigator Component

**File**: `src/components/report/ui/SectionNavigator.tsx` (New)

Cross-linking component shown at bottom of each section:

```text
← Previous: Story Diagnosis    |    Next: Craft Diagnosis →
                    [View All Sections]
```

---

## File Modifications

### Phase 1: Core Infrastructure

| File | Action | Changes |
|------|--------|---------|
| `src/lib/scoreUtils.ts` | Modify | Add `getMaturityStage()`, `getDiagnosticCategory()` functions |
| `src/types/database.ts` | Modify | Add `MaturityStage` type, diagnostic interfaces |
| `src/lib/reportNavigation.ts` | Rewrite | Consolidate 31 pages → 9 sections |

### Phase 2: New Components

| File | Action |
|------|--------|
| `src/components/report/ui/MaturityBadge.tsx` | Create |
| `src/components/report/ui/DiagnosisSummary.tsx` | Create |
| `src/components/report/ui/WeightedParameterBar.tsx` | Create |
| `src/components/report/ui/SectionNavigator.tsx` | Create |
| `src/components/report/ui/DevelopmentFocus.tsx` | Create |

### Phase 3: Report Pages (Web Series Focus)

| File | Action | Description |
|------|--------|-------------|
| `src/pages/report/ReportCover.tsx` | Create | Birds-eye dashboard with navigation |
| `src/pages/report/StoryDiagnosis.tsx` | Create | Combines Concept, Plot, Structure |
| `src/pages/report/CharacterDiagnosis.tsx` | Create | Combines all character pages |
| `src/pages/report/CraftDiagnosis.tsx` | Create | Combines Dialogue, Theme, Visual, Emotional |
| `src/pages/report/FormatDiagnosis.tsx` | Create | Web Series / Micro Drama specific |
| `src/pages/report/CommercialDiagnosis.tsx` | Create | Combines Market, Production, Audience |
| `src/pages/report/DevelopmentPriorities.tsx` | Rewrite | Enhanced RewritePriorities with cross-links |

### Phase 4: Layout Updates

| File | Action | Changes |
|------|--------|---------|
| `src/pages/SampleWebSeriesReport.tsx` | Modify | Update route structure, default to Cover |
| `src/components/report/SampleCommandHeader.tsx` | Modify | Simplified nav with 7 tabs |
| `src/components/report/SampleActionRail.tsx` | Modify | Add maturity stage, remove redundant stats |
| `src/App.tsx` | Modify | Update routing for consolidated pages |

---

## Language Guidelines

### Replace Judgment with Diagnosis

| Before (Judgment) | After (Diagnosis) |
|------------------|-------------------|
| "Score: 62/100" | "Developing: Strong concept, needs character depth" |
| "Good" / "Poor" | "Working" / "Needs Development" |
| "Production-Ready" | "Maturity: Polished (ready for consideration)" |
| "Weaknesses" | "What needs development" |
| "Critical issues" | "Core structural gaps" |

### Actionability Language

Every diagnostic statement links to action:

- "Devon's exposition is heavy → [See Dialogue rewrite in Development Priorities]"
- "Flaw centrality is underdeveloped → [Character Development Focus: Page 3]"

---

## Scoring Consistency

### Standardize to 0-100 Scale

All displays use integer scores (no decimals except Action Rail):

```typescript
// Display formatting
const displayScore = Math.round(score); // 84, not 84.2
const percentageBar = `${score}%`;      // Width for progress bars
```

### Weight Visibility

Show weights transparently:

```text
Hook Efficiency    ████████████████░░░░  78  [CORE: 1.4x weight]
Dialogue Subtext   ████████░░░░░░░░░░░░  42  [Standard weight]
Scene Headings     ██████████████████░░  88  [Polish: 0.6x weight]
```

---

## Information Architecture

### Eliminating Redundancy

Current report shows the same data in multiple places:

- Score appears in: Header, Action Rail, Section header, Parameter cards, Scorecard
- Logline appears in: Cover, Concept page, Executive Summary

**New approach**: Each data point has ONE authoritative location with cross-links:

| Data | Primary Location | Cross-links |
|------|-----------------|-------------|
| Overall Score | Report Cover | Action Rail (small) |
| Decision Signal | Report Cover | None (single source) |
| Category Scores | Section headers | Cover navigation cards |
| Parameter details | Section expandable panels | Development Priorities |
| Logline | Report Cover only | None |
| Rewrite items | Development Priorities | Section "Development Focus" links |

### Cross-Link Pattern

Each section ends with:

```text
┌──────────────────────────────────────────────────────────┐
│ DEVELOPMENT FOCUS                                        │
│                                                          │
│ For Story: Prioritize strengthening the central conflict │
│ and tightening Devon's exposition scene.                 │
│                                                          │
│ Related: [Character Diagnosis] • [Development Priorities]│
└──────────────────────────────────────────────────────────┘
```

---

## Export & Existing Functionality

All existing features are preserved:

- **PDF Export**: Updated to match new structure
- **Stakeholder Lens**: Works identically, recalculates on all pages
- **Share**: Functions as before
- **Script viewing**: Link preserved in header

---

## Technical Implementation Notes

### Routing Changes

```typescript
// Old routes (sample)
'/sample-web-series-report' → ProjectSnapshot
'/sample-web-series-report/concept' → ConceptHook
'/sample-web-series-report/plot' → PlotAnalysis
// ... 28 more routes

// New routes
'/sample-web-series-report' → ReportCover (new default)
'/sample-web-series-report/story' → StoryDiagnosis
'/sample-web-series-report/characters' → CharacterDiagnosis
'/sample-web-series-report/craft' → CraftDiagnosis
'/sample-web-series-report/format' → FormatDiagnosis
'/sample-web-series-report/commercial' → CommercialDiagnosis
'/sample-web-series-report/development' → DevelopmentPriorities
'/sample-web-series-report/reference' → Reference (expandable)
```

### Backward Compatibility

Old routes will redirect to new consolidated pages:

```typescript
// Redirect map in App.tsx
{ from: '/concept', to: '/story' },
{ from: '/plot', to: '/story' },
{ from: '/structure', to: '/story' },
// etc.
```

---

## Success Metrics

After implementation, the report will:

1. **Reduce cognitive load**: 7 core pages vs 31 scattered pages
2. **Emphasize diagnosis**: "What's broken" before "what's the score"
3. **Surface actionability**: Every section links to development priorities
4. **Distinguish maturity**: Clear visual for "weak" vs "unfinished"
5. **Maintain depth**: Expandable parameter panels preserve all detail
6. **Ensure consistency**: Single source of truth for each data point

---

## Implementation Order

1. Create new utility functions (`scoreUtils.ts` additions)
2. Create new UI components (MaturityBadge, DiagnosisSummary, etc.)
3. Create ReportCover page
4. Create consolidated diagnosis pages (Story, Character, Craft, Commercial, Format)
5. Update DevelopmentPriorities with cross-links
6. Update navigation structure
7. Update routing in App.tsx
8. Update SampleWebSeriesReport layout
9. Update Command Header and Action Rail
10. Add redirects for old routes
11. Update PDF export to match new structure

