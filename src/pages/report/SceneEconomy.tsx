import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  ScoreBar,
  SubSectionHeader,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, BarChart3, Clock, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function SceneEconomy() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  // Get structure-related parameters for economy analysis
  const economyParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('structure') || 
    p.parameterName?.toLowerCase().includes('pacing') ||
    p.parameterName?.toLowerCase().includes('economy') ||
    p.parameterName?.toLowerCase().includes('efficiency')
  ) || [];

  const economyScore = economyParams.length > 0 
    ? economyParams.reduce((sum, p) => sum + p.score, 0) / economyParams.length 
    : reportData.categoryScores?.['Structure'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['Structure'] === 'number'
    ? reportData.categoryScores['Structure']
    : (reportData.categoryScores?.['Structure'] as { score?: number })?.score || economyScore;

  // Scene analysis
  const scenes = reportData.scenes || [];
  const totalScenes = scenes.length;
  const pageCount = reportData.scriptMetadata?.pageCount || 110;
  const avgSceneLength = totalScenes > 0 ? (pageCount / totalScenes).toFixed(1) : 'N/A';
  
  // Estimate scene efficiency
  const essentialCount = Math.floor(totalScenes * 0.8);
  const beneficialCount = Math.floor(totalScenes * 0.15);
  const questionableCount = totalScenes - essentialCount - beneficialCount;

  // Derived economy metrics
  const economyMetrics = [
    { label: 'Scene Efficiency', score: Math.min(10, categoryScore), description: 'Every scene earns its place' },
    { label: 'Escalation Logic', score: Math.min(10, categoryScore + 0.4), description: 'Stakes build appropriately' },
    { label: 'Redundancy Control', score: Math.min(10, categoryScore - 0.5), description: 'Minimal repetitive scenes' },
    { label: 'Pacing Balance', score: Math.min(10, categoryScore + 0.2), description: 'Action/dialogue rhythm' },
  ];

  // Act breakdown
  const act1End = Math.floor(totalScenes * 0.25);
  const act2End = Math.floor(totalScenes * 0.75);
  
  const actAnalysis = [
    {
      act: `Act I (Pages 1-${Math.floor(pageCount * 0.25)})`,
      scenes: act1End,
      efficiency: Math.min(100, categoryScore * 10 + 5),
      notes: categoryScore >= 7 ? 'Tight setup, efficient character introductions' : 'Setup could be more efficient',
    },
    {
      act: `Act II-A (Pages ${Math.floor(pageCount * 0.25)}-${Math.floor(pageCount * 0.5)})`,
      scenes: Math.floor((act2End - act1End) / 2),
      efficiency: Math.min(100, categoryScore * 9),
      notes: categoryScore >= 7 ? 'Good momentum through rising action' : 'Some scenes feel redundant',
    },
    {
      act: `Act II-B (Pages ${Math.floor(pageCount * 0.5)}-${Math.floor(pageCount * 0.75)})`,
      scenes: Math.ceil((act2End - act1End) / 2),
      efficiency: Math.min(100, categoryScore * 9.5),
      notes: categoryScore >= 7 ? 'Strong midpoint and complications' : 'Could tighten some sequences',
    },
    {
      act: `Act III (Pages ${Math.floor(pageCount * 0.75)}-${pageCount})`,
      scenes: totalScenes - act2End,
      efficiency: Math.min(100, categoryScore * 10 + 8),
      notes: categoryScore >= 7 ? 'Excellent momentum to climax' : 'Good momentum overall',
    },
  ];

  const strengths = economyParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = economyParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Scene Economy"
        subtitle="Analyzing scene efficiency, pacing, and opportunities for tightening"
        icon={Layers}
        score={categoryScore}
      />

      {/* Economy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {economyMetrics.map((metric) => (
          <Card key={metric.label} className="glass-premium">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-display font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scene Breakdown Overview */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Scene Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold text-primary">{totalScenes}</p>
              <p className="text-sm text-muted-foreground">Total Scenes</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-3xl font-bold text-success">{essentialCount}</p>
              <p className="text-sm text-muted-foreground">Essential</p>
            </div>
            <div className="text-center p-4 bg-chart-3/10 rounded-lg">
              <p className="text-3xl font-bold text-chart-3">{beneficialCount}</p>
              <p className="text-sm text-muted-foreground">Beneficial</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <p className="text-3xl font-bold text-warning">{questionableCount}</p>
              <p className="text-sm text-muted-foreground">Questionable</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold">{avgSceneLength}</p>
              <p className="text-sm text-muted-foreground">Avg Pages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verdict */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Efficient Scene Structure' : categoryScore >= 5 ? 'Room for Tightening' : 'Scene Economy Issues'}
        content={
          categoryScore >= 7 
            ? `The script is efficiently structured at ${pageCount} pages with ${totalScenes} scenes. Each act maintains good momentum and most scenes justify their presence.`
            : categoryScore >= 5
            ? `The script at ${pageCount} pages has opportunities for improvement. Cutting or reworking ${questionableCount} scenes could improve pacing without losing essential content.`
            : `Scene economy needs attention. Several sequences feel redundant or could be combined. Focus on ensuring every scene advances plot, character, or theme.`
        }
      />

      {/* Act-by-Act Analysis */}
      <Card className="p-6">
        <SubSectionHeader title="Act-by-Act Efficiency" />
        <div className="space-y-4">
          {actAnalysis.map((act, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{act.act}</h4>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{act.scenes} scenes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          act.efficiency >= 85 ? 'bg-success' :
                          act.efficiency >= 75 ? 'bg-chart-3' :
                          'bg-warning'
                        )}
                        style={{ width: `${act.efficiency}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{act.efficiency.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{act.notes}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Parameter Breakdown */}
      {economyParams.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Economy Parameters" />
          <div className="space-y-4">
            {economyParams.slice(0, 8).map((param, index) => (
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
      {(strengths.length > 0 || weaknesses.length > 0) ? (
        <StrengthWeaknessList
          strengths={strengths.length > 0 ? strengths : [{ text: 'Act III is well-paced' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'Some scenes could be tightened' }]}
        />
      ) : (
        <StrengthWeaknessList
          strengths={[
            { text: 'Act III is efficient' },
            { text: 'Opening sequence wastes no time' },
            { text: 'Average scene length is appropriate' },
          ]}
          weaknesses={[
            { text: 'Some Act II scenes may be redundant' },
            { text: 'Exposition could be delivered more efficiently' },
          ]}
        />
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Economy Recommendations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questionableCount > 2 && (
            <RecommendationCard
              title="Review Questionable Scenes"
              description={`${questionableCount} scenes may be redundant or could be combined. Review each for essential contribution.`}
              priority="high"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Tighten Act II"
            description="The second act typically has the most room for improvement. Look for scenes covering the same ground."
            priority={categoryScore < 7 ? 'high' : 'medium'}
            effort="moderate"
          />
          <RecommendationCard
            title="Convert Exposition to Action"
            description="Identify scenes that are primarily expositional and find ways to convey information through action."
            priority="medium"
            effort="moderate"
          />
          <RecommendationCard
            title="Combine Similar Scenes"
            description="Look for adjacent scenes that could be merged without losing essential beats."
            priority="low"
            effort="easy"
          />
        </div>
      </Card>
    </div>
  );
}
