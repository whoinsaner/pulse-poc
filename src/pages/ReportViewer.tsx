import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Report, StakeholderLens, ReportData, LENS_CONFIG } from '@/types/database';
import { LensSelector } from '@/components/LensToggle';
import { ProjectSnapshot } from '@/components/report/ProjectSnapshot';
import { StudioRecommendation } from '@/components/report/StudioRecommendation';
import { StrengthsWeaknesses } from '@/components/report/StrengthsWeaknesses';
import { ParameterScoring } from '@/components/report/ParameterScoring';
import { RiskMap } from '@/components/report/RiskMap';
import { CharactersSection } from '@/components/report/CharactersSection';
import { PlatformComparison } from '@/components/report/PlatformComparison';
import { PanelGallery } from '@/components/report/PanelGallery';
import { ArtReferenceSheet } from '@/components/report/ArtReferenceSheet';
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
          <p className="text-muted-foreground mb-4">The report you are looking for does not exist.</p>
          <Button onClick={() => navigate('/scripts')}>Back to Scripts</Button>
        </div>
      </div>
    );
  }

  const reportData = report.full_report_data as ReportData;
  const isComic = reportData.scriptMetadata?.scriptType === 'comic';

  // Define sections based on script type
  const sections = isComic ? [
    { id: 'overview', label: 'Overview' },
    { id: 'recommendation', label: 'Recommendation' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'scores', label: 'Scoring' },
    { id: 'panels', label: 'Panel Gallery' },
    { id: 'artref', label: 'Art Reference' },
    { id: 'characters', label: 'Characters' },
  ] : [
    { id: 'overview', label: 'Overview' },
    { id: 'recommendation', label: 'Recommendation' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'scores', label: 'Scoring' },
    { id: 'platform', label: 'Platform Fit' },
    { id: 'risk', label: 'Risk Map' },
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
              <LensSelector
                activeLens={activeLens}
                onLensChange={setActiveLens}
                compact
              />
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

      {/* Project Snapshot / Overview */}
      <section
        ref={(el) => (sectionsRef.current['overview'] = el)}
        className="scroll-section"
      >
        <ProjectSnapshot
          reportData={reportData}
          reportTitle={report.title}
          currentScore={getCurrentScore()}
          activeLens={activeLens}
        />
      </section>

      {/* Studio Recommendation */}
      <section
        ref={(el) => (sectionsRef.current['recommendation'] = el)}
        className="scroll-section bg-card/30"
      >
        <StudioRecommendation
          score={getCurrentScore()}
          summary={report.executive_summary || ''}
        />
      </section>

      {/* Strengths & Weaknesses */}
      <section
        ref={(el) => (sectionsRef.current['analysis'] = el)}
        className="scroll-section"
      >
        <StrengthsWeaknesses insights={reportData.insights || []} />
      </section>

      {/* Parameter Scoring */}
      <section
        ref={(el) => (sectionsRef.current['scores'] = el)}
        className="scroll-section bg-card/30"
      >
        <ParameterScoring
          categoryScores={reportData.categoryScores || {}}
          parameterScores={reportData.parameterScores}
        />
      </section>

      {/* Comic-specific sections */}
      {isComic && (
        <>
          {/* Panel Gallery */}
          <section
            ref={(el) => (sectionsRef.current['panels'] = el)}
            className="scroll-section"
          >
            <PanelGallery scenes={reportData.scenes || []} />
          </section>

          {/* Art Reference Sheet */}
          <section
            ref={(el) => (sectionsRef.current['artref'] = el)}
            className="scroll-section bg-card/30"
          >
            <ArtReferenceSheet 
              characters={reportData.characters || []} 
              scenes={reportData.scenes || []}
            />
          </section>
        </>
      )}

      {/* Screenplay-specific sections */}
      {!isComic && (
        <>
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

          {/* Risk Map & Maturity */}
          <section
            ref={(el) => (sectionsRef.current['risk'] = el)}
            className="scroll-section bg-card/30"
          >
            <RiskMap
              score={getCurrentScore()}
              categoryScores={reportData.categoryScores || {}}
            />
          </section>
        </>
      )}

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
