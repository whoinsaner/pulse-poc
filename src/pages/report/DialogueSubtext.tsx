import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { ParameterBreakdown } from '@/components/report/ParameterBreakdown';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  SubSectionHeader,
  StrengthWeaknessList,
} from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';
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

  const dialogueParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('dialogue') || 
    p.parameterName?.toLowerCase().includes('dialogue') ||
    p.parameterName?.toLowerCase().includes('voice') ||
    p.parameterName?.toLowerCase().includes('subtext')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Dialogue']) || 
    (dialogueParams.length > 0 
      ? dialogueParams.reduce((sum, p) => sum + p.score, 0) / dialogueParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.DialogueAgent;

  const characters = reportData.characters || [];
  const topCharacters = [...characters]
    .sort((a, b) => b.dialogueCount - a.dialogueCount)
    .slice(0, 4);

  const strengths = dialogueParams.filter(p => p.score >= 70).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

  const weaknesses = dialogueParams.filter(p => p.score < 50).map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 80)
  }));

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

      {isFiltered && stakeholderLens && (
        <StakeholderFilterNotice 
          stakeholderLens={stakeholderLens}
          shownCount={filterStats.shown}
          totalCount={filterStats.total}
        />
      )}

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="DialogueAgent" content={agentContent} />
      )}

      {/* Character Voice Analysis */}
      {topCharacters.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Character Voice Distinctiveness" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-display font-medium">Character</th>
                  <th className="text-left py-3 px-4 font-display font-medium">Dialogue Lines</th>
                  <th className="text-left py-3 px-4 font-display font-medium">Scene Presence</th>
                  <th className="text-left py-3 px-4 font-display font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {topCharacters.map((char, idx) => (
                  <tr key={idx} className="border-b border-border/30 last:border-0">
                    <td className="py-3 px-4 font-medium">{char.name}</td>
                    <td className="py-3 px-4 font-mono">{char.dialogueCount}</td>
                    <td className="py-3 px-4 font-mono">{char.sceneCount} scenes</td>
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
      <ParameterBreakdown title="Dialogue Parameters" parameters={filteredDialogueParams} />

      {/* Strengths & Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList strengths={strengths} weaknesses={weaknesses} />
      )}
    </div>
  );
}
