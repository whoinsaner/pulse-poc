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
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { User } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';
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
  
  // Get protagonist from characters (highest dialogue count)
  const characters = reportData.characters || [];
  const protagonist = characters.length > 0 
    ? characters.reduce((prev, current) => 
        (current.dialogueCount > prev.dialogueCount) ? current : prev
      )
    : null;

  // Get agent content for protagonist
  const agentContent = reportData.agentContent?.CharacterAgent;
  const protagonistProfile = agentContent?.protagonistProfile;

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

      {/* Protagonist Profile from AI or parsed data */}
      {(protagonistProfile || protagonist) && (
        <Card className="p-6">
          <SubSectionHeader title={`${protagonistProfile?.name || protagonist?.name || 'Protagonist'} — Character Profile`} />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Character Name</p>
                <p className="font-display font-semibold text-lg">{protagonistProfile?.name || protagonist?.name}</p>
              </div>
              {protagonistProfile?.want && (
                <div>
                  <p className="text-sm text-muted-foreground">Want</p>
                  <p className="text-sm leading-relaxed">{protagonistProfile.want}</p>
                </div>
              )}
              {protagonistProfile?.need && (
                <div>
                  <p className="text-sm text-muted-foreground">Need</p>
                  <p className="text-sm leading-relaxed">{protagonistProfile.need}</p>
                </div>
              )}
              {protagonistProfile?.flaw && (
                <div>
                  <p className="text-sm text-muted-foreground">Fatal Flaw</p>
                  <p className="text-sm leading-relaxed">{protagonistProfile.flaw}</p>
                </div>
              )}
              {!protagonistProfile && protagonist?.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{protagonist.description}</p>
                </div>
              )}
              {protagonist && (
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
              )}
            </div>
            <div className="space-y-4">
              {(protagonistProfile?.arc || protagonist?.arcSummary) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Character Arc</p>
                  <p className="text-sm leading-relaxed">{protagonistProfile?.arc || protagonist?.arcSummary}</p>
                </div>
              )}
              {protagonist?.relationships && protagonist.relationships.length > 0 && (
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
      )}

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
