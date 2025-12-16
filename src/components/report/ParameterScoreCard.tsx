import { useState } from 'react';
import { ParameterScoreData, CATEGORY_COLORS } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Quote } from 'lucide-react';

interface ParameterScoreCardProps {
  parameter: ParameterScoreData;
  index: number;
  compact?: boolean;
}

export function ParameterScoreCard({ parameter, index, compact = false }: ParameterScoreCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasEvidence = parameter.evidence && parameter.evidence.length > 0;

  if (compact) {
    return (
      <div
        className="p-3 rounded-lg bg-card border border-border animate-fade-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-3">
          <ScoreRing score={parameter.score} size="sm" showLabel={false} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{parameter.displayName}</p>
            <p className="text-xs text-muted-foreground">{parameter.category}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl bg-card border border-border overflow-hidden animate-fade-up transition-all duration-300',
        expanded && 'ring-1 ring-primary/20'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[parameter.category] || 'hsl(var(--primary))' }}
              />
              <span className="text-xs text-muted-foreground">{parameter.category}</span>
            </div>
            <h4 className="font-medium">{parameter.displayName}</h4>
            {parameter.confidence && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(parameter.confidence * 100)}% confidence
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ScoreRing score={parameter.score} size="sm" showLabel={false} />
            {hasEvidence && (
              expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-up">
          {/* Rationale */}
          {parameter.rationale && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">{parameter.rationale}</p>
            </div>
          )}

          {/* Evidence */}
          {hasEvidence && (
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Supporting Evidence
              </h5>
              {parameter.evidence.slice(0, 3).map((ev, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/50 bg-background">
                  <div className="flex items-start gap-2">
                    <Quote className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {ev.quote && (
                        <p className="text-sm italic mb-1">"{ev.quote}"</p>
                      )}
                      <p className="text-xs text-muted-foreground">{ev.explanation}</p>
                      {ev.page && (
                        <p className="text-xs text-muted-foreground mt-1">Page {ev.page}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
