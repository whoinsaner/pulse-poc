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
import { Heart, BookOpen, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function ThemeMoral() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  // Get theme-related parameters
  const themeParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('theme') || 
    p.parameterName?.toLowerCase().includes('theme') ||
    p.parameterName?.toLowerCase().includes('moral') ||
    p.parameterName?.toLowerCase().includes('message') ||
    p.parameterName?.toLowerCase().includes('meaning')
  ) || [];

  const themeScore = themeParams.length > 0 
    ? themeParams.reduce((sum, p) => sum + p.score, 0) / themeParams.length 
    : reportData.categoryScores?.['Theme'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['Theme'] === 'number'
    ? reportData.categoryScores['Theme']
    : (reportData.categoryScores?.['Theme'] as { score?: number })?.score || themeScore;

  // Derived theme metrics
  const themeMetrics = [
    { label: 'Theme Clarity', score: Math.min(10, categoryScore + 0.2), description: 'How clearly the central theme emerges' },
    { label: 'Thematic Integration', score: Math.min(10, categoryScore - 0.3), description: 'Theme woven through all story elements' },
    { label: 'Moral Complexity', score: Math.min(10, categoryScore + 0.5), description: 'Nuance in ethical questions posed' },
    { label: 'Universal Resonance', score: Math.min(10, categoryScore), description: 'Theme speaks to broad human experience' },
  ];

  const strengths = themeParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = themeParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  // Get theme-related insights
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

      {/* Theme Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {themeMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core Theme Assessment */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Strong Thematic Foundation' : categoryScore >= 5 ? 'Theme Needs Development' : 'Thematic Issues'}
        content={
          categoryScore >= 7 
            ? 'The script explores meaningful themes with nuance and complexity. The moral core emerges organically through character choices and story events.'
            : categoryScore >= 5
            ? 'Thematic elements are present but could be more deeply integrated into the narrative fabric. Consider how every scene can reinforce the central theme.'
            : 'The theme is unclear or poorly integrated. Focus on identifying a core question and ensuring the story explores it through action and consequence.'
        }
      />

      {/* Parameter Breakdown */}
      {themeParams.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Theme Parameters" />
          <div className="space-y-4">
            {themeParams.slice(0, 8).map((param, index) => (
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

      {/* Theme Insights */}
      {themeInsights.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Thematic Insights" />
          <div className="space-y-3">
            {themeInsights.slice(0, 4).map((insight, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Moral Questions */}
      <Card className="p-6">
        <SubSectionHeader title="Moral Complexity Analysis" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Moral Nuance</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Does the story present moral questions without easy answers?
            </p>
            <ScoreBar score={themeMetrics[2].score} showValue={false} />
            <p className="text-xs text-muted-foreground mt-2">
              {themeMetrics[2].score >= 7 
                ? 'Strong moral complexity — audiences will reflect on these questions' 
                : themeMetrics[2].score >= 5 
                ? 'Some moral depth, could explore gray areas further'
                : 'Moral dimension is too black and white'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-chart-3/10 border border-chart-3/30">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-chart-3" />
              <h4 className="font-semibold">Theme Integration</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Is the theme woven through plot, character, and dialogue?
            </p>
            <ScoreBar score={themeMetrics[1].score} showValue={false} />
            <p className="text-xs text-muted-foreground mt-2">
              {themeMetrics[1].score >= 7 
                ? 'Theme is consistently reinforced through all story elements' 
                : themeMetrics[1].score >= 5 
                ? 'Theme appears but integration is inconsistent'
                : 'Theme feels separate from the actual story'}
            </p>
          </div>
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) ? (
        <StrengthWeaknessList
          strengths={strengths.length > 0 ? strengths : [{ text: 'Theme is identifiable' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'Could integrate theme more deeply' }]}
        />
      ) : (
        <StrengthWeaknessList
          strengths={[
            { text: 'Primary theme is relatable and meaningful' },
            { text: 'Theme emerges organically through character action' },
            { text: 'Ending honors thematic questions' },
          ]}
          weaknesses={[
            { text: 'Secondary themes could be more developed' },
            { text: 'Some thematic moments feel too explicit' },
          ]}
        />
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Theme Recommendations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryScore < 7 && (
            <RecommendationCard
              title="Strengthen Theme Integration"
              description="Review each scene to ensure it reinforces or develops the central theme through character choices and consequences."
              priority="high"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Develop Secondary Themes"
            description="Identify supporting themes that can add layers of meaning without diluting the central message."
            priority={categoryScore < 6 ? 'high' : 'medium'}
            effort="moderate"
          />
          <RecommendationCard
            title="Trust the Subtext"
            description="Allow the theme to emerge through action rather than stating it explicitly through dialogue."
            priority="medium"
            effort="easy"
          />
          <RecommendationCard
            title="Add Moral Complexity"
            description="Ensure opposing viewpoints have validity — the best themes are questions, not answers."
            priority="medium"
            effort="moderate"
          />
        </div>
      </Card>
    </div>
  );
}
