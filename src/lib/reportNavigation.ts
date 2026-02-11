/**
 * Dynamic Report Navigation System
 * Generates navigation based on script type and available categories
 */
import { extractScore } from '@/lib/scoreUtils';
import { 
  LayoutDashboard, 
  Lightbulb, 
  TrendingUp,
  Building,
  User,
  UserX,
  Users,
  Brain,
  MessageSquare,
  Heart,
  Eye,
  Sparkles,
  Target,
  Film,
  ListTodo,
  Layers,
  BarChart3,
  FileText,
  Palette,
  BookOpen,
  Monitor,
  Zap,
  LucideIcon
} from 'lucide-react';
import { ScriptType } from '@/types/database';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  requiredCategories?: string[];
}

export interface NavGroup {
  id: string;
  label: string;
  applicableTypes: ScriptType[] | 'all';
  items: NavItem[];
}

// All script types that are considered "comic"
export const COMIC_SCRIPT_TYPES: ScriptType[] = ['comic'];

// All script types that are considered "screenplay"
export const SCREENPLAY_SCRIPT_TYPES: ScriptType[] = ['feature', 'pilot', 'episode', 'short', 'documentary'];

// All script types that are considered "web series"
export const WEB_SERIES_SCRIPT_TYPES: ScriptType[] = ['web_series'];

/**
 * Check if a script type is a comic type
 */
export function isComicType(scriptType: ScriptType | undefined): boolean {
  if (!scriptType) return false;
  return COMIC_SCRIPT_TYPES.includes(scriptType);
}

/**
 * Check if a script type is a screenplay type
 */
export function isScreenplayType(scriptType: ScriptType | undefined): boolean {
  if (!scriptType) return false;
  return SCREENPLAY_SCRIPT_TYPES.includes(scriptType);
}

/**
 * USAF Consolidated Navigation Structure
 * Used for the new diagnosis-first report layout
 */
