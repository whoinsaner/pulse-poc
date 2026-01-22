/**
 * USAF Framework Documentation Content
 * Structured content for PDF generation
 */

import { 
  SYSTEM_AGENTS, 
  CORE_AGENTS, 
  COMIC_AGENTS, 
  META_AGENTS,
  WEB_SERIES_AGENTS,
  INTERACTIVE_AGENTS,
  AUDIO_AGENTS,
  SCRIPT_TYPES,
  ALL_AGENTS,
  AgentDefinition
} from './scriptFramework';
import { 
  CORE_PARAMETERS, 
  COMIC_PARAMETERS, 
  WEB_SERIES_PARAMETERS,
  ParameterDefinition,
  COMICS_MATURITY_SCALE,
  WEB_SERIES_MATURITY_SCALE,
} from './parameterDefinitions';
import { STAKEHOLDER_DESCRIPTIONS, STAKEHOLDER_CATEGORIES } from './stakeholderConfig';
import { StakeholderLens, LENS_CONFIG } from '@/types/database';

// ============= DOCUMENTATION STRUCTURE =============

export interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  subsections?: DocumentationSection[];
}

export interface AgentDocumentation {
  id: string;
  name: string;
  category: string;
  description: string;
  parameterCount: number;
  parameters: string[];
  reportSections: string[];
  applicability: string;
}

export interface ParameterDocumentation {
  id: string;
  displayName: string;
  category: string;
  agentSource: string;
  description: string;
  scoringGuide: string;
  weight: number;
  applicability: string;
}

export interface StakeholderDocumentation {
  id: StakeholderLens;
  title: string;
  description: string;
  focus: string;
  keyMetrics: string[];
  priorityCategories: string[];
}

// ============= FRAMEWORK METADATA =============

export const FRAMEWORK_METADATA = {
  name: 'Universal Script Analysis Framework',
  abbreviation: 'USAF',
  version: '3.0.0',
  releaseDate: '2025-01-22',
  totalAgents: ALL_AGENTS.length,
  totalParameters: CORE_PARAMETERS.length + COMIC_PARAMETERS.length + WEB_SERIES_PARAMETERS.length,
  totalStakeholderLenses: 9,
  supportedScriptTypes: SCRIPT_TYPES.length,
};

// ============= EXECUTIVE SUMMARY =============

export const EXECUTIVE_SUMMARY = `
The Universal Script Analysis Framework (USAF) v3.0 is a comprehensive, AI-powered system for objective script evaluation across all narrative formats. Developed for entertainment industry professionals, USAF provides actionable insights through multi-dimensional analysis.

KEY CAPABILITIES:
• 145+ Parameters: Objective scoring across concept, structure, character, dialogue, theme, conflict, world-building, emotional arc, market fit, and execution feasibility
• 24 Specialized Agents: Modular AI agents for format-specific analysis including core screenplay, comics, web series, interactive, and audio narratives
• 9 Stakeholder Lenses: Role-specific perspectives that re-weight parameters based on professional priorities (Studio Executive, Producer, Actor, Director, Writer, Financier, OTT Platform, Theatrical, Investor)
• 17 Script Types: From feature films to web series, comics to audio dramas

SCORING METHODOLOGY:
All parameters are evaluated on a unified 0-100 scale:
• 90-100: Production-ready excellence
• 70-89: Strong with minor refinements needed
• 50-69: Developing, requires focused revision
• 30-49: Weak, significant rework required
• 0-29: Underdeveloped, fundamental issues

Each score includes maturity level, risk assessment, fix cost estimation, and evidence-based rationale.
`;

// ============= ARCHITECTURE CONTENT =============

