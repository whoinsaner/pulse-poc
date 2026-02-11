import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  WeightedParameterList,
} from '@/components/report/ui';
import { Building } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

const STRUCTURE_CATEGORIES = ['Structure'];

export default function StoryStructure() {
  const context = useOutletContext<ReportContextValue>();

  const structureParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => STRUCTURE_CATEGORIES.includes(p.category))
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
    if (structureParameters.length === 0) return 0;
    const total = structureParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / structureParameters.length);
  }, [structureParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Structure"
        subtitle="Act breaks, pacing, scene necessity, and narrative architecture"
        icon={Building}
        score={sectionScore}
      />

      {reportData.agentContent?.StructureAgent && (
        <AgentNarrativePanel agentName="StructureAgent" content={reportData.agentContent.StructureAgent} />
      )}

      <WeightedParameterList
        parameters={structureParameters}
        title="Structure Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={6}
      />
    </div>
  );
}
