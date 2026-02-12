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
import { Target, Users, Globe, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function AudienceStrategy() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  // Get market and audience-related parameters
  const audienceParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('market') || 
    p.parameterName?.toLowerCase().includes('audience') ||
    p.parameterName?.toLowerCase().includes('appeal') ||
    p.parameterName?.toLowerCase().includes('commercial')
  ) || [];

  const audienceScore = audienceParams.length > 0 
    ? audienceParams.reduce((sum, p) => sum + p.score, 0) / audienceParams.length 
    : extractScore(reportData.categoryScores?.['Market']) || currentScore;

  const categoryScore = extractScore(reportData.categoryScores?.['Market']) || audienceScore;

  // Script metadata
  const scriptMeta = reportData.scriptMetadata;
  const genre = scriptMeta?.genre || 'Drama';
  
  // Derived audience metrics
  const audienceMetrics = [
    { label: 'Target Clarity', score: Math.min(10, categoryScore + 0.4), description: 'Well-defined core audience' },
    { label: 'Crossover Potential', score: Math.min(10, categoryScore - 0.2), description: 'Appeal beyond core demo' },
    { label: 'Word of Mouth', score: Math.min(10, categoryScore + 0.3), description: 'Shareability and discussion' },
    { label: 'Marketing Hooks', score: Math.min(10, categoryScore + 0.6), description: 'Promotable elements' },
  ];

  const strengths = audienceParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = audienceParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  // Marketing hooks based on genre and score
  const marketingHooks = [
    { hook: 'Character Journey', appeal: 'Universal', usage: 'Emotional trailers, character posters' },
    { hook: 'Genre Elements', appeal: 'Core fans', usage: 'Action-focused spots, comparison marketing' },
    { hook: 'Quality Talent', appeal: 'Quality-seekers', usage: 'Star-driven campaigns, festival positioning' },
    { hook: 'Story Hook', appeal: 'Word of mouth', usage: 'Post-release social, spoiler-free teasers' },
  ];

  // Release window analysis
  const releaseWindows = [
    { window: 'Fall Festival Season', fit: categoryScore >= 7 ? 'Excellent' : 'Good' },
    { window: 'Q4 Awards Season', fit: categoryScore >= 6 ? 'Good' : 'Limited' },
    { window: 'January/February', fit: 'Good' },
    { window: 'Summer', fit: categoryScore >= 7 ? 'Good' : 'Poor' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Audience Strategy"
        subtitle="Defining target audience, marketing approach, and release positioning"
        icon={Target}
        score={categoryScore}
      />

      {/* Audience Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {audienceMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary Audience */}
      <Card className="border-primary/30 p-6">
        <SubSectionHeader title="Primary Audience Profile" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Genre</h4>
            <p className="text-lg font-semibold text-primary">{genre}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Market Size</h4>
            <p className="text-lg font-semibold text-primary">
              {categoryScore >= 7 ? 'Large' : categoryScore >= 5 ? 'Medium' : 'Niche'}
            </p>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-medium mb-2">Positioning</h4>
            <p className="text-muted-foreground">
              {categoryScore >= 7 
                ? 'Quality genre entertainment with broad appeal. Suitable for wide release or premium streaming.'
                : categoryScore >= 5
                ? 'Quality-focused content for discerning audiences. Best positioned for platform or limited release.'
                : 'Niche appeal requiring targeted marketing. Consider specialty distributors or festival strategy.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Marketing Hooks */}
      <Card className="p-6">
        <SubSectionHeader title="Marketing Hooks" />
        <div className="space-y-4">
          {marketingHooks.map((hook, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{hook.hook}</h4>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  hook.appeal === 'Universal' ? 'bg-success/20 text-success' :
                  hook.appeal === 'Core fans' ? 'bg-chart-3/20 text-chart-3' :
                  'bg-chart-4/20 text-chart-4'
                )}>
                  {hook.appeal}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{hook.usage}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Release Windows */}
      <Card className="p-6">
        <SubSectionHeader title="Release Window Analysis" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {releaseWindows.map((window, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-muted/30 text-center">
              <p className="text-sm font-medium mb-2">{window.window}</p>
              <span className={cn(
                "px-3 py-1 rounded text-xs font-medium",
                window.fit === 'Excellent' ? 'bg-success/20 text-success' :
                window.fit === 'Good' ? 'bg-chart-3/20 text-chart-3' :
                window.fit === 'Limited' ? 'bg-warning/20 text-warning' :
                'bg-destructive/20 text-destructive'
              )}>
                {window.fit}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Campaign Verdict */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Strong Marketing Potential' : categoryScore >= 5 ? 'Targeted Campaign Needed' : 'Challenging to Position'}
        content={
          categoryScore >= 7 
            ? 'Multiple strong marketing angles available. Recommend prestige positioning with genre satisfaction. Star-driven campaign for theatrical, concept-forward for streaming.'
            : categoryScore >= 5
            ? 'Clear target audience exists but will require strategic positioning. Focus on quality markers and targeted reach rather than broad appeal.'
            : 'Marketing challenges exist. Consider repositioning, festival strategy, or specialty distribution to find the right audience.'
        }
      />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) ? (
        <StrengthWeaknessList
          strengths={strengths.length > 0 ? strengths : [{ text: 'Identifiable target audience' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'May need strategic positioning' }]}
        />
      ) : (
        <StrengthWeaknessList
          strengths={[
            { text: 'Clear genre positioning' },
            { text: 'Multiple marketing angles available' },
            { text: 'Strong word-of-mouth potential' },
          ]}
          weaknesses={[
            { text: 'May require star attachment for broad appeal' },
            { text: 'Crossover potential could be stronger' },
          ]}
        />
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Audience Recommendations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Define Core Audience First"
            description="Lock in the primary target before attempting to expand appeal to secondary audiences."
            priority="high"
            effort="easy"
          />
          <RecommendationCard
            title="Festival Premiere Strategy"
            description="Consider Toronto, Venice, or Sundance premiere to establish quality positioning."
            priority={categoryScore >= 6 ? 'high' : 'medium'}
            effort="moderate"
          />
          <RecommendationCard
            title="Dual-Track Marketing"
            description="Prepare both prestige and genre-focused campaigns for different audience segments."
            priority="medium"
            effort="moderate"
          />
          <RecommendationCard
            title="Plan Post-Release Buzz"
            description="Prepare assets for post-release word of mouth and social discussion."
            priority="low"
            effort="easy"
          />
        </div>
      </Card>
    </div>
  );
}
