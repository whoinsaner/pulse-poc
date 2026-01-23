import { useState } from 'react';
import { FileText, Play, Loader2, Check, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { StreamingParsingStatus } from '@/components/StreamingParsingStatus';
import { useStreamingParser, ParsingResult } from '@/hooks/useStreamingParser';
import { cn } from '@/lib/utils';
import type { Script, ScriptFormat } from '@/types/database';

interface ScriptExtractionDialogProps {
  script: Script | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtractionComplete?: (scriptId: string) => void;
}

type ExtractionState = 'idle' | 'extracting' | 'complete' | 'error';

export function ScriptExtractionDialog({
  script,
  open,
  onOpenChange,
  onExtractionComplete,
}: ScriptExtractionDialogProps) {
  const { toast } = useToast();
  const [extractionState, setExtractionState] = useState<ExtractionState>('idle');
  const [result, setResult] = useState<ParsingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamingParser = useStreamingParser({
    onComplete: (parseResult) => {
      setResult(parseResult);
      if (parseResult.success && parseResult.readyForAnalysis) {
        setExtractionState('complete');
        toast({
          title: 'Extraction Complete',
          description: `${parseResult.scenesCount || 0} scenes and ${parseResult.charactersCount || 0} characters extracted.`,
        });
        onExtractionComplete?.(script!.id);
      } else if (parseResult.success) {
        setExtractionState('complete');
        toast({
          title: 'Extraction Complete with Warnings',
          description: `Coverage: ${parseResult.coveragePercent || 0}%. Some content may be incomplete.`,
          variant: 'default',
        });
        onExtractionComplete?.(script!.id);
      } else {
        setExtractionState('error');
        setError(parseResult.errorMessage || 'Extraction failed');
      }
    },
    onError: (errorMsg) => {
      setError(errorMsg);
      setExtractionState('error');
      toast({
        title: 'Extraction Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    },
  });

  const handleStartExtraction = () => {
    if (!script) return;

    setExtractionState('extracting');
    setResult(null);
    setError(null);

    // Start streaming extraction
    streamingParser.startStreaming(
      script.id,
      script.format,
      script.file_url,
      script.script_type
    );
  };

  const handleClose = () => {
    if (extractionState === 'extracting') {
      streamingParser.abort();
    }
    setExtractionState('idle');
    setResult(null);
    setError(null);
    streamingParser.reset();
    onOpenChange(false);
  };

  if (!script) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Extract Script Content
          </DialogTitle>
          <DialogDescription>
            Parse and extract scenes, characters, and dialogue from "{script.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {extractionState === 'idle' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{script.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {script.format.toUpperCase()} • {script.page_count || 'Unknown'} pages • {script.script_type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>Extraction will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Download and validate the script file</li>
                  <li>Classify the content type (screenplay vs. comic)</li>
                  <li>Extract scenes, characters, and dialogue</li>
                  <li>Prepare the script for AI analysis</li>
                </ul>
              </div>
            </div>
          )}

          {extractionState === 'extracting' && (
            <div className="space-y-6">
              <StreamingParsingStatus
                isActive={streamingParser.isActive}
                currentStage={streamingParser.currentStage}
                progress={streamingParser.progress}
                chunks={streamingParser.chunks}
                warnings={streamingParser.warnings}
                eta={streamingParser.eta}
              />
            </div>
          )}

          {extractionState === 'complete' && result && (
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-lg border flex items-start gap-3",
                result.readyForAnalysis 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-amber-500/10 border-amber-500/30"
              )}>
                {result.readyForAnalysis ? (
                  <Check className="h-5 w-5 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {result.readyForAnalysis ? 'Extraction Successful' : 'Extraction Complete with Warnings'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.scenesCount || 0} scenes • {result.charactersCount || 0} characters
                    {result.extractedPages && ` • ${result.extractedPages} pages extracted`}
                    {result.coveragePercent && ` • ${result.coveragePercent}% coverage`}
                  </p>
                  {result.aiAssisted && (
                    <p className="text-xs text-muted-foreground mt-1">
                      AI-assisted extraction was used for improved accuracy
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {extractionState === 'error' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Extraction Failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error || 'An unknown error occurred'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {extractionState === 'idle' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleStartExtraction}>
                <Play className="h-4 w-4 mr-2" />
                Start Extraction
              </Button>
            </>
          )}

          {extractionState === 'extracting' && (
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}

          {(extractionState === 'complete' || extractionState === 'error') && (
            <>
              {extractionState === 'error' && (
                <Button variant="outline" onClick={() => setExtractionState('idle')}>
                  Try Again
                </Button>
              )}
              <Button onClick={handleClose}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
