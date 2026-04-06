import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SectionHeader, 
  DiagnosisSummary,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { Users } from 'lucide-react';
import { getCharacterRole } from '@/lib/characterRoles';


interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

// Categories that belong to Character diagnosis
const CHARACTER_CATEGORIES = ['Character'];


export default function CharacterDiagnosis() {
  const context = useOutletContext<ReportContextValue>();
  const reportData = context?.reportData;

  // Filter parameters for character categories
  const characterParameters = useMemo(() => {
    const params = reportData?.parameterScores || [];
    return params
      .filter(p => CHARACTER_CATEGORIES.includes(p.category))
      .map(p => ({
        parameterName: p.parameterName,
        displayName: p.displayName,
        score: p.score,
        rationale: p.rationale,
        fixCost: p.fixCost as 'Low' | 'Medium' | 'High' | undefined,
        evidence: p.evidence,
        weight: 1.0,
      }));
  }, [reportData?.parameterScores]);

  // Calculate section score
  const sectionScore = useMemo(() => {
    if (characterParameters.length === 0) return 0;
    const total = characterParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / characterParameters.length);
  }, [characterParameters]);


  // Get characters from report data
  const characters = reportData?.characters || [];

  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Character Diagnosis"
        subtitle="Protagonist, antagonist, and supporting cast analysis"
        icon={Users}
        score={sectionScore}
      >
        <InlineMaturity score={sectionScore} />
      </SectionHeader>

      {/* Diagnosis Summary */}
      <DiagnosisSummary
        parameters={characterParameters}
        categoryName="Character"
        developmentLink={`${window.location.pathname.split('/characters')[0]}/development`}
      />

      {/* Character Cards */}
      {characters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Key Characters</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {characters.slice(0, 4).map((character, index) => (
              <CharacterCard key={character.name} character={character} role={getCharacterRole(character.name, reportData.agentContent)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Character card component
interface CharacterCardProps {
  character: {
    name: string;
    description?: string | null;
    arcSummary?: string | null;
    dialogueCount?: number | null;
    sceneCount?: number | null;
  };
  role?: string;
}

function CharacterCard({ character, role }: CharacterCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold">{character.name}</h4>
          {role && (
            <Badge variant="secondary" className="text-xs mt-1">{role}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {character.sceneCount && (
            <span>{character.sceneCount} scenes</span>
          )}
          {character.dialogueCount && (
            <span>{character.dialogueCount} lines</span>
          )}
        </div>
      </div>
      {character.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {character.description}
        </p>
      )}
      {character.arcSummary && (
        <p className="text-xs text-muted-foreground mt-2 italic">
          Arc: {character.arcSummary}
        </p>
      )}
    </Card>
  );
}
