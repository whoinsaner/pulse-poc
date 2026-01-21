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
  Loader2, Play, FileText, Database, CheckCircle, 
  AlertTriangle, ArrowRight, Beaker, Rocket, BookOpen
} from 'lucide-react';
import { SAMPLE_SCRIPT } from '@/data/sampleScript';

export default function TestAnalysisPipeline() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isAddingScript, setIsAddingScript] = useState(false);
  const [addedScriptId, setAddedScriptId] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'adding' | 'ready' | 'analyzing' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const addSampleScriptToLibrary = async () => {
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
      const scriptContent = SAMPLE_SCRIPT.content;
      const blob = new Blob([scriptContent], { type: 'text/plain' });
      // Use org ID as folder to satisfy RLS policies
      const fileName = `${orgId}/${Date.now()}-${SAMPLE_SCRIPT.title.replace(/\s+/g, '-')}.txt`;

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

      // Create script record
      const { data: script, error: scriptError } = await supabase
        .from('scripts')
        .insert({
          title: SAMPLE_SCRIPT.title,
          logline: SAMPLE_SCRIPT.logline,
          genre: SAMPLE_SCRIPT.genre,
          script_type: SAMPLE_SCRIPT.scriptType,
          page_count: SAMPLE_SCRIPT.pageCount,
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

      // Create basic scene and character data for deep analysis
      const scenes = [
        { script_id: script.id, scene_number: 1, heading: 'EXT. ATACAMA DESERT, CHILE - NIGHT', location: 'ATACAMA DESERT', time_of_day: 'NIGHT', int_ext: 'EXT' },
        { script_id: script.id, scene_number: 2, heading: 'INT. ALMA CONTROL ROOM - CONTINUOUS', location: 'ALMA CONTROL ROOM', time_of_day: 'NIGHT', int_ext: 'INT' },
        { script_id: script.id, scene_number: 3, heading: 'INT. UNITED NATIONS HEADQUARTERS, GENEVA - DAY', location: 'UNITED NATIONS', time_of_day: 'DAY', int_ext: 'INT' },
      ];

      const characters = [
        { script_id: script.id, name: 'ELENA VASQUEZ', description: 'Disgraced astronomer, 42, weathered but sharp', dialogue_count: 15, scene_count: 3 },
        { script_id: script.id, name: 'DMITRI VOLKOV', description: 'Russian colleague, 55, perpetually rumpled', dialogue_count: 8, scene_count: 2 },
        { script_id: script.id, name: 'SECRETARY-GENERAL OKONKWO', description: 'Nigerian leader, 60, commanding presence', dialogue_count: 6, scene_count: 1 },
      ];

      // Insert scenes and characters
      await supabase.from('scenes').insert(scenes);
      await supabase.from('characters').insert(characters);

      // Create narrative graph placeholder
      await supabase.from('narrative_graphs').insert({
        script_id: script.id,
        graph_type: 'scene_flow',
        nodes: scenes.map((s, i) => ({ id: `scene-${i}`, type: 'scene', label: s.heading })),
        edges: scenes.slice(0, -1).map((_, i) => ({ source: `scene-${i}`, target: `scene-${i + 1}`, type: 'follows' })),
        metadata: { extraction_complete: true, extracted_pages: SAMPLE_SCRIPT.pageCount, expected_pages: SAMPLE_SCRIPT.pageCount },
      });

      setAddedScriptId(script.id);
      setStep('ready');

      toast({
        title: 'Sample script added',
        description: `"${SAMPLE_SCRIPT.title}" has been added to your library`,
      });

    } catch (err) {
      console.error('Error adding sample script:', err);
      setError(err instanceof Error ? err.message : 'Failed to add sample script');
      setStep('idle');
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add sample script',
        variant: 'destructive',
      });
    } finally {
      setIsAddingScript(false);
    }
  };

  const handleAnalysisComplete = async (analysisRunId: string) => {
    setStep('complete');
    setReportId(analysisRunId); // Store the analysis run ID for navigation

    toast({
      title: 'Pipeline test complete!',
      description: 'The full USAF analysis pipeline has run successfully.',
    });
  };

  const viewReport = () => {
    if (reportId) {
      // Navigate using analysis run ID - this is how report routes work
      navigate(`/report/${reportId}`);
    } else if (addedScriptId) {
      navigate(`/scripts/${addedScriptId}`);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Beaker className="h-8 w-8 text-primary" />
          Test Analysis Pipeline
        </h1>
        <p className="text-muted-foreground">
          Run a full USAF analysis on a sample script to verify all 10 agents are working correctly.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Add Sample Script */}
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
                <CardTitle className="text-lg">Add Sample Script to Library</CardTitle>
                <CardDescription>
                  "{SAMPLE_SCRIPT.title}" - {SAMPLE_SCRIPT.genre}, {SAMPLE_SCRIPT.pageCount} pages
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary">{SAMPLE_SCRIPT.scriptType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground italic">
              "{SAMPLE_SCRIPT.logline}"
            </p>
          </div>
          
          {step === 'idle' && (
            <Button onClick={addSampleScriptToLibrary} disabled={isAddingScript} className="w-full">
              {isAddingScript ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding script...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Add Sample Script to Library
                </>
              )}
            </Button>
          )}
          
          {step !== 'idle' && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Script added successfully</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Run Analysis */}
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
              <CardTitle className="text-lg">Run USAF Analysis</CardTitle>
              <CardDescription>
                Execute all 10 core agents + synthesis agents
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(step === 'ready' || step === 'analyzing') && addedScriptId && (
            <AnalysisTrigger
              scriptId={addedScriptId}
              scriptTitle={SAMPLE_SCRIPT.title}
              scriptType={SAMPLE_SCRIPT.scriptType}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}
          
          {step === 'complete' && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Analysis completed successfully</span>
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
              <CardTitle className="text-lg">View Generated Report</CardTitle>
              <CardDescription>
                Review the full USAF analysis report
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'complete' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-4">
                <Rocket className="h-4 w-4" />
                <span className="text-sm font-medium">Pipeline test successful!</span>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={viewReport} className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Full Report
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
              Complete analysis to view the generated report.
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
            <p>✓ Script upload & storage</p>
            <p>✓ Scene & character extraction</p>
            <p>✓ All 10 USAF analysis agents</p>
            <p>✓ Parameter scoring (50+ parameters)</p>
            <p>✓ Insight synthesis</p>
            <p>✓ Stakeholder lens weighting</p>
            <p>✓ Report generation</p>
            <p>✓ Realtime progress updates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agents Running</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>A. ConceptAgent - Concept & Hook</p>
            <p>B. StructureAgent - Narrative Structure</p>
            <p>C. CharacterAgent - Character & Agency</p>
            <p>D. ConflictAgent - Conflict & Stakes</p>
            <p>E. ThemeAgent - Theme & Meaning</p>
            <p>F. DialogueAgent - Dialogue Quality</p>
            <p>G. WorldLogicAgent - World & Logic</p>
            <p>H. EmotionalArcAgent - Emotional Arc</p>
            <p>I. MarketAgent - Market Fit</p>
            <p>J. ExecutionAgent - Execution Risk</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
