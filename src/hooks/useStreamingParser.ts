import { useState, useCallback, useRef } from 'react';

export interface ParsingEvent {
  type: 'stage' | 'progress' | 'chunk' | 'warning' | 'complete' | 'error';
  data: any;
}

export interface ParsingProgress {
  stage: 'download' | 'validate' | 'classify' | 'extract' | 'characters' | 'finalize';
  percent: number;
  message: string;
  totalChunks?: number;
}

export interface ChunkStatus {
  current: number;
  total: number;
  status: 'processing' | 'complete' | 'failed';
  scenesFound?: number;
  pageRange?: string;
  error?: string;
}

export interface ClassificationResult {
  detected: 'comic' | 'screenplay' | 'unknown';
  confidence: number;
  mismatch: boolean;
  corrected: boolean;
  userSelected?: string;
}

export interface ParsingResult {
  success: boolean;
  scenesCount?: number;
  charactersCount?: number;
  estimatedPages?: number;
  extractedPages?: number;
  isComplete?: boolean;
  readyForAnalysis?: boolean;
  aiAssisted?: boolean;
  coveragePercent?: number;
  errorMessage?: string;
  errorCode?: string;
  recommendations?: string[];
  classification?: ClassificationResult;
}

export interface ParsingWarnings {
  warnings: string[];
  recommendations?: string[];
  failedChunks?: number[];
}

export interface ETAInfo {
  elapsedSeconds: number;
  estimatedTotalSeconds: number | null;
  estimatedRemainingSeconds: number | null;
  formattedElapsed: string;
  formattedRemaining: string | null;
}

interface UseStreamingParserOptions {
  onStageChange?: (stage: string) => void;
  onProgress?: (progress: ParsingProgress) => void;
  onChunkUpdate?: (chunk: ChunkStatus) => void;
  onWarning?: (warnings: ParsingWarnings) => void;
  onComplete?: (result: ParsingResult) => void;
  onError?: (error: string) => void;
}

