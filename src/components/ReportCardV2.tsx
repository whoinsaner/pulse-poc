import { Calendar, Eye, Trash2, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScoreRing } from '@/components/ScoreRing';
import { DecisionSignalBadge } from '@/components/report/DecisionSignalBadge';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { StakeholderBadge } from '@/components/StakeholderBadge';
import { 
  getDecisionSignalBorderClass, 
  getDiagnosticCounts,
  getTopStrength,
  getReadinessLabel,
  getSortedDiagnostics,
} from '@/lib/scoreUtils';
import { cn } from '@/lib/utils';
import { StakeholderLens, ReportData } from '@/types/database';

interface ReportCardV2Props {
  report: {
    id: string;
    title: string;
    created_at: string;
    overall_score: number | null;
    full_report_data: unknown;
    analysis_run_id: string;
    scripts?: {
      title: string;
      genre: string | null;
      script_type: string;
    };
    analysis_runs?: {
      stakeholder_lens: string | null;
    };
  };
  index: number;
  viewMode: 'grid' | 'list';
  selectedLens: StakeholderLens | null;
  onDelete: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export function ReportCardV2({ 
  report, 
  index, 
  viewMode, 
  selectedLens, 
  onDelete, 
  onClick 
}: ReportCardV2Props) {
  const reportData = report.full_report_data as ReportData;
  const reportStakeholder = report.analysis_runs?.stakeholder_lens as StakeholderLens | null;
  
  // Get the score based on selected lens or overall
  const getDisplayScore = () => {
    if (selectedLens) {
      return reportData?.lensScores?.[selectedLens] ?? report.overall_score ?? 0;
    }
    return report.overall_score ?? reportData?.overallScore ?? 0;
  };

  const score = getDisplayScore();
  const categoryScores = reportData?.categoryScores || {};
  const diagnosticCounts = getDiagnosticCounts(categoryScores);
  const topStrength = getTopStrength(categoryScores);
  const readiness = getReadinessLabel(score);
  const sortedDiagnostics = getSortedDiagnostics(categoryScores);

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer group',
          'animate-fade-up',
          getDecisionSignalBorderClass(score)
        )}
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Decision Signal + Score */}
          <div className="flex items-center gap-3">
            <DecisionSignalBadge score={score} size="sm" />
            <ScoreRing score={score} size="sm" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {report.scripts?.title || report.title}
              </h3>
              <StakeholderBadge lens={reportStakeholder} size="sm" showIcon={false} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className={cn('font-medium', readiness.color)}>{readiness.label}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(report.created_at).toLocaleDateString()}
              </span>
              {diagnosticCounts.total > 0 && (
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {diagnosticCounts.working}
                  </span>
                  <span className="flex items-center gap-1 text-warning">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {diagnosticCounts.needsWork}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card
          className={cn(
            'overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer group card-hover',
            'animate-fade-up',
            getDecisionSignalBorderClass(score)
          )}
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={onClick}
        >
          <CardHeader className="pb-3">
            {/* Top Row: Decision Signal + Maturity */}
            <div className="flex items-center justify-between mb-3">
              <DecisionSignalBadge score={score} size="sm" />
              <InlineMaturity score={score} />
            </div>

            {/* Title & Genre */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base mb-1 truncate group-hover:text-primary transition-colors">
                {report.scripts?.title || report.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {report.scripts?.genre && (
                  <span className="text-xs text-muted-foreground">{report.scripts.genre}</span>
                )}
                {report.scripts?.genre && report.scripts?.script_type && (
                  <span className="text-xs text-muted-foreground">•</span>
                )}
                {report.scripts?.script_type && (
                  <span className="text-xs text-muted-foreground capitalize">{report.scripts.script_type}</span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {/* Score + Readiness */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <ScoreRing score={score} size="md" />
              <div className="flex-1">
                <p className={cn('font-semibold', readiness.color)}>{readiness.label}</p>
                <p className="text-xs text-muted-foreground">{readiness.sublabel}</p>
              </div>
            </div>

            {/* Diagnostic Summary */}
            {diagnosticCounts.total > 0 && (
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-success/5 border border-success/20">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-success">{diagnosticCounts.working}</p>
                    <p className="text-[10px] text-muted-foreground">Working</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/20">
                  <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-warning">{diagnosticCounts.needsWork}</p>
                    <p className="text-[10px] text-muted-foreground">Need Work</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Strength Preview */}
            {topStrength && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-success shrink-0" />
                <span className="truncate">
                  <span className="font-medium text-foreground">Top:</span> {topStrength.category}
                </span>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(report.created_at).toLocaleDateString()}
              </span>
              <StakeholderBadge lens={reportStakeholder} size="sm" showIcon={false} />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Report
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>

      {/* Hover Preview */}
      <HoverCardContent className="w-80 p-4" side="right" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Quick Preview</h4>
            <span className={cn('text-xs font-medium', readiness.color)}>{readiness.label}</span>
          </div>

          {/* Top Strengths */}
          {sortedDiagnostics.strengths.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-success flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                What's Working
              </p>
              <div className="space-y-1">
                {sortedDiagnostics.strengths.slice(0, 3).map((item) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[200px]">{item.category}</span>
                    <span className="font-medium text-success">{Math.round(item.score)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas Needing Development */}
          {sortedDiagnostics.needsDevelopment.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-warning flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Needs Development
              </p>
              <div className="space-y-1">
                {sortedDiagnostics.needsDevelopment.slice(0, 3).map((item) => (
                  <div key={item.category} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate max-w-[200px]">{item.category}</span>
                    <span className="font-medium text-warning">{Math.round(item.score)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center pt-2 border-t border-border">
            Click to view full report
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
