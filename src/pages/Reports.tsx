import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportData, LENS_CONFIG, StakeholderLens } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreRing } from '@/components/ScoreRing';
import { CategoryRadarChart } from '@/components/charts/CategoryRadarChart';
import { ArrowLeft, FileText, Calendar, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReportWithScript extends Report {
  scripts?: {
    title: string;
    genre: string | null;
    script_type: string;
  };
}

export default function Reports() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<ReportWithScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLens, setSelectedLens] = useState<StakeholderLens>('studio_executive');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportWithScript | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchReports() {
      if (!profile?.current_organization_id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          scripts (
            title,
            genre,
            script_type
          )
        `)
        .eq('organization_id', profile.current_organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        setLoading(false);
        return;
      }

      setReports(data as unknown as ReportWithScript[]);
      setLoading(false);
    }

    fetchReports();
  }, [profile?.current_organization_id]);

  const handleDeleteClick = (e: React.MouseEvent, report: ReportWithScript) => {
    e.stopPropagation();
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportToDelete.id);

    if (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    } else {
      setReports(reports.filter(r => r.id !== reportToDelete.id));
      toast.success('Report deleted successfully');
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  if (authLoading) {
    return <ReportsListSkeleton />;
  }

  if (!profile?.current_organization_id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Organization Selected</h2>
          <p className="text-muted-foreground mb-4">Please complete onboarding first.</p>
          <Button onClick={() => navigate('/onboarding')}>Go to Onboarding</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Analysis Reports</h1>
                <p className="text-sm text-muted-foreground">
                  {reports.length} report{reports.length !== 1 ? 's' : ''} completed
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/upload')}>
              Upload New Script
            </Button>
          </div>
        </div>
      </header>

      {/* Lens Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(LENS_CONFIG).map(([lens, config]) => (
            <button
              key={lens}
              onClick={() => setSelectedLens(lens as StakeholderLens)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                selectedLens === lens
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <ReportsListSkeleton />
        ) : reports.length === 0 ? (
          <Card className="bg-card/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Upload and analyze scripts to see your reports here.
              </p>
              <Button onClick={() => navigate('/upload')}>Upload Script</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reports.map((report, index) => {
              const reportData = report.full_report_data as ReportData;
              const lensScore = reportData?.lensScores?.[selectedLens] ?? report.overall_score ?? 0;
              
              return (
                <Card
                  key={report.id}
                  className={cn(
                    'overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer animate-fade-up',
                    'group'
                  )}
                  style={{ animationDelay: `${index * 75}ms` }}
                  onClick={() => navigate(`/reports/${report.analysis_run_id}`)}
                >
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Score and metadata */}
                    <CardHeader className="lg:col-span-1 flex flex-row items-start gap-4 pb-0 lg:pb-6">
                      <ScoreRing
                        score={lensScore}
                        size="lg"
                        showLabel
                        label={LENS_CONFIG[selectedLens].label}
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1 truncate group-hover:text-primary transition-colors">
                          {report.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {report.scripts?.genre && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                              {report.scripts.genre}
                            </span>
                          )}
                          {report.scripts?.script_type && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs capitalize">
                              {report.scripts.script_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {/* Middle: Radar Chart */}
                    <CardContent className="lg:col-span-1 pt-4 lg:pt-6">
                      {reportData?.categoryScores && Object.keys(reportData.categoryScores).length > 0 && (
                        <CategoryRadarChart
                          categoryScores={reportData.categoryScores}
                          compact
                        />
                      )}
                    </CardContent>

                    {/* Right: Quick stats and action */}
                    <CardContent className="lg:col-span-1 pt-0 lg:pt-6 flex flex-col justify-between">
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(reportData?.lensScores || {}).slice(0, 4).map(([lens, score]) => (
                          <div
                            key={lens}
                            className={cn(
                              'p-2 rounded-lg text-center',
                              lens === selectedLens ? 'bg-primary/10' : 'bg-muted/50'
                            )}
                          >
                            <p className="text-xs text-muted-foreground truncate">
                              {LENS_CONFIG[lens as StakeholderLens]?.label}
                            </p>
                            <p className="text-lg font-bold">{Math.round(score as number)}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteClick(e, report)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reportToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReportsListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="grid lg:grid-cols-3 gap-6 p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-40 rounded-lg" />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-14" />
                  ))}
                </div>
                <Skeleton className="h-10" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
