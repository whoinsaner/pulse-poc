import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ScriptFormat, ScriptType } from '@/types/database';

interface ScriptUploadProps {
  onUploadComplete?: (scriptId: string) => void;
  onClose?: () => void;
}

type UploadState = 'idle' | 'uploading' | 'parsing' | 'complete' | 'error';

const FORMAT_MAP: Record<string, ScriptFormat> = {
  '.pdf': 'pdf',
  '.fdx': 'fdx',
  '.fountain': 'fountain',
  '.highland': 'highland',
  '.txt': 'txt',
};

const FORMAT_LABELS: Record<ScriptFormat, string> = {
  pdf: 'PDF Document',
  fdx: 'Final Draft',
  fountain: 'Fountain',
  highland: 'Highland',
  txt: 'Plain Text',
};

export function ScriptUpload({ onUploadComplete, onClose }: ScriptUploadProps) {
  const { user, currentOrganization } = useAuth();
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<ScriptFormat | null>(null);
  const [scriptType, setScriptType] = useState<ScriptType>('feature');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const detectFormat = (filename: string): ScriptFormat | null => {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
    return ext ? FORMAT_MAP[ext] || null : null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const format = detectFormat(file.name);
    if (!format) {
      setError('Unsupported file format. Please upload PDF, FDX, Fountain, Highland, or TXT files.');
      return;
    }

    setSelectedFile(file);
    setDetectedFormat(format);
    setTitle(file.name.replace(/\.[^.]+$/, ''));
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/xml': ['.fdx'],
      'text/plain': ['.fountain', '.highland', '.txt'],
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

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${currentOrganization.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('scripts')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;
      setProgress(40);

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('scripts')
        .getPublicUrl(filePath);

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
      setProgress(60);

      // Trigger parsing
      setUploadState('parsing');
      
      const { error: parseError } = await supabase.functions.invoke('script-parser', {
        body: {
          scriptId: script.id,
          format: detectedFormat,
          filePath: filePath,
        },
      });

      if (parseError) {
        console.error('Parse error:', parseError);
        // Don't fail the upload if parsing fails - it can be retried
        toast({
          title: 'Upload complete',
          description: 'Script uploaded. Parsing will continue in the background.',
        });
      } else {
        setProgress(100);
        toast({
          title: 'Success',
          description: 'Script uploaded and parsed successfully!',
        });
      }

      setUploadState('complete');
      onUploadComplete?.(script.id);
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

  const resetUpload = () => {
    setSelectedFile(null);
    setDetectedFormat(null);
    setTitle('');
    setUploadState('idle');
    setProgress(0);
    setError(null);
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
              {(['feature', 'pilot', 'episode', 'short', 'documentary'] as ScriptType[]).map(
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
            Upload & Analyze Script
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
                ? 'Extracting scenes, characters, and dialogue'
                : 'Please wait while we upload your file'}
            </p>
          </div>
          <Progress value={progress} className="w-full" />
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

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
