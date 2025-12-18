import { useState, useMemo } from 'react';
import { SceneData, NarrativeGraphData } from '@/types/database';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Flag, 
  Zap, 
  Target, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Info,
  X,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NarrativeTimelineProps {
  scenes: SceneData[];
  narrativeGraph?: NarrativeGraphData;
  totalPages?: number;
}

interface StoryBeat {
  id: string;
  type: 'setup' | 'catalyst' | 'midpoint' | 'crisis' | 'climax' | 'resolution' | 'scene';
  label: string;
  description?: string;
  position: number; // 0-100 percentage
  sceneNumber?: number;
  emotionalTone?: string;
  act: 1 | 2 | 3;
}

const BEAT_CONFIG = {
  setup: { icon: Play, color: 'chart-2', label: 'Setup' },
  catalyst: { icon: Zap, color: 'chart-4', label: 'Catalyst' },
  midpoint: { icon: Target, color: 'primary', label: 'Midpoint' },
  crisis: { icon: TrendingDown, color: 'warning', label: 'Crisis' },
  climax: { icon: Star, color: 'destructive', label: 'Climax' },
  resolution: { icon: Flag, color: 'success', label: 'Resolution' },
  scene: { icon: Minus, color: 'muted-foreground', label: 'Scene' },
};

const EMOTIONAL_COLORS: Record<string, string> = {
  tense: 'bg-destructive/60',
  suspenseful: 'bg-warning/60',
  exciting: 'bg-chart-4/60',
  romantic: 'bg-chart-5/60',
  comedic: 'bg-chart-3/60',
  dramatic: 'bg-primary/60',
  melancholic: 'bg-chart-2/60',
  hopeful: 'bg-success/60',
  neutral: 'bg-muted/60',
};

