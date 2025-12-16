import { CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface StudioRecommendationProps {
  score: number;
  summary: string;
}

export function StudioRecommendation({ score, summary }: StudioRecommendationProps) {
  const getRecommendation = () => {
    if (score >= 75) {
      return {
        label: 'PROCEED TO PRODUCTION',
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/30',
        icon: CheckCircle,
        description: 'Script is production-ready with strong commercial potential. Recommend packaging immediately.',
      };
    }
    if (score >= 55) {
      return {
        label: 'PROCEED WITH DEVELOPMENT',
        color: 'text-chart-4',
        bgColor: 'bg-chart-4/10',
        borderColor: 'border-chart-4/30',
        icon: ArrowRight,
        description: 'Requires structural and character rewrites before packaging. Strong commercial elements present.',
      };
    }
    if (score >= 40) {
      return {
        label: 'CONSIDER WITH REWRITE',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning/30',
        icon: AlertTriangle,
        description: 'Has potential but needs foundational work on structure, characters, and tonal cohesion.',
      };
    }
    return {
      label: 'PASS - NEEDS MAJOR REVISION',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      icon: XCircle,
      description: 'Not recommended in current state. Requires significant development before reconsideration.',
    };
  };

  const recommendation = getRecommendation();
  const Icon = recommendation.icon;

  // Extract verdict from summary
  const verdictText = summary || 'Analysis pending. The AI agents are processing this script to provide detailed recommendations.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Studio Recommendation */}
        <div className={`p-6 rounded-xl border ${recommendation.borderColor} ${recommendation.bgColor}`}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Studio Recommendation
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <Icon className={`h-6 w-6 ${recommendation.color}`} />
            <span className={`text-xl font-bold ${recommendation.color}`}>
              {recommendation.label}
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {recommendation.description}
          </p>
        </div>

        {/* High-Level Verdict */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            High-Level Verdict
          </h2>
          <p className="text-foreground leading-relaxed">
            {verdictText.split('\n\n')[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
