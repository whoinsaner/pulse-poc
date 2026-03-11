

## Budget Analysis Simulation Layer

### Current State
The existing `BudgetEstimator` component is **static and read-only**. It uses hardcoded cost constants (e.g., $50K/day for lead actors, $15K/day for exterior locations) and produces a single fixed estimate from scene/character data. There is no way for users to explore "what if" scenarios.

### What We Would Build

A new `BudgetSimulator` component that wraps and extends the existing estimator with three interactive capabilities:

**1. Budget Tier Presets (dropdown)**
Users select a target budget tier — Micro (<$500K), Low ($500K–$2M), Mid ($2M–$20M), High ($20M–$100M). This scales all cost constants proportionally and shows how the script fits (or doesn't) within each tier, highlighting which categories blow the budget.

**2. Interactive Cost Sliders**
Each of the 5 budget categories (Locations, VFX, Cast, Crew, Post) gets a slider that acts as a multiplier (0.5x–3x). Adjusting a slider immediately recalculates totals and re-renders the breakdown. This lets producers model scenarios like "what if we use practical effects instead of CGI" (VFX slider → 0.5x) or "what if we cast A-list talent" (Cast slider → 2.5x).

**3. Scene Substitution Panel**
A compact table of the top 5 most expensive scenes (by combined location + VFX cost). Each row shows a toggle to "simplify" the scene — converting its location type down one tier (special → ext, ext → int) and its VFX level down one tier. The budget updates in real-time, showing savings per scene.

### Technical Approach

**File: `src/components/report/BudgetSimulator.tsx`** (new)
- Wraps existing `estimateBudget()` logic but accepts `costMultipliers: Record<string, number>` and `sceneOverrides: Record<string, SceneOverride>`
- Uses `useState` for slider values and scene toggles
- Renders a comparison bar: Original Estimate vs Simulated Estimate
- Uses existing shadcn Slider, Select, Switch components

**File: `src/components/report/BudgetEstimator.tsx`** (refactor)
- Extract `estimateBudget()` and `analyzeScene()` into a shared `budgetEngine.ts` utility
- Add optional `costMultipliers` parameter to `estimateBudget()`

**File: `src/lib/budgetEngine.ts`** (new)
- Pure functions: `estimateBudget()`, `analyzeScene()`, `simulateBudget()`
- `simulateBudget()` accepts overrides and returns both original and simulated results for delta comparison

**File: `src/pages/report/ReportInsights.tsx`** (update)
- Replace `<BudgetEstimator>` with `<BudgetSimulator>` which internally renders the estimator plus the simulation controls

### UI Layout

```text
┌─────────────────────────────────────────────┐
│  Budget Simulation                          │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ Tier Preset  │  │ Original: $4.2M      │  │
│  │ [Mid Budget] │  │ Simulated: $2.8M ▼33%│  │
│  └─────────────┘  └──────────────────────┘  │
│                                             │
│  Category Multipliers                       │
│  Locations   ────●──────── 0.7x   -$180K   │
│  VFX         ──────●────── 0.5x   -$800K   │
│  Cast        ────────●──── 1.0x    $0       │
│  Crew        ────────●──── 1.0x    $0       │
│  Post        ────────●──── 1.0x    $0       │
│                                             │
│  Expensive Scenes                           │
│  #12 EXT. ROOFTOP CHASE  $85K  [Simplify]  │
│  #34 UNDERWATER CAVE     $60K  [Simplify]  │
│  #7  EXT. STADIUM        $55K  [Simplify]  │
└─────────────────────────────────────────────┘
```

### No Database Changes Required
This is entirely client-side — all simulation runs against already-loaded scene and character data from the report context. No new tables, edge functions, or API calls needed.

