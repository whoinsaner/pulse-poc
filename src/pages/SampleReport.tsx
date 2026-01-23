import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { SAMPLE_REPORT, SAMPLE_REPORT_DATA } from '@/data/sampleReport';
import { StakeholderLens, Report, ReportData } from '@/types/database';
import { SampleCommandHeader } from '@/components/report/SampleCommandHeader';
import { SampleActionRail } from '@/components/report/SampleActionRail';
import { Skeleton } from '@/components/ui/skeleton';
import { createContext, useContext } from 'react';

interface ReportContextValue {
  report: Report;
  reportData: ReportData;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  isComic: boolean;
}

export const SampleReportContext = createContext<ReportContextValue | null>(null);

export function useSampleReport() {
  const context = useContext(SampleReportContext);
  if (!context) {
    throw new Error('useSampleReport must be used within SampleReportLayout');
  }
  return context;
}

export default function SampleReportLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [activeLens, setActiveLens] = useState<StakeholderLens>('studio_executive');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const reportData = SAMPLE_REPORT_DATA;
  const report = SAMPLE_REPORT;

  const getCurrentScore = () => {
    return reportData.lensScores?.[activeLens] ?? reportData.overallScore ?? 0;
  };

  if (isLoading) {
    return <SampleReportSkeleton />;
  }

  if (!user) {
    return null;
  }

  const currentPath = location.pathname.replace('/sample-report', '') || '';

  const contextValue: ReportContextValue = {
    report: report as Report,
    reportData: reportData as ReportData,
    activeLens,
    setActiveLens,
    currentScore: getCurrentScore(),
    isComic: false,
  };

  return (
    <SampleReportContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Command Header with Sample Banner */}
        <SampleCommandHeader
          reportData={reportData as ReportData}
          currentPath={currentPath}
          activeLens={activeLens}
          currentScore={getCurrentScore()}
          basePath="/sample-report"
          sampleTitle='Sample Report: "The Last Signal"'
          sampleBannerColor="primary"
          viewScriptPath="/sample-script"
        />

        {/* Main Content with Action Rail */}
        <div className="flex-1 flex">
          {/* Scrollable Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-6 lg:p-8 max-w-6xl mx-auto">
              <Outlet context={contextValue} />
            </div>
          </main>

          {/* Action Rail */}
          <SampleActionRail
            reportData={reportData as ReportData}
            activeLens={activeLens}
            setActiveLens={setActiveLens}
            currentScore={getCurrentScore()}
            reportTitle="The Signal"
          />
        </div>
      </div>
    </SampleReportContext.Provider>
  );
}

function SampleReportSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Banner skeleton */}
      <div className="h-10 border-b border-border px-4 flex items-center gap-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-7 w-24" />
      </div>
      
      {/* Header skeleton */}
      <div className="h-14 border-b border-border px-6 flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-48" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      {/* Tab bar skeleton */}
      <div className="h-12 border-b border-border px-4 flex items-center gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="flex-1 flex">
        <main className="flex-1 p-6">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
        
        {/* Rail skeleton */}
        <aside className="w-72 border-l border-border p-4 space-y-4 hidden lg:block">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </aside>
      </div>
    </div>
  );
}