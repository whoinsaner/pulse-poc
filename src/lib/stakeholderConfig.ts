import { StakeholderLens } from '@/types/database';

// Maps stakeholders to the report nav sections they care about
export const STAKEHOLDER_NAV_SECTIONS: Record<StakeholderLens, string[]> = {
  studio_executive: [
    'snapshot', 'concept', 'market', 'production', 'audience', 'scorecard'
  ],
  producer: [
    'snapshot', 'structure', 'production', 'scenes', 'audience', 'scorecard'
  ],
  actor: [
    'snapshot', 'protagonist', 'antagonist', 'supporting', 'psychology', 'dialogue', 'emotional'
  ],
  director: [
    'snapshot', 'structure', 'visual', 'theme', 'emotional', 'scenes', 'comic'
  ],
  writer: [
    'snapshot', 'concept', 'structure', 'protagonist', 'antagonist', 'dialogue', 'theme', 'rewrite', 'scorecard'
  ],
  financier: [
    'snapshot', 'concept', 'market', 'production', 'audience', 'scorecard'
  ],
  ott_platform: [
    'snapshot', 'concept', 'plot', 'supporting', 'emotional', 'audience', 'market'
  ],
  theatrical: [
    'snapshot', 'concept', 'visual', 'emotional', 'market', 'production', 'audience'
  ],
};

// Maps stakeholders to the parameter categories they care about
export const STAKEHOLDER_CATEGORIES: Record<StakeholderLens, string[]> = {
  studio_executive: [
    'Concept & Hook', 'Market', 'Execution', 'Structure'
  ],
  producer: [
    'Structure', 'Execution', 'Conflict', 'World & Logic'
  ],
  actor: [
    'Character', 'Dialogue', 'Emotional Arc', 'Conflict'
  ],
  director: [
    'Structure', 'Theme', 'Emotional Arc', 'World & Logic', 'Comic Visuals'
  ],
  writer: [
    'Concept & Hook', 'Structure', 'Character', 'Dialogue', 'Theme', 'Conflict'
  ],
  financier: [
    'Concept & Hook', 'Market', 'Execution'
  ],
  ott_platform: [
    'Concept & Hook', 'Character', 'Emotional Arc', 'Market'
  ],
  theatrical: [
    'Concept & Hook', 'Emotional Arc', 'Market', 'Execution'
  ],
};

// Maps stakeholders to the agents that should run for their analysis
export const STAKEHOLDER_AGENTS: Record<StakeholderLens, string[]> = {
  studio_executive: [
    'ConceptAgent', 'MarketAgent', 'ExecutionAgent', 'StructureAgent',
    'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  producer: [
    'StructureAgent', 'ExecutionAgent', 'ConflictAgent', 'WorldLogicAgent',
    'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  actor: [
    'CharacterAgent', 'DialogueAgent', 'EmotionalArcAgent', 'ConflictAgent',
    'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  director: [
    'StructureAgent', 'ThemeAgent', 'EmotionalArcAgent', 'WorldLogicAgent',
    'ComicVisualAgent', 'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  writer: [
    'ConceptAgent', 'StructureAgent', 'CharacterAgent', 'DialogueAgent', 
    'ThemeAgent', 'ConflictAgent', 'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  financier: [
    'ConceptAgent', 'MarketAgent', 'ExecutionAgent',
    'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  ott_platform: [
    'ConceptAgent', 'CharacterAgent', 'EmotionalArcAgent', 'MarketAgent',
    'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  theatrical: [
    'ConceptAgent', 'EmotionalArcAgent', 'MarketAgent', 'ExecutionAgent',
    'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
};

// Helper to check if a nav section is relevant to a stakeholder
export function isNavSectionRelevant(
  navId: string, 
  stakeholderLens: StakeholderLens | null
): boolean {
  if (!stakeholderLens) return true; // All sections for comprehensive analysis
  return STAKEHOLDER_NAV_SECTIONS[stakeholderLens].includes(navId);
}

// Helper to check if a category is relevant to a stakeholder
export function isCategoryRelevant(
  category: string, 
  stakeholderLens: StakeholderLens | null
): boolean {
  if (!stakeholderLens) return true;
  return STAKEHOLDER_CATEGORIES[stakeholderLens].includes(category);
}

// Helper to get filtered agents for a stakeholder
export function getAgentsForStakeholder(
  stakeholderLens: StakeholderLens | null,
  isComic: boolean = false
): string[] {
  if (!stakeholderLens) {
    // Return all agents for comprehensive analysis
    const allAgents = [
      'ConceptAgent', 'StructureAgent', 'CharacterAgent', 'ConflictAgent',
      'ThemeAgent', 'DialogueAgent', 'WorldLogicAgent', 'EmotionalArcAgent',
      'MarketAgent', 'ExecutionAgent', 'StakeholderLensAgent', 'InsightSynthesisAgent'
    ];
    if (isComic) {
      allAgents.push('ComicVisualAgent', 'ComicDialogueAgent', 'ComicPacingAgent', 'ComicArtDirectionAgent');
    }
    return allAgents;
  }
  
  const agents = [...STAKEHOLDER_AGENTS[stakeholderLens]];
  
  // Add comic agents if relevant
  if (isComic && (stakeholderLens === 'director' || stakeholderLens === 'writer')) {
    if (!agents.includes('ComicVisualAgent')) {
      agents.push('ComicVisualAgent', 'ComicDialogueAgent', 'ComicPacingAgent', 'ComicArtDirectionAgent');
    }
  }
  
  return agents;
}

// Stakeholder descriptions for selection UI
export const STAKEHOLDER_DESCRIPTIONS: Record<StakeholderLens, { 
  title: string; 
  focus: string; 
  keyMetrics: string[] 
}> = {
  studio_executive: {
    title: 'Studio Executive',
    focus: 'Greenlight readiness, commercial viability, and risk assessment',
    keyMetrics: ['Market Fit', 'Production Feasibility', 'Franchise Potential']
  },
  producer: {
    title: 'Producer',
    focus: 'Budget optimization, execution complexity, and production logistics',
    keyMetrics: ['Scene Economy', 'Location Count', 'Cast Size']
  },
  actor: {
    title: 'Actor',
    focus: 'Role depth, character arc potential, and performance opportunities',
    keyMetrics: ['Character Depth', 'Emotional Range', 'Screen Time']
  },
  director: {
    title: 'Director',
    focus: 'Visual storytelling, pacing, and thematic execution',
    keyMetrics: ['Visual Potential', 'Pacing Quality', 'Tonal Consistency']
  },
  writer: {
    title: 'Writer',
    focus: 'Craft feedback, structural integrity, and dialogue quality',
    keyMetrics: ['Structure', 'Dialogue', 'Character Arcs']
  },
  financier: {
    title: 'Financier',
    focus: 'ROI potential, market fit, and investment risk',
    keyMetrics: ['Market Potential', 'Budget Ratio', 'Comparable Success']
  },
  ott_platform: {
    title: 'OTT Platform',
    focus: 'Binge-ability, series potential, and subscriber appeal',
    keyMetrics: ['Hook Strength', 'Episode Cliffhangers', 'Audience Retention']
  },
  theatrical: {
    title: 'Theatrical',
    focus: 'Big-screen spectacle, event appeal, and theatrical experience',
    keyMetrics: ['Visual Scale', 'Emotional Impact', 'Event Potential']
  },
};
