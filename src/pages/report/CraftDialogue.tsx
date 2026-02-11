import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { MessageSquare } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CraftDialogue() {
  const context = useOutletContext<ReportContextValue>();

  const dialogueParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p =>
        p.parameterName.includes('dialogue') ||
        p.parameterName.includes('subtext') ||
        p.parameterName.includes('exposition') ||
        p.parameterName.includes('voice')
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
    if (dialogueParameters.length === 0) return 0;
    return Math.round(dialogueParameters.reduce((sum, p) => sum + p.score, 0) / dialogueParameters.length);
  }, [dialogueParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dialogue & Subtext"
        subtitle="Voice authenticity, subtext layers, and exposition handling"
        icon={MessageSquare}
        score={sectionScore}
      />

      {context.reportData.agentContent?.DialogueAgent && (
        <AgentNarrativePanel agentName="DialogueAgent" content={context.reportData.agentContent.DialogueAgent} />
      )}

      <WeightedParameterList
        parameters={dialogueParameters}
        title="Dialogue Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={10}
      />
    </div>
  );
}
