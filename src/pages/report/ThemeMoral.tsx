import { useReport } from '@/components/report/ReportLayout';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Compass, BookOpen, Scale } from 'lucide-react';

const ThemeMoral = () => {
  const { reportData } = useReport();

  const themeMetrics = [
    { label: 'Theme Clarity', score: 7.8, description: 'How clearly the central theme emerges' },
    { label: 'Thematic Integration', score: 7.0, description: 'Theme woven through all story elements' },
    { label: 'Moral Complexity', score: 8.2, description: 'Nuance in ethical questions posed' },
    { label: 'Universal Resonance', score: 7.5, description: 'Theme speaks to broad human experience' },
  ];

  const primaryThemes = [
    {
      theme: 'Redemption',
      presence: 'Primary',
      manifestation: 'Protagonist\'s journey from guilt to self-forgiveness',
      strength: 9,
    },
    {
      theme: 'Power & Corruption',
      presence: 'Secondary',
      manifestation: 'Antagonist\'s fall and the cost of ambition',
      strength: 7,
    },
    {
      theme: 'Family & Legacy',
      presence: 'Supporting',
      manifestation: 'Relationships that drive character motivations',
      strength: 6,
    },
  ];

  const moralQuestions = [
    {
      question: 'Can past wrongs ever be truly forgiven?',
      exploration: 'Deep',
      resolution: 'Open-ended',
      notes: 'The script wisely avoids easy answers, letting the audience wrestle with this'
    },
    {
      question: 'Does the end justify the means?',
      exploration: 'Moderate',
      resolution: 'Resolved',
      notes: 'Antagonist\'s arc definitively argues against this, perhaps too neatly'
    },
    {
      question: 'What do we owe to those who raised us?',
      exploration: 'Surface',
      resolution: 'Unresolved',
      notes: 'Interesting thread that could be developed further'
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Theme & Moral Core"
        subtitle="Analyzing thematic depth, moral complexity, and universal resonance"
        icon={Heart}
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

      {/* Core Theme Statement */}
      <VerdictBox
        type="success"
        title="Central Theme"
        content="The script explores the price of redemption and whether we can ever truly escape our past. At its core, it asks: Can we become better than the worst thing we've ever done? This theme resonates universally while being grounded in specific, compelling character choices."
      />

      {/* Theme Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Thematic Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {primaryThemes.map((theme, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{theme.theme}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      theme.presence === 'Primary' ? 'bg-primary/20 text-primary' :
                      theme.presence === 'Secondary' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {theme.presence}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Strength:</span>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${theme.strength * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{theme.strength}/10</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{theme.manifestation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Moral Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Moral Questions Explored
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Question</th>
                  <th className="text-left py-3 px-4 font-medium">Exploration</th>
                  <th className="text-left py-3 px-4 font-medium">Resolution</th>
                  <th className="text-left py-3 px-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {moralQuestions.map((q, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{q.question}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        q.exploration === 'Deep' ? 'bg-green-500/20 text-green-400' :
                        q.exploration === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {q.exploration}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        q.resolution === 'Open-ended' ? 'bg-blue-500/20 text-blue-400' :
                        q.resolution === 'Resolved' ? 'bg-green-500/20 text-green-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {q.resolution}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{q.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <StrengthWeaknessList
        strengths={[
          { text: 'Primary theme is powerful and universally relatable' },
          { text: 'Moral complexity avoids simple good vs evil' },
          { text: 'Theme emerges organically through character action' },
          { text: 'Ending honors thematic questions without being preachy' },
        ]}
        weaknesses={[
          { text: 'Secondary themes could be more developed' },
          { text: 'Some thematic moments feel underlined too heavily' },
          { text: 'Family legacy theme is introduced but not fully explored' },
          { text: "Antagonist's moral journey could be more nuanced" },
        ]}
      />

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Develop Family Legacy Theme"
            description="This thread has potential but is currently underutilized. Consider weaving it more consistently through the protagonist's journey."
            priority="high"
          />
          <RecommendationCard
            title="Complicate Antagonist's Arc"
            description="The villain's fall feels predetermined. Add moments where the audience might sympathize with their choices."
            priority="medium"
          />
          <RecommendationCard
            title="Trust the Subtext"
            description="A few scenes state the theme too explicitly. Let the audience connect the dots themselves."
            priority="medium"
          />
          <RecommendationCard
            title="Strengthen Thematic Echo"
            description="Mirror the opening and closing scenes more deliberately to reinforce thematic resolution."
            priority="low"
          />
        </div>
      </div>
    </div>
  );
};

export default ThemeMoral;
