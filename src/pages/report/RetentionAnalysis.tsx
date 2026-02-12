import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { BarChart3 } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
}

export default function RetentionAnalysis() {
  const { reportData } = useOutletContext<ReportContextValue>();

  // Get retention/pacing related parameters
  const retentionParams = reportData.parameterScores?.filter(p =>
    p.parameterName?.toLowerCase().includes('retention') ||
    p.parameterName?.toLowerCase().includes('pacing') ||
    p.parameterName?.toLowerCase().includes('engagement') ||
    p.parameterName?.toLowerCase().includes('momentum') ||
    p.parameterName?.toLowerCase().includes('tension') ||
    p.category?.toLowerCase().includes('retention')
  ) || [];

  const retentionScore = retentionParams.length > 0
    ? retentionParams.reduce((sum, p) => sum + p.score, 0) / retentionParams.length
    : 0;

  // Agent content
  const agentContent = reportData.agentContent?.StructureAgent || reportData.agentContent?.WebSeriesAgent;
  const agentName = reportData.agentContent?.StructureAgent ? 'StructureAgent' : 'WebSeriesAgent';

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Retention Curve Design"
        subtitle="Viewer engagement maintenance through runtime with strategic attention resets"
        icon={BarChart3}
        score={retentionScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName={agentName} content={agentContent} />
      )}

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={retentionParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Retention Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />
    </div>
  );
}
