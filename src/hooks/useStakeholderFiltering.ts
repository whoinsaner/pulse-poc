import { useMemo } from 'react';
import { StakeholderLens, ParameterScore } from '@/types/database';
import { isCategoryRelevant, STAKEHOLDER_DESCRIPTIONS } from '@/lib/stakeholderConfig';

interface UseStakeholderFilteringOptions {
  stakeholderLens: StakeholderLens | null;
}

interface FilteringResult {
  /** Whether filtering is active (stakeholder-specific report) */
  isFiltered: boolean;
  /** Stakeholder label for display */
  stakeholderLabel: string | null;
  /** Check if a parameter category is relevant to the current stakeholder */
  isParameterRelevant: (category: string) => boolean;
  /** Filter parameters by relevance to current stakeholder */
  filterParameters: <T extends { category?: string }>(params: T[]) => T[];
  /** Get count of filtered vs total parameters */
  getFilterStats: <T extends { category?: string }>(params: T[]) => { shown: number; total: number };
}

/**
 * Hook to filter report parameters based on the stakeholder lens used during analysis.
 * 
 * When a stakeholder-specific analysis is run, only relevant parameter categories
 * are shown in the report sections.
 */
export function useStakeholderFiltering({ 
  stakeholderLens 
}: UseStakeholderFilteringOptions): FilteringResult {
  
  const isFiltered = stakeholderLens !== null;
  
  const stakeholderLabel = useMemo(() => {
    if (!stakeholderLens) return null;
    return STAKEHOLDER_DESCRIPTIONS[stakeholderLens]?.title || stakeholderLens;
  }, [stakeholderLens]);

  const isParameterRelevant = useMemo(() => {
    return (category: string): boolean => {
      return isCategoryRelevant(category, stakeholderLens);
    };
  }, [stakeholderLens]);

  const filterParameters = useMemo(() => {
    return <T extends { category?: string }>(params: T[]): T[] => {
      if (!stakeholderLens) return params;
      return params.filter(p => p.category && isCategoryRelevant(p.category, stakeholderLens));
    };
  }, [stakeholderLens]);

  const getFilterStats = useMemo(() => {
    return <T extends { category?: string }>(params: T[]): { shown: number; total: number } => {
      if (!stakeholderLens) {
        return { shown: params.length, total: params.length };
      }
      const filtered = params.filter(p => p.category && isCategoryRelevant(p.category, stakeholderLens));
      return { shown: filtered.length, total: params.length };
    };
  }, [stakeholderLens]);

  return {
    isFiltered,
    stakeholderLabel,
    isParameterRelevant,
    filterParameters,
    getFilterStats,
  };
}
