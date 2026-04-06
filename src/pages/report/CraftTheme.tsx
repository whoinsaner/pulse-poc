import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, AlertTriangle, RefreshCw, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function CraftTheme() {
  const context = useOutletContext<ReportContextValue>();

  const themeParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p =>
        p.parameterName.includes('theme') ||
        p.parameterName.includes('moral') ||
        p.parameterName.includes('message') ||
        p.parameterName.includes('resonance')
      )
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
    if (themeParameters.length === 0) return 0;
    return Math.round(themeParameters.reduce((sum, p) => sum + p.score, 0) / themeParameters.length);
  }, [themeParameters]);

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const agentContent = context.reportData.agentContent?.ThemeAgent;
  const motifLifecycle: Array<{ motif: string; introduction: string; transformation: string; payoff: string }> = agentContent?.motifLifecycle || [];
  const narrativeQuestions: Array<{ question: string; answerLocation: string; answered: boolean }> = agentContent?.narrativeQuestions || [];
  const misinterpretationRisks: string[] = agentContent?.misinterpretationRisks || [];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Theme & Meaning"
        subtitle="Thematic depth, moral complexity, and message clarity"
        icon={Heart}
        score={sectionScore}
      />

      {context.reportData.agentContent?.ThemeAgent && (
        <AgentNarrativePanel agentName="ThemeAgent" content={context.reportData.agentContent.ThemeAgent} />
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

      {/* Motif Lifecycle Tracking */}
      {motifLifecycle.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Motif Lifecycle</h3>
          </div>
          <div className="space-y-4">
            {motifLifecycle.map((m, i) => (
              <div key={i} className="border border-border/50 rounded-lg p-4">
                <p className="font-display font-medium text-sm mb-3">{m.motif}</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Introduction</p>
                    <p className="text-sm">{m.introduction}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Transformation</p>
                    <p className="text-sm">{m.transformation}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Payoff</p>
                    <p className="text-sm">{m.payoff}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Narrative Questions */}
      {narrativeQuestions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-4 w-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Narrative Questions</h3>
          </div>
          <div className="space-y-2">
            {narrativeQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                {q.answered ? (
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{q.answerLocation}</p>
                </div>
                <Badge variant={q.answered ? 'success' : 'destructive'} className="shrink-0">
                  {q.answered ? 'Answered' : 'Unanswered'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <WeightedParameterList
        parameters={themeParameters}
        title="Theme Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={10}
      />
    </div>
  );
}
