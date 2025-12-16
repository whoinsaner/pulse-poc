import { useState } from 'react';
import { ParameterScoreData, StakeholderLens, CATEGORY_COLORS } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { ParameterScoreCard } from './ParameterScoreCard';
import { CategoryRadarChart } from '@/components/charts/CategoryRadarChart';
import { CategoryBarChart } from '@/components/charts/CategoryBarChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { BarChart3, ChevronDown, ChevronUp, Radar } from 'lucide-react';

interface CategoryScoreSectionProps {
  categoryScores: Record<string, number>;
  parameterScores: ParameterScoreData[];
  activeLens: StakeholderLens;
}

export function CategoryScoreSection({
  categoryScores,
  parameterScores,
  activeLens,
}: CategoryScoreSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'radar' | 'bar'>('radar');

  const categories = Object.entries(categoryScores).sort(([, a], [, b]) => b - a);

  const getParametersForCategory = (category: string) => {
    return parameterScores.filter((p) => p.category === category);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Score Breakdown</h2>
        </div>
        
        {/* Chart toggle */}
        <Tabs value={chartView} onValueChange={(v) => setChartView(v as 'radar' | 'bar')}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="radar" className="gap-2">
              <Radar className="h-4 w-4" />
              <span className="hidden sm:inline">Radar</span>
            </TabsTrigger>
            <TabsTrigger value="bar" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Bar</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Charts Section */}
      <div className="mb-10 p-6 rounded-xl bg-card border border-border animate-fade-up">
        {chartView === 'radar' ? (
          <CategoryRadarChart categoryScores={categoryScores} />
        ) : (
          <CategoryBarChart categoryScores={categoryScores} horizontal />
        )}
      </div>

      {/* Category overview grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {categories.map(([category, score], index) => (
          <button
            key={category}
            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            className={cn(
              'p-4 rounded-xl text-left transition-all duration-300 animate-fade-up',
              'border hover:border-primary/30',
              expandedCategory === category
                ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                : 'bg-card border-border hover:bg-card/80'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] || 'hsl(var(--primary))' }}
                />
                <span className="font-medium">{category}</span>
              </div>
              <div className="flex items-center gap-2">
                <ScoreRing score={score} size="sm" showLabel={false} />
                {expandedCategory === category ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {getParametersForCategory(category).length} parameters analyzed
            </p>
          </button>
        ))}
      </div>

      {/* Expanded category details */}
      {expandedCategory && (
        <div className="animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{expandedCategory} Parameters</h3>
            <button
              onClick={() => setExpandedCategory(null)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getParametersForCategory(expandedCategory).map((param, index) => (
              <ParameterScoreCard
                key={param.parameterId}
                parameter={param}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* All parameters view when no category is expanded */}
      {!expandedCategory && parameterScores.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Top Scoring Parameters</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {parameterScores
              .sort((a, b) => b.score - a.score)
              .slice(0, 8)
              .map((param, index) => (
                <ParameterScoreCard
                  key={param.parameterId}
                  parameter={param}
                  index={index}
                  compact
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
