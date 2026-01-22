import { ScoreRing } from '@/components/ScoreRing';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { FileText, Clock, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportHeroProps {
  reportData: ReportData;
  reportTitle: string;
  currentScore: number;
  activeLens: StakeholderLens;
}

export function ReportHero({ reportData, reportTitle, currentScore, activeLens }: ReportHeroProps) {
  const metadata = reportData.scriptMetadata;
  
  // 0-100 scale thresholds
  const getReadinessLabel = (score: number) => {
    if (score >= 80) return { label: 'Production-Ready', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 65) return { label: 'High-Potential', color: 'text-chart-3', bg: 'bg-chart-3/10' };
    if (score >= 50) return { label: 'Development Stage', color: 'text-chart-4', bg: 'bg-chart-4/10' };
    if (score >= 30) return { label: 'Needs Work', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Early Stage', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const readiness = getReadinessLabel(currentScore);

  // Calculate quick stats
  const totalParameters = reportData.parameterScores?.length || 0;
  const avgConfidence = reportData.parameterScores?.reduce((acc, p) => acc + (p.confidence || 0), 0) / totalParameters || 0;
  const totalInsights = reportData.insights?.length || 0;

  return (
    <section className="min-h-[90vh] relative flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-6/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-6/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Title and Metadata */}
          <div className="space-y-8 animate-fade-up">
            {/* Type badge */}
            <div className="flex items-center gap-3">
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                readiness.bg, readiness.color
              )}>
                {readiness.label}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                {metadata?.scriptType ? metadata.scriptType.charAt(0).toUpperCase() + metadata.scriptType.slice(1) : 'Feature Film'}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
                {metadata?.title || reportTitle}
              </h1>
              {metadata?.logline && (
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  {metadata.logline}
                </p>
              )}
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap gap-6">
              {metadata?.genre && (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Genre</p>
                    <p className="font-semibold">{metadata.genre}</p>
                  </div>
                </div>
              )}
              {metadata?.pageCount && (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <FileText className="h-4 w-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pages</p>
                    <p className="font-semibold">{metadata.pageCount}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-card border border-border">
                  <Target className="h-4 w-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Parameters</p>
                  <p className="font-semibold">{totalParameters}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-card border border-border">
                  <Zap className="h-4 w-4 text-chart-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Insights</p>
                  <p className="font-semibold">{totalInsights}</p>
                </div>
              </div>
            </div>

            {/* Lens indicator */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Viewing as</p>
                <p className="font-semibold">{LENS_CONFIG[activeLens].label}</p>
              </div>
            </div>
          </div>

          {/* Right: Score visualization */}
          <div className="flex flex-col items-center justify-center animate-fade-up animation-delay-200">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 scale-110 blur-3xl opacity-30">
                <ScoreRing score={currentScore} size="lg" />
              </div>
              <ScoreRing score={currentScore} size="lg" showLabel />
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-6xl font-bold gradient-text">{Math.round(currentScore)}</p>
              <p className="text-xl text-muted-foreground mt-2">Overall Readiness Score</p>
            </div>

            {/* Confidence indicator */}
            <div className="mt-8 p-4 rounded-xl bg-card/50 border border-border/50 w-full max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Analysis Confidence</span>
                <span className="font-semibold">{(avgConfidence * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-chart-6 transition-all duration-1000"
                  style={{ width: `${avgConfidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </div>
    </section>
  );
}
