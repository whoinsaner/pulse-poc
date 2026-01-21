import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, EpisodeLengthClass } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Clock, Users, TrendingUp, Share2, DollarSign, 
  Tv, Zap, MessageSquare, BarChart3, Timer, Layers, FastForward,
  AlertTriangle, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WEB_SERIES_PARAMETERS, EPISODE_LENGTH_WEIGHT_MODIFIERS, WEB_SERIES_FAILURE_PATTERNS } from '@/lib/parameterDefinitions';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  isWebSeries: boolean;
  episodeLengthClass?: EpisodeLengthClass;
}

const PARAMETER_ICONS: Record<string, React.ElementType> = {
  hook_efficiency: Zap,
  episode_self_containment: Tv,
  serial_momentum: TrendingUp,
  retention_curve_design: BarChart3,
  character_stickiness: Users,
  platform_native_storytelling: Play,
  tonality_format_consistency: MessageSquare,
  production_simplicity_velocity: Clock,
  shareability_meme_potential: Share2,
  monetization_readiness: DollarSign,
  mid_episode_rehooking: Timer,
  soft_act_integrity: Layers,
  binge_continuity_pressure: FastForward,
};

const EPISODE_LENGTH_LABELS: Record<EpisodeLengthClass, { label: string; description: string; color: string }> = {
  short_form_web: { 
    label: 'Short-Form', 
    description: '<10 minutes', 
    color: 'bg-chart-2/10 text-chart-2' 
  },
  mid_form_web: { 
    label: 'Mid-Form', 
    description: '10-30 minutes', 
    color: 'bg-chart-4/10 text-chart-4' 
  },
  long_form_web: { 
    label: 'Long-Form', 
    description: '45-70+ minutes', 
    color: 'bg-chart-5/10 text-chart-5' 
  },
};

