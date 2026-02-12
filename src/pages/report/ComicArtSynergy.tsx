import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Palette } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function ComicArtSynergy() {
  const context = useOutletContext<ReportContextValue>();

  const parameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => p.category === 'Comic Art Direction')
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

  const agentContent = context?.reportData?.agentContent?.['ArtScriptSynergyAgent'];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Art-Script Synergy"
        subtitle="How well the script serves the artist and enables visual collaboration"
        icon={Palette}
        score={sectionScore}
      />

      {agentContent && (
        <AgentNarrativePanel
          agentName="ArtScriptSynergyAgent"
          content={agentContent}
        />
      )}

      <WeightedParameterList
        parameters={parameters}
        title="Collaboration Parameters"
        initiallyExpanded={true}
      />
    </div>
  );
}
