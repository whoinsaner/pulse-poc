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
import { Heart } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function ThemeMoral() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  const themeParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('theme') || 
    p.parameterName?.toLowerCase().includes('theme') ||
    p.parameterName?.toLowerCase().includes('moral') ||
    p.parameterName?.toLowerCase().includes('message') ||
    p.parameterName?.toLowerCase().includes('meaning')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Theme']) || 
    (themeParams.length > 0 
      ? themeParams.reduce((sum, p) => sum + p.score, 0) / themeParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.ThemeAgent;

  const strengths = themeParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = themeParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const themeInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('theme') ||
    i.title?.toLowerCase().includes('theme') ||
    i.title?.toLowerCase().includes('moral')
  ) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Theme & Moral Core"
        subtitle="Analyzing thematic depth, moral complexity, and universal resonance"
        icon={Heart}
        score={categoryScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="ThemeAgent" content={agentContent} />
      )}

      {/* Theme Insights from DB */}
      {themeInsights.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Thematic Insights" />
          <div className="space-y-3">
            {themeInsights.slice(0, 4).map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <h4 className="font-display font-medium mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Parameter Breakdown */}
      <ParameterBreakdown title="Theme Parameters" parameters={themeParams} />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}
    </div>
  );
}
