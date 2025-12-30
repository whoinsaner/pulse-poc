import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AnalysisTrigger } from '@/components/AnalysisTrigger';
import { ScriptContentViewer } from '@/components/ScriptContentViewer';
import { ScriptDetailDialog } from '@/components/ScriptDetailDialog';
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
};

export default function Scripts() {
  const navigate = useNavigate();
  const { user, currentOrganization, userRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [sampleScriptsOpen, setSampleScriptsOpen] = useState(true);
  const [addingScript, setAddingScript] = useState<string | null>(null);
  const [previewScript, setPreviewScript] = useState<SampleScriptData | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (currentOrganization) {
      fetchScripts();
    }
  }, [currentOrganization]);

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

  const handleDelete = async (scriptId: string) => {
    if (userRole !== 'admin') {
      toast({
        title: 'Permission denied',
        description: 'Only admins can delete scripts',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('scripts').delete().eq('id', scriptId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete script',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Script deleted',
        description: 'The script has been removed',
      });
      fetchScripts();
    }
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

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('scripts')
        .getPublicUrl(filePath);

      // Create script record
      const { data: scriptData, error: scriptError } = await supabase
        .from('scripts')
        .insert({
          title: sample.title,
          file_url: urlData.publicUrl,
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
                className="card-hover group cursor-pointer"
                onClick={() => handleAnalyze(script)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Film className="h-6 w-6 text-primary" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-[100]">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyze(script);
                        }}>
                          <Play className="h-4 w-4 mr-2" />
                          Analyze
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleViewContent(script);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Content
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedScript(script);
                          setShowDetailDialog(true);
                        }}>
                          <Info className="h-4 w-4 mr-2" />
                          Details & History
                        </DropdownMenuItem>
                        {userRole === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(script.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
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
        <Dialog open={showAnalyzeDialog} onOpenChange={setShowAnalyzeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Analyze Script</DialogTitle>
            </DialogHeader>
            {selectedScript && (
              <AnalysisTrigger
                scriptId={selectedScript.id}
                scriptTitle={selectedScript.title}
                onAnalysisComplete={(runId) => {
                  setShowAnalyzeDialog(false);
                  navigate(`/reports/${runId}`);
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
      </main>
    </div>
  );
}