// Format seconds into human-readable string
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}m ${secs}s`;
}

export function useStreamingParser(options: UseStreamingParserOptions = {}) {
  const [isActive, setIsActive] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [progress, setProgress] = useState<ParsingProgress | null>(null);
  const [chunks, setChunks] = useState<ChunkStatus[]>([]);
  const [warnings, setWarnings] = useState<ParsingWarnings | null>(null);
  const [result, setResult] = useState<ParsingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eta, setEta] = useState<ETAInfo | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const etaIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef<number>(0);

  // Update ETA calculations
  const updateEta = useCallback((currentPercent: number) => {
    if (!startTimeRef.current) return;
    
    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedSeconds = elapsedMs / 1000;
    
    let estimatedTotalSeconds: number | null = null;
    let estimatedRemainingSeconds: number | null = null;
    
    // Only calculate ETA if we have meaningful progress (> 5%)
    if (currentPercent > 5) {
      estimatedTotalSeconds = (elapsedSeconds / currentPercent) * 100;
      estimatedRemainingSeconds = Math.max(0, estimatedTotalSeconds - elapsedSeconds);
    }
    
    setEta({
      elapsedSeconds,
      estimatedTotalSeconds,
      estimatedRemainingSeconds,
      formattedElapsed: formatTime(elapsedSeconds),
      formattedRemaining: estimatedRemainingSeconds !== null ? formatTime(estimatedRemainingSeconds) : null,
    });
    
    lastProgressRef.current = currentPercent;
  }, []);

  const startStreaming = useCallback(async (
    scriptId: string,
    format: string,
    filePath: string,
    scriptType: string
  ) => {
    setIsActive(true);
    setCurrentStage('');
    setProgress(null);
    setChunks([]);
    setWarnings(null);
    setResult(null);
    setError(null);
    setEta(null);
    
    // Start timing
    startTimeRef.current = Date.now();
    lastProgressRef.current = 0;
    
    // Update elapsed time every second
    etaIntervalRef.current = setInterval(() => {
      updateEta(lastProgressRef.current);
    }, 1000);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `https://mrdgivlozwhujmyifbaj.supabase.co/functions/v1/script-parser-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scriptId,
            format,
            filePath,
            scriptType,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let eventType = '';
        let eventData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            eventData = line.slice(6);
          } else if (line === '' && eventType && eventData) {
            // Process complete event
            try {
              const data = JSON.parse(eventData);
              handleEvent(eventType, data);
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
            eventType = '';
            eventData = '';
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Streaming aborted');
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        options.onError?.(errorMsg);
      }
    } finally {
      setIsActive(false);
      if (etaIntervalRef.current) {
        clearInterval(etaIntervalRef.current);
        etaIntervalRef.current = null;
      }
    }
  }, [options, updateEta]);

  const handleEvent = useCallback((type: string, data: any) => {
    switch (type) {
      case 'stage':
        setCurrentStage(data.stage);
        options.onStageChange?.(data.stage);
        break;
      
      case 'progress':
        const progressData: ParsingProgress = {
          stage: data.stage,
          percent: data.percent,
          message: data.message,
          totalChunks: data.totalChunks,
        };
        setProgress(progressData);
        options.onProgress?.(progressData);
        // Update ETA with new progress
        updateEta(data.percent);
        break;
      
      case 'chunk':
        const chunkData: ChunkStatus = {
          current: data.current,
          total: data.total,
          status: data.status,
          scenesFound: data.scenesFound,
          pageRange: data.pageRange,
          error: data.error,
        };
        setChunks(prev => {
          const existing = prev.findIndex(c => c.current === data.current);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = chunkData;
            return updated;
          }
          return [...prev, chunkData];
        });
        options.onChunkUpdate?.(chunkData);
        break;
      
      case 'warning':
        const warningData: ParsingWarnings = {
          warnings: data.warnings || [],
          recommendations: data.recommendations,
          failedChunks: data.failedChunks,
        };
        setWarnings(warningData);
        options.onWarning?.(warningData);
        break;
      
      case 'complete':
        const resultData: ParsingResult = {
          success: data.success,
          scenesCount: data.scenesCount,
          charactersCount: data.charactersCount,
          estimatedPages: data.estimatedPages,
          extractedPages: data.extractedPages,
          isComplete: data.isComplete,
          readyForAnalysis: data.readyForAnalysis,
          aiAssisted: data.aiAssisted,
          coveragePercent: data.coveragePercent,
          classification: data.classification,
        };
        setResult(resultData);
        options.onComplete?.(resultData);
        break;
      
      case 'error':
        const errorResult: ParsingResult = {
          success: false,
          errorMessage: data.message,
          errorCode: data.code,
          recommendations: data.recommendations,
        };
        setResult(errorResult);
        setError(data.message);
        options.onError?.(data.message);
        options.onComplete?.(errorResult);
        break;
      
      case 'result':
        // Handle result event (used for early termination like OCR_REQUIRED)
        const resultFromError: ParsingResult = {
          success: data.success,
          scenesCount: data.scenes,
          charactersCount: data.characters,
          errorMessage: data.message,
          errorCode: data.error,
        };
        setResult(resultFromError);
        if (!data.success) {
          setError(data.message);
          options.onError?.(data.message);
        }
        options.onComplete?.(resultFromError);
        break;
    }
  }, [options, updateEta]);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsActive(false);
    if (etaIntervalRef.current) {
      clearInterval(etaIntervalRef.current);
      etaIntervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setCurrentStage('');
    setProgress(null);
    setChunks([]);
    setEta(null);
    startTimeRef.current = null;
    if (etaIntervalRef.current) {
      clearInterval(etaIntervalRef.current);
      etaIntervalRef.current = null;
    }
    setWarnings(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    isActive,
    currentStage,
    progress,
    chunks,
    warnings,
    result,
    eta,
    error,
    startStreaming,
    abort,
    reset,
  };
}
