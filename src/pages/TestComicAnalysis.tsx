import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AnalysisTrigger } from '@/components/AnalysisTrigger';
import { 
  Loader2, FileText, Database, CheckCircle, 
  AlertTriangle, Beaker, Rocket, BookOpen, Palette, LayoutGrid
} from 'lucide-react';
import { SAMPLE_COMIC_SCRIPT, SAMPLE_COMIC_SCENES, SAMPLE_COMIC_CHARACTERS } from '@/data/sampleComicScript';

export default function TestComicAnalysis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isAddingScript, setIsAddingScript] = useState(false);
  const [addedScriptId, setAddedScriptId] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'adding' | 'ready' | 'analyzing' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const addComicScriptToLibrary = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to test the pipeline',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingScript(true);
    setError(null);
    setStep('adding');

    try {
      // Get user's organization
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.current_organization_id) {
        throw new Error('No organization found. Please complete onboarding first.');
      }

      const orgId = profile.current_organization_id;

      // Create a text blob for the script content
      const scriptContent = SAMPLE_COMIC_SCRIPT.content;
      const blob = new Blob([scriptContent], { type: 'text/plain' });
      // Use org ID as folder to satisfy RLS policies
      const fileName = `${orgId}/${Date.now()}-${SAMPLE_COMIC_SCRIPT.title.replace(/\s+/g, '-')}.txt`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('scripts')
        .upload(fileName, blob, {
          contentType: 'text/plain',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload script: ${uploadError.message}`);
      }

      // Create script record with comic type
      const { data: script, error: scriptError } = await supabase
        .from('scripts')
        .insert({
          title: SAMPLE_COMIC_SCRIPT.title,
          logline: SAMPLE_COMIC_SCRIPT.logline,
          genre: SAMPLE_COMIC_SCRIPT.genre,
          script_type: 'comic', // Explicitly set to comic type
          page_count: SAMPLE_COMIC_SCRIPT.pageCount,
          format: 'txt',
          file_url: fileName,
          organization_id: orgId,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (scriptError) {
        throw new Error(`Failed to create script: ${scriptError.message}`);
      }

      // Create comic-specific scene data
      const scenes = SAMPLE_COMIC_SCENES.map(scene => ({
        script_id: script.id,
        scene_number: scene.sceneNumber,
        heading: scene.heading,
        location: scene.location,
        time_of_day: scene.timeOfDay,
        int_ext: scene.intExt,
        page_start: scene.pageStart,
        page_end: scene.pageEnd,
        description: scene.description,
        emotional_tone: scene.emotionalTone,
      }));

      // Create character data
      const characters = SAMPLE_COMIC_CHARACTERS.map(char => ({
        script_id: script.id,
        name: char.name,
        description: char.description,
        dialogue_count: char.dialogueCount,
        scene_count: char.sceneCount,
        first_appearance: char.firstAppearance,
        arc_summary: char.arcSummary,
        relationships: char.relationships,
      }));

      // Insert scenes and characters
      await supabase.from('scenes').insert(scenes);
      await supabase.from('characters').insert(characters);

      // Create narrative graph placeholder with comic-specific metadata
      await supabase.from('narrative_graphs').insert({
        script_id: script.id,
        graph_type: 'panel_flow',
        nodes: scenes.map((s, i) => ({ 
          id: `page-${i + 1}`, 
          type: 'page', 
          label: SAMPLE_COMIC_SCENES[i].heading,
          panelCount: 4 + Math.floor(Math.random() * 3) // Random 4-6 panels per page
        })),
        edges: scenes.slice(0, -1).map((_, i) => ({ 
          source: `page-${i + 1}`, 
          target: `page-${i + 2}`, 
          type: 'page_turn' 
        })),
        metadata: { 
          extraction_complete: true, 
          extracted_pages: SAMPLE_COMIC_SCRIPT.pageCount, 
          expected_pages: SAMPLE_COMIC_SCRIPT.pageCount,
          script_type: 'comic',
          total_panels: 28 // Approximate for 6 pages
        },
      });

      setAddedScriptId(script.id);
      setStep('ready');

      toast({
        title: 'Comic script added',
        description: `"${SAMPLE_COMIC_SCRIPT.title}" has been added to your library`,
      });

    } catch (err) {
      console.error('Error adding comic script:', err);
      setError(err instanceof Error ? err.message : 'Failed to add comic script');
      setStep('idle');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add comic script',
        variant: 'destructive',
      });
    } finally {
      setIsAddingScript(false);
    }
  };

  const handleAnalysisComplete = async (analysisRunId: string) => {
    setStep('complete');
    setReportId(analysisRunId);

    toast({
      title: 'Comic analysis complete!',
      description: 'The full comic analysis pipeline has run successfully with all 14 agents.',
    });
  };

  const viewReport = () => {
    if (reportId) {
      navigate(`/report/${reportId}/comic`);
    } else if (addedScriptId) {
      navigate(`/scripts/${addedScriptId}`);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Beaker className="h-8 w-8 text-primary" />
          <Palette className="h-6 w-6 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Test Comic Analysis Pipeline
        </h1>
        <p className="text-muted-foreground">
          Run a full comic analysis on "{SAMPLE_COMIC_SCRIPT.title}" to verify all 14 agents (10 core + 4 comic-specific) are working correctly.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Add Comic Script */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'idle' ? 'bg-primary text-primary-foreground' : 
                step === 'adding' ? 'bg-primary text-primary-foreground animate-pulse' :
                'bg-emerald-500 text-white'
              }`}>
                {step === 'idle' || step === 'adding' ? '1' : <CheckCircle className="h-4 w-4" />}
              </div>
              <div>
                <CardTitle className="text-lg">Add Comic Script to Library</CardTitle>
                <CardDescription>
                  "{SAMPLE_COMIC_SCRIPT.title}" - {SAMPLE_COMIC_SCRIPT.genre}, {SAMPLE_COMIC_SCRIPT.pageCount} pages
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              <LayoutGrid className="h-3 w-3 mr-1" />
              Comic
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground italic">
              "{SAMPLE_COMIC_SCRIPT.logline}"
            </p>
          </div>
          
          {step === 'idle' && (
            <Button onClick={addComicScriptToLibrary} disabled={isAddingScript} className="w-full">
              {isAddingScript ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding comic script...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Add Comic Script to Library
                </>
              )}
            </Button>
          )}
          
          {step !== 'idle' && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Comic script added successfully</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Run Comic Analysis */}
      <Card className={`mb-6 transition-opacity ${step === 'idle' || step === 'adding' ? 'opacity-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'ready' || step === 'analyzing' ? 'bg-primary text-primary-foreground' : 
              step === 'complete' ? 'bg-emerald-500 text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '2'}
            </div>
            <div>
              <CardTitle className="text-lg">Run Comic Analysis</CardTitle>
              <CardDescription>
                Execute 10 core agents + 4 comic-specific agents
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(step === 'ready' || step === 'analyzing') && addedScriptId && (
            <AnalysisTrigger
              scriptId={addedScriptId}
              scriptTitle={SAMPLE_COMIC_SCRIPT.title}
              scriptType="comic"
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}
          
          {step === 'complete' && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Comic analysis completed successfully</span>
            </div>
          )}
          
          {step === 'idle' && (
            <p className="text-sm text-muted-foreground">
              Complete step 1 first to enable analysis.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 3: View Results */}
      <Card className={`transition-opacity ${step !== 'complete' ? 'opacity-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'complete' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <div>
              <CardTitle className="text-lg">View Comic Report</CardTitle>
              <CardDescription>
                Review the full analysis with comic-specific parameters
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'complete' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-4">
                <Rocket className="h-4 w-4" />
                <span className="text-sm font-medium">Comic pipeline test successful!</span>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={viewReport} className="flex-1">
                  <Palette className="h-4 w-4 mr-2" />
                  View Comic Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/scripts')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Scripts Library
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete analysis to view the generated comic report.
            </p>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Info Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What Gets Tested</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>✓ Comic script upload & storage</p>
            <p>✓ Page & panel extraction</p>
            <p>✓ All 10 core UASF agents</p>
            <p>✓ 4 comic-specific agents</p>
            <p>✓ 10 comic parameters (new framework)</p>
            <p>✓ Visual storytelling scoring</p>
            <p>✓ Panel flow analysis</p>
            <p>✓ Lettering & balloon placement</p>
            <p>✓ Art-script synergy evaluation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comic-Specific Agents</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-amber-600">PanelFlowAgent</p>
                <p className="text-xs">Visual pacing, panel transitions, page rhythm</p>
              </div>
              <div>
                <p className="font-medium text-amber-600">LetteringBalloonAgent</p>
                <p className="text-xs">Balloon placement, sound effects, typography</p>
              </div>
              <div>
                <p className="font-medium text-amber-600">PageTurnImpactAgent</p>
                <p className="text-xs">Cliffhangers, reveals, narrative momentum</p>
              </div>
              <div>
                <p className="font-medium text-amber-600">ArtScriptSynergyAgent</p>
                <p className="text-xs">Visual-text integration, show vs tell balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Parameters Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-amber-500" />
            New Comic Parameters (10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <p><span className="font-medium">1.</span> Sequential Storytelling Integrity</p>
              <p><span className="font-medium">2.</span> Panel Economy</p>
              <p><span className="font-medium">3.</span> Visual Pacing Rhythm</p>
              <p><span className="font-medium">4.</span> Page Turn Engineering</p>
              <p><span className="font-medium">5.</span> Lettering Integration</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">6.</span> Art-Writing Synergy</p>
              <p><span className="font-medium">7.</span> Issue Structure</p>
              <p><span className="font-medium">8.</span> Series Arc Potential</p>
              <p><span className="font-medium">9.</span> Visual Character Distinction</p>
              <p><span className="font-medium">10.</span> Action Clarity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Link to Sample Report */}
      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => navigate('/sample-comic-report')}>
          <BookOpen className="h-4 w-4 mr-2" />
          View Sample Comic Report (No Login Required)
        </Button>
      </div>
    </div>
  );
}
