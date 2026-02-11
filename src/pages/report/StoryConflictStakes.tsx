import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  WeightedParameterList,
} from '@/components/report/ui';
import { Zap } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

const CONFLICT_CATEGORIES = ['Conflict'];

export default function StoryConflictStakes() {
  const context = useOutletContext<ReportContextValue>();

  const conflictParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => CONFLICT_CATEGORIES.includes(p.category))
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
    if (conflictParameters.length === 0) return 0;
    const total = conflictParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / conflictParameters.length);
  }, [conflictParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Conflict & Stakes"
        subtitle="Central conflict dynamics, stakes escalation, and tension"
        icon={Zap}
        score={sectionScore}
      />

      {reportData.agentContent?.ConflictAgent && (
        <AgentNarrativePanel agentName="ConflictAgent" content={reportData.agentContent.ConflictAgent} />
      )}

      <WeightedParameterList
        parameters={conflictParameters}
        title="Conflict Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={6}
      />
    </div>
  );
}
