import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { ProductionNarrativePanel } from '@/components/report/AgentNarrativePanel';
import { 
  SectionHeader, 
  SubSectionHeader,
  WeightedParameterList,
} from '@/components/report/ui';
import { Card } from '@/components/ui/card';
import { Film } from 'lucide-react';
import { extractScore } from '@/lib/scoreUtils';
import { useStakeholderFiltering } from '@/hooks/useStakeholderFiltering';
import { StakeholderFilterNotice } from '@/components/report/StakeholderFilterNotice';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  stakeholderLens: StakeholderLens | null;
}

export default function Production() {
  const { reportData, currentScore, stakeholderLens } = useOutletContext<ReportContextValue>();
  const { isFiltered, filterParameters, getFilterStats } = useStakeholderFiltering({ stakeholderLens });

  const productionParams = reportData.parameterScores?.filter(p => 
    p.category?.toLowerCase().includes('execution') || 
    p.category?.toLowerCase().includes('production') ||
    p.parameterName?.toLowerCase().includes('budget') ||
    p.parameterName?.toLowerCase().includes('production') ||
    p.parameterName?.toLowerCase().includes('feasibility')
  ) || [];

  const categoryScore = extractScore(reportData.categoryScores?.['Execution']) || 
    (productionParams.length > 0 
      ? productionParams.reduce((sum, p) => sum + p.score, 0) / productionParams.length 
      : currentScore);

  const agentContent = reportData.agentContent?.ExecutionAgent;

  const scenes = reportData.scenes || [];
  const characters = reportData.characters || [];
  const uniqueLocations = new Set(scenes.map(s => s.location).filter(Boolean));
  const pageCount = reportData.scriptMetadata?.pageCount || 110;

  const filteredProductionParams = filterParameters(productionParams);
  const filterStats = getFilterStats(productionParams);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Production Analysis"
        subtitle="Evaluating budget requirements, location needs, and production feasibility"
        icon={Film}
        score={categoryScore}
      />

      {isFiltered && stakeholderLens && (
        <StakeholderFilterNotice 
          stakeholderLens={stakeholderLens}
          shownCount={filterStats.shown}
          totalCount={filterStats.total}
        />
      )}

      {/* Agent Narrative with production extras */}
      {agentContent && (
        <ProductionNarrativePanel content={agentContent} />
      )}

      {/* Production Overview */}
      <Card className="p-6">
        <SubSectionHeader title="Production Requirements" />
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <p className="text-4xl font-mono font-bold text-primary">{scenes.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Scenes</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-3/10 to-chart-3/5 border border-chart-3/20 text-center">
            <p className="text-4xl font-mono font-bold text-chart-3">{uniqueLocations.size}</p>
            <p className="text-sm text-muted-foreground mt-1">Unique Locations</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-4/10 to-chart-4/5 border border-chart-4/20 text-center">
            <p className="text-4xl font-mono font-bold text-chart-4">{characters.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Speaking Roles</p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-chart-5/10 to-chart-5/5 border border-chart-5/20 text-center">
            <p className="text-4xl font-mono font-bold text-chart-5">{pageCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Page Count</p>
          </div>
        </div>
      </Card>

      {/* Parameter Breakdown */}
      <WeightedParameterList
        parameters={filteredProductionParams.map(p => ({ ...p, weight: 1.0 }))}
        title="Production Parameters"
        initiallyExpanded={true}
        defaultVisibleCount={8}
      />
    </div>
  );
}