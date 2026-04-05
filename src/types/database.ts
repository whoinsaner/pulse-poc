// Custom types that extend the auto-generated Supabase types
// These provide better type safety for our application

export type AppRole = 'admin' | 'analyst' | 'viewer';
export type ScriptFormat = 'pdf' | 'fdx' | 'fountain' | 'highland' | 'txt' | 'docx';
export type ScriptType = 'feature' | 'pilot' | 'episode' | 'short' | 'documentary' | 'comic' | 'web_series' | 'micro_drama' | 'stage_play' | 'audio_drama' | 'podcast_fiction' | 'game_narrative';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type StakeholderLens = 
  | 'studio_executive' 
  | 'producer' 
  | 'actor' 
  | 'director' 
  | 'writer' 
  | 'financier' 
  | 'ott_platform' 
  | 'theatrical'
  | 'investor';

// Episode length class for web series
export type EpisodeLengthClass = 'short_form_web' | 'mid_form_web' | 'long_form_web';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  current_organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: AppRole;
  created_at: string;
}

export interface Script {
  id: string;
  organization_id: string;
  uploaded_by: string;
  title: string;
  logline: string | null;
  genre: string | null;
  script_type: ScriptType;
  format: ScriptFormat;
  file_url: string;
  file_size_bytes: number | null;
  page_count: number | null;
  episode_length_class: EpisodeLengthClass | null;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  script_id: string;
  scene_number: number;
  heading: string;
  location: string | null;
  time_of_day: string | null;
  int_ext: string | null;
  page_start: number | null;
  page_end: number | null;
  description: string | null;
  emotional_tone: string | null;
  created_at: string;
}

export interface Character {
  id: string;
  script_id: string;
  name: string;
  dialogue_count: number;
  scene_count: number;
  first_appearance: number | null;
  description: string | null;
  arc_summary: string | null;
  relationships: CharacterRelationship[];
  created_at: string;
}

export type ScriptLineType = 'dialogue' | 'action' | 'parenthetical' | 'scene_heading' | 'transition';

export interface ScriptLine {
  id: string;
  script_id: string;
  scene_number: number;
  line_number: number;
  character_name: string | null;
  line_type: ScriptLineType;
  content: string;
  page_number: number | null;
  created_at: string;
}

export interface CharacterRelationship {
  character: string;
  type: string;
  description?: string;
}

export interface Parameter {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  category: string;
  agent_source: string;
  default_weight: number;
  created_at: string;
}

export interface LensWeight {
  id: string;
  lens: StakeholderLens;
  parameter_id: string;
  weight: number;
}

export interface AnalysisRun {
  id: string;
  script_id: string;
  initiated_by: string;
  status: AnalysisStatus;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  agent_progress: Record<string, AgentProgress>;
  created_at: string;
}

