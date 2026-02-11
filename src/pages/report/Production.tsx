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
import { Film, DollarSign, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export default function Production() {
  const { reportData, currentScore, stakeholderLens } = useOutletContext<ReportContextValue>();

  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });

  // Get execution/production-related parameters
  const productionParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('execution') || 
    p.category?.toLowerCase().includes('production') ||
    p.parameterName?.toLowerCase().includes('budget') ||
    p.parameterName?.toLowerCase().includes('production') ||
    p.parameterName?.toLowerCase().includes('feasibility')
  ) || [];

  const productionScore = productionParams.length > 0 
    ? productionParams.reduce((sum, p) => sum + p.score, 0) / productionParams.length 
    : reportData.categoryScores?.['Execution'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['Execution'] === 'number'
    ? reportData.categoryScores['Execution']
    : (reportData.categoryScores?.['Execution'] as { score?: number })?.score || productionScore;

  // Scene and location analysis
  const scenes = reportData.scenes || [];
  const characters = reportData.characters || [];
  const uniqueLocations = new Set(scenes.map(s => s.location).filter(Boolean));
  const pageCount = reportData.scriptMetadata?.pageCount || 110;
  
  // Derived production metrics
  const productionMetrics = [
    { label: 'Budget Efficiency', score: Math.min(10, categoryScore), description: 'Value for production cost' },
    { label: 'Location Feasibility', score: Math.min(10, categoryScore + 0.5), description: 'Practical shooting requirements' },
    { label: 'Cast Requirements', score: Math.min(10, categoryScore + 0.2), description: 'Manageable ensemble size' },
    { label: 'VFX/Stunt Needs', score: Math.min(10, categoryScore - 0.3), description: 'Technical complexity level' },
  ];

  // Budget estimate based on script characteristics
  const getBudgetEstimate = () => {
    const locCount = uniqueLocations.size;
    const charCount = characters.length;
    
    if (locCount > 20 || charCount > 15) {
      return { low: '$20M', target: '$35M', high: '$50M' };
    } else if (locCount > 10 || charCount > 8) {
      return { low: '$10M', target: '$20M', high: '$35M' };
    } else {
      return { low: '$5M', target: '$12M', high: '$25M' };
    }
  };

  const budgetEstimate = getBudgetEstimate();

  const strengths = productionParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = productionParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  // Filter parameters based on stakeholder lens
  const filteredProductionParams = filterParameters(productionParams);
  const filterStats = getFilterStats(productionParams);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Production Analysis"
        subtitle="Evaluating budget requirements, location needs, and production feasibility"
        icon={Film}
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

      {/* Production Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {productionMetrics.map((metric) => (
          <Card key={metric.label} className="glass-premium">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-display font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Estimate */}
      <Card className="glass-premium border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <DollarSign className="h-5 w-5 text-primary" />
            Budget Estimate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 hover:border-warning/40 transition-all duration-300 group">
              <p className="text-sm text-muted-foreground mb-2">Low Budget</p>
              <p className="text-3xl font-mono font-bold text-warning">{budgetEstimate.low}</p>
              <p className="text-xs text-muted-foreground mt-2 opacity-75 group-hover:opacity-100 transition-opacity">Indie approach</p>
            </div>
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border-2 border-primary/40 hover:border-primary/60 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-sm text-muted-foreground mb-2 relative">Target Budget</p>
              <p className="text-3xl font-mono font-bold text-primary glow-gold relative">{budgetEstimate.target}</p>
              <p className="text-xs text-primary/70 mt-2 font-medium relative">Recommended</p>
            </div>
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 hover:border-success/40 transition-all duration-300 group">
              <p className="text-sm text-muted-foreground mb-2">High Budget</p>
              <p className="text-3xl font-mono font-bold text-success">{budgetEstimate.high}</p>
              <p className="text-xs text-muted-foreground mt-2 opacity-75 group-hover:opacity-100 transition-opacity">A-list package</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center font-mono">
            Based on {uniqueLocations.size} locations, {characters.length} characters, and {pageCount} pages
          </p>
        </CardContent>
      </Card>

      {/* Production Overview */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Production Requirements" />
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center hover:border-primary/40 transition-all duration-300">
            <p className="text-4xl font-mono font-bold text-primary">{scenes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Scenes</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-3/10 to-chart-3/5 border border-chart-3/20 text-center hover:border-chart-3/40 transition-all duration-300">
            <p className="text-4xl font-mono font-bold text-chart-3">{uniqueLocations.size}</p>
            <p className="text-sm text-muted-foreground mt-1">Unique Locations</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-4/10 to-chart-4/5 border border-chart-4/20 text-center hover:border-chart-4/40 transition-all duration-300">
            <p className="text-4xl font-mono font-bold text-chart-4">{characters.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Speaking Roles</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-5/10 to-chart-5/5 border border-chart-5/20 text-center hover:border-chart-5/40 transition-all duration-300">
            <p className="text-4xl font-mono font-bold text-chart-5">{pageCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Page Count</p>
          </div>
        </div>
      </Card>

      {/* Production Verdict */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Efficient Production Profile' : categoryScore >= 5 ? 'Manageable Production' : 'Production Challenges'}
        content={
          categoryScore >= 7 
            ? 'The script is efficiently structured for production with manageable location and cast requirements. Good value for investment.'
            : categoryScore >= 5
            ? 'Production is feasible but some elements may require careful budgeting. Consider consolidating locations or simplifying complex sequences.'
            : 'Significant production challenges exist. Review location count, special requirements, and cast size for cost optimization.'
        }
      />

      {/* Parameter Breakdown */}
      {filteredProductionParams.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Production Parameters" />
          <div className="space-y-4">
            {filteredProductionParams.slice(0, 8).map((param, index) => (
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
      {(strengths.length > 0 || weaknesses.length > 0) ? (
        <StrengthWeaknessList
          strengths={strengths.length > 0 ? strengths : [{ text: 'Manageable production scope' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'Some sequences may require careful budgeting' }]}
        />
      ) : (
        <StrengthWeaknessList
          strengths={[
            { text: 'Majority of locations are accessible' },
            { text: 'Cast size is manageable' },
            { text: 'Script structure allows for efficient scheduling' },
          ]}
          weaknesses={[
            { text: 'Some complex sequences may need attention' },
            { text: 'Night exteriors add premium costs' },
          ]}
        />
      )}

      {/* Recommendations */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Production Recommendations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uniqueLocations.size > 15 && (
            <RecommendationCard
              title="Consolidate Locations"
              description="Consider combining similar locations to reduce company moves and improve efficiency."
              priority="high"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Schedule Optimization"
            description="Group scenes by location and actor availability for maximum efficiency."
            priority="medium"
            effort="easy"
          />
          <RecommendationCard
            title="Consider Tax Incentives"
            description="The setting can be shot in multiple states/countries with strong incentive programs."
            priority="medium"
            effort="moderate"
          />
          <RecommendationCard
            title="Plan Complex Sequences"
            description="Identify sequences requiring special preparation and budget accordingly."
            priority={categoryScore < 6 ? 'high' : 'low'}
            effort="moderate"
          />
        </div>
      </Card>
    </div>
  );
}