export default function WebSeriesAnalysis() {
  const context = useOutletContext<ReportContextValue>();
  const { reportData, episodeLengthClass = 'mid_form_web' } = context;

  // Get core parameters (always shown)
  const coreParams = WEB_SERIES_PARAMETERS.filter(p => !p.longFormOnly);
  
  // Get long-form only parameters
  const longFormParams = WEB_SERIES_PARAMETERS.filter(p => p.longFormOnly);
  const showLongFormParams = episodeLengthClass === 'long_form_web';

  // Get weight modifiers for current episode length class
  const weightModifiers = EPISODE_LENGTH_WEIGHT_MODIFIERS[episodeLengthClass] || {};

  // Get parameter scores from report data
  const getParamScore = (paramName: string): number => {
    const paramScore = reportData.parameterScores?.find(p => p.parameterId === paramName);
    const rawScore = paramScore?.score || 0;
    return rawScore > 10 ? rawScore / 10 : rawScore;
  };

  const getParamData = (paramName: string) => {
    return reportData.parameterScores?.find(p => p.parameterId === paramName);
  };

  // Detect failure patterns
  const detectedFailures = WEB_SERIES_FAILURE_PATTERNS.filter(pattern => {
    const score = getParamScore(pattern.triggerParam);
    return score < pattern.threshold;
  });

  const lengthInfo = EPISODE_LENGTH_LABELS[episodeLengthClass];

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="px-4 py-1.5 rounded-full bg-chart-2/10 text-chart-2 text-sm font-medium">
            Web Series Analysis
          </span>
          <Badge className={cn("px-3 py-1", lengthInfo.color)}>
            {lengthInfo.label} ({lengthInfo.description})
          </Badge>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Digital-First Series Evaluation
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          13 parameters optimized for algorithmic discovery, retention, and platform-native consumption
        </p>
      </div>

      {/* Episode Length Context */}
      <Card className="p-6 bg-gradient-to-br from-chart-2/5 via-card to-chart-4/5">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl", lengthInfo.color)}>
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Episode Length Class: {lengthInfo.label}</h3>
            <p className="text-muted-foreground mb-3">
              {episodeLengthClass === 'short_form_web' && 
                'Optimized for hook efficiency, shareability, and retention. Every second counts.'}
              {episodeLengthClass === 'mid_form_web' && 
                'Balanced evaluation across all core parameters. Standard digital series format.'}
              {episodeLengthClass === 'long_form_web' && 
                'Character stickiness, serial momentum, and mid-episode re-hooking gain importance.'}
            </p>
            {Object.keys(weightModifiers).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(weightModifiers).map(([param, modifier]) => {
                  const paramDef = WEB_SERIES_PARAMETERS.find(p => p.name === param);
                  return (
                    <Badge key={param} variant="outline" className="text-xs">
                      {paramDef?.displayName}: {modifier > 1 ? '+' : ''}{Math.round((modifier - 1) * 100)}%
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Failure Pattern Warnings */}
      {detectedFailures.length > 0 && (
        <Card className="p-6 border-warning/50 bg-warning/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-warning">Detected Failure Patterns</h3>
              <div className="space-y-3">
                {detectedFailures.map((failure, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
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

      {/* Core Parameters Grid */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Core Web Series Parameters</h3>
          <p className="text-muted-foreground">
            10 essential parameters evaluated for all web series formats
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreParams.map((param) => {
            const Icon = PARAMETER_ICONS[param.name] || Play;
            const score = getParamScore(param.name);
            const paramData = getParamData(param.name);
            const weightMod = weightModifiers[param.name];
            const adjustedWeight = param.weight * (weightMod || 1);
            
            return (
              <Card key={param.name} className="p-5 bg-card/50 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-chart-2/10">
                    <Icon className="h-5 w-5 text-chart-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{param.displayName}</p>
                      {weightMod && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {weightMod > 1 ? '↑' : '↓'}
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-2xl font-bold",
                      score >= 7 ? "text-success" :
                      score >= 5 ? "text-chart-4" :
                      "text-warning"
                    )}>
                      {score.toFixed(1)}
                    </p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {param.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Weight: {(adjustedWeight * 100).toFixed(0)}%</span>
                    <span>Base: {(param.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        score >= 7 ? "bg-success" :
                        score >= 5 ? "bg-chart-4" :
                        "bg-warning"
                      )}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
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

      {/* Long-Form Only Parameters */}
      {showLongFormParams && (
        <section>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold">Long-Form Parameters</h3>
              <Badge className="bg-chart-5/10 text-chart-5">45+ min</Badge>
            </div>
            <p className="text-muted-foreground">
              Additional parameters activated for long-form web series
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {longFormParams.map((param) => {
              const Icon = PARAMETER_ICONS[param.name] || Layers;
              const score = getParamScore(param.name);
              const paramData = getParamData(param.name);
              
              return (
                <Card key={param.name} className="p-5 bg-card/50 hover:shadow-md transition-shadow border-chart-5/20">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-chart-5/10">
                      <Icon className="h-5 w-5 text-chart-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{param.displayName}</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        score >= 7 ? "text-success" :
                        score >= 5 ? "text-chart-4" :
                        "text-warning"
                      )}>
                        {score.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {param.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Weight: {(param.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          score >= 7 ? "bg-success" :
                          score >= 5 ? "bg-chart-4" :
                          "bg-warning"
                        )}
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
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
      )}

      {/* Optimization Tips */}
      <section>
        <Card className="p-8 bg-gradient-to-br from-chart-2/5 via-card to-success/5">
          <h3 className="text-2xl font-bold mb-6">Web Series Optimization</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-success/10 h-fit">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium">Hook in First 10 Seconds</p>
                  <p className="text-sm text-muted-foreground">
                    Create immediate tension or curiosity before viewers scroll past
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10 h-fit">
                  <Share2 className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <p className="font-medium">Design for Clips</p>
                  <p className="text-sm text-muted-foreground">
                    Include 2-3 shareable moments per episode for social amplification
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10 h-fit">
                  <BarChart3 className="h-4 w-4 text-chart-4" />
                </div>
                <div>
                  <p className="font-medium">Reset Attention Every 2-3 Min</p>
                  <p className="text-sm text-muted-foreground">
                    Plant micro-hooks and tension spikes to maintain retention curve
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-5/10 h-fit">
                  <FastForward className="h-4 w-4 text-chart-5" />
                </div>
                <div>
                  <p className="font-medium">End with Forward Momentum</p>
                  <p className="text-sm text-muted-foreground">
                    Every episode ending should create "just one more" pressure
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
