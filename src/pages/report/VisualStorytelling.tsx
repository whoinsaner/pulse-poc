import { useReport } from '@/components/report/ReportLayout';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Camera, Palette, Film } from 'lucide-react';

const VisualStorytelling = () => {
  const { reportData } = useReport();

  const visualMetrics = [
    { label: 'Visual Imagery', score: 7.2, description: 'Strength of visual descriptions' },
    { label: 'Cinematic Potential', score: 8.0, description: 'Translates well to screen' },
    { label: 'Show vs Tell', score: 6.8, description: 'Visual storytelling over exposition' },
    { label: 'Location Utilization', score: 7.5, description: 'Settings serve the story' },
  ];

  const keyVisualMoments = [
    {
      scene: 'Opening Image',
      page: 1,
      description: 'Protagonist silhouetted against industrial skyline at dawn',
      impact: 'Establishes tone and isolation beautifully',
      rating: 'Excellent',
    },
    {
      scene: 'Midpoint Reversal',
      page: 55,
      description: 'Mirror scene where protagonist sees their past self',
      impact: 'Powerful visual metaphor for character growth',
      rating: 'Excellent',
    },
    {
      scene: 'Final Confrontation',
      page: 102,
      description: 'Flooded warehouse, characters circling in ankle-deep water',
      impact: 'Location adds visual tension but could be more distinctive',
      rating: 'Good',
    },
    {
      scene: 'Closing Image',
      page: 110,
      description: 'Same skyline, now protagonist walking toward city',
      impact: 'Bookends nicely but feels slightly predictable',
      rating: 'Good',
    },
  ];

  const locationAnalysis = [
    { location: 'Industrial District', scenes: 8, purpose: 'Protagonist\'s world - decay and survival', effectiveness: 'High' },
    { location: 'Corporate Tower', scenes: 5, purpose: 'Antagonist\'s power center - contrast', effectiveness: 'High' },
    { location: 'Old Family Home', scenes: 3, purpose: 'Backstory and emotional vulnerability', effectiveness: 'Medium' },
    { location: 'Underground Club', scenes: 4, purpose: 'Moral gray zone, information hub', effectiveness: 'Medium' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Visual Storytelling"
        subtitle="Evaluating cinematic imagery, visual metaphors, and directorial potential"
        icon={Eye}
      />

      {/* Visual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visualMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core Assessment */}
      <VerdictBox
        type="info"
        title="Visual Assessment"
        content="The script demonstrates strong visual instincts with memorable opening and midpoint imagery. Locations are well-chosen to contrast protagonist and antagonist worlds. The main opportunity is reducing over-reliance on dialogue when visuals could convey the same information more powerfully."
      />

      {/* Key Visual Moments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Key Visual Moments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {keyVisualMoments.map((moment, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{moment.scene}</h4>
                    <span className="text-sm text-muted-foreground">Page {moment.page}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    moment.rating === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                    moment.rating === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {moment.rating}
                  </span>
                </div>
                <p className="text-sm mb-2">{moment.description}</p>
                <p className="text-sm text-muted-foreground italic">{moment.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Location Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Scenes</th>
                  <th className="text-left py-3 px-4 font-medium">Narrative Purpose</th>
                  <th className="text-left py-3 px-4 font-medium">Effectiveness</th>
                </tr>
              </thead>
              <tbody>
                {locationAnalysis.map((loc, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{loc.location}</td>
                    <td className="py-3 px-4">{loc.scenes}</td>
                    <td className="py-3 px-4 text-muted-foreground">{loc.purpose}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        loc.effectiveness === 'High' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {loc.effectiveness}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Director's Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            Director's Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <span className="font-medium">Color Palette Contrast</span>
                <p className="text-sm text-muted-foreground">The industrial vs corporate worlds invite distinct visual treatment - desaturated blues vs warm golds</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <span className="font-medium">Mirror Motif</span>
                <p className="text-sm text-muted-foreground">Several key scenes involve reflections - this could be developed into a consistent visual language</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <span className="font-medium">Water Symbolism</span>
                <p className="text-sm text-muted-foreground">Water appears at key emotional moments - could be emphasized more deliberately throughout</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <StrengthWeaknessList
        strengths={[
          { text: 'Strong opening and closing visual bookends' },
          { text: 'Locations effectively contrast character worlds' },
          { text: 'Memorable set-piece at midpoint' },
          { text: 'Visual metaphors reinforce theme' },
        ]}
        weaknesses={[
          { text: 'Some scenes over-rely on dialogue' },
          { text: 'Action lines occasionally lack visual specificity' },
          { text: 'Climax location feels generic' },
          { text: 'Missed opportunities for visual callbacks' },
        ]}
      />

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Visual Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Strengthen Climax Location"
            description="The flooded warehouse is functional but not iconic. Consider a more distinctive setting that ties to theme."
            priority="high"
          />
          <RecommendationCard
            title="Add Visual Callbacks"
            description="Plant more visual elements early that pay off later. The mirror motif could be expanded."
            priority="medium"
          />
          <RecommendationCard
            title="Replace Dialogue Scenes"
            description="Identify 3-5 scenes where information could be conveyed visually rather than through conversation."
            priority="medium"
          />
          <RecommendationCard
            title="Enhance Action Lines"
            description="Make action descriptions more evocative and specific to guide the director's vision."
            priority="low"
          />
        </div>
      </div>
    </div>
  );
};

export default VisualStorytelling;
