/**
 * Script Breakdown Category Configuration
 * Industry-standard color coding for production breakdown sheets
 */

export type BreakdownCategory =
  | 'cast'
  | 'extras'
  | 'props'
  | 'wardrobe'
  | 'makeup'
  | 'vehicles'
  | 'animals'
  | 'vfx'
  | 'sfx'
  | 'stunts'
  | 'music'
  | 'sound'
  | 'set_dressing'
  | 'greenery'
  | 'special_equipment'
  | 'notes';

export interface CategoryConfig {
  label: string;
  color: string; // HSL for Tailwind
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
  icon: string; // Emoji for quick visual
}

/**
 * Industry-standard breakdown sheet colors
 * Based on StudioBinder / EP / Movie Magic conventions
 */
export const BREAKDOWN_CATEGORIES: Record<BreakdownCategory, CategoryConfig> = {
  cast: {
    label: 'Cast',
    color: '0 84% 60%',
    bgClass: 'bg-red-500/15',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-500/30',
    dotClass: 'bg-red-500',
    icon: '🎭',
  },
  extras: {
    label: 'Extras',
    color: '25 95% 53%',
    bgClass: 'bg-orange-500/15',
    textClass: 'text-orange-700 dark:text-orange-400',
    borderClass: 'border-orange-500/30',
    dotClass: 'bg-orange-500',
    icon: '👥',
  },
  props: {
    label: 'Props',
    color: '280 65% 60%',
    bgClass: 'bg-purple-500/15',
    textClass: 'text-purple-700 dark:text-purple-400',
    borderClass: 'border-purple-500/30',
    dotClass: 'bg-purple-500',
    icon: '🔧',
  },
  wardrobe: {
    label: 'Wardrobe',
    color: '199 89% 48%',
    bgClass: 'bg-sky-500/15',
    textClass: 'text-sky-700 dark:text-sky-400',
    borderClass: 'border-sky-500/30',
    dotClass: 'bg-sky-500',
    icon: '👔',
  },
  makeup: {
    label: 'Makeup / Hair',
    color: '330 81% 60%',
    bgClass: 'bg-pink-500/15',
    textClass: 'text-pink-700 dark:text-pink-400',
    borderClass: 'border-pink-500/30',
    dotClass: 'bg-pink-500',
    icon: '💄',
  },
  vehicles: {
    label: 'Vehicles',
    color: '38 92% 50%',
    bgClass: 'bg-amber-500/15',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-500/30',
    dotClass: 'bg-amber-500',
    icon: '🚗',
  },
  animals: {
    label: 'Animals',
    color: '142 71% 45%',
    bgClass: 'bg-green-500/15',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-500/30',
    dotClass: 'bg-green-500',
    icon: '🐾',
  },
  vfx: {
    label: 'VFX',
    color: '239 84% 60%',
    bgClass: 'bg-indigo-500/15',
    textClass: 'text-indigo-700 dark:text-indigo-400',
    borderClass: 'border-indigo-500/30',
    dotClass: 'bg-indigo-500',
    icon: '✨',
  },
  sfx: {
    label: 'SFX',
    color: '160 84% 39%',
    bgClass: 'bg-teal-500/15',
    textClass: 'text-teal-700 dark:text-teal-400',
    borderClass: 'border-teal-500/30',
    dotClass: 'bg-teal-500',
    icon: '💥',
  },
  stunts: {
    label: 'Stunts',
    color: '0 0% 45%',
    bgClass: 'bg-gray-500/15',
    textClass: 'text-gray-700 dark:text-gray-400',
    borderClass: 'border-gray-500/30',
    dotClass: 'bg-gray-500',
    icon: '🤸',
  },
  music: {
    label: 'Music',
    color: '262 83% 58%',
    bgClass: 'bg-violet-500/15',
    textClass: 'text-violet-700 dark:text-violet-400',
    borderClass: 'border-violet-500/30',
    dotClass: 'bg-violet-500',
    icon: '🎵',
  },
  sound: {
    label: 'Sound',
    color: '221 83% 53%',
    bgClass: 'bg-blue-500/15',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-500/30',
    dotClass: 'bg-blue-500',
    icon: '🔊',
  },
  set_dressing: {
    label: 'Set Dressing',
    color: '30 80% 50%',
    bgClass: 'bg-yellow-600/15',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    borderClass: 'border-yellow-600/30',
    dotClass: 'bg-yellow-600',
    icon: '🪑',
  },
  greenery: {
    label: 'Greenery',
    color: '120 60% 40%',
    bgClass: 'bg-emerald-600/15',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-600/30',
    dotClass: 'bg-emerald-600',
    icon: '🌿',
  },
  special_equipment: {
    label: 'Special Equipment',
    color: '200 18% 46%',
    bgClass: 'bg-slate-500/15',
    textClass: 'text-slate-700 dark:text-slate-400',
    borderClass: 'border-slate-500/30',
    dotClass: 'bg-slate-500',
    icon: '⚙️',
  },
  notes: {
    label: 'Notes',
    color: '45 93% 47%',
    bgClass: 'bg-yellow-500/15',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    borderClass: 'border-yellow-500/30',
    dotClass: 'bg-yellow-500',
    icon: '📝',
  },
};

export const CATEGORY_ORDER: BreakdownCategory[] = [
  'cast', 'extras', 'props', 'wardrobe', 'makeup', 'vehicles',
  'animals', 'vfx', 'sfx', 'stunts', 'music', 'sound',
  'set_dressing', 'greenery', 'special_equipment', 'notes',
];
