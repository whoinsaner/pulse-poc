import { useState, useMemo } from 'react';
import { SceneData, InsightData } from '@/types/database';
import { cn } from '@/lib/utils';
import { Sparkles, Eye, Repeat, TrendingUp, Layers, Target } from 'lucide-react';

interface ThemeMotifTrackerProps {
  scenes: SceneData[];
  insights: InsightData[];
}

interface ThemeData {
  name: string;
  category: 'theme' | 'symbol' | 'motif';
  occurrences: number;
  scenes: number[];
  description: string;
  strength: 'strong' | 'moderate' | 'emerging';
}

// Extract themes and motifs from scene data and insights
function extractThemesAndMotifs(scenes: SceneData[], insights: InsightData[]): ThemeData[] {
  const themes: ThemeData[] = [];
  
  // Common thematic elements to detect
  const themePatterns = [
    { pattern: /love|romance|heart|passion/i, name: 'Love & Romance', category: 'theme' as const },
    { pattern: /power|control|dominate|authority/i, name: 'Power & Control', category: 'theme' as const },
    { pattern: /family|parent|child|sibling|home/i, name: 'Family Bonds', category: 'theme' as const },
    { pattern: /death|mortality|dying|grave/i, name: 'Mortality', category: 'theme' as const },
    { pattern: /freedom|escape|liberation|cage/i, name: 'Freedom vs Captivity', category: 'theme' as const },
    { pattern: /truth|lie|deceit|honest|secret/i, name: 'Truth & Deception', category: 'theme' as const },
    { pattern: /revenge|vengeance|payback/i, name: 'Revenge', category: 'theme' as const },
    { pattern: /redemption|forgive|atone|save/i, name: 'Redemption', category: 'theme' as const },
  ];

  const symbolPatterns = [
    { pattern: /mirror|reflection|glass/i, name: 'Mirror/Reflection', category: 'symbol' as const },
    { pattern: /water|ocean|rain|river|flood/i, name: 'Water', category: 'symbol' as const },
    { pattern: /light|dark|shadow|sun|moon/i, name: 'Light & Darkness', category: 'symbol' as const },
    { pattern: /door|gate|threshold|window/i, name: 'Doorways/Thresholds', category: 'symbol' as const },
    { pattern: /clock|time|watch|hour/i, name: 'Time/Clocks', category: 'symbol' as const },
    { pattern: /fire|flame|burn|ash/i, name: 'Fire', category: 'symbol' as const },
    { pattern: /bird|cage|fly|wing/i, name: 'Birds & Flight', category: 'symbol' as const },
    { pattern: /blood|wound|scar/i, name: 'Blood/Wounds', category: 'symbol' as const },
  ];

  const motifPatterns = [
    { pattern: /phone|call|message|ring/i, name: 'Communication', category: 'motif' as const },
    { pattern: /journey|travel|road|path/i, name: 'The Journey', category: 'motif' as const },
    { pattern: /mask|disguise|hide|reveal/i, name: 'Masks & Identity', category: 'motif' as const },
    { pattern: /dream|nightmare|sleep|wake/i, name: 'Dreams', category: 'motif' as const },
    { pattern: /memory|remember|forget|past/i, name: 'Memory', category: 'motif' as const },
    { pattern: /color|red|blue|white|black/i, name: 'Color Symbolism', category: 'motif' as const },
  ];

  const allPatterns = [...themePatterns, ...symbolPatterns, ...motifPatterns];

  allPatterns.forEach(({ pattern, name, category }) => {
    const matchingScenes: number[] = [];
    let occurrences = 0;

    scenes.forEach(scene => {
      const text = `${scene.heading || ''} ${scene.description || ''} ${scene.emotionalTone || ''}`;
      const matches = text.match(pattern);
      if (matches) {
        matchingScenes.push(scene.sceneNumber);
        occurrences += matches.length;
      }
    });

    // Also check insights
    insights.forEach(insight => {
      const text = `${insight.title} ${insight.description}`;
      const matches = text.match(pattern);
      if (matches) {
        occurrences += matches.length;
      }
    });

    if (occurrences > 0) {
      themes.push({
        name,
        category,
        occurrences,
        scenes: matchingScenes,
        description: generateDescription(name, category, matchingScenes.length, scenes.length),
        strength: matchingScenes.length >= 5 ? 'strong' : matchingScenes.length >= 3 ? 'moderate' : 'emerging',
      });
    }
  });

  return themes.sort((a, b) => b.occurrences - a.occurrences);
}

