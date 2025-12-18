import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, Check, AlertTriangle, PlayCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ScriptFormat, ScriptType } from '@/types/database';

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
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [currentScriptId, setCurrentScriptId] = useState<string | null>(null);

  const detectFormat = (filename: string): ScriptFormat | null => {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    return ext ? FORMAT_MAP[ext] || null : null;
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
  }, []);

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
        })
        .select()
        .single();

      if (scriptError) throw scriptError;
      setCurrentScriptId(script.id);
      setProgress(60);

      // Trigger parsing
      setUploadState('parsing');
      
      const { data: result, error: parseError } = await supabase.functions.invoke('script-parser', {
        body: {
          scriptId: script.id,
          format: detectedFormat,
          filePath: filePath,
          scriptType: scriptType,
        },
      });

      if (parseError) {
        console.error('Parse error:', parseError);
        setError('Script parsing failed. Please try re-uploading or use a different format.');
        setUploadState('error');
        return;
      }
      
      setParseResult(result);
      setProgress(100);

      // Check parsing result
      if (result && result.readyForAnalysis) {
        setUploadState('parsed');
        toast({
          title: 'Script Parsed Successfully',
          description: `${result.scenesCount || 0} scenes and ${result.charactersCount || 0} characters extracted. Ready for AI analysis!`,
        });
      } else if (result && result.formatIssues && result.formatIssues.length > 0) {
        setUploadState('format_issues');
        setError(result.formatIssues.join(' '));
      } else if (result && !result.readyForAnalysis) {
        const extractionError = result.errorMessage || 
          `Incomplete extraction: Only ${result.extractedPages || 0} of ${result.estimatedPages || 'unknown'} pages were extracted.`;
        
        setError(extractionError);
        setUploadState('format_issues');
      } else {
        setUploadState('parsed');
      }

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
      onUploadComplete?.(currentScriptId);
    }
  };

  const handleViewScript = () => {
    if (currentScriptId) {
      navigate(`/scripts`);
      onUploadComplete?.(currentScriptId);
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
            <label className="text-sm font-medium">Script Type</label>
            <div className="flex flex-wrap gap-2">
              {(['feature', 'pilot', 'episode', 'short', 'documentary', 'comic'] as ScriptType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setScriptType(type)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                      scriptType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Upload button */}
          <Button onClick={handleUpload} className="w-full h-12" size="lg">
            <Upload className="h-5 w-5 mr-2" />
            Upload & Parse Script
          </Button>
        </div>
      )}

      {(uploadState === 'uploading' || uploadState === 'parsing') && (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {uploadState === 'uploading' ? 'Uploading script...' : 'Parsing script...'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {uploadState === 'parsing'
                ? 'Extracting scenes, characters, and validating format'
                : 'Please wait while we upload your file'}
            </p>
          </div>
          <Progress value={progress} className="w-full" />
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
            <Button onClick={handleViewScript} variant="outline" className="flex-1">
              View in Scripts
            </Button>
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
            <Button onClick={handleViewScript} variant="secondary" className="flex-1">
              View Anyway
            </Button>
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
