import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, ScriptType } from '@/types/database';
import { lazy, Suspense } from 'react';

const ComicFormatDiagnosis = lazy(() => import('./ComicFormatDiagnosis'));
const FormatDiagnosisGeneric = lazy(() => import('./FormatDiagnosis'));

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  isComic?: boolean;
  scriptType?: ScriptType;
}

/**
 * Smart format router - renders ComicFormatDiagnosis for comics,
 * FormatDiagnosis for web_series/micro_drama
 */
export default function FormatRouter() {
  const context = useOutletContext<ReportContextValue>();
  const scriptType = context?.reportData?.scriptMetadata?.scriptType || context?.scriptType;
  const isComic = scriptType === 'comic';

  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading...</div>}>
      {isComic ? <ComicFormatDiagnosis /> : <FormatDiagnosisGeneric />}
    </Suspense>
  );
}
