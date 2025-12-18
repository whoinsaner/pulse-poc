import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { 
  Activity, 
  MessageSquare, 
  Clapperboard, 
  Sparkles, 
  AlertTriangle,
} from 'lucide-react';
import { SceneData, CharacterData } from '@/types/database';

interface SceneComplexityAnalyzerProps {
  scenes: SceneData[];
  characters?: CharacterData[];
}

interface ComplexityMetrics {
  dialogueDensity: number;      // 0-100
  actionIntensity: number;      // 0-100
  technicalRequirements: number; // 0-100
  vfxPotential: number;         // 0-100
  locationComplexity: number;   // 0-100
  castSize: number;             // estimated
  overallComplexity: number;    // 0-100
}

const COMPLEXITY_LEVELS = [
  { min: 0, max: 30, label: 'Simple', color: 'hsl(var(--chart-2))', description: 'Minimal setup required' },
  { min: 30, max: 60, label: 'Moderate', color: 'hsl(var(--chart-4))', description: 'Standard production' },
  { min: 60, max: 80, label: 'Complex', color: 'hsl(var(--warning))', description: 'Additional resources needed' },
  { min: 80, max: 100, label: 'High', color: 'hsl(var(--destructive))', description: 'Significant technical challenge' },
];

function analyzeSceneComplexity(scene: SceneData): ComplexityMetrics {
  const heading = scene.heading.toLowerCase();
  const description = (scene.description || '').toLowerCase();
  const location = (scene.location || '').toLowerCase();
  const intExt = scene.intExt || '';
  
  // Dialogue density - estimate based on scene type
  let dialogueDensity = 50;
  if (heading.includes('restaurant') || heading.includes('office') || heading.includes('bar')) {
    dialogueDensity = 70;
  } else if (heading.includes('chase') || heading.includes('fight') || heading.includes('action')) {
    dialogueDensity = 20;
  }
  
  // Action intensity
  let actionIntensity = 30;
  const actionKeywords = ['chase', 'fight', 'explosion', 'crash', 'run', 'escape', 'battle', 'attack'];
  actionKeywords.forEach(keyword => {
    if (heading.includes(keyword) || description.includes(keyword)) {
      actionIntensity += 15;
    }
  });
  actionIntensity = Math.min(100, actionIntensity);
  
  // Technical requirements
  let technicalRequirements = 20;
  if (intExt === 'EXT') technicalRequirements += 10;
  if (scene.timeOfDay === 'NIGHT') technicalRequirements += 15;
  if (heading.includes('moving') || heading.includes('car') || heading.includes('vehicle')) {
    technicalRequirements += 20;
  }
  technicalRequirements = Math.min(100, technicalRequirements);
  
  // VFX potential
  let vfxPotential = 10;
  const vfxKeywords = ['space', 'explosion', 'magic', 'transform', 'cgi', 'creature', 'monster', 'fantasy'];
  vfxKeywords.forEach(keyword => {
    if (heading.includes(keyword) || description.includes(keyword)) {
      vfxPotential += 20;
    }
  });
  vfxPotential = Math.min(100, vfxPotential);
  
  // Location complexity
  let locationComplexity = 30;
  const complexLocations = ['mansion', 'castle', 'hospital', 'airport', 'stadium', 'prison', 'ship'];
  complexLocations.forEach(loc => {
    if (location.includes(loc) || heading.includes(loc)) {
      locationComplexity += 15;
    }
  });
  if (intExt === 'EXT') locationComplexity += 10;
  locationComplexity = Math.min(100, locationComplexity);
  
  // Estimated cast size
  const castSize = Math.floor(Math.random() * 8) + 2; // 2-10 people
  
  // Overall complexity
  const overallComplexity = Math.round(
    dialogueDensity * 0.15 +
    actionIntensity * 0.25 +
    technicalRequirements * 0.25 +
    vfxPotential * 0.2 +
    locationComplexity * 0.15
  );
  
  return {
    dialogueDensity: Math.round(dialogueDensity),
    actionIntensity: Math.round(actionIntensity),
    technicalRequirements: Math.round(technicalRequirements),
    vfxPotential: Math.round(vfxPotential),
    locationComplexity: Math.round(locationComplexity),
    castSize,
    overallComplexity,
  };
}

