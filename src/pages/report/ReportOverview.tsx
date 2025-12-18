import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { FullLensComparison } from '@/components/report/FullLensComparison';
import { Card } from '@/components/ui/card';
import { FileText, Sparkles, Target, Zap, TrendingUp, Users, Film, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  isComic: boolean;
}

export default function ReportOverview() {
  const { reportData, activeLens, setActiveLens, currentScore } = useOutletContext<ReportContextValue>();
  
  const metadata = reportData.scriptMetadata;
  
  const getReadinessLabel = (score: number) => {
    if (score >= 8) return { label: 'Production-Ready', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 6.5) return { label: 'High-Potential', color: 'text-chart-3', bg: 'bg-chart-3/10' };
    if (score >= 5) return { label: 'Development Stage', color: 'text-chart-4', bg: 'bg-chart-4/10' };
    if (score >= 3.5) return { label: 'Needs Work', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Early Stage', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const readiness = getReadinessLabel(currentScore);

  // Calculate quick stats
  const totalParameters = reportData.parameterScores?.length || 0;
  const avgConfidence = reportData.parameterScores?.reduce((acc, p) => acc + (p.confidence || 0), 0) / totalParameters || 0;
  const totalInsights = reportData.insights?.length || 0;
  const totalCharacters = reportData.characters?.length || 0;
  const totalScenes = reportData.scenes?.length || 0;

  // Calculate category averages
  const categoryAverages = Object.entries(reportData.categoryScores || {})
    .map(([name, score]) => ({ name, score: score as number }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-chart-6/5 p-8 lg:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Title and Metadata */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-3 flex-wrap">
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
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                {metadata?.title || 'Untitled Script'}
              </h1>
              {metadata?.logline && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {metadata.logline}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {metadata?.genre && (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-card border border-border">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Genre</p>
                    <p className="font-semibold text-sm">{metadata.genre}</p>
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
                    <p className="font-semibold text-sm">{metadata.pageCount}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-card border border-border">
                  <Film className="h-4 w-4 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Scenes</p>
                  <p className="font-semibold text-sm">{totalScenes}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-card border border-border">
                  <Users className="h-4 w-4 text-chart-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Characters</p>
                  <p className="font-semibold text-sm">{totalCharacters}</p>
                </div>
              </div>
            </div>

            {/* Lens indicator */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur w-fit">
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
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-110 blur-3xl opacity-30">
                <ScoreRing score={currentScore} size="lg" />
              </div>
              <ScoreRing score={currentScore} size="lg" showLabel />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-5xl font-bold gradient-text">{currentScore.toFixed(1)}</p>
              <p className="text-lg text-muted-foreground mt-1">Overall Readiness Score</p>
            </div>

            {/* Confidence indicator */}
            <div className="mt-6 p-4 rounded-xl bg-card/50 border border-border/50 w-full max-w-xs">
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
      </section>

      {/* Quick Stats Cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-card/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalParameters}</p>
              <p className="text-sm text-muted-foreground">Parameters Analyzed</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-chart-2/10">
              <Zap className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalInsights}</p>
              <p className="text-sm text-muted-foreground">Key Insights</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-chart-3/10">
              <Brain className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(reportData.categoryScores || {}).length}</p>
              <p className="text-sm text-muted-foreground">Analysis Categories</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card/50 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-chart-4/10">
              <TrendingUp className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(reportData.lensScores || {}).length}</p>
              <p className="text-sm text-muted-foreground">Stakeholder Views</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Category Scores Overview */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Analysis Categories</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categoryAverages.slice(0, 10).map((category, index) => (
            <Card key={category.name} className="p-4 bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  category.score >= 7 ? "text-success" :
                  category.score >= 5 ? "text-chart-4" :
                  "text-warning"
                )}>
                  {category.score.toFixed(1)}
                </span>
              </div>
              <p className="font-medium text-sm truncate">{category.name}</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    category.score >= 7 ? "bg-success" :
                    category.score >= 5 ? "bg-chart-4" :
                    "bg-warning"
                  )}
                  style={{ width: `${category.score * 10}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Lens Comparison */}
      {reportData.lensScores && (
        <section>
          <FullLensComparison
            lensScores={reportData.lensScores}
            overallScore={reportData.overallScore || 0}
            activeLens={activeLens}
            onLensSelect={setActiveLens}
          />
        </section>
      )}
    </div>
  );
}
