import { useReport } from '@/components/report/ReportLayout';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, DollarSign, MapPin, Clock } from 'lucide-react';

const Production = () => {
  const { reportData } = useReport();

  const productionMetrics = [
    { label: 'Budget Efficiency', score: 7.5, description: 'Value for production cost' },
    { label: 'Location Feasibility', score: 8.0, description: 'Practical shooting requirements' },
    { label: 'Cast Requirements', score: 7.2, description: 'Manageable ensemble size' },
    { label: 'VFX/Stunt Needs', score: 6.8, description: 'Technical complexity level' },
  ];

  const budgetEstimate = {
    low: '$15M',
    target: '$25M',
    high: '$40M',
    notes: 'Target budget assumes mid-tier talent attachment and practical effects focus'
  };

  const locationBreakdown = [
    { location: 'Urban Industrial', percentage: 40, notes: 'Can be shot in any major city with industrial areas', difficulty: 'Easy' },
    { location: 'Corporate Interiors', percentage: 25, notes: 'Stage or practical office buildings', difficulty: 'Easy' },
    { location: 'Residential', percentage: 15, notes: 'Standard house/apartment locations', difficulty: 'Easy' },
    { location: 'Specialty (Warehouse)', percentage: 15, notes: 'Flooded warehouse for climax requires stage build', difficulty: 'Medium' },
    { location: 'Exterior Action', percentage: 5, notes: 'Night exterior chase sequence', difficulty: 'Medium' },
  ];

  const castRequirements = [
    { role: 'Lead 1 (Protagonist)', commitment: '40 days', notes: 'Requires actor with action capability and dramatic range' },
    { role: 'Lead 2 (Antagonist)', commitment: '25 days', notes: 'Character actor type, less action-heavy' },
    { role: 'Supporting 1 (Ally)', commitment: '20 days', notes: 'Comedy timing helpful' },
    { role: 'Supporting 2 (Mentor)', commitment: '10 days', notes: 'Cameo-friendly role for name talent' },
    { role: 'Day Players', commitment: 'Various', notes: '15+ speaking roles, standard casting' },
  ];

  const productionChallenges = [
    { challenge: 'Flooded Warehouse Climax', severity: 'High', solution: 'Stage tank build, 5-day shoot minimum', cost: '$2-3M' },
    { challenge: 'Night Exteriors', severity: 'Medium', solution: 'Consolidate to 3 nights maximum', cost: '$500K premium' },
    { challenge: 'Vehicle Sequences', severity: 'Medium', solution: 'Practical with process trailer where possible', cost: '$1M' },
    { challenge: 'Period Elements', severity: 'Low', solution: 'Minimal flashback requirements, contained sets', cost: '$200K' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Production Analysis"
        subtitle="Evaluating budget requirements, location needs, and production feasibility"
        icon={Film}
      />

      {/* Production Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {productionMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50">
            <CardContent className="pt-6">
              <ScoreDisplay score={metric.score} maxScore={10} size="md" />
              <h3 className="font-semibold mt-2">{metric.label}</h3>
              <p className="text-sm text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Estimate */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Budget Estimate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Low Budget</p>
              <p className="text-2xl font-bold text-yellow-400">{budgetEstimate.low}</p>
              <p className="text-xs text-muted-foreground mt-1">Indie approach</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-sm text-muted-foreground mb-1">Target Budget</p>
              <p className="text-2xl font-bold text-primary">{budgetEstimate.target}</p>
              <p className="text-xs text-muted-foreground mt-1">Recommended</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">High Budget</p>
              <p className="text-2xl font-bold text-green-400">{budgetEstimate.high}</p>
              <p className="text-xs text-muted-foreground mt-1">A-list package</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">{budgetEstimate.notes}</p>
        </CardContent>
      </Card>

      {/* Location Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locationBreakdown.map((loc, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{loc.location}</div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${loc.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm text-right">{loc.percentage}%</div>
                <span className={`w-20 px-2 py-1 rounded text-xs font-medium text-center ${
                  loc.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {loc.difficulty}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cast Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Cast Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Commitment</th>
                  <th className="text-left py-3 px-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {castRequirements.map((cast, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{cast.role}</td>
                    <td className="py-3 px-4">{cast.commitment}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{cast.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Production Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>Production Challenges & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productionChallenges.map((challenge, idx) => (
              <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{challenge.challenge}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      challenge.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                      challenge.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {challenge.severity} Complexity
                    </span>
                    <span className="text-sm font-medium text-primary">{challenge.cost}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.solution}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <StrengthWeaknessList
        strengths={[
          { text: 'Majority of locations are standard and accessible' },
          { text: 'Cast size is manageable for budget level' },
          { text: 'Minimal VFX requirements keep costs controlled' },
          { text: 'Script structure allows for efficient scheduling' },
        ]}
        weaknesses={[
          { text: 'Flooded warehouse sequence is expensive' },
          { text: 'Night exterior work adds premium costs' },
          { text: 'Lead role requires 40+ days commitment' },
          { text: 'Vehicle sequences need careful planning' },
        ]}
      />

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Production Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecommendationCard
            title="Reconsider Climax Location"
            description="The flooded warehouse is visually strong but expensive. Consider alternatives that achieve similar mood for less cost."
            priority="high"
          />
          <RecommendationCard
            title="Consolidate Night Work"
            description="Schedule all night exteriors in a single block to minimize crew overtime and turnaround costs."
            priority="medium"
          />
          <RecommendationCard
            title="Mentor Role for Name Talent"
            description="The 10-day mentor role is perfect for a name actor cameo that elevates the project's profile."
            priority="medium"
          />
          <RecommendationCard
            title="Consider Tax Incentive Locations"
            description="Urban industrial setting can be shot in multiple states/countries with strong incentive programs."
            priority="low"
          />
        </div>
      </div>
    </div>
  );
};

export default Production;
