import { StakeholderLens, LENS_CONFIG } from '@/types/database';
import { ScoreRing } from '@/components/ScoreRing';
import { cn } from '@/lib/utils';
import { 
  Building2, 
  Clapperboard, 
  User, 
  Camera, 
  PenTool, 
  DollarSign, 
  Tv, 
  Film,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface LensComparisonProps {
  lensScores: Record<StakeholderLens, number>;
  overallScore: number;
  activeLens?: StakeholderLens;
  onLensSelect?: (lens: StakeholderLens) => void;
}

const LENS_ICONS: Record<StakeholderLens, React.ComponentType<{ className?: string }>> = {
  studio_executive: Building2,
  producer: Clapperboard,
  actor: User,
  director: Camera,
  writer: PenTool,
  financier: DollarSign,
  ott_platform: Tv,
  theatrical: Film,
};

const LENS_ORDER: StakeholderLens[] = [
  'studio_executive',
  'producer',
  'director',
  'writer',
  'actor',
  'financier',
  'ott_platform',
  'theatrical',
];

export function LensComparison({ 
  lensScores, 
  overallScore, 
  activeLens,
  onLensSelect 
}: LensComparisonProps) {
  // Sort lenses by score for ranking
  const sortedLenses = [...LENS_ORDER].sort(
    (a, b) => (lensScores[b] || 0) - (lensScores[a] || 0)
  );
  
  const highestScore = Math.max(...Object.values(lensScores));
  const lowestScore = Math.min(...Object.values(lensScores));
  const scoreRange = highestScore - lowestScore;

  const getDeltaFromOverall = (score: number) => score - overallScore;

  const getDeltaIndicator = (delta: number) => {
    if (delta > 3) return { icon: TrendingUp, color: 'text-emerald-500', label: `+${delta}` };
    if (delta < -3) return { icon: TrendingDown, color: 'text-destructive', label: `${delta}` };
    return { icon: Minus, color: 'text-muted-foreground', label: delta === 0 ? '0' : delta > 0 ? `+${delta}` : `${delta}` };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Stakeholder Lens Comparison</h3>
          <p className="text-sm text-muted-foreground">
            How different stakeholders view this script's potential
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Score</p>
          <p className="text-2xl font-bold">{overallScore}</p>
        </div>
      </div>

      {/* Score Range Indicator */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Score Range</span>
            <span>{lowestScore} – {highestScore}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-destructive via-amber-500 to-emerald-500"
              style={{ 
                marginLeft: `${(lowestScore / 100) * 100}%`,
                width: `${(scoreRange / 100) * 100}%` 
              }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Variance</p>
          <p className="font-semibold">{scoreRange} pts</p>
        </div>
      </div>

      {/* Lens Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {LENS_ORDER.map((lens, index) => {
          const config = LENS_CONFIG[lens];
          const Icon = LENS_ICONS[lens];
          const score = lensScores[lens] || 0;
          const delta = getDeltaFromOverall(score);
          const deltaInfo = getDeltaIndicator(delta);
          const DeltaIcon = deltaInfo.icon;
          const rank = sortedLenses.indexOf(lens) + 1;
          const isTop = rank === 1;
          const isBottom = rank === 8;
          const isActive = activeLens === lens;

          return (
            <button
              key={lens}
              onClick={() => onLensSelect?.(lens)}
              className={cn(
                'relative p-4 rounded-xl border transition-all duration-200 text-left',
                'hover:border-primary/50 hover:bg-muted/50',
                isActive && 'ring-2 ring-primary border-primary bg-primary/5',
                isTop && !isActive && 'border-emerald-500/50 bg-emerald-500/5',
                isBottom && !isActive && 'border-destructive/30 bg-destructive/5',
                !isTop && !isBottom && !isActive && 'border-border bg-card'
              )}
            >
              {/* Rank Badge */}
              <div className={cn(
                'absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                isTop && 'bg-emerald-500 text-white',
                isBottom && 'bg-destructive text-white',
                !isTop && !isBottom && 'bg-muted text-muted-foreground'
              )}>
                {rank}
              </div>

              {/* Icon & Label */}
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  isActive ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Icon className={cn(
                    'h-4 w-4',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{config.label}</p>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{score}</p>
                  <div className={cn('flex items-center gap-1 mt-1', deltaInfo.color)}>
                    <DeltaIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">{deltaInfo.label}</span>
                  </div>
                </div>
                <ScoreRing score={score} size="sm" showLabel={false} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Best Fit */}
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Best Fit</p>
          </div>
          <p className="text-lg font-bold">{LENS_CONFIG[sortedLenses[0]].label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Scores {getDeltaFromOverall(lensScores[sortedLenses[0]])} points above average
          </p>
        </div>

        {/* Most Challenging */}
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <p className="text-sm font-medium text-destructive">Needs Work For</p>
          </div>
          <p className="text-lg font-bold">{LENS_CONFIG[sortedLenses[7]].label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Scores {Math.abs(getDeltaFromOverall(lensScores[sortedLenses[7]]))} points below average
          </p>
        </div>

        {/* Consensus */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Stakeholder Consensus</p>
          </div>
          <p className="text-lg font-bold">
            {scoreRange <= 5 ? 'Strong' : scoreRange <= 10 ? 'Moderate' : 'Weak'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {scoreRange <= 5 
              ? 'All stakeholders agree on potential' 
              : scoreRange <= 10 
                ? 'Some variance in stakeholder views'
                : 'Significant disagreement between stakeholders'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
