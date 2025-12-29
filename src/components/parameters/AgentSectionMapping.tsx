import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  FileText, 
  ArrowRight,
  Lightbulb,
  GitBranch,
  Users,
  Swords,
  Palette,
  MessageSquare,
  Heart,
  Globe,
  TrendingUp,
  Cog,
  Brain,
  Target,
  Eye,
  Film,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentMapping {
  agent: string;
  color: string;
  icon: React.ReactNode;
  category: string;
  sections: string[];
}

// Core agents (all script types)
const CORE_AGENT_MAPPINGS: AgentMapping[] = [
  {
    agent: "ConceptAgent",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    icon: <Lightbulb className="h-4 w-4" />,
    category: "Concept & Hook",
    sections: ["Concept & Hook", "Marketability"]
  },
  {
    agent: "StructureAgent",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: <GitBranch className="h-4 w-4" />,
    category: "Structure",
    sections: ["Structural Engineering", "Plot Analysis", "Scene Economy"]
  },
  {
    agent: "CharacterAgent",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: <Users className="h-4 w-4" />,
    category: "Character",
    sections: ["Protagonist Analysis", "Antagonist Analysis", "Supporting Cast", "Character Psychology"]
  },
  {
    agent: "ConflictAgent",
    color: "bg-red-500/10 text-red-500 border-red-500/30",
    icon: <Swords className="h-4 w-4" />,
    category: "Conflict",
    sections: ["Plot Analysis", "Structural Engineering"]
  },
  {
    agent: "ThemeAgent",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    icon: <Palette className="h-4 w-4" />,
    category: "Theme",
    sections: ["Theme & Moral", "Emotional Resonance"]
  },
  {
    agent: "DialogueAgent",
    color: "bg-violet-500/10 text-violet-500 border-violet-500/30",
    icon: <MessageSquare className="h-4 w-4" />,
    category: "Dialogue",
    sections: ["Dialogue & Subtext"]
  },
  {
    agent: "EmotionalArcAgent",
    color: "bg-pink-500/10 text-pink-500 border-pink-500/30",
    icon: <Heart className="h-4 w-4" />,
    category: "Emotional Arc",
    sections: ["Emotional Resonance", "Character Psychology"]
  },
  {
    agent: "WorldLogicAgent",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    icon: <Globe className="h-4 w-4" />,
    category: "World & Logic",
    sections: ["Visual Storytelling", "Production"]
  },
  {
    agent: "MarketAgent",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    icon: <TrendingUp className="h-4 w-4" />,
    category: "Market",
    sections: ["Marketability", "Audience Strategy"]
  },
  {
    agent: "ExecutionAgent",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    icon: <Cog className="h-4 w-4" />,
    category: "Execution",
    sections: ["Production", "Rewrite Priorities"]
  }
];

// Comic-specific agents
const COMIC_AGENT_MAPPINGS: AgentMapping[] = [
  {
    agent: "ComicVisualAgent",
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
    icon: <Eye className="h-4 w-4" />,
    category: "Comic Visual",
    sections: ["Visual Storytelling", "Art Direction"]
  },
  {
    agent: "ComicDialogueAgent",
    color: "bg-teal-500/10 text-teal-500 border-teal-500/30",
    icon: <MessageSquare className="h-4 w-4" />,
    category: "Comic Dialogue",
    sections: ["Dialogue & Subtext", "Balloon Efficiency"]
  },
  {
    agent: "ComicPacingAgent",
    color: "bg-lime-500/10 text-lime-500 border-lime-500/30",
    icon: <Target className="h-4 w-4" />,
    category: "Comic Pacing",
    sections: ["Scene Economy", "Panel Flow"]
  },
  {
    agent: "ComicArtDirectionAgent",
    color: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/30",
    icon: <Palette className="h-4 w-4" />,
    category: "Art Direction",
    sections: ["Visual Storytelling", "Artist Guidance"]
  }
];

const AGENT_MAPPINGS: AgentMapping[] = [...CORE_AGENT_MAPPINGS, ...COMIC_AGENT_MAPPINGS];

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "Concept & Hook": <Lightbulb className="h-3 w-3" />,
  "Structural Engineering": <GitBranch className="h-3 w-3" />,
  "Plot Analysis": <Target className="h-3 w-3" />,
  "Protagonist Analysis": <Users className="h-3 w-3" />,
  "Antagonist Analysis": <Swords className="h-3 w-3" />,
  "Supporting Cast": <Users className="h-3 w-3" />,
  "Character Psychology": <Brain className="h-3 w-3" />,
  "Theme & Moral": <Palette className="h-3 w-3" />,
  "Dialogue & Subtext": <MessageSquare className="h-3 w-3" />,
  "Emotional Resonance": <Heart className="h-3 w-3" />,
  "Visual Storytelling": <Eye className="h-3 w-3" />,
  "Marketability": <TrendingUp className="h-3 w-3" />,
  "Audience Strategy": <BarChart3 className="h-3 w-3" />,
  "Production": <Film className="h-3 w-3" />,
  "Scene Economy": <Target className="h-3 w-3" />,
  "Rewrite Priorities": <Cog className="h-3 w-3" />
};

export function AgentSectionMapping() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Agent → Report Section Mapping
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How each agent's analysis feeds into specific report sections
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Agents Section */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Core Agents (All Script Types)
          </h4>
          <div className="space-y-3">
            {CORE_AGENT_MAPPINGS.map((mapping) => (
              <div 
                key={mapping.agent}
                className={cn(
                  "flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg border",
                  mapping.color
                )}
              >
                {/* Agent */}
                <div className="flex items-center gap-2 min-w-[180px]">
                  {mapping.icon}
                  <span className="font-semibold text-sm">{mapping.agent}</span>
                </div>
                
                {/* Category Badge */}
                <Badge variant="secondary" className="w-fit text-xs">
                  {mapping.category}
                </Badge>
                
                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                
                {/* Report Sections */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {mapping.sections.map((section) => (
                    <div 
                      key={section}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border text-xs font-medium"
                    >
                      {SECTION_ICONS[section]}
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comic Agents Section */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Film className="h-4 w-4" />
            Comic-Specific Agents
          </h4>
          <div className="space-y-3">
            {COMIC_AGENT_MAPPINGS.map((mapping) => (
              <div 
                key={mapping.agent}
                className={cn(
                  "flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg border",
                  mapping.color
                )}
              >
                {/* Agent */}
                <div className="flex items-center gap-2 min-w-[180px]">
                  {mapping.icon}
                  <span className="font-semibold text-sm">{mapping.agent}</span>
                </div>
                
                {/* Category Badge */}
                <Badge variant="secondary" className="w-fit text-xs">
                  {mapping.category}
                </Badge>
                
                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                
                {/* Report Sections */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {mapping.sections.map((section) => (
                    <div 
                      key={section}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border text-xs font-medium"
                    >
                      {SECTION_ICONS[section] || <Eye className="h-3 w-3" />}
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">How It Works</h4>
          <p className="text-xs text-muted-foreground">
            Each agent analyzes specific aspects of the script and produces parameter scores on a 10-point scale. 
            Core agents run for all script types, while Comic-specific agents only run for comic/graphic narrative scripts.
            Scores are then filtered by category and displayed in the corresponding report sections.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}