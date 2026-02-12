import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';

import { Card } from '@/components/ui/card';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const agentContent = reportData.agentContent?.StructureAgent || reportData.agentContent?.ConflictAgent;
  const agentName = reportData.agentContent?.StructureAgent ? 'StructureAgent' : 'ConflictAgent';

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

      {/* Overall Retention Score */}
      {retentionScore > 0 && (
        <Card className="p-8 bg-gradient-to-br from-chart-4/5 via-card to-success/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">Retention Score</h3>
              <p className="text-muted-foreground">Based on pacing and engagement parameters</p>
            </div>
            <div className={cn(
              "text-5xl font-bold",
              retentionScore >= 70 ? "text-success" :
              retentionScore >= 50 ? "text-chart-4" :
              "text-warning"
            )}>
              {Math.round(retentionScore)}
            </div>
          </div>
        </Card>
      )}

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={retentionParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Retention Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />

      {/* Fallback when no data */}
      {retentionParams.length === 0 && !agentContent && (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No retention analysis data available for this report. Run an analysis to generate retention metrics.</p>
        </Card>
      )}
    </div>
  );
}
