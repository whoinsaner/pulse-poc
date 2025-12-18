import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Star, Heart, Zap, Target } from 'lucide-react';
import { CharacterData } from '@/types/database';

interface CharacterArcVisualizationProps {
  characters: CharacterData[];
  totalScenes?: number;
}

interface ArcPoint {
  scene: number;
  label: string;
  emotional: number;
  milestone?: string;
  event?: string;
}

const EMOTIONAL_STATES = [
  { value: 10, label: 'Triumphant', color: 'hsl(var(--chart-2))' },
  { value: 8, label: 'Hopeful', color: 'hsl(var(--chart-3))' },
  { value: 6, label: 'Determined', color: 'hsl(var(--chart-4))' },
  { value: 5, label: 'Neutral', color: 'hsl(var(--muted-foreground))' },
  { value: 4, label: 'Uncertain', color: 'hsl(var(--chart-5))' },
  { value: 2, label: 'Struggling', color: 'hsl(var(--warning))' },
  { value: 0, label: 'Crisis', color: 'hsl(var(--destructive))' },
];

const MILESTONE_ICONS: Record<string, React.ReactNode> = {
  'introduction': <Star className="h-3 w-3" />,
  'revelation': <Zap className="h-3 w-3" />,
  'transformation': <Heart className="h-3 w-3" />,
  'climax': <Target className="h-3 w-3" />,
};

function generateCharacterArc(character: CharacterData, totalScenes: number): ArcPoint[] {
  const points: ArcPoint[] = [];
  const startScene = character.firstAppearance || 1;
  const sceneCount = character.sceneCount || Math.floor(totalScenes * 0.6);
  
  // Generate arc based on classic story structure
  const arcPhases = [
    { phase: 'Setup', startPct: 0, endPct: 0.15, emotionalRange: [5, 7], milestone: 'introduction' },
    { phase: 'Rising Action', startPct: 0.15, endPct: 0.4, emotionalRange: [4, 8] },
    { phase: 'Midpoint', startPct: 0.4, endPct: 0.5, emotionalRange: [6, 9], milestone: 'revelation' },
    { phase: 'Complications', startPct: 0.5, endPct: 0.75, emotionalRange: [2, 5] },
    { phase: 'Crisis', startPct: 0.75, endPct: 0.85, emotionalRange: [1, 3], milestone: 'transformation' },
    { phase: 'Climax', startPct: 0.85, endPct: 0.95, emotionalRange: [3, 9], milestone: 'climax' },
    { phase: 'Resolution', startPct: 0.95, endPct: 1, emotionalRange: [7, 10] },
  ];

  // Create a seed based on character name for consistent random values
  const seed = character.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  arcPhases.forEach((phase, phaseIndex) => {
    const phaseStart = Math.floor(startScene + sceneCount * phase.startPct);
    const phaseEnd = Math.floor(startScene + sceneCount * phase.endPct);
    const pointCount = Math.max(1, Math.floor((phaseEnd - phaseStart) / 3));

    for (let i = 0; i < pointCount; i++) {
      const scene = phaseStart + Math.floor((phaseEnd - phaseStart) * (i / pointCount));
      const emotional = random(phase.emotionalRange[0], phase.emotionalRange[1], phaseIndex * 10 + i);
      
      points.push({
        scene,
        label: `Scene ${scene}`,
        emotional: Math.round(emotional * 10) / 10,
        milestone: i === 0 && phase.milestone ? phase.milestone : undefined,
        event: i === 0 ? phase.phase : undefined,
      });
    }
  });

  return points.sort((a, b) => a.scene - b.scene);
}