export function NarrativeTimeline({ scenes, narrativeGraph, totalPages }: NarrativeTimelineProps) {
  const [selectedBeat, setSelectedBeat] = useState<StoryBeat | null>(null);
  const [hoveredBeat, setHoveredBeat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'emotional'>('timeline');

  // Generate story beats from scenes
  const storyBeats = useMemo(() => {
    if (!scenes.length) return [];

    const totalScenes = scenes.length;
    const beats: StoryBeat[] = [];

    // Determine act boundaries (classic 25-50-25 split)
    const act1End = Math.floor(totalScenes * 0.25);
    const act2End = Math.floor(totalScenes * 0.75);

    // Add key structural beats
    beats.push({
      id: 'opening',
      type: 'setup',
      label: 'Opening Image',
      description: 'The world before the journey begins',
      position: 0,
      sceneNumber: 1,
      act: 1,
    });

    // Catalyst (around 10-12%)
    const catalystScene = Math.floor(totalScenes * 0.1);
    if (catalystScene > 0 && catalystScene < totalScenes) {
      beats.push({
        id: 'catalyst',
        type: 'catalyst',
        label: 'Inciting Incident',
        description: 'The event that sets the story in motion',
        position: 10,
        sceneNumber: catalystScene + 1,
        act: 1,
      });
    }

    // Break into Act 2 (around 25%)
    beats.push({
      id: 'act2-start',
      type: 'catalyst',
      label: 'Break into Act 2',
      description: 'The protagonist commits to the journey',
      position: 25,
      sceneNumber: act1End + 1,
      act: 2,
    });

    // Midpoint (50%)
    const midpointScene = Math.floor(totalScenes * 0.5);
    beats.push({
      id: 'midpoint',
      type: 'midpoint',
      label: 'Midpoint',
      description: 'Stakes are raised; false victory or defeat',
      position: 50,
      sceneNumber: midpointScene + 1,
      act: 2,
    });

    // All Is Lost (around 75%)
    beats.push({
      id: 'crisis',
      type: 'crisis',
      label: 'All Is Lost',
      description: 'The darkest moment before the climax',
      position: 75,
      sceneNumber: act2End + 1,
      act: 3,
    });

    // Climax (around 85-90%)
    const climaxScene = Math.floor(totalScenes * 0.85);
    beats.push({
      id: 'climax',
      type: 'climax',
      label: 'Climax',
      description: 'The final confrontation',
      position: 85,
      sceneNumber: climaxScene + 1,
      act: 3,
    });

    // Resolution
    beats.push({
      id: 'resolution',
      type: 'resolution',
      label: 'Resolution',
      description: 'The new equilibrium',
      position: 95,
      sceneNumber: totalScenes,
      act: 3,
    });

    // Add scene markers
    scenes.forEach((scene, index) => {
      const position = (index / (totalScenes - 1)) * 100;
      const act = position <= 25 ? 1 : position <= 75 ? 2 : 3;
      
      beats.push({
        id: `scene-${scene.sceneNumber}`,
        type: 'scene',
        label: `Scene ${scene.sceneNumber}`,
        description: scene.heading || scene.description,
        position,
        sceneNumber: scene.sceneNumber,
        emotionalTone: scene.emotionalTone,
        act: act as 1 | 2 | 3,
      });
    });

    return beats.sort((a, b) => a.position - b.position);
  }, [scenes]);

  // Calculate emotional arc data
  const emotionalArc = useMemo(() => {
    return scenes.map((scene, index) => ({
      position: (index / (scenes.length - 1)) * 100,
      tone: scene.emotionalTone || 'neutral',
      sceneNumber: scene.sceneNumber,
      intensity: getEmotionalIntensity(scene.emotionalTone),
    }));
  }, [scenes]);

  function getEmotionalIntensity(tone?: string): number {
    const intensities: Record<string, number> = {
      tense: 90,
      suspenseful: 80,
      exciting: 85,
      dramatic: 75,
      romantic: 60,
      melancholic: 55,
      comedic: 50,
      hopeful: 65,
      neutral: 40,
    };
    return intensities[tone?.toLowerCase() || 'neutral'] || 50;
  }

  const keyBeats = storyBeats.filter(b => b.type !== 'scene');

  if (!scenes.length) {
    return (
      <div className="p-8 rounded-xl bg-muted/30 text-center">
        <p className="text-muted-foreground">No scene data available for narrative timeline</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-1/10 text-chart-1 text-sm font-medium">
            Story Structure
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Narrative Flow
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive timeline showing {scenes.length} scenes across the three-act structure
          </p>
        </div>

        {/* View toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'timeline' 
                  ? 'bg-background shadow text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Structure View
            </button>
            <button
              onClick={() => setViewMode('emotional')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'emotional' 
                  ? 'bg-background shadow text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Emotional Arc
            </button>
          </div>
        </div>

        {/* Main timeline container */}
        <div className="relative p-8 rounded-2xl bg-card border border-border">
          {/* Act labels */}
          <div className="flex mb-8">
            <div className="w-1/4 text-center">
              <span className="px-4 py-2 rounded-full bg-chart-2/10 text-chart-2 text-sm font-semibold">
                Act I: Setup
              </span>
              <p className="text-xs text-muted-foreground mt-2">25% of story</p>
            </div>
            <div className="w-1/2 text-center">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                Act II: Confrontation
              </span>
              <p className="text-xs text-muted-foreground mt-2">50% of story</p>
            </div>
            <div className="w-1/4 text-center">
              <span className="px-4 py-2 rounded-full bg-chart-4/10 text-chart-4 text-sm font-semibold">
                Act III: Resolution
              </span>
              <p className="text-xs text-muted-foreground mt-2">25% of story</p>
            </div>
          </div>

          {/* Timeline track */}
          <div className="relative h-32">
            {/* Background track */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-muted overflow-hidden">
              {/* Act divisions */}
              <div className="absolute left-0 w-1/4 h-full bg-chart-2/20" />
              <div className="absolute left-1/4 w-1/2 h-full bg-primary/20" />
              <div className="absolute left-3/4 w-1/4 h-full bg-chart-4/20" />
            </div>

            {/* Act divider lines */}
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-border" />
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-border" />

            {viewMode === 'timeline' ? (
              <>
                {/* Key beat markers */}
                {keyBeats.map((beat) => {
                  const config = BEAT_CONFIG[beat.type];
                  const Icon = config.icon;
                  const isHovered = hoveredBeat === beat.id;
                  const isSelected = selectedBeat?.id === beat.id;

                  return (
                    <button
                      key={beat.id}
                      onClick={() => setSelectedBeat(beat)}
                      onMouseEnter={() => setHoveredBeat(beat.id)}
                      onMouseLeave={() => setHoveredBeat(null)}
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        'border-2 transition-all duration-200 z-10',
                        `bg-${config.color}/20 border-${config.color}`,
                        (isHovered || isSelected) && 'scale-125 shadow-lg',
                        isSelected && 'ring-2 ring-offset-2 ring-offset-card ring-primary'
                      )}
                      style={{ left: `${beat.position}%` }}
                    >
                      <Icon className={cn('h-5 w-5', `text-${config.color}`)} />
                    </button>
                  );
                })}

                {/* Scene dots (smaller) */}
                {storyBeats.filter(b => b.type === 'scene').map((beat) => {
                  const toneColor = EMOTIONAL_COLORS[beat.emotionalTone?.toLowerCase() || 'neutral'] || EMOTIONAL_COLORS.neutral;
                  
                  return (
                    <button
                      key={beat.id}
                      onClick={() => setSelectedBeat(beat)}
                      onMouseEnter={() => setHoveredBeat(beat.id)}
                      onMouseLeave={() => setHoveredBeat(null)}
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
                        'w-3 h-3 rounded-full transition-all duration-200',
                        toneColor,
                        'hover:scale-150 hover:z-20',
                        hoveredBeat === beat.id && 'scale-150 z-20'
                      )}
                      style={{ left: `${beat.position}%` }}
                    />
                  );
                })}
              </>
            ) : (
              /* Emotional arc visualization */
              <svg className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="emotionalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                
                {/* Area fill */}
                <path
                  d={generateArcPath(emotionalArc, 128)}
                  fill="url(#emotionalGradient)"
                  className="transition-all duration-500"
                />
                
                {/* Line */}
                <path
                  d={generateLinePath(emotionalArc, 128)}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />

                {/* Data points */}
                {emotionalArc.map((point, index) => (
                  <circle
                    key={index}
                    cx={`${point.position}%`}
                    cy={128 - (point.intensity / 100) * 100}
                    r="4"
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    className="cursor-pointer hover:r-6 transition-all"
                    onClick={() => {
                      const scene = scenes.find(s => s.sceneNumber === point.sceneNumber);
                      if (scene) {
                        setSelectedBeat({
                          id: `scene-${point.sceneNumber}`,
                          type: 'scene',
                          label: `Scene ${point.sceneNumber}`,
                          description: scene.heading,
                          position: point.position,
                          sceneNumber: point.sceneNumber,
                          emotionalTone: point.tone,
                          act: point.position <= 25 ? 1 : point.position <= 75 ? 2 : 3,
                        });
                      }
                    }}
                  />
                ))}
              </svg>
            )}
          </div>

          {/* Beat labels row */}
          <div className="relative h-16 mt-4">
            {keyBeats.map((beat) => (
              <div
                key={beat.id}
                className={cn(
                  'absolute -translate-x-1/2 text-center transition-opacity',
                  hoveredBeat === beat.id || selectedBeat?.id === beat.id 
                    ? 'opacity-100' 
                    : 'opacity-60'
                )}
                style={{ left: `${beat.position}%` }}
              >
                <p className="text-xs font-medium">{beat.label}</p>
                {beat.sceneNumber && (
                  <p className="text-xs text-muted-foreground">Scene {beat.sceneNumber}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected beat details */}
        {selectedBeat && (
          <div className="mt-8 p-6 rounded-xl bg-card border border-primary/30 animate-fade-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {(() => {
                  const config = BEAT_CONFIG[selectedBeat.type];
                  const Icon = config.icon;
                  return (
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      `bg-${config.color}/10`
                    )}>
                      <Icon className={cn('h-6 w-6', `text-${config.color}`)} />
                    </div>
                  );
                })()}
                <div>
                  <h4 className="text-xl font-semibold">{selectedBeat.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    Act {selectedBeat.act} • Position: {selectedBeat.position.toFixed(0)}%
                    {selectedBeat.sceneNumber && ` • Scene ${selectedBeat.sceneNumber}`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedBeat(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedBeat.description && (
              <p className="mt-4 text-muted-foreground">{selectedBeat.description}</p>
            )}

            {selectedBeat.emotionalTone && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Emotional tone:</span>
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium capitalize',
                  EMOTIONAL_COLORS[selectedBeat.emotionalTone.toLowerCase()] || 'bg-muted'
                )}>
                  {selectedBeat.emotionalTone}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Key beats legend */}
        <div className="mt-12 p-6 rounded-xl bg-muted/30">
          <h4 className="font-semibold mb-4">Story Beat Legend</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(BEAT_CONFIG).filter(([key]) => key !== 'scene').map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    `bg-${config.color}/20`
                  )}>
                    <Icon className={cn('h-4 w-4', `text-${config.color}`)} />
                  </div>
                  <span className="text-sm">{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scene count by act */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((act) => {
            const actScenes = scenes.filter((_, i) => {
              const pos = (i / (scenes.length - 1)) * 100;
              if (act === 1) return pos <= 25;
              if (act === 2) return pos > 25 && pos <= 75;
              return pos > 75;
            });
            
            return (
              <div key={act} className="p-5 rounded-xl bg-card border border-border text-center">
                <p className="text-3xl font-bold gradient-text">{actScenes.length}</p>
                <p className="text-muted-foreground">Act {act} Scenes</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Helper functions for emotional arc SVG paths
function generateLinePath(points: Array<{ position: number; intensity: number }>, height: number): string {
  if (points.length < 2) return '';
  
  const baseline = height / 2;
  
  return points.reduce((path, point, index) => {
    const x = point.position;
    const y = baseline - ((point.intensity - 50) / 50) * (height / 3);
    
    if (index === 0) {
      return `M ${x}% ${y}`;
    }
    return `${path} L ${x}% ${y}`;
  }, '');
}

function generateArcPath(points: Array<{ position: number; intensity: number }>, height: number): string {
  if (points.length < 2) return '';
  
  const baseline = height / 2;
  const linePath = generateLinePath(points, height);
  
  // Close the path at the bottom
  return `${linePath} L 100% ${baseline} L 0% ${baseline} Z`;
}
