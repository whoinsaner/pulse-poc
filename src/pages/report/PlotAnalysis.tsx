import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  VerdictBox, 
  StrengthWeaknessList,
  WeightedParameterList,
} from '@/components/report/ui';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function PlotAnalysis() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  const plotParams = reportData.parameterScores?.filter(p => 
    ['structure', 'conflict'].includes(p.category?.toLowerCase() || '') ||
    p.parameterName?.toLowerCase().includes('plot') ||
    p.parameterName?.toLowerCase().includes('story') ||
    p.parameterName?.toLowerCase().includes('conflict') ||
    p.parameterName?.toLowerCase().includes('tension') ||
    p.parameterName?.toLowerCase().includes('pacing')
  ) || [];

  const plotScore = plotParams.length > 0 
    ? plotParams.reduce((sum, p) => sum + p.score, 0) / plotParams.length 
    : currentScore;

  const plotInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('plot') ||
    i.category?.toLowerCase().includes('story') ||
    i.category?.toLowerCase().includes('conflict')
  ) || [];

  const scenes = reportData.scenes || [];
  const totalScenes = scenes.length;

  // Agent content from StructureAgent or ConflictAgent
  const structureContent = reportData.agentContent?.StructureAgent;
  const conflictContent = reportData.agentContent?.ConflictAgent;

  const strengths = plotParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = plotParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Plot Analysis"
        subtitle="Examining story mechanics, conflict density, and narrative momentum"
        icon={TrendingUp}
        score={plotScore}
      />

      {/* Agent Narratives */}
      {structureContent && (
        <AgentNarrativePanel agentName="StructureAgent" content={structureContent} />
      )}
      {conflictContent && !structureContent && (
        <AgentNarrativePanel agentName="ConflictAgent" content={conflictContent} />
      )}

      {/* Act Structure Analysis */}
      {totalScenes > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Act Structure Analysis" />
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { act: 'Act I (Setup)', scenes: Math.floor(totalScenes * 0.25), percentage: 25, target: '20-25%' },
              { act: 'Act II (Confrontation)', scenes: Math.floor(totalScenes * 0.50), percentage: 50, target: '50-55%' },
              { act: 'Act III (Resolution)', scenes: totalScenes - Math.floor(totalScenes * 0.75), percentage: 25, target: '20-25%' },
            ].map((act, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-semibold">{act.act}</span>
                  <span className="text-sm text-muted-foreground">{act.scenes} scenes</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      index === 0 ? "bg-chart-1" : index === 1 ? "bg-chart-2" : "bg-chart-3"
                    )}
                    style={{ width: `${act.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Target: {act.target}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={plotParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Plot Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}

      {/* Key Insights */}
      {plotInsights.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Plot Insights" />
          <div className="space-y-3">
            {plotInsights.map((insight, index) => (
              <VerdictBox
                key={index}
                type={insight.priority <= 1 ? 'error' : insight.priority <= 2 ? 'warning' : 'insight'}
                title={insight.title}
                content={insight.description}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
