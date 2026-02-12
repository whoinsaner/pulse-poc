import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Layers } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function ComicPanelFlow() {
  const context = useOutletContext<ReportContextValue>();

  const parameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p =>
        p.category === 'Comic Visuals' ||
        p.parameterName.includes('panel') ||
        p.parameterName.includes('sequential') ||
        p.parameterName.includes('page_layout')
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
    if (parameters.length === 0) return 0;
    return Math.round(parameters.reduce((sum, p) => sum + p.score, 0) / parameters.length);
  }, [parameters]);

  const agentContent = context?.reportData?.agentContent?.['PanelFlowAgent'];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Panel Flow & Visual Sequencing"
        subtitle="How panels guide the reader's eye and control narrative pacing"
        icon={Layers}
        score={sectionScore}
      />

      {agentContent && (
        <AgentNarrativePanel
          agentName="PanelFlowAgent"
          content={agentContent}
        />
      )}

      <WeightedParameterList
        parameters={parameters}
        title="Visual Storytelling Parameters"
        initiallyExpanded={true}
      />
    </div>
  );
}
