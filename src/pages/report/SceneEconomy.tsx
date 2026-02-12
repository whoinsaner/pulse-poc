import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { 
  SectionHeader, 
  ScoreDisplay, 
  WeightedParameterList,
} from '@/components/report/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, BarChart3 } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function SceneEconomy() {
  const { reportData } = useOutletContext<ReportContextValue>();

  // Get real parameters related to pacing, structure, and scene economy
  const economyParams = useMemo(() => {
    return (reportData.parameterScores || []).filter(p => {
      const cat = p.category?.toLowerCase() || '';
      const name = (p.parameterName || p.displayName || '').toLowerCase();
      return (
        cat.includes('structure') ||
        name.includes('pacing') ||
        name.includes('economy') ||
        name.includes('efficiency') ||
        name.includes('scene') ||
        name.includes('momentum') ||
        name.includes('rhythm') ||
        name.includes('escalation')
      );
    });
  }, [reportData.parameterScores]);

  // Calculate score from real parameters
  const economyScore = useMemo(() => {
    if (economyParams.length > 0) {
      return economyParams.reduce((sum, p) => sum + p.score, 0) / economyParams.length;
    }
    const structureScore = reportData.categoryScores?.['Structure'];
    if (structureScore !== undefined) return extractScore(structureScore);
    return 0;
  }, [economyParams, reportData.categoryScores]);

  // Real scene data
  const scenes = reportData.scenes || [];
  const totalScenes = scenes.length;
  const pageCount = reportData.scriptMetadata?.pageCount || 0;
  const avgSceneLength = totalScenes > 0 ? (pageCount / totalScenes).toFixed(1) : '—';

  // Diagnostic buckets from real params
  const working = useMemo(() => {
    return economyParams.filter(p => p.score >= 70);
  }, [economyParams]);

  // Derive top economy metrics from the top 4 relevant params
  const topMetrics = useMemo(() => {
    const sorted = [...economyParams].sort((a, b) => b.score - a.score);
    return sorted.slice(0, 4).map(p => ({
      label: p.displayName || p.parameterName,
      score: p.score,
      description: p.rationale?.split('.')[0] || '',
    }));
  }, [economyParams]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Scene Economy"
        subtitle="Analyzing scene efficiency, pacing, and opportunities for tightening"
        icon={Layers}
        score={economyScore}
      />

      {/* Top Metrics from real params */}
      {topMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <ScoreDisplay score={metric.score} maxScore={100} size="md" />
                <h3 className="font-display font-semibold mt-2 text-sm">{metric.label}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scene Stats - from real data */}
      {totalScenes > 0 && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <BarChart3 className="h-5 w-5 text-primary" />
              Scene Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-4xl font-mono font-bold text-primary">{totalScenes}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Scenes</p>
              </div>
              {pageCount > 0 && (
                <div className="text-center p-5 rounded-xl bg-gradient-to-br from-chart-3/10 to-chart-3/5 border border-chart-3/20">
                  <p className="text-4xl font-mono font-bold text-chart-3">{pageCount}</p>
                  <p className="text-sm text-muted-foreground mt-1">Pages</p>
                </div>
              )}
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30">
                <p className="text-4xl font-mono font-bold text-foreground">{avgSceneLength}</p>
                <p className="text-sm text-muted-foreground mt-1">Avg Pages/Scene</p>
              </div>
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                <p className="text-4xl font-mono font-bold text-success">{working.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Strong Params</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={economyParams.map(p => ({
          parameterName: p.parameterName || p.displayName || '',
          displayName: p.displayName || p.parameterName || '',
          score: p.score,
          rationale: p.rationale,
          weight: 1.0,
        }))}
        title="Economy Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />
    </div>
  );
}