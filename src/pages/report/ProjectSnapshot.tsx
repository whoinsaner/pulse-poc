import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { DecisionSignalBadge } from '@/components/report/DecisionSignalBadge';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  VerdictBox, 
  AssessmentCard, 
  StrengthWeaknessList,
  ScoreDisplay
} from '@/components/report/ui';
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Users, 
  Film, 
  TrendingUp,
  Target,
  Zap,
  Brain,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { filterVisibleCategories, filterVisibleParameters } from '@/lib/reportUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  isComic: boolean;
}

export default function ProjectSnapshot() {
  const { reportData, activeLens, setActiveLens, currentScore } = useOutletContext<ReportContextValue>();
  
  const metadata = reportData.scriptMetadata;
  
  // 0-100 scale thresholds
  const getReadinessLabel = (score: number) => {
    if (score >= 80) return { label: 'Production-Ready', sublabel: 'Ready for greenlight consideration', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 65) return { label: 'High-Potential', sublabel: 'Strong foundation, minor revisions needed', color: 'text-chart-3', bg: 'bg-chart-3/10' };
    if (score >= 50) return { label: 'Development Stage', sublabel: 'Solid concept requiring development', color: 'text-chart-4', bg: 'bg-chart-4/10' };
    if (score >= 30) return { label: 'Needs Work', sublabel: 'Fundamental issues to address', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Early Stage', sublabel: 'Significant development required', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const readiness = getReadinessLabel(currentScore);

  // Calculate stats - filter out system parameters
  const visibleParameters = filterVisibleParameters(reportData.parameterScores || []);
  const totalParameters = visibleParameters.length;
  const avgConfidence = totalParameters > 0 
    ? visibleParameters.reduce((acc, p) => acc + (p.confidence || 0), 0) / totalParameters 
    : 0;
  const totalInsights = reportData.insights?.length || 0;
  const totalCharacters = reportData.characters?.length || 0;
  const totalScenes = reportData.scenes?.length || 0;

  // Get category scores - filter out system category
  const visibleCategoryScores = filterVisibleCategories(reportData.categoryScores || {});
  const categoryAverages = Object.entries(visibleCategoryScores)
    .map(([name, value]) => {
      const score = typeof value === 'number' ? value : (value as { score?: number })?.score || 0;
      return { name, score };
    })
    .sort((a, b) => b.score - a.score);

  // Identify strengths and weaknesses from top/bottom categories (0-100 scale)
  const strengths = categoryAverages.filter(c => c.score >= 70).slice(0, 5).map(c => ({
    text: c.name,
    detail: `Score: ${Math.round(c.score)}/100`
  }));
  
  const weaknesses = categoryAverages.filter(c => c.score < 50).slice(0, 5).map(c => ({
    text: c.name,
    detail: `Score: ${Math.round(c.score)}/100`
  }));

  // Studio recommendation based on score (0-100 scale)
  const getStudioVerdict = () => {
    if (currentScore >= 80) return { verdict: 'greenlight', title: 'Recommend for Development', content: 'This script demonstrates exceptional quality across key metrics and is ready for production consideration.' };
    if (currentScore >= 65) return { verdict: 'develop', title: 'Strong Development Candidate', content: 'High potential project that warrants investment in development. Address noted areas before proceeding.' };
    if (currentScore >= 50) return { verdict: 'develop', title: 'Development with Revisions', content: 'Solid foundation with identifiable issues. Recommend a development pass before further consideration.' };
    return { verdict: 'pass', title: 'Requires Significant Development', content: 'Fundamental elements need attention. Consider substantial rewrites before proceeding.' };
  };

  const studioVerdict = getStudioVerdict();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <SectionHeader
        title="Project Snapshot"
        subtitle="Complete overview of script analysis and readiness assessment"
        icon={LayoutDashboard}
        score={currentScore}
      />

      {/* Hero Card with Title and Core Info */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-chart-6/5 p-8 lg:p-12 border border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Title and Metadata */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider',
                readiness.bg, readiness.color
              )}>
                {readiness.label}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                {metadata?.scriptType ? metadata.scriptType.charAt(0).toUpperCase() + metadata.scriptType.slice(1) : 'Feature'}
              </span>
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                {metadata?.title || 'Untitled Script'}
              </h1>
              {metadata?.logline && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {metadata.logline}
                </p>
              )}
            </div>

            {/* Quick Stats */}
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

            {/* Lens Indicator */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50 w-fit">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Viewing as</p>
                <p className="font-semibold">{LENS_CONFIG[activeLens].label}</p>
              </div>
            </div>
          </div>

          {/* Right: Score */}
          <div className="flex flex-col items-center justify-center">
            {/* Decision Signal Badge - Prominent Display */}
            <DecisionSignalBadge score={currentScore} size="lg" showDescription className="mb-6" />
            
            <div className="relative">
              <div className="absolute inset-0 scale-110 blur-3xl opacity-30">
                <ScoreRing score={currentScore} size="lg" />
              </div>
              <ScoreRing score={currentScore} size="lg" showLabel />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-5xl font-bold gradient-text">{Math.round(currentScore)}</p>
              <p className="text-lg text-muted-foreground mt-1">Overall Readiness Score</p>
              <p className={cn("text-sm mt-2", readiness.color)}>{readiness.sublabel}</p>
            </div>

            {/* Confidence */}
            <div className="mt-6 p-4 rounded-xl bg-card/50 border border-border/50 w-full max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Analysis Confidence</span>
                <span className="font-semibold">{(avgConfidence * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-chart-6"
                  style={{ width: `${avgConfidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Recommendation */}
      <VerdictBox
        type={studioVerdict.verdict === 'greenlight' ? 'success' : studioVerdict.verdict === 'develop' ? 'warning' : 'error'}
        title={studioVerdict.title}
        content={studioVerdict.content}
      />

      {/* Analysis Stats */}
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
              <p className="text-2xl font-bold">{categoryAverages.length}</p>
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

      {/* Strengths & Weaknesses */}
      <section>
        <h2 className="text-xl font-bold mb-4">What Makes This Work / Risk Factors</h2>
        <StrengthWeaknessList
          strengths={strengths.length > 0 ? strengths : [{ text: 'Analysis pending', detail: 'More data needed' }]}
          weaknesses={weaknesses.length > 0 ? weaknesses : [{ text: 'No critical issues detected', detail: 'Continue monitoring' }]}
        />
      </section>

      {/* Category Overview */}
      <section>
        <h2 className="text-xl font-bold mb-4">Analysis Categories Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categoryAverages.slice(0, 10).map((category, index) => (
            <Card key={category.name} className="p-4 bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  category.score >= 70 ? "text-success" :
                  category.score >= 50 ? "text-chart-4" :
                  "text-warning"
                )}>
                  {Math.round(category.score)}
                </span>
              </div>
              <p className="font-medium text-sm truncate">{category.name}</p>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    category.score >= 70 ? "bg-success" :
                    category.score >= 50 ? "bg-chart-4" :
                    "bg-warning"
                  )}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
