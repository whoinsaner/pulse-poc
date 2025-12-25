import { useReport } from '@/components/report/ReportLayout';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, DollarSign, Globe } from 'lucide-react';

const Marketability = () => {
  const { reportData } = useReport();

  const marketMetrics = [
    { label: 'Commercial Appeal', score: 7.5, description: 'Broad audience potential' },
    { label: 'Genre Clarity', score: 8.2, description: 'Easy to categorize and market' },
    { label: 'Franchise Potential', score: 6.5, description: 'Sequel/expansion possibilities' },
    { label: 'Star Vehicle', score: 8.0, description: 'Attractiveness to talent' },
  ];

  const comparables = [
    { title: 'The Town', year: 2010, similarity: 'Tone, redemption arc, heist elements', boxOffice: '$154M worldwide' },
    { title: 'Hell or High Water', year: 2016, similarity: 'Character-driven crime, moral complexity', boxOffice: '$38M worldwide' },
    { title: 'Drive', year: 2011, similarity: 'Stylized crime thriller, protagonist isolation', boxOffice: '$78M worldwide' },
  ];

  const platformFit = [
    { platform: 'Theatrical Wide', fit: 'Good', notes: 'Strong genre appeal, needs star attachment', recommendation: 'With A-list lead' },
    { platform: 'Theatrical Limited', fit: 'Excellent', notes: 'Could expand based on word of mouth', recommendation: 'Platform release strategy' },
    { platform: 'Streaming (Premium)', fit: 'Excellent', notes: 'Perfect for Netflix/Amazon original', recommendation: 'Primary target' },
    { platform: 'Streaming (Standard)', fit: 'Good', notes: 'Would perform well but undersells potential', recommendation: 'Fallback option' },
  ];

  const targetQuadrants = [
    { demo: 'Males 18-34', appeal: 'High', reason: 'Action, crime genre, antihero protagonist' },
    { demo: 'Males 35-54', appeal: 'High', reason: 'Themes of redemption, mature storytelling' },
    { demo: 'Females 18-34', appeal: 'Medium', reason: 'Character depth, emotional journey' },
    { demo: 'Females 35-54', appeal: 'Medium', reason: 'Thematic resonance, quality drama' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Marketability Analysis"
        subtitle="Evaluating commercial viability, audience appeal, and distribution potential"
        icon={TrendingUp}
      />

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
        type="success"
        title="Market Positioning"
        content="This script occupies a commercially viable space: elevated crime thriller with strong character work. It's the kind of material that attracts quality talent and awards attention while still delivering genre satisfaction. Best positioned as a premium streaming original or limited theatrical release with platform expansion."
      />

      {/* Comparable Titles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Comparable Titles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparables.map((comp, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{comp.title} ({comp.year})</h4>
                  <p className="text-sm text-muted-foreground">{comp.similarity}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-400">{comp.boxOffice}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Fit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Platform Fit Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Platform</th>
                  <th className="text-left py-3 px-4 font-medium">Fit</th>
                  <th className="text-left py-3 px-4 font-medium">Notes</th>
                  <th className="text-left py-3 px-4 font-medium">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {platformFit.map((platform, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{platform.platform}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        platform.fit === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {platform.fit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{platform.notes}</td>
                    <td className="py-3 px-4 text-sm">{platform.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Target Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Target Audience Quadrants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targetQuadrants.map((quad, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{quad.demo}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    quad.appeal === 'High' ? 'bg-green-500/20 text-green-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {quad.appeal} Appeal
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{quad.reason}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StrengthWeaknessList
          type="strengths"
          items={[
            'Clear genre positioning with quality elevation',
            'Strong lead role attractive to A-list talent',
            'Proven comparable titles show market appetite',
            'Works across theatrical and streaming platforms',
          ]}
        />
        <StrengthWeaknessList
          type="weaknesses"
          items={[
            'Limited franchise/sequel potential',
            'Skews male in primary appeal',
            'May be too dark for some mainstream audiences',
            'Requires star attachment for wide theatrical',
          ]}
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Market Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Target Premium Streamers"
            description="Netflix or Amazon would be ideal homes. Position as prestige crime drama with festival potential."
            priority="high"
          />
          <RecommendationCard
            title="Strengthen Female Appeal"
            description="Consider developing the female supporting character to broaden demographic appeal without changing core."
            priority="medium"
          />
          <RecommendationCard
            title="Attach A-List Director"
            description="This material is attractive to auteur directors looking for commercial material with depth."
            priority="high"
          />
          <RecommendationCard
            title="Consider Limited Series"
            description="The character depth could also support a prestige limited series adaptation if film doesn't move forward."
            priority="low"
          />
        </div>
      </div>
    </div>
  );
};

export default Marketability;
