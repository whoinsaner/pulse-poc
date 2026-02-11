import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  VerdictBox, 
  ScoreBar,
  ScoreDisplay,
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { UserX, Shield, Brain, Zap, Target, Sword } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function AntagonistAnalysis() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  // Find potential antagonist (second most prominent character, or one with "villain" type relationship)
  const characters = reportData.characters || [];
  const sortedByPresence = [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount);
  const antagonist = sortedByPresence[1] || null; // Second most prominent character

  // Get conflict-related parameters
  const conflictParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('conflict') || 
    p.parameterName?.toLowerCase().includes('antagonist') ||
    p.parameterName?.toLowerCase().includes('villain') ||
    p.parameterName?.toLowerCase().includes('opposition') ||
    p.parameterName?.toLowerCase().includes('threat')
  ) || [];

  const conflictScore = conflictParams.length > 0 
    ? conflictParams.reduce((sum, p) => sum + p.score, 0) / conflictParams.length 
    : reportData.categoryScores?.['Conflict'] || currentScore * 0.9;

  const categoryScore = typeof reportData.categoryScores?.['Conflict'] === 'number'
    ? reportData.categoryScores['Conflict']
    : (reportData.categoryScores?.['Conflict'] as { score?: number })?.score || conflictScore;

  // Derive power scores from actual parameter data
  const getParamScore = (keywords: string[]) => {
    const allParams = reportData.parameterScores || [];
    const matched = allParams.filter(p => 
      keywords.some(k => p.parameterName?.toLowerCase().includes(k) || p.displayName?.toLowerCase().includes(k))
    );
    return matched.length > 0 
      ? Math.round(matched.reduce((sum, p) => sum + p.score, 0) / matched.length)
      : Math.round(categoryScore);
  };

  const powerScores = {
    physical: getParamScore(['threat', 'stakes', 'danger', 'physical']),
    psychological: getParamScore(['psychology', 'manipulat', 'depth', 'complex']),
    tactical: getParamScore(['tactical', 'strateg', 'intellig', 'plan']),
    dramatic: getParamScore(['dramatic', 'tension', 'conflict', 'opposition']),
  };

  const avgPower = Math.round((powerScores.physical + powerScores.psychological + powerScores.tactical + powerScores.dramatic) / 4);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Antagonist Analysis"
        subtitle="Evaluating the opposition's power, motivation, and dramatic function"
        icon={UserX}
        score={categoryScore}
      />

      {/* Power Breakdown */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="glass-premium p-5 text-center">
          <Sword className="h-5 w-5 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground mb-1">Physical</p>
          <ScoreDisplay score={powerScores.physical} size="sm" showLabel={false} />
        </Card>
        <Card className="glass-premium p-5 text-center">
          <Brain className="h-5 w-5 mx-auto mb-2 text-chart-6" />
          <p className="text-sm text-muted-foreground mb-1">Psychological</p>
          <ScoreDisplay score={powerScores.psychological} size="sm" showLabel={false} />
        </Card>
        <Card className="glass-premium p-5 text-center">
          <Target className="h-5 w-5 mx-auto mb-2 text-chart-4" />
          <p className="text-sm text-muted-foreground mb-1">Tactical</p>
          <ScoreDisplay score={powerScores.tactical} size="sm" showLabel={false} />
        </Card>
        <Card className="glass-premium p-5 text-center">
          <Zap className="h-5 w-5 mx-auto mb-2 text-chart-2" />
          <p className="text-sm text-muted-foreground mb-1">Dramatic</p>
          <ScoreDisplay score={powerScores.dramatic} size="sm" showLabel={false} />
        </Card>
        <Card className="glass-premium p-5 text-center bg-primary/5 border-primary/20">
          <Shield className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground mb-1">Overall</p>
          <ScoreDisplay score={avgPower} size="sm" />
        </Card>
      </div>

      {/* Core Thesis */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Compelling Opposition' : categoryScore >= 5 ? 'Opposition Needs Strengthening' : 'Weak Antagonistic Force'}
        content={
          categoryScore >= 7 
            ? 'The antagonist presents a formidable and layered challenge that elevates the protagonist\'s journey and creates meaningful dramatic tension.'
            : categoryScore >= 5
            ? 'The opposition is functional but could be more compelling. Consider deepening motivation or increasing threat level.'
            : 'The antagonistic force lacks the power to create sufficient dramatic tension. Strengthen the opposition significantly.'
        }
      />

      {/* Antagonist Fundamentals */}
      {antagonist && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Antagonist Profile" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Character Name</p>
                <p className="font-display font-semibold text-lg">{antagonist.name}</p>
              </div>
              {antagonist.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{antagonist.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dialogue Lines</p>
                  <p className="font-mono font-semibold">{antagonist.dialogueCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scene Appearances</p>
                  <p className="font-mono font-semibold">{antagonist.sceneCount}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Power Analysis</p>
              <div className="space-y-3">
                <ScoreBar score={powerScores.physical} label="Physical Threat" showValue />
                <ScoreBar score={powerScores.psychological} label="Psychological Manipulation" showValue />
                <ScoreBar score={powerScores.tactical} label="Strategic Intelligence" showValue />
                <ScoreBar score={powerScores.dramatic} label="Dramatic Weight" showValue />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Villain Archetype */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Antagonist Archetype Analysis" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'Tyrant', desc: 'Rules through fear and control', match: powerScores.physical > 7 },
            { type: 'Mastermind', desc: 'Operates through manipulation', match: powerScores.psychological > 7 },
            { type: 'Rival', desc: 'Personal competition with protagonist', match: powerScores.tactical > 7 },
            { type: 'Force of Nature', desc: 'Unstoppable external threat', match: powerScores.dramatic > 7 },
          ].map((archetype, index) => (
            <div 
              key={index}
              className={cn(
                "p-4 rounded-lg border",
                archetype.match ? "border-primary/30 bg-primary/5" : "border-border/50 bg-muted/20"
              )}
            >
              <p className={cn("font-display font-semibold mb-1", archetype.match && "text-primary")}>{archetype.type}</p>
              <p className="text-xs text-muted-foreground">{archetype.desc}</p>
              {archetype.match && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                  Best Match
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Parameter Scores */}
      {conflictParams.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Conflict Parameters" />
          <div className="space-y-4">
            {conflictParams.slice(0, 6).map((param, index) => (
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

      {/* Recommendations */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Antagonist Recommendations" />
        <div className="space-y-3">
          {avgPower < 7 && (
            <RecommendationCard
              title="Increase Threat Level"
              description="Give the antagonist more power, resources, or intelligence to make the protagonist's victory feel earned."
              priority={avgPower < 5 ? 'critical' : 'high'}
              effort="moderate"
              impact="Heightened dramatic tension"
            />
          )}
          {powerScores.psychological < 6 && (
            <RecommendationCard
              title="Add Psychological Depth"
              description="Develop the antagonist's worldview and motivation. The best villains believe they're the hero of their own story."
              priority="high"
              effort="moderate"
            />
          )}
          <RecommendationCard
            title="Mirror the Protagonist"
            description="Consider how the antagonist represents an alternate path or dark reflection of the protagonist's journey."
            priority="medium"
            effort="easy"
          />
        </div>
      </Card>
    </div>
  );
}
