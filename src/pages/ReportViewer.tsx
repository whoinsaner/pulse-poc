import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Report, StakeholderLens, ReportData, LENS_CONFIG } from '@/types/database';
import { LensSelector } from '@/components/LensToggle';
import { ScoreRing } from '@/components/ScoreRing';
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary';
import { CategoryScoreSection } from '@/components/report/CategoryScoreSection';
import { InsightsSection } from '@/components/report/InsightsSection';
import { CharactersSection } from '@/components/report/CharactersSection';
import { PlatformComparison } from '@/components/report/PlatformComparison';
import { ExportDialog } from '@/components/report/ExportDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReportViewer() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLens, setActiveLens] = useState<StakeholderLens>('studio_executive');
  const [activeSection, setActiveSection] = useState<string>('overview');
  
  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchReport() {
      if (!runId || !profile?.current_organization_id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('analysis_run_id', runId)
        .eq('organization_id', profile.current_organization_id)
        .single();

      if (error) {
        console.error('Error fetching report:', error);
        setLoading(false);
        return;
      }

      setReport(data as unknown as Report);
      setLoading(false);
    }

    fetchReport();
  }, [runId, profile?.current_organization_id]);

  // Scroll spy for active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const [sectionId, element] of Object.entries(sectionsRef.current)) {
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    sectionsRef.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getCurrentScore = () => {
    if (!report?.full_report_data) return report?.overall_score || 0;
    const data = report.full_report_data as ReportData;
    return data.lensScores?.[activeLens] ?? data.overallScore ?? 0;
  };

  if (authLoading || loading) {
    return <ReportSkeleton />;
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <p className="text-muted-foreground mb-4">The report you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/scripts')}>Back to Scripts</Button>
        </div>
      </div>
    );
  }

  const reportData = report.full_report_data as ReportData;

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'summary', label: 'Executive Summary' },
    { id: 'scores', label: 'Score Breakdown' },
    { id: 'platform', label: 'Platform Fit' },
    { id: 'insights', label: 'Key Insights' },
    { id: 'characters', label: 'Characters' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/scripts')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold truncate max-w-[200px] sm:max-w-none">
                  {report.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {LENS_CONFIG[activeLens].label} View
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <ExportDialog reportId={report.id} reportTitle={report.title} />
            </div>
          </div>
          
          {/* Section tabs */}
          <div className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={(el) => (sectionsRef.current['overview'] = el)}
        className="scroll-section relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Score and metadata */}
            <div className="flex flex-col items-center lg:items-start animate-fade-up">
              <ScoreRing
                score={getCurrentScore()}
                size="xl"
                showLabel
                label={LENS_CONFIG[activeLens].label}
              />
              <div className="mt-6 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-balance">
                  {reportData.scriptMetadata?.title || report.title}
                </h2>
                {reportData.scriptMetadata?.logline && (
                  <p className="mt-3 text-lg text-muted-foreground max-w-xl">
                    {reportData.scriptMetadata.logline}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3 justify-center lg:justify-start">
                  {reportData.scriptMetadata?.genre && (
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                      {reportData.scriptMetadata.genre}
                    </span>
                  )}
                  {reportData.scriptMetadata?.scriptType && (
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm capitalize">
                      {reportData.scriptMetadata.scriptType}
                    </span>
                  )}
                  {reportData.scriptMetadata?.pageCount && (
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                      {reportData.scriptMetadata.pageCount} pages
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Lens selector */}
            <div className="animate-fade-up animation-delay-200">
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                  View as Stakeholder
                </h3>
                <LensSelector
                  activeLens={activeLens}
                  onLensChange={setActiveLens}
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {Object.entries(reportData.lensScores || {}).slice(0, 4).map(([lens, score]) => (
                    <button
                      key={lens}
                      onClick={() => setActiveLens(lens as StakeholderLens)}
                      className={cn(
                        'p-3 rounded-lg text-left transition-all',
                        activeLens === lens
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-muted/50 hover:bg-muted border border-transparent'
                      )}
                    >
                      <p className="text-xs text-muted-foreground">
                        {LENS_CONFIG[lens as StakeholderLens]?.label}
                      </p>
                      <p className="text-lg font-bold">{Math.round(score as number)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Summary */}
      <section
        ref={(el) => (sectionsRef.current['summary'] = el)}
        className="scroll-section"
      >
        <ExecutiveSummary
          summary={report.executive_summary || ''}
          scriptMetadata={reportData.scriptMetadata}
        />
      </section>

      {/* Score Breakdown */}
      <section
        ref={(el) => (sectionsRef.current['scores'] = el)}
        className="scroll-section"
      >
        <CategoryScoreSection
          categoryScores={reportData.categoryScores || {}}
          parameterScores={reportData.parameterScores || []}
          activeLens={activeLens}
        />
      </section>

      {/* Platform Fit Analysis */}
      {reportData.lensScores && (
        <section
          ref={(el) => (sectionsRef.current['platform'] = el)}
          className="scroll-section"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <PlatformComparison lensScores={reportData.lensScores} />
          </div>
        </section>
      )}

      {/* Key Insights */}
      <section
        ref={(el) => (sectionsRef.current['insights'] = el)}
        className="scroll-section"
      >
        <InsightsSection insights={reportData.insights || []} />
      </section>

      {/* Characters */}
      <section
        ref={(el) => (sectionsRef.current['characters'] = el)}
        className="scroll-section"
      >
        <CharactersSection characters={reportData.characters || []} />
      </section>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="flex flex-col items-center">
            <Skeleton className="h-48 w-48 rounded-full" />
            <Skeleton className="h-8 w-64 mt-6" />
            <Skeleton className="h-4 w-96 mt-3" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
