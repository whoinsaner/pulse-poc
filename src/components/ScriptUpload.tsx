import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, Check, AlertTriangle, PlayCircle, Eye, RefreshCw, Clock, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ScriptFormat, ScriptType, EpisodeLengthClass } from '@/types/database';
import { ScriptPreview } from '@/components/ScriptPreview';
import { StreamingParsingStatus } from '@/components/StreamingParsingStatus';
import { useStreamingParser } from '@/hooks/useStreamingParser';

interface ScriptUploadProps {
  onUploadComplete?: (scriptId: string) => void;
  onClose?: () => void;
}

type UploadState = 'idle' | 'uploading' | 'parsing' | 'parsed' | 'complete' | 'error' | 'format_issues';

interface ParseResult {
  success: boolean;
  scenesCount?: number;
  charactersCount?: number;
  estimatedPages?: number;
  extractedPages?: number;
  isComplete?: boolean;
  readyForAnalysis?: boolean;
  errorMessage?: string;
  formatIssues?: string[];
  formatSuggestions?: string[];
  aiAssisted?: boolean;
  formatQuality?: 'good' | 'poor' | 'unreadable' | 'unknown';
}

const FORMAT_MAP: Record<string, ScriptFormat> = {
  '.pdf': 'pdf',
  '.fdx': 'fdx',
  '.fountain': 'fountain',
  '.highland': 'highland',
  '.txt': 'txt',
  '.docx': 'docx',
  '.doc': 'docx',
};

const FORMAT_LABELS: Record<ScriptFormat, string> = {
  pdf: 'PDF Document',
  fdx: 'Final Draft',
  fountain: 'Fountain',
  highland: 'Highland',
  txt: 'Plain Text',
  docx: 'Word Document',
};

