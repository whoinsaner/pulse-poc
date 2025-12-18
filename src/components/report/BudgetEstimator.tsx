import { useMemo } from 'react';
import { SceneData, CharacterData } from '@/types/database';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  MapPin, 
  Users, 
  Wand2, 
  Camera, 
  Clock,
  Building2,
  Mountain,
  Car,
  Sparkles,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface BudgetEstimatorProps {
  scenes: SceneData[];
  characters: CharacterData[];
  pageCount?: number;
}

interface BudgetCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  estimate: number;
  items: { name: string; cost: number; count: number }[];
  riskLevel: 'low' | 'medium' | 'high';
}

// Cost estimation constants (in thousands USD)
const COSTS = {
  // Location costs per day
  locationInt: 5, // Interior studio
  locationExt: 15, // Exterior location
  locationIntExt: 20, // Mixed
  specialLocation: 50, // Special (underwater, aerial, etc.)
  
  // VFX costs
  vfxMinor: 10, // Minor VFX per scene
  vfxMajor: 100, // Major VFX per scene
  vfxHeavy: 500, // Heavy VFX (creatures, destruction)
  
  // Cast costs per day
  leadActor: 50,
  supportingActor: 15,
  dayPlayer: 2,
  
  // Crew and equipment
  crewPerDay: 25,
  equipmentPerDay: 10,
  
  // Post production
  postPerPage: 5,
  musicPerMinute: 2,
};

function analyzeScene(scene: SceneData): {
  locationType: 'int' | 'ext' | 'int_ext' | 'special';
  vfxLevel: 'none' | 'minor' | 'major' | 'heavy';
  complexity: 'simple' | 'moderate' | 'complex';
} {
  const heading = (scene.heading || '').toLowerCase();
  const description = (scene.description || '').toLowerCase();
  const combined = `${heading} ${description}`;

  // Determine location type
  let locationType: 'int' | 'ext' | 'int_ext' | 'special' = 'int';
  if (combined.includes('underwater') || combined.includes('aerial') || combined.includes('space')) {
    locationType = 'special';
  } else if (scene.intExt === 'INT/EXT' || scene.intExt === 'I/E') {
    locationType = 'int_ext';
  } else if (scene.intExt === 'EXT') {
    locationType = 'ext';
  }

  // Determine VFX level
  let vfxLevel: 'none' | 'minor' | 'major' | 'heavy' = 'none';
  const vfxHeavyKeywords = ['explosion', 'creature', 'monster', 'transform', 'magic', 'destroy', 'collapse'];
  const vfxMajorKeywords = ['fire', 'flood', 'crash', 'chase', 'fight', 'battle', 'storm'];
  const vfxMinorKeywords = ['screen', 'phone', 'tv', 'computer', 'window', 'car', 'drive'];

  if (vfxHeavyKeywords.some(k => combined.includes(k))) {
    vfxLevel = 'heavy';
  } else if (vfxMajorKeywords.some(k => combined.includes(k))) {
    vfxLevel = 'major';
  } else if (vfxMinorKeywords.some(k => combined.includes(k))) {
    vfxLevel = 'minor';
  }

  // Determine complexity
  const complexKeywords = ['crowd', 'party', 'stadium', 'concert', 'war', 'battle'];
  const moderateKeywords = ['restaurant', 'bar', 'office', 'meeting', 'group'];
  
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (complexKeywords.some(k => combined.includes(k))) {
    complexity = 'complex';
  } else if (moderateKeywords.some(k => combined.includes(k))) {
    complexity = 'moderate';
  }

  return { locationType, vfxLevel, complexity };
}

