import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  StrengthWeaknessList,
  QuoteCallout,
  WeightedParameterList,
} from '@/components/report/ui';
import { Lightbulb } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function ConceptHook() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  const conceptParams = reportData.parameterScores?.filter(p => 
    ['concept', 'concept & hook', 'hook'].includes(p.category?.toLowerCase() || '') ||
    p.parameterName?.toLowerCase().includes('concept') ||
    p.parameterName?.toLowerCase().includes('hook') ||
    p.parameterName?.toLowerCase().includes('logline') ||
    p.parameterName?.toLowerCase().includes('premise') ||
    p.parameterName?.toLowerCase().includes('originality')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Concept & Hook']) || 
    (conceptParams.length > 0 
      ? conceptParams.reduce((sum, p) => sum + p.score, 0) / conceptParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.ConceptAgent;

  const conceptInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('concept') ||
    i.category?.toLowerCase().includes('hook') ||
    i.title?.toLowerCase().includes('concept') ||
    i.title?.toLowerCase().includes('hook')
  ) || [];

  const strengths = conceptParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 100)
  }));

  const weaknesses = conceptParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 100)
  }));

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Concept & Hook"
        subtitle="Evaluating the core idea, marketability, and pitch potential"
        icon={Lightbulb}
        score={categoryScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="ConceptAgent" content={agentContent} />
      )}

      {/* Logline Analysis */}
      {reportData.scriptMetadata?.logline && (
        <Card className="p-6">
          <SubSectionHeader title="Studio-Grade Logline" />
          <QuoteCallout
            quote={reportData.scriptMetadata.logline}
            type="general"
          />
        </Card>
      )}

      {/* Parameter Scores */}
      <WeightedParameterList
        parameters={conceptParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Concept Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}

      {/* Key Findings from insights */}
      {conceptInsights.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Key Findings" />
          <div className="space-y-3">
            {conceptInsights.map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="font-display font-medium mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