export const ARCHITECTURE_OVERVIEW = `
USAF operates as a 4-stage pipeline that processes any narrative material through specialized analysis modules:

STAGE 1: INTAKE & NORMALIZATION
The IntakeNormalizerAgent converts any incoming script format (PDF, FDX, Fountain, DOCX) into a canonical internal representation. This ensures consistent analysis regardless of source format.

STAGE 2: CLASSIFICATION & ROUTING
The ScriptTypeClassifierAgent determines the optimal script type classification (feature film, TV series, web series, comic, etc.). When confidence is below threshold, the ClassifierArbitrationAgent validates and refines. For hybrid projects, the MultiTypeBlendingAgent adjusts parameter weights.

STAGE 3: CORE ANALYSIS
10 specialized analysis agents execute in parallel, each evaluating their domain:
• ConceptAgent: Hook clarity, originality, franchise potential
• StructureAgent: Three-act integrity, pacing, scene economy
• CharacterAgent: Arc depth, agency, ensemble balance
• ConflictAgent: Stakes escalation, tension management
• ThemeAgent: Thematic coherence, symbolic density
• DialogueAgent: Voice differentiation, subtext quality
• WorldLogicAgent: Internal consistency, suspension of disbelief
• EmotionalArcAgent: Catharsis design, emotional variety
• MarketAgent: Platform fit, audience alignment, commercial hooks
• ExecutionAgent: Production complexity, risk assessment

Format-specific agents activate based on script type:
• Comics: PanelFlowAgent, LetteringBalloonAgent, PageTurnImpactAgent, ArtScriptSynergyAgent
• Web Series: WebSeriesAgent (hook efficiency, retention curves, algorithmic optimization)
• Interactive: InteractivityAgent, WorldBuildingAgent
• Audio: AudioNarrativeAgent

STAGE 4: META ANALYSIS & SYNTHESIS
Meta agents synthesize findings:
• StakeholderLensAgent: Re-weights all parameters per stakeholder role
• InsightSynthesisAgent: Generates prescriptive recommendations
• InvestorReadinessAgent: Commercial decision-maker perspective
• CreatorFeedbackLoopAgent: Tracks revisions and confidence shifts
• ExplainabilityTraceAgent: Provides transparent reasoning trails
`;

// ============= AGENT DOCUMENTATION =============

export function getAgentDocumentation(): AgentDocumentation[] {
  const formatApplicability = (applicable: string[] | 'all'): string => {
    if (applicable === 'all') return 'All script types';
    return applicable.join(', ');
  };

  const getParameterCount = (agent: AgentDefinition): number => {
    const allParams = [...CORE_PARAMETERS, ...COMIC_PARAMETERS, ...WEB_SERIES_PARAMETERS];
    return allParams.filter(p => p.agentSource === agent.id).length;
  };

  return ALL_AGENTS.map(agent => ({
    id: agent.id,
    name: agent.name,
    category: agent.category,
    description: agent.description,
    parameterCount: getParameterCount(agent),
    parameters: agent.parameters,
    reportSections: agent.reportSections,
    applicability: formatApplicability(agent.applicableScriptTypes),
  }));
}

export function getAgentsByCategory() {
  return {
    system: SYSTEM_AGENTS.map(a => ({ ...a, parameterCount: a.parameters.length })),
    core: CORE_AGENTS.map(a => ({ ...a, parameterCount: a.parameters.length })),
    comic: COMIC_AGENTS.map(a => ({ ...a, parameterCount: a.parameters.length })),
    webSeries: WEB_SERIES_AGENTS.map(a => ({ ...a, parameterCount: a.parameters.length })),
    interactive: INTERACTIVE_AGENTS.map(a => ({ ...a, parameterCount: a.parameters.length })),
    audio: AUDIO_AGENTS.map(a => ({ ...a, parameterCount: a.parameters.length })),
    meta: META_AGENTS.map(a => ({ ...a, parameterCount: a.parameters.length })),
  };
}

// ============= PARAMETER DOCUMENTATION =============

export function getParameterDocumentation(): ParameterDocumentation[] {
  const formatApplicability = (applicable: string[] | 'all'): string => {
    if (applicable === 'all') return 'All script types';
    return applicable.join(', ');
  };

  const allParams = [...CORE_PARAMETERS, ...COMIC_PARAMETERS, ...WEB_SERIES_PARAMETERS];
  
  return allParams.map(param => ({
    id: param.id,
    displayName: param.displayName,
    category: param.category,
    agentSource: param.agentSource,
    description: param.description,
    scoringGuide: param.scoringGuide,
    weight: param.weight,
    applicability: formatApplicability(param.applicableScriptTypes),
  }));
}

export function getParametersByCategory(): Record<string, ParameterDocumentation[]> {
  const params = getParameterDocumentation();
  const grouped: Record<string, ParameterDocumentation[]> = {};
  
  params.forEach(param => {
    if (!grouped[param.category]) {
      grouped[param.category] = [];
    }
    grouped[param.category].push(param);
  });
  
  return grouped;
}

export function getCategoryList(): string[] {
  const params = getParameterDocumentation();
  const categories = new Set(params.map(p => p.category));
  return Array.from(categories);
}

// ============= STAKEHOLDER DOCUMENTATION =============

