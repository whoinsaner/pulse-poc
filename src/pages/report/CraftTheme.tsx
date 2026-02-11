import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Heart } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CraftTheme() {
  const context = useOutletContext<ReportContextValue>();

  const themeParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p =>
        p.parameterName.includes('theme') ||
        p.parameterName.includes('moral') ||
        p.parameterName.includes('message') ||
        p.parameterName.includes('resonance')
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
    if (themeParameters.length === 0) return 0;
    return Math.round(themeParameters.reduce((sum, p) => sum + p.score, 0) / themeParameters.length);
  }, [themeParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Theme & Meaning"
        subtitle="Thematic depth, moral complexity, and message clarity"
        icon={Heart}
        score={sectionScore}
      />

      {context.reportData.agentContent?.ThemeAgent && (
        <AgentNarrativePanel agentName="ThemeAgent" content={context.reportData.agentContent.ThemeAgent} />
      )}

      <WeightedParameterList
        parameters={themeParameters}
        title="Theme Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={10}
      />
    </div>
  );
}
