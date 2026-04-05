

# Report Duplication Analysis and Quality Improvement Plan

## Identified Duplication Issues

### 1. Parameter scores shown 3-4 times per section
The same parameter data appears repeatedly as users navigate through the report hierarchy:

- **Cover page** (`ReportCover`): Shows "What's Working" and "What Needs Work" lists — these are the same parameters displayed everywhere else.
- **Diagnosis pages** (Story, Character, Craft, Commercial): Each shows a `DiagnosisSummary` (Working/Broken/Underdeveloped grid) + `WeightedParameterList` + `DevelopmentFocus` — all derived from the same `parameterScores`.
- **Sub-pages** (Concept, Protagonist, Dialogue, etc.): Show the *same subset* of parameters again via `WeightedParameterList`, often with identical rationale text.
- **Complete Scorecard**: Shows Top 5 Strengths/Weaknesses + Category Breakdown — again the same scores.
- **Legacy "Analysis" page** (`/analysis`): Shows `AgentAnalysisGrid` + `CategoryScoreSection` + `FullParameterSection` — a complete dump of all parameter data already spread across the USAF pages.

**Example**: A dialogue parameter with score 72 and its rationale appears on: Cover (as "working"), Craft Diagnosis (in DiagnosisSummary + WeightedParameterList + DevelopmentFocus), Craft/Dialogue sub-page (WeightedParameterList again), Scorecard (if top 5), and the legacy Analysis page.

### 2. Development/Rewrite duplication
- **DevelopmentFocus** widget appears at the bottom of *every* diagnosis page (Story, Character, Craft, Commercial) showing low-scoring params for that section.
- **DevelopmentPriorities** page shows *all* low-scoring params across all sections — the exact union of the above.
- **RewritePriorities** sub-page shows the same data again, tiered differently (using raw score thresholds <4, 4-6, 6-7.5 on a 10-point scale vs. the 0-100 scale used elsewhere — a likely bug).

### 3. Score display redundancy
The overall score and decision signal appear on: sidebar (ScoreRing), Cover page (DecisionSignalBadge + score), Scorecard (SectionHeader score), and DevelopmentPriorities (Decision Context card).

### 4. Still-active legacy routes serve stale views
`/analysis`, `/narrative`, `/characters-detail`, `/insights` are still routable and show older UI patterns that overlap with the USAF pages.

---

## Recommended Improvements

### A. Differentiate diagnosis pages from sub-pages (high impact)
**Problem**: Diagnosis pages and their sub-pages show the same parameters in the same way.
**Fix**: Remove `WeightedParameterList` from diagnosis overview pages. The overview should show only `DiagnosisSummary` (the 3-column Working/Broken/Underdeveloped grid) and the dimension cards (already present in Craft and Commercial). The detailed parameter breakdown should live exclusively on the sub-pages, where it's accompanied by agent narrative content.

### B. Consolidate Development/Rewrite into one page (medium impact)
**Problem**: `DevelopmentPriorities` and `RewritePriorities` show the same data differently.
**Fix**: Remove `RewritePriorities` as a separate route (redirect to `/development`). Merge the tiered view into `DevelopmentPriorities`. Also remove the `DevelopmentFocus` widget from each diagnosis page — it duplicates what the Development page already surfaces, and the "Needs Work" list on the Cover page already flags these.

### C. Retire legacy routes (low effort, reduces confusion)
**Problem**: `/analysis`, `/narrative`, `/characters-detail` still render and overlap with USAF pages.
**Fix**: Convert these to redirects (like the other legacy routes already are). `/analysis` -> `/scorecard`, `/characters-detail` -> `/characters`, `/narrative` -> `/story`.

### D. Fix RewritePriorities score scale bug
`RewritePriorities` filters params with `score < 4` and `score < 6` — this assumes a 1-10 scale, but `parameterScores` use 0-100. This means the "critical" and "high priority" tiers are always empty for real data, making the page appear broken.

### E. Make the Cover page a true executive summary (medium impact)
**Problem**: The Cover shows Working/Needs Work lists that are just sorted parameter names without narrative context.
**Fix**: Replace the expandable parameter lists with the `ExecutiveSummary` component (already exists but unused in USAF flow). Show the agent-generated verdict text instead of raw parameter names. Keep the Quick Navigation cards.

---

## Implementation Summary

| Change | Files Modified | Effort |
|--------|---------------|--------|
| A. Remove WeightedParameterList from 4 diagnosis pages | StoryDiagnosis, CharacterDiagnosis, CraftDiagnosis, CommercialDiagnosis | Small |
| B. Remove DevelopmentFocus from 4 diagnosis pages, redirect RewritePriorities | Same 4 + App.tsx + delete/simplify RewritePriorities | Small |
| C. Redirect legacy routes | App.tsx (3 route changes) | Trivial |
| D. Fix score scale in RewritePriorities | RewritePriorities.tsx (if kept) | Trivial |
| E. Use ExecutiveSummary on Cover | ReportCover.tsx | Small |

Total: ~6-8 files changed, no database or edge function changes.

