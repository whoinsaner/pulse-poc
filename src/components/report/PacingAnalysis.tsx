import { useState, useMemo } from 'react';
import { SceneData } from '@/types/database';
import { cn } from '@/lib/utils';
import { Timer, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PacingAnalysisProps {
  scenes: SceneData[];
  totalPages?: number;
}

type ViewMode = 'rhythm' | 'distribution' | 'flow';

// Estimate scene duration based on page range
function estimateSceneDuration(scene: SceneData): number {
  const pageStart = scene.pageStart || scene.sceneNumber;
  const pageEnd = scene.pageEnd || pageStart + 1;
  return Math.max(0.5, pageEnd - pageStart);
}

// Categorize scene pace
function getScenePace(duration: number, avgDuration: number): 'fast' | 'medium' | 'slow' {
  if (duration < avgDuration * 0.6) return 'fast';
  if (duration > avgDuration * 1.4) return 'slow';
  return 'medium';
}

export function PacingAnalysis({ scenes, totalPages }: PacingAnalysisProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('rhythm');
  const [hoveredScene, setHoveredScene] = useState<number | null>(null);

  const analysisData = useMemo(() => {
    if (!scenes || scenes.length === 0) return null;

    const sortedScenes = [...scenes].sort((a, b) => a.sceneNumber - b.sceneNumber);
    const durations = sortedScenes.map(estimateSceneDuration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    const scenesWithPace = sortedScenes.map((scene, i) => ({
      scene,
      duration: durations[i],
      pace: getScenePace(durations[i], avgDuration),
      position: i / sortedScenes.length, // 0 to 1
    }));

    // Calculate act boundaries
    const act1End = Math.floor(sortedScenes.length * 0.25);
    const act2End = Math.floor(sortedScenes.length * 0.75);

    // Pace distribution
    const paceDistribution = {
      fast: scenesWithPace.filter(s => s.pace === 'fast').length,
      medium: scenesWithPace.filter(s => s.pace === 'medium').length,
      slow: scenesWithPace.filter(s => s.pace === 'slow').length,
    };

    // Duration buckets for histogram
    const bucketSize = (maxDuration - minDuration) / 6 || 1;
    const histogram = Array(6).fill(0).map((_, i) => ({
      min: minDuration + i * bucketSize,
      max: minDuration + (i + 1) * bucketSize,
      count: 0,
    }));
    durations.forEach(d => {
      const bucketIndex = Math.min(5, Math.floor((d - minDuration) / bucketSize));
      histogram[bucketIndex].count++;
    });

    return {
      scenes: scenesWithPace,
      avgDuration,
      maxDuration,
      minDuration,
      act1End,
      act2End,
      paceDistribution,
      histogram,
      totalDuration: durations.reduce((a, b) => a + b, 0),
    };
  }, [scenes]);

  if (!analysisData || scenes.length === 0) {
    return null;
  }

  const getPaceColor = (pace: 'fast' | 'medium' | 'slow') => {
    switch (pace) {
      case 'fast': return { bg: 'bg-chart-4', text: 'text-chart-4', border: 'border-chart-4' };
      case 'medium': return { bg: 'bg-chart-2', text: 'text-chart-2', border: 'border-chart-2' };
      case 'slow': return { bg: 'bg-chart-5', text: 'text-chart-5', border: 'border-chart-5' };
    }
  };

  return (
    <section className="min-h-screen py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-3/10 text-chart-3 text-sm font-medium">
            Rhythm Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Script Pacing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scene duration and rhythm patterns across {scenes.length} scenes
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <Timer className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold">{analysisData.avgDuration.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Avg Pages/Scene</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <Activity className="h-8 w-8 text-chart-4 mx-auto mb-2" />
            <p className="text-3xl font-bold">{analysisData.paceDistribution.fast}</p>
            <p className="text-sm text-muted-foreground">Fast Scenes</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <BarChart2 className="h-8 w-8 text-chart-2 mx-auto mb-2" />
            <p className="text-3xl font-bold">{analysisData.paceDistribution.medium}</p>
            <p className="text-sm text-muted-foreground">Medium Scenes</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border text-center">
            <TrendingUp className="h-8 w-8 text-chart-5 mx-auto mb-2" />
            <p className="text-3xl font-bold">{analysisData.paceDistribution.slow}</p>
            <p className="text-sm text-muted-foreground">Slow Scenes</p>
          </div>
        </div>

        {/* View mode tabs */}
        <div className="flex justify-center mb-12">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="rhythm">Rhythm Timeline</TabsTrigger>
              <TabsTrigger value="distribution">Duration Distribution</TabsTrigger>
              <TabsTrigger value="flow">Pacing Flow</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main visualization */}
        <div className="p-8 rounded-2xl bg-card border border-border">
          {viewMode === 'rhythm' && (
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-chart-3" />
                Scene Rhythm Timeline
              </h3>

              {/* Act labels */}
              <div className="flex mb-4">
                <div style={{ width: '25%' }} className="text-center">
                  <span className="text-sm font-medium text-muted-foreground">Act 1</span>
                </div>
                <div style={{ width: '50%' }} className="text-center">
                  <span className="text-sm font-medium text-muted-foreground">Act 2</span>
                </div>
                <div style={{ width: '25%' }} className="text-center">
                  <span className="text-sm font-medium text-muted-foreground">Act 3</span>
                </div>
              </div>

              {/* Rhythm bars */}
              <div className="relative h-48 flex gap-px">
                {analysisData.scenes.map(({ scene, duration, pace }, i) => {
                  const height = (duration / analysisData.maxDuration) * 100;
                  const colors = getPaceColor(pace);
                  const isActBreak = i === analysisData.act1End || i === analysisData.act2End;
                  
                  return (
                    <div
                      key={scene.sceneNumber}
                      className="flex-1 relative group flex flex-col justify-end"
                      onMouseEnter={() => setHoveredScene(scene.sceneNumber)}
                      onMouseLeave={() => setHoveredScene(null)}
                    >
                      {isActBreak && (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-border z-10" />
                      )}
                      <div
                        className={cn(
                          'w-full rounded-t transition-all duration-200',
                          colors.bg,
                          hoveredScene === scene.sceneNumber && 'opacity-100 scale-105',
                          hoveredScene && hoveredScene !== scene.sceneNumber && 'opacity-50'
                        )}
                        style={{ height: `${height}%` }}
                      />
                      
                      {/* Tooltip */}
                      {hoveredScene === scene.sceneNumber && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg bg-popover border border-border shadow-lg z-20 whitespace-nowrap">
                          <p className="font-semibold">Scene {scene.sceneNumber}</p>
                          <p className="text-sm text-muted-foreground">{duration.toFixed(1)} pages</p>
                          <p className={cn('text-sm font-medium capitalize', colors.text)}>{pace} pace</p>
                          {scene.heading && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                              {scene.heading}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* X-axis */}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Scene 1</span>
                <span>Scene {Math.floor(scenes.length / 2)}</span>
                <span>Scene {scenes.length}</span>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-4" />
                  <span className="text-sm text-muted-foreground">Fast (&lt;{(analysisData.avgDuration * 0.6).toFixed(1)} pages)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-2" />
                  <span className="text-sm text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-chart-5" />
                  <span className="text-sm text-muted-foreground">Slow (&gt;{(analysisData.avgDuration * 1.4).toFixed(1)} pages)</span>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'distribution' && (
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-chart-2" />
                Scene Duration Distribution
              </h3>

              {/* Histogram */}
              <div className="h-64 flex items-end justify-center gap-4">
                {analysisData.histogram.map((bucket, i) => {
                  const maxCount = Math.max(...analysisData.histogram.map(b => b.count));
                  const height = (bucket.count / maxCount) * 100;
                  
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 max-w-24">
                      <span className="text-sm font-medium mb-2">{bucket.count}</span>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-chart-2 to-chart-3 transition-all duration-500"
                        style={{ height: `${height}%`, minHeight: bucket.count > 0 ? '8px' : '0' }}
                      />
                      <div className="mt-2 text-center">
                        <p className="text-xs text-muted-foreground">
                          {bucket.min.toFixed(1)}-{bucket.max.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">pages</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-3xl font-bold text-chart-4">{analysisData.minDuration.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Shortest Scene</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{analysisData.avgDuration.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Average Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-chart-5">{analysisData.maxDuration.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Longest Scene</p>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'flow' && (
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-5" />
                Pacing Flow
              </h3>

              {/* Flow chart - area style */}
              <div className="relative h-48">
                <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                  {/* Background grid */}
                  <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area path */}
                  <path
                    d={`M 0,50 ${analysisData.scenes.map(({ duration }, i) => {
                      const x = (i / (analysisData.scenes.length - 1)) * 100;
                      const y = 50 - (duration / analysisData.maxDuration) * 45;
                      return `L ${x},${y}`;
                    }).join(' ')} L 100,50 Z`}
                    fill="url(#flowGradient)"
                  />
                  
                  {/* Line path */}
                  <path
                    d={`M ${analysisData.scenes.map(({ duration }, i) => {
                      const x = (i / (analysisData.scenes.length - 1)) * 100;
                      const y = 50 - (duration / analysisData.maxDuration) * 45;
                      return `${i === 0 ? '' : 'L '}${x},${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth="0.5"
                  />
                </svg>

                {/* Act markers */}
                <div 
                  className="absolute top-0 bottom-0 w-px bg-border"
                  style={{ left: '25%' }}
                />
                <div 
                  className="absolute top-0 bottom-0 w-px bg-border"
                  style={{ left: '75%' }}
                />
              </div>

              {/* Act labels */}
              <div className="flex mt-4">
                <div style={{ width: '25%' }} className="text-center border-r border-border">
                  <p className="font-medium">Act 1</p>
                  <p className="text-sm text-muted-foreground">Setup</p>
                </div>
                <div style={{ width: '50%' }} className="text-center border-r border-border">
                  <p className="font-medium">Act 2</p>
                  <p className="text-sm text-muted-foreground">Confrontation</p>
                </div>
                <div style={{ width: '25%' }} className="text-center">
                  <p className="font-medium">Act 3</p>
                  <p className="text-sm text-muted-foreground">Resolution</p>
                </div>
              </div>

              {/* Pacing insights */}
              <div className="mt-8 pt-6 border-t border-border grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium mb-1">Opening Pace</p>
                  <p className="text-2xl font-bold capitalize">
                    {analysisData.scenes.slice(0, 5).filter(s => s.pace === 'fast').length > 2 ? 'Fast' : 'Measured'}
                  </p>
                  <p className="text-xs text-muted-foreground">First 5 scenes</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium mb-1">Midpoint Energy</p>
                  <p className="text-2xl font-bold capitalize">
                    {analysisData.scenes[Math.floor(analysisData.scenes.length / 2)]?.pace || 'Medium'}
                  </p>
                  <p className="text-xs text-muted-foreground">Central scene pace</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium mb-1">Climax Build</p>
                  <p className="text-2xl font-bold capitalize">
                    {analysisData.scenes.slice(-5).filter(s => s.pace === 'fast').length > 2 ? 'Intense' : 'Steady'}
                  </p>
                  <p className="text-xs text-muted-foreground">Final 5 scenes</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
