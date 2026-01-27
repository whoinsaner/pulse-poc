import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Clock, Smartphone, TrendingUp, Share2, Eye,
  MessageSquare, BarChart3, Timer, Layers, FastForward,
  AlertTriangle, CheckCircle2, Repeat, Film, Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MICRO_DRAMA_PARAMETERS, MICRO_DRAMA_FAILURE_PATTERNS } from '@/lib/parameterDefinitions';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
}

const PARAMETER_ICONS: Record<string, React.ElementType> = {
  hook_velocity: Zap,
  cliff_density: TrendingUp,
  scroll_stop_power: Eye,
  emotional_compression: FastForward,
  character_legibility_at_speed: Smartphone,
  series_hook: Repeat,
  vertical_format_optimization: Smartphone,
  dialogue_efficiency: Volume2,
  visual_hook_density: Film,
  replay_value: Repeat,
};

export default function MicroDramaAnalysis() {
  const context = useOutletContext<ReportContextValue>();
  const { reportData } = context;

  // Get parameter scores from report data
  const getParamScore = (paramName: string): number => {
    const paramScore = reportData.parameterScores?.find(p => 
      p.parameterId === paramName || p.parameterName === paramName
    );
    const rawScore = paramScore?.score || 0;
    // Handle both 0-100 and 0-10 scales
    return rawScore > 10 ? rawScore : rawScore * 10;
  };

  const getParamData = (paramName: string) => {
    return reportData.parameterScores?.find(p => 
      p.parameterId === paramName || p.parameterName === paramName
    );
  };

  // Separate parameters by weight category
  const maxWeightParams = MICRO_DRAMA_PARAMETERS.filter(p => p.weight >= 2.0);
  const highWeightParams = MICRO_DRAMA_PARAMETERS.filter(p => p.weight >= 1.5 && p.weight < 2.0);
  const standardParams = MICRO_DRAMA_PARAMETERS.filter(p => p.weight < 1.5);

  // Detect failure patterns
  const detectedFailures = MICRO_DRAMA_FAILURE_PATTERNS?.filter(pattern => {
    const score = getParamScore(pattern.triggerParam);
    return score < pattern.threshold;
  }) || [];

  // Calculate average scores
  const avgScore = MICRO_DRAMA_PARAMETERS.reduce((sum, p) => sum + getParamScore(p.name), 0) / MICRO_DRAMA_PARAMETERS.length;

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="px-4 py-1.5 rounded-full bg-chart-5/10 text-chart-5 text-sm font-medium">
            Micro Drama Analysis
          </span>
          <Badge className="px-3 py-1 bg-primary/10 text-primary">
            30-180 Seconds
          </Badge>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Vertical-First Content Evaluation
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          10 specialized parameters for scroll-stopping, mobile-native storytelling
        </p>
      </div>

      {/* Format Context */}
      <Card className="p-6 bg-gradient-to-br from-chart-5/5 via-card to-primary/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-chart-5/10">
            <Smartphone className="h-6 w-6 text-chart-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Vertical-First, Mobile-Native</h3>
            <p className="text-muted-foreground mb-3">
              Optimized for TikTok, Instagram Reels, YouTube Shorts, and vertical platforms. 
              Every frame must justify its existence. No horizontal thinking allowed.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Hook Velocity: Maximum Weight (2.0×)
              </Badge>
              <Badge variant="outline" className="text-xs">
                Cliff Density: Maximum Weight (2.0×)
              </Badge>
              <Badge variant="outline" className="text-xs">
                Average Score: {avgScore.toFixed(0)}/100
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Failure Pattern Warnings */}
      {detectedFailures.length > 0 && (
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Critical Failure Patterns</h3>
              <div className="space-y-3">
                {detectedFailures.map((failure, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                    <div>
                      <p className="font-medium">{failure.name}</p>
                      <p className="text-sm text-muted-foreground">{failure.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Maximum Weight Parameters (2.0×) */}
      <section>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold">Critical Engagement Metrics</h3>
            <Badge className="bg-destructive/10 text-destructive">2.0× Weight</Badge>
          </div>
          <p className="text-muted-foreground">
            These parameters determine scroll-stop success. Failure here means content death.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6">
          {maxWeightParams.map((param) => {
            const Icon = PARAMETER_ICONS[param.name] || Zap;
            const score = getParamScore(param.name);
            const paramData = getParamData(param.name);
            
            return (
              <Card key={param.name} className="p-6 bg-gradient-to-br from-destructive/5 via-card to-destructive/10 border-destructive/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <Icon className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{param.displayName}</p>
                      <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                        2.0×
                      </Badge>
                    </div>
                    <p className={cn(
                      "text-4xl font-bold",
                      score >= 80 ? "text-success" :
                      score >= 60 ? "text-chart-4" :
                      "text-destructive"
                    )}>
                      {score.toFixed(0)}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {param.description}
                </p>
                
                <div className="space-y-2">
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        score >= 80 ? "bg-success" :
                        score >= 60 ? "bg-chart-4" :
                        "bg-destructive"
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
                
                {paramData?.rationale && (
                  <p className="text-sm text-muted-foreground mt-4 italic border-l-2 border-muted pl-3">
                    {paramData.rationale}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* High Weight Parameters (1.5-1.8×) */}
      <section>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold">High-Impact Metrics</h3>
            <Badge className="bg-chart-4/10 text-chart-4">1.5-1.8× Weight</Badge>
          </div>
          <p className="text-muted-foreground">
            Secondary drivers of engagement and retention
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {highWeightParams.map((param) => {
            const Icon = PARAMETER_ICONS[param.name] || Eye;
            const score = getParamScore(param.name);
            const paramData = getParamData(param.name);
            
            return (
              <Card key={param.name} className="p-5 bg-card/50 hover:shadow-md transition-shadow border-chart-4/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-chart-4/10">
                    <Icon className="h-5 w-5 text-chart-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{param.displayName}</p>
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {param.weight}×
                      </Badge>
                    </div>
                    <p className={cn(
                      "text-2xl font-bold",
                      score >= 80 ? "text-success" :
                      score >= 60 ? "text-chart-4" :
                      "text-warning"
                    )}>
                      {score.toFixed(0)}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {param.description}
                </p>
                
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      score >= 80 ? "bg-success" :
                      score >= 60 ? "bg-chart-4" :
                      "bg-warning"
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
                
                {paramData?.rationale && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-3 italic">
                    "{paramData.rationale}"
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Standard Parameters */}
      <section>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold">Supporting Metrics</h3>
            <Badge className="bg-muted text-muted-foreground">1.0-1.2× Weight</Badge>
          </div>
          <p className="text-muted-foreground">
            Foundation parameters that support overall quality
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {standardParams.map((param) => {
            const Icon = PARAMETER_ICONS[param.name] || Film;
            const score = getParamScore(param.name);
            
            return (
              <Card key={param.name} className="p-4 bg-card/30 hover:bg-card/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium truncate flex-1">{param.displayName}</p>
                </div>
                
                <div className="flex items-end justify-between">
                  <p className={cn(
                    "text-xl font-bold",
                    score >= 80 ? "text-success" :
                    score >= 60 ? "text-chart-4" :
                    "text-warning"
                  )}>
                    {score.toFixed(0)}
                  </p>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        score >= 80 ? "bg-success" :
                        score >= 60 ? "bg-chart-4" :
                        "bg-warning"
                      )}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Micro Drama Best Practices */}
      <section>
        <Card className="p-8 bg-gradient-to-br from-chart-5/5 via-card to-success/5">
          <h3 className="text-2xl font-bold mb-6">Micro Drama Best Practices</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-success/10 h-fit">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium">Hook in 2-3 Seconds</p>
                  <p className="text-sm text-muted-foreground">
                    The first frame must contain conflict, mystery, or emotional stakes
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-5/10 h-fit">
                  <TrendingUp className="h-4 w-4 text-chart-5" />
                </div>
                <div>
                  <p className="font-medium">Tension Every 15 Seconds</p>
                  <p className="text-sm text-muted-foreground">
                    Plant mini-cliffs to prevent scroll-away impulse
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10 h-fit">
                  <Smartphone className="h-4 w-4 text-chart-4" />
                </div>
                <div>
                  <p className="font-medium">Think Vertical-First</p>
                  <p className="text-sm text-muted-foreground">
                    Compose every shot for 9:16 ratio. Face-forward, centered action.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <Volume2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Dialogue as Punchline</p>
                  <p className="text-sm text-muted-foreground">
                    Minimize words. Every line should land as revelation or twist.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10 h-fit">
                  <MessageSquare className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <p className="font-medium">End with Debate-Bait</p>
                  <p className="text-sm text-muted-foreground">
                    Moral ambiguity drives comments. Questions outperform answers.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-warning/10 h-fit">
                  <Repeat className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Reward Rewatches</p>
                  <p className="text-sm text-muted-foreground">
                    Hide easter eggs and alternate interpretations for replay value
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
