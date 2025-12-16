import { describe, it, expect } from 'vitest';

// Test the AI agent system configuration and types
describe('AI Agent System', () => {
  const AGENTS = [
    'StructureAgent',
    'CharacterAgent', 
    'ConflictAgent',
    'ThemeAgent',
    'DialogueAgent',
    'EmotionalArcAgent',
    'WorldLogicAgent',
    'MarketAgent',
    'ExecutionAgent',
  ];

  const AGENT_PARAMETERS: Record<string, string[]> = {
    StructureAgent: ['structural_integrity', 'inciting_incident', 'midpoint_turn', 'climax_resolution'],
    CharacterAgent: ['protagonist_arc', 'character_motivation', 'character_distinctiveness', 'supporting_characters'],
    ConflictAgent: ['central_conflict', 'escalation', 'obstacles'],
    ThemeAgent: ['thematic_coherence', 'thematic_depth'],
    DialogueAgent: ['dialogue_authenticity', 'dialogue_efficiency', 'subtext'],
    EmotionalArcAgent: ['emotional_engagement', 'emotional_variety'],
    WorldLogicAgent: ['world_building', 'world_consistency'],
    MarketAgent: ['commercial_viability', 'genre_fit', 'originality'],
    ExecutionAgent: ['budget_feasibility', 'casting_appeal', 'technical_demands'],
  };

  describe('Agent Configuration', () => {
    it('has 9 analysis agents defined', () => {
      expect(AGENTS).toHaveLength(9);
    });

    it('each agent has parameters assigned', () => {
      for (const agent of AGENTS) {
        expect(AGENT_PARAMETERS[agent]).toBeDefined();
        expect(AGENT_PARAMETERS[agent].length).toBeGreaterThan(0);
      }
    });

    it('has correct total parameter count', () => {
      const totalParams = Object.values(AGENT_PARAMETERS).flat().length;
      expect(totalParams).toBe(26);
    });

    it('parameters are unique across agents', () => {
      const allParams = Object.values(AGENT_PARAMETERS).flat();
      const uniqueParams = new Set(allParams);
      expect(uniqueParams.size).toBe(allParams.length);
    });
  });

  describe('Score Validation', () => {
    function validateScore(score: number): boolean {
      return score >= 0 && score <= 100;
    }

    function validateConfidence(confidence: number): boolean {
      return confidence >= 0 && confidence <= 1;
    }

    it('validates score range 0-100', () => {
      expect(validateScore(0)).toBe(true);
      expect(validateScore(50)).toBe(true);
      expect(validateScore(100)).toBe(true);
      expect(validateScore(-1)).toBe(false);
      expect(validateScore(101)).toBe(false);
    });

    it('validates confidence range 0-1', () => {
      expect(validateConfidence(0)).toBe(true);
      expect(validateConfidence(0.5)).toBe(true);
      expect(validateConfidence(1)).toBe(true);
      expect(validateConfidence(-0.1)).toBe(false);
      expect(validateConfidence(1.1)).toBe(false);
    });
  });

  describe('Score Categories', () => {
    function getScoreCategory(score: number): string {
      if (score <= 40) return 'Weak';
      if (score <= 60) return 'Needs Work';
      if (score <= 75) return 'Competent';
      if (score <= 90) return 'Strong';
      return 'Exceptional';
    }

    it('categorizes scores correctly', () => {
      expect(getScoreCategory(30)).toBe('Weak');
      expect(getScoreCategory(50)).toBe('Needs Work');
      expect(getScoreCategory(70)).toBe('Competent');
      expect(getScoreCategory(85)).toBe('Strong');
      expect(getScoreCategory(95)).toBe('Exceptional');
    });

    it('handles boundary values', () => {
      expect(getScoreCategory(40)).toBe('Weak');
      expect(getScoreCategory(41)).toBe('Needs Work');
      expect(getScoreCategory(60)).toBe('Needs Work');
      expect(getScoreCategory(61)).toBe('Competent');
      expect(getScoreCategory(75)).toBe('Competent');
      expect(getScoreCategory(76)).toBe('Strong');
      expect(getScoreCategory(90)).toBe('Strong');
      expect(getScoreCategory(91)).toBe('Exceptional');
    });
  });

  describe('Lens Score Calculation', () => {
    interface ParameterScore {
      parameterId: string;
      score: number;
    }

    interface LensWeight {
      lens: string;
      parameterId: string;
      weight: number;
    }

    function calculateLensScore(
      lens: string,
      parameterScores: ParameterScore[],
      lensWeights: LensWeight[]
    ): number {
      const weightsForLens = lensWeights.filter(lw => lw.lens === lens);
      
      if (weightsForLens.length === 0) {
        // Return average of all scores if no weights defined
        const sum = parameterScores.reduce((acc, s) => acc + s.score, 0);
        return parameterScores.length > 0 ? Math.round(sum / parameterScores.length) : 0;
      }

      let weightedSum = 0;
      let totalWeight = 0;

      for (const lw of weightsForLens) {
        const paramScore = parameterScores.find(s => s.parameterId === lw.parameterId);
        if (paramScore) {
          weightedSum += paramScore.score * lw.weight;
          totalWeight += lw.weight;
        }
      }

      return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }

    it('calculates weighted lens score', () => {
      const scores: ParameterScore[] = [
        { parameterId: 'p1', score: 80 },
        { parameterId: 'p2', score: 60 },
      ];

      const weights: LensWeight[] = [
        { lens: 'studio_executive', parameterId: 'p1', weight: 2 },
        { lens: 'studio_executive', parameterId: 'p2', weight: 1 },
      ];

      // (80*2 + 60*1) / (2+1) = 220/3 = 73.33 -> 73
      expect(calculateLensScore('studio_executive', scores, weights)).toBe(73);
    });

    it('returns average when no weights defined', () => {
      const scores: ParameterScore[] = [
        { parameterId: 'p1', score: 80 },
        { parameterId: 'p2', score: 60 },
      ];

      expect(calculateLensScore('producer', scores, [])).toBe(70);
    });

    it('returns 0 for empty inputs', () => {
      expect(calculateLensScore('producer', [], [])).toBe(0);
    });
  });

  describe('Agent Progress Tracking', () => {
    type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

    function calculateOverallProgress(
      agentProgress: Record<string, { status: AgentStatus }>
    ): number {
      const agents = Object.values(agentProgress);
      if (agents.length === 0) return 0;
      
      const completed = agents.filter(a => a.status === 'completed').length;
      const running = agents.filter(a => a.status === 'running').length;
      
      return Math.round(((completed + running * 0.5) / AGENTS.length) * 100);
    }

    it('calculates progress with mixed states', () => {
      const progress = {
        StructureAgent: { status: 'completed' as const },
        CharacterAgent: { status: 'completed' as const },
        ConflictAgent: { status: 'running' as const },
        ThemeAgent: { status: 'pending' as const },
      };

      // 2 completed + 0.5 running = 2.5 / 9 agents = 27.78 -> 28%
      expect(calculateOverallProgress(progress)).toBe(28);
    });

    it('returns 100% when all completed', () => {
      const progress: Record<string, { status: AgentStatus }> = {};
      for (const agent of AGENTS) {
        progress[agent] = { status: 'completed' };
      }
      expect(calculateOverallProgress(progress)).toBe(100);
    });

    it('returns 0% when no progress', () => {
      expect(calculateOverallProgress({})).toBe(0);
    });
  });
});
