import { useState } from 'react';
import { ParameterScoreData, CATEGORY_COLORS, MaturityLevel, RiskLevel } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Quote, TrendingUp, AlertTriangle, Wrench, Zap, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ParameterDescription, ParameterScoringGuide } from './ParameterDescriptionDisplay';

interface ParameterScoreCardProps {
  parameter: ParameterScoreData;
  index: number;
  compact?: boolean;
}

const maturityColors: Record<MaturityLevel, string> = {
  Weak: 'bg-destructive/20 text-destructive border-destructive/30',
  Developing: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Strong: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
};

const riskColors: Record<RiskLevel, string> = {
  Low: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  High: 'bg-destructive/20 text-destructive border-destructive/30',
};

const impactColors: Record<RiskLevel, string> = {
  Low: 'bg-muted text-muted-foreground border-border',
  Medium: 'bg-primary/20 text-primary border-primary/30',
  High: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
};

export function ParameterScoreCard({ parameter, index, compact = false }: ParameterScoreCardProps) {
  const [expanded, setExpanded] = useState(false);

  const hasEvidence = parameter.evidence && parameter.evidence.length > 0;
  const hasUASFFields = parameter.maturity || parameter.riskLevel || parameter.fixCost || parameter.upsideImpact;

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
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{parameter.category}</p>
              {parameter.maturity && (
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', maturityColors[parameter.maturity])}>
                  {parameter.maturity}
                </Badge>
              )}
            </div>
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
              {parameter.maturity && (
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', maturityColors[parameter.maturity])}>
                  {parameter.maturity}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-medium">{parameter.displayName}</h4>
              <ParameterDescription parameterId={parameter.parameterName} />
            </div>
            {parameter.confidence && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(parameter.confidence * 100)}% confidence
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ScoreRing score={parameter.score} size="sm" showLabel={false} />
            {(hasEvidence || hasUASFFields) && (
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
          {/* UASF Metrics */}
          {hasUASFFields && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {parameter.riskLevel && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Risk</p>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-0.5', riskColors[parameter.riskLevel])}>
                      {parameter.riskLevel}
                    </Badge>
                  </div>
                </div>
              )}
              {parameter.fixCost && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Fix Cost</p>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-0.5', riskColors[parameter.fixCost])}>
                      {parameter.fixCost}
                    </Badge>
                  </div>
                </div>
              )}
              {parameter.upsideImpact && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Upside</p>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-0.5', impactColors[parameter.upsideImpact])}>
                      {parameter.upsideImpact}
                    </Badge>
                  </div>
                </div>
              )}
              {parameter.maturity && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/50">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Maturity</p>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-0.5', maturityColors[parameter.maturity])}>
                      {parameter.maturity}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rationale */}
          {parameter.rationale && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">{parameter.rationale}</p>
            </div>
          )}

          {/* Scoring Guide */}
          <ParameterScoringGuide parameterId={parameter.parameterName} />

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
