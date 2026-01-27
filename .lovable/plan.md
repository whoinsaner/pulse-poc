
# Stakeholder-Adaptive Content System

## Problem Statement

Currently, the USAF report system adapts **scoring and filtering** based on stakeholder lens, but the **narrative content** (rationales, insights, recommendations) remains identical across all perspectives. This creates a disconnect where a Writer and a Financier see the same diagnostic language, even though their decision-making vocabularies differ significantly.

## Solution Overview

Implement a **Stakeholder Content Adaptation Layer** that transforms the base analysis into role-specific language while preserving the objective diagnostic truth. This involves:

1. **Stakeholder Vocabulary Mapping** - Define terminology translations per lens
2. **Insight Reframing Agent** - AI-powered content adaptation at report generation time
3. **Role-Specific Templates** - Pre-defined narrative patterns for each stakeholder
4. **Cached Stakeholder Reports** - Store adapted content to avoid repeated generation

---

## Technical Implementation

### Phase 1: Stakeholder Vocabulary Configuration

**File**: `src/lib/stakeholderVocabulary.ts` (New)

Define how concepts translate across stakeholders:

| Base Term | Actor | Producer | Financier |
|-----------|-------|----------|-----------|
| "Character lacks depth" | "Limited opportunities for emotional range display" | "May require additional character development passes" | "Character appeal risk affecting marketability" |
| "Structural issues" | "Scene flow disrupts performance rhythm" | "Schedule impact from structural rewrites" | "Development cost risk from story architecture" |
| "Market concerns" | "Role visibility in competitive landscape" | "Distribution positioning challenges" | "ROI risk factors in current market" |

This vocabulary map drives content transformation.

### Phase 2: Stakeholder Insight Generator

**File**: `supabase/functions/generate-stakeholder-report/index.ts` (New)

Create a dedicated edge function that:
1. Takes the base report data and a target stakeholder lens
2. Uses AI to reframe insights using stakeholder vocabulary
3. Generates a role-specific executive summary
4. Produces stakeholder-specific recommendations
5. Stores the adapted content in `stakeholder_reports` table

```text
Input:
- Base insight: "Protagonist arc unclear in Act 2"
- Target lens: "actor"

Output:
- Adapted insight: "Your character's journey plateaus in the middle section, 
  limiting opportunities for emotional showcase. Consider requesting scenes 
  that demonstrate internal conflict resolution."
- Recommendations: "Discuss with writer: add 2-3 moments of visible internal struggle"
```

### Phase 3: Enhanced Stakeholder Report Schema

**Migration**: Update `stakeholder_reports` table

Add new columns:
- `adapted_insights` (jsonb) - Reframed insights with stakeholder language
- `adapted_recommendations` (jsonb) - Role-specific action items
- `key_metrics` (jsonb) - Stakeholder-relevant data points (e.g., Actor: screen time, dialogue %)
- `vocabulary_version` (text) - Track which vocabulary map version was used

### Phase 4: Frontend Integration

**Modifications**:
- `src/pages/report/StakeholderReport.tsx` - Display adapted content when available
- `src/components/report/ui/DiagnosisSummary.tsx` - Use stakeholder language for diagnostic categories
- `src/components/report/DevelopmentFocus.tsx` - Show role-specific recommendations
- `src/pages/report/ReportCover.tsx` - Generate personalized decision signal explanations

### Phase 5: On-Demand Generation Flow

When a user selects a stakeholder lens:

1. Check if `stakeholder_reports` has a current (non-stale) entry for this lens
2. If yes: Display cached adapted content
3. If no: 
   - Show base content with filtering (current behavior)
   - Trigger background generation of adapted content
   - Update UI when adaptation completes (via realtime subscription)

---

## Content Adaptation Rules

### Executive Summary Template Per Stakeholder

**Actor Lens**:
> "Role Assessment: [Character Name]'s journey offers [high/moderate/limited] opportunities for 
> performance depth. [Strength areas]. [Key concern for actor consideration]. 
> Overall castability: [score]/100."

**Producer Lens**:
> "Production Assessment: '[Title]' presents [high/moderate/low] execution complexity with 
> [X] locations, [Y] principal cast. [Key production strength]. [Primary schedule/budget risk]. 
> Greenlight confidence: [score]/100."

**Financier Lens**:
> "Investment Assessment: '[Title]' shows [strong/moderate/weak] commercial indicators with 
> [comparable titles] positioning. [ROI opportunity]. [Key risk factor]. 
> Investment confidence: [score]/100."

### Insight Reframing Prompt

The AI receives instructions to:
1. Preserve the core diagnostic finding
2. Translate terminology using stakeholder vocabulary
3. Add role-specific implications
4. Provide actionable next steps for that stakeholder role

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/lib/stakeholderVocabulary.ts` | Vocabulary mapping configuration |
| `supabase/functions/generate-stakeholder-report/index.ts` | AI-powered content adaptation |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/report/StakeholderReport.tsx` | Use adapted content when available |
| `src/components/report/ui/DiagnosisSummary.tsx` | Stakeholder-specific diagnostic language |
| `src/components/report/DevelopmentFocus.tsx` | Role-specific recommendations |
| `src/pages/report/ReportCover.tsx` | Personalized decision signal |
| `src/components/report/StakeholderReportCache.tsx` | Show adaptation status |

### Database Migration
- Add `adapted_insights`, `adapted_recommendations`, `key_metrics`, `vocabulary_version` to `stakeholder_reports`

---

## Implementation Order

1. Create stakeholder vocabulary configuration
2. Create database migration for extended schema
3. Implement `generate-stakeholder-report` edge function
4. Update `StakeholderReport.tsx` to consume adapted content
5. Add realtime subscription for background generation updates
6. Update `DiagnosisSummary` and `DevelopmentFocus` components
7. Update `ReportCover` with personalized decision signals
8. Update `StakeholderReportCache` to show generation status
9. Test with sample reports across all 9 stakeholder lenses
10. Deploy and validate vocabulary translations

---

## Example Transformation

### Base Analysis (Current)
```
Parameter: Protagonist Arc Clarity
Score: 52/100
Maturity: Developing
Rationale: "The protagonist's emotional journey lacks clear turning points 
in Act 2. The midpoint crisis doesn't force meaningful character change."
```

### Actor-Adapted Version
```
Parameter: Character Performance Depth
Score: 52/100
Maturity: Developing  
Rationale: "Your character's journey through the middle section offers 
limited opportunities for demonstrating transformation. The midpoint 
scene lacks the emotional stakes needed for a showcase performance moment.
Consider discussing with the writer: add visible internal struggle that 
lets you show rather than tell the character's growth."
Recommendation: "Request a rewrite meeting to add 2-3 moments where your 
character's internal conflict becomes externally visible—these are the 
scenes that earn award consideration."
```

### Financier-Adapted Version
```
Parameter: Lead Character Marketability
Score: 52/100
Maturity: Developing
Rationale: "The protagonist's arc lacks the clear transformation arc that 
drives word-of-mouth and repeat viewership. Similar projects with stronger 
Act 2 character development show 23% higher audience scores."
Recommendation: "Factor in 1-2 additional development cycles for character 
work before package to talent. Weak lead arcs reduce star attachment rates 
by approximately 40% in comparable projects."
```

---

## Success Criteria

After implementation:
1. Each stakeholder lens shows content in their professional vocabulary
2. Recommendations are actionable within each stakeholder's sphere of influence
3. Executive summaries use role-specific metrics and framing
4. Cached reports load instantly; new adaptations generate in background
5. Content remains diagnostically accurate while being contextually relevant
