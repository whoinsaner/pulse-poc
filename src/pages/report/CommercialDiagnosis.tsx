import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, LENS_CONFIG } from '@/types/database';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SectionHeader, 
  DiagnosisSummary,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { TrendingUp, Target, Film, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDiagnosticCategory } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

// Categories that belong to Commercial diagnosis
const COMMERCIAL_CATEGORIES = ['Market', 'Execution'];


export default function CommercialDiagnosis() {
  const context = useOutletContext<ReportContextValue>();
  
  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData, activeLens } = context;

  // Filter parameters for commercial categories
  const commercialParameters = useMemo(() => {
    const params = reportData.parameterScores || [];
    return params
      .filter(p => COMMERCIAL_CATEGORIES.includes(p.category))
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        weight: 1.0,
      }));
  }, [reportData.parameterScores]);

  // Calculate section score
  const sectionScore = useMemo(() => {
    if (commercialParameters.length === 0) return 0;
    const total = commercialParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / commercialParameters.length);
  }, [commercialParameters]);

  // Get development focus items
  const developmentItems = useMemo(() => {
    return commercialParameters
      .filter(p => p.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map(p => ({
        title: p.displayName,
        description: p.rationale || '',
      }));
  }, [commercialParameters]);

  // Get base path
  const basePath = window.location.pathname.split('/commercial')[0];

  // Lens scores for comparison
  const lensScores = reportData.lensScores || {};
  const sortedLenses = Object.entries(lensScores)
    .filter(([, score]) => typeof score === 'number')
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5) as [StakeholderLens, number][];

  // Commercial dimensions
  const dimensions = useMemo(() => [
    {
      id: 'market',
      title: 'Marketability',
      icon: TrendingUp,
      params: commercialParameters.filter(p => 
        p.parameterName.includes('market') || 
        p.parameterName.includes('comparable') || 
        p.parameterName.includes('trend') ||
        p.parameterName.includes('genre')
      ),
    },
    {
      id: 'audience',
      title: 'Audience Fit',
      icon: Target,
      params: commercialParameters.filter(p => 
        p.parameterName.includes('audience') || 
        p.parameterName.includes('demographic') || 
        p.parameterName.includes('appeal')
      ),
    },
    {
      id: 'production',
      title: 'Production Viability',
      icon: Film,
      params: commercialParameters.filter(p => 
        p.parameterName.includes('production') || 
        p.parameterName.includes('budget') || 
        p.parameterName.includes('feasibility') ||
        p.parameterName.includes('location')
      ),
    },
  ].filter(d => d.params.length > 0), [commercialParameters]);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Commercial Diagnosis"
        subtitle="Marketability, audience fit, and production viability"
        icon={TrendingUp}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* Lens Scores Overview */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Stakeholder Scores
          </h3>
          <Badge variant="outline" className="ml-auto">
            Viewing as: {LENS_CONFIG[activeLens].label}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {sortedLenses.map(([lens, score]) => {
            const diagnostic = getDiagnosticCategory(score);
            const isActive = lens === activeLens;
            
            return (
              <div 
                key={lens}
                className={cn(
                  'p-3 rounded-lg border text-center transition-colors',
                  isActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border/50 bg-muted/30'
                )}
              >
                <p className="text-xs text-muted-foreground truncate mb-1">
                  {LENS_CONFIG[lens].label}
                </p>
                <p className={cn('font-mono font-bold text-lg', diagnostic.color)}>
                  {Math.round(score)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Diagnosis Summary */}
      <DiagnosisSummary
        parameters={commercialParameters}
        categoryName="Commercial"
        developmentLink={`${basePath}/development`}
      />

      {/* Commercial Dimensions */}
      <div className="grid md:grid-cols-3 gap-4">
        {dimensions.map((dimension) => {
          const avgScore = dimension.params.length > 0
            ? Math.round(dimension.params.reduce((sum, p) => sum + p.score, 0) / dimension.params.length)
            : 0;
          const diagnostic = getDiagnosticCategory(avgScore);
          const Icon = dimension.icon;

          return (
            <Card key={dimension.id} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn('p-2 rounded-lg', diagnostic.bgColor)}>
                  <Icon className={cn('h-4 w-4', diagnostic.color)} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{dimension.title}</h4>
                </div>
              </div>
              
              <div className="text-center py-4">
                <span className={cn('font-mono font-bold text-3xl', diagnostic.color)}>
                  {avgScore}
                </span>
              </div>
              
              <div className="space-y-1.5 pt-3 border-t border-border/50">
                {dimension.params.slice(0, 2).map((param) => (
                  <div key={param.parameterName} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate">{param.displayName}</span>
                    <span className="font-mono ml-2">{param.score}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={commercialParameters}
        title="Commercial Parameter Breakdown"
        initiallyExpanded={false}
        defaultVisibleCount={6}
      />

      {/* Development Focus */}
      {developmentItems.length > 0 && (
        <DevelopmentFocus
          sectionName="Commercial"
          items={developmentItems}
          developmentPath={`${basePath}/development`}
          relatedSections={[
            { label: 'Story Diagnosis', path: `${basePath}/story` },
            { label: 'Craft Diagnosis', path: `${basePath}/craft` },
          ]}
        />
      )}

    </div>
  );
}
