import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { 
  SectionHeader, 
  ScoreDisplay, 
  VerdictBox,
  SubSectionHeader,
  StrengthWeaknessList,
  RecommendationCard,
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
  const { working, underdeveloped, broken } = useMemo(() => {
    const w = economyParams.filter(p => p.score >= 70);
    const u = economyParams.filter(p => p.score >= 40 && p.score < 70);
    const b = economyParams.filter(p => p.score < 40);
    return { working: w, underdeveloped: u, broken: b };
  }, [economyParams]);

  const strengths = working.map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 100),
  }));

  const weaknesses = [...broken, ...underdeveloped.slice(0, 3)].map(p => ({
    text: p.displayName || p.parameterName,
    detail: p.rationale?.slice(0, 100),
  }));

  // Derive top economy metrics from the top 4 relevant params
  const topMetrics = useMemo(() => {
    const sorted = [...economyParams].sort((a, b) => b.score - a.score);
    return sorted.slice(0, 4).map(p => ({
      label: p.displayName || p.parameterName,
      score: p.score,
      description: p.rationale?.split('.')[0] || '',
    }));
  }, [economyParams]);

  const getVerdictLabel = (score: number) => {
    if (score >= 70) return 'Strong Scene Economy';
    if (score >= 40) return 'Scene Economy Needs Attention';
    return 'Weak Scene Economy';
  };

  const mapEffort = (fixCost?: string): 'easy' | 'moderate' | 'difficult' => {
    if (fixCost === 'Low') return 'easy';
    if (fixCost === 'High') return 'difficult';
    return 'moderate';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
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
            <Card key={metric.label} className="glass-premium">
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
        <Card className="glass-premium border-primary/30">
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

      {/* Verdict */}
      <VerdictBox
        type={economyScore >= 70 ? 'success' : economyScore >= 40 ? 'finding' : 'issue'}
        title={getVerdictLabel(economyScore)}
        content={
          economyScore >= 70
            ? `Scene economy is strong with ${working.length} parameters performing well. The script maintains good structural efficiency across ${totalScenes} scenes.`
            : economyScore >= 40
            ? `Scene economy shows potential but ${underdeveloped.length} parameters need attention. Review pacing and structural tightness across the ${totalScenes} scenes.`
            : `Scene economy needs significant work. ${broken.length} parameters are underperforming. Focus on structural efficiency and pacing.`
        }
      />

      {/* Parameter Breakdown */}
      {economyParams.length > 0 && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Economy Parameters" />
          <div className="space-y-3">
            {economyParams.map((param) => (
              <div key={param.parameterId} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{param.displayName || param.parameterName}</p>
                  {param.rationale && (
                    <p className="text-xs text-muted-foreground mt-0.5">{param.rationale}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <div className="w-20 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        param.score >= 70 ? 'bg-success' : param.score >= 40 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${param.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono font-bold w-8 text-right">{Math.round(param.score)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strengths & Weaknesses from real data */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <StrengthWeaknessList
          strengths={strengths}
          weaknesses={weaknesses}
        />
      )}

      {/* Recommendations based on actual weak areas */}
      {(broken.length > 0 || underdeveloped.length > 0) && (
        <Card className="glass-premium p-6">
          <SubSectionHeader title="Economy Recommendations" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {broken.slice(0, 2).map((param) => (
              <RecommendationCard
                key={param.parameterId}
                title={`Fix: ${param.displayName || param.parameterName}`}
                description={param.rationale?.slice(0, 150) || 'This parameter needs immediate attention.'}
                priority="high"
                effort={mapEffort(param.fixCost)}
              />
            ))}
            {underdeveloped.slice(0, 2).map((param) => (
              <RecommendationCard
                key={param.parameterId}
                title={`Improve: ${param.displayName || param.parameterName}`}
                description={param.rationale?.slice(0, 150) || 'This parameter has room for improvement.'}
                priority="medium"
                effort={mapEffort(param.fixCost)}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
