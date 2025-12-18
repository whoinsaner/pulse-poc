import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, Report } from '@/types/database';
import { PlatformComparison } from '@/components/report/PlatformComparison';
import { RiskMap } from '@/components/report/RiskMap';
import { Card } from '@/components/ui/card';
import { Tv, Film, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  report: Report;
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  isComic: boolean;
}

export default function ReportPlatform() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  const lensScores = reportData.lensScores as Record<StakeholderLens, number> | undefined;
  const ottScore = lensScores?.ott_platform ?? 0;
  const theatricalScore = lensScores?.theatrical ?? 0;

  const getRecommendation = () => {
    if (ottScore > theatricalScore + 0.5) {
      return { 
        platform: 'OTT/Streaming', 
        icon: Tv, 
        color: 'text-chart-2',
        bg: 'bg-chart-2/10',
        reason: 'Higher engagement potential for streaming audiences' 
      };
    } else if (theatricalScore > ottScore + 0.5) {
      return { 
        platform: 'Theatrical', 
        icon: Film, 
        color: 'text-chart-6',
        bg: 'bg-chart-6/10',
        reason: 'Strong cinematic qualities for theatrical release' 
      };
    }
    return { 
      platform: 'Hybrid Release', 
      icon: TrendingUp, 
      color: 'text-chart-3',
      bg: 'bg-chart-3/10',
      reason: 'Suitable for both theatrical and streaming platforms' 
    };
  };

  const recommendation = getRecommendation();
  const RecommendIcon = recommendation.icon;

  // Risk assessment based on scores
  const getRiskLevel = (score: number) => {
    if (score >= 7) return { level: 'Low', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 5) return { level: 'Medium', color: 'text-warning', bg: 'bg-warning/10' };
    return { level: 'High', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const overallRisk = getRiskLevel(currentScore);

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <span className="px-4 py-1.5 rounded-full bg-chart-6/10 text-chart-6 text-sm font-medium">
          Distribution Strategy
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Platform Fit & Risk Assessment
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Optimal release strategy and production risk evaluation
        </p>
      </div>

      {/* Recommendation Card */}
      <Card className="p-8 bg-gradient-to-br from-card via-card to-primary/5">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className={cn("p-6 rounded-2xl", recommendation.bg)}>
            <RecommendIcon className={cn("h-16 w-16", recommendation.color)} />
          </div>
          <div className="text-center lg:text-left flex-1">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Recommended Platform
            </p>
            <h3 className="text-3xl font-bold mb-2">{recommendation.platform}</h3>
            <p className="text-muted-foreground">{recommendation.reason}</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tv className="h-4 w-4 text-chart-2" />
                <span className="text-sm text-muted-foreground">OTT</span>
              </div>
              <p className="text-2xl font-bold">{ottScore.toFixed(1)}</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Film className="h-4 w-4 text-chart-6" />
                <span className="text-sm text-muted-foreground">Theatrical</span>
              </div>
              <p className="text-2xl font-bold">{theatricalScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Comparison */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Platform Analysis</h3>
          <p className="text-muted-foreground">
            Detailed comparison between OTT and Theatrical release potential
          </p>
        </div>
        <PlatformComparison lensScores={lensScores || {} as Record<StakeholderLens, number>} />
      </section>

      {/* Risk Overview */}
      <section className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("p-2 rounded-lg", overallRisk.bg)}>
              <AlertTriangle className={cn("h-5 w-5", overallRisk.color)} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Risk</p>
              <p className={cn("font-bold", overallRisk.color)}>{overallRisk.level}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on current readiness score of {currentScore.toFixed(1)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Potential</p>
              <p className="font-bold">
                {currentScore >= 7 ? 'High' : currentScore >= 5 ? 'Moderate' : 'Developing'}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Commercial viability assessment
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Production Ready</p>
              <p className="font-bold">
                {currentScore >= 8 ? 'Yes' : currentScore >= 6 ? 'With Revisions' : 'Needs Development'}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Current development stage assessment
          </p>
        </Card>
      </section>

      {/* Risk Map */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Risk & Maturity Map</h3>
          <p className="text-muted-foreground">
            Visual assessment across all production dimensions
          </p>
        </div>
        <RiskMap score={currentScore * 10} categoryScores={reportData.categoryScores || {}} />
      </section>
    </div>
  );
}
