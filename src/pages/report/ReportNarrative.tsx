import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ReportData, StakeholderLens, NarrativeGraphData } from '@/types/database';
import { NarrativeTimeline } from '@/components/report/NarrativeTimeline';
import { SceneHeatmap } from '@/components/report/SceneHeatmap';
import { PacingAnalysis } from '@/components/report/PacingAnalysis';
import { SceneComplexityAnalyzer } from '@/components/report/SceneComplexityAnalyzer';
import { NarrativeGraphViewer } from '@/components/report/NarrativeGraphViewer';
import { supabase } from '@/integrations/supabase/client';
import { useReport } from '@/components/report/ReportLayout';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  isComic: boolean;
}

export default function ReportNarrative() {
  const { reportData } = useOutletContext<ReportContextValue>();
  const { report } = useReport();
  const [narrativeGraph, setNarrativeGraph] = useState<NarrativeGraphData | undefined>(
    reportData.narrativeGraph
  );

  // Fetch narrative graph from dedicated table if not in report data
  useEffect(() => {
    if (reportData.narrativeGraph) return;
    if (!report?.script_id) return;

    async function fetchGraph() {
      const { data, error } = await supabase
        .from('narrative_graphs')
        .select('nodes, edges')
        .eq('script_id', report!.script_id)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setNarrativeGraph({
          nodes: data.nodes as unknown as NarrativeGraphData['nodes'],
          edges: data.edges as unknown as NarrativeGraphData['edges'],
        });
      }
    }

    fetchGraph();
  }, [report?.script_id, reportData.narrativeGraph]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <span className="px-4 py-1.5 rounded-full bg-chart-2/10 text-chart-2 text-sm font-medium">
          Story Structure
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Narrative Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Visual breakdown of your script's structure, pacing, and scene complexity
        </p>
      </div>

      {/* Narrative Timeline */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Story Timeline</h3>
          <p className="text-muted-foreground">
            Scene-by-scene progression through your narrative
          </p>
        </div>
        <NarrativeTimeline 
          scenes={reportData.scenes || []} 
          narrativeGraph={narrativeGraph}
          totalPages={reportData.scriptMetadata?.pageCount}
        />
      </section>

      {/* Scene Heatmap */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Scene Heatmap</h3>
          <p className="text-muted-foreground">
            Visual representation of scene intensity and distribution
          </p>
        </div>
        <SceneHeatmap scenes={reportData.scenes || []} sceneAnalysis={reportData.sceneAnalysis} />
      </section>

      {/* Pacing Analysis */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Pacing Analysis</h3>
          <p className="text-muted-foreground">
            Rhythm and tempo throughout your script
          </p>
        </div>
        <PacingAnalysis 
          scenes={reportData.scenes || []} 
          totalPages={reportData.scriptMetadata?.pageCount}
          sceneAnalysis={reportData.sceneAnalysis}
        />
      </section>

      {/* Scene Complexity Analyzer */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Scene Complexity</h3>
          <p className="text-muted-foreground">
            Dialogue density, action intensity, and technical requirements per scene
          </p>
        </div>
        <SceneComplexityAnalyzer 
          scenes={reportData.scenes || []} 
          characters={reportData.characters || []}
          sceneAnalysis={reportData.sceneAnalysis}
        />
      </section>

      {/* Narrative Graph Visualization */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Relationship Graph</h3>
          <p className="text-muted-foreground">
            Interactive visualization of character relationships and plot connections
          </p>
        </div>
        <NarrativeGraphViewer graphData={narrativeGraph} characters={reportData.characters} />
      </section>
    </div>
  );
}
