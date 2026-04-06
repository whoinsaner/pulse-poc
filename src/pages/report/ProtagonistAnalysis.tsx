import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SectionHeader, 
  SubSectionHeader,
  DiagnosisSummary,
  WeightedParameterList,
  DevelopmentFocus,
  ScoreDisplay,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { User, Heart, Brain, Target, Zap, Users } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';
import { findProtagonistCharacters } from '@/lib/characterRoles';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

// Parameter names relevant to protagonist analysis
const PROTAGONIST_KEYWORDS = ['protagonist', 'character', 'arc', 'empathy', 'hero', 'journey'];

export default function ProtagonistAnalysis() {
  const context = useOutletContext<ReportContextValue>();
  const { reportData, currentScore, stakeholderLens } = context;
  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });
  
  // Get protagonist from AI agent content, fallback to highest dialogue count
  const characters = reportData.characters || [];
  const protagonistChars = findProtagonistCharacters(characters, reportData.agentContent);
  const protagonist = protagonistChars[0] || null;

  // Get agent content for protagonist — support both array (protagonistProfiles) and single (protagonistProfile)
  const agentContent = reportData.agentContent?.CharacterAgent;
  const protagonistProfiles: Array<{ name: string; want: string; need: string; flaw: string; arc: string; strengths?: string[]; weaknesses?: string[]; arcType?: string; resolutionRole?: string; removalImpact?: string }> = 
    agentContent?.protagonistProfiles || 
    (agentContent?.protagonistProfile ? [agentContent.protagonistProfile] : []);
  const protagonistSystemModel: { type?: string; rationale?: string } | undefined = agentContent?.protagonistSystemModel;
  const misinterpretationRisks: string[] = agentContent?.misinterpretationRisks || [];

  // Filter protagonist-relevant parameters
  const protagonistParams = useMemo(() => {
    const params = reportData.parameterScores || [];
    return params
      .filter(p => 
        p.category?.toLowerCase().includes('character') || 
        PROTAGONIST_KEYWORDS.some(k => 
          p.parameterName?.toLowerCase().includes(k) || 
          p.displayName?.toLowerCase().includes(k)
        )
      )
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        category: p.category,
        weight: 1.0,
      }));
  }, [reportData.parameterScores]);

  // Calculate section score
  const sectionScore = useMemo(() => {
    if (protagonistParams.length === 0) {
      return extractScore(reportData.categoryScores?.['Character']) || currentScore;
    }
    return Math.round(protagonistParams.reduce((sum, p) => sum + p.score, 0) / protagonistParams.length);
  }, [protagonistParams, reportData.categoryScores, currentScore]);

  // Derive dimension scores from actual parameter data
  const getParamScore = (keywords: string[]) => {
    const allParams = reportData.parameterScores || [];
    const matched = allParams.filter(p => 
      keywords.some(k => p.parameterName?.toLowerCase().includes(k) || p.displayName?.toLowerCase().includes(k))
    );
    return matched.length > 0 
      ? Math.round(matched.reduce((sum, p) => sum + p.score, 0) / matched.length)
      : Math.round(sectionScore);
  };

  const dimensionScores = {
    empathy: getParamScore(['empathy', 'relatab', 'likab', 'audience']),
    complexity: getParamScore(['complex', 'depth', 'dimension', 'psychology']),
    agency: getParamScore(['agency', 'active', 'drive', 'motivation']),
    growth: getParamScore(['arc', 'growth', 'transform', 'change']),
  };
  const avgDimension = Math.round((dimensionScores.empathy + dimensionScores.complexity + dimensionScores.agency + dimensionScores.growth) / 4);

  const filteredParams = filterParameters(protagonistParams);
  const filterStats = getFilterStats(protagonistParams);
  const basePath = window.location.pathname.split('/characters')[0];

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Protagonist Analysis"
        subtitle="Deep dive into the main character's construction, arc, and audience connection"
        icon={User}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* Protagonist System Model Badge */}
      {protagonistSystemModel?.type && (
        <Card className="p-5 flex items-start gap-4 border-primary/20 bg-primary/5">
          <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-semibold text-sm">Protagonist System Model:</span>
              <Badge variant="default" className="capitalize">{protagonistSystemModel.type}-Protagonist</Badge>
            </div>
            {protagonistSystemModel.rationale && (
              <p className="text-sm text-muted-foreground leading-relaxed">{protagonistSystemModel.rationale}</p>
            )}
          </div>
        </Card>
      )}

      {/* Stakeholder Filter Notice */}
      {isFiltered && stakeholderLens && (
        <StakeholderFilterNotice 
          stakeholderLens={stakeholderLens}
          shownCount={filterStats.shown}
          totalCount={filterStats.total}
        />
      )}

      {/* Diagnosis Summary — 3-column grid */}
      <DiagnosisSummary
        parameters={protagonistParams}
        categoryName="Protagonist"
        developmentLink={`${basePath}/development`}
        stakeholderLens={stakeholderLens}
      />

      {/* Dimension Tiles */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-5 text-center">
          <Heart className="h-5 w-5 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground mb-1">Empathy</p>
          <ScoreDisplay score={dimensionScores.empathy} size="sm" showLabel={false} />
        </Card>
        <Card className="p-5 text-center">
          <Brain className="h-5 w-5 mx-auto mb-2 text-chart-6" />
          <p className="text-sm text-muted-foreground mb-1">Complexity</p>
          <ScoreDisplay score={dimensionScores.complexity} size="sm" showLabel={false} />
        </Card>
        <Card className="p-5 text-center">
          <Target className="h-5 w-5 mx-auto mb-2 text-chart-4" />
          <p className="text-sm text-muted-foreground mb-1">Agency</p>
          <ScoreDisplay score={dimensionScores.agency} size="sm" showLabel={false} />
        </Card>
        <Card className="p-5 text-center">
          <Zap className="h-5 w-5 mx-auto mb-2 text-chart-2" />
          <p className="text-sm text-muted-foreground mb-1">Growth</p>
          <ScoreDisplay score={dimensionScores.growth} size="sm" showLabel={false} />
        </Card>
        <Card className="p-5 text-center bg-primary/5 border-primary/20">
          <User className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground mb-1">Overall</p>
          <ScoreDisplay score={avgDimension} size="sm" />
        </Card>
      </div>

      {/* Protagonist Profiles from AI — supports multiple protagonists */}
      {protagonistProfiles.length > 0 ? (
        protagonistProfiles.map((profile, idx) => (
          <Card key={idx} className="p-6">
            <SubSectionHeader title={`${profile.name} — ${profile.arcType ? profile.arcType.charAt(0).toUpperCase() + profile.arcType.slice(1) + ' ' : ''}Protagonist`} />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Character Name</p>
                  <p className="font-display font-semibold text-lg">{profile.name}</p>
                </div>
                {profile.arcType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Arc Type</p>
                    <Badge variant="outline" className="capitalize">{profile.arcType.replace(/-/g, ' ')}</Badge>
                  </div>
                )}
                {profile.want && (
                  <div>
                    <p className="text-sm text-muted-foreground">Want</p>
                    <p className="text-sm leading-relaxed">{profile.want}</p>
                  </div>
                )}
                {profile.need && (
                  <div>
                    <p className="text-sm text-muted-foreground">Need</p>
                    <p className="text-sm leading-relaxed">{profile.need}</p>
                  </div>
                )}
                {profile.flaw && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fatal Flaw</p>
                    <p className="text-sm leading-relaxed">{profile.flaw}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {profile.arc && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Character Arc</p>
                    <p className="text-sm leading-relaxed">{profile.arc}</p>
                  </div>
                )}
                {profile.resolutionRole && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Resolution Role</p>
                    <p className="text-sm leading-relaxed">{profile.resolutionRole}</p>
                  </div>
                )}
                {profile.removalImpact && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Removal Impact</p>
                    <p className="text-sm leading-relaxed italic text-destructive/80">{profile.removalImpact}</p>
                  </div>
                )}
                {profile.strengths && profile.strengths.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Strengths</p>
                    <ul className="text-sm space-y-1">{profile.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul>
                  </div>
                )}
                {profile.weaknesses && profile.weaknesses.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Weaknesses</p>
                    <ul className="text-sm space-y-1">{profile.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      ) : protagonist ? (
        <Card className="p-6">
          <SubSectionHeader title={`${protagonist.name} — Character Profile`} />
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
            <div className="space-y-4">
              {protagonist.arcSummary && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Character Arc</p>
                  <p className="text-sm leading-relaxed">{protagonist.arcSummary}</p>
                </div>
              )}
              {protagonist.relationships && protagonist.relationships.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Key Relationships</p>
                  <div className="space-y-2">
                    {protagonist.relationships.slice(0, 4).map((rel, idx) => (
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
      ) : null}

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={filteredParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Protagonist Parameter Breakdown"
        initiallyExpanded={false}
        defaultVisibleCount={6}
      />

      {/* Development Focus */}
      {(() => {
        const items = protagonistParams
          .filter(p => p.score < 70)
          .sort((a, b) => a.score - b.score)
          .map(p => ({ title: p.displayName, description: p.rationale || '' }));
        return items.length > 0 ? (
          <DevelopmentFocus
            sectionName="Protagonist"
            items={items}
            developmentPath={`${basePath}/development`}
            stakeholderLens={stakeholderLens}
            relatedSections={[
              { label: 'Character Diagnosis', path: `${basePath}/characters` },
              { label: 'Antagonist Analysis', path: `${basePath}/characters/antagonist` },
            ]}
          />
        ) : null;
      })()}
    </div>
  );
}
