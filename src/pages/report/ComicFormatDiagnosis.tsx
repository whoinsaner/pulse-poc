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
import { 
  LayoutPanelTop, 
  MessageCircle, 
  Palette, 
  Timer,
  Users,
  Factory,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDiagnosticCategory, getWeightTier } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  isComic?: boolean;
}

// Comic-specific navigation sections
const NAV_SECTIONS = [
  { id: 'cover', label: 'Cover', path: '' },
  { id: 'story', label: 'Story', path: '/story' },
  { id: 'characters', label: 'Characters', path: '/characters' },
  { id: 'craft', label: 'Craft', path: '/craft' },
  { id: 'format', label: 'Comic', path: '/format' },
  { id: 'commercial', label: 'Commercial', path: '/commercial' },
  { id: 'development', label: 'Development', path: '/development' },
];

// Comic-specific categories for parameter filtering
const COMIC_CATEGORIES = [
  'Comic Visuals',
  'Comic Dialogue',
  'Comic Pacing',
  'Comic Collaboration',
  'Comic Characters',
  'Comic Production',
  'Comic Market',
  'Comic Structure',
];

export default function ComicFormatDiagnosis() {
  const context = useOutletContext<ReportContextValue>();
  
  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;

  // Filter parameters for comic-specific categories
  const comicParameters = useMemo(() => {
    const params = reportData.parameterScores || [];
    return params
      .filter(p => COMIC_CATEGORIES.includes(p.category))
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        category: p.category,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        // Core comic parameters
        weight: p.parameterName.includes('sequential') || 
                p.parameterName.includes('panel') || 
                p.parameterName.includes('page_turn') ||
                p.parameterName.includes('lettering_legibility') ? 1.4 : 1.0,
      }));
  }, [reportData.parameterScores]);

  // Calculate section score
  const sectionScore = useMemo(() => {
    if (comicParameters.length === 0) return 0;
    const total = comicParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / comicParameters.length);
  }, [comicParameters]);

  // Get development focus items
  const developmentItems = useMemo(() => {
    return comicParameters
      .filter(p => p.score < 70)
      .sort((a, b) => {
        const weightDiff = (b.weight || 1) - (a.weight || 1);
        if (weightDiff !== 0) return weightDiff;
        return a.score - b.score;
      })
      .slice(0, 2)
      .map(p => ({
        title: p.displayName,
        description: p.rationale || '',
      }));
  }, [comicParameters]);

  // Get base path
  const basePath = window.location.pathname.split('/format')[0];

  // Comic-specific metric groups
  const metricGroups = useMemo(() => {
    return [
      {
        id: 'visuals',
        title: 'Visual Storytelling',
        icon: LayoutPanelTop,
        description: 'Panel flow and page architecture',
        params: comicParameters.filter(p => 
          p.category === 'Comic Visuals' ||
          p.parameterName.includes('panel') ||
          p.parameterName.includes('sequential') ||
          p.parameterName.includes('page')
        ),
      },
      {
        id: 'dialogue',
        title: 'Lettering & Dialogue',
        icon: MessageCircle,
        description: 'Balloon placement and word economy',
        params: comicParameters.filter(p => 
          p.category === 'Comic Dialogue' ||
          p.parameterName.includes('lettering') ||
          p.parameterName.includes('balloon') ||
          p.parameterName.includes('dialogue')
        ),
      },
      {
        id: 'pacing',
        title: 'Pacing & Rhythm',
        icon: Timer,
        description: 'Page turns and tempo control',
        params: comicParameters.filter(p => 
          p.category === 'Comic Pacing' ||
          p.parameterName.includes('pacing') ||
          p.parameterName.includes('page_turn') ||
          p.parameterName.includes('tempo')
        ),
      },
      {
        id: 'collaboration',
        title: 'Art-Script Synergy',
        icon: Palette,
        description: 'Artist collaboration readiness',
        params: comicParameters.filter(p => 
          p.category === 'Comic Collaboration' ||
          p.parameterName.includes('synergy') ||
          p.parameterName.includes('collaboration')
        ),
      },
      {
        id: 'characters',
        title: 'Visual Characters',
        icon: Users,
        description: 'Character design and identity',
        params: comicParameters.filter(p => 
          p.category === 'Comic Characters' ||
          p.parameterName.includes('character_visual')
        ),
      },
      {
        id: 'production',
        title: 'Production Pipeline',
        icon: Factory,
        description: 'Production feasibility',
        params: comicParameters.filter(p => 
          p.category === 'Comic Production' ||
          p.parameterName.includes('production') ||
          p.parameterName.includes('pipeline')
        ),
      },
      {
        id: 'market',
        title: 'Comic Market',
        icon: TrendingUp,
        description: 'Publishing alignment',
        params: comicParameters.filter(p => 
          p.category === 'Comic Market' ||
          p.parameterName.includes('market') ||
          p.parameterName.includes('publishing')
        ),
      },
      {
        id: 'structure',
        title: 'Issue Structure',
        icon: Layers,
        description: 'Arc and issue architecture',
        params: comicParameters.filter(p => 
          p.category === 'Comic Structure' ||
          p.parameterName.includes('issue') ||
          p.parameterName.includes('arc_structure')
        ),
      },
    ];
  }, [comicParameters]);

  // Get category scores for the format badge
  const categoryScores = reportData.categoryScores || {};
  const visualScore = categoryScores['Comic Visuals'] || 0;
  const dialogueScore = categoryScores['Comic Dialogue'] || 0;
  const pacingScore = categoryScores['Comic Pacing'] || 0;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Comic Format Diagnosis"
        subtitle="Visual storytelling, panel economy, lettering, and artist collaboration"
        icon={LayoutPanelTop}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* Format Badge */}
      <Card className="p-4 bg-chart-5/5 border-chart-5/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutPanelTop className="h-5 w-5 text-chart-5" />
            <div>
              <p className="font-medium">Comic Script Format</p>
              <p className="text-xs text-muted-foreground">
                {comicParameters.length} comic-specific parameters analyzed
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-chart-5/10 text-chart-5">
              Visuals: {Math.round(visualScore)}
            </Badge>
            <Badge variant="secondary" className="bg-chart-4/10 text-chart-4">
              Dialogue: {Math.round(dialogueScore)}
            </Badge>
            <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">
              Pacing: {Math.round(pacingScore)}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Diagnosis Summary */}
      <DiagnosisSummary
        parameters={comicParameters}
        categoryName="Comic Format"
        developmentLink={`${basePath}/development`}
      />

      {/* Key Metrics Overview */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Comic-Specific Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Panel Flow', score: visualScore, icon: LayoutPanelTop },
            { label: 'Lettering', score: dialogueScore, icon: MessageCircle },
            { label: 'Page Turns', score: pacingScore, icon: Timer },
            { label: 'Art Synergy', score: categoryScores['Comic Collaboration'] || 0, icon: Palette },
          ].map((metric) => {
            const diagnostic = getDiagnosticCategory(metric.score);
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="text-center">
                <div className={cn('w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center', diagnostic.bgColor)}>
                  <Icon className={cn('h-5 w-5', diagnostic.color)} />
                </div>
                <p className={cn('font-mono font-bold text-xl', diagnostic.color)}>
                  {Math.round(metric.score)}
                </p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

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
                      <Badge variant="outline" className="text-[10px] text-chart-5 border-chart-5/30">
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
                {group.params.slice(0, 4).map((param) => {
                  const weightTier = getWeightTier(param.weight);
                  return (
                    <div key={param.parameterName} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {weightTier.tier === 'core' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-chart-5" />
                        )}
                        <span className="text-muted-foreground truncate">{param.displayName}</span>
                      </div>
                      <span className="font-mono">{param.score}</span>
                    </div>
                  );
                })}
                {group.params.length > 4 && (
                  <p className="text-xs text-muted-foreground">+{group.params.length - 4} more</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={comicParameters}
        title="Comic Parameter Breakdown"
        initiallyExpanded={false}
        showAllByDefault={false}
      />

      {/* Development Focus */}
      {developmentItems.length > 0 && (
        <DevelopmentFocus
          sectionName="Comic Format"
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
