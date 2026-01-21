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
        <h2 className="font-display text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Agent-Based Script Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isComic 
            ? 'Deep analysis across 14 agents (10 core + 4 comic-specialized: PanelFlow, Lettering, PageTurn, ArtScriptSynergy)'
            : 'Deep analysis across 10 specialized AI agents covering all aspects of your script'
          }
        </p>
      </div>

      {/* Comic-Specific Agent Callout */}
      {isComic && (
        <div className="bg-chart-5/5 border border-chart-5/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-chart-5/10">
              <svg className="h-6 w-6 text-chart-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Comic-Specialized Analysis</h4>
              <p className="text-muted-foreground text-sm">
                This comic script includes analysis from 4 specialized agents evaluating 10 comic-specific parameters: 
                sequential storytelling integrity, panel economy, art-writing synergy, dialogue load management, and more.
              </p>
            </div>
          </div>
        </div>
      )}

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
          <h3 className="font-display text-2xl font-bold mb-2">Category Breakdown</h3>
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
