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
    'snapshot', 'concept', 'plot', 'supporting', 'emotional', 'audience', 'market', 'web-series'
  ],
  theatrical: [
    'snapshot', 'concept', 'visual', 'emotional', 'market', 'production', 'audience'
  ],
  investor: [
    'snapshot', 'concept', 'market', 'production', 'audience', 'web-series', 'scorecard'
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
    'Structure', 'Theme', 'Emotional Arc', 'World & Logic', 'Comic Visuals', 'Comic Collaboration'
  ],
  writer: [
    'Concept & Hook', 'Structure', 'Character', 'Dialogue', 'Theme', 'Conflict'
  ],
  financier: [
    'Concept & Hook', 'Market', 'Execution'
  ],
  ott_platform: [
    'Concept & Hook', 'Character', 'Emotional Arc', 'Market', 'Web Series'
  ],
  theatrical: [
    'Concept & Hook', 'Emotional Arc', 'Market', 'Execution'
  ],
  investor: [
    'Market', 'Execution', 'Concept & Hook', 'Web Series'
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
    'PanelFlowAgent', 'ArtScriptSynergyAgent', 'StakeholderLensAgent', 'InsightSynthesisAgent'
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
    'WebSeriesAgent', 'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  theatrical: [
    'ConceptAgent', 'EmotionalArcAgent', 'MarketAgent', 'ExecutionAgent',
    'StakeholderLensAgent', 'InsightSynthesisAgent'
  ],
  investor: [
    'ConceptAgent', 'MarketAgent', 'ExecutionAgent', 'WebSeriesAgent',
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
      allAgents.push('PanelFlowAgent', 'LetteringBalloonAgent', 'PageTurnImpactAgent', 'ArtScriptSynergyAgent');
    }
    return allAgents;
  }
  
  const agents = [...STAKEHOLDER_AGENTS[stakeholderLens]];
  
  // Add comic agents if relevant
  if (isComic && (stakeholderLens === 'director' || stakeholderLens === 'writer')) {
    if (!agents.includes('PanelFlowAgent')) {
      agents.push('PanelFlowAgent', 'LetteringBalloonAgent', 'PageTurnImpactAgent', 'ArtScriptSynergyAgent');
    }
  }
  
  return agents;
}

// Get the expected agents for an analysis run (used for progress calculation)
// This combines script-type filtering with stakeholder filtering + system agents
export function getExpectedAgentsForAnalysis(
  scriptType: string,
  stakeholderLens: StakeholderLens | null
): string[] {
  const isComic = scriptType === 'comic' || scriptType.includes('comic');
  const isWebSeries = scriptType === 'web_series' || scriptType.includes('web_series');
  const isMicroDrama = scriptType === 'micro_drama' || scriptType.includes('micro_drama');
  const isEpisodic = ['web_series', 'pilot', 'episode', 'micro_drama'].includes(scriptType);
  
  // System agents always run (4 agents)
  const systemAgentIds = [
    'IntakeNormalizerAgent',
    'ScriptTypeClassifierAgent', 
    'ClassifierArbitrationAgent',
    'MultiTypeBlendingAgent'
  ];
  
  // Get stakeholder-filtered analysis agents (includes StakeholderLensAgent, InsightSynthesisAgent)
  const analysisAgentIds = getAgentsForStakeholder(stakeholderLens, isComic);
  
  // Combine only agents that are actually run by the edge function
  const allAgents = [...systemAgentIds, ...analysisAgentIds];
  
  // Add format-specific agents
  if (isWebSeries && !allAgents.includes('WebSeriesAgent')) {
    allAgents.push('WebSeriesAgent');
  }
  if (isMicroDrama && !allAgents.includes('MicroDramaAgent')) {
    allAgents.push('MicroDramaAgent');
  }
  if (isEpisodic && !allAgents.includes('SeriesBibleAgent')) {
    allAgents.push('SeriesBibleAgent');
  }
  
  // Deduplicate (in case of overlap)
  return [...new Set(allAgents)];
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
  investor: {
    title: 'Investor',
    focus: 'ROI metrics, monetization readiness, and market positioning',
    keyMetrics: ['Monetization Readiness', 'Retention Design', 'Commercial Viability']
  },
};

// Approximate parameter counts per agent (based on agent definitions in analyze-script)
const AGENT_PARAMETER_COUNTS: Record<string, number> = {
  ConceptAgent: 8,
  StructureAgent: 10,
  CharacterAgent: 12,
  ConflictAgent: 8,
  ThemeAgent: 6,
  DialogueAgent: 8,
  WorldLogicAgent: 7,
  EmotionalArcAgent: 9,
  MarketAgent: 10,
  ExecutionAgent: 8,
  PanelFlowAgent: 4,
  LetteringBalloonAgent: 3,
  PageTurnImpactAgent: 3,
  ArtScriptSynergyAgent: 3,
  WebSeriesAgent: 13,
  MicroDramaAgent: 10,
  SeriesBibleAgent: 5,
  StakeholderLensAgent: 0, // Meta agent, no direct parameters
  InsightSynthesisAgent: 0, // Meta agent, no direct parameters
};

// Get total parameter count for a set of agents
export function getParameterCountForAgents(agentNames: string[]): number {
  return agentNames.reduce((total, name) => {
    return total + (AGENT_PARAMETER_COUNTS[name] || 0);
  }, 0);
}

// Get parameter count for a specific stakeholder/script combination
export function getParameterCountForAnalysis(
  stakeholderLens: StakeholderLens | null,
  scriptType: string
): number {
  const isComic = scriptType === 'comic' || scriptType.includes('comic');
  const isWebSeries = scriptType === 'web_series' || scriptType.includes('web_series');
  const isMicroDrama = scriptType === 'micro_drama' || scriptType.includes('micro_drama');
  
  const agents = getAgentsForStakeholder(stakeholderLens, isComic);
  
  // Add web series agent if applicable and not already included
  if (isWebSeries && !agents.includes('WebSeriesAgent')) {
    agents.push('WebSeriesAgent');
  }
  
  // Add micro drama agent if applicable and not already included
  if (isMicroDrama && !agents.includes('MicroDramaAgent')) {
    agents.push('MicroDramaAgent');
  }
  
  return getParameterCountForAgents(agents);
}

// Check if an agent is active for a given stakeholder
export function isAgentActiveForStakeholder(
  agentName: string,
  stakeholderLens: StakeholderLens | null,
  isComic: boolean = false,
  isWebSeries: boolean = false,
  isMicroDrama: boolean = false
): boolean {
  const activeAgents = getAgentsForStakeholder(stakeholderLens, isComic);
  
  // WebSeriesAgent is always active for web series
  if (isWebSeries && agentName === 'WebSeriesAgent') {
    return true;
  }
  
  // MicroDramaAgent is always active for micro dramas
  if (isMicroDrama && agentName === 'MicroDramaAgent') {
    return true;
  }
  
  return activeAgents.includes(agentName);
}
