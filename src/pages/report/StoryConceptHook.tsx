import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  WeightedParameterList,
} from '@/components/report/ui';
import { Lightbulb } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

const CONCEPT_CATEGORIES = ['Concept & Hook'];

export default function StoryConceptHook() {
  const context = useOutletContext<ReportContextValue>();

  const conceptParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => CONCEPT_CATEGORIES.includes(p.category))
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
    if (conceptParameters.length === 0) return 0;
    const total = conceptParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / conceptParameters.length);
  }, [conceptParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Concept & Hook"
        subtitle="Premise originality, hook strength, and franchise potential"
        icon={Lightbulb}
        score={sectionScore}
      />

      {reportData.agentContent?.ConceptAgent && (
        <AgentNarrativePanel agentName="ConceptAgent" content={reportData.agentContent.ConceptAgent} />
      )}

      <WeightedParameterList
        parameters={conceptParameters}
        title="Concept Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={6}
      />
    </div>
  );
}
