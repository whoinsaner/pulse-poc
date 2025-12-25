import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  SubSectionHeader,
  VerdictBox, 
  ScoreBar,
  ScoreBadge,
  AnalysisTable,
  RecommendationCard
} from '@/components/report/ui';
import { Users, MessageSquare, Film, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function SupportingCast() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();
  
  const characters = reportData.characters || [];
  
  // Sort by dialogue count, skip first 2 (protagonist/antagonist)
  const sortedCharacters = [...characters].sort((a, b) => b.dialogueCount - a.dialogueCount);
  const supportingCast = sortedCharacters.slice(2, 12); // Top 10 supporting

  // Calculate cast metrics
  const totalDialogue = characters.reduce((sum, c) => sum + c.dialogueCount, 0);
  const supportingDialogue = supportingCast.reduce((sum, c) => sum + c.dialogueCount, 0);
  const castBalance = totalDialogue > 0 ? (supportingDialogue / totalDialogue) * 100 : 0;

  const categoryScore = reportData.categoryScores?.['Character'] 
    ? (typeof reportData.categoryScores['Character'] === 'number' 
        ? reportData.categoryScores['Character'] 
        : (reportData.categoryScores['Character'] as { score?: number })?.score || currentScore)
    : currentScore;

  // Assess each supporting character
  const assessedCast = supportingCast.map(char => {
    const dialogueShare = totalDialogue > 0 ? (char.dialogueCount / totalDialogue) * 100 : 0;
    const scenePresence = char.sceneCount / (reportData.scenes?.length || 1) * 100;
    const hasArc = char.arcSummary && char.arcSummary.length > 20;
    const hasRelationships = char.relationships && char.relationships.length > 0;
    
    // Calculate a utility score
    const utilityScore = Math.min(10, 
      (dialogueShare > 5 ? 3 : dialogueShare > 2 ? 2 : 1) +
      (scenePresence > 20 ? 3 : scenePresence > 10 ? 2 : 1) +
      (hasArc ? 2 : 0) +
      (hasRelationships ? 2 : 0)
    );

    return {
      ...char,
      dialogueShare: dialogueShare.toFixed(1),
      scenePresence: scenePresence.toFixed(0),
      utilityScore,
      hasArc,
    };
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SectionHeader
        title="Supporting Cast"
        subtitle="Analyzing ensemble effectiveness, balance, and character utility"
        icon={Users}
        score={categoryScore}
      />

      {/* Cast Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-5 text-center">
          <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{characters.length}</p>
          <p className="text-sm text-muted-foreground">Total Characters</p>
        </Card>
        <Card className="p-5 text-center">
          <Star className="h-5 w-5 mx-auto mb-2 text-chart-4" />
          <p className="text-2xl font-bold">{supportingCast.length}</p>
          <p className="text-sm text-muted-foreground">Supporting Roles</p>
        </Card>
        <Card className="p-5 text-center">
          <MessageSquare className="h-5 w-5 mx-auto mb-2 text-chart-2" />
          <p className="text-2xl font-bold">{castBalance.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Supporting Dialogue</p>
        </Card>
        <Card className="p-5 text-center">
          <Film className="h-5 w-5 mx-auto mb-2 text-chart-3" />
          <p className="text-2xl font-bold">{assessedCast.filter(c => c.hasArc).length}</p>
          <p className="text-sm text-muted-foreground">With Character Arcs</p>
        </Card>
      </div>

      {/* Cast Assessment */}
      <VerdictBox
        type={castBalance > 30 && castBalance < 50 ? 'success' : castBalance > 20 ? 'finding' : 'issue'}
        title={
          castBalance > 30 && castBalance < 50 
            ? 'Well-Balanced Ensemble' 
            : castBalance > 50 
            ? 'Supporting Cast May Overshadow Leads'
            : 'Supporting Cast Underutilized'
        }
        content={
          castBalance > 30 && castBalance < 50 
            ? 'The supporting cast has appropriate screen time and dialogue distribution, enhancing the story without overshadowing the leads.'
            : castBalance > 50 
            ? 'Supporting characters receive significant dialogue. Ensure this serves the story rather than diluting focus on the protagonist.'
            : 'Supporting characters may need more development or presence to create a richer story world.'
        }
      />

      {/* Character Table */}
      {assessedCast.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Supporting Character Analysis" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Character</th>
                  <th className="text-center py-3 px-4 font-semibold">Dialogue</th>
                  <th className="text-center py-3 px-4 font-semibold">Scenes</th>
                  <th className="text-center py-3 px-4 font-semibold">Has Arc</th>
                  <th className="text-center py-3 px-4 font-semibold">Utility</th>
                </tr>
              </thead>
              <tbody>
                {assessedCast.map((char, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{char.name}</p>
                        {char.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{char.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm">{char.dialogueCount}</span>
                      <span className="text-xs text-muted-foreground ml-1">({char.dialogueShare}%)</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm">{char.sceneCount}</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        char.hasArc ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {char.hasArc ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <ScoreBadge score={char.utilityScore} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Relationship Map Summary */}
      <Card className="p-6">
        <SubSectionHeader title="Key Relationships" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessedCast.slice(0, 6).map((char, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="font-medium mb-2">{char.name}</p>
              {char.relationships && char.relationships.length > 0 ? (
                <div className="space-y-1">
                  {char.relationships.slice(0, 2).map((rel, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      → {rel.character}: <span className="text-foreground">{rel.type}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No defined relationships</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <SubSectionHeader title="Cast Recommendations" />
        <div className="space-y-3">
          {assessedCast.filter(c => !c.hasArc).length > 3 && (
            <RecommendationCard
              title="Develop Supporting Arcs"
              description="Several supporting characters lack defined arcs. Consider giving key supporting roles their own growth trajectory."
              priority="medium"
              effort="moderate"
              impact="Richer character ensemble"
            />
          )}
          {castBalance < 25 && (
            <RecommendationCard
              title="Increase Supporting Presence"
              description="The supporting cast feels thin. Give key supporting characters more moments to shine and contribute to the story."
              priority="high"
              effort="moderate"
            />
          )}
          {characters.length > 15 && (
            <RecommendationCard
              title="Consider Cast Consolidation"
              description="Large cast may dilute focus. Consider combining similar characters or cutting those without clear purpose."
              priority="low"
              effort="easy"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
