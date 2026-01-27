import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { SAMPLE_MICRO_DRAMA_REPORT, SAMPLE_MICRO_DRAMA_REPORT_DATA } from '@/data/sampleMicroDramaReport';
import { StakeholderLens, Report, ReportData } from '@/types/database';
import { SampleCommandHeader } from '@/components/report/SampleCommandHeader';
import { SampleActionRail } from '@/components/report/SampleActionRail';
import { Skeleton } from '@/components/ui/skeleton';
import { createContext, useContext } from 'react';

// Context for report data
export interface SampleMicroDramaReportContextValue {
  reportData: ReportData;
  report: Report;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
}

const SampleMicroDramaReportContext = createContext<SampleMicroDramaReportContextValue | null>(null);

export function useSampleMicroDramaReport() {
  const context = useContext(SampleMicroDramaReportContext);
  if (!context) {
    throw new Error('useSampleMicroDramaReport must be used within SampleMicroDramaReport');
  }
  return context;
}

export default function SampleMicroDramaReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [activeLens, setActiveLens] = useState<StakeholderLens>('ott_platform');
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(true);

  // Simulate loading for realistic demo experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSimulatedLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const currentPath = location.pathname;
  const currentScore = SAMPLE_MICRO_DRAMA_REPORT_DATA.lensScores?.[activeLens] ?? 
    SAMPLE_MICRO_DRAMA_REPORT_DATA.overallScore;

  const contextValue: SampleMicroDramaReportContextValue = {
    reportData: SAMPLE_MICRO_DRAMA_REPORT_DATA,
    report: SAMPLE_MICRO_DRAMA_REPORT,
    activeLens,
    setActiveLens,
    currentScore,
  };

  if (isLoading || isSimulatedLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SampleMicroDramaReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background">
        {/* Command Header */}
        <SampleCommandHeader
          reportData={SAMPLE_MICRO_DRAMA_REPORT_DATA}
          currentPath={currentPath}
          activeLens={activeLens}
          currentScore={currentScore}
          basePath="/sample-micro-drama-report"
          sampleTitle="Micro Drama Sample"
          sampleBannerColor="chart-5"
          viewScriptPath="/sample-micro-drama-script"
        />

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Main Report Content */}
            <main className="min-w-0">
              <Outlet context={contextValue} />
            </main>

            {/* Action Rail */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SampleActionRail
                  reportData={SAMPLE_MICRO_DRAMA_REPORT_DATA}
                  activeLens={activeLens}
                  setActiveLens={setActiveLens}
                  currentScore={currentScore}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </SampleMicroDramaReportContext.Provider>
  );
}
