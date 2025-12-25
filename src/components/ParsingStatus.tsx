import { useState, useEffect } from 'react';
import { Check, Loader2, FileText, ScanSearch, Users, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParsingStage {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number; // estimated duration in ms
}

const PARSING_STAGES: ParsingStage[] = [
  {
    id: 'download',
    label: 'Downloading',
    description: 'Fetching script from storage',
    icon: FileText,
    duration: 1500,
  },
  {
    id: 'validate',
    label: 'Validating',
    description: 'Checking script format and structure',
    icon: ScanSearch,
    duration: 2000,
  },
  {
    id: 'extract',
    label: 'Extracting',
    description: 'Parsing scenes and dialogue',
    icon: BookOpen,
    duration: 8000,
  },
  {
    id: 'characters',
    label: 'Analyzing',
    description: 'Identifying characters and relationships',
    icon: Users,
    duration: 3000,
  },
  {
    id: 'finalize',
    label: 'Finalizing',
    description: 'Preparing for AI analysis',
    icon: Sparkles,
    duration: 2000,
  },
];

interface ParsingStatusProps {
  isActive: boolean;
  format?: string;
  onStageChange?: (stage: string) => void;
}

export function ParsingStatus({ isActive, format, onStageChange }: ParsingStatusProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  useEffect(() => {
    if (!isActive) {
      setCurrentStageIndex(0);
      setStageProgress(0);
      setCompletedStages([]);
      return;
    }

    const currentStage = PARSING_STAGES[currentStageIndex];
    if (!currentStage) return;

    onStageChange?.(currentStage.id);

    // Simulate progress within current stage
    const progressInterval = setInterval(() => {
      setStageProgress((prev) => {
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 95);
      });
    }, currentStage.duration / 10);

    // Move to next stage after duration
    const stageTimeout = setTimeout(() => {
      setCompletedStages((prev) => [...prev, currentStage.id]);
      setStageProgress(0);
      
      if (currentStageIndex < PARSING_STAGES.length - 1) {
        setCurrentStageIndex((prev) => prev + 1);
      }
    }, currentStage.duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimeout);
    };
  }, [isActive, currentStageIndex, onStageChange]);

  if (!isActive) return null;

  const currentStage = PARSING_STAGES[currentStageIndex];

  return (
    <div className="space-y-4">
      {/* Current stage highlight */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {currentStage && <currentStage.icon className="h-5 w-5 text-primary animate-pulse" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-primary">{currentStage?.label}...</p>
            <p className="text-sm text-muted-foreground">{currentStage?.description}</p>
          </div>
        </div>
        
        {/* Progress bar for current stage */}
        <div className="mt-3 h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${stageProgress}%` }}
          />
        </div>
      </div>

      {/* Stage timeline */}
      <div className="space-y-2">
        {PARSING_STAGES.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = index === currentStageIndex;
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

      {/* Format-specific tips */}
      {format && (
        <div className="text-xs text-muted-foreground text-center mt-4 p-2 bg-muted/50 rounded-lg">
          {format === 'pdf' && '📄 PDF parsing uses AI for complex formatting...'}
          {format === 'docx' && '📝 Word document extraction in progress...'}
          {format === 'fdx' && '🎬 Final Draft format ensures best accuracy...'}
          {format === 'fountain' && '⛲ Fountain format provides optimal parsing...'}
          {(format === 'txt' || format === 'highland') && '📜 Processing text-based format...'}
        </div>
      )}
    </div>
  );
}
