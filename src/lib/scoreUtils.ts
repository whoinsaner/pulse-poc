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
