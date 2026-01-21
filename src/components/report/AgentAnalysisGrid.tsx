import { 
  Lightbulb, 
  LayoutGrid, 
  Users, 
  Swords, 
  Palette, 
  MessageSquare, 
  Globe, 
  Heart, 
  TrendingUp, 
  Cog,
  BookOpen,
  Layers,
  Sparkles,
  Frame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParameterScoreData, ScriptType } from '@/types/database';
import { getScoreTailwindColor, getScoreTailwindBg, getScoreBarColor } from '@/lib/scoreUtils';
import { isComicType, getAgentCountForScriptType } from '@/lib/reportNavigation';

interface AgentAnalysisGridProps {
  parameterScores: ParameterScoreData[];
  categoryScores: Record<string, number>;
  scriptType?: ScriptType;
}

// USAF Agent definitions
const USAF_AGENTS = [
  { id: 'concept', module: 'A', name: 'Concept & Hook', icon: Lightbulb, category: 'Concept & Hook', color: 'chart-1' },
  { id: 'structure', module: 'B', name: 'Structural Intelligence', icon: LayoutGrid, category: 'Structure', color: 'chart-2' },
  { id: 'character', module: 'C', name: 'Character & Agency', icon: Users, category: 'Character', color: 'chart-3' },
  { id: 'conflict', module: 'D', name: 'Conflict & Stakes', icon: Swords, category: 'Conflict', color: 'chart-4' },
  { id: 'theme', module: 'E', name: 'Theme & Meaning', icon: Palette, category: 'Theme', color: 'chart-5' },
  { id: 'dialogue', module: 'F', name: 'Dialogue & Language', icon: MessageSquare, category: 'Dialogue', color: 'chart-6' },
  { id: 'world', module: 'G', name: 'World & Logic', icon: Globe, category: 'World & Logic', color: 'chart-1' },
  { id: 'emotion', module: 'H', name: 'Emotional Arc', icon: Heart, category: 'Emotional Arc', color: 'chart-2' },
  { id: 'market', module: 'I', name: 'Market & Platform', icon: TrendingUp, category: 'Market', color: 'chart-3' },
  { id: 'execution', module: 'J', name: 'Execution & Feasibility', icon: Cog, category: 'Execution', color: 'chart-4' },
];

// Comic-specific specialized agents (New Framework)
const COMIC_AGENTS = [
  { id: 'panel_flow', module: 'K', name: 'Panel Flow Analysis', icon: Layers, category: 'Comic Visuals', color: 'chart-5' },
  { id: 'lettering_balloon', module: 'L', name: 'Lettering & Balloons', icon: MessageSquare, category: 'Comic Dialogue', color: 'chart-6' },
  { id: 'page_turn', module: 'M', name: 'Page-Turn Impact', icon: BookOpen, category: 'Comic Pacing', color: 'chart-1' },
  { id: 'art_script_synergy', module: 'N', name: 'Art-Script Synergy', icon: Sparkles, category: 'Comic Collaboration', color: 'chart-2' },
];

export function AgentAnalysisGrid({ parameterScores, categoryScores, scriptType }: AgentAnalysisGridProps) {
  const isComic = isComicType(scriptType);
  const agents = isComic ? [...USAF_AGENTS, ...COMIC_AGENTS] : USAF_AGENTS;
  const agentCounts = getAgentCountForScriptType(scriptType);

  // Get score from categoryScores (already 0-100 scale)
  const getAgentScore = (category: string): number => {
    return categoryScores[category] || 0;
  };

  const getAgentParameters = (category: string): ParameterScoreData[] => {
    return parameterScores.filter(p => p.category === category);
  };

  return (
    <section className="min-h-screen py-20 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            AI Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Agent Analysis Breakdown
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isComic 
              ? `${agentCounts.total} specialized AI agents (${agentCounts.core} core + ${agentCounts.specialized} comic) analyzed your script`
              : `${agentCounts.core} specialized AI agents analyzed your script across ${Object.keys(categoryScores).length} categories`
            }
          </p>
        </div>

        {/* Agent grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent, index) => {
            const score = getAgentScore(agent.category); // Already 0-100
            const parameters = getAgentParameters(agent.category);
            const Icon = agent.icon;
            
            return (
              <div
                key={agent.id}
                className={cn(
                  'group relative p-6 rounded-2xl border bg-card transition-all duration-300',
                  'hover:shadow-lg hover:-translate-y-1',
                  getScoreTailwindBg(score),
                  'animate-fade-up'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Module badge */}
                <div className="absolute top-4 right-4">
                  <span className={cn(
                    'inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm',
                    `bg-${agent.color}/20 text-${agent.color}`
                  )}>
                    {agent.module}
                  </span>
                </div>

                {/* Icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                  `bg-${agent.color}/10`
                )}>
                  <Icon className={cn('h-6 w-6', `text-${agent.color}`)} />
                </div>

                {/* Agent name */}
                <h3 className="font-semibold text-lg mb-2">{agent.name}</h3>

                {/* Score - now 0-100 scale */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={cn('text-3xl font-bold', getScoreTailwindColor(score))}>
                    {Math.round(score)}
                  </span>
                  <span className="text-muted-foreground text-sm">/ 100</span>
                </div>

                {/* Score bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all duration-1000',
                      getScoreBarColor(score)
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>

                {/* Parameters count */}
                <p className="text-sm text-muted-foreground">
                  {parameters.length} parameters evaluated
                </p>

                {/* Hover details */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-card via-card to-transparent rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="space-y-1">
                    {parameters.slice(0, 3).map((param, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="truncate text-muted-foreground">{param.displayName}</span>
                        <span className={cn('font-medium', getScoreTailwindColor(param.score))}>
                          {Math.round(param.score)}
                        </span>
                      </div>
                    ))}
                    {parameters.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        +{parameters.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary stats - now 0-100 scale */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <p className="text-4xl font-bold gradient-text mb-2">
              {Math.round(Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.values(categoryScores).length)}
            </p>
            <p className="text-muted-foreground">Average Score</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <p className="text-4xl font-bold text-success mb-2">
              {Object.values(categoryScores).filter(s => s >= 70).length}
            </p>
            <p className="text-muted-foreground">Strong Categories</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border border-border text-center">
            <p className="text-4xl font-bold text-warning mb-2">
              {Object.values(categoryScores).filter(s => s < 50).length}
            </p>
            <p className="text-muted-foreground">Needs Attention</p>
          </div>
        </div>
      </div>
    </section>
  );
}
