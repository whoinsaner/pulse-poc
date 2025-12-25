import { useState } from 'react';
import { InsightData } from '@/types/database';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Lightbulb, 
  Target, 
  TrendingUp,
  Zap,
  AlertTriangle,
  Wrench,
  ChevronRight,
  Sparkles,
  Users,
  FileText,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface EnhancedInsightsSectionProps {
  insights: InsightData[];
}

interface ParsedEvidence {
  minimalFix?: string;
  maximalFix?: string;
  affectedStakeholders?: string[];
  evidence?: Array<{
    type?: string;
    reference?: string;
    quote?: string;
    explanation?: string;
  }>;
}

// Parse the supportingEvidence which may have nested structure
function parseEvidence(supporting: any): ParsedEvidence {
  if (!supporting) return {};
  
  // Handle array format
  if (Array.isArray(supporting)) {
    return { evidence: supporting };
  }
  
  // Handle object with evidence array and fix recommendations
  return {
    minimalFix: supporting.minimalFix,
    maximalFix: supporting.maximalFix,
    affectedStakeholders: supporting.affectedStakeholders,
    evidence: supporting.evidence || []
  };
}

// Get category icon and color
function getCategoryConfig(category: string) {
  const configs: Record<string, { icon: typeof Lightbulb; color: string; bg: string }> = {
    'Theme': { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    'Conflict': { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    'Character': { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'Character Arc': { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    'Market': { icon: Target, color: 'text-green-500', bg: 'bg-green-500/10' },
    'Structure': { icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    'Dialogue': { icon: FileText, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    'Emotional Arc': { icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    'World & Logic': { icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    'Execution': { icon: Wrench, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    'Concept & Hook': { icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    'strength': { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    'weakness': { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    'opportunity': { icon: Lightbulb, color: 'text-chart-2', bg: 'bg-chart-2/10' },
  };
  return configs[category] || { icon: Target, color: 'text-muted-foreground', bg: 'bg-muted' };
}

export function EnhancedInsightsSection({ insights }: EnhancedInsightsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group insights by category
  const categories = [...new Set(insights.map(i => i.category))].sort();
  
  // Filter by priority (1-2 = high, 3 = medium, 4-5 = low)
  const highPriority = insights.filter(i => i.priority <= 2);
  const mediumPriority = insights.filter(i => i.priority === 3);
  const lowPriority = insights.filter(i => i.priority >= 4);

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(i => i.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{insights.length}</div>
            <p className="text-sm text-muted-foreground">Total Insights</p>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success">{highPriority.length}</div>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-warning">{mediumPriority.length}</div>
            <p className="text-sm text-muted-foreground">Medium Priority</p>
          </CardContent>
        </Card>
        <Card className="bg-chart-2/5 border-chart-2/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-chart-2">{insights.filter(i => i.actionable).length}</div>
            <p className="text-sm text-muted-foreground">Actionable</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>
              All ({insights.length})
            </TabsTrigger>
            {categories.map(cat => {
              const config = getCategoryConfig(cat);
              const count = insights.filter(i => i.category === cat).length;
              return (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="gap-1"
                >
                  <config.icon className={cn("h-3.5 w-3.5", config.color)} />
                  {cat} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <InsightsGrid insights={filteredInsights} />
        </TabsContent>
        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-0">
            <InsightsGrid insights={insights.filter(i => i.category === cat)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function InsightsGrid({ insights }: { insights: InsightData[] }) {
  // Sort by priority
  const sorted = [...insights].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-4">
      {sorted.map((insight, index) => (
        <InsightCard key={index} insight={insight} index={index} />
      ))}
      {sorted.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No insights in this category</p>
        </Card>
      )}
    </div>
  );
}

function InsightCard({ insight, index }: { insight: InsightData; index: number }) {
  const config = getCategoryConfig(insight.category);
  const Icon = config.icon;
  const parsed = parseEvidence(insight.supportingEvidence);

  const getPriorityBadge = (priority: number) => {
    if (priority <= 2) return { label: 'High Priority', variant: 'bg-success/10 text-success border-success/30' };
    if (priority === 3) return { label: 'Medium', variant: 'bg-warning/10 text-warning border-warning/30' };
    return { label: 'Low', variant: 'bg-muted text-muted-foreground border-border' };
  };

  const priorityBadge = getPriorityBadge(insight.priority);

  return (
    <Card className="overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="item" className="border-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-start gap-4 text-left w-full">
              {/* Priority number */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0",
                insight.priority <= 2 ? "bg-success/10 text-success" : 
                insight.priority === 3 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className={cn("gap-1", config.bg, config.color)}>
                    <Icon className="h-3 w-3" />
                    {insight.category}
                  </Badge>
                  <Badge variant="outline" className={priorityBadge.variant}>
                    {priorityBadge.label}
                  </Badge>
                  {insight.actionable && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      <Zap className="h-3 w-3 mr-1" />
                      Actionable
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-base">{insight.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {insight.description}
                </p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6 pt-4 border-t">
              {/* Full Description */}
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2">Full Analysis</h5>
                <p className="text-sm">{insight.description}</p>
              </div>

              {/* Fix Recommendations */}
              {(parsed.minimalFix || parsed.maximalFix) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {parsed.minimalFix && (
                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium text-sm text-emerald-600">Quick Fix</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{parsed.minimalFix}</p>
                    </div>
                  )}
                  {parsed.maximalFix && (
                    <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm text-blue-600">Full Solution</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{parsed.maximalFix}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Affected Stakeholders */}
              {parsed.affectedStakeholders && parsed.affectedStakeholders.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Affected Stakeholders
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {parsed.affectedStakeholders.map((s, i) => (
                      <Badge key={i} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence */}
              {parsed.evidence && parsed.evidence.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Supporting Evidence
                  </h5>
                  <div className="space-y-3">
                    {parsed.evidence.map((ev, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          {ev.type && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {ev.type.replace(/_/g, ' ')}
                            </Badge>
                          )}
                          {ev.reference && (
                            <span className="text-xs text-muted-foreground">{ev.reference}</span>
                          )}
                        </div>
                        {ev.quote && (
                          <blockquote className="text-sm italic border-l-2 border-primary/50 pl-3 mb-2 text-muted-foreground">
                            "{ev.quote}"
                          </blockquote>
                        )}
                        {ev.explanation && (
                          <p className="text-sm">{ev.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
