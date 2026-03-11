import { SceneData, CharacterData } from '@/types/database';

// Cost estimation constants (in thousands USD)
export const COSTS = {
  locationInt: 5,
  locationExt: 15,
  locationIntExt: 20,
  specialLocation: 50,
  vfxMinor: 10,
  vfxMajor: 100,
  vfxHeavy: 500,
  leadActor: 50,
  supportingActor: 15,
  dayPlayer: 2,
  crewPerDay: 25,
  equipmentPerDay: 10,
  postPerPage: 5,
  musicPerMinute: 2,
};

export type LocationType = 'int' | 'ext' | 'int_ext' | 'special';
export type VfxLevel = 'none' | 'minor' | 'major' | 'heavy';
export type Complexity = 'simple' | 'moderate' | 'complex';
export type BudgetTier = 'micro' | 'low' | 'medium' | 'high' | 'blockbuster';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface SceneAnalysis {
  sceneIndex: number;
  heading: string;
  locationType: LocationType;
  vfxLevel: VfxLevel;
  complexity: Complexity;
  sceneCost: number;
}

export interface BudgetCategoryData {
  name: string;
  key: 'locations' | 'vfx' | 'cast' | 'crew' | 'post';
  estimate: number;
  items: { name: string; cost: number; count: number }[];
  riskLevel: RiskLevel;
}

export interface BudgetResult {
  categories: BudgetCategoryData[];
  total: number;
  riskFactors: string[];
  budgetTier: BudgetTier;
  sceneAnalyses: SceneAnalysis[];
}

export interface CostMultipliers {
  locations: number;
  vfx: number;
  cast: number;
  crew: number;
  post: number;
}

export interface SceneOverride {
  locationType?: LocationType;
  vfxLevel?: VfxLevel;
}

export const DEFAULT_MULTIPLIERS: CostMultipliers = {
  locations: 1,
  vfx: 1,
  cast: 1,
  crew: 1,
  post: 1,
};

export const BUDGET_TIER_PRESETS: Record<string, { label: string; range: string; globalMultiplier: number }> = {
  micro: { label: 'Micro Budget', range: '< $500K', globalMultiplier: 0.3 },
  low: { label: 'Low Budget', range: '$500K – $2M', globalMultiplier: 0.6 },
  mid: { label: 'Mid Budget', range: '$2M – $20M', globalMultiplier: 1.0 },
  high: { label: 'High Budget', range: '$20M – $100M', globalMultiplier: 2.5 },
};

const LOCATION_COST_MAP: Record<LocationType, number> = {
  int: COSTS.locationInt,
  ext: COSTS.locationExt,
  int_ext: COSTS.locationIntExt,
  special: COSTS.specialLocation,
};

const VFX_COST_MAP: Record<VfxLevel, number> = {
  none: 0,
  minor: COSTS.vfxMinor,
  major: COSTS.vfxMajor,
  heavy: COSTS.vfxHeavy,
};

export function analyzeScene(scene: SceneData, index: number): SceneAnalysis {
  const heading = (scene.heading || '').toLowerCase();
  const description = (scene.description || '').toLowerCase();
  const combined = `${heading} ${description}`;

  let locationType: LocationType = 'int';
  if (combined.includes('underwater') || combined.includes('aerial') || combined.includes('space')) {
    locationType = 'special';
  } else if (scene.intExt === 'INT/EXT' || scene.intExt === 'I/E') {
    locationType = 'int_ext';
  } else if (scene.intExt === 'EXT') {
    locationType = 'ext';
  }

  let vfxLevel: VfxLevel = 'none';
  const vfxHeavyKeywords = ['explosion', 'creature', 'monster', 'transform', 'magic', 'destroy', 'collapse'];
  const vfxMajorKeywords = ['fire', 'flood', 'crash', 'chase', 'fight', 'battle', 'storm'];
  const vfxMinorKeywords = ['screen', 'phone', 'tv', 'computer', 'window', 'car', 'drive'];

  if (vfxHeavyKeywords.some(k => combined.includes(k))) vfxLevel = 'heavy';
  else if (vfxMajorKeywords.some(k => combined.includes(k))) vfxLevel = 'major';
  else if (vfxMinorKeywords.some(k => combined.includes(k))) vfxLevel = 'minor';

  const complexKeywords = ['crowd', 'party', 'stadium', 'concert', 'war', 'battle'];
  const moderateKeywords = ['restaurant', 'bar', 'office', 'meeting', 'group'];
  let complexity: Complexity = 'simple';
  if (complexKeywords.some(k => combined.includes(k))) complexity = 'complex';
  else if (moderateKeywords.some(k => combined.includes(k))) complexity = 'moderate';

  const sceneCost = LOCATION_COST_MAP[locationType] + VFX_COST_MAP[vfxLevel];

  return { sceneIndex: index, heading: scene.heading || `Scene ${index + 1}`, locationType, vfxLevel, complexity, sceneCost };
}

