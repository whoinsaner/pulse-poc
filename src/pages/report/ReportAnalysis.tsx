import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { AgentAnalysisGrid } from '@/components/report/AgentAnalysisGrid';
import { FullParameterSection } from '@/components/report/FullParameterSection';
import { CategoryScoreSection } from '@/components/report/CategoryScoreSection';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  isComic: boolean;
}

export default function ReportAnalysis() {
  const { reportData, activeLens, isComic } = useOutletContext<ReportContextValue>();

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          AI Analysis
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Agent-Based Script Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Deep analysis across {isComic ? '14' : '10'} specialized AI agents covering all aspects of your {isComic ? 'comic' : 'script'}
        </p>
      </div>

      {/* Agent Analysis Grid */}
      <section>
        <AgentAnalysisGrid
          parameterScores={reportData.parameterScores || []}
          categoryScores={reportData.categoryScores || {}}
          scriptType={reportData.scriptMetadata?.scriptType}
        />
      </section>

      {/* Category Score Section with Charts */}
      <section>
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-2">Category Breakdown</h3>
          <p className="text-muted-foreground">
            Explore scores across different analysis categories
          </p>
        </div>
        <CategoryScoreSection
          categoryScores={reportData.categoryScores || {}}
          parameterScores={reportData.parameterScores || []}
          activeLens={activeLens}
        />
      </section>

      {/* Full Parameter Section */}
      <section>
        <FullParameterSection
          categoryScores={reportData.categoryScores || {}}
          parameterScores={reportData.parameterScores || []}
        />
      </section>
    </div>
  );
}
