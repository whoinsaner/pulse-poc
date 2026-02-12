import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  StrengthWeaknessList,
  WeightedParameterList,
} from '@/components/report/ui';
import { Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function StructuralEngineering() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  const structureParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('structure') || 
    p.parameterName?.toLowerCase().includes('structure') ||
    p.parameterName?.toLowerCase().includes('pacing') ||
    p.parameterName?.toLowerCase().includes('act') ||
    p.parameterName?.toLowerCase().includes('beat')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Structure']) || 
    (structureParams.length > 0 
      ? structureParams.reduce((sum, p) => sum + p.score, 0) / structureParams.length 
      : currentScore);

  const scenes = reportData.scenes || [];
  const totalScenes = scenes.length;
  const pageCount = reportData.scriptMetadata?.pageCount || 120;

  const agentContent = reportData.agentContent?.StructureAgent;

  const strengths = structureParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = structureParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Structural Engineering"
        subtitle="Analyzing act construction, beat timing, and narrative architecture"
        icon={Building}
        score={categoryScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="StructureAgent" content={agentContent} />
      )}

      {/* Structural Identity */}
      <Card className="p-6">
        <SubSectionHeader title="Structural Identity" />
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-display font-medium mb-3">Script Structure</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Page Count</span>
                <span className="font-mono font-medium">{pageCount} pages</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Scene Count</span>
                <span className="font-mono font-medium">{totalScenes} scenes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Avg. Scene Length</span>
                <span className="font-mono font-medium">{totalScenes > 0 ? (pageCount / totalScenes).toFixed(1) : 'N/A'} pages</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={structureParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Structure Parameters"
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
