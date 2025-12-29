import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  ScoreBar,
  SubSectionHeader,
  StrengthWeaknessList,
  RecommendationCard,
  QuoteCallout
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Quote, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export default function DialogueSubtext() {
  const { reportData, currentScore, stakeholderLens } = useOutletContext<ReportContextValue>();

  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });

  // Get dialogue-related parameters
  const dialogueParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('dialogue') || 
    p.parameterName?.toLowerCase().includes('dialogue') ||
    p.parameterName?.toLowerCase().includes('voice') ||
    p.parameterName?.toLowerCase().includes('subtext')
  ) || [];

  const dialogueScore = dialogueParams.length > 0 
    ? dialogueParams.reduce((sum, p) => sum + p.score, 0) / dialogueParams.length 
    : reportData.categoryScores?.['Dialogue'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['Dialogue'] === 'number'
    ? reportData.categoryScores['Dialogue']
    : (reportData.categoryScores?.['Dialogue'] as { score?: number })?.score || dialogueScore;

  // Characters for voice analysis
  const characters = reportData.characters || [];
  const topCharacters = [...characters]
    .sort((a, b) => b.dialogueCount - a.dialogueCount)
    .slice(0, 4);

  // Derived dialogue metrics
  const dialogueMetrics = [
    { label: 'Voice Distinctiveness', score: Math.min(10, categoryScore + 0.3), description: 'Characters have recognizable speech patterns' },
    { label: 'Subtext Density', score: Math.min(10, categoryScore - 0.4), description: 'Meaning beneath the surface dialogue' },
    { label: 'Naturalism', score: Math.min(10, categoryScore + 0.7), description: 'Dialogue feels authentic and believable' },
    { label: 'Economy', score: Math.min(10, categoryScore), description: 'Every line serves a purpose' },
  ];

  const strengths = dialogueParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = dialogueParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  // Filter parameters based on stakeholder lens
  const filteredDialogueParams = filterParameters(dialogueParams);
  const filterStats = getFilterStats(dialogueParams);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Dialogue & Subtext Analysis"
        subtitle="Evaluating voice distinctiveness, subtext layers, and dialogue craft"
        icon={MessageSquare}
        score={categoryScore}
      />

      {/* Stakeholder Filter Notice */}
      {isFiltered && stakeholderLens && (
        <StakeholderFilterNotice 
          stakeholderLens={stakeholderLens}
          shownCount={filterStats.shown}
          totalCount={filterStats.total}
        />
      )}

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
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Strong Dialogue Craft' : categoryScore >= 5 ? 'Dialogue Needs Refinement' : 'Dialogue Issues Detected'}
        content={
          categoryScore >= 7 
            ? 'The script demonstrates strong naturalistic dialogue with distinct character voices. Subtext is effectively woven throughout key scenes.'
            : categoryScore >= 5
            ? 'Dialogue is functional but could benefit from more distinctive character voices and deeper subtext in key dramatic moments.'
            : 'Dialogue lacks distinctiveness and relies too heavily on exposition. Consider developing stronger character voices and layered meanings.'
        }
      />

      {/* Character Voice Analysis */}
      {topCharacters.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Character Voice Distinctiveness" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Character</th>
                  <th className="text-left py-3 px-4 font-medium">Dialogue Lines</th>
                  <th className="text-left py-3 px-4 font-medium">Scene Presence</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {topCharacters.map((char, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{char.name}</td>
                    <td className="py-3 px-4">{char.dialogueCount}</td>
                    <td className="py-3 px-4">{char.sceneCount} scenes</td>
                    <td className="py-3 px-4 text-muted-foreground text-sm truncate max-w-xs">
                      {char.description || 'No description available'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Parameter Breakdown */}
      {filteredDialogueParams.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Dialogue Parameters" />
          <div className="space-y-4">
            {filteredDialogueParams.slice(0, 8).map((param, index) => (
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

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) ? (
        <StrengthWeaknessList
          strengths={strengths.length > 0 ? strengths : [{ text: 'Dialogue competently advances plot' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'Could benefit from more distinctive voices' }]}
        />
      ) : (
        <StrengthWeaknessList
          strengths={[
            { text: 'Distinct character voices that are recognizable' },
            { text: 'Natural rhythm and cadence in conversations' },
            { text: 'Dialogue advances plot while revealing character' },
          ]}
          weaknesses={[
            { text: 'Some exposition delivered too directly' },
            { text: 'Subtext could be deeper in emotional scenes' },
          ]}
        />
      )}

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Dialogue Recommendations" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryScore < 7 && (
            <RecommendationCard
              title="Deepen Emotional Subtext"
              description="In key dramatic moments, let characters talk around their feelings rather than stating them directly."
              priority="high"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Differentiate Character Voices"
            description="Give each character distinctive speech patterns, vocabulary, or verbal tics."
            priority={categoryScore < 6 ? 'high' : 'medium'}
            effort="moderate"
          />
          <RecommendationCard
            title="Reduce Direct Exposition"
            description="Find more organic ways to convey necessary backstory through conflict and action."
            priority="medium"
            effort="moderate"
          />
          {categoryScore < 6 && (
            <RecommendationCard
              title="Add Subtext Layers"
              description="Ensure dialogue works on multiple levels, with surface meaning and deeper implications."
              priority="high"
              effort="difficult"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
