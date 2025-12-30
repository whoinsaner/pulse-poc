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
import { Eye, Camera, Palette, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function VisualStorytelling() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  // Get visual/world-related parameters
  const visualParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('world') || 
    p.category?.toLowerCase().includes('visual') ||
    p.parameterName?.toLowerCase().includes('visual') ||
    p.parameterName?.toLowerCase().includes('setting') ||
    p.parameterName?.toLowerCase().includes('location') ||
    p.parameterName?.toLowerCase().includes('imagery')
  ) || [];

  const visualScore = visualParams.length > 0 
    ? visualParams.reduce((sum, p) => sum + p.score, 0) / visualParams.length 
    : reportData.categoryScores?.['World & Logic'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['World & Logic'] === 'number'
    ? reportData.categoryScores['World & Logic']
    : (reportData.categoryScores?.['World & Logic'] as { score?: number })?.score || visualScore;

  // Scene analysis for location data
  const scenes = reportData.scenes || [];
  const uniqueLocations = new Set(scenes.map(s => s.location).filter(Boolean));
  
  // Derived visual metrics
  const visualMetrics = [
    { label: 'Visual Imagery', score: Math.min(10, categoryScore), description: 'Strength of visual descriptions' },
    { label: 'Cinematic Potential', score: Math.min(10, categoryScore + 0.6), description: 'Translates well to screen' },
    { label: 'Show vs Tell', score: Math.min(10, categoryScore - 0.4), description: 'Visual storytelling over exposition' },
    { label: 'Location Utilization', score: Math.min(10, categoryScore + 0.3), description: 'Settings serve the story' },
  ];

  const strengths = visualParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = visualParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Visual Storytelling"
        subtitle="Evaluating cinematic imagery, visual metaphors, and directorial potential"
        icon={Eye}
        score={categoryScore}
      />

      {/* Visual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visualMetrics.map((metric) => (
          <Card key={metric.label} className="glass-premium">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-display font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core Assessment */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Strong Visual Foundation' : categoryScore >= 5 ? 'Visual Elements Need Work' : 'Visual Storytelling Issues'}
        content={
          categoryScore >= 7 
            ? 'The script demonstrates strong visual instincts with memorable imagery and effective use of locations to reinforce themes.'
            : categoryScore >= 5
            ? 'Visual elements are present but could be more distinctive. Consider opportunities to reduce dialogue and show more visually.'
            : 'The script relies too heavily on dialogue over visual storytelling. Key moments would benefit from stronger imagery.'
        }
      />

      {/* Location Overview */}
      <Card className="p-6">
        <SubSectionHeader title="Location Analysis" />
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-3xl font-bold text-primary">{scenes.length}</p>
            <p className="text-sm text-muted-foreground">Total Scenes</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-3xl font-bold text-chart-3">{uniqueLocations.size}</p>
            <p className="text-sm text-muted-foreground">Unique Locations</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-center">
            <p className="text-3xl font-bold text-chart-4">
              {uniqueLocations.size > 0 ? (scenes.length / uniqueLocations.size).toFixed(1) : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">Avg Scenes/Location</p>
          </div>
        </div>
        {scenes.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium mb-2">Top Locations:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(uniqueLocations).slice(0, 8).map((location, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Parameter Breakdown */}
      {visualParams.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Visual Parameters" />
          <div className="space-y-4">
            {visualParams.slice(0, 8).map((param, index) => (
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

      {/* Director's Opportunities */}
      <Card className="p-6">
        <SubSectionHeader title="Director's Opportunities" />
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <span className="font-medium">Visual Motif Development</span>
              <p className="text-sm text-muted-foreground">Identify recurring visual elements that can become thematic threads</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <span className="font-medium">Color Palette Contrast</span>
              <p className="text-sm text-muted-foreground">Consider how different character worlds can be distinguished visually</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div>
              <span className="font-medium">Opening/Closing Imagery</span>
              <p className="text-sm text-muted-foreground">Strengthen visual bookends to reinforce thematic arc</p>
            </div>
          </li>
        </ul>
      </Card>

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) ? (
        <StrengthWeaknessList
          strengths={strengths.length > 0 ? strengths : [{ text: 'Locations are clearly described' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'Could show more through visuals' }]}
        />
      ) : (
        <StrengthWeaknessList
          strengths={[
            { text: 'Strong opening and closing visual bookends' },
            { text: 'Locations effectively contrast character worlds' },
            { text: 'Visual metaphors reinforce theme' },
          ]}
          weaknesses={[
            { text: 'Some scenes over-rely on dialogue' },
            { text: 'Action lines occasionally lack visual specificity' },
          ]}
        />
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Visual Recommendations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryScore < 7 && (
            <RecommendationCard
              title="Replace Dialogue with Visuals"
              description="Identify scenes where information could be conveyed visually rather than through conversation."
              priority="high"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Strengthen Key Visual Moments"
            description="Ensure major turning points have distinctive, memorable imagery."
            priority={categoryScore < 6 ? 'high' : 'medium'}
            effort="moderate"
          />
          <RecommendationCard
            title="Enhance Action Lines"
            description="Make action descriptions more evocative and specific to guide the director's vision."
            priority="medium"
            effort="easy"
          />
          <RecommendationCard
            title="Add Visual Callbacks"
            description="Plant visual elements early that pay off later in the narrative."
            priority="low"
            effort="easy"
          />
        </div>
      </Card>
    </div>
  );
}
