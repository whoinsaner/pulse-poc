import { StakeholderLens, LENS_CONFIG } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { cn } from '@/lib/utils';
import { Tv, Film, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PlatformComparisonProps {
  lensScores: Record<StakeholderLens, number>;
  className?: string;
}

export function PlatformComparison({ lensScores, className }: PlatformComparisonProps) {
  const ottScore = lensScores.ott_platform || 0;
  const theatricalScore = lensScores.theatrical || 0;
  const difference = ottScore - theatricalScore;
  
  const getRecommendation = () => {
    if (Math.abs(difference) < 5) {
      return {
        text: 'Versatile - Works for Both',
        icon: Minus,
        color: 'text-info',
        description: 'This script shows similar appeal for both streaming and theatrical release strategies.',
      };
    }
    if (difference > 0) {
      return {
        text: 'Streaming Recommended',
        icon: TrendingUp,
        color: 'text-success',
        description: `This script scores ${Math.round(difference)} points higher for OTT platforms. Consider streaming-first strategy.`,
      };
    }
    return {
      text: 'Theatrical Recommended',
      icon: TrendingUp,
      color: 'text-primary',
      description: `This script scores ${Math.round(Math.abs(difference))} points higher for theatrical release. Big-screen experience recommended.`,
    };
  };

  const recommendation = getRecommendation();
  const RecommendationIcon = recommendation.icon;

  const factors = [
    {
      label: 'Binge-ability',
      ott: ottScore > 70 ? 'High' : ottScore > 50 ? 'Medium' : 'Low',
      theatrical: theatricalScore > 70 ? 'High' : theatricalScore > 50 ? 'Medium' : 'Low',
      ottAdvantage: ottScore > theatricalScore,
    },
    {
      label: 'Visual Scale',
      ott: 'Standard',
      theatrical: theatricalScore > 70 ? 'Spectacular' : 'Good',
      ottAdvantage: false,
    },
    {
      label: 'Release Flexibility',
      ott: 'High',
      theatrical: 'Limited',
      ottAdvantage: true,
    },
    {
      label: 'Revenue Potential',
      ott: 'Steady',
      theatrical: theatricalScore > 75 ? 'High (if successful)' : 'Variable',
      ottAdvantage: theatricalScore < 75,
    },
  ];

  return (
    <div className={cn('bg-gradient-to-br from-card to-muted/30 rounded-xl border border-border overflow-hidden', className)}>
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-bold mb-2">Platform Fit Analysis</h3>
        <p className="text-muted-foreground text-sm">
          Compare streaming vs theatrical release potential
        </p>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* OTT Platform */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Tv className="h-5 w-5 text-info" />
            </div>
            <div>
              <h4 className="font-semibold">{LENS_CONFIG.ott_platform.label}</h4>
              <p className="text-xs text-muted-foreground">{LENS_CONFIG.ott_platform.description}</p>
            </div>
          </div>
          <div className="flex justify-center py-4">
            <ScoreRing score={ottScore} size="lg" showLabel label="OTT Score" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Series Potential</span>
              <span className={ottScore > 70 ? 'text-success font-medium' : ''}>
                {ottScore > 70 ? 'High' : ottScore > 50 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Audience Retention</span>
              <span className={ottScore > 65 ? 'text-success font-medium' : ''}>
                {ottScore > 65 ? 'Strong' : 'Average'}
              </span>
            </div>
          </div>
        </div>

        {/* Theatrical */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{LENS_CONFIG.theatrical.label}</h4>
              <p className="text-xs text-muted-foreground">{LENS_CONFIG.theatrical.description}</p>
            </div>
          </div>
          <div className="flex justify-center py-4">
            <ScoreRing score={theatricalScore} size="lg" showLabel label="Theatrical Score" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event Appeal</span>
              <span className={theatricalScore > 70 ? 'text-success font-medium' : ''}>
                {theatricalScore > 70 ? 'High' : theatricalScore > 50 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visual Spectacle</span>
              <span className={theatricalScore > 65 ? 'text-success font-medium' : ''}>
                {theatricalScore > 65 ? 'Strong' : 'Standard'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="p-6 bg-muted/30 border-t border-border">
        <div className="flex items-start gap-4">
          <div className={cn('p-2 rounded-lg', 
            difference > 5 ? 'bg-success/10' : 
            difference < -5 ? 'bg-primary/10' : 
            'bg-info/10'
          )}>
            <RecommendationIcon className={cn('h-5 w-5', recommendation.color)} />
          </div>
          <div>
            <h4 className={cn('font-semibold', recommendation.color)}>
              {recommendation.text}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {recommendation.description}
            </p>
          </div>
        </div>

        {/* Quick comparison table */}
        <div className="mt-6 rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Factor</th>
                <th className="px-3 py-2 text-center font-medium">OTT</th>
                <th className="px-3 py-2 text-center font-medium">Theatrical</th>
              </tr>
            </thead>
            <tbody>
              {factors.map((factor, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-3 py-2 text-muted-foreground">{factor.label}</td>
                  <td className={cn(
                    'px-3 py-2 text-center',
                    factor.ottAdvantage && 'font-medium text-success'
                  )}>
                    {factor.ott}
                  </td>
                  <td className={cn(
                    'px-3 py-2 text-center',
                    !factor.ottAdvantage && 'font-medium text-primary'
                  )}>
                    {factor.theatrical}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
