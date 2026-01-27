import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StakeholderLens, LENS_CONFIG } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CachedStakeholderReport {
  id: string;
  stakeholder_lens: string;
  stakeholder_score: number | null;
  executive_summary: string | null;
  generated_at: string;
  is_stale: boolean | null;
  // Adapted content fields
  adapted_insights?: any[] | null;
  adapted_recommendations?: any[] | null;
  vocabulary_version?: string | null;
}

interface StakeholderReportCacheProps {
  reportId: string;
  onSelectLens?: (lens: StakeholderLens) => void;
}

export function StakeholderReportCache({ reportId, onSelectLens }: StakeholderReportCacheProps) {
  const [cachedReports, setCachedReports] = useState<CachedStakeholderReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchCachedReports();
  }, [reportId]);

  const fetchCachedReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stakeholder_reports')
      .select('*')
      .eq('report_id', reportId)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error fetching cached reports:', error);
    } else {
      // Cast the data to handle Json types
      setCachedReports((data || []).map(r => ({
        ...r,
        adapted_insights: r.adapted_insights as any[] | null,
        adapted_recommendations: r.adapted_recommendations as any[] | null,
      })) as CachedStakeholderReport[]);
    }
    setLoading(false);
  };

  const handleRegenerate = async (lens: string) => {
    setRegenerating(lens);
    try {
      // Mark as stale and trigger regeneration
      await supabase
        .from('stakeholder_reports')
        .update({ is_stale: true })
        .eq('report_id', reportId)
        .eq('stakeholder_lens', lens);

      toast.success('Regeneration queued', {
        description: `${LENS_CONFIG[lens as StakeholderLens]?.label || lens} report will be updated.`
      });
      
      fetchCachedReports();
    } catch (error) {
      toast.error('Failed to queue regeneration');
    } finally {
      setRegenerating(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (cachedReports.length === 0) {
    return (
      <Card className="border-border/50 bg-muted/20">
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h4 className="font-medium mb-1">No Cached Reports</h4>
          <p className="text-sm text-muted-foreground">
            Stakeholder-specific reports will appear here after generation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Cached Stakeholder Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cachedReports.map((report) => {
          const lensConfig = LENS_CONFIG[report.stakeholder_lens as StakeholderLens];
          const isStale = report.is_stale;
          const isRegenerating = regenerating === report.stakeholder_lens;
          const hasAdaptedContent = (report.adapted_insights?.length || 0) > 0 || (report.adapted_recommendations?.length || 0) > 0;

          return (
            <div
              key={report.id}
              className={cn(
                'p-4 rounded-xl border transition-all cursor-pointer',
                'hover:border-primary/50 hover:bg-primary/5',
                isStale && 'border-warning/30 bg-warning/5'
              )}
              onClick={() => onSelectLens?.(report.stakeholder_lens as StakeholderLens)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {lensConfig?.label || report.stakeholder_lens}
                    </span>
                    {isStale ? (
                      <Badge variant="outline" className="text-warning border-warning/30 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Stale
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-success border-success/30 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                    {hasAdaptedContent && (
                      <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                        AI Adapted
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(report.generated_at)}
                    </span>
                    {report.stakeholder_score !== null && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Score: {report.stakeholder_score.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {report.executive_summary && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {report.executive_summary}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerate(report.stakeholder_lens);
                  }}
                  disabled={isRegenerating}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4",
                    isRegenerating && "animate-spin"
                  )} />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
