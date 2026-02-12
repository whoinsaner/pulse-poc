import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  VerdictBox, 
  ScoreBar,
  ScoreDisplay,
  RecommendationCard,
  WeightedParameterList,
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

  // Agent content
  const agentContent = reportData.agentContent?.CharacterAgent;
  const protagonistProfile = agentContent?.protagonistProfile;

  // Build pillars from real parameter data or protagonist profile
  const getParamScore = (keywords: string[]): number => {
    const matched = psychParams.filter(p => 
      keywords.some(k => p.parameterName?.toLowerCase().includes(k) || p.displayName?.toLowerCase().includes(k))
    );
    return matched.length > 0 
      ? matched.reduce((sum, p) => sum + p.score, 0) / matched.length 
      : psychScore;
  };

  const pillars = [
    { key: 'motivation', icon: Target, label: 'Motivation', desc: protagonistProfile?.want || 'What drives them', score: getParamScore(['motivation', 'drive', 'goal']) },
    { key: 'flaw', icon: Shield, label: 'Fatal Flaw', desc: protagonistProfile?.flaw || 'Internal weakness', score: getParamScore(['flaw', 'weakness', 'fatal']) },
    { key: 'belief', icon: Eye, label: 'Core Belief', desc: 'Worldview lens', score: getParamScore(['belief', 'worldview', 'value']) },
    { key: 'fear', icon: Heart, label: 'Deepest Fear', desc: 'What they avoid', score: getParamScore(['fear', 'vulnerab', 'afraid']) },
    { key: 'desire', icon: Zap, label: 'Want', desc: protagonistProfile?.want || 'Conscious goal', score: getParamScore(['want', 'desire', 'conscious', 'external']) },
    { key: 'need', icon: Brain, label: 'Need', desc: protagonistProfile?.need || 'True growth path', score: getParamScore(['need', 'internal', 'growth', 'arc']) },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Character Psychology"
        subtitle="Exploring internal architecture, motivations, and psychological depth"
        icon={Brain}
        score={psychScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="CharacterAgent" content={agentContent} />
      )}

      {/* Psychological Pillars */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <Card key={index} className="p-4 text-center">
              <Icon className={cn(
                "h-5 w-5 mx-auto mb-2",
                pillar.score >= 70 ? "text-success" : pillar.score >= 50 ? "text-chart-4" : "text-warning"
              )} />
              <p className="text-xs text-muted-foreground mb-1">{pillar.label}</p>
              <ScoreDisplay score={pillar.score} size="sm" showLabel={false} />
              <p className="text-xs text-muted-foreground mt-1">{pillar.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* Want vs Need from protagonist profile */}
      {protagonistProfile && (protagonistProfile.want || protagonistProfile.need) && (
        <Card className="p-6">
          <SubSectionHeader title="Want vs. Need Dynamic" />
          <div className="grid md:grid-cols-2 gap-6">
            {protagonistProfile.want && (
              <div className="p-4 rounded-lg bg-chart-4/10 border border-chart-4/30">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-chart-4" />
                  <h4 className="font-semibold">External Want</h4>
                </div>
                <p className="text-sm text-muted-foreground">{protagonistProfile.want}</p>
              </div>
            )}
            {protagonistProfile.need && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Internal Need</h4>
                </div>
                <p className="text-sm text-muted-foreground">{protagonistProfile.need}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Flaw & Arc from protagonist profile */}
      {protagonistProfile && (protagonistProfile.flaw || protagonistProfile.arc) && (
        <Card className="p-6">
          <SubSectionHeader title="Flaw & Arc Architecture" />
          <div className="space-y-4">
            {protagonistProfile.flaw && (
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <Shield className="h-6 w-6 text-chart-5 mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Fatal Flaw</h4>
                  <p className="text-sm text-muted-foreground">{protagonistProfile.flaw}</p>
                </div>
              </div>
            )}
            {protagonistProfile.arc && (
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <Heart className="h-6 w-6 text-destructive mt-1" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Character Arc</h4>
                  <p className="text-sm text-muted-foreground">{protagonistProfile.arc}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Psychology Insights from agent */}
      {agentContent?.psychologyInsights && (
        <Card className="p-6 bg-primary/5 border-primary/10">
          <SubSectionHeader title="Psychology Insights" />
          <p className="text-sm text-muted-foreground leading-relaxed">{agentContent.psychologyInsights}</p>
        </Card>
      )}

      {/* Parameter Scores */}
      <WeightedParameterList
        parameters={psychParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Psychology Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />
    </div>
  );
}
