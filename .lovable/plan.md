

# Export PRD as PDF

## What
Create a `prdPdfGenerator.ts` that generates a professional Product Requirements Document PDF covering all Pulse v3 features, without any references to code files or functions.

## Approach
Follow the exact same pattern as `pulseV2PdfGenerator.ts` — same helpers (`addHeader`, `addFooter`, `addSectionTitle`, `addParagraph`, `checkPageBreak`), same COLORS/FONTS/MARGINS constants, jsPDF + autoTable.

## PRD Content Structure (all business/product language, zero code references)

1. **Cover Page** — "Pulse v3 — Product Requirements Document", version, date
2. **Table of Contents**
3. **Product Overview** — Vision, target users, value proposition
4. **Script Ingestion & Parsing** — Supported formats (PDF, FDX, Fountain, Word), streaming extraction, scene/character/line-level data capture
5. **Multi-Agent Analysis Engine** — 10 core agents + 6 format-specialist agents, 145+ parameters, GO/ITERATE/HOLD scoring
6. **Stakeholder Lens System** — 9 lenses (Studio Executive, Director, Writer, etc.), dynamic score re-weighting, adaptive report navigation
7. **Report System** — Executive summary, parameter breakdowns, character analysis, narrative timeline, format-specific sections (Comic, Web Series, Micro Drama)
8. **Export & Sharing** — PDF report, executive summary PDF, raw JSON
9. **Supported Script Formats** — Feature Film, Pilot, Episode, Comic, Web Series, Micro Drama
10. **Team & Organization** — Multi-tenant orgs, invitation system, role-based access
11. **Authentication & Security** — Email-based auth, row-level data isolation, input validation
12. **Quality Modes** — Standard vs Deep analysis
13. **Data Model** (high-level entity descriptions, no table/column names) — Scripts, Scenes, Characters, Lines, Analysis Runs, Reports, Parameter Scores

## Implementation

1. Create `src/lib/prdPdfGenerator.ts` — self-contained data + generator (no separate data file needed; all PRD content defined as const objects within the file)
2. Add a "Download PRD" button — either on the Framework Documentation page or the Index/Dashboard. I'll add it to the Framework Documentation page alongside existing PDF export buttons.

## File Changes
- **New**: `src/lib/prdPdfGenerator.ts` (~400-500 lines)
- **Edit**: `src/pages/FrameworkDocumentation.tsx` — add import + download button

