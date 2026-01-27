import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LensSelector } from '@/components/LensToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaturityBadge } from '@/components/report/ui/MaturityBadge';
import { CompactDiagnosis } from '@/components/report/ui/DiagnosisSummary';
import { getDecisionSignal, getMaturityStage } from '@/lib/scoreUtils';
import { 
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { downloadSampleReportPDF } from '@/lib/sampleReportPdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface WebSeriesActionRailProps {
  reportData: ReportData;
  activeLens: StakeholderLens;
  setActiveLens: (lens: StakeholderLens) => void;
  currentScore: number;
  reportTitle?: string;
}

export function WebSeriesActionRail({
  reportData,
  activeLens,
  setActiveLens,
  currentScore,
  reportTitle = 'Sample Report',
}: WebSeriesActionRailProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  const decision = getDecisionSignal(currentScore);
  const maturity = getMaturityStage(currentScore);

  // Calculate diagnostics
  const diagnostics = useMemo(() => {
    const params = reportData.parameterScores || [];
    return {
      working: params.filter(p => p.score >= 70).length,
      underdeveloped: params.filter(p => p.score >= 40 && p.score < 70).length,
      broken: params.filter(p => p.score < 40).length,
    };
  }, [reportData.parameterScores]);

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-card hidden lg:flex flex-col h-[calc(100vh-8.5rem)] sticky top-[8.5rem]">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Hero Score with Decision Signal */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <ScoreRing 
                score={currentScore} 
                size="lg" 
                label="Readiness"
                showBenchmark
                benchmarkScore={7}
              />
            </div>
            
            <div>
              <Badge 
                variant="outline" 
                className={cn("font-bold text-sm", decision.bgColor, decision.borderColor, decision.color)}
              >
                {decision.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                {LENS_CONFIG[activeLens].label} Perspective
              </p>
            </div>
          </div>

          {/* Maturity Status */}
          <div className="bg-muted/50 rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Maturity Status
            </h3>
            <MaturityBadge score={currentScore} size="sm" />
          </div>

          {/* Diagnostic Summary */}
          <div className="bg-muted/50 rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Diagnosis Overview
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Working</span>
                </div>
                <span className="font-mono font-semibold text-sm">{diagnostics.working}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-chart-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Underdeveloped</span>
                </div>
                <span className="font-mono font-semibold text-sm">{diagnostics.underdeveloped}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Needs Fix</span>
                </div>
                <span className="font-mono font-semibold text-sm">{diagnostics.broken}</span>
              </div>
            </div>
          </div>

          {/* Stakeholder Lens Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Viewing As
            </h3>
            <LensSelector 
              activeLens={activeLens} 
              onLensChange={setActiveLens} 
              compact 
            />
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border bg-card">
        <Button 
          variant="outline" 
          className="w-full" 
          disabled={isExporting}
          onClick={() => {
            setIsExporting(true);
            try {
              downloadSampleReportPDF(reportData, reportTitle, activeLens);
              toast({
                title: 'Report Downloaded',
                description: 'Your USAF analysis report has been saved.',
              });
            } catch (error) {
              toast({
                title: 'Export Failed',
                description: 'Could not generate PDF.',
                variant: 'destructive',
              });
            } finally {
              setIsExporting(false);
            }
          }}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Generating...' : 'Export PDF'}
        </Button>
      </div>
    </aside>
  );
}
