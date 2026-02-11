import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { ProductionNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Film } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CommercialProduction() {
  const context = useOutletContext<ReportContextValue>();

  const executionParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => p.category === 'Execution')
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
    if (executionParameters.length === 0) return 0;
    return Math.round(executionParameters.reduce((sum, p) => sum + p.score, 0) / executionParameters.length);
  }, [executionParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Production Viability"
        subtitle="Budget feasibility, location requirements, and production complexity"
        icon={Film}
        score={sectionScore}
      />

      {context.reportData.agentContent?.ExecutionAgent && (
        <ProductionNarrativePanel content={context.reportData.agentContent.ExecutionAgent} />
      )}

      <WeightedParameterList
        parameters={executionParameters}
        title="Production Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={10}
      />
    </div>
  );
}
