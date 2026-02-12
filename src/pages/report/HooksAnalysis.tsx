import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';

import { Card } from '@/components/ui/card';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Zap, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoreDisplay } from '@/components/report/ui';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
}

export default function HooksAnalysis() {
  const { reportData } = useOutletContext<ReportContextValue>();

  // Get hook/retention related parameters
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

  // Agent content - could come from ConceptAgent or a dedicated HookAgent
  const agentContent = reportData.agentContent?.ConceptAgent;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Hook Efficiency Analysis"
        subtitle="First 30 seconds viewer capture and social media amplification potential"
        icon={Zap}
        score={hookScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="ConceptAgent" content={agentContent} />
      )}

      {/* Score Cards from real parameters */}
      {hookParams.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {hookParams.slice(0, 2).map((param, idx) => (
            <Card key={idx} className="p-8 bg-gradient-to-br from-chart-2/5 via-card to-chart-4/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-chart-2/10">
                  {idx === 0 ? <Zap className="h-8 w-8 text-chart-2" /> : <Share2 className="h-8 w-8 text-chart-4" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{param.displayName || param.parameterName}</p>
                  <p className={cn(
                    "text-4xl font-bold",
                    param.score >= 70 ? "text-success" :
                    param.score >= 50 ? "text-chart-4" :
                    "text-warning"
                  )}>
                    {Math.round(param.score)}
                  </p>
                </div>
              </div>
              {param.rationale && (
                <p className="text-muted-foreground text-sm">{param.rationale}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={hookParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Hook & Shareability Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />

      {/* Fallback when no data */}
      {hookParams.length === 0 && !agentContent && (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No hook analysis data available for this report. Run an analysis to generate hook efficiency scores.</p>
        </Card>
      )}
    </div>
  );
}