function estimateBudget(scenes: SceneData[], characters: CharacterData[], pageCount: number = 100): {
  categories: BudgetCategory[];
  total: number;
  riskFactors: string[];
  budgetTier: 'micro' | 'low' | 'medium' | 'high' | 'blockbuster';
} {
  // Analyze all scenes
  const sceneAnalysis = scenes.map(analyzeScene);
  
  // Count locations
  const uniqueLocations = new Set(scenes.map(s => s.location).filter(Boolean));
  const intScenes = sceneAnalysis.filter(s => s.locationType === 'int').length;
  const extScenes = sceneAnalysis.filter(s => s.locationType === 'ext').length;
  const intExtScenes = sceneAnalysis.filter(s => s.locationType === 'int_ext').length;
  const specialScenes = sceneAnalysis.filter(s => s.locationType === 'special').length;

  // Count VFX
  const vfxMinorScenes = sceneAnalysis.filter(s => s.vfxLevel === 'minor').length;
  const vfxMajorScenes = sceneAnalysis.filter(s => s.vfxLevel === 'major').length;
  const vfxHeavyScenes = sceneAnalysis.filter(s => s.vfxLevel === 'heavy').length;

  // Categorize characters
  const sortedChars = [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount);
  const leadChars = sortedChars.slice(0, 3);
  const supportingChars = sortedChars.slice(3, 10);
  const dayPlayers = sortedChars.slice(10);

  // Estimate shooting days (1 page = ~1 minute = ~5 pages per day)
  const shootingDays = Math.ceil(pageCount / 5);

  // Calculate categories
  const categories: BudgetCategory[] = [];

  // Locations
  const locationCost = 
    (intScenes * COSTS.locationInt) +
    (extScenes * COSTS.locationExt) +
    (intExtScenes * COSTS.locationIntExt) +
    (specialScenes * COSTS.specialLocation);
  
  categories.push({
    name: 'Locations & Sets',
    icon: MapPin,
    estimate: locationCost,
    items: [
      { name: 'Interior Scenes', cost: COSTS.locationInt, count: intScenes },
      { name: 'Exterior Scenes', cost: COSTS.locationExt, count: extScenes },
      { name: 'Mixed Int/Ext', cost: COSTS.locationIntExt, count: intExtScenes },
      { name: 'Special Locations', cost: COSTS.specialLocation, count: specialScenes },
    ],
    riskLevel: specialScenes > 3 ? 'high' : extScenes > 20 ? 'medium' : 'low',
  });

  // VFX
  const vfxCost = 
    (vfxMinorScenes * COSTS.vfxMinor) +
    (vfxMajorScenes * COSTS.vfxMajor) +
    (vfxHeavyScenes * COSTS.vfxHeavy);
  
  categories.push({
    name: 'Visual Effects',
    icon: Wand2,
    estimate: vfxCost,
    items: [
      { name: 'Minor VFX', cost: COSTS.vfxMinor, count: vfxMinorScenes },
      { name: 'Major VFX', cost: COSTS.vfxMajor, count: vfxMajorScenes },
      { name: 'Heavy VFX', cost: COSTS.vfxHeavy, count: vfxHeavyScenes },
    ],
    riskLevel: vfxHeavyScenes > 5 ? 'high' : vfxMajorScenes > 10 ? 'medium' : 'low',
  });

  // Cast
  const castCost = 
    (leadChars.length * COSTS.leadActor * shootingDays * 0.8) +
    (supportingChars.length * COSTS.supportingActor * shootingDays * 0.3) +
    (dayPlayers.length * COSTS.dayPlayer * 3);
  
  categories.push({
    name: 'Cast & Talent',
    icon: Users,
    estimate: castCost,
    items: [
      { name: 'Lead Actors', cost: COSTS.leadActor * shootingDays, count: leadChars.length },
      { name: 'Supporting Cast', cost: COSTS.supportingActor * shootingDays * 0.3, count: supportingChars.length },
      { name: 'Day Players', cost: COSTS.dayPlayer * 3, count: dayPlayers.length },
    ],
    riskLevel: leadChars.length > 5 ? 'high' : 'low',
  });

  // Crew & Equipment
  const crewCost = shootingDays * (COSTS.crewPerDay + COSTS.equipmentPerDay);
  categories.push({
    name: 'Crew & Equipment',
    icon: Camera,
    estimate: crewCost,
    items: [
      { name: 'Crew', cost: COSTS.crewPerDay, count: shootingDays },
      { name: 'Equipment', cost: COSTS.equipmentPerDay, count: shootingDays },
    ],
    riskLevel: shootingDays > 40 ? 'medium' : 'low',
  });

  // Post Production
  const postCost = (pageCount * COSTS.postPerPage) + (pageCount * COSTS.musicPerMinute);
  categories.push({
    name: 'Post Production',
    icon: Sparkles,
    estimate: postCost,
    items: [
      { name: 'Editing & Color', cost: COSTS.postPerPage, count: pageCount },
      { name: 'Music & Sound', cost: COSTS.musicPerMinute, count: pageCount },
    ],
    riskLevel: 'low',
  });

  // Calculate total
  const total = categories.reduce((sum, cat) => sum + cat.estimate, 0);

  // Determine risk factors
  const riskFactors: string[] = [];
  if (specialScenes > 3) riskFactors.push('Multiple special/difficult locations');
  if (vfxHeavyScenes > 5) riskFactors.push('Heavy VFX requirements');
  if (extScenes > scenes.length * 0.6) riskFactors.push('High exterior scene ratio (weather dependent)');
  if (characters.length > 30) riskFactors.push('Large cast coordination');
  if (uniqueLocations.size > 15) riskFactors.push('Many unique locations');

  // Determine budget tier
  let budgetTier: 'micro' | 'low' | 'medium' | 'high' | 'blockbuster' = 'medium';
  if (total < 500) budgetTier = 'micro';
  else if (total < 2000) budgetTier = 'low';
  else if (total < 20000) budgetTier = 'medium';
  else if (total < 100000) budgetTier = 'high';
  else budgetTier = 'blockbuster';

  return { categories, total, riskFactors, budgetTier };
}

