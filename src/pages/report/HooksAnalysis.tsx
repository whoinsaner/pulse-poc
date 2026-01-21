import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, CheckCircle2, XCircle, Share2, TrendingUp, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
}

export default function HooksAnalysis() {
  const { reportData } = useOutletContext<ReportContextValue>();

  const hookParam = reportData.parameterScores?.find(p => p.parameterId === 'hook_efficiency');
  const shareParam = reportData.parameterScores?.find(p => p.parameterId === 'shareability_meme_potential');
  const hookScore = hookParam?.score ? (hookParam.score > 10 ? hookParam.score / 10 : hookParam.score) : 7.5;
  const shareabilityScore = shareParam?.score ? (shareParam.score > 10 ? shareParam.score / 10 : shareParam.score) : 6.8;

  // Mock hook analysis data
  const hookElements = [
    { 
      name: 'Cold Open Question',
      description: 'Opens with unresolved mystery or tension',
      present: true,
      impact: 'high'
    },
    { 
      name: 'Visual Hook',
      description: 'Striking visual in first 5 seconds',
      present: true,
      impact: 'high'
    },
    { 
      name: 'Character Intrigue',
      description: 'Immediate character-driven curiosity',
      present: false,
      impact: 'medium'
    },
    { 
      name: 'Stakes Clarity',
      description: 'Clear what\'s at risk within 30 seconds',
      present: true,
      impact: 'high'
    },
  ];

  const shareableMoments = [
    { 
      timestamp: '3:45',
      type: 'Quotable Line',
      description: '"Life isn\'t about finding yourself..."',
      viralPotential: 'high'
    },
    { 
      timestamp: '8:22',
      type: 'Reaction Moment',
      description: 'Character revelation scene',
      viralPotential: 'medium'
    },
    { 
      timestamp: '14:10',
      type: 'Plot Twist',
      description: 'Unexpected character turn',
      viralPotential: 'high'
    },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <span className="px-4 py-1.5 rounded-full bg-chart-2/10 text-chart-2 text-sm font-medium">
          Hooks & Shareability
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Hook Efficiency Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          First 30 seconds viewer capture and social media amplification potential
        </p>
      </div>

      {/* Score Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-8 bg-gradient-to-br from-chart-2/5 via-card to-chart-4/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-chart-2/10">
              <Zap className="h-8 w-8 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hook Efficiency</p>
              <p className={cn(
                "text-4xl font-bold",
                hookScore >= 7 ? "text-success" :
                hookScore >= 5 ? "text-chart-4" :
                "text-warning"
              )}>
                {hookScore.toFixed(1)}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Measures how effectively the opening captures viewer attention and creates commitment to continue watching.
          </p>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-chart-4/5 via-card to-success/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-chart-4/10">
              <Share2 className="h-8 w-8 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shareability Score</p>
              <p className={cn(
                "text-4xl font-bold",
                shareabilityScore >= 7 ? "text-success" :
                shareabilityScore >= 5 ? "text-chart-4" :
                "text-warning"
              )}>
                {shareabilityScore.toFixed(1)}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Evaluates the presence of clip-worthy, quotable, and meme-potential moments for social amplification.
          </p>
        </Card>
      </div>

      {/* Hook Elements Analysis */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Hook Element Breakdown</h3>
          <p className="text-muted-foreground">
            Key components of an effective opening
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {hookElements.map((element, idx) => (
            <Card key={idx} className={cn(
              "p-5",
              element.present ? "border-success/30" : "border-warning/30"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg mt-0.5",
                  element.present ? "bg-success/10" : "bg-warning/10"
                )}>
                  {element.present ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{element.name}</p>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      element.impact === 'high' ? "border-chart-2 text-chart-2" :
                      "border-muted-foreground text-muted-foreground"
                    )}>
                      {element.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{element.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Shareable Moments */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Shareable Moments Identified</h3>
          <p className="text-muted-foreground">
            Clip-worthy scenes with viral potential
          </p>
        </div>
        
        <div className="space-y-4">
          {shareableMoments.map((moment, idx) => (
            <Card key={idx} className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 min-w-[80px]">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{moment.timestamp}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">{moment.type}</Badge>
                    <Badge className={cn(
                      "text-xs",
                      moment.viralPotential === 'high' 
                        ? "bg-success/10 text-success border-success/30" 
                        : "bg-chart-4/10 text-chart-4 border-chart-4/30"
                    )}>
                      {moment.viralPotential} viral potential
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{moment.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Optimization Tips */}
      <section>
        <Card className="p-8 bg-gradient-to-br from-chart-2/5 via-card to-chart-4/5">
          <h3 className="text-2xl font-bold mb-6">Hook Optimization Tips</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10 h-fit">
                  <Eye className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <p className="font-medium">First Frame Matters</p>
                  <p className="text-sm text-muted-foreground">
                    Thumbnail and first visual should create curiosity before video plays
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10 h-fit">
                  <Zap className="h-4 w-4 text-chart-4" />
                </div>
                <div>
                  <p className="font-medium">10-Second Rule</p>
                  <p className="text-sm text-muted-foreground">
                    Introduce tension, question, or intrigue before viewer can scroll
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-success/10 h-fit">
                  <Share2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium">Design for Clips</p>
                  <p className="text-sm text-muted-foreground">
                    Self-contained moments that work without context
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-chart-5/10 h-fit">
                  <TrendingUp className="h-4 w-4 text-chart-5" />
                </div>
                <div>
                  <p className="font-medium">Quotable Dialogue</p>
                  <p className="text-sm text-muted-foreground">
                    Lines that can stand alone in captions and comments
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