function getArcTrend(points: ArcPoint[]): 'rising' | 'falling' | 'stable' {
  if (points.length < 2) return 'stable';
  const firstHalf = points.slice(0, Math.floor(points.length / 2));
  const secondHalf = points.slice(Math.floor(points.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, p) => sum + p.emotional, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, p) => sum + p.emotional, 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  if (diff > 1) return 'rising';
  if (diff < -1) return 'falling';
  return 'stable';
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function CharacterArcVisualization({ characters, totalScenes = 60 }: CharacterArcVisualizationProps) {
  const characterArcs = useMemo(() => {
    const mainCharacters = characters
      .sort((a, b) => (b.dialogueCount || 0) - (a.dialogueCount || 0))
      .slice(0, 5);

    return mainCharacters.map((character, index) => ({
      character: { ...character, id: character.name },
      arc: generateCharacterArc(character, totalScenes),
      color: CHART_COLORS[index % CHART_COLORS.length],
      trend: getArcTrend(generateCharacterArc(character, totalScenes)),
    }));
  }, [characters, totalScenes]);

  // Combine all arcs into chart data
  const chartData = useMemo(() => {
    const allScenes = new Set<number>();
    characterArcs.forEach(({ arc }) => arc.forEach(p => allScenes.add(p.scene)));
    
    return Array.from(allScenes).sort((a, b) => a - b).map(scene => {
      const point: Record<string, number | string> = { scene, label: `Scene ${scene}` };
      characterArcs.forEach(({ character, arc }) => {
        const arcPoint = arc.find(p => p.scene === scene);
        if (arcPoint) {
          point[character.name] = arcPoint.emotional;
        }
      });
      return point;
    });
  }, [characterArcs]);

  const milestones = useMemo(() => {
    return characterArcs.flatMap(({ character, arc, color }) =>
      arc
        .filter(p => p.milestone)
        .map(p => ({
          character: character.name,
          scene: p.scene,
          milestone: p.milestone!,
          emotional: p.emotional,
          color,
        }))
    );
  }, [characterArcs]);

  if (characters.length === 0) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">No character data available for arc visualization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gradient-to-b from-background to-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-3/10 text-chart-3 text-sm font-medium">
            Character Development
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">Emotional Journeys</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track character arcs through emotional highs and lows across the narrative
          </p>
        </div>

        {/* Main Arc Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-chart-1" />
              Character Emotional Arcs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis 
                    dataKey="scene" 
                    label={{ value: 'Scene', position: 'bottom', offset: 0 }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    ticks={[0, 2, 4, 6, 8, 10]}
                    label={{ value: 'Emotional State', angle: -90, position: 'insideLeft' }}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} - ${EMOTIONAL_STATES.find(s => Math.abs(s.value - value) < 1.5)?.label || 'Neutral'}`,
                      name
                    ]}
                  />
                  <ReferenceLine y={5} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label="Neutral" />
                  
                  {characterArcs.map(({ character, color }) => (
                    <Line
                      key={character.id}
                      type="monotone"
                      dataKey={character.name}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                      connectNulls
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {characterArcs.map(({ character, color, trend }) => (
                <div key={character.id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium">{character.name}</span>
                  {trend === 'rising' && <TrendingUp className="h-4 w-4 text-chart-2" />}
                  {trend === 'falling' && <TrendingDown className="h-4 w-4 text-destructive" />}
                  {trend === 'stable' && <Minus className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestones Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {['introduction', 'revelation', 'transformation', 'climax'].map(milestoneType => {
            const milestonesOfType = milestones.filter(m => m.milestone === milestoneType);
            return (
              <Card key={milestoneType} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {MILESTONE_ICONS[milestoneType]}
                    <h4 className="font-semibold capitalize">{milestoneType}</h4>
                  </div>
                  <div className="space-y-2">
                    {milestonesOfType.length > 0 ? milestonesOfType.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{m.character}</span>
                        <Badge variant="outline" className="text-xs">
                          Scene {m.scene}
                        </Badge>
                      </div>
                    )) : (
                      <p className="text-xs text-muted-foreground">No milestones detected</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Individual Character Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characterArcs.map(({ character, arc, color, trend }) => {
            const avgEmotional = arc.reduce((sum, p) => sum + p.emotional, 0) / arc.length;
            const highPoint = Math.max(...arc.map(p => p.emotional));
            const lowPoint = Math.min(...arc.map(p => p.emotional));
            
            return (
              <Card key={character.id} className="glass-card overflow-hidden">
                <div className="h-1" style={{ backgroundColor: color }} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{character.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {character.sceneCount || 0} scenes • {character.dialogueCount || 0} lines
                      </p>
                    </div>
                    <Badge 
                      variant={trend === 'rising' ? 'default' : trend === 'falling' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {trend === 'rising' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {trend === 'falling' && <TrendingDown className="h-3 w-3 mr-1" />}
                      {trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
                      {trend}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded bg-card">
                      <div className="text-lg font-bold" style={{ color }}>
                        {avgEmotional.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg State</div>
                    </div>
                    <div className="text-center p-2 rounded bg-card">
                      <div className="text-lg font-bold text-chart-2">{highPoint.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Peak</div>
                    </div>
                    <div className="text-center p-2 rounded bg-card">
                      <div className="text-lg font-bold text-destructive">{lowPoint.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Low</div>
                    </div>
                  </div>

                  {character.arcSummary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {character.arcSummary}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
