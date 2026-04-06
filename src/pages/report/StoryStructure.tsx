import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  WeightedParameterList,
} from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { Building, AlertTriangle, Anchor } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

const STRUCTURE_CATEGORIES = ['Structure'];

const TYPE_ICONS: Record<string, string> = {
  character: '👤',
  symbol: '🔷',
  line: '💬',
  event: '⚡',
  image: '🖼️',
};

export default function StoryStructure() {
  const context = useOutletContext<ReportContextValue>();

  const structureParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => STRUCTURE_CATEGORIES.includes(p.category))
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        weight: 1.0,
      }));
  }, [context?.reportData?.parameterScores]);

  const sectionScore = useMemo(() => {
    if (structureParameters.length === 0) return 0;
    const total = structureParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / structureParameters.length);
  }, [structureParameters]);

  const agentContent = context?.reportData?.agentContent?.StructureAgent;
  const loadBearingElements: Array<{ element: string; type: 'character' | 'symbol' | 'line' | 'event' | 'image'; removalImpact: string }> = useMemo(
    () => agentContent?.loadBearingElements || [],
    [agentContent]
  );
  const misinterpretationRisks: string[] = agentContent?.misinterpretationRisks || [];

  // Group load-bearing elements by type
  const groupedElements = useMemo(() => {
    const groups: Record<string, typeof loadBearingElements> = {};
    for (const el of loadBearingElements) {
      if (!groups[el.type]) groups[el.type] = [];
      groups[el.type].push(el);
    }
    return groups;
  }, [loadBearingElements]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Structure"
        subtitle="Act breaks, pacing, scene necessity, and narrative architecture"
        icon={Building}
        score={sectionScore}
      />

      {reportData.agentContent?.StructureAgent && (
        <AgentNarrativePanel agentName="StructureAgent" content={reportData.agentContent.StructureAgent} />
      )}

      {/* Misinterpretation Risks */}
      {misinterpretationRisks.length > 0 && (
        <Card className="p-5 flex items-start gap-4 border-warning/20 bg-warning/5">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="font-display font-semibold text-sm mb-2">Analyst Guidance — Misinterpretation Risks</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {misinterpretationRisks.map((risk, i) => (
                <li key={i}>• {risk}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Load-Bearing Elements */}
      {loadBearingElements.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Anchor className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Load-Bearing Elements</h3>
            <span className="text-xs text-muted-foreground ml-1">Elements without which the story collapses</span>
          </div>
          <div className="space-y-4">
            {Object.entries(groupedElements).map(([type, elements]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{TYPE_ICONS[type] || '•'}</span>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{type}s</span>
                </div>
                <div className="space-y-2 ml-6">
                  {elements.map((el, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-sm font-medium">{el.element}</p>
                      <p className="text-xs text-muted-foreground mt-1">If removed: {el.removalImpact}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <WeightedParameterList
        parameters={structureParameters}
        title="Structure Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={6}
      />
    </div>
  );
}
