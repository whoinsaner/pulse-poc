import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens, AgentSectionContent } from '@/types/database';
import { AgentNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  DiagnosisSummary,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { Palette, MessageSquare, Heart, Eye, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDiagnosticCategory } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

// Categories that belong to Craft diagnosis
const CRAFT_CATEGORIES = ['Dialogue', 'Theme', 'World & Logic', 'Emotional Arc', 'World', 'Emotion'];

// Navigation sections
const NAV_SECTIONS = [
  { id: 'cover', label: 'Cover', path: '' },
  { id: 'story', label: 'Story', path: '/story' },
  { id: 'characters', label: 'Characters', path: '/characters' },
  { id: 'craft', label: 'Craft', path: '/craft' },
  { id: 'commercial', label: 'Commercial', path: '/commercial' },
  { id: 'development', label: 'Development', path: '/development' },
];

export default function CraftDiagnosis() {
  const context = useOutletContext<ReportContextValue>();
  
  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;

  // Filter parameters for craft categories
  const craftParameters = useMemo(() => {
    const params = reportData.parameterScores || [];
    return params
      .filter(p => CRAFT_CATEGORIES.includes(p.category))
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        weight: p.parameterName.includes('exposition') ? 1.2 : 1.0, // Higher weight for dialogue issues
      }));
  }, [reportData.parameterScores]);

  // Calculate section score
  const sectionScore = useMemo(() => {
    if (craftParameters.length === 0) return 0;
    const total = craftParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / craftParameters.length);
  }, [craftParameters]);

  // Get development focus items
  const developmentItems = useMemo(() => {
    return craftParameters
      .filter(p => p.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map(p => ({
        title: p.displayName,
        description: p.rationale || '',
      }));
  }, [craftParameters]);

  // Get base path
  const basePath = window.location.pathname.split('/craft')[0];

  // Group by craft dimension
  const dimensions = useMemo(() => [
    {
      id: 'dialogue',
      title: 'Dialogue',
      icon: MessageSquare,
      params: craftParameters.filter(p => 
        p.parameterName.includes('dialogue') || 
        p.parameterName.includes('subtext') || 
        p.parameterName.includes('exposition') ||
        p.parameterName.includes('voice')
      ),
    },
    {
      id: 'theme',
      title: 'Theme & Meaning',
      icon: Heart,
      params: craftParameters.filter(p => 
        p.parameterName.includes('theme') || 
        p.parameterName.includes('moral') || 
        p.parameterName.includes('message') ||
        p.parameterName.includes('resonance')
      ),
    },
    {
      id: 'visual',
      title: 'Visual Storytelling',
      icon: Eye,
      params: craftParameters.filter(p => 
        p.parameterName.includes('visual') || 
        p.parameterName.includes('world') || 
        p.parameterName.includes('atmosphere') ||
        p.parameterName.includes('setting')
      ),
    },
    {
      id: 'emotional',
      title: 'Emotional Arc',
      icon: Sparkles,
      params: craftParameters.filter(p => 
        p.parameterName.includes('emotion') || 
        p.parameterName.includes('tone') || 
        p.parameterName.includes('catharsis')
      ),
    },
  ].filter(d => d.params.length > 0), [craftParameters]);

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Craft Diagnosis"
        subtitle="Dialogue, theme, visual storytelling, and emotional resonance"
        icon={Palette}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* Diagnosis Summary */}
      <DiagnosisSummary
        parameters={craftParameters}
        categoryName="Craft"
        developmentLink={`${basePath}/development`}
      />

      {/* Craft Dimensions Grid */}
      <div className="grid md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-muted-foreground">
                    {dimension.params.length} parameters
                  </p>
                </div>
                <span className={cn('font-mono font-bold text-lg', diagnostic.color)}>
                  {avgScore}
                </span>
              </div>
              
              <div className="space-y-2">
                {dimension.params.slice(0, 3).map((param) => (
                  <div key={param.parameterName} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate">{param.displayName}</span>
                    <span className="font-mono ml-2">{param.score}</span>
                  </div>
                ))}
                {dimension.params.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{dimension.params.length - 3} more
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={craftParameters}
        title="Craft Parameter Breakdown"
        initiallyExpanded={false}
        defaultVisibleCount={6}
      />

      {/* Development Focus */}
      {developmentItems.length > 0 && (
        <DevelopmentFocus
          sectionName="Craft"
          items={developmentItems}
          developmentPath={`${basePath}/development`}
          relatedSections={[
            { label: 'Story Diagnosis', path: `${basePath}/story` },
            { label: 'Character Diagnosis', path: `${basePath}/characters` },
          ]}
        />
      )}

    </div>
  );
}
