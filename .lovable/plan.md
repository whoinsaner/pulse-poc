

# Wire Micro Drama Sub-Page and Standardize Styling

## Overview
Wire the orphaned `MicroDramaAnalysis.tsx` into the report system (navigation, routing, PDF export), standardize its styling to match the report pattern, and ensure it consumes real pipeline data. Also update `FormatDiagnosis.tsx` to properly handle `pilot`/`episode` types.

## Changes

### 1. Add Navigation Item (`src/lib/reportNavigation.ts`)
- Add a new nav item under the `format` group:
  ```
  { id: 'format-micro-drama', label: 'Micro Drama Deep Dive', icon: Smartphone, path: '/format/micro-drama', applicableTypes: ['micro_drama'] }
  ```
- Place it after the web series items (line 138) and before the Series Bible item.

### 2. Add Route (`src/App.tsx`)
- Add route in the main report layout (after line 155):
  ```
  <Route path="format/micro-drama" element={<MicroDramaAnalysis />} />
  ```
- Add the same route in the sample micro drama report section (after line 415).
- `MicroDramaAnalysis` is already imported (line 56).

### 3. Add PDF Export Mappings (`src/lib/fullReportPdfGenerator.ts`)

**SECTION_AGENT_MAP** (line 91): Add:
```
'format-micro-drama': ['MicroDramaFormatAgent'],
```

**SECTION_CATEGORY_MAP** (line 116): Add:
```
'format-micro-drama': ['Micro Drama'],
```

**Micro drama PDF branch** (lines 1163-1168): Expand from a single page to two pages:
```
renderPartDivider(doc, pageNum, 'PART IV', 'MICRO DRAMA FORMAT', toc);

const microDramaSections = [
  { id: 'format', title: 'Format Diagnosis', subtitle: 'Micro drama format overview' },
  { id: 'format-micro-drama', title: 'Micro Drama Deep Dive', subtitle: 'Hook velocity, cliff density, and scroll-stop optimization' },
];

for (const sec of microDramaSections) {
  y = newPage(doc, pageNum, sec.title);
  toc.push({ title: sec.title, page: pageNum.value, level: 1 });
  y = renderSection(doc, y, sec.id, sec.title, sec.subtitle, data, pageNum);
}
```

### 4. Standardize `MicroDramaAnalysis.tsx` Styling
Rewrite the page to follow the standard report pattern while preserving all unique content:

- **SectionHeader**: "Micro Drama Deep Dive" with Smartphone icon and computed average score
- **AgentNarrativePanel**: from `MicroDramaFormatAgent` agent content
- **Format Context Card**: Keep the vertical-first context card but remove gradient background, use standard `bg-primary/5 border-primary/20` styling
- **Failure Pattern Warnings**: Keep the critical failure pattern card (unique content), use standard card styling
- **WeightedParameterList**: Replace the three custom parameter grids (max weight, high weight, standard) with a single `WeightedParameterList` component, filtering `parameterScores` by `category === 'Micro Drama'`. The weight tiers (2.0x, 1.5x, 1.0x) will be shown via the existing weight tier badges in the parameter list
- **Remove**: The "Micro Drama Best Practices" static tips card (hardcoded content, same pattern removed from web series)
- **Remove**: `max-w-7xl mx-auto` wrapper, use `space-y-8` root
- **Remove**: Custom inline progress bars and gradient card backgrounds

New imports: `SectionHeader`, `WeightedParameterList` from `@/components/report/ui`, `AgentNarrativePanel` from `@/components/report/AgentNarrativePanel`.

### 5. Update `FormatDiagnosis.tsx` for Pilot/Episode Types
Currently returns empty content for pilot/episode because `formatCategory` is null. Fix:
- For `pilot` and `episode`, set `formatCategory` to `null` but instead of showing "No format-specific analysis", render a minimal page with `SectionHeader` and the generic `WeightedParameterList` showing all parameters (no category filter), since these types don't have dedicated format parameters but still benefit from seeing the Format Diagnosis overview.
- Alternatively, since `FormatDiagnosis` is only visible in the nav for types listed in `applicableTypes` (which includes `pilot` and `episode`), update the fallback to show a useful message: "Format analysis covers structure and pacing specific to [Pilot/Episode] format."

## Files Modified
1. `src/lib/reportNavigation.ts` -- Add micro drama nav item
2. `src/App.tsx` -- Add route for `format/micro-drama`
3. `src/lib/fullReportPdfGenerator.ts` -- Add agent/category mappings, expand PDF micro drama section
4. `src/pages/report/MicroDramaAnalysis.tsx` -- Standardize to report pattern with real data
5. `src/pages/report/FormatDiagnosis.tsx` -- Handle pilot/episode types gracefully

