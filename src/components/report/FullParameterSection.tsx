import { useState } from 'react';
import { ParameterScoreData, CATEGORY_COLORS } from '@/types/database';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, AlertTriangle, TrendingUp, Wrench, Sparkles, FileText } from 'lucide-react';
import { CategoryRadarChart } from '@/components/charts/CategoryRadarChart';
import { CategoryBarChart } from '@/components/charts/CategoryBarChart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FullParameterSectionProps {
  categoryScores: Record<string, number>;
  parameterScores: ParameterScoreData[];
}

export function FullParameterSection({ categoryScores, parameterScores }: FullParameterSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'radar' | 'bar'>('radar');

  const categories = Object.entries(categoryScores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  const getParametersForCategory = (category: string) => 
    parameterScores.filter(p => p.category === category);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-chart-3';
    if (score >= 50) return 'text-chart-4';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getMaturityBadge = (maturity?: string) => {
    switch (maturity) {
      case 'Strong': return { color: 'bg-success/10 text-success border-success/30', icon: Sparkles };
      case 'Developing': return { color: 'bg-chart-4/10 text-chart-4 border-chart-4/30', icon: TrendingUp };
      default: return { color: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle };
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'Low': return 'bg-success/10 text-success';
      case 'Medium': return 'bg-warning/10 text-warning';
      default: return 'bg-destructive/10 text-destructive';
    }
  };

  return (
    <section className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-2/10 text-chart-2 text-sm font-medium">
            Deep Dive
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Parameter Scoring
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Detailed breakdown of {parameterScores.length} parameters across {categories.length} categories
          </p>
        </div>

        {/* Chart section */}
        <div className="mb-16">
          <div className="flex justify-center mb-8">
            <Tabs value={chartView} onValueChange={(v) => setChartView(v as 'radar' | 'bar')}>
              <TabsList>
                <TabsTrigger value="radar">Radar View</TabsTrigger>
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="p-8 rounded-2xl bg-card border border-border">
            {chartView === 'radar' ? (
              <CategoryRadarChart categoryScores={categoryScores} />
            ) : (
              <CategoryBarChart categoryScores={categoryScores} />
            )}
          </div>
        </div>

        {/* Categories accordion */}
        <div className="space-y-4">
          {categories.map((category, index) => {
            const parameters = getParametersForCategory(category.name);
            const isExpanded = expandedCategory === category.name;
            const scoreNormalized = category.score / 10;
            
            return (
              <div
                key={category.name}
                className={cn(
                  'rounded-2xl border bg-card overflow-hidden transition-all duration-300',
                  isExpanded ? 'border-primary/50 shadow-lg' : 'border-border'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Category header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-2 h-12 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[category.name] || 'hsl(var(--chart-1))' }}
                    />
                    <div className="text-left">
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {parameters.length} parameters
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Score display */}
                    <div className="text-right">
                      <p className={cn('text-3xl font-bold', getScoreColor(category.score))}>
                        {scoreNormalized.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">out of 10</p>
                    </div>
                    
                    {/* Score bar */}
                    <div className="w-24 h-3 rounded-full bg-muted overflow-hidden hidden sm:block">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          category.score >= 80 ? 'bg-success' :
                          category.score >= 60 ? 'bg-chart-3' :
                          category.score >= 50 ? 'bg-chart-4' :
                          category.score >= 40 ? 'bg-warning' : 'bg-destructive'
                        )}
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                    
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded parameters */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4 animate-fade-up">
                    <div className="h-px bg-border mb-6" />
                    
                    {parameters.map((param, pIndex) => {
                      const maturityBadge = getMaturityBadge(param.maturity);
                      const MaturityIcon = maturityBadge.icon;
                      
                      return (
                        <div
                          key={param.parameterId}
                          className="p-5 rounded-xl bg-muted/30 border border-border/50 animate-fade-up"
                          style={{ animationDelay: `${pIndex * 30}ms` }}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                            {/* Parameter info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{param.displayName}</h4>
                                <span className={cn(
                                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                                  maturityBadge.color
                                )}>
                                  <MaturityIcon className="h-3 w-3 inline mr-1" />
                                  {param.maturity || 'Developing'}
                                </span>
                              </div>
                              
                              {param.rationale && (
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                  {param.rationale}
                                </p>
                              )}

                              {/* Metrics row */}
                              <div className="flex flex-wrap gap-3">
                                <span className={cn(
                                  'px-2 py-1 rounded text-xs font-medium',
                                  getRiskBadge(param.riskLevel)
                                )}>
                                  Risk: {param.riskLevel || 'Medium'}
                                </span>
                                {param.fixCost && (
                                  <span className="px-2 py-1 rounded bg-muted text-xs font-medium flex items-center gap-1">
                                    <Wrench className="h-3 w-3" />
                                    Fix Cost: {param.fixCost}
                                  </span>
                                )}
                                {param.upsideImpact && (
                                  <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Upside: {param.upsideImpact}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className={cn('text-2xl font-bold', getScoreColor(param.score))}>
                                  {(param.score / 10).toFixed(1)}
                                </p>
                                <p className="text-xs text-muted-foreground">Score</p>
                              </div>
                              <div className="w-16 h-16 relative">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="15.91549430918954"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="text-muted"
                                  />
                                  <circle
                                    cx="18"
                                    cy="18"
                                    r="15.91549430918954"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={`${param.score} 100`}
                                    className={getScoreColor(param.score)}
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Evidence section */}
                          {param.evidence && param.evidence.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Supporting Evidence
                              </p>
                              <div className="space-y-2">
                                {param.evidence.slice(0, 2).map((ev, i) => (
                                  <div key={i} className="text-sm p-2 rounded bg-background/50">
                                    {ev.quote && (
                                      <p className="italic text-muted-foreground mb-1">"{ev.quote}"</p>
                                    )}
                                    <p className="text-xs">{ev.explanation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
