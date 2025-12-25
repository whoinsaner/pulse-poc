import { useReport } from '@/components/report/ReportLayout';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, BarChart3, Clock, Scissors } from 'lucide-react';

const SceneEconomy = () => {
  const { reportData } = useReport();

  const economyMetrics = [
    { label: 'Scene Efficiency', score: 7.2, description: 'Every scene earns its place' },
    { label: 'Escalation Logic', score: 7.8, description: 'Stakes build appropriately' },
    { label: 'Redundancy Control', score: 6.5, description: 'Minimal repetitive scenes' },
    { label: 'Pacing Balance', score: 7.5, description: 'Action/dialogue rhythm' },
  ];

  const sceneBreakdown = {
    total: 48,
    essential: 38,
    beneficial: 7,
    questionable: 3,
    averageLength: '2.3 pages'
  };

  const actAnalysis = [
    {
      act: 'Act I (Pages 1-25)',
      scenes: 12,
      efficiency: 85,
      notes: 'Tight setup, efficient character introductions',
      issues: ['Scene 4 could be combined with Scene 5']
    },
    {
      act: 'Act II-A (Pages 26-55)',
      scenes: 15,
      efficiency: 72,
      notes: 'Some scenes feel redundant in demonstrating conflict',
      issues: ['Scenes 18-19 cover similar ground', 'Scene 22 is largely expositional']
    },
    {
      act: 'Act II-B (Pages 56-85)',
      scenes: 13,
      efficiency: 78,
      notes: 'Good escalation, midpoint is strong',
      issues: ['Scene 31 could be trimmed']
    },
    {
      act: 'Act III (Pages 86-110)',
      scenes: 8,
      efficiency: 90,
      notes: 'Excellent momentum, every scene drives to climax',
      issues: []
    }
  ];

  const questionableScenes = [
    {
      scene: 'Scene 18 (Pages 38-40)',
      purpose: 'Shows protagonist\'s isolation',
      issue: 'This is already established in Scene 15 and demonstrated better',
      recommendation: 'Cut entirely, integrate any essential info into Scene 19',
      savings: '2.5 pages'
    },
    {
      scene: 'Scene 22 (Pages 48-50)',
      purpose: 'Exposition about antagonist\'s past',
      issue: 'Delivered through dialogue rather than action',
      recommendation: 'Convert to visual flashback or cut, reveal through behavior',
      savings: '2 pages'
    },
    {
      scene: 'Scene 31 (Pages 68-70)',
      purpose: 'Team preparation montage',
      issue: 'Overlong, some beats are unnecessary',
      recommendation: 'Trim to 1 page, focus on essential beats only',
      savings: '1.5 pages'
    }
  ];

  const pacingAnalysis = [
    { section: 'Opening', pages: '1-5', type: 'Action', assessment: 'Strong hook, efficient' },
    { section: 'Setup', pages: '6-15', type: 'Dialogue-heavy', assessment: 'Good character work' },
    { section: 'Catalyst', pages: '16-20', type: 'Mixed', assessment: 'Well-paced escalation' },
    { section: 'Debate', pages: '21-25', type: 'Dialogue-heavy', assessment: 'Slightly slow' },
    { section: 'B-Story', pages: '26-35', type: 'Mixed', assessment: 'Good balance' },
    { section: 'Fun & Games', pages: '36-50', type: 'Action-focused', assessment: 'Some redundancy' },
    { section: 'Midpoint', pages: '51-55', type: 'Action', assessment: 'Excellent momentum' },
    { section: 'Bad Guys Close In', pages: '56-70', type: 'Mixed', assessment: 'Good tension' },
    { section: 'All Is Lost', pages: '71-80', type: 'Emotional', assessment: 'Powerful' },
    { section: 'Dark Night', pages: '81-85', type: 'Dialogue-heavy', assessment: 'Effective' },
    { section: 'Finale', pages: '86-110', type: 'Action', assessment: 'Excellent' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Scene Economy"
        subtitle="Analyzing scene efficiency, pacing, and opportunities for tightening"
        icon={Layers}
      />

      {/* Economy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {economyMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scene Breakdown Overview */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Scene Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold text-primary">{sceneBreakdown.total}</p>
              <p className="text-sm text-muted-foreground">Total Scenes</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <p className="text-3xl font-bold text-green-400">{sceneBreakdown.essential}</p>
              <p className="text-sm text-muted-foreground">Essential</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <p className="text-3xl font-bold text-blue-400">{sceneBreakdown.beneficial}</p>
              <p className="text-sm text-muted-foreground">Beneficial</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-3xl font-bold text-yellow-400">{sceneBreakdown.questionable}</p>
              <p className="text-sm text-muted-foreground">Questionable</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-3xl font-bold">{sceneBreakdown.averageLength}</p>
              <p className="text-sm text-muted-foreground">Avg Length</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verdict */}
      <VerdictBox
        type="info"
        title="Economy Assessment"
        content="The script is reasonably efficient at 110 pages with 48 scenes. Act I and Act III are particularly tight, while Act II-A has the most room for improvement. Cutting or reworking 3 questionable scenes could save 6 pages and improve pacing without losing anything essential."
      />

      {/* Act-by-Act Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Act-by-Act Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actAnalysis.map((act, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{act.act}</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{act.scenes} scenes</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            act.efficiency >= 85 ? 'bg-green-500' :
                            act.efficiency >= 75 ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${act.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{act.efficiency}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{act.notes}</p>
                {act.issues.length > 0 && (
                  <ul className="text-sm text-yellow-400 space-y-1">
                    {act.issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questionable Scenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            Scenes to Reconsider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionableScenes.map((scene, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{scene.scene}</h4>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                    Potential Savings: {scene.savings}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Purpose:</span> <span className="text-muted-foreground">{scene.purpose}</span></p>
                  <p><span className="font-medium">Issue:</span> <span className="text-muted-foreground">{scene.issue}</span></p>
                  <p><span className="font-medium">Recommendation:</span> <span className="text-primary">{scene.recommendation}</span></p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pacing Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pacing Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Section</th>
                  <th className="text-left py-3 px-4 font-medium">Pages</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {pacingAnalysis.map((section, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{section.section}</td>
                    <td className="py-3 px-4 text-muted-foreground">{section.pages}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        section.type === 'Action' ? 'bg-red-500/20 text-red-400' :
                        section.type === 'Dialogue-heavy' ? 'bg-blue-500/20 text-blue-400' :
                        section.type === 'Emotional' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {section.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{section.assessment}</td>
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
            'Act III is extremely efficient',
            'Opening sequence wastes no time',
            'Average scene length is appropriate',
            'Escalation through acts is logical',
          ]}
        />
        <StrengthWeaknessList
          type="weaknesses"
          items={[
            'Act II-A has redundant scenes',
            'Some exposition delivered inefficiently',
            '6 pages could be trimmed without loss',
            'Debate section slightly slow',
          ]}
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Economy Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Cut Scene 18"
            description="This scene is redundant with Scene 15. Remove entirely and fold essential info into Scene 19."
            priority="high"
          />
          <RecommendationCard
            title="Rework Scene 22"
            description="Convert exposition to visual flashback or reveal antagonist's past through present behavior."
            priority="high"
          />
          <RecommendationCard
            title="Trim Scene 31"
            description="Cut the preparation montage to essential beats only. Target 1 page maximum."
            priority="medium"
          />
          <RecommendationCard
            title="Combine Scenes 4-5"
            description="These early setup scenes can be merged for efficiency without losing character work."
            priority="low"
          />
        </div>
      </div>
    </div>
  );
};

export default SceneEconomy;