export interface AgentProgress {
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface ParameterScore {
  id: string;
  analysis_run_id: string;
  parameter_id: string;
  score: number;
  confidence: number;
  evidence: Evidence[];
  rationale: string | null;
  agent_name: string;
  created_at: string;
}

export interface Evidence {
  type: 'scene' | 'dialogue' | 'action' | 'character' | 'structure' | 'theme' | 'world' | 'market' | 'production' | 'content' | 'overall';
  reference: string;
  quote?: string;
  page?: number;
  explanation: string;
}

export interface Insight {
  id: string;
  analysis_run_id: string;
  category: string;
  title: string;
  description: string;
  priority: number;
  actionable: boolean;
  supporting_evidence: Evidence[];
  related_parameters: string[];
  created_at: string;
}

export interface Report {
  id: string;
  analysis_run_id: string;
  script_id: string;
  organization_id: string;
  title: string;
  overall_score: number | null;
  lens_scores: Record<StakeholderLens, number>;
  executive_summary: string | null;
  full_report_data: ReportData;
  pdf_url: string | null;
  created_at: string;
}

// Agent section content produced by enhanced prompts
export interface AgentSectionContent {
  verdict?: string;
  whatWorks?: string[];
  whatsBroken?: string[];
  whatsUnderdeveloped?: string[];
  keyQuotes?: Array<{ quote: string; context: string; page?: number }>;
  deepDive?: string;
  recommendations?: Array<{
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium';
    effort: 'easy' | 'moderate' | 'hard';
  }>;
  // Character-specific
  protagonistProfile?: { name: string; want: string; need: string; flaw: string; arc: string; strengths?: string[]; weaknesses?: string[] };
  antagonistProfile?: { name: string; motivation: string; threat: string; complexity: string };
  supportingCast?: Array<{ name: string; role: string; impact: string }>;
  psychologyInsights?: string;
  // Market-specific
  comparableTitles?: Array<{ title: string; relevance: string; similarityScore?: number; imdbRating?: number }>;
  targetAudience?: string;
  platformFit?: string;
  // Execution-specific
  budgetTier?: string;
  productionComplexity?: string;
  talentRequirements?: string;
}

export interface SceneAnalysisData {
  sceneNumber: number;
  emotionalTone: string;
  dialogueDensity: number;   // 0-100
  actionIntensity: number;   // 0-100
  technicalRequirements: number; // 0-100
  vfxPotential: number;      // 0-100
  locationComplexity?: number; // 0-100
  narrativeFunction: 'setup' | 'escalation' | 'climax' | 'resolution' | 'transition';
  keyMoment: boolean;
  briefSummary?: string;     // 1-2 sentence summary
}

export interface ReportData {
  scriptMetadata: {
    title: string;
    logline?: string;
    genre?: string;
    subgenre?: string;
    theme?: string;
    scriptType: ScriptType;
    pageCount?: number;
    sceneCount?: number;
    characterCount?: number;
    episodeLengthClass?: EpisodeLengthClass;
    cinemaTradition?: string;
  };
  overallScore: number;
  lensScores: Record<StakeholderLens, number>;
  categoryScores: Record<string, number>;
  parameterScores: ParameterScoreData[];
  insights: InsightData[];
  characters: CharacterData[];
  scenes: SceneData[];
  narrativeGraph?: NarrativeGraphData;
  agentContent?: Record<string, AgentSectionContent>;
  sceneAnalysis?: SceneAnalysisData[];
}

export type MaturityLevel = 'Weak' | 'Developing' | 'Strong';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ParameterScoreData {
  parameterId: string;
  parameterName: string;
  displayName: string;
  category: string;
  score: number;
  confidence: number;
  evidence: Evidence[];
  rationale: string;
  // New USAF output contract fields
  maturity?: MaturityLevel;
  riskLevel?: RiskLevel;
  fixCost?: RiskLevel;
  upsideImpact?: RiskLevel;
}

export interface InsightData {
  category: string;
  title: string;
  description: string;
  priority: number;
  actionable: boolean;
  supportingEvidence: Evidence[];
}

export interface CharacterData {
  name: string;
  dialogueCount: number;
  sceneCount: number;
  firstAppearance?: number;
  description?: string;
  arcSummary?: string;
  relationships: CharacterRelationship[];
}

export interface SceneData {
  sceneNumber: number;
  heading: string;
  location?: string;
  timeOfDay?: string;
  intExt?: string;
  pageStart?: number;
  pageEnd?: number;
  description?: string;
  emotionalTone?: string;
}

export interface NarrativeGraphData {
  nodes: NarrativeNode[];
  edges: NarrativeEdge[];
}

export interface NarrativeNode {
  id: string;
  type: 'scene' | 'beat' | 'act' | 'sequence';
  label: string;
  metadata?: Record<string, unknown>;
}

export interface NarrativeEdge {
  source: string;
  target: string;
  type: 'follows' | 'causes' | 'parallels' | 'contrasts';
}

// Lens configuration for UI
export const LENS_CONFIG: Record<StakeholderLens, { label: string; description: string; icon: string }> = {
  studio_executive: {
    label: 'Studio Executive',
    description: 'Greenlight readiness and risk assessment',
    icon: 'Building2',
  },
  producer: {
    label: 'Producer',
    description: 'Budget and execution complexity',
    icon: 'Clapperboard',
  },
  actor: {
    label: 'Actor',
    description: 'Role depth and character arc potential',
    icon: 'User',
  },
  director: {
    label: 'Director',
    description: 'Visual storytelling and pacing',
    icon: 'Camera',
  },
  writer: {
    label: 'Writer',
    description: 'Craft feedback and structure',
    icon: 'PenTool',
  },
  financier: {
    label: 'Financier',
    description: 'ROI potential and market fit',
    icon: 'DollarSign',
  },
  ott_platform: {
    label: 'OTT Platform',
    description: 'Binge-ability and series potential',
    icon: 'Tv',
  },
  theatrical: {
    label: 'Theatrical',
    description: 'Big-screen spectacle and event appeal',
    icon: 'Film',
  },
  investor: {
    label: 'Investor',
    description: 'ROI metrics, monetization readiness, and market positioning',
    icon: 'TrendingUp',
  },
};

// USAF Module category colors for charts
export const CATEGORY_COLORS: Record<string, string> = {
  // Module A: Concept & Hook
  'Concept & Hook': 'hsl(var(--chart-1))',
  // Module B: Structure
  Structure: 'hsl(var(--chart-2))',
  // Module C: Character
  Character: 'hsl(var(--chart-3))',
  // Module D: Conflict
  Conflict: 'hsl(var(--chart-4))',
  // Module E: Theme
  Theme: 'hsl(var(--chart-5))',
  // Module F: Dialogue
  Dialogue: 'hsl(var(--chart-6))',
  // Module G: World & Logic
  'World & Logic': 'hsl(var(--chart-1))',
  // Module H: Emotional Arc
  'Emotional Arc': 'hsl(var(--chart-2))',
  // Module I: Market
  Market: 'hsl(var(--chart-3))',
  // Module J: Execution
  Execution: 'hsl(var(--chart-4))',
  // Legacy mappings
  World: 'hsl(var(--chart-1))',
  Emotion: 'hsl(var(--chart-2))',
  // Comic-specific categories
  'Comic Visuals': 'hsl(var(--chart-5))',
  'Comic Dialogue': 'hsl(var(--chart-6))',
  'Comic Pacing': 'hsl(var(--chart-1))',
  'Comic Art Direction': 'hsl(var(--chart-2))',
  // Micro Drama category
  'Micro Drama': 'hsl(var(--chart-5))',
};
