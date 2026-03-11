import { useState, useMemo, useCallback } from 'react';
import { SceneData, CharacterData } from '@/types/database';
import { cn } from '@/lib/utils';
import {
  estimateBudget,
  simplifyScene,
  formatCurrency,
  DEFAULT_MULTIPLIERS,
  BUDGET_TIER_PRESETS,
  CostMultipliers,
  SceneOverride,
} from '@/lib/budgetEngine';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  MapPin,
  Users,
  Wand2,
  Camera,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowDown,
  ArrowUp,
  Minus,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';

interface BudgetSimulatorProps {
  scenes: SceneData[];
  characters: CharacterData[];
  pageCount?: number;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  locations: MapPin,
  vfx: Wand2,
  cast: Users,
  crew: Camera,
  post: Sparkles,
};

const CATEGORY_LABELS: Record<string, string> = {
  locations: 'Locations & Sets',
  vfx: 'Visual Effects',
  cast: 'Cast & Talent',
  crew: 'Crew & Equipment',
  post: 'Post Production',
};

const getRiskColor = (level: 'low' | 'medium' | 'high') => {
  switch (level) {
    case 'low': return 'text-success bg-success/10';
    case 'medium': return 'text-warning bg-warning/10';
    case 'high': return 'text-destructive bg-destructive/10';
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'micro': return 'text-chart-3';
    case 'low': return 'text-chart-2';
    case 'medium': return 'text-chart-4';
    case 'high': return 'text-warning';
    case 'blockbuster': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
};

const getTierLabel = (tier: string) => {
  switch (tier) {
    case 'micro': return 'Micro Budget';
    case 'low': return 'Low Budget';
    case 'medium': return 'Medium Budget';
    case 'high': return 'High Budget';
    case 'blockbuster': return 'Blockbuster';
    default: return tier;
  }
};

export function BudgetSimulator({ scenes, characters, pageCount = 100 }: BudgetSimulatorProps) {
  const [multipliers, setMultipliers] = useState<CostMultipliers>({ ...DEFAULT_MULTIPLIERS });
  const [sceneOverrides, setSceneOverrides] = useState<Record<number, SceneOverride>>({});
  const [selectedTier, setSelectedTier] = useState<string>('custom');

  // Original (baseline) budget
  const originalBudget = useMemo(
    () => estimateBudget(scenes, characters, pageCount),
    [scenes, characters, pageCount]
  );

  // Simulated budget with multipliers + overrides
  const simBudget = useMemo(
    () => estimateBudget(scenes, characters, pageCount, multipliers, sceneOverrides),
    [scenes, characters, pageCount, multipliers, sceneOverrides]
  );

  const delta = simBudget.total - originalBudget.total;
  const deltaPercent = originalBudget.total > 0 ? (delta / originalBudget.total) * 100 : 0;

  // Top 5 most expensive scenes from baseline
  const expensiveScenes = useMemo(
    () => [...originalBudget.sceneAnalyses].sort((a, b) => b.sceneCost - a.sceneCost).slice(0, 5),
    [originalBudget.sceneAnalyses]
  );

  const handleTierChange = useCallback((tier: string) => {
    setSelectedTier(tier);
    if (tier === 'custom') {
      setMultipliers({ ...DEFAULT_MULTIPLIERS });
      return;
    }
    const preset = BUDGET_TIER_PRESETS[tier];
    if (preset) {
      const m = preset.globalMultiplier;
      setMultipliers({ locations: m, vfx: m, cast: m, crew: m, post: m });
    }
  }, []);

  const handleMultiplier = useCallback((key: keyof CostMultipliers, value: number) => {
    setSelectedTier('custom');
    setMultipliers(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSceneToggle = useCallback((sceneIndex: number, simplified: boolean) => {
    setSceneOverrides(prev => {
      const next = { ...prev };
      if (simplified) {
        const analysis = originalBudget.sceneAnalyses[sceneIndex];
        if (analysis) next[sceneIndex] = simplifyScene(analysis);
      } else {
        delete next[sceneIndex];
      }
      return next;
    });
  }, [originalBudget.sceneAnalyses]);

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-muted/30 border border-border">
        <DollarSign className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Budget Data Available</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Budget simulation requires scene and character data. Run a full analysis first.
        </p>
      </div>
    );
  }

  const shootingDays = Math.ceil(pageCount / 5);
  const uniqueLocations = new Set(scenes.map(s => s.location).filter(Boolean)).size;

  return (
    <div className="space-y-8">
      {/* Hero comparison */}
      <div className="p-6 lg:p-8 rounded-2xl bg-gradient-to-r from-chart-3/10 via-transparent to-chart-4/10 border border-chart-3/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Select value={selectedTier} onValueChange={handleTierChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Budget Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  {Object.entries(BUDGET_TIER_PRESETS).map(([key, p]) => (
                    <SelectItem key={key} value={key}>
                      {p.label} ({p.range})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Original</p>
                <p className="text-2xl lg:text-3xl font-bold text-muted-foreground/70">
                  {formatCurrency(originalBudget.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Simulated</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl lg:text-3xl font-bold gradient-text">
                    {formatCurrency(simBudget.total)}
                  </p>
                  {delta !== 0 && (
                    <span className={cn(
                      'text-sm font-medium flex items-center gap-0.5',
                      delta < 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {delta < 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                      {Math.abs(deltaPercent).toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className={cn('text-sm font-medium mt-1', getTierColor(simBudget.budgetTier))}>
                  {getTierLabel(simBudget.budgetTier)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            <div className="text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-chart-2" />
              <p className="text-xl font-bold">{shootingDays}</p>
              <p className="text-xs text-muted-foreground">Shoot Days</p>
            </div>
            <div className="text-center">
              <MapPin className="h-5 w-5 mx-auto mb-1 text-chart-4" />
              <p className="text-xl font-bold">{uniqueLocations}</p>
              <p className="text-xs text-muted-foreground">Locations</p>
            </div>
            <div className="text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-chart-5" />
              <p className="text-xl font-bold">{characters.length}</p>
              <p className="text-xs text-muted-foreground">Cast</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: sliders + categories left, scenes right */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Multiplier sliders + Category breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Multiplier sliders */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Category Multipliers</h4>
            </div>
            <div className="space-y-5">
              {(Object.keys(CATEGORY_LABELS) as Array<keyof CostMultipliers>).map((key) => {
                const Icon = CATEGORY_ICONS[key];
                const originalCat = originalBudget.categories.find(c => c.key === key);
                const simCat = simBudget.categories.find(c => c.key === key);
                const catDelta = (simCat?.estimate ?? 0) - (originalCat?.estimate ?? 0);

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{CATEGORY_LABELS[key]}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-mono text-xs w-10 text-right">
                          {multipliers[key].toFixed(1)}x
                        </span>
                        <span className={cn(
                          'text-xs font-medium w-16 text-right',
                          catDelta < 0 ? 'text-success' : catDelta > 0 ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {catDelta === 0 ? (
                            <span className="flex items-center justify-end gap-0.5"><Minus className="h-3 w-3" /> $0</span>
                          ) : (
                            `${catDelta > 0 ? '+' : ''}${formatCurrency(Math.abs(catDelta))}`
                          )}
                        </span>
                      </div>
                    </div>
                    <Slider
                      value={[multipliers[key] * 100]}
                      onValueChange={([v]) => handleMultiplier(key, v / 100)}
                      min={50}
                      max={300}
                      step={10}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown cards */}
          <div className="space-y-4">
            {simBudget.categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.key];
              const percentage = simBudget.total > 0 ? (category.estimate / simBudget.total) * 100 : 0;

              return (
                <div key={category.key} className="p-5 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{category.name}</h4>
                        <span className={cn('text-xs px-2 py-0.5 rounded', getRiskColor(category.riskLevel))}>
                          {category.riskLevel} risk
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(category.estimate)}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}% of total</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3 transition-all duration-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {category.items.filter(item => item.count > 0).map((item) => (
                      <div key={item.name} className="flex justify-between text-xs p-1.5 rounded bg-muted/30">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span>{item.count} × ${item.cost}K</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Expensive scenes + risk factors */}
        <div className="space-y-6">
          {/* Scene substitution panel */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-chart-4" />
              <h4 className="font-semibold">Expensive Scenes</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Toggle to simplify — downgrades location tier and VFX level
            </p>
            <div className="space-y-3">
              {expensiveScenes.map((sa) => {
                const isSimplified = !!sceneOverrides[sa.sceneIndex];
                const originalCost = sa.sceneCost;
                const simAnalysis = simBudget.sceneAnalyses[sa.sceneIndex];
                const simCost = simAnalysis?.sceneCost ?? originalCost;
                const savings = originalCost - simCost;

                return (
                  <div
                    key={sa.sceneIndex}
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      isSimplified ? 'bg-success/5 border-success/20' : 'bg-muted/20 border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          #{sa.sceneIndex + 1} {sa.heading}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {sa.locationType.toUpperCase()} • {sa.vfxLevel === 'none' ? 'No VFX' : `${sa.vfxLevel} VFX`}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={isSimplified}
                        onCheckedChange={(checked) => handleSceneToggle(sa.sceneIndex, checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">${originalCost}K</span>
                      {isSimplified && savings > 0 && (
                        <span className="text-success font-medium flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" />
                          −${savings}K saved
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk factors */}
          {simBudget.riskFactors.length > 0 && (
            <div className="p-6 rounded-xl bg-warning/5 border border-warning/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h4 className="font-semibold">Risk Factors</h4>
              </div>
              <ul className="space-y-2">
                {simBudget.riskFactors.map((risk, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-warning">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cost drivers */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Cost Drivers</h4>
            </div>
            <div className="space-y-3">
              {simBudget.categories
                .sort((a, b) => b.estimate - a.estimate)
                .slice(0, 3)
                .map((cat, i) => {
                  const Icon = CATEGORY_ICONS[cat.key];
                  return (
                    <div key={cat.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(cat.estimate)}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Breakdown chart */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h4 className="font-semibold mb-4">Budget Breakdown</h4>
            <div className="space-y-2">
              {simBudget.categories.map((cat) => {
                const percentage = simBudget.total > 0 ? (cat.estimate / simBudget.total) * 100 : 0;
                return (
                  <div key={cat.key} className="flex items-center gap-2">
                    <div
                      className="h-3 rounded-full bg-primary"
                      style={{ width: `${percentage}%`, minWidth: '8px' }}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {cat.name} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">
              * Estimates are based on industry averages and scene analysis.
              Adjust multipliers to model different production scenarios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
