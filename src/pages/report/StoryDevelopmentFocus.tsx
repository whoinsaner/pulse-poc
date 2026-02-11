import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { 
  SectionHeader, 
  DevelopmentFocus,
} from '@/components/report/ui';
import { Target } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

const STORY_CATEGORIES = ['Concept & Hook', 'Structure', 'Conflict'];

export default function StoryDevelopmentFocus() {
  const context = useOutletContext<ReportContextValue>();

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

  const developmentItems = useMemo(() => {
    return storyParameters
      .filter(p => p.score < 70)
      .sort((a, b) => a.score - b.score)
      .map(p => ({
        title: p.displayName,
        description: p.rationale || '',
      }));
  }, [storyParameters]);

  const basePath = window.location.pathname.split('/story')[0];

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Story Development Focus"
        subtitle="Priority areas for story improvement"
        icon={Target}
        score={undefined}
      />

      {developmentItems.length > 0 ? (
        <DevelopmentFocus
          sectionName="Story"
          items={developmentItems}
          developmentPath={`${basePath}/development`}
          relatedSections={[
            { label: 'Character Diagnosis', path: `${basePath}/characters` },
            { label: 'Craft Diagnosis', path: `${basePath}/craft` },
          ]}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">All story parameters are scoring well — no urgent development areas.</p>
        </div>
      )}
    </div>
  );
}