const USAF_NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    applicableTypes: 'all',
    items: [
      { id: 'cover', label: 'Cover', icon: LayoutDashboard, path: '' },
    ],
  },
  {
    id: 'story',
    label: 'Story Analysis',
    applicableTypes: 'all',
    items: [
      { id: 'story-diagnosis', label: 'Story Diagnosis', icon: BookOpen, path: '/story', requiredCategories: ['Concept & Hook', 'Structure', 'Conflict'] },
      { id: 'story-concept', label: 'Concept & Hook', icon: Lightbulb, path: '/story/concept', requiredCategories: ['Concept & Hook'] },
      { id: 'story-structure', label: 'Structure', icon: Building, path: '/story/structure', requiredCategories: ['Structure'] },
      { id: 'story-conflict', label: 'Conflict & Stakes', icon: Zap, path: '/story/conflict', requiredCategories: ['Conflict'] },
      { id: 'story-focus', label: 'Development Focus', icon: Target, path: '/story/focus' },
    ],
  },
  {
    id: 'characters',
    label: 'Characters',
    applicableTypes: 'all',
    items: [
      { id: 'character-diagnosis', label: 'Character Diagnosis', icon: Users, path: '/characters', requiredCategories: ['Character'] },
      { id: 'character-protagonist', label: 'Protagonist', icon: User, path: '/characters/protagonist', requiredCategories: ['Character'] },
      { id: 'character-antagonist', label: 'Antagonist', icon: UserX, path: '/characters/antagonist', requiredCategories: ['Character'] },
      { id: 'character-cast', label: 'Supporting Cast', icon: Users, path: '/characters/cast', requiredCategories: ['Character'] },
      { id: 'character-focus', label: 'Development Focus', icon: Target, path: '/characters/focus' },
    ],
  },
  {
    id: 'craft',
    label: 'Craft',
    applicableTypes: 'all',
    items: [
      { id: 'craft', label: 'Craft', icon: Palette, path: '/craft', requiredCategories: ['Dialogue', 'Theme', 'World & Logic', 'Emotional Arc'] },
    ],
  },
  {
    id: 'format',
    label: 'Format',
    applicableTypes: ['comic', 'web_series', 'micro_drama'],
    items: [
      { id: 'format', label: 'Format', icon: Layers, path: '/format' },
    ],
  },
  {
    id: 'market',
    label: 'Production & Market',
    applicableTypes: 'all',
    items: [
      { id: 'commercial', label: 'Commercial', icon: TrendingUp, path: '/commercial', requiredCategories: ['Market', 'Execution'] },
    ],
  },
  {
    id: 'actions',
    label: 'Recommendations',
    applicableTypes: 'all',
    items: [
      { id: 'development', label: 'Development', icon: ListTodo, path: '/development' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    applicableTypes: 'all',
    items: [
      { id: 'scorecard', label: 'Scorecard', icon: BarChart3, path: '/scorecard' },
      { id: 'script', label: 'Script', icon: FileText, path: '/script' },
    ],
  },
];

/**
 * Legacy Navigation Structure (for backward compatibility)
 * Full navigation structure with applicability rules
 */
const ALL_NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    applicableTypes: 'all',
    items: [
      { id: 'snapshot', label: 'Snapshot', icon: LayoutDashboard, path: '' },
    ],
  },
  {
    id: 'story',
    label: 'Story',
    applicableTypes: 'all',
    items: [
      { id: 'concept', label: 'Concept', icon: Lightbulb, path: '/concept', requiredCategories: ['Concept & Hook'] },
      { id: 'plot', label: 'Plot', icon: TrendingUp, path: '/plot' },
      { id: 'structure', label: 'Structure', icon: Building, path: '/structure', requiredCategories: ['Structure'] },
    ],
  },
  {
    id: 'characters',
    label: 'Characters',
    applicableTypes: 'all',
    items: [
      { id: 'protagonist', label: 'Protagonist', icon: User, path: '/protagonist', requiredCategories: ['Character'] },
      { id: 'antagonist', label: 'Antagonist', icon: UserX, path: '/antagonist', requiredCategories: ['Character'] },
      { id: 'supporting', label: 'Cast', icon: Users, path: '/supporting', requiredCategories: ['Character'] },
      { id: 'psychology', label: 'Psychology', icon: Brain, path: '/psychology', requiredCategories: ['Character'] },
    ],
  },
  {
    id: 'craft',
    label: 'Craft',
    applicableTypes: 'all',
    items: [
      { id: 'dialogue', label: 'Dialogue', icon: MessageSquare, path: '/dialogue', requiredCategories: ['Dialogue'] },
      { id: 'theme', label: 'Theme', icon: Heart, path: '/theme', requiredCategories: ['Theme'] },
      { id: 'visual', label: 'Visual', icon: Eye, path: '/visual', requiredCategories: ['World & Logic', 'World'] },
      { id: 'emotional', label: 'Emotion', icon: Sparkles, path: '/emotional', requiredCategories: ['Emotional Arc', 'Emotion'] },
    ],
  },
  {
    id: 'comic-craft',
    label: 'Comic Craft',
    applicableTypes: ['comic'],
    items: [
      { id: 'comic', label: 'Comic Analysis', icon: Palette, path: '/comic', requiredCategories: ['Comic Visuals', 'Comic Dialogue', 'Comic Pacing'] },
      { id: 'panel-flow', label: 'Panel Flow', icon: Layers, path: '/panel-flow', requiredCategories: ['Comic Visuals'] },
      { id: 'lettering', label: 'Lettering', icon: MessageSquare, path: '/lettering', requiredCategories: ['Comic Dialogue'] },
      { id: 'page-turn', label: 'Page Turns', icon: BookOpen, path: '/page-turn', requiredCategories: ['Comic Pacing'] },
    ],
  },
  {
    id: 'web-series-craft',
    label: 'Web Series',
    applicableTypes: ['web_series'],
    items: [
      { id: 'web-series', label: 'Series Analysis', icon: Monitor, path: '/web-series', requiredCategories: ['Web Series'] },
      { id: 'retention', label: 'Retention', icon: TrendingUp, path: '/retention', requiredCategories: ['Web Series'] },
      { id: 'hooks', label: 'Hooks', icon: Sparkles, path: '/hooks', requiredCategories: ['Web Series'] },
    ],
  },
  {
    id: 'market',
    label: 'Market',
    applicableTypes: 'all',
    items: [
      { id: 'market', label: 'Marketability', icon: TrendingUp, path: '/market', requiredCategories: ['Market'] },
      { id: 'production', label: 'Production', icon: Film, path: '/production', requiredCategories: ['Execution'] },
      { id: 'audience', label: 'Audience', icon: Target, path: '/audience', requiredCategories: ['Market'] },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    applicableTypes: ['feature', 'pilot', 'episode', 'short', 'documentary', 'web_series'],
    items: [
      { id: 'platform', label: 'Platform Fit', icon: Monitor, path: '/platform' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    applicableTypes: 'all',
    items: [
      { id: 'rewrite', label: 'Rewrites', icon: ListTodo, path: '/rewrite' },
      { id: 'scenes', label: 'Scenes', icon: Layers, path: '/scenes' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    applicableTypes: 'all',
    items: [
      { id: 'bible', label: 'Series Bible', icon: BookOpen, path: '/bible', requiredCategories: ['World & Logic', 'Character', 'Theme'] },
      { id: 'scorecard', label: 'Scorecard', icon: BarChart3, path: '/scorecard' },
      { id: 'script', label: 'Script', icon: FileText, path: '/script' },
    ],
  },
];

/**
 * Get navigation groups filtered for a specific script type
 * @param useUSAFLayout - If true, use the consolidated USAF navigation structure
 */
export function getNavGroupsForScriptType(
  scriptType: ScriptType | undefined,
  categoryScores?: Record<string, number>,
  useUSAFLayout: boolean = false
): NavGroup[] {
  const type = scriptType || 'feature';
  const navGroups = useUSAFLayout ? USAF_NAV_GROUPS : ALL_NAV_GROUPS;
  
  return navGroups
    .filter(group => {
      // Filter by script type applicability
      if (group.applicableTypes === 'all') return true;
      return group.applicableTypes.includes(type);
    })
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        // If no required categories, always show
        if (!item.requiredCategories || !categoryScores) return true;
        
        // Show if any of the required categories have scores
        return item.requiredCategories.some(cat => 
          categoryScores[cat] !== undefined && extractScore(categoryScores[cat]) > 0
        );
      }),
    }))
    .filter(group => group.items.length > 0); // Remove empty groups
}

