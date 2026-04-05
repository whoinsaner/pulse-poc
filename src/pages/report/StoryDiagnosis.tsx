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

      {/* Tradition Context */}
      {reportData.scriptMetadata?.cinemaTradition && reportData.scriptMetadata.cinemaTradition !== 'auto_detect' && (
        <Card className="p-5 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Tradition Context</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            This script was evaluated under <span className="font-medium text-foreground capitalize">{reportData.scriptMetadata.cinemaTradition.replace(/_/g, ' ')}</span> narrative conventions. 
            Structural expectations, emotional arcs, and pacing benchmarks reflect this tradition's grammar rather than Hollywood defaults.
          </p>
        </Card>
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
