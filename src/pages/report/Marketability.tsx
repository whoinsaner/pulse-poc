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
import { TrendingUp, Target, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export default function Marketability() {
  const { reportData, currentScore, stakeholderLens } = useOutletContext<ReportContextValue>();

  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });

  // Get market-related parameters
  const marketParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('market') || 
    p.parameterName?.toLowerCase().includes('commercial') ||
    p.parameterName?.toLowerCase().includes('audience') ||
    p.parameterName?.toLowerCase().includes('franchise') ||
    p.parameterName?.toLowerCase().includes('appeal')
  ) || [];

  const marketScore = marketParams.length > 0 
    ? marketParams.reduce((sum, p) => sum + p.score, 0) / marketParams.length 
    : reportData.categoryScores?.['Market'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['Market'] === 'number'
    ? reportData.categoryScores['Market']
    : (reportData.categoryScores?.['Market'] as { score?: number })?.score || marketScore;

  // Script metadata for context
  const scriptMeta = reportData.scriptMetadata;
  const genre = scriptMeta?.genre || 'Drama';
  
  // Derived market metrics
  const marketMetrics = [
    { label: 'Commercial Appeal', score: Math.min(10, categoryScore), description: 'Broad audience potential' },
    { label: 'Genre Clarity', score: Math.min(10, categoryScore + 0.5), description: 'Easy to categorize and market' },
    { label: 'Franchise Potential', score: Math.min(10, categoryScore - 0.8), description: 'Sequel/expansion possibilities' },
    { label: 'Star Vehicle', score: Math.min(10, categoryScore + 0.3), description: 'Attractiveness to talent' },
  ];

  const strengths = marketParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = marketParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  // Platform fit analysis
  const platformFit = [
    { platform: 'Theatrical Wide', fit: categoryScore >= 7 ? 'Good' : 'Limited', notes: 'Requires strong commercial elements' },
    { platform: 'Theatrical Limited', fit: categoryScore >= 5 ? 'Excellent' : 'Good', notes: 'Quality positioning with expansion potential' },
    { platform: 'Streaming Premium', fit: 'Excellent', notes: 'Ideal for Netflix/Amazon/Apple originals' },
    { platform: 'Streaming Standard', fit: 'Good', notes: 'Would perform well across platforms' },
  ];

  // Filter parameters based on stakeholder lens
  const filteredMarketParams = filterParameters(marketParams);
  const filterStats = getFilterStats(marketParams);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Marketability Analysis"
        subtitle="Evaluating commercial viability, audience appeal, and distribution potential"
        icon={TrendingUp}
        score={categoryScore}
      />

      {/* Stakeholder Filter Notice */}
      {isFiltered && stakeholderLens && (
        <StakeholderFilterNotice 
          stakeholderLens={stakeholderLens}
          shownCount={filterStats.shown}
          totalCount={filterStats.total}
        />
      )}

      {/* Market Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Verdict */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Strong Commercial Potential' : categoryScore >= 5 ? 'Niche Market Position' : 'Limited Commercial Appeal'}
        content={
          categoryScore >= 7 
            ? `This ${genre} script occupies a commercially viable space with clear audience appeal. Strong positioning for both theatrical and streaming distribution.`
            : categoryScore >= 5
            ? `The script has a defined audience but may require strategic positioning. Best suited for quality-focused distribution or streaming platforms.`
            : `Commercial positioning is challenging. Consider strengthening genre elements or targeting a more specific niche audience.`
        }
      />

      {/* Platform Fit */}
      <Card className="p-6">
        <SubSectionHeader title="Platform Fit Analysis" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Platform</th>
                <th className="text-left py-3 px-4 font-medium">Fit</th>
                <th className="text-left py-3 px-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {platformFit.map((platform, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-3 px-4 font-medium">{platform.platform}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      platform.fit === 'Excellent' ? 'bg-success/20 text-success' :
                      platform.fit === 'Good' ? 'bg-chart-3/20 text-chart-3' :
                      'bg-warning/20 text-warning'
                    )}>
                      {platform.fit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{platform.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Parameter Breakdown */}
      {filteredMarketParams.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Market Parameters" />
          <div className="space-y-4">
            {filteredMarketParams.slice(0, 8).map((param, index) => (
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
          strengths={strengths.length > 0 ? strengths : [{ text: 'Clear genre positioning' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'May require strategic positioning' }]}
        />
      ) : (
        <StrengthWeaknessList
          strengths={[
            { text: 'Clear genre positioning' },
            { text: 'Strong lead role attractive to talent' },
            { text: 'Works across multiple platforms' },
          ]}
          weaknesses={[
            { text: 'Limited franchise potential' },
            { text: 'Requires star attachment for wide theatrical' },
          ]}
        />
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Market Recommendations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryScore < 7 && (
            <RecommendationCard
              title="Strengthen Commercial Elements"
              description="Consider ways to broaden appeal without compromising artistic vision."
              priority="high"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Target Premium Streamers"
            description="Position as prestige content for quality-focused streaming platforms."
            priority={categoryScore >= 7 ? 'high' : 'medium'}
            effort="easy"
          />
          <RecommendationCard
            title="Attach A-List Talent"
            description="Strong performances can elevate commercial potential and distribution options."
            priority="high"
            effort="difficult"
          />
          <RecommendationCard
            title="Consider Alternative Formats"
            description="The material might also work as a limited series if film doesn't move forward."
            priority="low"
            effort="moderate"
          />
        </div>
      </Card>
    </div>
  );
}