function generateDescription(name: string, category: string, sceneCount: number, totalScenes: number): string {
  const percentage = ((sceneCount / totalScenes) * 100).toFixed(0);
  const coverage = sceneCount >= 5 ? 'recurring throughout' : sceneCount >= 3 ? 'appearing in key moments' : 'subtly present';
  return `${name} is ${coverage} the script, appearing in ${percentage}% of scenes.`;
}

export function ThemeMotifTracker({ scenes, insights }: ThemeMotifTrackerProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'theme' | 'symbol' | 'motif'>('all');
  const [selectedTheme, setSelectedTheme] = useState<ThemeData | null>(null);

  const themesData = useMemo(() => extractThemesAndMotifs(scenes, insights), [scenes, insights]);

  const filteredThemes = activeCategory === 'all' 
    ? themesData 
    : themesData.filter(t => t.category === activeCategory);

  const categoryStats = {
    themes: themesData.filter(t => t.category === 'theme').length,
    symbols: themesData.filter(t => t.category === 'symbol').length,
    motifs: themesData.filter(t => t.category === 'motif').length,
  };

  if (scenes.length === 0) {
    return (
      <section className="min-h-[400px] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="px-4 py-1.5 rounded-full bg-chart-5/10 text-chart-5 text-sm font-medium">
              Thematic Analysis
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
              Themes & Motifs
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-muted/30 border border-border">
            <Sparkles className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Thematic Data Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Theme and motif detection requires scene analysis. Run analysis to identify recurring symbols and thematic elements.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const getCategoryIcon = (category: 'theme' | 'symbol' | 'motif') => {
    switch (category) {
      case 'theme': return Layers;
      case 'symbol': return Eye;
      case 'motif': return Repeat;
    }
  };

  const getCategoryColor = (category: 'theme' | 'symbol' | 'motif') => {
    switch (category) {
      case 'theme': return 'chart-4';
      case 'symbol': return 'chart-2';
      case 'motif': return 'chart-5';
    }
  };

  const getStrengthBadge = (strength: 'strong' | 'moderate' | 'emerging') => {
    switch (strength) {
      case 'strong': return { color: 'bg-success/10 text-success', label: 'Strong' };
      case 'moderate': return { color: 'bg-chart-4/10 text-chart-4', label: 'Moderate' };
      case 'emerging': return { color: 'bg-muted text-muted-foreground', label: 'Emerging' };
    }
  };

  return (
    <section className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-5/10 text-chart-5 text-sm font-medium">
            Thematic Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Themes & Motifs
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Recurring symbols, visual motifs, and thematic elements across {scenes.length} scenes
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <button
            onClick={() => setActiveCategory(activeCategory === 'theme' ? 'all' : 'theme')}
            className={cn(
              'p-5 rounded-xl border text-center transition-all',
              activeCategory === 'theme' 
                ? 'bg-chart-4/10 border-chart-4/50' 
                : 'bg-card border-border hover:border-chart-4/30'
            )}
          >
            <Layers className="h-8 w-8 text-chart-4 mx-auto mb-2" />
            <p className="text-3xl font-bold">{categoryStats.themes}</p>
            <p className="text-sm text-muted-foreground">Themes</p>
          </button>
          <button
            onClick={() => setActiveCategory(activeCategory === 'symbol' ? 'all' : 'symbol')}
            className={cn(
              'p-5 rounded-xl border text-center transition-all',
              activeCategory === 'symbol' 
                ? 'bg-chart-2/10 border-chart-2/50' 
                : 'bg-card border-border hover:border-chart-2/30'
            )}
          >
            <Eye className="h-8 w-8 text-chart-2 mx-auto mb-2" />
            <p className="text-3xl font-bold">{categoryStats.symbols}</p>
            <p className="text-sm text-muted-foreground">Symbols</p>
          </button>
          <button
            onClick={() => setActiveCategory(activeCategory === 'motif' ? 'all' : 'motif')}
            className={cn(
              'p-5 rounded-xl border text-center transition-all',
              activeCategory === 'motif' 
                ? 'bg-chart-5/10 border-chart-5/50' 
                : 'bg-card border-border hover:border-chart-5/30'
            )}
          >
            <Repeat className="h-8 w-8 text-chart-5 mx-auto mb-2" />
            <p className="text-3xl font-bold">{categoryStats.motifs}</p>
            <p className="text-sm text-muted-foreground">Motifs</p>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Theme list */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Detected Elements
              </h3>

              {filteredThemes.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No thematic elements detected in this category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredThemes.map((theme, index) => {
                    const Icon = getCategoryIcon(theme.category);
                    const color = getCategoryColor(theme.category);
                    const strengthBadge = getStrengthBadge(theme.strength);
                    const isSelected = selectedTheme?.name === theme.name;

                    return (
                      <button
                        key={theme.name}
                        onClick={() => setSelectedTheme(isSelected ? null : theme)}
                        className={cn(
                          'w-full p-4 rounded-xl text-left transition-all',
                          isSelected 
                            ? `bg-${color}/10 border-2 border-${color}/50`
                            : 'bg-muted/30 border border-border hover:border-primary/30'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', `bg-${color}/10`)}>
                              <Icon className={cn('h-5 w-5', `text-${color}`)} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{theme.name}</h4>
                              <p className="text-sm text-muted-foreground capitalize">{theme.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={cn('px-2 py-1 rounded text-xs font-medium', strengthBadge.color)}>
                              {strengthBadge.label}
                            </span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {theme.scenes.length} scenes
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mt-4 pt-4 border-t border-border animate-fade-up">
                            <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>
                            
                            {/* Scene timeline */}
                            <div className="flex gap-1 h-8">
                              {Array.from({ length: scenes.length }).map((_, i) => {
                                const sceneNum = i + 1;
                                const isPresent = theme.scenes.includes(sceneNum);
                                return (
                                  <div
                                    key={i}
                                    className={cn(
                                      'flex-1 rounded transition-all',
                                      isPresent 
                                        ? `bg-${color}` 
                                        : 'bg-muted/50'
                                    )}
                                    title={`Scene ${sceneNum}${isPresent ? ' - Present' : ''}`}
                                  />
                                );
                              })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Presence across script timeline
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Thematic density chart */}
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h4 className="font-semibold mb-4">Thematic Density</h4>
              <div className="space-y-3">
                {themesData.slice(0, 8).map((theme, i) => {
                  const maxOccurrences = themesData[0]?.occurrences || 1;
                  const width = (theme.occurrences / maxOccurrences) * 100;
                  const color = getCategoryColor(theme.category);
                  
                  return (
                    <div key={theme.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="truncate">{theme.name}</span>
                        <span className="text-muted-foreground">{theme.occurrences}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full transition-all duration-500', `bg-${color}`)}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <h4 className="font-semibold mb-4">Analysis Summary</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Elements</span>
                  <span className="font-medium">{themesData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strong Themes</span>
                  <span className="font-medium text-success">
                    {themesData.filter(t => t.strength === 'strong').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Occurrences</span>
                  <span className="font-medium">
                    {(themesData.reduce((a, t) => a + t.occurrences, 0) / themesData.length || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scene Coverage</span>
                  <span className="font-medium">
                    {((new Set(themesData.flatMap(t => t.scenes)).size / scenes.length) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
