
# Full Report PDF Export -- Book-Style with TOC and Navigation

## Goal

Replace the current lightweight PDF export with a comprehensive book-structured PDF that mirrors every section of the online analysis report, including all agent narratives, diagnosis pages, parameter breakdowns, and recommendations.

## Current State

The existing `sampleReportPdfGenerator.ts` (client-side, ~950 lines) produces a data-summary PDF with tables. The `export-report` edge function produces markdown. Neither includes the rich agent narrative content that makes the online report valuable.

## Architecture Decision

**Client-side generation using jsPDF** (same as current approach). The `ReportData` object already contains all agent content, parameters, insights, characters, and scenes -- no additional API calls needed. We create a new comprehensive generator that reads from the same `reportData` object the UI uses.

## PDF Structure (Book Format)

```text
Page 1      Cover Page (title, score, metadata pills, decision signal)
Page 2      Table of Contents (clickable internal links)
Page 3-4    Executive Summary (AI narrative + lens scores)
            ---
            PART I: STORY ANALYSIS
Page 5      Story Diagnosis (overview scores, strengths/weaknesses)
Page 6      Concept & Hook (agent narrative + parameters)
Page 7      Structure (agent narrative + parameters)
Page 8      Conflict & Stakes (agent narrative + parameters)
            ---
            PART II: CHARACTERS
Page 9      Character Diagnosis (overview)
Page 10     Protagonist Analysis (agent narrative + parameters)
Page 11     Antagonist Analysis (agent narrative + parameters)
Page 12     Supporting Cast (agent narrative + parameters)
            ---
            PART III: CRAFT
Page 13     Craft Diagnosis (overview)
Page 14     Dialogue & Subtext (agent narrative + parameters)
Page 15     Theme & Meaning (agent narrative + parameters)
Page 16     Visual Storytelling (agent narrative + parameters)
Page 17     Emotional Arc (agent narrative + parameters)
Page 18     Scene Economy (agent narrative + parameters)
            ---
            PART IV: FORMAT (conditional -- comic/web_series only)
Page 19     Format Diagnosis
Page 20-23  Panel Flow / Lettering / Page Turns / Art-Synergy
            ---
            PART V: PRODUCTION & MARKET
Page 24     Commercial Diagnosis
Page 25     Market Analysis (agent narrative + parameters)
Page 26     Production Viability (agent narrative + parameters)
            ---
            PART VI: RECOMMENDATIONS
Page 27     Development Priorities (ranked action items)
            ---
            APPENDICES
Page 28     Complete Scorecard (all parameters with scores)
Page 29     Character Reference (full list with arcs)
Page 30     Scene Index
```

Actual page counts will vary based on content length. Format sections only appear for comic/web_series scripts.

## Key Features

### 1. Clickable Table of Contents
jsPDF supports internal links via `doc.link()` and `doc.setPage()`. Each TOC entry will jump to its corresponding section. Part headers serve as visual dividers.

### 2. Agent Narrative Rendering
The `reportData.agentContent` object contains rich text from each agent (e.g., `StoryDiagnosisAgent`, `ProtagonistAgent`). The PDF will render these as formatted paragraphs with proper text wrapping, preserving the analytical depth of the online report.

### 3. Parameter Cards per Section
Each section page shows its relevant parameters with: score, maturity badge, risk level, rationale, and evidence quotes -- matching the online `WeightedParameterList` display.

### 4. Conditional Format Sections
Comic scripts get Panel Flow, Lettering, Page Turns, Art-Synergy sections. Web series scripts get Retention, Hooks, Series Analysis. Feature/pilot scripts skip these entirely.

### 5. Running Headers and Footers
Every page gets: section name in header, page number, "USAF v3.0 Analysis Report" branding, and generation date in footer.

## Technical Details

### Files Changed

| File | Change |
|------|--------|
| `src/lib/fullReportPdfGenerator.ts` | **New file** -- Complete book-style PDF generator (~1500-2000 lines) |
| `src/components/report/ExportDialog.tsx` | Update "PDF Report" option to use new generator client-side instead of edge function |

### Implementation Approach

1. **Create `src/lib/fullReportPdfGenerator.ts`**
   - Helper functions: `addHeader`, `addFooter`, `addPartDivider`, `addAgentNarrative`, `addParameterCard`, `checkPageBreak`
   - TOC builder: First pass collects section titles and page numbers, second pass writes TOC with `doc.link()` targets
   - Section generators: One function per report section, each reads from `reportData`
   - Main export function: `generateFullReportPDF(reportData, title, activeLens, scriptType)`

2. **Update ExportDialog**
   - Import the new generator
   - For "PDF Report" format: call `generateFullReportPDF()` client-side directly instead of hitting the edge function
   - Pass `reportData` from the report context (already available via `useOutletContext`)
   - This eliminates the server roundtrip and uses the same data the UI renders

3. **TOC with Internal Links** (jsPDF approach)
   - First render all content sections, tracking each section's starting page number
   - Then go back to page 2 and render the TOC with `doc.internal.link()` pointing to collected page numbers
   - Each section sets a named destination via `doc.setPage()` for the link targets

4. **Agent Content Mapping**
   - Map navigation sections to their agent keys:
     - Story Diagnosis -> `StoryDiagnosisAgent`
     - Concept & Hook -> `ConceptHookAgent`  
     - Protagonist -> `ProtagonistAgent`
     - Dialogue -> `DialogueAgent`
     - Panel Flow -> `PanelFlowAgent`
     - etc.
   - Render each agent's narrative as wrapped paragraphs with heading

5. **Parameter Grouping**
   - Group `reportData.parameterScores` by category
   - Map categories to sections (e.g., "Concept & Hook" category -> Concept section)
   - Render as compact cards: name, score bar, rationale, evidence

### ExportDialog Data Flow

The ExportDialog currently doesn't have access to `reportData`. Two options:
- Pass `reportData` as a prop from the report layout
- Or keep using the edge function but enhance it

Preferred approach: Pass `reportData` as a prop since it's already loaded in the report layout context, making the PDF generation instant (no network call).

### Backward Compatibility

- The "Executive Summary" and "Full Report" markdown exports remain unchanged
- The "Raw JSON" export remains unchanged
- Only the "PDF Report" option changes behavior (from server markdown fallback to client-side full PDF)
- The old `sampleReportPdfGenerator.ts` is kept for sample report pages

