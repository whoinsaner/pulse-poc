

# Report Cards Redesign with USAF Framework

## Overview

Redesign the completed report cards on the `/reports` page to align with the USAF framework's diagnosis-first philosophy. The new cards will display actionable Decision Signals (GO/ITERATE/HOLD), Maturity Stage progress, diagnostic summaries, and visual hierarchy based on production readiness.

## Current Issues

1. **Raw scores without context** - Showing "57" without explaining what it means
2. **No Decision Signal** - Missing GO/ITERATE/HOLD badges that exist in full reports
3. **No Maturity indicator** - Draft → Developing → Polished → Production not shown
4. **No diagnostic summary** - "What's Working vs Needs Work" counts missing
5. **Identical visual treatment** - All cards look the same regardless of readiness status
6. **Weak quick stats** - Only showing 2 random lens scores

## Proposed Design

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────┐
│ [GO Badge]                           [Maturity: 7]  │  ← Decision Signal + Maturity
│                                                     │
│  SCRIPT TITLE                                       │
│  Genre • Script Type                                │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  [Score Ring]  Production-Ready              │   │  ← Score + Readiness Label
│  │     85         Ready for development         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────┐ ┌──────────────────┐         │
│  │ ✓ 12 Working     │ │ ⚠ 5 Need Work    │         │  ← Diagnostic Summary
│  └──────────────────┘ └──────────────────┘         │
│                                                     │
│  Top Strength: Strong protagonist arc               │  ← Key Insight Preview
│                                                     │
│  [View Report]                    Created: Jan 28   │
└─────────────────────────────────────────────────────┘
```

### Color-Coded Borders

- **GO (score ≥ 75)**: Green border/accent (`border-green-500`)
- **ITERATE (50-74)**: Amber border/accent (`border-amber-500`)
- **HOLD (< 50)**: Red border/accent (`border-red-500`)

## Implementation Steps

### Step 1: Create DiagnosticSummary Utility

Add helper functions to `src/lib/scoreUtils.ts`:

- `getDiagnosticCounts(categoryScores)` - Returns counts of working vs needs-work parameters
- `getTopStrength(categoryScores)` - Returns the highest-scoring category name
- `getReadinessLabel(score)` - Maps scores to human-readable labels

### Step 2: Create ReportCardV2 Component

Create a new `src/components/ReportCardV2.tsx` component with:

- `DecisionSignalBadge` integration (existing component)
- `MaturityBadge` integration (existing component)  
- Diagnostic summary display (working/needs-work counts)
- Readiness label below score
- Top strength preview
- Color-coded border based on decision signal
- Responsive layout for grid display

### Step 3: Update Reports.tsx

Replace inline `ReportCard` with new `ReportCardV2`:

- Import new component
- Pass required props: `analysisRun`, `categoryScores`, `overallScore`
- Remove old inline card JSX
- Keep existing filtering, sorting, and data fetching logic

### Step 4: Add Hover Preview (Enhancement)

Add a `HoverCard` from Radix UI that shows on card hover:

- Top 3 working strengths with scores
- Top 3 areas needing development
- Quick navigation to specific report sections

## Technical Details

### New Props for ReportCardV2

```typescript
interface ReportCardV2Props {
  analysisRun: AnalysisRun;
  categoryScores: Record<string, number>;
  overallScore: number;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}
```

### Score-to-Label Mapping

| Score Range | Readiness Label | Decision Signal |
|-------------|-----------------|-----------------|
| 80-100 | Production-Ready | GO |
| 75-79 | Near-Ready | GO |
| 65-74 | Development Stage | ITERATE |
| 50-64 | Early Development | ITERATE |
| 25-49 | Needs Significant Work | HOLD |
| 0-24 | Major Revision Required | HOLD |

### Maturity Estimation

Since maturity isn't stored separately, estimate from:
- Scene count completeness
- Character development depth
- Dialogue analysis completion
- Overall score distribution

## Files to Modify

1. **`src/lib/scoreUtils.ts`** - Add diagnostic helper functions
2. **`src/components/ReportCardV2.tsx`** - New redesigned card component (create)
3. **`src/pages/Reports.tsx`** - Replace inline ReportCard with ReportCardV2

## Dependencies

- Existing `DecisionSignalBadge` component
- Existing `MaturityBadge` component
- Existing `ScoreRing` component
- Radix UI `HoverCard` (already installed)

