import { Check, Loader2, FileText, ScanSearch, Users, BookOpen, Sparkles, AlertTriangle, X, Clock, Tag, Eye, Cpu, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { ParsingProgress, ChunkStatus, ParsingWarnings, ETAInfo, ParsingResult, ExtractionMethod } from '@/hooks/useStreamingParser';

interface ParsingStageInfo {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PARSING_STAGES: ParsingStageInfo[] = [
  { id: 'download', label: 'Downloading', description: 'Fetching script from storage', icon: FileText },
  { id: 'validate', label: 'Validating', description: 'Checking format and structure', icon: ScanSearch },
  { id: 'classify', label: 'Classifying', description: 'Verifying script type', icon: Tag },
  { id: 'extract', label: 'Extracting', description: 'Parsing scenes and dialogue', icon: BookOpen },
  { id: 'characters', label: 'Analyzing', description: 'Identifying characters', icon: Users },
  { id: 'finalize', label: 'Finalizing', description: 'Saving to database', icon: Sparkles },
];

interface StreamingParsingStatusProps {
  isActive: boolean;
  currentStage: string;
  progress: ParsingProgress | null;
  chunks: ChunkStatus[];
  warnings: ParsingWarnings | null;
  eta: ETAInfo | null;
  format?: string;
  result?: ParsingResult | null;
}

const EXTRACTION_METHOD_CONFIG: Record<ExtractionMethod, { label: string; icon: React.ComponentType<{ className?: string }>; variant: 'default' | 'secondary' | 'info' }> = {
  pymupdf: { label: 'PDF Text Extraction', icon: FileCode, variant: 'default' },
  pdfjs: { label: 'Text Extraction', icon: FileCode, variant: 'secondary' },
  ai_vision: { label: 'AI Vision', icon: Eye, variant: 'info' },
  ai_vision_chunked: { label: 'AI Vision (Chunked)', icon: Eye, variant: 'info' },
  regex: { label: 'Pattern Matching', icon: Cpu, variant: 'secondary' },
  native: { label: 'Native Format', icon: FileCode, variant: 'default' },
  unknown: { label: 'Unknown', icon: FileText, variant: 'secondary' },
};

export function StreamingParsingStatus({
  isActive,
  currentStage,
  progress,
  chunks,
  warnings,
  eta,
  format,
  result,
}: StreamingParsingStatusProps) {
  if (!isActive && !progress && !result) return null;
  
  const extractionMethod = result?.extractionMethod;
  const methodConfig = extractionMethod ? EXTRACTION_METHOD_CONFIG[extractionMethod] : null;

  const currentStageIndex = PARSING_STAGES.findIndex(s => s.id === currentStage);
  const completedStages = PARSING_STAGES.slice(0, currentStageIndex).map(s => s.id);
  const currentStageInfo = PARSING_STAGES.find(s => s.id === currentStage);

  // Calculate chunk progress
  const totalChunks = chunks.length > 0 ? Math.max(...chunks.map(c => c.total)) : 0;
  const completedChunks = chunks.filter(c => c.status === 'complete').length;
  const failedChunks = chunks.filter(c => c.status === 'failed');

  return (
    <div className="space-y-4">
      {/* Extraction Method Badge */}
      {methodConfig && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Extraction Method:</span>
            <Badge variant={methodConfig.variant} className="gap-1.5">
              <methodConfig.icon className="h-3 w-3" />
              {methodConfig.label}
            </Badge>
          </div>
          {result?.coveragePercent !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Coverage:</span>
              <span className={cn(
                "text-sm font-medium",
                result.coveragePercent >= 90 ? "text-success" :
                result.coveragePercent >= 70 ? "text-warning" : "text-destructive"
              )}>
                {Math.round(result.coveragePercent)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* ETA Display */}
      {eta && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Elapsed:</span>
            <span className="text-sm font-medium">{eta.formattedElapsed}</span>
          </div>
          {eta.formattedRemaining && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">ETA:</span>
              <span className="text-sm font-medium text-primary">{eta.formattedRemaining}</span>
            </div>
          )}
        </div>
      )}

      {/* Current stage highlight */}
      {currentStageInfo && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <currentStageInfo.icon className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary">{currentStageInfo.label}...</p>
              <p className="text-sm text-muted-foreground">
                {progress?.message || currentStageInfo.description}
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <Progress value={progress?.percent || 0} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {progress?.percent ? `${Math.round(progress.percent)}%` : 'Starting...'}
              </span>
              {totalChunks > 0 && (
                <span className="text-xs text-muted-foreground">
                  {completedChunks}/{totalChunks} chunks
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chunk processing visualization */}
      {totalChunks > 0 && (
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Processing Chunks</span>
            <span className="text-xs text-muted-foreground">
              {completedChunks} complete, {failedChunks.length} failed
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: totalChunks }, (_, i) => {
              const chunk = chunks.find(c => c.current === i + 1);
              const status = chunk?.status || 'pending';
              
              return (
                <div
                  key={i}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center text-xs transition-all',
                    status === 'complete' && 'bg-success text-success-foreground',
                    status === 'processing' && 'bg-primary/20 text-primary animate-pulse',
                    status === 'failed' && 'bg-destructive/20 text-destructive',
                    status === 'pending' && 'bg-muted text-muted-foreground'
                  )}
                  title={chunk?.pageRange ? `Pages ${chunk.pageRange}` : `Chunk ${i + 1}`}
                >
                  {status === 'complete' && <Check className="h-3 w-3" />}
                  {status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                  {status === 'failed' && <X className="h-3 w-3" />}
                  {status === 'pending' && (i + 1)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.warnings.length > 0 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1">
              {warnings.warnings.map((warning, i) => (
                <p key={i} className="text-sm text-warning">{warning}</p>
              ))}
              {warnings.recommendations?.map((rec, i) => (
                <p key={`rec-${i}`} className="text-xs text-muted-foreground">{rec}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stage timeline */}
      <div className="space-y-2">
        {PARSING_STAGES.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = stage.id === currentStage;
          const isPending = index > currentStageIndex;

          return (
            <div
              key={stage.id}
              className={cn(
                'flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300',
                isCompleted && 'bg-success/5',
                isCurrent && 'bg-primary/5',
                isPending && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-success text-success-foreground',
                  isCurrent && 'bg-primary/20',
                  isPending && 'bg-muted'
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isCurrent ? (
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                ) : (
                  <span className="text-xs text-muted-foreground">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium truncate',
                    isCompleted && 'text-success',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {stage.label}
                </p>
              </div>

              <stage.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isCompleted && 'text-success',
                  isCurrent && 'text-primary',
                  isPending && 'text-muted-foreground/50'
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Format tips */}
      {format && (
        <div className="text-xs text-muted-foreground text-center mt-4 p-2 bg-muted/50 rounded-lg">
          {format === 'pdf' && '📄 Extracting text from PDF...'}
          {format === 'docx' && '📝 Extracting text from Word document...'}
          {format === 'fdx' && '🎬 Final Draft XML provides best accuracy...'}
          {format === 'fountain' && '⛲ Fountain format for optimal parsing...'}
          {(format === 'txt' || format === 'highland') && '📜 Processing text-based format...'}
        </div>
      )}
    </div>
  );
}
