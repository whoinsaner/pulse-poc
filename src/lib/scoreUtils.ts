/**
 * Score Utilities for 0-100 Scale Standardization
 * All scores in the system are standardized to 0-100
 */

export interface ScoreThreshold {
  label: string;
  level: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
}

/**
 * Normalize a score to the 0-100 scale
 * Handles legacy 0-10 scale scores and converts them
 */
export function normalizeScore(score: number): number {
  if (score === 0) return 0;
  // If score appears to be on 0-10 scale, convert to 0-100
  if (score > 0 && score <= 10) {
    return score * 10;
  }
  // Already on 0-100 scale
  return Math.min(100, Math.max(0, score));
}

/**
 * Detect if a score is on the legacy 0-10 scale
 */
export function isLegacyScale(score: number): boolean {
  return score > 0 && score <= 10;
}

/**
 * Get score threshold labels and styling level (0-100 scale)
 */
export function getScoreThreshold(score: number): ScoreThreshold {
  if (score >= 80) return { label: 'Excellent', level: 'excellent' };
  if (score >= 65) return { label: 'Good', level: 'good' };
  if (score >= 50) return { label: 'Average', level: 'average' };
  if (score >= 30) return { label: 'Needs Work', level: 'poor' };
  return { label: 'Critical', level: 'critical' };
}

/**
 * Get extended score labels (0-100 scale)
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 40) return 'Below Average';
  if (score >= 30) return 'Needs Work';
  return 'Critical';
}

/**
 * Get CSS class for score color (0-100 scale)
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return 'score-excellent';
  if (score >= 65) return 'score-good';
  if (score >= 50) return 'score-average';
  if (score >= 30) return 'score-poor';
  return 'score-critical';
}

/**
 * Get CSS class for score background (0-100 scale)
 */
export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'score-bg-excellent';
  if (score >= 65) return 'score-bg-good';
  if (score >= 50) return 'score-bg-average';
  if (score >= 30) return 'score-bg-poor';
  return 'score-bg-critical';
}

/**
 * Get Tailwind color class name for score (0-100 scale)
 */
export function getScoreTailwindColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-chart-3';
  if (score >= 50) return 'text-chart-4';
  if (score >= 40) return 'text-warning';
  return 'text-destructive';
}

/**
 * Get Tailwind background class for score cards (0-100 scale)
 */
export function getScoreTailwindBg(score: number): string {
  if (score >= 80) return 'bg-success/10 border-success/30';
  if (score >= 60) return 'bg-chart-3/10 border-chart-3/30';
  if (score >= 50) return 'bg-chart-4/10 border-chart-4/30';
  if (score >= 40) return 'bg-warning/10 border-warning/30';
  return 'bg-destructive/10 border-destructive/30';
}

/**
 * Get progress bar color for score (0-100 scale)
 */
export function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-chart-3';
  if (score >= 50) return 'bg-chart-4';
  if (score >= 40) return 'bg-warning';
  return 'bg-destructive';
}

/**
 * Format score for display with appropriate precision
 */
export function formatScore(score: number, decimals: number = 0): string {
  return score.toFixed(decimals);
}

/**
 * Calculate percentage for progress bars (0-100 scale)
 */
export function scoreToPercentage(score: number, maxScore: number = 100): number {
  return (score / maxScore) * 100;
}

/**
 * Get maturity level from score (0-100 scale)
 */
export function getMaturityFromScore(score: number): 'Weak' | 'Developing' | 'Strong' {
  if (score >= 70) return 'Strong';
  if (score >= 50) return 'Developing';
  return 'Weak';
}

/**
 * Get risk level from score (inverse - lower scores = higher risk)
 */
export function getRiskFromScore(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 70) return 'Low';
  if (score >= 40) return 'Medium';
  return 'High';
}

// ============= DECISION SIGNAL SYSTEM (Pulse V2) =============

export type DecisionSignal = 'go' | 'iterate' | 'hold';

export interface DecisionSignalData {
  signal: DecisionSignal;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: 'CheckCircle' | 'ArrowRight' | 'XCircle';
}

/**
 * Get the decision signal (Go/Iterate/Hold) based on score
 * Aligned with Pulse V2 specification for actionable decision-making
 */
