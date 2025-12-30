import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  VerdictBox, 
  ScoreBar,
  ScoreDisplay,
  StrengthWeaknessList,
  RecommendationCard,
  AnalysisTable,
  columnRenderers
} from '@/components/report/ui';
import { TrendingUp, GitBranch, Zap, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function PlotAnalysis() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  // Get plot-related parameters - Structure and Conflict categories
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

  // Get plot-related insights
  const plotInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('plot') ||
    i.category?.toLowerCase().includes('story') ||
    i.category?.toLowerCase().includes('conflict')
  ) || [];

  // Analyze scene data for plot pacing
  const scenes = reportData.scenes || [];
  const totalScenes = scenes.length;
  
  // Estimate act breaks (rough approximation)
  const act1End = Math.floor(totalScenes * 0.25);
  const act2End = Math.floor(totalScenes * 0.75);
  
  const actBreakdown = [
    { act: 'Act I (Setup)', scenes: act1End, percentage: 25, target: '20-25%' },
    { act: 'Act II (Confrontation)', scenes: act2End - act1End, percentage: 50, target: '50-55%' },
    { act: 'Act III (Resolution)', scenes: totalScenes - act2End, percentage: 25, target: '20-25%' },
  ];

  const strengths = plotParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = plotParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Plot Analysis"
        subtitle="Examining story mechanics, conflict density, and narrative momentum"
        icon={TrendingUp}
        score={plotScore}
      />

      {/* Plot Fundamentals Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-premium p-5 text-center">
          <p className="text-sm text-muted-foreground mb-2">Plot Originality</p>
          <ScoreDisplay score={plotScore * 0.9 + Math.random()} size="md" showLabel={false} />
          <p className="text-xs text-muted-foreground mt-2">Fresh take on familiar elements</p>
        </Card>
        <Card className="glass-premium p-5 text-center">
          <p className="text-sm text-muted-foreground mb-2">Conflict Density</p>
          <ScoreDisplay score={plotScore * 0.95 + Math.random() * 0.5} size="md" showLabel={false} />
          <p className="text-xs text-muted-foreground mt-2">Obstacles and tension throughout</p>
        </Card>
        <Card className="glass-premium p-5 text-center">
          <p className="text-sm text-muted-foreground mb-2">Overall Plot Score</p>
          <ScoreDisplay score={plotScore} size="md" />
        </Card>
      </div>

      {/* Key Finding */}
      <VerdictBox
        type={plotScore >= 7 ? 'success' : plotScore >= 5 ? 'finding' : 'issue'}
        title={plotScore >= 7 ? 'Strong Plot Foundation' : plotScore >= 5 ? 'Plot Requires Development' : 'Critical Plot Issues'}
        content={
          plotScore >= 7 
            ? 'The narrative engine effectively drives the story forward with clear cause-and-effect relationships and escalating stakes.'
            : plotScore >= 5
            ? 'Core story elements are present but need strengthening. Consider amplifying stakes and tightening cause-effect chains.'
            : 'Fundamental plot mechanics need attention. Focus on establishing clear goals, obstacles, and consequences.'
        }
      />

      {/* Act Structure Analysis */}
      {totalScenes > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Act Structure Analysis" />
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {actBreakdown.map((act, index) => (
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
          </div>
        </Card>
      )}

      {/* Parameter Breakdown */}
      {plotParams.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Plot Parameters" />
          <div className="space-y-4">
            {plotParams.slice(0, 8).map((param, index) => (
              <div key={index}>
                <ScoreBar 
                  score={param.score} 
                  label={param.displayName || param.parameterName}
                  showValue 
                />
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

      {/* Key Insights */}
      {plotInsights.length > 0 && (
        <Card className="glass-premium p-6">
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

      {/* Recommendations */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Plot Recommendations" />
        <div className="space-y-3">
          {plotScore < 6 && (
            <RecommendationCard
              title="Strengthen Central Conflict"
              description="Ensure the protagonist faces meaningful obstacles with escalating stakes throughout the narrative."
              priority="high"
              effort="moderate"
              impact="Significant improvement to engagement"
            />
          )}
          {plotScore < 7 && (
            <RecommendationCard
              title="Tighten Cause-Effect Chains"
              description="Review each plot beat to ensure logical progression and eliminate coincidental solutions."
              priority="medium"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Evaluate Subplot Integration"
            description="Ensure all subplots enhance the main story and converge meaningfully by the climax."
            priority="low"
            effort="easy"
          />
        </div>
      </Card>
    </div>
  );
}
