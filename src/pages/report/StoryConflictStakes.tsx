import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  WeightedParameterList,
} from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { Zap, AlertTriangle } from 'lucide-react';

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
  const agentContent = reportData.agentContent?.ConflictStakesAgent || reportData.agentContent?.ConflictAgent;
  const misinterpretationRisks: string[] = agentContent?.misinterpretationRisks || [];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Conflict & Stakes"
        subtitle="Central conflict dynamics, stakes escalation, and tension"
        icon={Zap}
        score={sectionScore}
      />

      {reportData.agentContent?.ConflictStakesAgent && (
        <AgentNarrativePanel agentName="ConflictStakesAgent" content={reportData.agentContent.ConflictStakesAgent} />
      )}
      {!reportData.agentContent?.ConflictStakesAgent && reportData.agentContent?.ConflictAgent && (
        <AgentNarrativePanel agentName="ConflictAgent" content={reportData.agentContent.ConflictAgent} />
      )}

      {/* Misinterpretation Risks */}
      {misinterpretationRisks.length > 0 && (
        <Card className="p-5 flex items-start gap-4 border-warning/20 bg-warning/5">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="font-display font-semibold text-sm mb-2">Analyst Guidance — Misinterpretation Risks</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {misinterpretationRisks.map((risk, i) => (
                <li key={i}>• {risk}</li>
              ))}
            </ul>
          </div>
        </Card>
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
