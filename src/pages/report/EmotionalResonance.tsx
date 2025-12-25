import { useReport } from '@/components/report/ReportLayout';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Heart, Flame, Zap } from 'lucide-react';

const EmotionalResonance = () => {
  const { reportData } = useReport();

  const emotionalMetrics = [
    { label: 'Emotional Range', score: 7.8, description: 'Variety of emotions evoked' },
    { label: 'Cathartic Payoff', score: 7.5, description: 'Emotional satisfaction at key moments' },
    { label: 'Audience Connection', score: 8.0, description: 'Relatability and investment' },
    { label: 'Earned Moments', score: 6.8, description: 'Emotional beats feel justified' },
  ];

  const emotionalBeats = [
    { beat: 'Act I - Inciting Incident', emotion: 'Shock/Curiosity', intensity: 7, earned: 'Yes', notes: 'Effective hook that raises stakes immediately' },
    { beat: 'Act I - First Loss', emotion: 'Sadness/Empathy', intensity: 8, earned: 'Mostly', notes: 'Could use more setup for maximum impact' },
    { beat: 'Act II - Midpoint Victory', emotion: 'Triumph/Hope', intensity: 9, earned: 'Yes', notes: 'Perfectly placed emotional high' },
    { beat: 'Act II - All Is Lost', emotion: 'Despair/Fear', intensity: 8, earned: 'Yes', notes: 'Devastating reversal that lands' },
    { beat: 'Act III - Climax', emotion: 'Tension/Catharsis', intensity: 9, earned: 'Partially', notes: 'Strong but slightly rushed resolution' },
    { beat: 'Act III - Resolution', emotion: 'Hope/Bittersweet', intensity: 7, earned: 'Yes', notes: 'Satisfying without being saccharine' },
  ];

  const audienceReactions = [
    { moment: 'Mentor\'s Sacrifice', reaction: 'Tears/Grief', universality: 'High', notes: 'Classic but effective - audiences will respond' },
    { moment: 'Villain\'s Revelation', reaction: 'Shock/Recontextualization', universality: 'High', notes: 'Well-constructed twist that reframes earlier scenes' },
    { moment: 'Protagonist\'s Choice', reaction: 'Pride/Catharsis', universality: 'Medium-High', notes: 'Payoff for character arc, deeply satisfying' },
    { moment: 'Final Image', reaction: 'Hope/Reflection', universality: 'High', notes: 'Leaves audience with lingering emotional resonance' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Emotional Resonance"
        subtitle="Analyzing audience emotional journey, cathartic moments, and connection potential"
        icon={Sparkles}
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
        type="success"
        title="Emotional Verdict"
        content="This script has genuine emotional power. The midpoint and 'all is lost' moment are particularly effective, creating a rollercoaster that will keep audiences invested. The protagonist's journey generates strong empathy. Main note: a few emotional beats feel slightly unearned and would benefit from additional setup."
      />

      {/* Emotional Arc Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Emotional Beat Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emotionalBeats.map((beat, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{beat.beat}</h4>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
                      {beat.emotion}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                          style={{ width: `${beat.intensity * 10}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{beat.intensity}/10</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      beat.earned === 'Yes' ? 'bg-green-500/20 text-green-400' :
                      beat.earned === 'Mostly' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {beat.earned === 'Yes' ? 'Earned' : beat.earned === 'Mostly' ? 'Mostly Earned' : 'Needs Work'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{beat.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audience Reactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Predicted Audience Reactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Moment</th>
                  <th className="text-left py-3 px-4 font-medium">Expected Reaction</th>
                  <th className="text-left py-3 px-4 font-medium">Universality</th>
                  <th className="text-left py-3 px-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {audienceReactions.map((reaction, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{reaction.moment}</td>
                    <td className="py-3 px-4">{reaction.reaction}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        reaction.universality === 'High' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {reaction.universality}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{reaction.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StrengthWeaknessList
          type="strengths"
          items={[
            'Strong emotional peaks at midpoint and climax',
            'Protagonist generates genuine audience empathy',
            'Effective use of hope/despair contrast',
            'Ending leaves lasting emotional impression',
          ]}
        />
        <StrengthWeaknessList
          type="weaknesses"
          items={[
            'Act I first loss needs more setup',
            'Climax resolution feels slightly rushed',
            'Some quieter emotional moments could breathe more',
            'Secondary character emotional arcs underdeveloped',
          ]}
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Emotional Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Extend Act I Setup"
            description="Add 1-2 scenes establishing the relationship that's lost in Act I to maximize emotional impact."
            priority="high"
          />
          <RecommendationCard
            title="Let Climax Breathe"
            description="The emotional resolution at the climax is powerful but rushed. Add a beat for the audience to feel the weight."
            priority="high"
          />
          <RecommendationCard
            title="Develop Secondary Arcs"
            description="Give the ally character their own emotional journey that parallels or contrasts the protagonist's."
            priority="medium"
          />
          <RecommendationCard
            title="Add Quiet Moments"
            description="Consider adding 2-3 quieter character moments to provide contrast and make peaks more effective."
            priority="low"
          />
        </div>
      </div>
    </div>
  );
};

export default EmotionalResonance;
