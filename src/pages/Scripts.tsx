import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ArrowLeft,
  Upload,
  FileText,
  Calendar,
  Film,
  MoreVertical,
  Play,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles,
  BookOpen,
  Loader2,
  Info,
  AlertTriangle,
  FileSearch,
  RotateCcw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AnalysisTrigger } from '@/components/AnalysisTrigger';
import { ScriptContentViewer } from '@/components/ScriptContentViewer';
import { ScriptDetailDialog } from '@/components/ScriptDetailDialog';
import { ScriptExtractionDialog } from '@/components/ScriptExtractionDialog';
import { SAMPLE_SCRIPTS, type SampleScriptData } from '@/data/sampleScripts';
import type { Script, ScriptFormat, ScriptType } from '@/types/database';

const FORMAT_LABELS: Record<ScriptFormat, string> = {
  pdf: 'PDF',
  fdx: 'Final Draft',
  fountain: 'Fountain',
  highland: 'Highland',
  txt: 'Plain Text',
  docx: 'Word',
};

const TYPE_LABELS: Record<ScriptType, string> = {
  feature: 'Feature Film',
  pilot: 'TV Pilot',
  episode: 'Episode',
  short: 'Short Film',
  documentary: 'Documentary',
  comic: 'Comic Script',
  web_series: 'Web Series',
  micro_drama: 'Micro Drama',
  stage_play: 'Stage Play',
  audio_drama: 'Audio Drama',
  podcast_fiction: 'Podcast Fiction',
  game_narrative: 'Game Narrative',
};

