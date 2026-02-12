import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { ParameterBreakdown } from '@/components/report/ParameterBreakdown';
import { CommercialNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  StrengthWeaknessList,
} from '@/components/report/ui';
import { TrendingUp } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export default function Marketability() {
  const { reportData, currentScore, stakeholderLens } = useOutletContext<ReportContextValue>();
  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });

  const marketParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('market') || 
    p.parameterName?.toLowerCase().includes('commercial') ||
    p.parameterName?.toLowerCase().includes('audience') ||
    p.parameterName?.toLowerCase().includes('franchise') ||
    p.parameterName?.toLowerCase().includes('appeal')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Market']) || 
    (marketParams.length > 0 
      ? marketParams.reduce((sum, p) => sum + p.score, 0) / marketParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.MarketAgent;

  const strengths = marketParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = marketParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const filteredMarketParams = filterParameters(marketParams);
  const filterStats = getFilterStats(marketParams);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Marketability Analysis"
        subtitle="Evaluating commercial viability, audience appeal, and distribution potential"
        icon={TrendingUp}
        score={categoryScore}
      />

      {isFiltered && stakeholderLens && (
        <StakeholderFilterNotice 
          stakeholderLens={stakeholderLens}
          shownCount={filterStats.shown}
          totalCount={filterStats.total}
        />
      )}

      {/* Agent Narrative with commercial extras */}
      {agentContent && (
        <CommercialNarrativePanel content={agentContent} />
      )}

      {/* Parameter Breakdown */}
      <ParameterBreakdown title="Market Parameters" parameters={filteredMarketParams} />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}
    </div>
  );
}
