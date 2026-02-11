
# Add Sub-Navigation to Craft, Production & Market, Recommendations, and Reference

## New Sidebar Structure

```text
Craft
  +-- Craft Diagnosis       (/craft)           -- overview, simplified
  +-- Dialogue & Subtext    (/craft/dialogue)   -- DialogueAgent content + dialogue params
  +-- Theme & Meaning       (/craft/theme)      -- ThemeAgent content + theme params
  +-- Visual Storytelling   (/craft/visual)     -- WorldLogicAgent content + world params
  +-- Emotional Arc         (/craft/emotional)  -- EmotionalArcAgent content + emotional params
  +-- Development Focus     (/craft/focus)       -- low-scoring craft params

Production & Market
  +-- Commercial Diagnosis  (/commercial)        -- overview, simplified
  +-- Market Analysis       (/commercial/market)  -- MarketAgent narrative + market params
  +-- Production Viability  (/commercial/production) -- ExecutionAgent narrative + production params
  +-- Development Focus     (/commercial/focus)   -- low-scoring commercial params

Recommendations
  +-- Development Priorities (/development)       -- existing page (overview)
  +-- Rewrite Priorities     (/development/rewrite) -- reuses existing RewritePriorities page
  +-- Scene Economy          (/development/scenes)  -- reuses existing SceneEconomy page

Reference
  +-- Scorecard   (/scorecard)       -- already a sub-item (no change)
  +-- Script      (/script)          -- already a sub-item (no change)
  +-- Series Bible (/bible)          -- reuses existing SeriesBibleExtract page
```

## Implementation Steps

### 1. Update Navigation Config (`src/lib/reportNavigation.ts`)

Replace single items in each group with expanded sub-items:

**Craft group** -- 6 items:
| Nav Item | Path | Icon |
|----------|------|------|
| Craft Diagnosis | `/craft` | Palette |
| Dialogue & Subtext | `/craft/dialogue` | MessageSquare |
| Theme & Meaning | `/craft/theme` | Heart |
| Visual Storytelling | `/craft/visual` | Eye |
| Emotional Arc | `/craft/emotional` | Sparkles |
| Development Focus | `/craft/focus` | Target |

**Production & Market group** -- 4 items:
| Nav Item | Path | Icon |
|----------|------|------|
| Commercial Diagnosis | `/commercial` | TrendingUp |
| Market Analysis | `/commercial/market` | TrendingUp |
| Production Viability | `/commercial/production` | Film |
| Development Focus | `/commercial/focus` | Target |

**Recommendations group** -- 3 items:
| Nav Item | Path | Icon |
|----------|------|------|
| Development Priorities | `/development` | ListTodo |
| Rewrite Priorities | `/development/rewrite` | ListTodo |
| Scene Economy | `/development/scenes` | Layers |

**Reference group** -- 3 items (add Series Bible):
| Nav Item | Path | Icon |
|----------|------|------|
| Scorecard | `/scorecard` | BarChart3 |
| Script | `/script` | FileText |
| Series Bible | `/bible` | BookOpen |

### 2. Create New Page Components

**`src/pages/report/CraftDialogue.tsx`** -- Extracts DialogueAgent narrative + dialogue-category parameters from CraftDiagnosis

**`src/pages/report/CraftTheme.tsx`** -- Extracts ThemeAgent narrative + theme-category parameters

**`src/pages/report/CraftVisual.tsx`** -- Extracts WorldLogicAgent narrative + world/visual parameters

**`src/pages/report/CraftEmotional.tsx`** -- Extracts EmotionalArcAgent narrative + emotional arc parameters

**`src/pages/report/CraftDevelopmentFocus.tsx`** -- Low-scoring craft parameters (same pattern as StoryDevelopmentFocus)

**`src/pages/report/CommercialMarket.tsx`** -- Extracts MarketAgent narrative + market parameters from CommercialDiagnosis

**`src/pages/report/CommercialProduction.tsx`** -- Extracts ExecutionAgent narrative + execution parameters

**`src/pages/report/CommercialDevelopmentFocus.tsx`** -- Low-scoring commercial parameters

Total: 8 new files.

### 3. Simplify Overview Pages

**CraftDiagnosis.tsx** -- Remove inline agent narratives (DialogueAgent, ThemeAgent, WorldLogicAgent, EmotionalArcAgent) and DevelopmentFocus section. Keep SectionHeader, DiagnosisSummary, dimensions grid, WeightedParameterList.

**CommercialDiagnosis.tsx** -- Remove inline agent narratives (MarketAgent, ExecutionAgent) and DevelopmentFocus section. Keep SectionHeader, lens scores, DiagnosisSummary, dimensions grid, WeightedParameterList.

### 4. Add Routes (`src/App.tsx`)

Register new nested routes under all 4 report route groups:

```
craft/dialogue, craft/theme, craft/visual, craft/emotional, craft/focus
commercial/market, commercial/production, commercial/focus
development/rewrite, development/scenes
bible
```

Existing `RewritePriorities`, `SceneEconomy`, and `SeriesBibleExtract` page components are reused as-is.

### 5. Sidebar Rendering

No changes needed -- the sidebar already renders sub-items with indentation when a group contains multiple items (added during Story Analysis work).

## Technical Details

- All new pages follow the established pattern: `useOutletContext<ReportContextValue>()`, `SectionHeader`, `AgentNarrativePanel`, `WeightedParameterList`
- 8 new files created, 3 existing pages reused at new paths, 2 overview pages simplified
- Navigation uses relative routing consistent with existing architecture
- Legacy route redirects for `/dialogue`, `/theme`, `/visual`, `/emotional` already point to `/craft` -- no changes needed
