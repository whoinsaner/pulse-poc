import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, EpisodeLengthClass } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { SectionHeader, WeightedParameterList } from '@/components/report/ui';
import { EPISODE_LENGTH_WEIGHT_MODIFIERS, WEB_SERIES_FAILURE_PATTERNS, WEB_SERIES_PARAMETERS } from '@/lib/parameterDefinitions';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  isWebSeries: boolean;
  episodeLengthClass?: EpisodeLengthClass;
}

const EPISODE_LENGTH_LABELS: Record<EpisodeLengthClass, { label: string; description: string }> = {
  short_form_web: { label: 'Short-Form', description: '<10 minutes' },
  mid_form_web: { label: 'Mid-Form', description: '10-30 minutes' },
  long_form_web: { label: 'Long-Form', description: '45-70+ minutes' },
};

export default function WebSeriesAnalysis() {
  const context = useOutletContext<ReportContextValue>();
  const { reportData, episodeLengthClass = 'mid_form_web' } = context;

  const lengthInfo = EPISODE_LENGTH_LABELS[episodeLengthClass];

  // Filter parameters by Web Series category
  const webSeriesParams = reportData.parameterScores?.filter(p =>
    p.category === 'Web Series' ||
    p.category?.toLowerCase().includes('web series')
  ) || [];

  const avgScore = webSeriesParams.length > 0
    ? webSeriesParams.reduce((sum, p) => sum + p.score, 0) / webSeriesParams.length
    : 0;

  // Agent content
  const agentContent = reportData.agentContent?.WebSeriesAgent;

  // Weight modifiers for current episode length
  const weightModifiers = EPISODE_LENGTH_WEIGHT_MODIFIERS[episodeLengthClass] || {};

  // Detect failure patterns
  const getParamScore = (paramName: string): number => {
    const paramScore = reportData.parameterScores?.find(p => p.parameterId === paramName);
    const rawScore = paramScore?.score || 0;
    return rawScore > 10 ? rawScore / 10 : rawScore;
  };

  const detectedFailures = WEB_SERIES_FAILURE_PATTERNS.filter(pattern => {
    const score = getParamScore(pattern.triggerParam);
    return score < pattern.threshold;
  });

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Web Series Deep Dive"
        subtitle={`Digital-first series evaluation — ${lengthInfo.label} (${lengthInfo.description})`}
        icon={Tv}
        score={avgScore}
      />

      {/* Agent Narrative */}
      {agentContent && (
        <AgentNarrativePanel agentName="WebSeriesAgent" content={agentContent} />
      )}

      {/* Episode Length Context */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Episode Length Class: {lengthInfo.label}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {episodeLengthClass === 'short_form_web' &&
                'Optimized for hook efficiency, shareability, and retention. Every second counts.'}
              {episodeLengthClass === 'mid_form_web' &&
                'Balanced evaluation across all core parameters. Standard digital series format.'}
              {episodeLengthClass === 'long_form_web' &&
                'Character stickiness, serial momentum, and mid-episode re-hooking gain importance.'}
            </p>
            {Object.keys(weightModifiers).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(weightModifiers).map(([param, modifier]) => {
                  const paramDef = WEB_SERIES_PARAMETERS.find(p => p.name === param);
                  return (
                    <Badge key={param} variant="outline" className="text-xs">
                      {paramDef?.displayName}: {modifier > 1 ? '+' : ''}{Math.round((modifier - 1) * 100)}%
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Failure Pattern Warnings */}
      {detectedFailures.length > 0 && (
        <Card className="p-6 border-warning/50">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-warning">Detected Failure Patterns</h3>
              <div className="space-y-3">
                {detectedFailures.map((failure, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
                    <div>
                      <p className="font-medium text-sm">{failure.name}</p>
                      <p className="text-sm text-muted-foreground">{failure.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={webSeriesParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Web Series Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={13}
      />
    </div>
  );
}
