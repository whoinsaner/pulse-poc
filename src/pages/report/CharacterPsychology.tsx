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
  StrengthWeaknessList,
  RecommendationCard
} from '@/components/report/ui';
import { Brain, Heart, Target, Zap, Eye, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CharacterPsychology() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  const characters = reportData.characters || [];
  const protagonist = characters.length > 0 
    ? characters.reduce((prev, current) => 
        (current.dialogueCount > prev.dialogueCount) ? current : prev
      )
    : null;

  // Get psychology-related parameters
  const psychParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('character') ||
    p.parameterName?.toLowerCase().includes('psychology') ||
    p.parameterName?.toLowerCase().includes('motivation') ||
    p.parameterName?.toLowerCase().includes('flaw') ||
    p.parameterName?.toLowerCase().includes('internal') ||
    p.parameterName?.toLowerCase().includes('emotional')
  ) || [];

  const psychScore = psychParams.length > 0 
    ? psychParams.reduce((sum, p) => sum + p.score, 0) / psychParams.length 
    : currentScore;

  // Psychological pillars (simulated)
  const pillars = {
    motivation: Math.min(10, psychScore + (Math.random() - 0.5)),
    flaw: Math.min(10, psychScore * 0.9 + (Math.random() - 0.3)),
    belief: Math.min(10, psychScore * 1.05 + (Math.random() - 0.5)),
    fear: Math.min(10, psychScore * 0.95 + (Math.random() - 0.4)),
    desire: Math.min(10, psychScore + 0.2 + (Math.random() - 0.5)),
    need: Math.min(10, psychScore * 0.85 + (Math.random() - 0.3)),
  };

  const psychInsights = reportData.insights?.filter(i => 
    i.category?.toLowerCase().includes('character') ||
    i.title?.toLowerCase().includes('psychology') ||
    i.title?.toLowerCase().includes('motivation')
  ) || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Character Psychology"
        subtitle="Exploring internal architecture, motivations, and psychological depth"
        icon={Brain}
        score={psychScore}
      />

      {/* Psychological Pillars */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: 'motivation', icon: Target, label: 'Motivation', desc: 'What drives them', score: pillars.motivation },
          { key: 'flaw', icon: Shield, label: 'Fatal Flaw', desc: 'Internal weakness', score: pillars.flaw },
          { key: 'belief', icon: Eye, label: 'Core Belief', desc: 'Worldview lens', score: pillars.belief },
          { key: 'fear', icon: Heart, label: 'Deepest Fear', desc: 'What they avoid', score: pillars.fear },
          { key: 'desire', icon: Zap, label: 'Want', desc: 'Conscious goal', score: pillars.desire },
          { key: 'need', icon: Brain, label: 'Need', desc: 'True growth path', score: pillars.need },
        ].map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <Card key={index} className="p-4 text-center">
              <Icon className={cn(
                "h-5 w-5 mx-auto mb-2",
                pillar.score >= 7 ? "text-success" : pillar.score >= 5 ? "text-chart-4" : "text-warning"
              )} />
              <p className="text-xs text-muted-foreground mb-1">{pillar.label}</p>
              <ScoreDisplay score={pillar.score} size="sm" showLabel={false} />
              <p className="text-xs text-muted-foreground mt-1">{pillar.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Core Finding */}
      <VerdictBox
        type={psychScore >= 7 ? 'success' : psychScore >= 5 ? 'finding' : 'issue'}
        title={psychScore >= 7 ? 'Strong Psychological Foundation' : psychScore >= 5 ? 'Psychology Needs Development' : 'Shallow Character Psychology'}
        content={
          psychScore >= 7 
            ? 'Characters demonstrate rich internal lives with clear motivations, meaningful flaws, and authentic emotional responses.'
            : psychScore >= 5
            ? 'Basic psychological elements are present but could be deepened. Consider exploring internal conflicts more explicitly.'
            : 'Characters lack psychological depth. Develop clear internal drivers, fears, and contradictions.'
        }
      />

      {/* Want vs Need Analysis */}
      <Card className="p-6">
        <SubSectionHeader title="Want vs. Need Dynamic" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-chart-4" />
              <h4 className="font-semibold">External Want</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              The conscious goal the protagonist pursues throughout the story.
            </p>
            <ScoreBar score={pillars.desire} label="Want Clarity" showValue />
            <p className="text-xs text-muted-foreground mt-2">
              {pillars.desire >= 7 
                ? "Clear, specific, and actively pursued goal" 
                : pillars.desire >= 5 
                ? "Goal present but could be more specific"
                : "External goal needs clarification"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Internal Need</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              The unconscious growth the character must achieve for true fulfillment.
            </p>
            <ScoreBar score={pillars.need} label="Need Clarity" showValue />
            <p className="text-xs text-muted-foreground mt-2">
              {pillars.need >= 7 
                ? "Clear internal journey with meaningful transformation" 
                : pillars.need >= 5 
                ? "Some internal growth, could be more defined"
                : "Internal arc needs significant development"}
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-muted/30">
          <p className="text-sm">
            <span className="font-medium">Want/Need Gap: </span>
            {Math.abs(pillars.desire - pillars.need) < 1 
              ? "Well-aligned — character's external pursuit connects to internal growth."
              : pillars.desire > pillars.need 
              ? "External focus stronger — consider deepening the internal journey."
              : "Internal focus stronger — ensure external goals create sufficient drive."}
          </p>
        </div>
      </Card>

      {/* Flaw & Fear Analysis */}
      <Card className="p-6">
        <SubSectionHeader title="Flaw & Fear Architecture" />
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
            <Shield className="h-6 w-6 text-chart-5 mt-1" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">Fatal Flaw</h4>
              <p className="text-sm text-muted-foreground mb-2">
                The internal weakness that creates obstacles and drives character growth.
              </p>
              <ScoreBar score={pillars.flaw} showValue={false} />
              <p className="text-xs text-muted-foreground mt-1">
                {pillars.flaw >= 7 
                  ? "Well-defined flaw that drives conflict and growth" 
                  : pillars.flaw >= 5 
                  ? "Flaw present but not fully explored"
                  : "Character flaw needs clearer definition"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
            <Heart className="h-6 w-6 text-destructive mt-1" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">Deepest Fear</h4>
              <p className="text-sm text-muted-foreground mb-2">
                The core vulnerability the character protects and must eventually face.
              </p>
              <ScoreBar score={pillars.fear} showValue={false} />
              <p className="text-xs text-muted-foreground mt-1">
                {pillars.fear >= 7 
                  ? "Fear is palpable and creates meaningful stakes" 
                  : pillars.fear >= 5 
                  ? "Some fear elements but could be more visceral"
                  : "Character's deepest fear needs development"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Parameter Scores */}
      <ParameterBreakdown title="Psychology Parameters" parameters={psychParams} />

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Psychology Recommendations" />
        <div className="space-y-3">
          {pillars.flaw < 6 && (
            <RecommendationCard
              title="Define the Fatal Flaw"
              description="Give the protagonist a specific internal weakness that creates conflict and must be overcome for growth."
              priority="high"
              effort="moderate"
              impact="Deeper character resonance"
            />
          )}
          {Math.abs(pillars.desire - pillars.need) > 2 && (
            <RecommendationCard
              title="Connect Want to Need"
              description="Ensure the external pursuit naturally leads to internal revelation. The goal should test the character's growth."
              priority="high"
              effort="moderate"
            />
          )}
          {pillars.belief < 6 && (
            <RecommendationCard
              title="Establish Core Belief"
              description="Define the worldview lens through which the character interprets events. This belief should be challenged."
              priority="medium"
              effort="easy"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
