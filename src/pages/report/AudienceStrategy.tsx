import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { CommercialNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  SubSectionHeader,
  
  WeightedParameterList,
} from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

export default function AudienceStrategy() {
  const { reportData, currentScore } = useOutletContext<ReportContextValue>();

  const audienceParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('market') || 
    p.parameterName?.toLowerCase().includes('audience') ||
    p.parameterName?.toLowerCase().includes('appeal') ||
    p.parameterName?.toLowerCase().includes('commercial')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Market']) || 
    (audienceParams.length > 0 
      ? audienceParams.reduce((sum, p) => sum + p.score, 0) / audienceParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.MarketAgent;

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Audience Strategy"
        subtitle="Defining target audience, marketing approach, and release positioning"
        icon={Target}
        score={categoryScore}
      />

      {/* Agent Narrative with commercial extras */}
      {agentContent && (
        <CommercialNarrativePanel content={agentContent} />
      )}

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={audienceParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Audience Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />

    </div>
  );
}
