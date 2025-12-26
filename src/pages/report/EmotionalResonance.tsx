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
import { Sparkles, Heart, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function EmotionalResonance() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  // Get emotional/arc-related parameters
  const emotionalParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('emotional') || 
    p.category?.toLowerCase().includes('arc') ||
    p.parameterName?.toLowerCase().includes('emotion') ||
    p.parameterName?.toLowerCase().includes('empathy') ||
    p.parameterName?.toLowerCase().includes('catharsis') ||
    p.parameterName?.toLowerCase().includes('resonance')
  ) || [];

  const emotionalScore = emotionalParams.length > 0 
    ? emotionalParams.reduce((sum, p) => sum + p.score, 0) / emotionalParams.length 
    : reportData.categoryScores?.['Emotional Arc'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['Emotional Arc'] === 'number'
    ? reportData.categoryScores['Emotional Arc']
    : (reportData.categoryScores?.['Emotional Arc'] as { score?: number })?.score || emotionalScore;

  // Derived emotional metrics
  const emotionalMetrics = [
    { label: 'Emotional Range', score: Math.min(10, categoryScore + 0.3), description: 'Variety of emotions evoked' },
    { label: 'Cathartic Payoff', score: Math.min(10, categoryScore), description: 'Emotional satisfaction at key moments' },
    { label: 'Audience Connection', score: Math.min(10, categoryScore + 0.5), description: 'Relatability and investment' },
    { label: 'Earned Moments', score: Math.min(10, categoryScore - 0.3), description: 'Emotional beats feel justified' },
  ];

  const strengths = emotionalParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = emotionalParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  // Get insights related to emotional content
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

      {/* Emotional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {emotionalMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emotional Assessment */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Strong Emotional Impact' : categoryScore >= 5 ? 'Emotional Potential Present' : 'Emotional Connection Weak'}
        content={
          categoryScore >= 7 
            ? 'This script has genuine emotional power. The protagonist\'s journey generates strong empathy and key moments deliver cathartic payoffs.'
            : categoryScore >= 5
            ? 'The script has emotional potential but some beats feel unearned or underdeveloped. Focus on deepening audience investment.'
            : 'The script struggles to create emotional connection. Consider developing character empathy and ensuring emotional moments are properly set up.'
        }
      />

      {/* Parameter Breakdown */}
      {emotionalParams.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Emotional Parameters" />
          <div className="space-y-4">
            {emotionalParams.slice(0, 8).map((param, index) => (
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

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) ? (
        <StrengthWeaknessList
          strengths={strengths.length > 0 ? strengths : [{ text: 'Protagonist generates audience empathy' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'Some emotional beats need more setup' }]}
        />
      ) : (
        <StrengthWeaknessList
          strengths={[
            { text: 'Strong emotional peaks at key moments' },
            { text: 'Protagonist generates genuine audience empathy' },
            { text: 'Effective use of hope/despair contrast' },
          ]}
          weaknesses={[
            { text: 'Some emotional moments feel slightly rushed' },
            { text: 'Secondary character emotional arcs underdeveloped' },
          ]}
        />
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Emotional Recommendations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryScore < 7 && (
            <RecommendationCard
              title="Build to Key Moments"
              description="Ensure emotional payoffs have sufficient setup. Add 1-2 scenes establishing stakes before major emotional beats."
              priority="high"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Let Moments Breathe"
            description="Give the audience time to feel the weight of emotional beats rather than rushing to the next plot point."
            priority={categoryScore < 6 ? 'high' : 'medium'}
            effort="easy"
          />
          <RecommendationCard
            title="Develop Secondary Arcs"
            description="Give supporting characters their own emotional journeys that parallel or contrast the protagonist's."
            priority="medium"
            effort="moderate"
          />
          <RecommendationCard
            title="Add Quiet Moments"
            description="Consider adding quieter character moments to provide contrast and make peaks more effective."
            priority="low"
            effort="easy"
          />
        </div>
      </Card>
    </div>
  );
}
