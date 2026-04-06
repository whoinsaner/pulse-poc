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
  ScoreBadge,
  ScoreDisplay,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { Users, MessageSquare, Film, Star, Target, Scale, Layers, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractScore } from '@/lib/scoreUtils';
import { getSupportingCast as getSupportingCastFromRoles } from '@/lib/characterRoles';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens?: StakeholderLens | null;
}

const SUPPORTING_KEYWORDS = ['supporting', 'ensemble', 'cast', 'character'];

export default function SupportingCast() {
  const context = useOutletContext<ReportContextValue>();
  const { reportData, currentScore, stakeholderLens } = context;
  
  const characters = reportData.characters || [];
  const supportingCast = getSupportingCastFromRoles(characters, reportData.agentContent).slice(0, 10);

  const totalDialogue = characters.reduce((sum, c) => sum + c.dialogueCount, 0);
  const supportingDialogue = supportingCast.reduce((sum, c) => sum + c.dialogueCount, 0);
  const castBalance = totalDialogue > 0 ? (supportingDialogue / totalDialogue) * 100 : 0;

  const categoryScore = extractScore(reportData.categoryScores?.['Character']) || currentScore;

  // Filter supporting-cast-relevant parameters
  const supportingParams = useMemo(() => {
    const params = reportData.parameterScores || [];
    return params
      .filter(p => 
        p.category?.toLowerCase().includes('character') ||
        SUPPORTING_KEYWORDS.some(k => 
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

  const sectionScore = useMemo(() => {
    if (supportingParams.length === 0) return categoryScore;
    return Math.round(supportingParams.reduce((sum, p) => sum + p.score, 0) / supportingParams.length);
  }, [supportingParams, categoryScore]);

  const assessedCast = supportingCast.map(char => {
    const dialogueShare = totalDialogue > 0 ? (char.dialogueCount / totalDialogue) * 100 : 0;
    const hasArc = char.arcSummary && char.arcSummary.length > 20;
    const hasRelationships = char.relationships && char.relationships.length > 0;
    
    const utilityScore = Math.min(100, 
      (dialogueShare > 5 ? 30 : dialogueShare > 2 ? 20 : 10) +
      ((char.sceneCount / (reportData.scenes?.length || 1) * 100) > 20 ? 30 : 20) +
      (hasArc ? 20 : 0) +
      (hasRelationships ? 20 : 0)
    );

    return {
      ...char,
      dialogueShare: dialogueShare.toFixed(1),
      utilityScore,
      hasArc,
    };
  });

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
    diversity: getParamScore(['diversity', 'distinct', 'voice', 'variety']),
    utility: getParamScore(['function', 'utility', 'purpose', 'role']),
    balance: getParamScore(['balance', 'ensemble', 'distribution']),
    depth: getParamScore(['depth', 'dimension', 'develop', 'arc']),
  };
  const avgDimension = Math.round((dimensionScores.diversity + dimensionScores.utility + dimensionScores.balance + dimensionScores.depth) / 4);

  const basePath = window.location.pathname.split('/characters')[0];

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Supporting Cast"
        subtitle="Analyzing ensemble effectiveness, balance, and character utility"
        icon={Users}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* Diagnosis Summary — 3-column grid */}
      <DiagnosisSummary
        parameters={supportingParams}
        categoryName="Supporting Cast"
        developmentLink={`${basePath}/development`}
        stakeholderLens={stakeholderLens}
      />

      {/* Dimension Tiles */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-5 text-center">
          <Users className="h-5 w-5 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground mb-1">Diversity</p>
          <ScoreDisplay score={dimensionScores.diversity} size="sm" showLabel={false} />
        </Card>
        <Card className="p-5 text-center">
          <Target className="h-5 w-5 mx-auto mb-2 text-chart-6" />
          <p className="text-sm text-muted-foreground mb-1">Utility</p>
          <ScoreDisplay score={dimensionScores.utility} size="sm" showLabel={false} />
        </Card>
        <Card className="p-5 text-center">
          <Scale className="h-5 w-5 mx-auto mb-2 text-chart-4" />
          <p className="text-sm text-muted-foreground mb-1">Balance</p>
          <ScoreDisplay score={dimensionScores.balance} size="sm" showLabel={false} />
        </Card>
        <Card className="p-5 text-center">
          <Layers className="h-5 w-5 mx-auto mb-2 text-chart-2" />
          <p className="text-sm text-muted-foreground mb-1">Depth</p>
          <ScoreDisplay score={dimensionScores.depth} size="sm" showLabel={false} />
        </Card>
        <Card className="p-5 text-center bg-primary/5 border-primary/20">
          <Shield className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground mb-1">Overall</p>
          <ScoreDisplay score={avgDimension} size="sm" />
        </Card>
      </div>

      {/* Cast Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-5 text-center">
          <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-mono font-bold">{characters.length}</p>
          <p className="text-sm text-muted-foreground">Total Characters</p>
        </Card>
        <Card className="p-5 text-center">
          <Star className="h-5 w-5 mx-auto mb-2 text-chart-4" />
          <p className="text-2xl font-mono font-bold">{supportingCast.length}</p>
          <p className="text-sm text-muted-foreground">Supporting Roles</p>
        </Card>
        <Card className="p-5 text-center">
          <MessageSquare className="h-5 w-5 mx-auto mb-2 text-chart-2" />
          <p className="text-2xl font-mono font-bold">{castBalance.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Supporting Dialogue</p>
        </Card>
        <Card className="p-5 text-center">
          <Film className="h-5 w-5 mx-auto mb-2 text-chart-3" />
          <p className="text-2xl font-mono font-bold">{assessedCast.filter(c => c.hasArc).length}</p>
          <p className="text-sm text-muted-foreground">With Character Arcs</p>
        </Card>
      </div>

      {/* Character Table */}
      {assessedCast.length > 0 && (
        <Card className="p-6">
          <SubSectionHeader title="Supporting Character Analysis" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-display font-semibold">Character</th>
                  <th className="text-center py-3 px-4 font-display font-semibold">Dialogue</th>
                  <th className="text-center py-3 px-4 font-display font-semibold">Scenes</th>
                  <th className="text-center py-3 px-4 font-display font-semibold">Has Arc</th>
                  <th className="text-center py-3 px-4 font-display font-semibold">Utility</th>
                </tr>
              </thead>
              <tbody>
                {assessedCast.map((char, index) => (
                  <tr key={index} className="border-b border-border/30 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{char.name}</p>
                        {char.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{char.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm font-mono">{char.dialogueCount}</span>
                      <span className="text-xs text-muted-foreground ml-1">({char.dialogueShare}%)</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm font-mono">{char.sceneCount}</span>
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

      {/* Relationship Map */}
      {assessedCast.some(c => c.relationships && c.relationships.length > 0) && (
        <Card className="p-6">
          <SubSectionHeader title="Key Relationships" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assessedCast.slice(0, 6).map((char, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="font-display font-medium mb-2">{char.name}</p>
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
      )}

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={supportingParams}
        title="Supporting Cast Parameter Breakdown"
        initiallyExpanded={false}
        defaultVisibleCount={6}
      />

      {/* Development Focus */}
      {(() => {
        const items = supportingParams
          .filter(p => p.score < 70)
          .sort((a, b) => a.score - b.score)
          .map(p => ({ title: p.displayName, description: p.rationale || '' }));
        return items.length > 0 ? (
          <DevelopmentFocus
            sectionName="Supporting Cast"
            items={items}
            developmentPath={`${basePath}/development`}
            stakeholderLens={stakeholderLens}
            relatedSections={[
              { label: 'Character Diagnosis', path: `${basePath}/characters` },
              { label: 'Protagonist', path: `${basePath}/characters/protagonist` },
            ]}
          />
        ) : null;
      })()}
    </div>
  );
}