export default function Scripts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, currentOrganization, userRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [relatedCounts, setRelatedCounts] = useState<{
    analysisRuns: number;
    reports: number;
    versions: number;
  } | null>(null);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [sampleScriptsOpen, setSampleScriptsOpen] = useState(true);
  const [addingScript, setAddingScript] = useState<string | null>(null);
  const [previewScript, setPreviewScript] = useState<SampleScriptData | null>(null);
  const [showExtractionDialog, setShowExtractionDialog] = useState(false);
  const [stuckRuns, setStuckRuns] = useState<Record<string, string>>({}); // scriptId -> analysisRunId
  const [resumeRunId, setResumeRunId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (currentOrganization) {
      fetchScripts();
      fetchStuckRuns();
    }
  }, [currentOrganization]);

  // Handle ?analyze= query parameter from ScriptUpload navigation
  useEffect(() => {
    const analyzeScriptId = searchParams.get('analyze');
    if (analyzeScriptId && scripts.length > 0 && !isLoading) {
      const scriptToAnalyze = scripts.find(s => s.id === analyzeScriptId);
      if (scriptToAnalyze) {
        setSelectedScript(scriptToAnalyze);
        setShowAnalyzeDialog(true);
        // Clear the query param to prevent re-triggering
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, scripts, isLoading, setSearchParams]);

  const fetchScripts = async () => {
    if (!currentOrganization) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('organization_id', currentOrganization.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scripts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scripts',
        variant: 'destructive',
      });
    } else {
      setScripts(data as Script[]);
    }
    setIsLoading(false);
  };

  const fetchStuckRuns = async () => {
    if (!currentOrganization) return;
    
    // Find analysis runs stuck in 'processing' for more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('analysis_runs')
      .select('id, script_id, created_at')
      .eq('status', 'processing')
      .lt('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const map: Record<string, string> = {};
      for (const run of data) {
        // Only keep the most recent stuck run per script
        if (!map[run.script_id]) {
          map[run.script_id] = run.id;
        }
      }
      setStuckRuns(map);
    }
  };

  const handleResumeAnalysis = (script: Script) => {
    const runId = stuckRuns[script.id];
    if (!runId) return;

    setResumeRunId(runId);
    setSelectedScript(script);
    setShowAnalyzeDialog(true);

    // Remove from stuck runs since we're handling it
    setStuckRuns(prev => {
      const next = { ...prev };
      delete next[script.id];
      return next;
    });
  };

  const fetchRelatedCounts = async (scriptId: string) => {
    setIsLoadingRelated(true);
    try {
      const [analysisRes, reportsRes, versionsRes] = await Promise.all([
        supabase.from('analysis_runs').select('id', { count: 'exact', head: true }).eq('script_id', scriptId),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('script_id', scriptId),
        supabase.from('script_versions').select('id', { count: 'exact', head: true }).eq('script_id', scriptId),
      ]);
      setRelatedCounts({
        analysisRuns: analysisRes.count ?? 0,
        reports: reportsRes.count ?? 0,
        versions: versionsRes.count ?? 0,
      });
    } catch (err) {
      console.error('Error fetching related counts:', err);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const handleDeleteClick = async (script: Script) => {
    if (userRole !== 'admin') {
      toast({
        title: 'Permission denied',
        description: 'Only admins can delete scripts',
        variant: 'destructive',
      });
      return;
    }
    setSelectedScript(script);
    setDeleteConfirmed(false);
    setRelatedCounts(null);
    setShowDeleteDialog(true);
    await fetchRelatedCounts(script.id);
  };

  const confirmDelete = async () => {
    if (!selectedScript) return;
    
    const { error } = await supabase.from('scripts').delete().eq('id', selectedScript.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete script',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Script deleted',
        description: 'The script and all related data have been removed',
      });
      fetchScripts();
    }
    setShowDeleteDialog(false);
    setSelectedScript(null);
  };

  const handleAnalyze = (script: Script) => {
    setSelectedScript(script);
    setShowAnalyzeDialog(true);
  };

  const handleViewContent = (script: Script) => {
    setSelectedScript(script);
    setShowContentDialog(true);
  };

  const handleAddSampleScript = async (sample: SampleScriptData) => {
    if (!currentOrganization || !user) return;

    setAddingScript(sample.id);

    try {
      // Create a blob from the script content
      const blob = new Blob([sample.content], { type: 'text/plain' });
      const fileName = `${sample.id}-${Date.now()}.txt`;
      const filePath = `${currentOrganization.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('scripts')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Create script record - store the file path directly
      // The file_url stores the storage path for later access via signed URLs
      const { data: scriptData, error: scriptError } = await supabase
        .from('scripts')
        .insert({
          title: sample.title,
          file_url: filePath,
          format: 'txt' as ScriptFormat,
          script_type: sample.scriptType as ScriptType,
          organization_id: currentOrganization.id,
          uploaded_by: user.id,
          genre: sample.genre,
          logline: sample.logline,
          page_count: sample.pageCount,
          file_size_bytes: blob.size,
        })
        .select()
        .single();

      if (scriptError) throw scriptError;

      toast({
        title: 'Script added',
        description: `"${sample.title}" has been added to your library`,
      });

      fetchScripts();
    } catch (error) {
      console.error('Error adding sample script:', error);
      toast({
        title: 'Error',
        description: 'Failed to add sample script',
        variant: 'destructive',
      });
    } finally {
      setAddingScript(null);
    }
  };

  const isScriptInLibrary = (sampleId: string) => {
    return scripts.some((s) => s.title === SAMPLE_SCRIPTS.find((ss) => ss.id === sampleId)?.title);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrganization) {
    navigate('/onboarding');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo size="sm" />
            </div>
            <Button onClick={() => navigate('/upload')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Script
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Script Library</h1>
          <p className="text-muted-foreground">
            {scripts.length} {scripts.length === 1 ? 'script' : 'scripts'} in{' '}
            {currentOrganization.name}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : scripts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No scripts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload your first screenplay to get started with AI-powered analysis.
              </p>
              <Button onClick={() => navigate('/upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Script
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <Card
                key={script.id}
                className="card-hover group flex flex-col"
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Film className="h-6 w-6 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-[100]">
                        <DropdownMenuItem onClick={() => handleViewContent(script)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Content
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedScript(script);
                          setShowExtractionDialog(true);
                        }}>
                          <FileSearch className="h-4 w-4 mr-2" />
                          Run Extraction
                        </DropdownMenuItem>
                        {stuckRuns[script.id] && (
                          <DropdownMenuItem onClick={() => handleResumeAnalysis(script)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Resume Stuck Analysis
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => {
                          setSelectedScript(script);
                          setShowDetailDialog(true);
                        }}>
                          <Info className="h-4 w-4 mr-2" />
                          Details & History
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-lg mb-1 truncate">{script.title}</h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{FORMAT_LABELS[script.format]}</Badge>
                    <Badge variant="outline">{TYPE_LABELS[script.script_type]}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(script.created_at).toLocaleDateString()}
                    </div>
                    {script.page_count && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {script.page_count} pages
                      </div>
                    )}
                  </div>

                  {script.logline && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {script.logline}
                    </p>
                  )}

                  {stuckRuns[script.id] && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Analysis stuck — use menu to resume</span>
                    </div>
                  )}

                  {/* Action buttons on tile */}
                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAnalyze(script)}
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Start Analysis
                    </Button>
                    {userRole === 'admin' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClick(script)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sample Scripts Section */}
        <div className="mt-12">
          <Collapsible open={sampleScriptsOpen} onOpenChange={setSampleScriptsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-4 h-auto mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold">Sample Scripts</h2>
                    <p className="text-sm text-muted-foreground">
                      {SAMPLE_SCRIPTS.length} professional scripts across various genres
                    </p>
                  </div>
                </div>
                {sampleScriptsOpen ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_SCRIPTS.map((sample) => {
                  const inLibrary = isScriptInLibrary(sample.id);
                  const isAdding = addingScript === sample.id;

                  return (
                    <Card
                      key={sample.id}
                      className={cn(
                        'group transition-all duration-200',
                        inLibrary ? 'opacity-60' : 'hover:border-primary/50 hover:shadow-lg'
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {sample.scriptType}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-lg mb-1">{sample.title}</h3>
                        <Badge variant="secondary" className="mb-3">
                          {sample.genre}
                        </Badge>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {sample.logline}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <FileText className="h-4 w-4" />
                          <span>{sample.pageCount} pages</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setPreviewScript(sample)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            disabled={inLibrary || isAdding}
                            onClick={() => handleAddSampleScript(sample)}
                          >
                            {isAdding ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4 mr-1" />
                            )}
                            {inLibrary ? 'Added' : isAdding ? 'Adding...' : 'Add'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Analyze Dialog */}
        <Dialog open={showAnalyzeDialog} onOpenChange={(open) => {
          setShowAnalyzeDialog(open);
          if (!open) setResumeRunId(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{resumeRunId ? 'Resume Analysis' : 'Analyze Script'}</DialogTitle>
            </DialogHeader>
            {selectedScript && (
              <AnalysisTrigger
                scriptId={selectedScript.id}
                scriptTitle={selectedScript.title}
                scriptType={selectedScript.script_type}
                resumeRunId={resumeRunId || undefined}
                onAnalysisComplete={(runId) => {
                  setShowAnalyzeDialog(false);
                  setResumeRunId(null);
                  navigate(`/reports/${runId}`);
                }}
                onCancel={() => {
                  setShowAnalyzeDialog(false);
                  setResumeRunId(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* View Content Dialog */}
        <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
          <DialogContent className="max-w-3xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>{selectedScript?.title} - Extracted Content</DialogTitle>
            </DialogHeader>
            {selectedScript && (
              <ScriptContentViewer
                scriptId={selectedScript.id}
                scriptTitle={selectedScript.title}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Sample Script Preview Dialog */}
        <Dialog open={!!previewScript} onOpenChange={() => setPreviewScript(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {previewScript?.title}
                <Badge variant="secondary" className="ml-2">
                  {previewScript?.genre}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            {previewScript && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    "{previewScript.logline}"
                  </p>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  <pre className="font-mono text-sm whitespace-pre-wrap p-4 bg-muted/30 rounded-lg">
                    {previewScript.content}
                  </pre>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setPreviewScript(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleAddSampleScript(previewScript);
                      setPreviewScript(null);
                    }}
                    disabled={isScriptInLibrary(previewScript.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {isScriptInLibrary(previewScript.id) ? 'Already Added' : 'Add to Library'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Script Detail Dialog */}
        <ScriptDetailDialog
          script={selectedScript}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Script
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedScript?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {isLoadingRelated ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : relatedCounts && (relatedCounts.analysisRuns > 0 || relatedCounts.reports > 0 || relatedCounts.versions > 0) ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                    This will also delete:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {relatedCounts.analysisRuns > 0 && (
                      <li>• {relatedCounts.analysisRuns} analysis run{relatedCounts.analysisRuns > 1 ? 's' : ''}</li>
                    )}
                    {relatedCounts.reports > 0 && (
                      <li>• {relatedCounts.reports} report{relatedCounts.reports > 1 ? 's' : ''}</li>
                    )}
                    {relatedCounts.versions > 0 && (
                      <li>• {relatedCounts.versions} version{relatedCounts.versions > 1 ? 's' : ''}</li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="confirm-delete"
                    checked={deleteConfirmed}
                    onCheckedChange={(checked) => setDeleteConfirmed(checked === true)}
                  />
                  <label
                    htmlFor="confirm-delete"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    I understand this will permanently delete all related data
                  </label>
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={
                  isLoadingRelated ||
                  (relatedCounts &&
                    (relatedCounts.analysisRuns > 0 ||
                      relatedCounts.reports > 0 ||
                      relatedCounts.versions > 0) &&
                    !deleteConfirmed)
                }
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Script
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Script Extraction Dialog */}
        <ScriptExtractionDialog
          script={selectedScript}
          open={showExtractionDialog}
          onOpenChange={setShowExtractionDialog}
          onExtractionComplete={() => {
            toast({
              title: 'Ready for Analysis',
              description: 'Script extraction complete. You can now run AI analysis.',
            });
          }}
        />
      </main>
    </div>
  );
}
