import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { CommercialNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { TrendingUp } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CommercialMarket() {
  const context = useOutletContext<ReportContextValue>();

  const marketParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => p.category === 'Market')
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        weight: 1.0,
      }));
  }, [context?.reportData?.parameterScores]);

  const sectionScore = useMemo(() => {
    if (marketParameters.length === 0) return 0;
    return Math.round(marketParameters.reduce((sum, p) => sum + p.score, 0) / marketParameters.length);
  }, [marketParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Market Analysis"
        subtitle="Marketability, audience fit, and comparable analysis"
        icon={TrendingUp}
        score={sectionScore}
      />

      {context.reportData.agentContent?.MarketAgent && (
        <CommercialNarrativePanel content={context.reportData.agentContent.MarketAgent} />
      )}

      <WeightedParameterList
        parameters={marketParameters}
        title="Market Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={10}
      />
    </div>
  );
}