/**
 * Get USAF consolidated navigation groups for a script type
 */
export function getUSAFNavGroups(
  scriptType: ScriptType | undefined,
  categoryScores?: Record<string, number>
): NavGroup[] {
  return getNavGroupsForScriptType(scriptType, categoryScores, true);
}

/**
 * Get all available categories for a script type
 */
export function getCategoriesForScriptType(scriptType: ScriptType | undefined): string[] {
  const baseCategories = [
    'Concept & Hook',
    'Structure',
    'Character',
    'Conflict',
    'Theme',
    'Dialogue',
    'World & Logic',
    'Emotional Arc',
    'Market',
    'Execution',
  ];

  if (isComicType(scriptType)) {
    return [
      ...baseCategories,
      'Comic Visuals',
      'Comic Dialogue',
      'Comic Pacing',
      'Comic Structure',
      'Comic Characters',
      'Comic Collaboration',
      'Comic Production',
      'Comic Market',
    ];
  }

  if (isWebSeriesType(scriptType)) {
    return [
      ...baseCategories,
      'Web Series',
    ];
  }

  return baseCategories;
}

/**
 * Get display label for a script type
 */
export function getScriptTypeLabel(scriptType: ScriptType | undefined): string {
  const labels: Record<ScriptType, string> = {
    feature: 'Feature Film',
    pilot: 'TV Pilot',
    episode: 'TV Episode',
    short: 'Short Film',
    documentary: 'Documentary',
    comic: 'Comic / Graphic Novel',
    web_series: 'Web Series',
    micro_drama: 'Micro Drama',
  };
  return labels[scriptType || 'feature'] || 'Script';
}

/**
 * Check if a script type is a web series type
 */
export function isWebSeriesType(scriptType: ScriptType | undefined): boolean {
  if (!scriptType) return false;
  return WEB_SERIES_SCRIPT_TYPES.includes(scriptType);
}

/**
 * Get the count of active agents for a script type
 */
export function getAgentCountForScriptType(scriptType: ScriptType | undefined): { core: number; specialized: number; total: number } {
  const core = 10; // Always 10 core agents
  const specialized = isComicType(scriptType) ? 4 : 0; // 4 comic-specific agents
  return { core, specialized, total: core + specialized };
}