export function estimateBudget(
  scenes: SceneData[],
  characters: CharacterData[],
  pageCount: number = 100,
  multipliers: CostMultipliers = DEFAULT_MULTIPLIERS,
  sceneOverrides: Record<number, SceneOverride> = {}
): BudgetResult {
  const sceneAnalyses = scenes.map((s, i) => {
    const base = analyzeScene(s, i);
    const override = sceneOverrides[i];
    if (override) {
      if (override.locationType) base.locationType = override.locationType;
      if (override.vfxLevel) base.vfxLevel = override.vfxLevel;
      base.sceneCost = LOCATION_COST_MAP[base.locationType] + VFX_COST_MAP[base.vfxLevel];
    }
    return base;
  });

  const intScenes = sceneAnalyses.filter(s => s.locationType === 'int').length;
  const extScenes = sceneAnalyses.filter(s => s.locationType === 'ext').length;
  const intExtScenes = sceneAnalyses.filter(s => s.locationType === 'int_ext').length;
  const specialScenes = sceneAnalyses.filter(s => s.locationType === 'special').length;

  const vfxMinorScenes = sceneAnalyses.filter(s => s.vfxLevel === 'minor').length;
  const vfxMajorScenes = sceneAnalyses.filter(s => s.vfxLevel === 'major').length;
  const vfxHeavyScenes = sceneAnalyses.filter(s => s.vfxLevel === 'heavy').length;

  const sortedChars = [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount);
  const leadChars = sortedChars.slice(0, 3);
  const supportingChars = sortedChars.slice(3, 10);
  const dayPlayers = sortedChars.slice(10);
  const shootingDays = Math.ceil(pageCount / 5);

  const uniqueLocations = new Set(scenes.map(s => s.location).filter(Boolean));

  const categories: BudgetCategoryData[] = [];

  // Locations
  const locationCost = ((intScenes * COSTS.locationInt) + (extScenes * COSTS.locationExt) + (intExtScenes * COSTS.locationIntExt) + (specialScenes * COSTS.specialLocation)) * multipliers.locations;
  categories.push({
    name: 'Locations & Sets', key: 'locations', estimate: locationCost,
    items: [
      { name: 'Interior Scenes', cost: COSTS.locationInt, count: intScenes },
      { name: 'Exterior Scenes', cost: COSTS.locationExt, count: extScenes },
      { name: 'Mixed Int/Ext', cost: COSTS.locationIntExt, count: intExtScenes },
      { name: 'Special Locations', cost: COSTS.specialLocation, count: specialScenes },
    ],
    riskLevel: specialScenes > 3 ? 'high' : extScenes > 20 ? 'medium' : 'low',
  });

  // VFX
  const vfxCost = ((vfxMinorScenes * COSTS.vfxMinor) + (vfxMajorScenes * COSTS.vfxMajor) + (vfxHeavyScenes * COSTS.vfxHeavy)) * multipliers.vfx;
  categories.push({
    name: 'Visual Effects', key: 'vfx', estimate: vfxCost,
    items: [
      { name: 'Minor VFX', cost: COSTS.vfxMinor, count: vfxMinorScenes },
      { name: 'Major VFX', cost: COSTS.vfxMajor, count: vfxMajorScenes },
      { name: 'Heavy VFX', cost: COSTS.vfxHeavy, count: vfxHeavyScenes },
    ],
    riskLevel: vfxHeavyScenes > 5 ? 'high' : vfxMajorScenes > 10 ? 'medium' : 'low',
  });

  // Cast
  const castCost = ((leadChars.length * COSTS.leadActor * shootingDays * 0.8) + (supportingChars.length * COSTS.supportingActor * shootingDays * 0.3) + (dayPlayers.length * COSTS.dayPlayer * 3)) * multipliers.cast;
  categories.push({
    name: 'Cast & Talent', key: 'cast', estimate: castCost,
    items: [
      { name: 'Lead Actors', cost: COSTS.leadActor * shootingDays, count: leadChars.length },
      { name: 'Supporting Cast', cost: COSTS.supportingActor * shootingDays * 0.3, count: supportingChars.length },
      { name: 'Day Players', cost: COSTS.dayPlayer * 3, count: dayPlayers.length },
    ],
    riskLevel: leadChars.length > 5 ? 'high' : 'low',
  });

  // Crew
  const crewCost = (shootingDays * (COSTS.crewPerDay + COSTS.equipmentPerDay)) * multipliers.crew;
  categories.push({
    name: 'Crew & Equipment', key: 'crew', estimate: crewCost,
    items: [
      { name: 'Crew', cost: COSTS.crewPerDay, count: shootingDays },
      { name: 'Equipment', cost: COSTS.equipmentPerDay, count: shootingDays },
    ],
    riskLevel: shootingDays > 40 ? 'medium' : 'low',
  });

  // Post
  const postCost = ((pageCount * COSTS.postPerPage) + (pageCount * COSTS.musicPerMinute)) * multipliers.post;
  categories.push({
    name: 'Post Production', key: 'post', estimate: postCost,
    items: [
      { name: 'Editing & Color', cost: COSTS.postPerPage, count: pageCount },
      { name: 'Music & Sound', cost: COSTS.musicPerMinute, count: pageCount },
    ],
    riskLevel: 'low',
  });

  const total = categories.reduce((sum, cat) => sum + cat.estimate, 0);

  const riskFactors: string[] = [];
  if (specialScenes > 3) riskFactors.push('Multiple special/difficult locations');
  if (vfxHeavyScenes > 5) riskFactors.push('Heavy VFX requirements');
  if (extScenes > scenes.length * 0.6) riskFactors.push('High exterior scene ratio (weather dependent)');
  if (characters.length > 30) riskFactors.push('Large cast coordination');
  if (uniqueLocations.size > 15) riskFactors.push('Many unique locations');

  let budgetTier: BudgetTier = 'medium';
  if (total < 500) budgetTier = 'micro';
  else if (total < 2000) budgetTier = 'low';
  else if (total < 20000) budgetTier = 'medium';
  else if (total < 100000) budgetTier = 'high';
  else budgetTier = 'blockbuster';

  return { categories, total, riskFactors, budgetTier, sceneAnalyses };
}

export function simplifyScene(analysis: SceneAnalysis): SceneOverride {
  const locationDowngrade: Record<LocationType, LocationType> = {
    special: 'ext',
    int_ext: 'int',
    ext: 'int',
    int: 'int',
  };
  const vfxDowngrade: Record<VfxLevel, VfxLevel> = {
    heavy: 'major',
    major: 'minor',
    minor: 'none',
    none: 'none',
  };
  return {
    locationType: locationDowngrade[analysis.locationType],
    vfxLevel: vfxDowngrade[analysis.vfxLevel],
  };
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}M`;
  return `$${Math.round(amount)}K`;
}
