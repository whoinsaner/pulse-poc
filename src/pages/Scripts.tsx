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
  ArrowLeft,
  Upload,
  FileText,
  Calendar,
  Film,
  MoreVertical,
  Play,
  Trash2,
  BarChart3,
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyze(script);
                        }}>
                          <Play className="h-4 w-4 mr-2" />
                          Analyze
                        </DropdownMenuItem>
                        {userRole === 'admin' && (
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
      </main>
    </div>
  );
}