export function getStakeholderDocumentation(): StakeholderDocumentation[] {
  const stakeholders: StakeholderLens[] = [
    'studio_executive', 'producer', 'actor', 'director', 'writer',
    'financier', 'ott_platform', 'theatrical', 'investor'
  ];

  return stakeholders.map(id => ({
    id,
    title: STAKEHOLDER_DESCRIPTIONS[id].title,
    description: LENS_CONFIG[id].description,
    focus: STAKEHOLDER_DESCRIPTIONS[id].focus,
    keyMetrics: STAKEHOLDER_DESCRIPTIONS[id].keyMetrics,
    priorityCategories: STAKEHOLDER_CATEGORIES[id],
  }));
}

// ============= SCORING METHODOLOGY =============

export const SCORING_METHODOLOGY = `
UNIFIED 0-100 SCALE

USAF uses a consistent 0-100 scoring scale across all parameters for easy comparison and aggregation:

90-100 (Production-Ready)
The element exceeds professional standards. Ready for production with minimal revision. Represents exceptional craft that will enhance the final product.

70-89 (Strong)
Meets professional standards with minor areas for improvement. The element is solid and functional but could benefit from targeted refinement.

50-69 (Developing)
Functional but requires focused revision. The core concept is present but execution needs work. Common for early drafts.

30-49 (Weak)
Significant issues that require substantial rework. The fundamental approach may be sound but execution is problematic.

0-29 (Underdeveloped)
Fundamental issues with the approach or concept. Requires reconceptualization rather than revision.

MATURITY LEVELS

Each parameter score maps to a maturity level:
• Strong (70+): Ready for production consideration
• Developing (50-69): Needs focused work
• Weak (0-49): Requires significant revision

RISK ASSESSMENT

Parameters are flagged with risk levels:
• Low Risk: Score above threshold, no concerns
• Medium Risk: Score below threshold but fixable
• High Risk: Score indicates fundamental issues

FIX COST ESTIMATION

Each finding includes an effort estimate:
• Low: Can be addressed in a revision pass
• Medium: Requires dedicated scene or sequence work
• High: Structural changes needed across script

EVIDENCE-BASED EVALUATION

Every score is supported by:
• Specific textual evidence from the script
• Page/scene references where applicable
• Rationale explaining the evaluation
• Comparison to industry standards
`;

// ============= SCRIPT TYPE COMPATIBILITY =============

export function getScriptTypeDocumentation() {
  return SCRIPT_TYPES.map(type => ({
    value: type.value,
    label: type.label,
    description: type.description,
    category: type.category,
    formatTags: type.formatTags,
    distributionTags: type.distributionTags,
  }));
}

// ============= MATURITY SCALES =============

export const MATURITY_SCALES = {
  general: {
    '90-100': 'Production-Ready',
    '70-89': 'Strong',
    '50-69': 'Developing',
    '30-49': 'Weak',
    '0-29': 'Underdeveloped',
  },
  comics: COMICS_MATURITY_SCALE,
  webSeries: WEB_SERIES_MATURITY_SCALE,
};

// ============= FULL DOCUMENTATION SECTIONS =============

export function getFullDocumentation(): DocumentationSection[] {
  return [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      content: EXECUTIVE_SUMMARY,
    },
    {
      id: 'architecture',
      title: 'Framework Architecture',
      content: ARCHITECTURE_OVERVIEW,
      subsections: [
        {
          id: 'pipeline',
          title: '4-Stage Pipeline',
          content: 'The USAF pipeline processes scripts through intake, classification, analysis, and synthesis stages.',
        },
        {
          id: 'agent-system',
          title: 'Agent System',
          content: `USAF employs ${FRAMEWORK_METADATA.totalAgents} specialized agents organized into categories: System (4), Core Analysis (10), Comic-Specific (4), Web Series (1), Interactive (2), Audio (1), and Meta (4).`,
        },
      ],
    },
    {
      id: 'agents',
      title: 'Agent Catalog',
      content: `Complete catalog of ${FRAMEWORK_METADATA.totalAgents} USAF agents with their responsibilities, parameters, and applicability.`,
    },
    {
      id: 'parameters',
      title: 'Parameter Reference',
      content: `Detailed reference for all ${FRAMEWORK_METADATA.totalParameters} parameters including scoring guides and applicability.`,
    },
    {
      id: 'stakeholders',
      title: 'Stakeholder Lens System',
      content: `${FRAMEWORK_METADATA.totalStakeholderLenses} specialized perspectives that re-weight parameters based on professional role priorities.`,
    },
    {
      id: 'scoring',
      title: 'Scoring Methodology',
      content: SCORING_METHODOLOGY,
    },
    {
      id: 'script-types',
      title: 'Script Type Compatibility',
      content: `Support for ${FRAMEWORK_METADATA.supportedScriptTypes} distinct script types across film, series, stage, audio, interactive, and experimental formats.`,
    },
  ];
}
