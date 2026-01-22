/**
 * Report Utilities for Data Filtering and Processing
 * Filters out system/internal categories from user-facing displays
 */

import { ParameterScoreData } from '@/types/database';

/**
 * Categories that should be hidden from user-facing report views
 * These are internal system metrics, not narrative analysis
 */
export const HIDDEN_CATEGORIES = ['System', 'system'];

/**
 * Filter out hidden categories from category scores object
 */
export function filterVisibleCategories<T>(
  categories: Record<string, T>
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(categories).filter(
      ([key]) => !HIDDEN_CATEGORIES.includes(key)
    )
  );
}

/**
 * Filter out hidden parameters based on their category
 */
export function filterVisibleParameters(
  params: ParameterScoreData[]
): ParameterScoreData[] {
  return params.filter(
    (p) => !HIDDEN_CATEGORIES.includes(p.category || '')
  );
}

/**
 * Count visible categories (excluding system)
 */
export function countVisibleCategories(
  categories: Record<string, unknown>
): number {
  return Object.keys(filterVisibleCategories(categories)).length;
}

/**
 * Count visible parameters (excluding system)
 */
export function countVisibleParameters(
  params: ParameterScoreData[]
): number {
  return filterVisibleParameters(params).length;
}