export function ScriptUpload({ onUploadComplete, onClose }: ScriptUploadProps) {
  const navigate = useNavigate();
  const { user, currentOrganization } = useAuth();
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<ScriptFormat | null>(null);
  const [scriptType, setScriptType] = useState<ScriptType>('feature');
  const [episodeLengthClass, setEpisodeLengthClass] = useState<EpisodeLengthClass>('mid_form_web');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [fileSizeWarning, setFileSizeWarning] = useState<string | null>(null);

  // Auto-classification state
  const [classifying, setClassifying] = useState(false);
  const [autoDetectedType, setAutoDetectedType] = useState<ScriptType | null>(null);
  const [classificationConfidence, setClassificationConfidence] = useState<number>(0);
  const [isAutoSelected, setIsAutoSelected] = useState(false);
  const [showMismatchPrompt, setShowMismatchPrompt] = useState(false);
  const [mismatchDetectedType, setMismatchDetectedType] = useState<ScriptType | null>(null);
  const [autoClassifyEnabled] = useState(() => {
    return localStorage.getItem('pulse_auto_classify') !== 'false';
  });

  const isWebSeries = scriptType === 'web_series';

  const EPISODE_LENGTH_OPTIONS: { value: EpisodeLengthClass; label: string; description: string }[] = [
    { value: 'short_form_web', label: 'Short-Form', description: '<10 min' },
    { value: 'mid_form_web', label: 'Mid-Form', description: '10-30 min' },
    { value: 'long_form_web', label: 'Long-Form', description: '45-70+ min' },
  ];

  // Streaming parser hook
  const streamingParser = useStreamingParser({
    onComplete: (result) => {
      setParseResult({
        success: result.success,
        scenesCount: result.scenesCount,
        charactersCount: result.charactersCount,
        estimatedPages: result.estimatedPages,
        extractedPages: result.extractedPages,
        isComplete: result.isComplete,
        readyForAnalysis: result.readyForAnalysis,
        aiAssisted: result.aiAssisted,
      });
      
      if (result.readyForAnalysis) {
        setUploadState('parsed');
        toast({
          title: 'Script Parsed Successfully',
          description: `${result.scenesCount || 0} scenes and ${result.charactersCount || 0} characters extracted.`,
        });
      } else {
        setUploadState('format_issues');
        setError(`Extraction ${result.coveragePercent}% complete. Some content may be missing.`);
      }
    },
    onError: (errorMsg) => {
      setError(errorMsg);
      setUploadState('error');
    },
  });

  const detectFormat = (filename: string): ScriptFormat | null => {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    return ext ? FORMAT_MAP[ext] || null : null;
  };

  const extractTextSample = async (file: File, format: ScriptFormat): Promise<string | null> => {
    try {
      if (['fountain', 'txt', 'highland'].includes(format)) {
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).substring(0, 5000));
          reader.onerror = reject;
          // Read only first chunk
          const blob = file.slice(0, 8000);
          reader.readAsText(blob);
        });
      }
      if (format === 'fdx') {
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const text = reader.result as string;
            // Extract dialogue and scene content from FDX XML
            const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
            resolve(stripped.substring(0, 5000));
          };
          reader.onerror = reject;
          const blob = file.slice(0, 20000);
          reader.readAsText(blob);
        });
      }
      // For PDF/DOCX: send base64 chunk to the edge function
      if (['pdf', 'docx'].includes(format)) {
        const chunk = file.slice(0, 50000);
        const buffer = await chunk.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return base64; // The edge function will handle extraction
      }
      return null;
    } catch (e) {
      console.warn('Text extraction failed:', e);
      return null;
    }
  };

  const classifyScript = async (file: File, format: ScriptFormat) => {
    if (!autoClassifyEnabled) return;
    
    setClassifying(true);
    try {
      const textSample = await extractTextSample(file, format);
      if (!textSample) {
        setClassifying(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('classify-script-type', {
        body: { textSample, fileName: file.name },
      });

      if (error) throw error;

      const detectedType = data?.scriptType as ScriptType;
      const confidence = data?.confidence || 0;

      setAutoDetectedType(detectedType);
      setClassificationConfidence(confidence);

      if (confidence >= 0.6 && detectedType) {
        setScriptType(detectedType);
        setIsAutoSelected(true);
      }
    } catch (e) {
      console.warn('Auto-classification failed:', e);
    } finally {
      setClassifying(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const format = detectFormat(file.name);
    if (!format) {
      setError('Unsupported file format. Please upload PDF, DOCX, FDX, Fountain, Highland, or TXT files.');
      return;
    }

    setSelectedFile(file);
    setDetectedFormat(format);
    setTitle(file.name.replace(/\.[^.]+$/, ''));
    setError(null);
    setParseResult(null);
    setAutoDetectedType(null);
    setIsAutoSelected(false);
    setClassificationConfidence(0);
    setShowMismatchPrompt(false);

    // Trigger auto-classification
    classifyScript(file, format);
  }, [autoClassifyEnabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/xml': ['.fdx'],
      'text/plain': ['.fountain', '.highland', '.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const handleUpload = async () => {
    if (!selectedFile || !detectedFormat || !user || !currentOrganization) {
      toast({
        title: 'Error',
        description: 'Missing required information for upload.',
        variant: 'destructive',
      });
      return;
    }

    // Check for mismatch between auto-detected and user-selected type
    if (autoDetectedType && classificationConfidence >= 0.6 && autoDetectedType !== scriptType && !showMismatchPrompt) {
      setMismatchDetectedType(autoDetectedType);
      setShowMismatchPrompt(true);
      return;
    }

    try {
      setUploadState('uploading');
      setProgress(10);
      setError(null);

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${currentOrganization.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('scripts')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;
      setCurrentFilePath(filePath);
      setProgress(40);

      // Create script record
      const { data: script, error: scriptError } = await supabase
        .from('scripts')
        .insert({
          title: title || selectedFile.name,
          file_url: filePath,
          format: detectedFormat,
          script_type: scriptType,
          organization_id: currentOrganization.id,
          uploaded_by: user.id,
          file_size_bytes: selectedFile.size,
          episode_length_class: isWebSeries ? episodeLengthClass : null,
        })
        .select()
        .single();

      if (scriptError) throw scriptError;
      setCurrentScriptId(script.id);
      setProgress(60);

      // Trigger streaming parsing
      setUploadState('parsing');
      
      // Start the streaming parser - it will handle progress and completion via the hook callbacks
      streamingParser.startStreaming(script.id, detectedFormat, filePath, scriptType);
      
      // The streaming parser handles progress and completion via hook callbacks
      // (defined in the useStreamingParser hook above)

    } catch (err) {
      console.error('Upload error:', err);
      setUploadState('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleRunAnalysis = () => {
    if (currentScriptId) {
      navigate(`/scripts?analyze=${currentScriptId}`);
      // Don't call onUploadComplete - user chose analysis, navigation handles flow
    }
  };

  const handleViewScript = () => {
    if (currentScriptId) {
      navigate(`/scripts`);
      // Don't call onUploadComplete - user chose to view scripts, navigation handles flow
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setDetectedFormat(null);
    setTitle('');
    setUploadState('idle');
    setProgress(0);
    setError(null);
    setParseResult(null);
    setCurrentScriptId(null);
    setCurrentFilePath(null);
    setShowPreview(false);
    setEpisodeLengthClass('mid_form_web');
    setAutoDetectedType(null);
    setIsAutoSelected(false);
    setClassificationConfidence(0);
    setShowMismatchPrompt(false);
    setMismatchDetectedType(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Upload Script</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {uploadState === 'idle' && !selectedFile && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your script here' : 'Drag & drop your script'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {Object.entries(FORMAT_LABELS).map(([format, label]) => (
                <span
                  key={format}
                  className="px-3 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 max-w-md">
              For best results, use properly formatted scripts with clear scene headings (INT./EXT.) and character names in ALL CAPS
            </p>
          </div>
        </div>
      )}

      {selectedFile && uploadState === 'idle' && (
        <div className="space-y-6">
          {/* File preview */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {detectedFormat && FORMAT_LABELS[detectedFormat]} •{' '}
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={resetUpload}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Title input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Script Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter script title"
            />
          </div>

          {/* Script type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Script Type</label>
              {classifying && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Detecting...
                </div>
              )}
              {isAutoSelected && autoDetectedType && !classifying && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Sparkles className="h-3 w-3" />
                  Auto-detected ({Math.round(classificationConfidence * 100)}%)
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['feature', 'pilot', 'episode', 'short', 'documentary', 'comic', 'web_series', 'micro_drama', 'stage_play', 'audio_drama', 'podcast_fiction', 'game_narrative'] as ScriptType[]).map(
                (type) => {
                  const labels: Record<string, string> = {
                    feature: 'Feature', pilot: 'Pilot', episode: 'Episode',
                    short: 'Short', documentary: 'Documentary', comic: 'Comic',
                    web_series: 'Web Series', micro_drama: 'Micro Drama',
                    stage_play: 'Stage Play', audio_drama: 'Audio Drama',
                    podcast_fiction: 'Podcast Fiction', game_narrative: 'Game Narrative',
                  };
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setScriptType(type);
                        setIsAutoSelected(false);
                      }}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        scriptType === type
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      {labels[type] || type}
                    </button>
                  );
                }
              )}
            </div>
            {autoDetectedType && !isAutoSelected && classificationConfidence >= 0.6 && autoDetectedType !== scriptType && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI suggested: <span className="font-medium">{autoDetectedType.replace('_', ' ')}</span> ({Math.round(classificationConfidence * 100)}% confidence)
              </p>
            )}
          </div>

          {/* Episode Length Class - Only shown for Web Series */}
          {isWebSeries && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Episode Length Class</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Episode length affects which parameters are evaluated and their weights. 
                      Long-form (45+ min) activates additional mid-episode re-hooking parameters.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {EPISODE_LENGTH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEpisodeLengthClass(option.value)}
                    className={cn(
                      'flex flex-col items-center p-4 rounded-xl border-2 transition-all',
                      episodeLengthClass === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 bg-card'
                    )}
                  >
                    <Clock className={cn(
                      "h-5 w-5 mb-2",
                      episodeLengthClass === option.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium text-sm",
                      episodeLengthClass === option.value ? "text-primary" : "text-foreground"
                    )}>
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>

              {/* Info badge about what this selection means */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  {episodeLengthClass === 'short_form_web' && (
                    <>
                      <strong>Short-form optimization:</strong> Hook efficiency (+30%), shareability (+40%), and retention curve weights are increased. Character stickiness weight is reduced.
                    </>
                  )}
                  {episodeLengthClass === 'mid_form_web' && (
                    <>
                      <strong>Balanced evaluation:</strong> All 10 core web series parameters are evaluated with default weights.
                    </>
                  )}
                  {episodeLengthClass === 'long_form_web' && (
                    <>
                      <strong>Long-form activation:</strong> 3 additional parameters unlocked (Mid-Episode Re-Hooking, Soft Act Integrity, Binge Continuity). Character stickiness and serial momentum weights increased.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Mismatch prompt */}
          {showMismatchPrompt && mismatchDetectedType && (
            <Card className="p-4 border-primary/30 bg-primary/5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm font-medium">Script type mismatch detected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI detected this as <strong>{mismatchDetectedType.replace('_', ' ')}</strong> ({Math.round(classificationConfidence * 100)}% confidence),
                      but you selected <strong>{scriptType.replace('_', ' ')}</strong>.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setScriptType(mismatchDetectedType);
                        setIsAutoSelected(true);
                        setShowMismatchPrompt(false);
                        // Re-trigger upload
                        setTimeout(() => handleUpload(), 0);
                      }}
                    >
                      Use {mismatchDetectedType.replace('_', ' ')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowMismatchPrompt(false);
                        // Proceed with user's choice
                        handleUpload();
                      }}
                    >
                      Keep {scriptType.replace('_', ' ')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Upload button */}
          <Button onClick={handleUpload} className="w-full h-12" size="lg" disabled={classifying}>
            {classifying ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Detecting script type...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload & Parse Script
              </>
            )}
          </Button>
        </div>
      )}

      {uploadState === 'uploading' && (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <div>
            <p className="text-lg font-medium">Uploading script...</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please wait while we upload your file
            </p>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {uploadState === 'parsing' && (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Parsing Your Script</h3>
            <p className="text-sm text-muted-foreground">
              {title || selectedFile?.name}
            </p>
          </div>
          
          <StreamingParsingStatus 
            isActive={streamingParser.isActive}
            currentStage={streamingParser.currentStage}
            progress={streamingParser.progress}
            chunks={streamingParser.chunks}
            warnings={streamingParser.warnings}
            eta={streamingParser.eta}
            format={detectedFormat || undefined}
          />
        </div>
      )}

      {/* Successfully Parsed - Show CTA */}
      {uploadState === 'parsed' && parseResult && (
        <div className="space-y-6">
          <Card className="p-6 bg-success/5 border-success/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-success">Script Parsed Successfully!</h3>
                  {parseResult.aiAssisted && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                      AI-Assisted
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your script is ready for AI-powered analysis
                  {parseResult.formatQuality === 'poor' && ' (format was normalized with AI)'}
                </p>
                
                {/* Extraction stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-2xl font-bold">{parseResult.scenesCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Scenes</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-2xl font-bold">{parseResult.charactersCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Characters</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50">
                    <p className="text-2xl font-bold">{parseResult.extractedPages || '~'}</p>
                    <p className="text-xs text-muted-foreground">Pages</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Primary CTA - Run AI Analysis */}
          <Button 
            onClick={handleRunAnalysis} 
            className="w-full h-14 text-lg" 
            size="lg"
          >
            <PlayCircle className="h-6 w-6 mr-2" />
            Run AI Analysis
          </Button>

          <div className="flex gap-3">
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Extracted
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Script Preview - Verify Extraction</DialogTitle>
                </DialogHeader>
                {currentScriptId && currentFilePath && detectedFormat && (
                  <ScriptPreview
                    scriptId={currentScriptId}
                    title={title}
                    fileUrl={currentFilePath}
                    format={detectedFormat}
                    pageCount={parseResult?.extractedPages}
                  />
                )}
              </DialogContent>
            </Dialog>
            <Button onClick={resetUpload} variant="outline" className="flex-1">
              Upload Another
            </Button>
          </div>
        </div>
      )}

      {/* Format Issues - Partial Success */}
      {uploadState === 'format_issues' && (
        <div className="space-y-6">
          <Card className="p-6 bg-warning/5 border-warning/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-warning">Script Format Issues Detected</h3>
                  {parseResult?.aiAssisted && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                      AI-Assisted
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {parseResult?.aiAssisted 
                    ? 'AI parsing was attempted but some issues remain that may affect analysis quality.'
                    : 'The script was uploaded but some issues were found that may affect AI analysis quality.'}
                </p>
                
                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-background/50 text-sm">
                    {error}
                  </div>
                )}

                {parseResult && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <p className="text-2xl font-bold">{parseResult.scenesCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Scenes Found</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <p className="text-2xl font-bold">{parseResult.charactersCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Characters</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <p className="text-2xl font-bold">
                        {parseResult.extractedPages || 0}/{parseResult.estimatedPages || '?'}
                      </p>
                      <p className="text-xs text-muted-foreground">Pages Extracted</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium mb-2">Suggestions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Re-upload using Final Draft (.fdx) or Fountain format for best results</li>
              <li>Ensure scene headings start with INT. or EXT.</li>
              <li>Character names should be in ALL CAPS before dialogue</li>
              <li>Check for any corrupted pages in the original file</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={resetUpload} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-upload Script
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Extracted
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Script Preview - Verify Extraction</DialogTitle>
                </DialogHeader>
                {currentScriptId && currentFilePath && detectedFormat && (
                  <ScriptPreview
                    scriptId={currentScriptId}
                    title={title}
                    fileUrl={currentFilePath}
                    format={detectedFormat}
                    pageCount={parseResult?.extractedPages}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {uploadState === 'error' && (
        <div className="space-y-6">
          <Card className="p-6 bg-destructive/5 border-destructive/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <X className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-destructive">Upload Failed</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {error || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </Card>
          
          <Button onClick={resetUpload} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}

      {uploadState === 'complete' && (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <Check className="h-10 w-10 text-success" />
          </div>
          <div>
            <p className="text-lg font-medium">Upload Complete!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your script is ready for analysis
            </p>
          </div>
          <Button onClick={resetUpload} variant="outline">
            Upload Another Script
          </Button>
        </div>
      )}
    </div>
  );
}
