import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Sparkles,
  Zap,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import type { AnalysisStatus, StakeholderLens, LENS_CONFIG } from '@/types/database';

interface AnalysisRun {
  id: string;
  status: AnalysisStatus;
  quality_mode: string | null;
  stakeholder_lens: StakeholderLens | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  report?: {
    id: string;
    overall_score: number | null;
  };
}

interface AnalysisRunHistoryProps {
  scriptId: string;
  scriptTitle: string;
}

export function AnalysisRunHistory({ scriptId, scriptTitle }: AnalysisRunHistoryProps) {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuns();
  }, [scriptId]);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analysis_runs')
        .select(`
          id,
          status,
          quality_mode,
          stakeholder_lens,
          created_at,
          started_at,
          completed_at,
          error_message,
          reports (
            id,
            overall_score
          )
        `)
        .eq('script_id', scriptId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRuns = (data || []).map(run => ({
        ...run,
        report: Array.isArray(run.reports) && run.reports.length > 0 ? run.reports[0] : undefined,
      }));

      setRuns(formattedRuns as AnalysisRun[]);
    } catch (error) {
      console.error('Error fetching analysis runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Processing</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getQualityModeIcon = (mode: string | null) => {
    switch (mode) {
      case 'quality':
        return <Sparkles className="h-3 w-3" />;
      case 'fast':
        return <Zap className="h-3 w-3" />;
      default:
        return <BarChart3 className="h-3 w-3" />;
    }
  };

  const getDuration = (run: AnalysisRun) => {
    if (run.started_at && run.completed_at) {
      const start = new Date(run.started_at).getTime();
      const end = new Date(run.completed_at).getTime();
      const seconds = Math.round((end - start) / 1000);
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.round(seconds / 60);
      return `${minutes}m`;
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Analysis History
        </CardTitle>
        <CardDescription>
          {runs.length} analysis run{runs.length !== 1 ? 's' : ''} for "{scriptTitle}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        {runs.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No analysis runs yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Run an analysis to see history here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {runs.map((run, index) => (
                <div
                  key={run.id}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    index === 0 && run.status === 'completed'
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(run.status)}
                        {getStatusBadge(run.status)}
                        {run.quality_mode && (
                          <Badge variant="outline" className="text-xs gap-1">
                            {getQualityModeIcon(run.quality_mode)}
                            {run.quality_mode}
                          </Badge>
                        )}
                        {run.stakeholder_lens && (
                          <Badge variant="secondary" className="text-xs">
                            {run.stakeholder_lens.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                        </span>
                        {getDuration(run) && (
                          <span>Duration: {getDuration(run)}</span>
                        )}
                        {run.report?.overall_score && (
                          <span className="text-primary font-medium">
                            Score: {run.report.overall_score.toFixed(1)}
                          </span>
                        )}
                      </div>

                      {run.error_message && (
                        <p className="text-xs text-destructive mt-2 truncate">
                          Error: {run.error_message}
                        </p>
                      )}
                    </div>

                    {run.status === 'completed' && run.report && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/report/${run.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}