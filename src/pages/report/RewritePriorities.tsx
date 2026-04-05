import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { SectionHeader, SubSectionHeader, TieredRecommendations, VerdictBox, ScoreDisplay } from '@/components/report/ui';
import { ListTodo, AlertTriangle, Clock, Zap } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function RewritePriorities() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  const insights = reportData.insights || [];
  const params = reportData.parameterScores || [];
  
  const criticalIssues = params.filter(p => p.score < 40).map(p => ({
    title: p.displayName || p.parameterName,
    description: p.rationale || 'Requires immediate attention',
    effort: 'moderate' as const
  }));
  
  const highPriorityIssues = params.filter(p => p.score >= 40 && p.score < 60).slice(0, 5).map(p => ({
    title: p.displayName || p.parameterName,
    description: p.rationale || 'Important improvement area',
    effort: 'moderate' as const
  }));
  
  const polishItems = params.filter(p => p.score >= 60 && p.score < 75).slice(0, 5).map(p => ({
    title: p.displayName || p.parameterName,
    description: p.rationale || 'Polish and refinement opportunity',
    effort: 'easy' as const
  }));

  const tiers = [
    { label: 'Tier A: Critical / Mandatory', priority: 'critical' as const, items: criticalIssues },
    { label: 'Tier B: High-Impact Improvements', priority: 'high' as const, items: highPriorityIssues },
    { label: 'Tier C: Polish & Refinement', priority: 'medium' as const, items: polishItems },
  ].filter(t => t.items.length > 0);

  const totalIssues = criticalIssues.length + highPriorityIssues.length + polishItems.length;
  const difficulty = criticalIssues.length > 3 ? 'Difficult' : criticalIssues.length > 0 ? 'Moderate' : 'Easy';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader title="Rewrite Priorities" subtitle="Tiered action items for script improvement" icon={ListTodo} />

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-premium p-5 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-destructive" />
          <p className="text-2xl font-mono font-bold">{criticalIssues.length}</p>
          <p className="text-sm text-muted-foreground">Critical Issues</p>
        </Card>
        <Card className="glass-premium p-5 text-center">
          <Clock className="h-5 w-5 mx-auto mb-2 text-warning" />
          <p className="text-2xl font-display font-bold">{difficulty}</p>
          <p className="text-sm text-muted-foreground">Rewrite Difficulty</p>
        </Card>
        <Card className="glass-premium p-5 text-center">
          <Zap className="h-5 w-5 mx-auto mb-2 text-success" />
          <p className="text-2xl font-mono font-bold">{totalIssues}</p>
          <p className="text-sm text-muted-foreground">Total Action Items</p>
        </Card>
      </div>

      <VerdictBox
        type={criticalIssues.length === 0 ? 'success' : criticalIssues.length <= 2 ? 'warning' : 'error'}
        title={criticalIssues.length === 0 ? 'No Critical Issues' : `${criticalIssues.length} Critical Issues Identified`}
        content={criticalIssues.length === 0 
          ? 'The script has no fundamental issues requiring immediate attention. Focus on polish items.'
          : 'Address critical issues before proceeding to ensure script viability.'}
      />

      {tiers.length > 0 ? (
        <TieredRecommendations tiers={tiers} />
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No significant rewrite priorities identified. The script is in good shape!</p>
        </Card>
      )}
    </div>
  );
}
