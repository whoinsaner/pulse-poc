import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SectionHeader, 
  WeightedParameterList,
} from '@/components/report/ui';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { Smartphone, AlertTriangle } from 'lucide-react';
import { MICRO_DRAMA_FAILURE_PATTERNS } from '@/lib/parameterDefinitions';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
}

export default function MicroDramaAnalysis() {
  const context = useOutletContext<ReportContextValue>();
  const { reportData } = context;

  // Filter parameters for Micro Drama category
  const microDramaParameters = useMemo(() => {
    const params = reportData.parameterScores || [];
    return params
      .filter(p => p.category === 'Micro Drama')
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        weight: 1.0,
      }));
  }, [reportData.parameterScores]);

  // Calculate average score
  const sectionScore = useMemo(() => {
    if (microDramaParameters.length === 0) return 0;
    const total = microDramaParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / microDramaParameters.length);
  }, [microDramaParameters]);

  // Helper to get score for failure pattern detection
  const getParamScore = (paramName: string): number => {
    const paramScore = reportData.parameterScores?.find(p => 
      p.parameterId === paramName || p.parameterName === paramName
    );
    const rawScore = paramScore?.score || 0;
    return rawScore > 10 ? rawScore : rawScore * 10;
  };

  // Detect failure patterns
  const detectedFailures = useMemo(() => {
    return (MICRO_DRAMA_FAILURE_PATTERNS || []).filter(pattern => {
      const score = getParamScore(pattern.triggerParam);
      return score < pattern.threshold;
    });
  }, [reportData.parameterScores]);

  // Get agent narrative content
  const agentContent = reportData.agentContent?.['MicroDramaFormatAgent'];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Micro Drama Deep Dive"
        subtitle="Hook velocity, cliff density, and scroll-stop optimization for 30-180 second vertical content"
        icon={Smartphone}
        score={sectionScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel
          agentName="MicroDramaFormatAgent"
          content={agentContent}
        />
      )}

      {/* Vertical-First Format Context */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Vertical-First, Mobile-Native</h3>
            <p className="text-muted-foreground mb-3">
              Optimized for TikTok, Instagram Reels, YouTube Shorts, and vertical platforms. 
              Every frame must justify its existence. No horizontal thinking allowed.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {microDramaParameters.length} Specialized Parameters
              </Badge>
              <Badge variant="outline" className="text-xs">
                Average Score: {sectionScore}/100
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Failure Pattern Warnings */}
      {detectedFailures.length > 0 && (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Critical Failure Patterns</h3>
              <div className="space-y-3">
                {detectedFailures.map((failure, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                    <div>
                      <p className="font-medium">{failure.name}</p>
                      <p className="text-sm text-muted-foreground">{failure.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={microDramaParameters}
        title="Micro Drama Parameter Breakdown"
        initiallyExpanded={true}
        showAllByDefault
      />
    </div>
  );
}
