import { useState } from 'react';
import { SceneData } from '@/types/database';
import { cn } from '@/lib/utils';
import { Flame, MessageSquare, Zap, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SceneHeatmapProps {
  scenes: SceneData[];
}

type MetricType = 'emotional' | 'dialogue' | 'action';

const METRICS: { id: MetricType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'emotional', label: 'Emotional Intensity', icon: Flame, color: 'chart-4' },
  { id: 'dialogue', label: 'Dialogue Density', icon: MessageSquare, color: 'chart-2' },
  { id: 'action', label: 'Action Level', icon: Zap, color: 'chart-3' },
];

// Estimate metrics from scene data
function estimateMetrics(scene: SceneData) {
  const tone = scene.emotionalTone?.toLowerCase() || '';
  
  // Emotional intensity based on tone keywords
  let emotional = 50;
  if (tone.includes('intense') || tone.includes('dramatic') || tone.includes('tense')) emotional = 90;
  else if (tone.includes('emotional') || tone.includes('passionate') || tone.includes('angry')) emotional = 80;
  else if (tone.includes('sad') || tone.includes('melancholy') || tone.includes('fear')) emotional = 70;
  else if (tone.includes('happy') || tone.includes('joyful') || tone.includes('excited')) emotional = 65;
  else if (tone.includes('calm') || tone.includes('peaceful') || tone.includes('quiet')) emotional = 30;
  else if (tone.includes('neutral') || tone.includes('mundane')) emotional = 20;
  
  // Dialogue density based on description keywords
  const desc = scene.description?.toLowerCase() || '';
  let dialogue = 50;
  if (desc.includes('conversation') || desc.includes('argument') || desc.includes('discuss')) dialogue = 85;
  else if (desc.includes('talk') || desc.includes('speak') || desc.includes('say')) dialogue = 70;
  else if (desc.includes('silent') || desc.includes('quiet') || desc.includes('alone')) dialogue = 20;
  
  // Action level based on location and description
  const heading = scene.heading?.toLowerCase() || '';
  let action = 50;
  if (desc.includes('fight') || desc.includes('chase') || desc.includes('run') || desc.includes('escape')) action = 95;
  else if (desc.includes('action') || desc.includes('explosion') || desc.includes('crash')) action = 90;
  else if (heading.includes('ext') && (desc.includes('car') || desc.includes('street'))) action = 70;
  else if (heading.includes('int') && (desc.includes('office') || desc.includes('room'))) action = 30;
  
  return { emotional, dialogue, action };
}

