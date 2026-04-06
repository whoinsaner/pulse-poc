import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { 
  SectionHeader, 
  DiagnosisSummary,
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
        developmentLink={`${window.location.pathname.split('/story')[0]}/development`}
      />

      {/* Tradition & Narrative Grammar Context */}
      {(() => {
        const traditionContent = reportData.agentContent?.CinemaTraditionAgent;
        const hasTradition = reportData.scriptMetadata?.cinemaTradition && reportData.scriptMetadata.cinemaTradition !== 'auto_detect';
        const hasGrammar = traditionContent?.narrativeGrammar || traditionContent?.intendedExperience;
        
        if (!hasTradition && !hasGrammar) return null;
        
        return (
          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Narrative Grammar Context</h4>
            </div>
            
            {hasTradition && (
              <p className="text-sm text-muted-foreground mb-2">
                This script was evaluated under <span className="font-medium text-foreground capitalize">{reportData.scriptMetadata!.cinemaTradition!.replace(/_/g, ' ')}</span> narrative conventions.
              </p>
            )}
            
            {traditionContent?.narrativeGrammar && (
              <div className="mt-2">
                <span className="text-xs font-medium text-primary">Detected Grammar:</span>
                <p className="text-sm text-muted-foreground">{traditionContent.narrativeGrammar}</p>
              </div>
            )}
            
            {traditionContent?.intendedExperience && (
              <div className="mt-2">
                <span className="text-xs font-medium text-primary">Intended Experience:</span>
                <p className="text-sm text-muted-foreground">{traditionContent.intendedExperience}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 mt-3">
              {traditionContent?.realismSpectrum && (
                <div className="text-xs">
                  <span className="font-medium text-primary">Realism Spectrum:</span>{' '}
                  <span className="text-muted-foreground">{traditionContent.realismSpectrum}</span>
                </div>
              )}
              {traditionContent?.stakesModel && (
                <div className="text-xs">
                  <span className="font-medium text-primary">Stakes Model:</span>{' '}
                  <span className="text-muted-foreground">{traditionContent.stakesModel}</span>
                </div>
              )}
            </div>
            
            {traditionContent?.grammarRules && (
              <div className="mt-2 pt-2 border-t border-primary/10">
                <span className="text-xs font-medium text-primary">Grammar Rules:</span>
                <p className="text-xs text-muted-foreground">{traditionContent.grammarRules}</p>
              </div>
            )}
          </Card>
        );
      })()}
    </div>
  );
}
