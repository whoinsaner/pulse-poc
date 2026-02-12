import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  SubSectionHeader,
  StrengthWeaknessList,
  WeightedParameterList,
} from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function VisualStorytelling() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  const visualParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('world') || 
    p.category?.toLowerCase().includes('visual') ||
    p.parameterName?.toLowerCase().includes('visual') ||
    p.parameterName?.toLowerCase().includes('setting') ||
    p.parameterName?.toLowerCase().includes('location') ||
    p.parameterName?.toLowerCase().includes('imagery')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['World & Logic']) || 
    (visualParams.length > 0 
      ? visualParams.reduce((sum, p) => sum + p.score, 0) / visualParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.WorldLogicAgent;

  const scenes = reportData.scenes || [];
  const uniqueLocations = new Set(scenes.map(s => s.location).filter(Boolean));

  const strengths = visualParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = visualParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Visual Storytelling"
        subtitle="Evaluating cinematic imagery, visual metaphors, and directorial potential"
        icon={Eye}
        score={categoryScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="WorldLogicAgent" content={agentContent} />
      )}

      {/* Location Overview */}
      <Card className="p-6">
        <SubSectionHeader title="Location Analysis" />
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <p className="text-4xl font-mono font-bold text-primary">{scenes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Scenes</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-3/10 to-chart-3/5 border border-chart-3/20 text-center">
            <p className="text-4xl font-mono font-bold text-chart-3">{uniqueLocations.size}</p>
            <p className="text-sm text-muted-foreground mt-1">Unique Locations</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-4/10 to-chart-4/5 border border-chart-4/20 text-center">
            <p className="text-4xl font-mono font-bold text-chart-4">
              {uniqueLocations.size > 0 ? (scenes.length / uniqueLocations.size).toFixed(1) : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Avg Scenes/Location</p>
          </div>
        </div>
        {scenes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-display font-medium">Top Locations:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(uniqueLocations).slice(0, 8).map((location, idx) => (
                <span key={idx} className="px-4 py-1.5 bg-gradient-to-r from-primary/15 to-primary/10 text-primary text-sm rounded-full border border-primary/20">
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={visualParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Visual Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}
    </div>
  );
}
