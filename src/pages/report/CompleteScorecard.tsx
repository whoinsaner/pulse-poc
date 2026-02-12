import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { Card } from '@/components/ui/card';
import { SectionHeader, SubSectionHeader, ScoreBar, ScoreBadge, VerdictBox } from '@/components/report/ui';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { extractScore, getDecisionSignal } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CompleteScorecard() {
  const { reportData, activeLens, currentScore } = useOutletContext<ReportContextValue>();
  
  const categoryScores = Object.entries(reportData.categoryScores || {})
    .map(([name, value]) => ({
      name,
      score: extractScore(value)
    }))
    .sort((a, b) => b.score - a.score);

  const parameterScores = reportData.parameterScores || [];
  const topStrengths = [...parameterScores].sort((a, b) => b.score - a.score).slice(0, 5);
  const topWeaknesses = [...parameterScores].sort((a, b) => a.score - b.score).slice(0, 5);

  const decision = getDecisionSignal(currentScore);

  // Pull real executive summary from agent content
  const executiveSummary = (() => {
    const agents = reportData.agentContent || {};
    for (const key of ['OverviewAgent', 'ExecutiveAgent', 'StoryAgent']) {
      if (agents[key]?.verdict) return agents[key].verdict;
    }
    for (const content of Object.values(agents)) {
      if (content?.verdict) return content.verdict;
    }
    return reportData.scriptMetadata?.logline || null;
  })();

  return (
    <div className="space-y-8">
      <SectionHeader 
        title="Complete Scorecard" 
        subtitle={`${decision.label} · Viewing as ${LENS_CONFIG[activeLens].label}`}
        icon={BarChart3} 
        score={currentScore} 
      />

      {executiveSummary && (
        <VerdictBox 
          type={decision.signal === 'go' ? 'success' : decision.signal === 'iterate' ? 'finding' : 'error'} 
          title="Executive Summary" 
          content={executiveSummary} 
        />
      )}

      <Card className="p-6">
        <SubSectionHeader title="Category Breakdown" />
        <div className="space-y-3">
          {categoryScores.map((cat, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-40 text-sm font-medium truncate">{cat.name}</span>
              <div className="flex-1"><ScoreBar score={cat.score} showValue={false} /></div>
              <ScoreBadge score={cat.score} size="sm" />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-success" /><h3 className="font-semibold">Top 5 Strengths</h3></div>
          <div className="space-y-3">
            {topStrengths.map((p, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm truncate max-w-[200px]">{p.displayName || p.parameterName}</span>
                <ScoreBadge score={p.score} size="sm" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4"><TrendingDown className="h-5 w-5 text-destructive" /><h3 className="font-semibold">Top 5 Weaknesses</h3></div>
          <div className="space-y-3">
            {topWeaknesses.map((p, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm truncate max-w-[200px]">{p.displayName || p.parameterName}</span>
                <ScoreBadge score={p.score} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
