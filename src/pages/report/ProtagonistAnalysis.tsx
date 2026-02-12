import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { AgentNarrativePanel, CharacterNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  StrengthWeaknessList,
  WeightedParameterList,
} from '@/components/report/ui';
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

export default function ProtagonistAnalysis() {
  const { reportData, currentScore, stakeholderLens } = useOutletContext<ReportContextValue>();
  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });
  
  const characters = reportData.characters || [];
  const protagonist = characters.length > 0 
    ? characters.reduce((prev, current) => 
        (current.dialogueCount > prev.dialogueCount) ? current : prev
      )
    : null;

  const characterParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('character') || 
    p.parameterName?.toLowerCase().includes('protagonist') ||
    p.parameterName?.toLowerCase().includes('character') ||
    p.parameterName?.toLowerCase().includes('arc') ||
    p.parameterName?.toLowerCase().includes('empathy')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Character']) || 
    (characterParams.length > 0 
      ? characterParams.reduce((sum, p) => sum + p.score, 0) / characterParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.CharacterAgent;

  const strengths = characterParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = characterParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const filteredCharacterParams = filterParameters(characterParams);
  const filterStats = getFilterStats(characterParams);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Protagonist Analysis"
        subtitle="Deep dive into the main character's construction, arc, and audience connection"
        icon={User}
        score={categoryScore}
      />

      {isFiltered && stakeholderLens && (
        <StakeholderFilterNotice 
          stakeholderLens={stakeholderLens}
          shownCount={filterStats.shown}
          totalCount={filterStats.total}
        />
      )}

      {/* Agent Narrative with character extras (protagonist profile, etc.) */}
      {agentContent ? (
        <CharacterNarrativePanel content={agentContent} />
      ) : null}

      {/* Character Fundamentals from parsed data */}
      {protagonist && (
        <Card className="p-6">
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

      {/* Parameter Scores */}
      <WeightedParameterList
        parameters={filteredCharacterParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Character Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}
    </div>
  );
}
