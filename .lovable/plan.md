
Fix the PDF/export mismatch by aligning the character sections with the same data source the report pages use.

1. Confirm the data contract
- The web report reads protagonist, antagonist, and supporting-cast data from `reportData.agentContent?.CharacterAgent`.
- The PDF currently expects separate agent keys (`ProtagonistAgent`, `AntagonistAgent`, `SupportingCastAgent`) in `src/lib/fullReportPdfGenerator.ts`, so those sections render empty when only `CharacterAgent` contains the structured character payload.

2. Update PDF character-section mapping
- Change the character section mappings in `src/lib/fullReportPdfGenerator.ts` so:
  - `character-protagonist`
  - `character-antagonist`
  - `character-cast`
  all read from `CharacterAgent` instead of nonexistent split agents.
- Keep the current rendering logic for:
  - `protagonistProfiles` / `protagonistProfile`
  - `antagonistProfile`
  - `supportingCast`

3. Add a safe fallback path
- If structured `CharacterAgent` fields are missing, fall back to `data.characters` so the PDF still shows useful character content instead of a blank section.
- For supporting cast, exclude any names already present in `protagonistProfiles` to avoid duplication.

4. Keep web/PDF behavior consistent
- Mirror the same multi-protagonist assumptions already used in:
  - `src/pages/report/ProtagonistAnalysis.tsx`
  - `src/pages/report/AntagonistAnalysis.tsx`
  - `src/pages/report/SupportingCast.tsx`
- This ensures the PDF matches what the user sees in the report.

5. Verify end-to-end
- Export a fresh PDF from the same report and confirm it now includes:
  - Protagonist cards
  - Antagonist profile
  - Supporting cast entries
- Also verify the sections still appear in the Table of Contents and no blank character pages remain.

Technical details
- Root cause: PDF export and report UI are using different agent keys for the same character analysis data.
- Primary file to update: `src/lib/fullReportPdfGenerator.ts`
- Likely follow-up improvement: refactor shared character-extraction logic into one helper so both UI and PDF consume the same normalized structure.
