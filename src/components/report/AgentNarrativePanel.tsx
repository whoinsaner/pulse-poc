import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerdictBox } from '@/components/report/ui/VerdictBox';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Quote, 
  BookOpen,
  Lightbulb,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import type { AgentSectionContent } from '@/types/database';

/** Safely extract a display string from items that may be strings or {content, evidence} objects */
function toDisplayString(item: unknown): string {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    if (typeof obj.content === 'string') return obj.content;
    if (typeof obj.text === 'string') return obj.text;
    // Last resort: join all string values
    return Object.values(obj).filter(v => typeof v === 'string').join(' — ') || JSON.stringify(item);
  }
  return String(item);
}

interface AgentNarrativePanelProps {
  agentName: string;
  content: AgentSectionContent;
  className?: string;
}

/**
 * Renders the narrative content from an agent's sectionContent.
 * Falls back gracefully when fields are missing.
 */
export function AgentNarrativePanel({ agentName, content, className }: AgentNarrativePanelProps) {
  const [showDeepDive, setShowDeepDive] = useState(true);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Verdict */}
      {content.verdict && (
        <VerdictBox type="finding" title="Verdict" content={content.verdict} />
      )}

      {/* What's Working / Broken / Underdeveloped */}
      <div className="grid md:grid-cols-3 gap-3">
        {content.whatWorks && content.whatWorks.length > 0 && (
          <Card className="p-4 bg-success/5 border-success/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-success" />
              <h4 className="text-sm font-semibold">What's Working</h4>
            </div>
            <ul className="space-y-2">
              {content.whatWorks.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  <span>{toDisplayString(item)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {content.whatsBroken && content.whatsBroken.length > 0 && (
          <Card className="p-4 bg-destructive/5 border-destructive/20">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <h4 className="text-sm font-semibold">What's Broken</h4>
            </div>
            <ul className="space-y-2">
              {content.whatsBroken.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  <span>{toDisplayString(item)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {content.whatsUnderdeveloped && content.whatsUnderdeveloped.length > 0 && (
          <Card className="p-4 bg-chart-4/5 border-chart-4/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-chart-4" />
              <h4 className="text-sm font-semibold">Underdeveloped</h4>
            </div>
            <ul className="space-y-2">
              {content.whatsUnderdeveloped.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-chart-4 shrink-0 mt-0.5" />
                  <span>{toDisplayString(item)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {/* Key Quotes */}
      {content.keyQuotes && content.keyQuotes.length > 0 && (
        <div className="space-y-2">
          {content.keyQuotes.map((kq, i) => (
            <Card key={i} className="p-4 bg-primary/5 border-primary/10">
              <div className="flex items-start gap-3">
                <Quote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm italic font-medium">"{kq.quote}"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kq.context}
                    {kq.page && <span className="ml-2 text-primary">— p.{kq.page}</span>}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Deep Dive (collapsible) */}
      {content.deepDive && (
        <Card className="overflow-hidden">
          <button
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
          >
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Deep Dive Analysis</span>
            <ChevronDown className={cn(
              'h-4 w-4 ml-auto text-muted-foreground transition-transform',
              showDeepDive && 'rotate-180'
            )} />
          </button>
          {showDeepDive && (
            <div className="px-4 pb-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line mt-3">
                {content.deepDive}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Recommendations */}
      {content.recommendations && content.recommendations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recommendations
            </h4>
          </div>
          <div className="space-y-2">
            {content.recommendations.map((rec, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{rec.title}</span>
                      <Badge 
                        variant="outline" 
                        className={cn('text-[10px]', {
                          'bg-destructive/10 text-destructive border-destructive/30': rec.priority === 'critical',
                          'bg-chart-4/10 text-chart-4 border-chart-4/30': rec.priority === 'high',
                          'bg-muted text-muted-foreground': rec.priority === 'medium',
                        })}
                      >
                        {rec.priority}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-[10px]"
                      >
                        {rec.effort}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Renders character-specific narrative content
 */
export function CharacterNarrativePanel({ content }: { content: AgentSectionContent }) {
  return (
    <div className="space-y-6">
      {/* Base narrative */}
      <AgentNarrativePanel agentName="CharacterAgent" content={content} />

      {/* Protagonist Profile */}
      {content.protagonistProfile && (
        <Card className="p-5">
          <h4 className="font-semibold mb-3">Protagonist: {content.protagonistProfile.name}</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="font-medium text-muted-foreground">Want:</span> {content.protagonistProfile.want}</div>
            <div><span className="font-medium text-muted-foreground">Need:</span> {content.protagonistProfile.need}</div>
            <div><span className="font-medium text-muted-foreground">Flaw:</span> {content.protagonistProfile.flaw}</div>
            <div><span className="font-medium text-muted-foreground">Arc:</span> {content.protagonistProfile.arc}</div>
          </div>
          {content.protagonistProfile.strengths && content.protagonistProfile.strengths.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {content.protagonistProfile.strengths.map((s, i) => (
                <Badge key={i} variant="outline" className="bg-success/10 text-success border-success/30 text-xs">{s}</Badge>
              ))}
            </div>
          )}
          {content.protagonistProfile.weaknesses && content.protagonistProfile.weaknesses.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {content.protagonistProfile.weaknesses.map((w, i) => (
                <Badge key={i} variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">{w}</Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Antagonist Profile */}
      {content.antagonistProfile && (
        <Card className="p-5">
          <h4 className="font-semibold mb-3">Antagonist: {content.antagonistProfile.name}</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div><span className="font-medium text-muted-foreground">Motivation:</span> {content.antagonistProfile.motivation}</div>
            <div><span className="font-medium text-muted-foreground">Threat:</span> {content.antagonistProfile.threat}</div>
            <div><span className="font-medium text-muted-foreground">Complexity:</span> {content.antagonistProfile.complexity}</div>
          </div>
        </Card>
      )}

      {/* Supporting Cast */}
      {content.supportingCast && content.supportingCast.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Supporting Cast</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {content.supportingCast.map((c, i) => (
              <Card key={i} className="p-3">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.role}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.impact}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Psychology Insights */}
      {content.psychologyInsights && (
        <Card className="p-5 bg-primary/5 border-primary/10">
          <h4 className="font-semibold text-sm mb-2">Psychology Insights</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{content.psychologyInsights}</p>
        </Card>
      )}
    </div>
  );
}

/**
 * Renders market/commercial-specific narrative content
 */
export function CommercialNarrativePanel({ content }: { content: AgentSectionContent }) {
  return (
    <div className="space-y-4">
      <AgentNarrativePanel agentName="MarketAgent" content={content} />

      {content.comparableTitles && content.comparableTitles.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Comparable Titles</h4>
          <div className="space-y-2">
            {content.comparableTitles.map((ct, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="font-medium">{ct.title}</span>
                <span className="text-muted-foreground">— {ct.relevance}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {content.targetAudience && (
        <VerdictBox type="info" title="Target Audience" content={content.targetAudience} />
      )}

      {content.platformFit && (
        <VerdictBox type="info" title="Platform Fit" content={content.platformFit} />
      )}
    </div>
  );
}

/**
 * Renders production/execution-specific narrative content
 */
export function ProductionNarrativePanel({ content }: { content: AgentSectionContent }) {
  return (
    <div className="space-y-4">
      <AgentNarrativePanel agentName="ExecutionAgent" content={content} />

      {content.budgetTier && (
        <VerdictBox type="info" title="Budget Tier" content={content.budgetTier} />
      )}

      {content.productionComplexity && (
        <VerdictBox type="warning" title="Production Complexity" content={content.productionComplexity} />
      )}

      {content.talentRequirements && (
        <VerdictBox type="info" title="Talent Requirements" content={content.talentRequirements} />
      )}
    </div>
  );
}
