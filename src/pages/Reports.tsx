import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportData, LENS_CONFIG, StakeholderLens, AnalysisStatus, AgentProgress } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreRing } from '@/components/ScoreRing';
import { CategoryRadarChart } from '@/components/charts/CategoryRadarChart';
import { InProgressAnalysis } from '@/components/report/InProgressAnalysis';
import { StakeholderBadge } from '@/components/StakeholderBadge';
import { StakeholderQuickSelect } from '@/components/StakeholderSelector';
import { 
  ArrowLeft, FileText, Calendar, Eye, Trash2, Loader2, 
  Filter, LayoutGrid, List, Search, TrendingUp, Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportWithScript extends Report {
  scripts?: {
    title: string;
    genre: string | null;
    script_type: string;
  };
  analysis_runs?: {
    stakeholder_lens: string | null;
  };
}

interface AnalysisRun {
  id: string;
  script_id: string;
  status: AnalysisStatus;
  stakeholder_lens: string | null;
  agent_progress: Record<string, AgentProgress> | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  scripts?: {
    title: string;
    genre: string | null;
    script_type: string;
  };
}

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | StakeholderLens;

export default function Reports() {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<ReportWithScript[]>([]);
  const [inProgressAnalyses, setInProgressAnalyses] = useState<AnalysisRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLens, setSelectedLens] = useState<StakeholderLens | null>(null);
  const [filterStakeholder, setFilterStakeholder] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportWithScript | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    if (!profile?.current_organization_id) return;

    setLoading(true);
    
    // Fetch completed reports with analysis_runs to get stakeholder_lens
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select(`
        *,
        scripts (
          title,
          genre,
          script_type
        ),
        analysis_runs (
          stakeholder_lens
        )
      `)
      .eq('organization_id', profile.current_organization_id)
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
    } else {
      setReports(reportsData as unknown as ReportWithScript[]);
    }
    
    // Fetch in-progress/failed analyses (not completed)
    const { data: analysesData, error: analysesError } = await supabase
      .from('analysis_runs')
      .select(`
        *,
        scripts!inner (
          title,
          genre,
          script_type,
          organization_id
        )
      `)
      .eq('scripts.organization_id', profile.current_organization_id)
      .in('status', ['pending', 'processing', 'failed'])
      .order('created_at', { ascending: false });

    if (analysesError) {
      console.error('Error fetching analyses:', analysesError);
    } else {
      setInProgressAnalyses(analysesData as unknown as AnalysisRun[]);
    }

    setLoading(false);
  }, [profile?.current_organization_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Subscribe to realtime updates for in-progress analyses
  useEffect(() => {
    if (!profile?.current_organization_id || inProgressAnalyses.length === 0) return;
    
    const analysisIds = inProgressAnalyses.map(a => a.id);
    
    const channel = supabase
      .channel('analysis-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_runs',
        },
        (payload) => {
          const updated = payload.new as AnalysisRun;
          if (analysisIds.includes(updated.id)) {
            if (updated.status === 'completed') {
              // Refresh to get the new report
              fetchData();
            } else {
              // Update in place
              setInProgressAnalyses(prev => 
                prev.map(a => a.id === updated.id ? { ...a, ...updated } : a)
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.current_organization_id, inProgressAnalyses, fetchData]);

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

  // Filter reports based on search and stakeholder filter
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === '' || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.scripts?.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const reportStakeholder = report.analysis_runs?.stakeholder_lens as StakeholderLens | null;
    const matchesFilter = filterStakeholder === 'all' || reportStakeholder === filterStakeholder;
    
    return matchesSearch && matchesFilter;
  });

  // Group reports by stakeholder
  const reportsByStakeholder = filteredReports.reduce((acc, report) => {
    const stakeholder = report.analysis_runs?.stakeholder_lens || 'all';
    if (!acc[stakeholder]) acc[stakeholder] = [];
    acc[stakeholder].push(report);
    return acc;
  }, {} as Record<string, ReportWithScript[]>);

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
                  {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                  {inProgressAnalyses.length > 0 && ` • ${inProgressAnalyses.length} in progress`}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/upload')}>
              Upload New Script
            </Button>
          </div>
        </div>
      </header>

      {/* Filters & Search Bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Stakeholder Filter */}
              <Select 
                value={filterStakeholder} 
                onValueChange={(v) => setFilterStakeholder(v as FilterMode)}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by stakeholder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Stakeholders
                    </div>
                  </SelectItem>
                  {Object.entries(LENS_CONFIG).map(([lens, config]) => (
                    <SelectItem key={lens} value={lens}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded transition-colors',
                    viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lens Score Selector (only affects score display, not filtering) */}
          {filteredReports.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">View scores as:</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedLens(null)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    selectedLens === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  )}
                >
                  Overall
                </button>
                {Object.entries(LENS_CONFIG).map(([lens, config]) => (
                  <button
                    key={lens}
                    onClick={() => setSelectedLens(lens as StakeholderLens)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
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
          )}
        </div>
      </div>

      {/* Reports Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <ReportsListSkeleton />
        ) : (
          <>
            {/* In-Progress Analyses Section */}
            {inProgressAnalyses.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-lg font-semibold">In Progress</h2>
                  <span className="text-sm text-muted-foreground">({inProgressAnalyses.length})</span>
                </div>
                <div className="grid gap-4">
                  {inProgressAnalyses.map((analysis) => (
                    <InProgressAnalysis
                      key={analysis.id}
                      analysis={analysis}
                      onRetry={fetchData}
                      onViewPartial={
                        Object.values(analysis.agent_progress || {}).some(a => a?.status === 'completed')
                          ? () => navigate(`/report/${analysis.id}`)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            )}
            
            {/* Completed Reports Section */}
            {filteredReports.length === 0 && inProgressAnalyses.length === 0 ? (
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
            ) : filteredReports.length === 0 ? (
              <Card className="bg-card/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Matching Reports</h3>
                  <p className="text-muted-foreground text-center">
                    No reports match your current filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Completed Reports</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Reports Grid/List */}
                <div className={cn(
                  viewMode === 'grid' 
                    ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' 
                    : 'flex flex-col gap-4'
                )}>
                  {filteredReports.map((report, index) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      index={index}
                      viewMode={viewMode}
                      selectedLens={selectedLens}
                      onDelete={(e) => handleDeleteClick(e, report)}
                      onClick={() => navigate(`/report/${report.analysis_run_id}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
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

interface ReportCardProps {
  report: ReportWithScript;
  index: number;
  viewMode: ViewMode;
  selectedLens: StakeholderLens | null;
  onDelete: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function ReportCard({ report, index, viewMode, selectedLens, onDelete, onClick }: ReportCardProps) {
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

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer group',
          'animate-fade-up'
        )}
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Score */}
          <ScoreRing score={score} size="sm" />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {report.scripts?.title || report.title}
              </h3>
              <StakeholderBadge lens={reportStakeholder} size="sm" showIcon={false} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(report.created_at).toLocaleDateString()}
              </span>
              {report.scripts?.genre && (
                <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                  {report.scripts.genre}
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
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer group card-hover',
        'animate-fade-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base mb-2 truncate group-hover:text-primary transition-colors">
              {report.scripts?.title || report.title}
            </CardTitle>
            <StakeholderBadge lens={reportStakeholder} size="sm" />
          </div>
          <ScoreRing score={score} size="md" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Mini Radar Chart */}
        {reportData?.categoryScores && Object.keys(reportData.categoryScores).length > 0 && (
          <div className="h-32">
            <CategoryRadarChart
              categoryScores={reportData.categoryScores}
              compact
            />
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(report.created_at).toLocaleDateString()}
          </span>
          <div className="flex gap-1">
            {report.scripts?.genre && (
              <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                {report.scripts.genre}
              </span>
            )}
            {report.scripts?.script_type && (
              <span className="px-2 py-0.5 rounded-full bg-secondary text-xs capitalize">
                {report.scripts.script_type}
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(reportData?.lensScores || {}).slice(0, 2).map(([lens, lensScore]) => (
            <div
              key={lens}
              className={cn(
                'p-2 rounded-lg text-center',
                lens === selectedLens ? 'bg-primary/10' : 'bg-muted/50'
              )}
            >
              <p className="text-[10px] text-muted-foreground truncate">
                {LENS_CONFIG[lens as StakeholderLens]?.label}
              </p>
              <p className="text-sm font-bold">{Math.round(lensScore as number)}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
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
  );
}

function ReportsListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-14 w-14 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <Skeleton className="h-32 rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
              <Skeleton className="h-9" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