export function getDecisionSignal(score: number): DecisionSignalData {
  if (score >= 75) {
    return {
      signal: 'go',
      label: 'GO',
      description: 'Proceed to production. Script is greenlight-ready with strong commercial elements and minimal rewrites required.',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      icon: 'CheckCircle',
    };
  }
  if (score >= 50) {
    return {
      signal: 'iterate',
      label: 'ITERATE',
      description: 'Proceed with development. Requires focused structural and character rewrites before packaging. High potential with identified improvements.',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      borderColor: 'border-chart-4/30',
      icon: 'ArrowRight',
    };
  }
  return {
    signal: 'hold',
    label: 'HOLD',
    description: 'Not recommended in current state. Requires significant foundational work on structure, characters, and tonal cohesion before reconsideration.',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
    icon: 'XCircle',
  };
}

/**
 * Get the readiness label based on score (0-100 scale)
 * Production-Ready (80+), High-Potential (65+), Development Stage (50+), Underdeveloped (30+), Not Viable (<30)
 */
export function getReadinessLabel(score: number): { label: string; sublabel: string; color: string; bgColor: string } {
  if (score >= 80) {
    return {
      label: 'Production-Ready',
      sublabel: 'Minimal rewrites required',
      color: 'text-success',
      bgColor: 'bg-success/10',
    };
  }
  if (score >= 65) {
    return {
      label: 'High-Potential',
      sublabel: 'Focused polish needed',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    };
  }
  if (score >= 50) {
    return {
      label: 'Development Stage',
      sublabel: 'Structural work required',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    };
  }
  if (score >= 30) {
    return {
      label: 'Underdeveloped',
      sublabel: 'Foundational issues present',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    };
  }
  return {
    label: 'Not Viable',
    sublabel: 'Core premise broken',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  };
}

// ============= MATURITY STAGE SYSTEM (USAF Redesign) =============

export type MaturityStage = 'draft' | 'developing' | 'polished' | 'production';

export interface MaturityStageData {
  stage: MaturityStage;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  progress: number; // 0-100 for visual indicator
}

/**
 * Get the maturity stage based on score
 * Distinguishes between "weak script" and "strong but unfinished"
 */
export function getMaturityStage(score: number): MaturityStageData {
  if (score >= 80) {
    return {
      stage: 'production',
      label: 'Production',
      description: 'Ready for production consideration',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      progress: 100,
    };
  }
  if (score >= 65) {
    return {
      stage: 'polished',
      label: 'Polished',
      description: 'Near-complete, polish pass recommended',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      borderColor: 'border-chart-3/30',
      progress: 75,
    };
  }
  if (score >= 40) {
    return {
      stage: 'developing',
      label: 'Developing',
      description: 'Strong foundation, focused development required',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      borderColor: 'border-chart-4/30',
      progress: 50,
    };
  }
  return {
    stage: 'draft',
    label: 'Draft',
    description: 'Early concepts, major structural work needed',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
    progress: 25,
  };
}

// ============= DIAGNOSTIC CATEGORY SYSTEM (USAF Redesign) =============

export type DiagnosticCategory = 'working' | 'underdeveloped' | 'broken';

export interface DiagnosticCategoryData {
  category: DiagnosticCategory;
  label: string;
  icon: 'CheckCircle' | 'AlertCircle' | 'XCircle';
  color: string;
  bgColor: string;
}

/**
 * Categorize a parameter score into diagnostic buckets
 * - Working: score >= 70 (things that are functioning well)
 * - Underdeveloped: 40 <= score < 70 (needs development but not broken)
 * - Broken: score < 40 (structural issues that need fixing)
 */
export function getDiagnosticCategory(score: number): DiagnosticCategoryData {
  if (score >= 70) {
    return {
      category: 'working',
      label: "What's Working",
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
    };
  }
  if (score >= 40) {
    return {
      category: 'underdeveloped',
      label: "What's Underdeveloped",
      icon: 'AlertCircle',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    };
  }
  return {
    category: 'broken',
    label: "What's Structurally Broken",
    icon: 'XCircle',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  };
}

// ============= WEIGHT TIER SYSTEM (USAF Redesign) =============

