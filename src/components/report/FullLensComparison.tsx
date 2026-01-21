import { useParams, Link } from 'react-router-dom';
import { StakeholderLens, LENS_CONFIG } from '@/types/database';
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
  Minus,
  Crown,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullLensComparisonProps {
  lensScores: Record<StakeholderLens, number>;
  overallScore: number;
  activeLens: StakeholderLens;
  onLensSelect: (lens: StakeholderLens) => void;
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
  investor: DollarSign,
};

const LENS_ORDER: StakeholderLens[] = [
  'studio_executive',
  'producer',
  'financier',
  'director',
  'writer',
  'actor',
  'ott_platform',
  'theatrical',
  'investor',
];

export function FullLensComparison({ 
  lensScores, 
  overallScore, 
  activeLens, 
  onLensSelect 
}: FullLensComparisonProps) {
  const { runId } = useParams<{ runId: string }>();
  
  const sortedLenses = LENS_ORDER
    .filter(lens => lensScores[lens] !== undefined)
    .sort((a, b) => lensScores[b] - lensScores[a]);

  const bestLens = sortedLenses[0];
  const worstLens = sortedLenses[sortedLenses.length - 1];
  const scoreRange = lensScores[bestLens] - lensScores[worstLens];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-chart-3';
    if (score >= 5) return 'text-chart-4';
    if (score >= 4) return 'text-warning';
    return 'text-destructive';
  };

  const getDeltaIndicator = (delta: number) => {
    if (delta > 0.5) return { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' };
    if (delta < -0.5) return { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' };
    return { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  return (
    <section className="min-h-screen py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-5/10 text-chart-5 text-sm font-medium">
            Stakeholder Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Multi-Lens Comparison
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how your script performs from {sortedLenses.length} different stakeholder perspectives
          </p>
        </div>

        {/* Overall score card */}
        <div className="mb-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-chart-6/10 border border-primary/30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Overall Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold gradient-text">{overallScore.toFixed(1)}</span>
                <span className="text-2xl text-muted-foreground">/ 10</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{lensScores[bestLens]?.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Best Fit</p>
                <p className="text-xs text-success">{LENS_CONFIG[bestLens]?.label}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-muted-foreground">{scoreRange.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Score Range</p>
                <p className="text-xs text-muted-foreground">High to Low</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{lensScores[worstLens]?.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Needs Work</p>
                <p className="text-xs text-warning">{LENS_CONFIG[worstLens]?.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lens grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedLenses.map((lens, index) => {
            const score = lensScores[lens];
            const delta = score - overallScore;
            const deltaInfo = getDeltaIndicator(delta);
            const DeltaIcon = deltaInfo.icon;
            const Icon = LENS_ICONS[lens];
            const config = LENS_CONFIG[lens];
            const isActive = lens === activeLens;
            const isBest = lens === bestLens;
            
            return (
              <button
                key={lens}
                onClick={() => onLensSelect(lens)}
                className={cn(
                  'relative p-6 rounded-2xl border text-left transition-all duration-300',
                  'hover:shadow-lg hover:-translate-y-1',
                  isActive 
                    ? 'bg-primary/10 border-primary shadow-lg' 
                    : 'bg-card border-border hover:border-primary/30',
                  'animate-fade-up'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Rank badge */}
                <div className={cn(
                  'absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  index === 0 ? 'bg-chart-4 text-chart-4-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {index === 0 ? <Crown className="h-4 w-4" /> : index + 1}
                </div>

                {/* Icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                  isActive ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Icon className={cn('h-6 w-6', isActive ? 'text-primary' : 'text-muted-foreground')} />
                </div>

                {/* Label */}
                <h4 className="font-semibold text-lg mb-1">{config.label}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{config.description}</p>

                {/* Score */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className={cn('text-3xl font-bold', getScoreColor(score))}>
                      {score.toFixed(1)}
                    </p>
                  </div>
                  
                  {/* Delta */}
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded',
                    deltaInfo.bg
                  )}>
                    <DeltaIcon className={cn('h-4 w-4', deltaInfo.color)} />
                    <span className={cn('text-sm font-medium', deltaInfo.color)}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all duration-1000',
                      score >= 8 ? 'bg-success' :
                      score >= 6 ? 'bg-chart-3' :
                      score >= 5 ? 'bg-chart-4' :
                      score >= 4 ? 'bg-warning' : 'bg-destructive'
                    )}
                    style={{ width: `${score * 10}%` }}
                  />
                </div>

                {/* View Full Report Link */}
                {runId && (
                  <Link 
                    to={`/report/${runId}/stakeholder/${lens}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Full {config.label} Report
                  </Link>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-primary rounded-b-2xl" />
                )}
              </button>
            );
          })}
        </div>

        {/* Insights row */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-success/5 border border-success/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <h4 className="font-semibold">Best Fit</h4>
            </div>
            <p className="text-2xl font-bold text-success mb-1">{LENS_CONFIG[bestLens]?.label}</p>
            <p className="text-sm text-muted-foreground">
              This script resonates most strongly with {LENS_CONFIG[bestLens]?.label.toLowerCase()}s, scoring {lensScores[bestLens]?.toFixed(1)}/10.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-muted">
                <Minus className="h-5 w-5 text-muted-foreground" />
              </div>
              <h4 className="font-semibold">Consensus</h4>
            </div>
            <p className="text-2xl font-bold mb-1">
              {scoreRange < 1 ? 'Strong' : scoreRange < 2 ? 'Moderate' : 'Varied'}
            </p>
            <p className="text-sm text-muted-foreground">
              {scoreRange < 1 
                ? 'High agreement across all stakeholders.'
                : scoreRange < 2 
                ? 'Some variation in stakeholder perspectives.'
                : 'Significant differences between stakeholder views.'}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingDown className="h-5 w-5 text-warning" />
              </div>
              <h4 className="font-semibold">Opportunity</h4>
            </div>
            <p className="text-2xl font-bold text-warning mb-1">{LENS_CONFIG[worstLens]?.label}</p>
            <p className="text-sm text-muted-foreground">
              Focus improvements here to broaden appeal and strengthen {LENS_CONFIG[worstLens]?.label.toLowerCase()} perspective.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