export function SceneHeatmap({ scenes }: SceneHeatmapProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('emotional');
  const [hoveredScene, setHoveredScene] = useState<number | null>(null);

  if (!scenes || scenes.length === 0) {
    return (
      <section className="min-h-[400px] py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="px-4 py-1.5 rounded-full bg-chart-4/10 text-chart-4 text-sm font-medium">
              Visual Analysis
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
              Scene Heatmap
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-muted/30 border border-border">
            <Flame className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Scene Data Available</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Scene data hasn't been parsed yet. Upload a script and run analysis to visualize scene intensity.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const sortedScenes = [...scenes].sort((a, b) => a.sceneNumber - b.sceneNumber);
  const sceneMetrics = sortedScenes.map(s => ({ scene: s, metrics: estimateMetrics(s) }));

  const getIntensityColor = (value: number, metric: MetricType) => {
    const intensity = Math.floor(value / 20); // 0-4 levels
    const colorMap: Record<MetricType, string[]> = {
      emotional: [
        'bg-chart-4/10',
        'bg-chart-4/30',
        'bg-chart-4/50',
        'bg-chart-4/70',
        'bg-chart-4/90',
      ],
      dialogue: [
        'bg-chart-2/10',
        'bg-chart-2/30',
        'bg-chart-2/50',
        'bg-chart-2/70',
        'bg-chart-2/90',
      ],
      action: [
        'bg-chart-3/10',
        'bg-chart-3/30',
        'bg-chart-3/50',
        'bg-chart-3/70',
        'bg-chart-3/90',
      ],
    };
    return colorMap[metric][Math.min(intensity, 4)];
  };

  // Calculate act boundaries (roughly 3-act structure)
  const totalScenes = sortedScenes.length;
  const act1End = Math.floor(totalScenes * 0.25);
  const act2End = Math.floor(totalScenes * 0.75);

  return (
    <section className="min-h-screen py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-4/10 text-chart-4 text-sm font-medium">
            Visual Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Scene Heatmap
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Visualize {scenes.length} scenes by emotional intensity, dialogue, and action
          </p>
        </div>

        {/* Metric selector */}
        <div className="flex justify-center gap-4 mb-12">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            const isActive = activeMetric === metric.id;
            return (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                  isActive
                    ? `bg-${metric.color}/20 text-${metric.color} border-2 border-${metric.color}/50`
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{metric.label}</span>
              </button>
            );
          })}
        </div>

        {/* Act labels */}
        <div className="flex mb-4 px-2">
          <div className="flex-1 text-center">
            <span className="text-sm font-medium text-muted-foreground">Act 1 - Setup</span>
          </div>
          <div className="flex-[2] text-center">
            <span className="text-sm font-medium text-muted-foreground">Act 2 - Confrontation</span>
          </div>
          <div className="flex-1 text-center">
            <span className="text-sm font-medium text-muted-foreground">Act 3 - Resolution</span>
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <TooltipProvider>
            <div className="flex flex-wrap gap-1">
              {sceneMetrics.map(({ scene, metrics }, index) => {
                const value = metrics[activeMetric];
                const isActBreak = index === act1End || index === act2End;
                
                return (
                  <Tooltip key={scene.sceneNumber}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'relative w-8 h-12 sm:w-10 sm:h-14 rounded cursor-pointer transition-all duration-200',
                          getIntensityColor(value, activeMetric),
                          hoveredScene === scene.sceneNumber && 'ring-2 ring-primary scale-110 z-10',
                          isActBreak && 'ml-4'
                        )}
                        onMouseEnter={() => setHoveredScene(scene.sceneNumber)}
                        onMouseLeave={() => setHoveredScene(null)}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium opacity-60">
                          {scene.sceneNumber}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-semibold">Scene {scene.sceneNumber}</p>
                        <p className="text-xs text-muted-foreground truncate">{scene.heading}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <Flame className="h-3 w-3 mx-auto mb-1 text-chart-4" />
                            <p className="font-medium">{metrics.emotional}%</p>
                          </div>
                          <div className="text-center">
                            <MessageSquare className="h-3 w-3 mx-auto mb-1 text-chart-2" />
                            <p className="font-medium">{metrics.dialogue}%</p>
                          </div>
                          <div className="text-center">
                            <Zap className="h-3 w-3 mx-auto mb-1 text-chart-3" />
                            <p className="font-medium">{metrics.action}%</p>
                          </div>
                        </div>
                        {scene.emotionalTone && (
                          <p className="text-xs italic">Tone: {scene.emotionalTone}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>

          {/* Legend */}
          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex gap-0.5">
                {[10, 30, 50, 70, 90].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      'w-6 h-4 rounded-sm',
                      getIntensityColor(level, activeMetric)
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {METRICS.map((metric) => {
            const values = sceneMetrics.map(s => s.metrics[metric.id]);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const max = Math.max(...values);
            const maxScene = sceneMetrics.find(s => s.metrics[metric.id] === max);
            const Icon = metric.icon;
            
            return (
              <div key={metric.id} className={cn(
                'p-6 rounded-xl border',
                `bg-${metric.color}/5 border-${metric.color}/20`
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('p-2 rounded-lg', `bg-${metric.color}/10`)}>
                    <Icon className={cn('h-5 w-5', `text-${metric.color}`)} />
                  </div>
                  <h4 className="font-semibold">{metric.label}</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average</span>
                    <span className="font-medium">{avg.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Peak</span>
                    <span className="font-medium">{max}% (Scene {maxScene?.scene.sceneNumber})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
