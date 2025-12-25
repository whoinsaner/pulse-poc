import { useReport } from '@/components/report/ReportLayout';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Globe, Megaphone } from 'lucide-react';

const AudienceStrategy = () => {
  const { reportData } = useReport();

  const audienceMetrics = [
    { label: 'Target Clarity', score: 8.2, description: 'Well-defined core audience' },
    { label: 'Crossover Potential', score: 7.0, description: 'Appeal beyond core demo' },
    { label: 'Word of Mouth', score: 7.8, description: 'Shareability and discussion' },
    { label: 'Marketing Hooks', score: 8.5, description: 'Promotable elements' },
  ];

  const primaryAudience = {
    demo: 'Adults 25-54, Male-skewing',
    psychographic: 'Quality-seeking genre fans who appreciate elevated crime thrillers with character depth',
    viewing: 'Premium streaming subscribers, arthouse theatrical, festival attendees',
    size: 'Medium-Large'
  };

  const marketingHooks = [
    { hook: 'Redemption Story', appeal: 'Universal', usage: 'Emotional trailers, character posters' },
    { hook: 'Crime/Heist Elements', appeal: 'Genre fans', usage: 'Action-focused spots, comparison marketing' },
    { hook: 'Prestige Talent', appeal: 'Quality-seekers', usage: 'Star-driven campaigns, festival positioning' },
    { hook: 'Twist Ending', appeal: 'Word of mouth', usage: 'Post-release social, spoiler-free teasers' },
  ];

  const releaseWindows = [
    { window: 'Fall Festival Season', fit: 'Excellent', notes: 'Toronto/Venice premiere, awards positioning' },
    { window: 'Q4 Awards Season', fit: 'Good', notes: 'Limited release expanding, adult audiences available' },
    { window: 'January/February', fit: 'Good', notes: 'Counter-programming to blockbusters' },
    { window: 'Summer', fit: 'Poor', notes: 'Too dark for summer moviegoing mood' },
  ];

  const socialStrategy = [
    { platform: 'Twitter/X', approach: 'Film community engagement, critic quotes, festival buzz' },
    { platform: 'Instagram', approach: 'Behind-the-scenes, stylized stills, star content' },
    { platform: 'TikTok', approach: 'Scene recreations, quote clips, fan theories post-release' },
    { platform: 'YouTube', approach: 'Trailer variations, making-of content, cast interviews' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Audience Strategy"
        subtitle="Defining target audience, marketing approach, and release positioning"
        icon={Target}
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
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Primary Audience Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Demographics</h4>
              <p className="text-lg font-semibold text-primary">{primaryAudience.demo}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Market Size</h4>
              <p className="text-lg font-semibold text-primary">{primaryAudience.size}</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-medium mb-2">Psychographic Profile</h4>
              <p className="text-muted-foreground">{primaryAudience.psychographic}</p>
            </div>
            <div className="md:col-span-2">
              <h4 className="font-medium mb-2">Viewing Habits</h4>
              <p className="text-muted-foreground">{primaryAudience.viewing}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Marketing Hooks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketingHooks.map((hook, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{hook.hook}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    hook.appeal === 'Universal' ? 'bg-green-500/20 text-green-400' :
                    hook.appeal === 'Genre fans' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {hook.appeal}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{hook.usage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Release Windows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Release Window Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Window</th>
                  <th className="text-left py-3 px-4 font-medium">Fit</th>
                  <th className="text-left py-3 px-4 font-medium">Strategy Notes</th>
                </tr>
              </thead>
              <tbody>
                {releaseWindows.map((window, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{window.window}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        window.fit === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                        window.fit === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {window.fit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{window.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Social Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialStrategy.map((social, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2">{social.platform}</h4>
                <p className="text-sm text-muted-foreground">{social.approach}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Verdict */}
      <VerdictBox
        type="success"
        title="Recommended Campaign Approach"
        content="Lead with prestige positioning (festival premiere, critical acclaim) then expand to genre audiences. The redemption angle provides universal emotional hook while crime elements deliver genre satisfaction. Post-release, lean into twist/ending discussions to drive word of mouth. Star-driven campaign is essential for theatrical; can go more concept-forward for streaming."
      />

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Audience Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Festival Premiere Strategy"
            description="Target Toronto or Venice premiere to establish quality positioning before theatrical/streaming release."
            priority="high"
          />
          <RecommendationCard
            title="Dual-Track Marketing"
            description="Create prestige campaign for awards/critics and action-focused campaign for genre audiences."
            priority="high"
          />
          <RecommendationCard
            title="Post-Release Discussion"
            description="Prepare spoiler-friendly marketing assets for post-release word of mouth around the twist."
            priority="medium"
          />
          <RecommendationCard
            title="Expand Female Appeal"
            description="Marketing should emphasize emotional journey and character depth to broaden beyond male-skewing core."
            priority="medium"
          />
        </div>
      </div>
    </div>
  );
};

export default AudienceStrategy;
