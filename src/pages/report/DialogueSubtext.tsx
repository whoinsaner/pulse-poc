import { useReport } from '@/components/report/ReportLayout';
import { 
  SectionHeader, 
  AssessmentCard, 
  ScoreDisplay, 
  VerdictBox,
  QuoteCallout,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Quote, Layers, Sparkles } from 'lucide-react';

const DialogueSubtext = () => {
  const { reportData } = useReport();

  const dialogueMetrics = [
    { label: 'Voice Distinctiveness', score: 7.5, description: 'Characters have recognizable speech patterns' },
    { label: 'Subtext Density', score: 6.8, description: 'Meaning beneath the surface dialogue' },
    { label: 'Naturalism', score: 8.0, description: 'Dialogue feels authentic and believable' },
    { label: 'Economy', score: 7.2, description: 'Every line serves a purpose' },
  ];

  const characterVoices = [
    { character: 'Protagonist', distinctiveness: 'High', traits: 'Terse, action-oriented, minimal exposition', example: '"Just get it done."' },
    { character: 'Antagonist', distinctiveness: 'Medium-High', traits: 'Eloquent, manipulative, layered meanings', example: '"Everything has its price, my friend."' },
    { character: 'Mentor', distinctiveness: 'Medium', traits: 'Wise, cryptic, metaphorical', example: '"The path chooses you, not the other way around."' },
    { character: 'Ally', distinctiveness: 'Medium', traits: 'Humor-driven, loyal, supportive', example: '"You know I\'ve got your back, always."' },
  ];

  const subtextExamples = [
    {
      scene: 'Act I - First Meeting',
      surface: '"Nice place you have here."',
      subtext: 'Protagonist is sizing up the antagonist\'s power and resources',
      effectiveness: 'Strong'
    },
    {
      scene: 'Act II - Confrontation',
      surface: '"I\'m sure we can work something out."',
      subtext: 'Antagonist is threatening while maintaining plausible deniability',
      effectiveness: 'Very Strong'
    },
    {
      scene: 'Act III - Climax',
      surface: '"It\'s over."',
      subtext: 'Acceptance of sacrifice, not just statement of victory',
      effectiveness: 'Moderate'
    },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dialogue & Subtext Analysis"
        subtitle="Evaluating voice distinctiveness, subtext layers, and dialogue craft"
        icon={MessageSquare}
      />

      {/* Overall Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dialogueMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Core Finding */}
      <VerdictBox
        type="info"
        title="Dialogue Assessment"
        content="The script demonstrates strong naturalistic dialogue with distinct character voices. Subtext is present but could be deepened in key dramatic moments. The protagonist's terseness effectively conveys character but occasionally limits emotional access."
      />

      {/* Character Voice Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="h-5 w-5 text-primary" />
            Character Voice Distinctiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Character</th>
                  <th className="text-left py-3 px-4 font-medium">Distinctiveness</th>
                  <th className="text-left py-3 px-4 font-medium">Voice Traits</th>
                  <th className="text-left py-3 px-4 font-medium">Example</th>
                </tr>
              </thead>
              <tbody>
                {characterVoices.map((voice, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{voice.character}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        voice.distinctiveness === 'High' ? 'bg-green-500/20 text-green-400' :
                        voice.distinctiveness === 'Medium-High' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {voice.distinctiveness}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{voice.traits}</td>
                    <td className="py-3 px-4 italic text-muted-foreground">{voice.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Subtext Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Subtext Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subtextExamples.map((example, idx) => (
            <div key={idx} className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary">{example.scene}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  example.effectiveness === 'Very Strong' ? 'bg-green-500/20 text-green-400' :
                  example.effectiveness === 'Strong' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {example.effectiveness}
                </span>
              </div>
              <QuoteCallout quote={example.surface} attribution="Dialogue" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Subtext:</span> {example.subtext}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StrengthWeaknessList
          type="strengths"
          items={[
            'Distinct character voices that are immediately recognizable',
            'Natural rhythm and cadence in conversations',
            'Effective use of silence and pauses',
            'Dialogue advances plot while revealing character',
          ]}
        />
        <StrengthWeaknessList
          type="weaknesses"
          items={[
            'Some exposition delivered too directly',
            'Subtext could be deeper in emotional scenes',
            'Secondary characters occasionally sound similar',
            'A few on-the-nose moments in Act III',
          ]}
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dialogue Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Deepen Emotional Subtext"
            description="In key dramatic moments, let characters talk around their feelings rather than stating them directly."
            priority="high"
          />
          <RecommendationCard
            title="Differentiate Secondary Voices"
            description="Give supporting characters more distinctive speech patterns, tics, or vocabularies."
            priority="medium"
          />
          <RecommendationCard
            title="Reduce Direct Exposition"
            description="Find more organic ways to convey necessary backstory through conflict and action."
            priority="medium"
          />
          <RecommendationCard
            title="Strengthen Act III Dialogue"
            description="The climax needs more layered dialogue that works on multiple levels simultaneously."
            priority="high"
          />
        </div>
      </div>
    </div>
  );
};

export default DialogueSubtext;
