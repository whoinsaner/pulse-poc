import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { ParameterBreakdown } from '@/components/report/ParameterBreakdown';
import { AgentNarrativePanel, CommercialNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  SubSectionHeader,
  StrengthWeaknessList,
} from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function AudienceStrategy() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  const audienceParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('market') || 
    p.parameterName?.toLowerCase().includes('audience') ||
    p.parameterName?.toLowerCase().includes('appeal') ||
    p.parameterName?.toLowerCase().includes('commercial')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Market']) || 
    (audienceParams.length > 0 
      ? audienceParams.reduce((sum, p) => sum + p.score, 0) / audienceParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.MarketAgent;

  const strengths = audienceParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = audienceParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Audience Strategy"
        subtitle="Defining target audience, marketing approach, and release positioning"
        icon={Target}
        score={categoryScore}
      />

      {/* Agent Narrative with commercial extras */}
      {agentContent && (
        <CommercialNarrativePanel content={agentContent} />
      )}

      {/* Parameter Breakdown */}
      <ParameterBreakdown title="Audience Parameters" parameters={audienceParams} />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}
    </div>
  );
}
