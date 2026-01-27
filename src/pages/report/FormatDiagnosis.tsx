import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SectionHeader, 
  DiagnosisSummary,
  WeightedParameterList,
  DevelopmentFocus,
  SectionNavigator,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { Monitor, Smartphone, Zap, TrendingUp, Clock, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDiagnosticCategory, getWeightTier } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  isWebSeries?: boolean;
  episodeLengthClass?: string;
}

// Navigation sections
const NAV_SECTIONS = [
  { id: 'cover', label: 'Cover', path: '' },
  { id: 'story', label: 'Story', path: '/story' },
  { id: 'characters', label: 'Characters', path: '/characters' },
  { id: 'craft', label: 'Craft', path: '/craft' },
  { id: 'format', label: 'Format', path: '/format' },
  { id: 'commercial', label: 'Commercial', path: '/commercial' },
  { id: 'development', label: 'Development', path: '/development' },
];

export default function FormatDiagnosis() {
  const context = useOutletContext<ReportContextValue>();
  
  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;
  const scriptType = reportData.scriptMetadata?.scriptType;
  const isWebSeries = scriptType === 'web_series';
  const isMicroDrama = scriptType === 'micro_drama';

  // Determine format category
  const formatCategory = isWebSeries ? 'Web Series' : isMicroDrama ? 'Micro Drama' : null;
  
  if (!formatCategory) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No format-specific analysis available for this script type.</p>
      </div>
    );
  }

  // Filter parameters for format category
  const formatParameters = useMemo(() => {
    const params = reportData.parameterScores || [];
    return params
      .filter(p => p.category === formatCategory)
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        // Web series hooks and retention are CORE parameters
        weight: p.parameterName.includes('hook') || 
                p.parameterName.includes('retention') || 
                p.parameterName.includes('binge') ? 1.4 : 1.0,
      }));
  }, [reportData.parameterScores, formatCategory]);

  // Calculate section score
  const sectionScore = useMemo(() => {
    if (formatParameters.length === 0) return 0;
    const total = formatParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / formatParameters.length);
  }, [formatParameters]);

  // Get development focus items
  const developmentItems = useMemo(() => {
    return formatParameters
      .filter(p => p.score < 70)
      .sort((a, b) => {
        // Prioritize core parameters (higher weight)
        const weightDiff = (b.weight || 1) - (a.weight || 1);
        if (weightDiff !== 0) return weightDiff;
        return a.score - b.score;
      })
      .slice(0, 2)
      .map(p => ({
        title: p.displayName,
        description: p.rationale || '',
      }));
  }, [formatParameters]);

  // Get base path
  const basePath = window.location.pathname.split('/format')[0];

  // Format-specific metrics groupings
  const metricGroups = useMemo(() => {
    if (isWebSeries) {
      return [
        {
          id: 'engagement',
          title: 'Engagement Hooks',
          icon: Zap,
          description: 'First 30 seconds performance',
          params: formatParameters.filter(p => 
            p.parameterName.includes('hook') || 
            p.parameterName.includes('scroll_stop')
          ),
        },
        {
          id: 'retention',
          title: 'Retention Design',
          icon: TrendingUp,
          description: 'Keeping viewers watching',
          params: formatParameters.filter(p => 
            p.parameterName.includes('retention') || 
            p.parameterName.includes('momentum') ||
            p.parameterName.includes('binge')
          ),
        },
        {
          id: 'platform',
          title: 'Platform Fit',
          icon: Monitor,
          description: 'Algorithm compatibility',
          params: formatParameters.filter(p => 
            p.parameterName.includes('platform') || 
            p.parameterName.includes('algorithmic') ||
            p.parameterName.includes('shareability')
          ),
        },
        {
          id: 'serial',
          title: 'Serial Momentum',
          icon: Clock,
          description: 'Episode-to-episode pull',
          params: formatParameters.filter(p => 
            p.parameterName.includes('serial') || 
            p.parameterName.includes('episodic') ||
            p.parameterName.includes('stickiness')
          ),
        },
      ];
    }
    
    // Micro drama groupings
    return [
      {
        id: 'velocity',
        title: 'Hook Velocity',
        icon: Zap,
        description: 'Speed to first hook',
        params: formatParameters.filter(p => 
          p.parameterName.includes('hook') || 
          p.parameterName.includes('velocity')
        ),
      },
      {
        id: 'density',
        title: 'Cliff Density',
        icon: TrendingUp,
        description: 'Cliffhangers per minute',
        params: formatParameters.filter(p => 
          p.parameterName.includes('cliff') || 
          p.parameterName.includes('density')
        ),
      },
      {
        id: 'scroll',
        title: 'Scroll-Stop Power',
        icon: Smartphone,
        description: 'Thumb-stopping moments',
        params: formatParameters.filter(p => 
          p.parameterName.includes('scroll') || 
          p.parameterName.includes('stop')
        ),
      },
      {
        id: 'share',
        title: 'Shareability',
        icon: Share2,
        description: 'Viral potential',
        params: formatParameters.filter(p => 
          p.parameterName.includes('share') || 
          p.parameterName.includes('viral')
        ),
      },
    ];
  }, [isWebSeries, formatParameters]);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title={`${formatCategory} Diagnosis`}
        subtitle={isWebSeries 
          ? 'Hook efficiency, retention design, and platform compatibility'
          : 'Velocity, cliff density, and scroll-stop optimization'
        }
        icon={isWebSeries ? Monitor : Smartphone}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* Format Badge */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isWebSeries ? (
              <Monitor className="h-5 w-5 text-primary" />
            ) : (
              <Smartphone className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="font-medium">{formatCategory} Format</p>
              <p className="text-xs text-muted-foreground">
                {formatParameters.length} specialized parameters analyzed
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {reportData.scriptMetadata?.episodeLengthClass?.replace('_', ' ') || 'Standard'}
          </Badge>
        </div>
      </Card>

      {/* Diagnosis Summary */}
      <DiagnosisSummary
        parameters={formatParameters}
        categoryName={formatCategory}
        developmentLink={`${basePath}/development`}
      />

      {/* Metric Groups Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {metricGroups.filter(g => g.params.length > 0).map((group) => {
          const avgScore = group.params.length > 0
            ? Math.round(group.params.reduce((sum, p) => sum + p.score, 0) / group.params.length)
            : 0;
          const diagnostic = getDiagnosticCategory(avgScore);
          const Icon = group.icon;
          const hasCore = group.params.some(p => (p.weight || 1) >= 1.2);

          return (
            <Card key={group.id} className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={cn('p-2 rounded-lg', diagnostic.bgColor)}>
                  <Icon className={cn('h-4 w-4', diagnostic.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{group.title}</h4>
                    {hasCore && (
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                        CORE
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
                <span className={cn('font-mono font-bold text-xl', diagnostic.color)}>
                  {avgScore}
                </span>
              </div>
              
              <div className="space-y-2">
                {group.params.map((param) => {
                  const weightTier = getWeightTier(param.weight);
                  return (
                    <div key={param.parameterName} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {weightTier.tier === 'core' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        <span className="text-muted-foreground">{param.displayName}</span>
                      </div>
                      <span className="font-mono">{param.score}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={formatParameters}
        title={`${formatCategory} Parameter Breakdown`}
        initiallyExpanded={true}
        showAllByDefault
      />

      {/* Development Focus */}
      {developmentItems.length > 0 && (
        <DevelopmentFocus
          sectionName={formatCategory}
          items={developmentItems}
          developmentPath={`${basePath}/development`}
          relatedSections={[
            { label: 'Story Diagnosis', path: `${basePath}/story` },
            { label: 'Commercial Diagnosis', path: `${basePath}/commercial` },
          ]}
        />
      )}

      {/* Section Navigator */}
      <SectionNavigator
        sections={NAV_SECTIONS}
        currentSection="format"
        basePath={basePath}
      />
    </div>
  );
}
