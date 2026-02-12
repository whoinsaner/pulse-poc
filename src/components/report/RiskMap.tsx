import { AlertTriangle, Palette, TrendingUp, Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extractScore } from '@/lib/scoreUtils';

interface RiskMapProps {
  score: number;
  categoryScores: Record<string, unknown>;
}

export function RiskMap({ score, categoryScores }: RiskMapProps) {
  const getRiskLevel = (categoryScore: number): { level: string; color: string } => {
    if (categoryScore >= 70) return { level: 'Low', color: 'text-success' };
    if (categoryScore >= 50) return { level: 'Medium', color: 'text-warning' };
    return { level: 'High', color: 'text-destructive' };
  };

  const getMaturityStage = () => {
    if (score >= 75) return { stage: 'Production Ready (7-10/10)', description: 'Script is polished and ready for packaging with minor adjustments.' };
    if (score >= 55) return { stage: 'Development Territory (4-6/10)', description: 'Script has enough strengths that a focused rewrite can elevate it dramatically.' };
    if (score >= 35) return { stage: 'Early Development (2-4/10)', description: 'Core concept exists but foundational elements need significant work.' };
    return { stage: 'Concept Stage (0-2/10)', description: 'Ideas present but requires substantial development in all areas.' };
  };

  const risks = [
    {
      category: 'Creative Risk',
      icon: Palette,
      score: extractScore(categoryScores['Characters & Arcs']) || extractScore(categoryScores['Character']) || 60,
      description: 'Act I weakness, tonal drift, character motivation clarity',
    },
    {
      category: 'Market Risk',
      icon: TrendingUp,
      score: extractScore(categoryScores['Marketability']) || extractScore(categoryScores['Market']) || 60,
      description: 'Audience targeting, competitive positioning, timing',
    },
    {
      category: 'Production Risk',
      icon: Clapperboard,
      score: extractScore(categoryScores['Production Value']) || extractScore(categoryScores['Execution']) || 70,
      description: 'Budget requirements, location complexity, VFX needs',
    },
  ];

  const maturity = getMaturityStage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Risk Map Table */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Studio Verdict & Risk Map
          </h2>
          
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Risk Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Level</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk, index) => {
                  const { level, color } = getRiskLevel(risk.score);
                  return (
                    <tr key={risk.category} className={cn(index % 2 === 0 ? 'bg-card' : 'bg-muted/20')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium">
                          <risk.icon className="h-4 w-4 text-muted-foreground" />
                          {risk.category}
                        </div>
                      </td>
                      <td className={cn('px-4 py-3 font-semibold', color)}>
                        {level}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {risk.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maturity Assessment */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-xl font-bold mb-6">Maturity Assessment</h2>
          
          <div className="mb-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Current Stage</p>
            <p className="text-xl font-bold text-primary">{maturity.stage}</p>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">
            {maturity.description}
          </p>

          {/* Visual progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Development Progress</span>
              <span className="font-medium">{Math.round(score)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-chart-6 transition-all duration-1000"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
