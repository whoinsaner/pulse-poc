import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Eye } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CraftVisual() {
  const context = useOutletContext<ReportContextValue>();

  const visualParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p =>
        p.parameterName.includes('visual') ||
        p.parameterName.includes('world') ||
        p.parameterName.includes('atmosphere') ||
        p.parameterName.includes('setting')
      )
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
    if (visualParameters.length === 0) return 0;
    return Math.round(visualParameters.reduce((sum, p) => sum + p.score, 0) / visualParameters.length);
  }, [visualParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Visual Storytelling"
        subtitle="World-building, atmosphere, and visual narrative"
        icon={Eye}
        score={sectionScore}
      />

      {context.reportData.agentContent?.WorldLogicAgent && (
        <AgentNarrativePanel agentName="WorldLogicAgent" content={context.reportData.agentContent.WorldLogicAgent} />
      )}

      <WeightedParameterList
        parameters={visualParameters}
        title="Visual & World Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={10}
      />
    </div>
  );
}
