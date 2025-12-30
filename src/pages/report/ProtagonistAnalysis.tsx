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
  RecommendationCard,
  QuoteCallout
} from '@/components/report/ui';
import { User, Heart, Target, Zap, Brain, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export default function ProtagonistAnalysis() {
  const { reportData, currentScore, stakeholderLens } = useOutletContext<ReportContextValue>();
  
  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });
  
  // Find the protagonist (character with most dialogue/scenes)
  const characters = reportData.characters || [];
  const protagonist = characters.length > 0 
    ? characters.reduce((prev, current) => 
        (current.dialogueCount > prev.dialogueCount) ? current : prev
      )
    : null;

  // Get character-related parameters
  const characterParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('character') || 
    p.parameterName?.toLowerCase().includes('protagonist') ||
    p.parameterName?.toLowerCase().includes('character') ||
    p.parameterName?.toLowerCase().includes('arc') ||
    p.parameterName?.toLowerCase().includes('empathy')
  ) || [];

  const characterScore = characterParams.length > 0 
    ? characterParams.reduce((sum, p) => sum + p.score, 0) / characterParams.length 
    : reportData.categoryScores?.['Character'] || currentScore;

  const categoryScore = typeof reportData.categoryScores?.['Character'] === 'number'
    ? reportData.categoryScores['Character']
    : (reportData.categoryScores?.['Character'] as { score?: number })?.score || characterScore;

  // Simulated sub-scores
  const subScores = {
    empathy: Math.min(10, categoryScore + (Math.random() - 0.5)),
    uniqueness: Math.min(10, categoryScore - 0.3 + (Math.random() - 0.3)),
    arcQuality: Math.min(10, categoryScore + 0.2 + (Math.random() - 0.5)),
    agency: Math.min(10, categoryScore - 0.1 + (Math.random() - 0.4)),
  };

  const characterInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('character') ||
    i.title?.toLowerCase().includes('protagonist') ||
    i.title?.toLowerCase().includes('character')
  ) || [];

  const strengths = characterParams.filter(p => p.score >= 7).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = characterParams.filter(p => p.score < 5).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  // Filter parameters based on stakeholder lens
  const filteredCharacterParams = filterParameters(characterParams);
  const filterStats = getFilterStats(characterParams);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Protagonist Analysis"
        subtitle="Deep dive into the main character's construction, arc, and audience connection"
        icon={User}
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

      {/* Score Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="glass-premium p-5 text-center">
          <Heart className="h-5 w-5 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground mb-1">Empathy Score</p>
          <ScoreDisplay score={subScores.empathy} size="sm" showLabel={false} />
        </Card>
        <Card className="glass-premium p-5 text-center">
          <Zap className="h-5 w-5 mx-auto mb-2 text-chart-4" />
          <p className="text-sm text-muted-foreground mb-1">Uniqueness</p>
          <ScoreDisplay score={subScores.uniqueness} size="sm" showLabel={false} />
        </Card>
        <Card className="glass-premium p-5 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-chart-3" />
          <p className="text-sm text-muted-foreground mb-1">Arc Quality</p>
          <ScoreDisplay score={subScores.arcQuality} size="sm" showLabel={false} />
        </Card>
        <Card className="glass-premium p-5 text-center">
          <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground mb-1">Overall</p>
          <ScoreDisplay score={categoryScore} size="sm" />
        </Card>
      </div>

      {/* Core Finding */}
      <VerdictBox
        type={categoryScore >= 7 ? 'success' : categoryScore >= 5 ? 'finding' : 'issue'}
        title={categoryScore >= 7 ? 'Strong Protagonist Foundation' : categoryScore >= 5 ? 'Protagonist Needs Development' : 'Critical Character Issues'}
        content={
          categoryScore >= 7 
            ? 'The protagonist is well-constructed with clear motivations, relatable flaws, and a meaningful transformation arc.'
            : categoryScore >= 5
            ? 'Core character elements are present but need deepening. Focus on internal conflict and clearer motivation.'
            : 'The protagonist lacks essential elements for audience connection. Address fundamental character construction.'
        }
      />

      {/* Character Fundamentals */}
      {protagonist && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Character Fundamentals" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Character Name</p>
                <p className="font-display font-semibold text-lg">{protagonist.name}</p>
              </div>
              {protagonist.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{protagonist.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Dialogue Lines</p>
                  <p className="font-mono font-semibold">{protagonist.dialogueCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scene Appearances</p>
                  <p className="font-mono font-semibold">{protagonist.sceneCount}</p>
                </div>
              </div>
            </div>
            <div>
              {protagonist.arcSummary && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Character Arc</p>
                  <p className="text-sm leading-relaxed">{protagonist.arcSummary}</p>
                </div>
              )}
              {protagonist.relationships && protagonist.relationships.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Key Relationships</p>
                  <div className="space-y-2">
                    {protagonist.relationships.slice(0, 3).map((rel, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{rel.character}</span>
                        <span className="text-muted-foreground">— {rel.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Character Arc Breakdown */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Character Arc Breakdown" />
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { act: 'Act I', phase: 'Ordinary World', desc: 'Establishing the protagonist\'s status quo and introducing their flaw/need' },
              { act: 'Act II', phase: 'Tests & Transformation', desc: 'Character faces challenges that force growth and self-reflection' },
              { act: 'Act III', phase: 'New Self', desc: 'Protagonist demonstrates change through climactic choices' },
            ].map((phase, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    index === 0 ? "bg-chart-1" : index === 1 ? "bg-chart-2" : "bg-chart-3"
                  )} />
                  <span className="font-display font-semibold">{phase.act}</span>
                </div>
                <p className="text-sm font-medium mb-1">{phase.phase}</p>
                <p className="text-xs text-muted-foreground">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Parameter Scores */}
      {filteredCharacterParams.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Character Parameters" />
          <div className="space-y-4">
            {filteredCharacterParams.slice(0, 8).map((param, index) => (
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
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList
          strengths={strengths}
          weaknesses={weaknesses}
        />
      )}

      {/* Recommendations */}
      <Card className="glass-premium p-6">
        <SubSectionHeader title="Protagonist Recommendations" />
        <div className="space-y-3">
          {subScores.empathy < 7 && (
            <RecommendationCard
              title="Increase Empathy Connection"
              description="Add moments of vulnerability or relatability that help audiences root for the protagonist."
              priority={subScores.empathy < 5 ? 'critical' : 'high'}
              effort="moderate"
              impact="Stronger audience investment"
            />
          )}
          {subScores.agency < 6 && (
            <RecommendationCard
              title="Strengthen Character Agency"
              description="Ensure the protagonist drives the plot through active choices rather than reacting to events."
              priority="high"
              effort="moderate"
            />
          )}
          {subScores.arcQuality < 7 && (
            <RecommendationCard
              title="Clarify Character Transformation"
              description="Make the internal change more visible through contrasting behavior in Act I vs Act III."
              priority="medium"
              effort="easy"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
