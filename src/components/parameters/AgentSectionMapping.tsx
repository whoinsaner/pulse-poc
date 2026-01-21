import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  Film,
  FileInput,
  Tag,
  Scale,
  RefreshCw,
  Search,
  Briefcase,
  Gamepad2,
  Map,
  Mic,
  Timer,
  MessageCircle,
  Blend,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SYSTEM_AGENTS,
  CORE_AGENTS,
  COMIC_AGENTS,
  META_AGENTS,
  INTERACTIVE_AGENTS,
  AUDIO_AGENTS,
  WEB_SERIES_AGENTS,
  type AgentDefinition,
} from "@/lib/scriptFramework";

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  FileInput: <FileInput className="h-4 w-4" />,
  Tag: <Tag className="h-4 w-4" />,
  Scale: <Scale className="h-4 w-4" />,
  Blend: <Blend className="h-4 w-4" />,
  GitBranch: <GitBranch className="h-4 w-4" />,
  RefreshCw: <RefreshCw className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Lightbulb: <Lightbulb className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Swords: <Swords className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Cog: <Cog className="h-4 w-4" />,
  Eye: <Eye className="h-4 w-4" />,
  MessageCircle: <MessageCircle className="h-4 w-4" />,
  Timer: <Timer className="h-4 w-4" />,
  Gamepad2: <Gamepad2 className="h-4 w-4" />,
  Map: <Map className="h-4 w-4" />,
  Mic: <Mic className="h-4 w-4" />,
  Play: <Play className="h-4 w-4" />,
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  "Project Snapshot": <FileText className="h-3 w-3" />,
  "Concept & Hook": <Lightbulb className="h-3 w-3" />,
  "Structural Engineering": <GitBranch className="h-3 w-3" />,
  "Plot Analysis": <GitBranch className="h-3 w-3" />,
  "Protagonist Analysis": <Users className="h-3 w-3" />,
  "Antagonist Analysis": <Swords className="h-3 w-3" />,
  "Supporting Cast": <Users className="h-3 w-3" />,
  "Character Psychology": <Users className="h-3 w-3" />,
  "Theme & Moral": <Palette className="h-3 w-3" />,
  "Dialogue & Subtext": <MessageSquare className="h-3 w-3" />,
  "Emotional Resonance": <Heart className="h-3 w-3" />,
  "Visual Storytelling": <Eye className="h-3 w-3" />,
  "Marketability": <TrendingUp className="h-3 w-3" />,
  "Audience Strategy": <TrendingUp className="h-3 w-3" />,
  "Production": <Film className="h-3 w-3" />,
  "Scene Economy": <GitBranch className="h-3 w-3" />,
  "Rewrite Priorities": <Cog className="h-3 w-3" />,
  "Stakeholder Report": <Briefcase className="h-3 w-3" />,
  "Art Direction": <Palette className="h-3 w-3" />,
  "Balloon Efficiency": <MessageCircle className="h-3 w-3" />,
  "Panel Flow": <Timer className="h-3 w-3" />,
  "Artist Guidance": <Palette className="h-3 w-3" />,
  "Interactivity Analysis": <Gamepad2 className="h-3 w-3" />,
  "World Building": <Map className="h-3 w-3" />,
  "Audio Production": <Mic className="h-3 w-3" />,
  "Web Series Analysis": <Play className="h-3 w-3" />,
  "Retention Analysis": <Timer className="h-3 w-3" />,
  "Hooks Analysis": <Lightbulb className="h-3 w-3" />,
  "Platform Strategy": <TrendingUp className="h-3 w-3" />,
};

function AgentCard({ agent }: { agent: AgentDefinition }) {
  const icon = ICON_MAP[agent.icon] || <Bot className="h-4 w-4" />;
  
  return (
    <div 
      className={cn(
        "flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg border",
        agent.color
      )}
    >
      {/* Agent */}
      <div className="flex items-center gap-2 min-w-[200px]">
        {icon}
        <span className="font-semibold text-sm">{agent.name}</span>
      </div>
      
      {/* Parameters count */}
      <Badge variant="secondary" className="w-fit text-xs">
        {agent.parameters.length} params
      </Badge>
      
      {/* Arrow */}
      <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
      
      {/* Report Sections */}
      <div className="flex flex-wrap gap-2 flex-1">
        {agent.reportSections.length > 0 ? (
          agent.reportSections.map((section) => (
            <div 
              key={section}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border text-xs font-medium"
            >
              {SECTION_ICONS[section] || <FileText className="h-3 w-3" />}
              <span>{section}</span>
            </div>
          ))
        ) : (
          <span className="text-xs text-muted-foreground italic">Internal processing only</span>
        )}
      </div>
    </div>
  );
}

function AgentSection({ title, icon, agents, description }: { 
  title: string; 
  icon: React.ReactNode; 
  agents: AgentDefinition[];
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
        <Badge variant="outline" className="text-xs">{agents.length}</Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="space-y-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

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
      <CardContent>
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="specialized">Specialized</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            <AgentSection
              title="System Agents"
              icon={<FileInput className="h-4 w-4" />}
              agents={SYSTEM_AGENTS}
              description="Pre-processing agents that normalize input, classify script types, and handle hybrid formats"
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <AgentSection
              title="Core Analysis Agents (Modules A-J)"
              icon={<Bot className="h-4 w-4" />}
              agents={CORE_AGENTS}
              description="Primary analysis agents that run for all script types"
            />
          </TabsContent>

          <TabsContent value="specialized" className="space-y-8">
            <AgentSection
              title="Comic-Specific Agents"
              icon={<Film className="h-4 w-4" />}
              agents={COMIC_AGENTS}
              description="Agents specialized for comic and graphic novel scripts"
            />
            
            <AgentSection
              title="Interactive/Game Agents"
              icon={<Gamepad2 className="h-4 w-4" />}
              agents={INTERACTIVE_AGENTS}
              description="Agents for game narratives and interactive fiction"
            />
            
            <AgentSection
              title="Audio Agents"
              icon={<Mic className="h-4 w-4" />}
              agents={AUDIO_AGENTS}
              description="Agents for audio dramas and podcast fiction"
            />
            
            <AgentSection
              title="Web Series Agents"
              icon={<Play className="h-4 w-4" />}
              agents={WEB_SERIES_AGENTS}
              description="Agents for digital-first web series with algorithmic discovery optimization"
            />
          </TabsContent>

          <TabsContent value="meta" className="space-y-6">
            <AgentSection
              title="Meta Agents"
              icon={<RefreshCw className="h-4 w-4" />}
              agents={META_AGENTS}
              description="Post-processing agents for feedback, explainability, and stakeholder readiness"
            />
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="p-4 bg-muted/30 rounded-lg mt-6">
          <h4 className="text-sm font-medium mb-2">How It Works</h4>
          <p className="text-xs text-muted-foreground">
            The Pulse framework uses a multi-stage pipeline: System agents normalize input and classify script type → 
            Core agents analyze all scripts → Specialized agents run based on script type → 
            Meta agents provide explainability, feedback tracking, and stakeholder-specific views.
            Each agent produces parameter scores on a 0-10 scale with evidence and confidence levels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
