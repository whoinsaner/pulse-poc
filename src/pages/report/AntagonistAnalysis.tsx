import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  DiagnosisSummary,
  WeightedParameterList,
  DevelopmentFocus,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { UserX } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

const ANTAGONIST_KEYWORDS = ['antagonist', 'villain', 'opposition', 'threat', 'conflict'];

export default function AntagonistAnalysis() {
  const context = useOutletContext<ReportContextValue>();
  const { reportData, currentScore, stakeholderLens } = context;
  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });

  const agentContent = reportData.agentContent?.CharacterAgent;
  const antagonistProfile = agentContent?.antagonistProfile;

  // Find antagonist character from characters list as fallback
  const characters = reportData.characters || [];
  const sortedByPresence = [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount);
  const antagonistCharacter = sortedByPresence[1] || null;

  // Filter antagonist/conflict-relevant parameters
  const antagonistParams = useMemo(() => {
    const params = reportData.parameterScores || [];
    return params
      .filter(p => 
        p.category?.toLowerCase().includes('conflict') || 
        p.category?.toLowerCase().includes('character') ||
        ANTAGONIST_KEYWORDS.some(k => 
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
    if (antagonistParams.length === 0) {
      return extractScore(reportData.categoryScores?.['Conflict']) || 
             extractScore(reportData.categoryScores?.['Character']) || 
             currentScore;
    }
    return Math.round(antagonistParams.reduce((sum, p) => sum + p.score, 0) / antagonistParams.length);
  }, [antagonistParams, reportData.categoryScores, currentScore]);

  const filteredParams = filterParameters(antagonistParams);
  const filterStats = getFilterStats(antagonistParams);
  const basePath = window.location.pathname.split('/characters')[0];

  // AI recommendations
  const agentRecs = agentContent?.recommendations || [];

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Antagonist Analysis"
        subtitle="Evaluating the opposition's power, motivation, and dramatic function"
        icon={UserX}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

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
        parameters={antagonistParams}
        categoryName="Antagonist"
        developmentLink={`${basePath}/development`}
        stakeholderLens={stakeholderLens}
      />

      {/* Antagonist Profile from AI */}
      {antagonistProfile && (
        <Card className="p-6">
          <SubSectionHeader title={`${antagonistProfile.name} — Antagonist Profile`} />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {antagonistProfile.motivation && (
                <div>
                  <p className="text-sm text-muted-foreground">Motivation</p>
                  <p className="text-sm leading-relaxed">{antagonistProfile.motivation}</p>
                </div>
              )}
              {antagonistProfile.threat && (
                <div>
                  <p className="text-sm text-muted-foreground">Threat Level</p>
                  <p className="text-sm leading-relaxed">{antagonistProfile.threat}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {antagonistProfile.complexity && (
                <div>
                  <p className="text-sm text-muted-foreground">Complexity</p>
                  <p className="text-sm leading-relaxed">{antagonistProfile.complexity}</p>
                </div>
              )}
              {(antagonistProfile as any)?.want && (
                <div>
                  <p className="text-sm text-muted-foreground">Want</p>
                  <p className="text-sm leading-relaxed">{(antagonistProfile as any).want}</p>
                </div>
              )}
              {(antagonistProfile as any)?.flaw && (
                <div>
                  <p className="text-sm text-muted-foreground">Fatal Flaw</p>
                  <p className="text-sm leading-relaxed">{(antagonistProfile as any).flaw}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Fallback: Character data when no AI profile */}
      {!antagonistProfile && antagonistCharacter && (
        <Card className="p-6">
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
              {antagonistCharacter.arcSummary && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Character Arc</p>
                  <p className="text-sm leading-relaxed">{antagonistCharacter.arcSummary}</p>
                </div>
              )}
              {antagonistCharacter.relationships && antagonistCharacter.relationships.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Key Relationships</p>
                  <div className="space-y-2">
                    {antagonistCharacter.relationships.slice(0, 3).map((rel, idx) => (
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

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={filteredParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Antagonist Parameter Breakdown"
        initiallyExpanded={false}
        defaultVisibleCount={6}
      />

      {/* Development Focus */}
      {(() => {
        const items = antagonistParams
          .filter(p => p.score < 70)
          .sort((a, b) => a.score - b.score)
          .map(p => ({ title: p.displayName, description: p.rationale || '' }));
        return items.length > 0 ? (
          <DevelopmentFocus
            sectionName="Antagonist"
            items={items}
            developmentPath={`${basePath}/development`}
            stakeholderLens={stakeholderLens}
            relatedSections={[
              { label: 'Character Diagnosis', path: `${basePath}/characters` },
              { label: 'Protagonist Analysis', path: `${basePath}/characters/protagonist` },
            ]}
          />
        ) : null;
      })()}
    </div>
  );
}
