import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { ParameterBreakdown } from '@/components/report/ParameterBreakdown';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  SubSectionHeader,
  StrengthWeaknessList,
} from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function EmotionalResonance() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  const emotionalParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('emotional') || 
    p.category?.toLowerCase().includes('arc') ||
    p.parameterName?.toLowerCase().includes('emotion') ||
    p.parameterName?.toLowerCase().includes('empathy') ||
    p.parameterName?.toLowerCase().includes('catharsis') ||
    p.parameterName?.toLowerCase().includes('resonance')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Emotional Arc']) || 
    (emotionalParams.length > 0 
      ? emotionalParams.reduce((sum, p) => sum + p.score, 0) / emotionalParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.EmotionalArcAgent;

  const strengths = emotionalParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = emotionalParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const emotionalInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('emotion') ||
    i.category?.toLowerCase().includes('character') ||
    i.title?.toLowerCase().includes('emotion')
  ) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Emotional Resonance"
        subtitle="Analyzing audience emotional journey, cathartic moments, and connection potential"
        icon={Sparkles}
        score={categoryScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="EmotionalArcAgent" content={agentContent} />
      )}

      {/* Emotional Insights */}
      {emotionalInsights.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Key Emotional Insights" />
          <div className="space-y-3">
            {emotionalInsights.slice(0, 4).map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Parameter Breakdown */}
      <ParameterBreakdown title="Emotional Parameters" parameters={emotionalParams} />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}
    </div>
  );
}
