import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
}

export default function RetentionAnalysis() {
  const { reportData } = useOutletContext<ReportContextValue>();

  // Mock retention curve data (would come from analysis in real implementation)
  const retentionCheckpoints = [
    { time: '0:00', retention: 100, label: 'Start' },
    { time: '0:30', retention: 85, label: 'First Hook' },
    { time: '2:00', retention: 78, label: 'Setup Complete' },
    { time: '5:00', retention: 72, label: 'Inciting Moment' },
    { time: '10:00', retention: 68, label: 'Midpoint' },
    { time: '15:00', retention: 65, label: 'Escalation' },
    { time: '20:00', retention: 62, label: 'Climax Build' },
    { time: 'End', retention: 75, label: 'Cliffhanger Effect' },
  ];

  const retentionParam = reportData.parameterScores?.find(p => p.parameterId === 'retention_curve_design');
  const retentionScore = retentionParam?.score ? (retentionParam.score > 10 ? retentionParam.score / 10 : retentionParam.score) : 7.2;

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <span className="px-4 py-1.5 rounded-full bg-chart-4/10 text-chart-4 text-sm font-medium">
          Retention Analysis
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Retention Curve Design
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Viewer engagement maintenance through runtime with strategic attention resets
        </p>
      </div>

      {/* Overall Retention Score */}
      <Card className="p-8 bg-gradient-to-br from-chart-4/5 via-card to-success/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-1">Retention Curve Score</h3>
            <p className="text-muted-foreground">Based on strategic attention management</p>
          </div>
          <div className={cn(
            "text-5xl font-bold",
            retentionScore >= 7 ? "text-success" :
            retentionScore >= 5 ? "text-chart-4" :
            "text-warning"
          )}>
            {retentionScore.toFixed(1)}
          </div>
        </div>

        {/* Visual Retention Curve */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Projected Retention Curve</h4>
          <div className="relative h-48 bg-muted/30 rounded-lg p-4">
            <div className="absolute inset-4 flex items-end justify-between gap-2">
              {retentionCheckpoints.map((checkpoint, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={cn(
                      "w-full rounded-t transition-all",
                      checkpoint.retention >= 75 ? "bg-success" :
                      checkpoint.retention >= 60 ? "bg-chart-4" :
                      "bg-warning"
                    )}
                    style={{ height: `${checkpoint.retention}%` }}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium">{checkpoint.retention}%</p>
                    <p className="text-[10px] text-muted-foreground">{checkpoint.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Retention Strategies */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold">Effective Strategies</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
              <div>
                <p className="font-medium">Strong Cold Open</p>
                <p className="text-sm text-muted-foreground">Immediate hook within first 10 seconds</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
              <div>
                <p className="font-medium">Micro-Tension Beats</p>
                <p className="text-sm text-muted-foreground">Regular small reveals every 2-3 minutes</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-success mt-2" />
              <div>
                <p className="font-medium">Cliffhanger Ending</p>
                <p className="text-sm text-muted-foreground">Strong forward momentum to next episode</p>
              </div>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold">Risk Areas</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
              <div>
                <p className="font-medium">Slow Setup Phase</p>
                <p className="text-sm text-muted-foreground">Minutes 3-5 show retention dip</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
              <div>
                <p className="font-medium">Midpoint Lull</p>
                <p className="text-sm text-muted-foreground">Consider adding mid-episode hook</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2" />
              <div>
                <p className="font-medium">Dialogue-Heavy Sections</p>
                <p className="text-sm text-muted-foreground">Break up with visual beats</p>
              </div>
            </li>
          </ul>
        </Card>
      </section>

      {/* Re-Hook Points */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Attention Reset Points</h3>
          <p className="text-muted-foreground">
            Strategic moments designed to re-engage viewers
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { time: '0:30', type: 'Initial Hook', status: 'strong' },
            { time: '5:00', type: 'Inciting Reveal', status: 'moderate' },
            { time: '12:00', type: 'Mid-Episode Twist', status: 'needs_work' },
            { time: 'Final', type: 'Cliffhanger', status: 'strong' },
          ].map((point, idx) => (
            <Card key={idx} className={cn(
              "p-4",
              point.status === 'strong' ? "border-success/30" :
              point.status === 'moderate' ? "border-chart-4/30" :
              "border-warning/30"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Target className={cn(
                  "h-4 w-4",
                  point.status === 'strong' ? "text-success" :
                  point.status === 'moderate' ? "text-chart-4" :
                  "text-warning"
                )} />
                <Badge variant="outline" className="text-xs">{point.time}</Badge>
              </div>
              <p className="font-medium">{point.type}</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {point.status.replace('_', ' ')}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
