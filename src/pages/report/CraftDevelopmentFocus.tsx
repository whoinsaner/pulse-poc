import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { SectionHeader, DevelopmentFocus } from '@/components/report/ui';
import { Target } from 'lucide-react';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

const CRAFT_CATEGORIES = ['Dialogue', 'Theme', 'World & Logic', 'Emotional Arc', 'World', 'Emotion'];

export default function CraftDevelopmentFocus() {
  const context = useOutletContext<ReportContextValue>();

  const craftParameters = useMemo(() => {
    const params = context?.reportData?.parameterScores || [];
    return params
      .filter(p => CRAFT_CATEGORIES.includes(p.category))
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
    return craftParameters
      .filter(p => p.score < 70)
      .sort((a, b) => a.score - b.score)
      .map(p => ({
        title: p.displayName,
        description: p.rationale || '',
      }));
  }, [craftParameters]);

  const basePath = window.location.pathname.split('/craft')[0];

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Craft Development Focus"
        subtitle="Priority areas for craft improvement"
        icon={Target}
        score={undefined}
      />

      {developmentItems.length > 0 ? (
        <DevelopmentFocus
          sectionName="Craft"
          items={developmentItems}
          developmentPath={`${basePath}/development`}
          relatedSections={[
            { label: 'Story Diagnosis', path: `${basePath}/story` },
            { label: 'Character Diagnosis', path: `${basePath}/characters` },
          ]}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">All craft parameters are scoring well — no urgent development areas.</p>
        </div>
      )}
    </div>
  );
}
