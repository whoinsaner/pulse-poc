import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface RetryQueueProps {
  className?: string;
}

interface FailedRun {
  id: string;
  script_id: string;
  script_title: string;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  created_at: string;
  quality_mode: string | null;
  stakeholder_lens: string | null;
}

export function RetryQueue({ className }: RetryQueueProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [failedRuns, setFailedRuns] = useState<FailedRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.current_organization_id) {
      fetchFailedRuns();
    }
  }, [profile?.current_organization_id]);

  const fetchFailedRuns = async () => {
    if (!profile?.current_organization_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analysis_runs')
        .select('id, script_id, error_message, retry_count, max_retries, created_at, quality_mode, stakeholder_lens, scripts!inner(title, organization_id)')
        .eq('scripts.organization_id', profile.current_organization_id)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const runs: FailedRun[] = (data || [])
        .filter((r: any) => r.retry_count < r.max_retries)
        .map((r: any) => ({
          id: r.id,
          script_id: r.script_id,
          script_title: r.scripts?.title || 'Untitled',
          error_message: r.error_message,
          retry_count: r.retry_count,
          max_retries: r.max_retries,
          created_at: r.created_at,
          quality_mode: r.quality_mode,
          stakeholder_lens: r.stakeholder_lens,
        }));

      setFailedRuns(runs);
    } catch (error) {
      console.error('Error fetching failed runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (run: FailedRun) => {
    if (!profile?.user_id) return;
    setRetrying(run.id);
    try {
      // Create a new analysis run as a retry
      const { error } = await supabase.from('analysis_runs').insert({
        script_id: run.script_id,
        initiated_by: profile.user_id,
        status: 'pending',
        parent_run_id: run.id,
        quality_mode: run.quality_mode || 'quality',
        stakeholder_lens: run.stakeholder_lens,
        retry_count: run.retry_count + 1,
        max_retries: run.max_retries,
      });

      if (error) throw error;

      toast.success('Analysis retry queued', { description: run.script_title });
      // Remove from local list
      setFailedRuns(prev => prev.filter(r => r.id !== run.id));
    } catch (error: any) {
      toast.error('Failed to retry', { description: error.message });
    } finally {
      setRetrying(null);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (failedRuns.length === 0) return null;

  return (
    <Card className={cn('border-destructive/20', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Retry Queue
          <Badge variant="destructive" className="ml-auto">
            {failedRuns.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {failedRuns.map((run) => (
            <div
              key={run.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{run.script_title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                  </span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {run.retry_count}/{run.max_retries} retries
                  </Badge>
                </div>
                {run.error_message && (
                  <p className="text-xs text-destructive mt-1 truncate">{run.error_message}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(run)}
                  disabled={retrying === run.id}
                  className="h-8 px-2"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5 mr-1', retrying === run.id && 'animate-spin')} />
                  Retry
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/scripts`)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
