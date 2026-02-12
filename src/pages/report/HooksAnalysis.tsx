import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Zap } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
}

export default function HooksAnalysis() {
  const { reportData } = useOutletContext<ReportContextValue>();

  // Get hook/shareability related parameters
  const hookParams = reportData.parameterScores?.filter(p =>
    p.parameterName?.toLowerCase().includes('hook') ||
    p.parameterName?.toLowerCase().includes('share') ||
    p.parameterName?.toLowerCase().includes('viral') ||
    p.parameterName?.toLowerCase().includes('opening') ||
    p.parameterName?.toLowerCase().includes('attention') ||
    p.category?.toLowerCase().includes('hook')
  ) || [];

  const hookScore = hookParams.length > 0
    ? hookParams.reduce((sum, p) => sum + p.score, 0) / hookParams.length
    : 0;

  // Agent content
  const agentContent = reportData.agentContent?.ConceptAgent || reportData.agentContent?.WebSeriesAgent;
  const agentName = reportData.agentContent?.ConceptAgent ? 'ConceptAgent' : 'WebSeriesAgent';

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Hook Efficiency"
        subtitle="First 30 seconds viewer capture and social media amplification potential"
        icon={Zap}
        score={hookScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName={agentName} content={agentContent} />
      )}

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={hookParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Hook & Shareability Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />
    </div>
  );
}
