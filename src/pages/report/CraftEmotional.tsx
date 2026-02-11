import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Sparkles } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CraftEmotional() {
  const context = useOutletContext<ReportContextValue>();

  const emotionalParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p =>
        p.parameterName.includes('emotion') ||
        p.parameterName.includes('tone') ||
        p.parameterName.includes('catharsis')
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
    if (emotionalParameters.length === 0) return 0;
    return Math.round(emotionalParameters.reduce((sum, p) => sum + p.score, 0) / emotionalParameters.length);
  }, [emotionalParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Emotional Arc"
        subtitle="Emotional progression, tonal control, and cathartic payoff"
        icon={Sparkles}
        score={sectionScore}
      />

      {context.reportData.agentContent?.EmotionalArcAgent && (
        <AgentNarrativePanel agentName="EmotionalArcAgent" content={context.reportData.agentContent.EmotionalArcAgent} />
      )}

      <WeightedParameterList
        parameters={emotionalParameters}
        title="Emotional Arc Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={10}
      />
    </div>
  );
}
