import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { EnhancedInsightsSection } from '@/components/report/EnhancedInsightsSection';
import { ThemeMotifTracker } from '@/components/report/ThemeMotifTracker';
import { BudgetSimulator } from '@/components/report/BudgetSimulator';
import { RiskMap } from '@/components/report/RiskMap';
import { Report } from '@/types/database';

interface ReportContextValue {
  report: Report;
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
  isComic: boolean;
}

export default function ReportInsights() {
  const { report, reportData, currentScore, isComic } = useOutletContext<ReportContextValue>();

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <span className="px-4 py-1.5 rounded-full bg-chart-3/10 text-chart-3 text-sm font-medium">
          Key Findings
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Insights & Recommendations
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {reportData.insights?.length || 0} actionable insights categorized by analysis domain
        </p>
      </div>

      {/* Enhanced Insights Section */}
      <EnhancedInsightsSection insights={reportData.insights || []} />

      {/* Theme & Motif Tracker */}
      <section>
        <div className="text-center mb-8">
          <span className="px-4 py-1.5 rounded-full bg-chart-5/10 text-chart-5 text-sm font-medium">
            Thematic Analysis
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold mt-4 mb-2">
            Theme & Motif Tracker
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Identified themes and recurring motifs throughout your script
          </p>
        </div>
        <ThemeMotifTracker 
          scenes={reportData.scenes || []} 
          insights={reportData.insights || []} 
        />
      </section>

      {/* Budget Estimator */}
      <section>
        <div className="text-center mb-8">
          <span className="px-4 py-1.5 rounded-full bg-chart-4/10 text-chart-4 text-sm font-medium">
            Production Planning
          </span>
          <h3 className="text-2xl lg:text-3xl font-bold mt-4 mb-2">
            Budget & Resource Estimation
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Estimated production costs and resource requirements
          </p>
        </div>
        <BudgetSimulator 
          scenes={reportData.scenes || []} 
          characters={reportData.characters || []} 
        />
      </section>

      {/* Risk Map (for screenplays) */}
      {!isComic && (
        <section>
          <div className="text-center mb-8">
            <span className="px-4 py-1.5 rounded-full bg-warning/10 text-warning text-sm font-medium">
              Assessment
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold mt-4 mb-2">
              Risk & Maturity Map
            </h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Production readiness evaluation across key dimensions
            </p>
          </div>
          <RiskMap score={currentScore * 10} categoryScores={reportData.categoryScores || {}} />
        </section>
      )}
    </div>
  );
}
