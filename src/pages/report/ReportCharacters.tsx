import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { FullCharactersSection } from '@/components/report/FullCharactersSection';
import { CharacterNetwork } from '@/components/report/CharacterNetwork';
import { CharacterArcVisualization } from '@/components/report/CharacterArcVisualization';
import { DialogueAnalysis } from '@/components/report/DialogueAnalysis';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  isComic: boolean;
}

export default function ReportCharacters() {
  const { reportData } = useOutletContext<ReportContextValue>();

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center">
        <span className="px-4 py-1.5 rounded-full bg-chart-3/10 text-chart-3 text-sm font-medium">
          Character Study
        </span>
        <h2 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">
          Character Analysis
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Deep dive into your characters, their arcs, relationships, and dialogue patterns
        </p>
      </div>

      {/* Character Overview */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Character Profiles</h3>
          <p className="text-muted-foreground">
            Detailed analysis of each character in your script
          </p>
        </div>
        <FullCharactersSection characters={reportData.characters || []} />
      </section>

      {/* Character Arc Visualization */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Character Arcs</h3>
          <p className="text-muted-foreground">
            Emotional journeys and development milestones
          </p>
        </div>
        <CharacterArcVisualization 
          characters={reportData.characters || []} 
          totalScenes={reportData.scenes?.length || 60} 
        />
      </section>

      {/* Character Network */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Relationship Network</h3>
          <p className="text-muted-foreground">
            Connections and dynamics between characters
          </p>
        </div>
        <CharacterNetwork characters={reportData.characters || []} />
      </section>

      {/* Dialogue Analysis */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">Dialogue Patterns</h3>
          <p className="text-muted-foreground">
            Voice, style, and distribution of dialogue
          </p>
        </div>
        <DialogueAnalysis characters={reportData.characters || []} />
      </section>
    </div>
  );
}
