
# Comic-Specific Dialogue Evaluation in DialogueAgent

## Problem
The DialogueAgent evaluates comic scripts using traditional screenplay dialogue metrics (voice differentiation, subtext density, quotability). Comic scripts often rely on captions, narration boxes, and minimal spoken dialogue -- leading to artificially low scores and misleading assessments like "no traditional dialogue found."

## Solution
Enhance the DialogueAgent's system prompt with comic-specific evaluation criteria that activate when analyzing comic scripts. The script type is already available in the context passed to each agent (`Type: comic`), so the agent just needs instructions on how to adapt.

## Changes

### File: `supabase/functions/analyze-script/index.ts`

**1. Update DialogueAgent system prompt (lines 638-653)**

Expand the prompt to include comic-specific evaluation guidance. The agent already receives the script type in the context, so we add conditional instructions telling it how to reinterpret each parameter for comics:

| Standard Parameter | Comic Interpretation |
|---|---|
| Exposition Load | Caption economy -- how efficiently narration boxes convey story vs. over-explaining visuals |
| Subtext Density | Visual-text interplay -- meaning created between what captions say and what panels show |
| Voice Differentiation | Narrator voice consistency and tonal identity across caption styles |
| Rhythm & Silence | Text pacing across panels -- wordless panels as "silence," caption density variation |
| Quotability | Memorable caption lines, taglines, or narration hooks |
| Medium Appropriateness | Whether text complements visual storytelling rather than duplicating it |

The updated prompt will include a section like:

```
COMIC/GRAPHIC NARRATIVE ADAPTATION:
When analyzing comics or graphic narratives, adapt your evaluation:
- Exposition Load → Caption Economy: Evaluate narration boxes for efficiency. 
  Do captions add meaning beyond what panels show, or do they redundantly describe the art?
- Subtext Density → Visual-Text Interplay: Assess the gap between what text says 
  and what art depicts. The best comics create meaning in this gap.
- Voice Differentiation → Narrative Voice Identity: Evaluate consistency and 
  distinctiveness of caption/narrator voice. If multiple narrators exist, 
  assess differentiation.
- Rhythm & Silence → Text Pacing: Evaluate caption density variation. 
  Wordless panels function as silence. Assess the rhythm of text-heavy 
  vs. text-light sequences.
- Quotability → Memorable Lines: Evaluate caption hooks, taglines, 
  and standout narration moments.
- Medium Appropriateness → Show vs. Tell Balance: Comics should SHOW through art. 
  Text that describes what art already depicts is a red flag.

Do NOT penalize comics for lacking traditional character dialogue exchanges. 
Evaluate the text elements that ARE present (captions, narration, SFX, 
balloon text) on their own merits.
```

This is the only file that needs to change. No UI changes are required since the report pages already display whatever the agent produces -- the improvement is entirely in the quality and relevance of the agent's analysis output for comic scripts.
