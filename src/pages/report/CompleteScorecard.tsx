import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { Card } from '@/components/ui/card';
import { SectionHeader, SubSectionHeader, ScoreDisplay, ScoreBar, ScoreBadge, VerdictBox } from '@/components/report/ui';
import { BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      score: typeof value === 'number' ? value : (value as { score?: number })?.score || 0
    }))
    .sort((a, b) => b.score - a.score);

  const parameterScores = reportData.parameterScores || [];
  const topStrengths = [...parameterScores].sort((a, b) => b.score - a.score).slice(0, 5);
  const topWeaknesses = [...parameterScores].sort((a, b) => a.score - b.score).slice(0, 5);

  const getVerdict = () => {
    if (currentScore >= 75) return { label: 'Strong Greenlight Candidate', type: 'success' as const };
    if (currentScore >= 65) return { label: 'Recommend with Revisions', type: 'finding' as const };
    if (currentScore >= 50) return { label: 'Development Needed', type: 'warning' as const };
    return { label: 'Significant Work Required', type: 'error' as const };
  };
  const verdict = getVerdict();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader title="Complete Scorecard" subtitle="Comprehensive score breakdown and analysis summary" icon={BarChart3} score={currentScore} />

      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Final Assessment</p>
        <ScoreDisplay score={currentScore} size="xl" />
        <p className={cn("mt-4 text-lg font-semibold", verdict.type === 'success' ? 'text-success' : verdict.type === 'finding' ? 'text-chart-4' : 'text-warning')}>
          {verdict.label}
        </p>
        <p className="text-sm text-muted-foreground mt-1">Viewing as {LENS_CONFIG[activeLens].label}</p>
      </Card>

      <VerdictBox type={verdict.type} title="Executive Summary" content={reportData.scriptMetadata?.logline || 'Analysis complete. Review category breakdowns for detailed insights.'} />

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