export type WeightTier = 'core' | 'standard' | 'polish';

export interface WeightTierData {
  tier: WeightTier;
  label: string;
  description: string;
  color: string;
  multiplierLabel: string;
}

/**
 * Categorize parameter weight into tiers
 * - Core: weight >= 1.2 (fundamental story elements)
 * - Standard: 0.8 <= weight < 1.2 (important but not critical)
 * - Polish: weight < 0.8 (surface-level concerns)
 */
export function getWeightTier(weight: number = 1.0): WeightTierData {
  if (weight >= 1.2) {
    return {
      tier: 'core',
      label: 'Core',
      description: 'Critical story fundamental',
      color: 'text-primary',
      multiplierLabel: `${weight.toFixed(1)}x`,
    };
  }
  if (weight >= 0.8) {
    return {
      tier: 'standard',
      label: 'Standard',
      description: 'Important element',
      color: 'text-muted-foreground',
      multiplierLabel: '',
    };
  }
  return {
    tier: 'polish',
    label: 'Polish',
    description: 'Surface-level concern',
    color: 'text-muted-foreground/60',
    multiplierLabel: `${weight.toFixed(1)}x`,
  };
}

// ============= FIX COST UTILITIES =============

export type FixCost = 'Low' | 'Medium' | 'High';

export function getFixCostColor(cost: FixCost | string | undefined): string {
  switch (cost) {
    case 'Low':
      return 'text-success';
    case 'Medium':
      return 'text-chart-4';
    case 'High':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

export function getFixCostBg(cost: FixCost | string | undefined): string {
  switch (cost) {
    case 'Low':
      return 'bg-success/10';
    case 'Medium':
      return 'bg-chart-4/10';
    case 'High':
      return 'bg-destructive/10';
    default:
      return 'bg-muted';
  }
}

// ============= DIAGNOSTIC SUMMARY UTILITIES (Report Card V2) =============

export interface DiagnosticCounts {
  working: number;
  needsWork: number;
  total: number;
}

/**
 * Get counts of working vs needs-work parameters from category scores
 * Working: score >= 65
 * Needs Work: score < 65
 */
/** Extract numeric score from a value that may be a number or {score: number, ...} object */
export function extractScore(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'score' in value) {
    const s = (value as Record<string, unknown>).score;
    if (typeof s === 'number') return s;
  }
  return 0;
}

export function getDiagnosticCounts(categoryScores: Record<string, unknown>): DiagnosticCounts {
  const scores = Object.values(categoryScores).map(extractScore);
  const working = scores.filter(s => s >= 65).length;
  const needsWork = scores.filter(s => s < 65).length;
  
  return {
    working,
    needsWork,
    total: scores.length,
  };
}

/**
 * Get the top strength category from category scores
 * Returns the highest-scoring category name (formatted)
 */
export function getTopStrength(categoryScores: Record<string, unknown>): { category: string; score: number } | null {
  const entries = Object.entries(categoryScores).map(([k, v]) => [k, extractScore(v)] as const);
  if (entries.length === 0) return null;
  
  const [topCategory, topScore] = entries.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );
  
  // Format category name: convert camelCase/snake_case to Title Case
  const formattedCategory = topCategory
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
  
  return { category: formattedCategory, score: topScore };
}

/**
 * Get sorted strengths (score >= 65) and areas needing development (score < 65)
 */
export function getSortedDiagnostics(categoryScores: Record<string, unknown>): {
  strengths: Array<{ category: string; score: number }>;
  needsDevelopment: Array<{ category: string; score: number }>;
} {
  const entries = Object.entries(categoryScores)
    .map(([category, value]) => ({
      category: category
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim(),
      score: extractScore(value),
    }))
    .sort((a, b) => b.score - a.score);
  
  return {
    strengths: entries.filter(e => e.score >= 65),
    needsDevelopment: entries.filter(e => e.score < 65),
  };
}

/**
 * Get the border color class based on decision signal
 */
export function getDecisionSignalBorderClass(score: number): string {
  if (score >= 75) return 'border-l-4 border-l-success';
  if (score >= 50) return 'border-l-4 border-l-chart-4';
  return 'border-l-4 border-l-destructive';
}
