import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { ParameterBreakdown } from '@/components/report/ParameterBreakdown';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  VerdictBox, 
  ScoreBar,
  ScoreDisplay,
  RecommendationCard,
  QuoteCallout
} from '@/components/report/ui';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { UserX, Shield, Brain, Zap, Target, Sword } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractScore } from '@/lib/scoreUtils';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export default function AntagonistAnalysis() {
  const { reportData, currentScore, stakeholderLens } = useOutletContext<ReportContextValue>();
  
  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });

  const agentContent = reportData.agentContent?.CharacterAgent;
  const antagonistProfile = agentContent?.antagonistProfile;

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
    : extractScore(reportData.categoryScores?.['Conflict']) || currentScore * 0.9;

  const categoryScore = extractScore(reportData.categoryScores?.['Conflict']) || conflictScore;

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

  // AI-generated recommendations from CharacterAgent
  const agentRecs = agentContent?.recommendations || [];

  // Filter parameters based on stakeholder lens
  const filteredConflictParams = filterParameters(conflictParams);
  const filterStats = getFilterStats(conflictParams);

  // Find antagonist character from characters list as fallback
  const characters = reportData.characters || [];
  const sortedByPresence = [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount);
  const antagonistCharacter = sortedByPresence[1] || null;

  const antagonistName = antagonistProfile?.name || antagonistCharacter?.name || 'Antagonist';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Antagonist Analysis"
        subtitle="Evaluating the opposition's power, motivation, and dramatic function"
        icon={UserX}
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

      {/* AI Agent Narrative Content */}
      {agentContent && (
        <AgentNarrativePanel 
          agentName="CharacterAgent" 
          content={agentContent} 
        />
      )}

      {/* Antagonist Profile from AI */}
      {antagonistProfile && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title={`${antagonistProfile.name} — Antagonist Profile`} />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Motivation</p>
                <p className="text-sm leading-relaxed">{antagonistProfile.motivation}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Threat Level</p>
                <p className="text-sm leading-relaxed">{antagonistProfile.threat}</p>
              </div>
            </div>
            <div>
              <div>
                <p className="text-sm text-muted-foreground">Complexity</p>
                <p className="text-sm leading-relaxed">{antagonistProfile.complexity}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Fallback: Character data when no AI profile */}
      {!antagonistProfile && antagonistCharacter && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Antagonist Profile" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Character Name</p>
                <p className="font-display font-semibold text-lg">{antagonistCharacter.name}</p>
              </div>
              {antagonistCharacter.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{antagonistCharacter.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dialogue Lines</p>
                  <p className="font-mono font-semibold">{antagonistCharacter.dialogueCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scene Appearances</p>
                  <p className="font-mono font-semibold">{antagonistCharacter.sceneCount}</p>
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

      {/* Conflict Parameters */}
      <ParameterBreakdown title="Conflict Parameters" parameters={filteredConflictParams} maxVisible={6} />

      {/* Recommendations — AI-first, fallback to template */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Antagonist Recommendations" />
        <div className="space-y-3">
          {agentRecs.length > 0 ? (
            agentRecs.map((rec, i) => {
              const effortMap: Record<string, 'easy' | 'moderate' | 'difficult'> = { easy: 'easy', moderate: 'moderate', hard: 'difficult', difficult: 'difficult' };
              return (
                <RecommendationCard
                  key={i}
                  title={rec.title}
                  description={rec.description}
                  priority={rec.priority || 'medium'}
                  effort={effortMap[rec.effort || 'moderate'] || 'moderate'}
                />
              );
            })
          ) : (
            <>
              {avgPower < 70 && (
                <RecommendationCard
                  title="Increase Threat Level"
                  description="Give the antagonist more power, resources, or intelligence to make the protagonist's victory feel earned."
                  priority={avgPower < 50 ? 'critical' : 'high'}
                  effort="moderate"
                  impact="Heightened dramatic tension"
                />
              )}
              {powerScores.psychological < 60 && (
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
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
