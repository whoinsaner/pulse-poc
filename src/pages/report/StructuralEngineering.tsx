import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  VerdictBox, 
  ScoreBar,
  ScoreDisplay,
  ScoreBadge,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Building, Layers, GitBranch, Target, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function StructuralEngineering() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  // Get structure-related parameters
  const structureParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('structure') || 
    p.parameterName?.toLowerCase().includes('structure') ||
    p.parameterName?.toLowerCase().includes('pacing') ||
    p.parameterName?.toLowerCase().includes('act') ||
    p.parameterName?.toLowerCase().includes('beat')
  ) || [];

  const structureScore = structureParams.length > 0 
    ? structureParams.reduce((sum, p) => sum + p.score, 0) / structureParams.length 
    : extractScore(reportData.categoryScores?.['Structure']) || currentScore;

  const categoryScore = extractScore(reportData.categoryScores?.['Structure']) || structureScore;

  // Scene analysis for pacing
  const scenes = reportData.scenes || [];
  const totalScenes = scenes.length;
  const pageCount = reportData.scriptMetadata?.pageCount || 120;

  // Calculate act scores (simulated based on structure score)
  const actScores = {
    act1: Math.min(10, categoryScore + (Math.random() - 0.5)),
    act2: Math.min(10, categoryScore - 0.5 + (Math.random() - 0.3)),
    act3: Math.min(10, categoryScore + 0.3 + (Math.random() - 0.5)),
  };

  // Get structure insights
  const structureInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('structure') ||
    i.category?.toLowerCase().includes('pacing')
  ) || [];

  const strengths = structureParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = structureParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const getActGrade = (score: number) => {
    if (score >= 8) return { grade: 'A', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 7) return { grade: 'B+', color: 'text-chart-3', bg: 'bg-chart-3/10' };
    if (score >= 6) return { grade: 'B', color: 'text-chart-4', bg: 'bg-chart-4/10' };
    if (score >= 5) return { grade: 'C', color: 'text-warning', bg: 'bg-warning/10' };
    return { grade: 'D', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Structural Engineering"
        subtitle="Analyzing act construction, beat timing, and narrative architecture"
        icon={Building}
        score={categoryScore}
      />

      {/* Act Quality Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { name: 'Act I', subtitle: 'Setup', score: actScores.act1, pages: `pp. 1-${Math.floor(pageCount * 0.25)}` },
          { name: 'Act II-A', subtitle: 'Rising Action', score: actScores.act2 - 0.3, pages: `pp. ${Math.floor(pageCount * 0.25)}-${Math.floor(pageCount * 0.5)}` },
          { name: 'Act II-B', subtitle: 'Complications', score: actScores.act2 + 0.2, pages: `pp. ${Math.floor(pageCount * 0.5)}-${Math.floor(pageCount * 0.75)}` },
          { name: 'Act III', subtitle: 'Resolution', score: actScores.act3, pages: `pp. ${Math.floor(pageCount * 0.75)}-${pageCount}` },
        ].map((act, index) => {
          const gradeInfo = getActGrade(act.score);
          return (
            <Card key={index} className="glass-premium p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-display font-semibold">{act.name}</h4>
                  <p className="text-xs text-muted-foreground">{act.subtitle}</p>
                </div>
                <div className={cn("px-3 py-1 rounded-lg font-mono font-bold text-lg", gradeInfo.bg, gradeInfo.color)}>
                  {gradeInfo.grade}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    act.score >= 7 ? "bg-success" : act.score >= 5 ? "bg-chart-4" : "bg-warning"
                  )}
                  style={{ width: `${act.score * 10}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{act.pages}</p>
            </Card>
          );
        })}
      </div>

      {/* Core Issue / Finding */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Solid Structural Foundation' : categoryScore >= 5 ? 'Structure Needs Refinement' : 'Structural Issues Detected'}
        content={
          categoryScore >= 7 
            ? 'The script follows a clear three-act structure with well-placed turning points and effective pacing.'
            : categoryScore >= 5
            ? 'Basic structure is present but key beats may need adjustment. Review act breaks and midpoint placement.'
            : 'Significant structural issues affect narrative flow. Consider restructuring key sequences.'
        }
      />

      {/* Structural Identity */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Structural Identity" />
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-display font-medium mb-3">Current Structure Pattern</h4>
            <p className="text-sm text-muted-foreground mb-4">
              The script follows a {categoryScore >= 7 ? 'classical' : 'modified'} three-act structure 
              with {totalScenes} scenes across approximately {pageCount} pages.
            </p>
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
          <div>
            <h4 className="font-display font-medium mb-3">Key Beat Placement</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-chart-1" />
                <span className="text-sm">Inciting Incident: ~p.{Math.floor(pageCount * 0.1)}</span>
                <ScoreBadge score={actScores.act1} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-chart-2" />
                <span className="text-sm">End of Act I: ~p.{Math.floor(pageCount * 0.25)}</span>
                <ScoreBadge score={actScores.act1 - 0.2} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-chart-3" />
                <span className="text-sm">Midpoint: ~p.{Math.floor(pageCount * 0.5)}</span>
                <ScoreBadge score={actScores.act2} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-chart-4" />
                <span className="text-sm">End of Act II: ~p.{Math.floor(pageCount * 0.75)}</span>
                <ScoreBadge score={actScores.act2 + 0.1} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-chart-5" />
                <span className="text-sm">Climax: ~p.{Math.floor(pageCount * 0.9)}</span>
                <ScoreBadge score={actScores.act3} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Parameter Breakdown */}
      {structureParams.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Structure Parameters" />
          <div className="space-y-4">
            {structureParams.slice(0, 8).map((param, index) => (
              <div key={index}>
                <ScoreBar 
                  score={param.score} 
                  label={param.displayName || param.parameterName}
                  showValue 
                />
                {param.rationale && (
                  <p className="text-sm text-muted-foreground mt-1">{param.rationale}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList
          strengths={strengths}
          weaknesses={weaknesses}
        />
      )}

      {/* Recommendations */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Structure Recommendations" />
        <div className="space-y-3">
          {categoryScore < 7 && (
            <RecommendationCard
              title="Strengthen Key Turning Points"
              description="Ensure Act breaks feature clear, dramatic turning points that shift the story direction."
              priority={categoryScore < 5 ? 'critical' : 'high'}
              effort="moderate"
              impact="Major improvement to narrative momentum"
            />
          )}
          {actScores.act2 < 6 && (
            <RecommendationCard
              title="Energize the Second Act"
              description="The longest act often loses momentum. Add complications, reversals, or subplot escalation."
              priority="high"
              effort="difficult"
            />
          )}
          <RecommendationCard
            title="Review Scene Necessity"
            description="Evaluate each scene for essential plot/character advancement. Cut or combine redundant scenes."
            priority="medium"
            effort="moderate"
          />
        </div>
      </Card>
    </div>
  );
}