function getComplexityLevel(value: number) {
  return COMPLEXITY_LEVELS.find(level => value >= level.min && value < level.max) || COMPLEXITY_LEVELS[0];
}

export function SceneComplexityAnalyzer({ scenes, characters = [] }: SceneComplexityAnalyzerProps) {
  const sceneAnalysis = useMemo(() => {
    return scenes.map(scene => ({
      scene,
      metrics: analyzeSceneComplexity(scene),
    }));
  }, [scenes]);

  const chartData = useMemo(() => {
    return sceneAnalysis.map(({ scene, metrics }) => ({
      scene: scene.sceneNumber,
      name: `Scene ${scene.sceneNumber}`,
      dialogue: metrics.dialogueDensity,
      action: metrics.actionIntensity,
      technical: metrics.technicalRequirements,
      vfx: metrics.vfxPotential,
      location: metrics.locationComplexity,
      overall: metrics.overallComplexity,
      heading: scene.heading,
    }));
  }, [sceneAnalysis]);

  const scatterData = useMemo(() => {
    return sceneAnalysis.map(({ scene, metrics }) => ({
      x: metrics.dialogueDensity,
      y: metrics.actionIntensity,
      z: metrics.overallComplexity,
      scene: scene.sceneNumber,
      heading: scene.heading,
    }));
  }, [sceneAnalysis]);

  const averageMetrics = useMemo(() => {
    if (sceneAnalysis.length === 0) return null;
    
    const totals = sceneAnalysis.reduce((acc, { metrics }) => ({
      dialogueDensity: acc.dialogueDensity + metrics.dialogueDensity,
      actionIntensity: acc.actionIntensity + metrics.actionIntensity,
      technicalRequirements: acc.technicalRequirements + metrics.technicalRequirements,
      vfxPotential: acc.vfxPotential + metrics.vfxPotential,
      locationComplexity: acc.locationComplexity + metrics.locationComplexity,
      overallComplexity: acc.overallComplexity + metrics.overallComplexity,
    }), {
      dialogueDensity: 0,
      actionIntensity: 0,
      technicalRequirements: 0,
      vfxPotential: 0,
      locationComplexity: 0,
      overallComplexity: 0,
    });
    
    const count = sceneAnalysis.length;
    return {
      dialogueDensity: Math.round(totals.dialogueDensity / count),
      actionIntensity: Math.round(totals.actionIntensity / count),
      technicalRequirements: Math.round(totals.technicalRequirements / count),
      vfxPotential: Math.round(totals.vfxPotential / count),
      locationComplexity: Math.round(totals.locationComplexity / count),
      overallComplexity: Math.round(totals.overallComplexity / count),
    };
  }, [sceneAnalysis]);

  const radarData = useMemo(() => {
    if (!averageMetrics) return [];
    return [
      { metric: 'Dialogue', value: averageMetrics.dialogueDensity, fullMark: 100 },
      { metric: 'Action', value: averageMetrics.actionIntensity, fullMark: 100 },
      { metric: 'Technical', value: averageMetrics.technicalRequirements, fullMark: 100 },
      { metric: 'VFX', value: averageMetrics.vfxPotential, fullMark: 100 },
      { metric: 'Location', value: averageMetrics.locationComplexity, fullMark: 100 },
    ];
  }, [averageMetrics]);

  const complexScenes = useMemo(() => {
    return sceneAnalysis
      .filter(({ metrics }) => metrics.overallComplexity >= 60)
      .sort((a, b) => b.metrics.overallComplexity - a.metrics.overallComplexity)
      .slice(0, 5);
  }, [sceneAnalysis]);

  const distributionStats = useMemo(() => {
    const byLevel = COMPLEXITY_LEVELS.map(level => ({
      ...level,
      count: sceneAnalysis.filter(({ metrics }) => 
        metrics.overallComplexity >= level.min && metrics.overallComplexity < level.max
      ).length,
    }));
    return byLevel;
  }, [sceneAnalysis]);

  if (scenes.length === 0) {
    return (
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">No scene data available for complexity analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-4/10 text-chart-4 text-sm font-medium">
            Production Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">Scene Complexity</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze dialogue density, action intensity, and technical requirements across scenes
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-1/10">
                  <MessageSquare className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{averageMetrics?.dialogueDensity || 0}%</div>
                  <div className="text-xs text-muted-foreground">Avg Dialogue</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <Activity className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{averageMetrics?.actionIntensity || 0}%</div>
                  <div className="text-xs text-muted-foreground">Avg Action</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <Clapperboard className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{averageMetrics?.technicalRequirements || 0}%</div>
                  <div className="text-xs text-muted-foreground">Avg Technical</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-5/10">
                  <Sparkles className="h-5 w-5 text-chart-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{averageMetrics?.vfxPotential || 0}%</div>
                  <div className="text-xs text-muted-foreground">Avg VFX</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Average"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complexity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {distributionStats.map((level) => (
                  <div key={level.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: level.color }}
                        />
                        <span className="text-sm font-medium">{level.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {level.count} scenes ({Math.round((level.count / scenes.length) * 100)}%)
                      </span>
                    </div>
                    <Progress 
                      value={(level.count / scenes.length) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* High Complexity Scenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-4 w-4 text-warning" />
                High Complexity Scenes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complexScenes.length > 0 ? complexScenes.map(({ scene, metrics }) => {
                  const level = getComplexityLevel(metrics.overallComplexity);
                  return (
                    <div key={scene.sceneNumber} className="flex items-start justify-between p-2 rounded bg-card">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{scene.sceneNumber}
                          </Badge>
                          <span 
                            className="text-xs font-medium"
                            style={{ color: level.color }}
                          >
                            {metrics.overallComplexity}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {scene.heading}
                        </p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No high complexity scenes detected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complexity Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Complexity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis 
                    dataKey="scene" 
                    label={{ value: 'Scene', position: 'bottom', offset: 0 }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    label={{ value: 'Complexity %', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(label) => chartData.find(d => d.scene === label)?.heading || `Scene ${label}`}
                  />
                  <Bar dataKey="overall" name="Overall Complexity" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const level = getComplexityLevel(entry.overall);
                      return <Cell key={`cell-${index}`} fill={level.color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dialogue vs Action Scatter */}
        <Card>
          <CardHeader>
            <CardTitle>Dialogue vs Action Intensity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Dialogue Density" 
                    domain={[0, 100]}
                    label={{ value: 'Dialogue Density %', position: 'bottom', offset: 0 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Action Intensity" 
                    domain={[0, 100]}
                    label={{ value: 'Action Intensity %', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} name="Complexity" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `Scene ${payload[0].payload.scene}: ${payload[0].payload.heading}`;
                      }
                      return '';
                    }}
                  />
                  <Scatter name="Scenes" data={scatterData}>
                    {scatterData.map((entry, index) => {
                      const level = getComplexityLevel(entry.z);
                      return <Cell key={`cell-${index}`} fill={level.color} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            {/* Quadrant Labels */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-2 rounded bg-chart-2/10">
                <p className="text-sm font-medium text-chart-2">Dialogue-Heavy</p>
                <p className="text-xs text-muted-foreground">High dialogue, low action</p>
              </div>
              <div className="text-center p-2 rounded bg-destructive/10">
                <p className="text-sm font-medium text-destructive">Action-Heavy</p>
                <p className="text-xs text-muted-foreground">Low dialogue, high action</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
