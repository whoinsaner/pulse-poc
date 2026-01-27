import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReportData, StakeholderLens } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SectionHeader, 
  DiagnosisSummary,
  WeightedParameterList,
  DevelopmentFocus,
  SectionNavigator,
} from '@/components/report/ui';
import { InlineMaturity } from '@/components/report/ui/MaturityBadge';
import { Users, User, UserX, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDiagnosticCategory } from '@/lib/scoreUtils';

interface ReportContextValue {
  reportData: ReportData;
  activeLens: StakeholderLens;
  currentScore: number;
}

// Categories that belong to Character diagnosis
const CHARACTER_CATEGORIES = ['Character'];

// Navigation sections
const NAV_SECTIONS = [
  { id: 'cover', label: 'Cover', path: '' },
  { id: 'story', label: 'Story', path: '/story' },
  { id: 'characters', label: 'Characters', path: '/characters' },
  { id: 'craft', label: 'Craft', path: '/craft' },
  { id: 'commercial', label: 'Commercial', path: '/commercial' },
  { id: 'development', label: 'Development', path: '/development' },
];

export default function CharacterDiagnosis() {
  const context = useOutletContext<ReportContextValue>();
  
  if (!context) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  const { reportData } = context;

  // Filter parameters for character categories
  const characterParameters = useMemo(() => {
    const params = reportData.parameterScores || [];
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
  }, [reportData.parameterScores]);

  // Calculate section score
  const sectionScore = useMemo(() => {
    if (characterParameters.length === 0) return 0;
    const total = characterParameters.reduce((sum, p) => sum + p.score, 0);
    return Math.round(total / characterParameters.length);
  }, [characterParameters]);

  // Get development focus items
  const developmentItems = useMemo(() => {
    return characterParameters
      .filter(p => p.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map(p => ({
        title: p.displayName,
        description: p.rationale || '',
      }));
  }, [characterParameters]);

  // Get characters from report data
  const characters = reportData.characters || [];

  // Get base path
  const basePath = window.location.pathname.split('/characters')[0];

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
        developmentLink={`${basePath}/development`}
      />

      {/* Character Cards */}
      {characters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Key Characters
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {characters.slice(0, 4).map((character, index) => (
              <CharacterCard 
                key={character.name} 
                character={character}
                role={index === 0 ? 'Protagonist' : index === 1 ? 'Supporting' : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Weighted Parameter Breakdown */}
      <WeightedParameterList
        parameters={characterParameters}
        title="Character Parameter Breakdown"
        initiallyExpanded={false}
        defaultVisibleCount={6}
      />

      {/* Character Dimension Deep-Dives */}
      <div className="grid gap-6">
        {/* Agency & Arc */}
        <DimensionCard
          icon={User}
          title="Agency & Arc"
          parameters={characterParameters.filter(p => 
            p.parameterName.includes('agency') || 
            p.parameterName.includes('arc') || 
            p.parameterName.includes('transformation')
          )}
        />

        {/* Internal Depth */}
        <DimensionCard
          icon={Brain}
          title="Internal Depth"
          parameters={characterParameters.filter(p => 
            p.parameterName.includes('want') || 
            p.parameterName.includes('need') || 
            p.parameterName.includes('flaw') ||
            p.parameterName.includes('empathy')
          )}
        />

        {/* Voice & Distinction */}
        <DimensionCard
          icon={UserX}
          title="Voice & Distinction"
          parameters={characterParameters.filter(p => 
            p.parameterName.includes('voice') || 
            p.parameterName.includes('distinction')
          )}
        />
      </div>

      {/* Development Focus */}
      {developmentItems.length > 0 && (
        <DevelopmentFocus
          sectionName="Character"
          items={developmentItems}
          developmentPath={`${basePath}/development`}
          relatedSections={[
            { label: 'Story Diagnosis', path: `${basePath}/story` },
            { label: 'Craft Diagnosis', path: `${basePath}/craft` },
          ]}
        />
      )}

      {/* Section Navigator */}
      <SectionNavigator
        sections={NAV_SECTIONS}
        currentSection="characters"
        basePath={basePath}
      />
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

// Dimension breakdown card
interface DimensionCardProps {
  icon: typeof User;
  title: string;
  parameters: Array<{
    parameterName: string;
    displayName: string;
    score: number;
    rationale?: string;
  }>;
}

function DimensionCard({ icon: Icon, title, parameters }: DimensionCardProps) {
  if (parameters.length === 0) return null;

  const avgScore = Math.round(
    parameters.reduce((sum, p) => sum + p.score, 0) / parameters.length
  );
  const diagnostic = getDiagnosticCategory(avgScore);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2 rounded-lg', diagnostic.bgColor)}>
          <Icon className={cn('h-4 w-4', diagnostic.color)} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
        </div>
        <span className={cn('font-mono font-bold text-lg', diagnostic.color)}>
          {avgScore}
        </span>
      </div>
      <div className="space-y-3">
        {parameters.map((param) => (
          <div key={param.parameterName} className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{param.displayName}</span>
                <span className="text-sm font-mono">{param.score}</span>
              </div>
              {param.rationale && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {param.rationale}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
