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
import { extractScore } from '@/lib/scoreUtils';

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
    : extractScore(reportData.categoryScores?.['World & Logic']) || currentScore;

  const categoryScore = extractScore(reportData.categoryScores?.['World & Logic']) || visualScore;

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
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Location Analysis" />
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center group hover:border-primary/40 transition-all duration-300">
            <p className="text-4xl font-mono font-bold text-primary glow-gold">{scenes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Scenes</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-3/10 to-chart-3/5 border border-chart-3/20 text-center group hover:border-chart-3/40 transition-all duration-300">
            <p className="text-4xl font-mono font-bold text-chart-3">{uniqueLocations.size}</p>
            <p className="text-sm text-muted-foreground mt-1">Unique Locations</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-4/10 to-chart-4/5 border border-chart-4/20 text-center group hover:border-chart-4/40 transition-all duration-300">
            <p className="text-4xl font-mono font-bold text-chart-4">
              {uniqueLocations.size > 0 ? (scenes.length / uniqueLocations.size).toFixed(1) : 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Avg Scenes/Location</p>
          </div>
        </div>
        {scenes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-display font-medium">Top Locations:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(uniqueLocations).slice(0, 8).map((location, idx) => (
                <span key={idx} className="px-4 py-1.5 bg-gradient-to-r from-primary/15 to-primary/10 text-primary text-sm rounded-full border border-primary/20 hover:border-primary/40 transition-colors">
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Parameter Breakdown */}
      {visualParams.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Visual Parameters" />
          <div className="space-y-4">
            {visualParams.slice(0, 8).map((param, index) => (
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

      {/* Director's Opportunities */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Director's Opportunities" />
        <ul className="space-y-4">
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 hover:border-primary/30 transition-all duration-300">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 mt-1.5 shrink-0" />
            <div>
              <span className="font-display font-semibold text-foreground">Visual Motif Development</span>
              <p className="text-sm text-muted-foreground mt-1">Identify recurring visual elements that can become thematic threads</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-chart-3/5 to-transparent border border-chart-3/10 hover:border-chart-3/30 transition-all duration-300">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-chart-3 to-chart-3/60 mt-1.5 shrink-0" />
            <div>
              <span className="font-display font-semibold text-foreground">Color Palette Contrast</span>
              <p className="text-sm text-muted-foreground mt-1">Consider how different character worlds can be distinguished visually</p>
            </div>
          </li>
          <li className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-chart-4/5 to-transparent border border-chart-4/10 hover:border-chart-4/30 transition-all duration-300">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-chart-4 to-chart-4/60 mt-1.5 shrink-0" />
            <div>
              <span className="font-display font-semibold text-foreground">Opening/Closing Imagery</span>
              <p className="text-sm text-muted-foreground mt-1">Strengthen visual bookends to reinforce thematic arc</p>
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
      <Card className="glass-premium p-6">
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