export function BudgetEstimator({ scenes, characters, pageCount = 100 }: BudgetEstimatorProps) {
  const budget = useMemo(() => estimateBudget(scenes, characters, pageCount), [scenes, characters, pageCount]);

  if (scenes.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}M`;
    }
    return `$${amount}K`;
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

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-success bg-success/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'high': return 'text-destructive bg-destructive/10';
    }
  };

  return (
    <section className="min-h-screen py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-3/10 text-chart-3 text-sm font-medium">
            Financial Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Budget Estimate
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Production cost analysis based on {scenes.length} scenes and {characters.length} characters
          </p>
        </div>

        {/* Total estimate hero */}
        <div className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-chart-3/10 via-transparent to-chart-4/10 border border-chart-3/30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Estimated Budget</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold gradient-text">{formatCurrency(budget.total)}</span>
              </div>
              <p className={cn('text-lg font-medium mt-2', getTierColor(budget.budgetTier))}>
                {getTierLabel(budget.budgetTier)}
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-chart-2" />
                <p className="text-2xl font-bold">{Math.ceil((pageCount || 100) / 5)}</p>
                <p className="text-sm text-muted-foreground">Shoot Days</p>
              </div>
              <div className="text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-chart-4" />
                <p className="text-2xl font-bold">{new Set(scenes.map(s => s.location).filter(Boolean)).size}</p>
                <p className="text-sm text-muted-foreground">Locations</p>
              </div>
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-chart-5" />
                <p className="text-2xl font-bold">{characters.length}</p>
                <p className="text-sm text-muted-foreground">Cast</p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget breakdown */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {budget.categories.map((category) => {
              const Icon = category.icon;
              const percentage = (category.estimate / budget.total) * 100;
              
              return (
                <div key={category.name} className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{category.name}</h4>
                        <span className={cn('text-xs px-2 py-0.5 rounded', getRiskColor(category.riskLevel))}>
                          {category.riskLevel} risk
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatCurrency(category.estimate)}</p>
                      <p className="text-sm text-muted-foreground">{percentage.toFixed(0)}% of total</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-primary to-chart-3 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Line items */}
                  <div className="grid sm:grid-cols-2 gap-2">
                    {category.items.filter(item => item.count > 0).map((item) => (
                      <div key={item.name} className="flex justify-between text-sm p-2 rounded bg-muted/30">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span>{item.count} × ${item.cost}K</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Risk factors and summary */}
          <div className="space-y-6">
            {budget.riskFactors.length > 0 && (
              <div className="p-6 rounded-xl bg-warning/5 border border-warning/20">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <h4 className="font-semibold">Risk Factors</h4>
                </div>
                <ul className="space-y-2">
                  {budget.riskFactors.map((risk, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-warning">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Cost Drivers</h4>
              </div>
              <div className="space-y-3">
                {budget.categories
                  .sort((a, b) => b.estimate - a.estimate)
                  .slice(0, 3)
                  .map((cat, i) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.name} className="flex items-center justify-between">
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

            <div className="p-6 rounded-xl bg-card border border-border">
              <h4 className="font-semibold mb-4">Budget Breakdown</h4>
              <div className="space-y-2">
                {budget.categories.map((cat) => {
                  const percentage = (cat.estimate / budget.total) * 100;
                  return (
                    <div key={cat.name} className="flex items-center gap-2">
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
                Actual costs may vary based on location, talent, and production choices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
