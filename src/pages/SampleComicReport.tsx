import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { SAMPLE_COMIC_REPORT, SAMPLE_COMIC_REPORT_DATA } from '@/data/sampleComicReport';
import { StakeholderLens, Report, ReportData } from '@/types/database';
import { SampleCommandHeader } from '@/components/report/SampleCommandHeader';
import { SampleReportSidebar } from '@/components/report/SampleReportSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { createContext, useContext } from 'react';

interface ReportContextValue {
  report: Report;
  reportData: ReportData;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  isComic: boolean;
  scriptType: import('@/types/database').ScriptType;
}

export const SampleComicReportContext = createContext<ReportContextValue | null>(null);

export function useSampleComicReport() {
  const context = useContext(SampleComicReportContext);
  if (!context) {
    throw new Error('useSampleComicReport must be used within SampleComicReportLayout');
  }
  return context;
}

export default function SampleComicReportLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [activeLens, setActiveLens] = useState<StakeholderLens>('director');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const reportData = SAMPLE_COMIC_REPORT_DATA;
  const report = SAMPLE_COMIC_REPORT;
  const scriptType = reportData.scriptMetadata?.scriptType || 'comic';

  const getCurrentScore = () => {
    return reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  };

  if (isLoading) {
    return <SampleReportSkeleton />;
  }

  if (!user) {
    return null;
  }

  const currentPath = location.pathname.replace('/sample-comic-report', '') || '';

  const contextValue: ReportContextValue = {
    report: report as Report,
    reportData: reportData as ReportData,
    activeLens,
    setActiveLens,
    currentScore: getCurrentScore(),
    isComic: true,
    scriptType,
  };

  return (
    <SampleComicReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background flex flex-col">
        <SampleCommandHeader
          reportData={reportData as ReportData}
          currentPath={currentPath}
          activeLens={activeLens}
          currentScore={getCurrentScore()}
          basePath="/sample-comic-report"
          sampleTitle='Sample Comic: "Neon Ronin"'
          sampleBannerColor="chart-5"
          viewScriptPath="/sample-comic-script"
        />

        <div className="flex-1 flex">
          <SampleReportSidebar
            reportData={reportData as ReportData}
            currentPath={currentPath}
            basePath="/sample-comic-report"
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(prev => !prev)}
            activeLens={activeLens}
            currentScore={getCurrentScore()}
          />

          <main ref={mainRef} className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8 max-w-6xl mx-auto">
              <Outlet context={contextValue} />
            </div>
          </main>
        </div>
      </div>
    </SampleComicReportContext.Provider>
  );
}

function SampleReportSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-10 border-b border-border px-4 flex items-center gap-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-7 w-24" />
      </div>
      <div className="h-14 border-b border-border px-6 flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-48" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex-1 flex">
        <aside className="w-64 border-r border-border p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </aside>
        <main className="flex-1 p-6">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
      </div>
    </div>
  );
}
