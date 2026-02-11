import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  DiagnosisSummary,
  WeightedParameterList,
  DevelopmentFocus,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { BookOpen } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

// Categories that belong to Story diagnosis
const STORY_CATEGORIES = ['Concept & Hook', 'Structure', 'Conflict'];

// Navigation sections for the navigator
const NAV_SECTIONS = [
  { id: 'cover', label: 'Cover', path: '' },
  { id: 'story', label: 'Story', path: '/story' },
  { id: 'characters', label: 'Characters', path: '/characters' },
  { id: 'craft', label: 'Craft', path: '/craft' },
  { id: 'commercial', label: 'Commercial', path: '/commercial' },
  { id: 'development', label: 'Development', path: '/development' },
];

export default function StoryDiagnosis() {
  const context = useOutletContext<ReportContextValue>();

  // Filter parameters for story categories
  const storyParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => STORY_CATEGORIES.includes(p.category))
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        weight: 1.0,
      }));
  }, [context?.reportData?.parameterScores]);

  // Calculate section score
  const sectionScore = useMemo(() => {
    if (storyParameters.length === 0) return 0;
    const total = storyParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / storyParameters.length);
  }, [storyParameters]);
  
  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;

  // Get base path from current location
  const basePath = window.location.pathname.split('/story')[0];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Story Diagnosis"
        subtitle="Concept, structure, and conflict fundamentals"
        icon={BookOpen}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* Diagnosis Summary */}
      <DiagnosisSummary
        parameters={storyParameters}
        categoryName="Story"
        developmentLink={`${basePath}/development`}
      />

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={storyParameters}
        title="Story Parameter Breakdown"
        initiallyExpanded={false}
        defaultVisibleCount={6}
      />


      {/* Fallback: Category Deep-Dives (when no agentContent) */}
      {!reportData.agentContent && (
        <div className="grid gap-6">
          <CategoryCard title="Concept & Hook" parameters={storyParameters.filter(p => 
            p.parameterName.includes('concept') || p.parameterName.includes('hook') || p.parameterName.includes('familiarity') || p.parameterName.includes('franchise')
          )} />
          <CategoryCard title="Structure" parameters={storyParameters.filter(p => 
            p.parameterName.includes('structure') || p.parameterName.includes('inciting') || p.parameterName.includes('escalation') || p.parameterName.includes('climax') || p.parameterName.includes('setup') || p.parameterName.includes('scene_necessity') || p.parameterName.includes('pacing')
          )} />
          <CategoryCard title="Conflict" parameters={storyParameters.filter(p => 
            p.parameterName.includes('conflict') || p.parameterName.includes('stakes') || p.parameterName.includes('obstacle') || p.parameterName.includes('tension')
          )} />
        </div>
      )}

      {/* Development Focus */}
      {(() => {
        const items = storyParameters
          .filter(p => p.score < 70)
          .sort((a, b) => a.score - b.score)
          .map(p => ({ title: p.displayName, description: p.rationale || '' }));
        return items.length > 0 ? (
          <DevelopmentFocus
            sectionName="Story"
            items={items}
            developmentPath={`${basePath}/development`}
            relatedSections={[
              { label: 'Character Diagnosis', path: `${basePath}/characters` },
              { label: 'Craft Diagnosis', path: `${basePath}/craft` },
            ]}
          />
        ) : null;
      })()}

    </div>
  );
}

// Helper component for category breakdowns
interface CategoryCardProps {
  title: string;
  parameters: Array<{
    parameterName: string;
    displayName: string;
    score: number;
    rationale?: string;
  }>;
}

function CategoryCard({ title, parameters }: CategoryCardProps) {
  if (parameters.length === 0) return null;

  const avgScore = Math.round(
    parameters.reduce((sum, p) => sum + p.score, 0) / parameters.length
  );

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">{title}</h4>
        <span className="font-mono font-bold text-sm">{avgScore}</span>
      </div>
      <div className="space-y-3">
        {parameters.slice(0, 4).map((param) => (
          <div key={param.parameterName} className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{param.displayName}</span>
                <span className="text-sm font-mono">{param.score}</span>
              </div>
              {param.rationale && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {param.rationale}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
