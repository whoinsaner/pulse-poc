import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { MessageCircle } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function ComicLettering() {
  const context = useOutletContext<ReportContextValue>();

  const parameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => p.category === 'Comic Dialogue')
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

  const agentContent = context?.reportData?.agentContent?.['LetteringBalloonAgent'];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Lettering & Dialogue"
        subtitle="Balloon placement, word economy, and text-to-art balance"
        icon={MessageCircle}
        score={sectionScore}
      />

      {agentContent && (
        <AgentNarrativePanel
          agentName="LetteringBalloonAgent"
          content={agentContent}
        />
      )}

      <WeightedParameterList
        parameters={parameters}
        title="Lettering Parameters"
        initiallyExpanded={true}
      />
    </div>
  );
}
