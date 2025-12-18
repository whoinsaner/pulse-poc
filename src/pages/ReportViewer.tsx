import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Report, StakeholderLens, ReportData, LENS_CONFIG } from '@/types/database';
import { LensSelector } from '@/components/LensToggle';
import { ReportHero } from '@/components/report/ReportHero';
import { AgentAnalysisGrid } from '@/components/report/AgentAnalysisGrid';
import { FullParameterSection } from '@/components/report/FullParameterSection';
import { FullInsightsSection } from '@/components/report/FullInsightsSection';
import { FullLensComparison } from '@/components/report/FullLensComparison';
import { FullCharactersSection } from '@/components/report/FullCharactersSection';
import { NarrativeTimeline } from '@/components/report/NarrativeTimeline';
import { SceneHeatmap } from '@/components/report/SceneHeatmap';
import { CharacterNetwork } from '@/components/report/CharacterNetwork';
import { DialogueAnalysis } from '@/components/report/DialogueAnalysis';
import { PacingAnalysis } from '@/components/report/PacingAnalysis';
import { RiskMap } from '@/components/report/RiskMap';
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

  const sections = isComic ? [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'AI Agents' },
    { id: 'lenses', label: 'Stakeholders' },
    { id: 'narrative', label: 'Narrative' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'pacing', label: 'Pacing' },
    { id: 'insights', label: 'Insights' },
    { id: 'parameters', label: 'Parameters' },
    { id: 'panels', label: 'Panels' },
    { id: 'dialogue', label: 'Dialogue' },
    { id: 'network', label: 'Network' },
    { id: 'characters', label: 'Characters' },
  ] : [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'AI Agents' },
    { id: 'lenses', label: 'Stakeholders' },
    { id: 'narrative', label: 'Narrative' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'pacing', label: 'Pacing' },
    { id: 'insights', label: 'Insights' },
    { id: 'parameters', label: 'Parameters' },
    { id: 'platform', label: 'Platform' },
    { id: 'risk', label: 'Risk' },
    { id: 'dialogue', label: 'Dialogue' },
    { id: 'network', label: 'Network' },
    { id: 'characters', label: 'Characters' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border">
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
              <LensSelector activeLens={activeLens} onLensChange={setActiveLens} compact />
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <ExportDialog reportId={report.id} reportTitle={report.title} />
            </div>
          </div>
          
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

      {/* Add padding for fixed nav */}
      <div className="pt-24" />

      {/* Hero Section */}
      <section ref={(el) => (sectionsRef.current['overview'] = el)} className="scroll-section">
        <ReportHero
          reportData={reportData}
          reportTitle={report.title}
          currentScore={getCurrentScore()}
          activeLens={activeLens}
        />
      </section>

      {/* Agent Analysis Grid */}
      <section ref={(el) => (sectionsRef.current['agents'] = el)} className="scroll-section">
        <AgentAnalysisGrid
          parameterScores={reportData.parameterScores || []}
          categoryScores={reportData.categoryScores || {}}
          scriptType={reportData.scriptMetadata?.scriptType}
        />
      </section>

      {/* Lens Comparison */}
      {reportData.lensScores && (
        <section ref={(el) => (sectionsRef.current['lenses'] = el)} className="scroll-section">
          <FullLensComparison
            lensScores={reportData.lensScores}
            overallScore={reportData.overallScore || report.overall_score || 0}
            activeLens={activeLens}
            onLensSelect={setActiveLens}
          />
        </section>
      )}

      {/* Narrative Timeline */}
      <section ref={(el) => (sectionsRef.current['narrative'] = el)} className="scroll-section">
        <NarrativeTimeline 
          scenes={reportData.scenes || []} 
          narrativeGraph={reportData.narrativeGraph}
          totalPages={reportData.scriptMetadata?.pageCount}
        />
      </section>

      {/* Scene Heatmap */}
      <section ref={(el) => (sectionsRef.current['heatmap'] = el)} className="scroll-section">
        <SceneHeatmap scenes={reportData.scenes || []} />
      </section>

      {/* Pacing Analysis */}
      <section ref={(el) => (sectionsRef.current['pacing'] = el)} className="scroll-section">
        <PacingAnalysis scenes={reportData.scenes || []} totalPages={reportData.scriptMetadata?.pageCount} />
      </section>

      {/* Insights */}
      <section ref={(el) => (sectionsRef.current['insights'] = el)} className="scroll-section">
        <FullInsightsSection insights={reportData.insights || []} />
      </section>

      {/* Parameters */}
      <section ref={(el) => (sectionsRef.current['parameters'] = el)} className="scroll-section">
        <FullParameterSection
          categoryScores={reportData.categoryScores || {}}
          parameterScores={reportData.parameterScores || []}
        />
      </section>

      {/* Comic-specific sections */}
      {isComic && (
        <section ref={(el) => (sectionsRef.current['panels'] = el)} className="scroll-section">
          <PanelGallery scenes={reportData.scenes || []} />
        </section>
      )}

      {/* Screenplay-specific sections */}
      {!isComic && (
        <>
          {reportData.lensScores && (
            <section ref={(el) => (sectionsRef.current['platform'] = el)} className="scroll-section py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                  <span className="px-4 py-1.5 rounded-full bg-chart-6/10 text-chart-6 text-sm font-medium">
                    Distribution
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">Platform Fit</h2>
                  <p className="text-xl text-muted-foreground">OTT vs Theatrical release analysis</p>
                </div>
                <PlatformComparison lensScores={reportData.lensScores} />
              </div>
            </section>
          )}

          <section ref={(el) => (sectionsRef.current['risk'] = el)} className="scroll-section bg-card/30">
            <div className="py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                <span className="px-4 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-medium">
                  Assessment
                </span>
                <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">Risk & Maturity</h2>
                <p className="text-xl text-muted-foreground">Production readiness evaluation</p>
              </div>
              <RiskMap score={getCurrentScore() * 10} categoryScores={reportData.categoryScores || {}} />
            </div>
          </section>
        </>
      )}

      {/* Dialogue Analysis */}
      <section ref={(el) => (sectionsRef.current['dialogue'] = el)} className="scroll-section">
        <DialogueAnalysis characters={reportData.characters || []} />
      </section>

      {/* Character Network */}
      <section ref={(el) => (sectionsRef.current['network'] = el)} className="scroll-section">
        <CharacterNetwork characters={reportData.characters || []} />
      </section>

      {/* Characters */}
      <section ref={(el) => (sectionsRef.current['characters'] = el)} className="scroll-section">
        <FullCharactersSection characters={reportData.characters || []} />
      </section>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center gap-4 mb-12">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-20 w-32" />
              <Skeleton className="h-20 w-32" />
              <Skeleton className="h-20 w-32" />
            </div>
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-64 w-64 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
