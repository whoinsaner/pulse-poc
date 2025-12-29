import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Bot, 
  Gauge, 
  Lightbulb, 
  Eye, 
  Scale, 
  FileBarChart,
  ArrowRight,
  ArrowDown,
  Settings2,
  Sparkles,
  GitBranch,
  Layers,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_AGENTS, SYSTEM_AGENTS, CORE_AGENTS, COMIC_AGENTS, INTERACTIVE_AGENTS, AUDIO_AGENTS, META_AGENTS } from "@/lib/scriptFramework";

interface FlowStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  outputs: string[];
  color: string;
  agentCount?: number;
  category?: string;
}

function FlowStep({ icon, title, description, outputs, color, agentCount, category }: FlowStepProps) {
  return (
    <div className={cn("p-4 rounded-lg border-2 bg-card relative", color)}>
      {category && (
        <Badge variant="outline" className="absolute -top-2 right-2 text-xs bg-background">
          {category}
        </Badge>
      )}
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-semibold">{title}</span>
        {agentCount !== undefined && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {agentCount} {agentCount === 1 ? 'agent' : 'agents'}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex flex-wrap gap-1">
        {outputs.map((output) => (
          <Badge key={output} variant="secondary" className="text-xs">
            {output}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ArrowConnector({ direction = "right" }: { direction?: "right" | "down" }) {
  if (direction === "down") {
    return (
      <div className="flex justify-center py-2">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="hidden md:flex items-center justify-center px-2">
      <ArrowRight className="h-6 w-6 text-muted-foreground" />
    </div>
  );
}

function AgentCategoryBadge({ category, count }: { category: string; count: number }) {
  const categoryStyles: Record<string, { bg: string; text: string }> = {
    system: { bg: "bg-slate-500/10", text: "text-slate-500" },
    analysis: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
    comic: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-500" },
    interactive: { bg: "bg-sky-500/10", text: "text-sky-500" },
    audio: { bg: "bg-violet-500/10", text: "text-violet-500" },
    meta: { bg: "bg-amber-500/10", text: "text-amber-500" },
  };
  
  const style = categoryStyles[category] || { bg: "bg-muted", text: "text-muted-foreground" };
  
  return (
    <Badge variant="outline" className={cn("gap-1", style.bg, style.text)}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
      <span className="ml-1 opacity-70">({count})</span>
    </Badge>
  );
}

export function DataFlowDiagram() {
  const totalAgents = ALL_AGENTS.length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Universal Script Analysis Framework (USAF)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              4-stage pipeline with {totalAgents} specialized agents for comprehensive script analysis
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AgentCategoryBadge category="system" count={SYSTEM_AGENTS.length} />
            <AgentCategoryBadge category="analysis" count={CORE_AGENTS.length} />
            <AgentCategoryBadge category="comic" count={COMIC_AGENTS.length} />
            <AgentCategoryBadge category="interactive" count={INTERACTIVE_AGENTS.length} />
            <AgentCategoryBadge category="audio" count={AUDIO_AGENTS.length} />
            <AgentCategoryBadge category="meta" count={META_AGENTS.length} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stage 1: Intake & Classification */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-6 h-6 rounded-full bg-slate-500/20 flex items-center justify-center text-xs text-slate-500">1</span>
            Stage 1: Intake & Classification
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FlowStep
              icon={<FileText className="h-5 w-5 text-slate-500" />}
              title="Intake Normalizer"
              description="Standardizes input format, extracts metadata, and prepares script for analysis"
              outputs={["normalized_text", "metadata", "format_info"]}
              color="border-slate-500/30"
              category="System"
            />
            <FlowStep
              icon={<GitBranch className="h-5 w-5 text-blue-500" />}
              title="Script Type Classifier"
              description="Identifies script type with confidence scores across 17 categories"
              outputs={["primary_type", "confidence", "secondary_matches"]}
              color="border-blue-500/30"
              category="System"
            />
          </div>
        </div>

        <ArrowConnector direction="down" />

        {/* Stage 2: Classification Resolution */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-500">2</span>
            Stage 2: Classification Resolution
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FlowStep
              icon={<CheckCircle2 className="h-5 w-5 text-amber-500" />}
              title="Classifier Arbitration"
              description="Resolves ambiguous classifications when confidence is below threshold"
              outputs={["resolved_type", "arbitration_reason", "confidence_boost"]}
              color="border-amber-500/30"
              category="System"
            />
            <FlowStep
              icon={<Layers className="h-5 w-5 text-purple-500" />}
              title="Multi-Type Blending"
              description="Handles hybrid scripts by blending analysis weights across types"
              outputs={["blend_weights", "applicable_agents", "type_ratios"]}
              color="border-purple-500/30"
              category="System"
            />
          </div>
        </div>

        <ArrowConnector direction="down" />

        {/* Stage 3: Core Analysis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-500">3</span>
            Stage 3: Core Analysis (17 Agents)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FlowStep
              icon={<Bot className="h-5 w-5 text-emerald-500" />}
              title="Core Agents"
              description="Concept, Structure, Character, Conflict, Theme, Dialogue, Emotional Arc, World Logic, Market, Execution"
              outputs={["scores", "rationale", "evidence"]}
              color="border-emerald-500/30"
              agentCount={CORE_AGENTS.length}
            />
            <FlowStep
              icon={<Bot className="h-5 w-5 text-fuchsia-500" />}
              title="Comic Agents"
              description="Art Direction, Comic Dialogue, Pacing, Visual Storytelling"
              outputs={["panel_scores", "visual_analysis"]}
              color="border-fuchsia-500/30"
              agentCount={COMIC_AGENTS.length}
            />
            <FlowStep
              icon={<Bot className="h-5 w-5 text-sky-500" />}
              title="Interactive Agents"
              description="Interactivity, World Building"
              outputs={["branching_score", "player_agency"]}
              color="border-sky-500/30"
              agentCount={INTERACTIVE_AGENTS.length}
            />
            <FlowStep
              icon={<Bot className="h-5 w-5 text-violet-500" />}
              title="Audio Agent"
              description="Audio Narrative analysis"
              outputs={["audio_score", "sound_design"]}
              color="border-violet-500/30"
              agentCount={AUDIO_AGENTS.length}
            />
          </div>
        </div>

        <ArrowConnector direction="down" />

        {/* Stage 4: Meta Analysis & Output */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-500">4</span>
            Stage 4: Meta Analysis & Lens Weighting
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FlowStep
              icon={<Sparkles className="h-5 w-5 text-teal-500" />}
              title="Meta Agents"
              description="Script Evolution, Creator Feedback Loop, Explainability Trace, Investor Readiness"
              outputs={["evolution_score", "feedback", "explainability", "investor_score"]}
              color="border-teal-500/30"
              agentCount={META_AGENTS.length}
            />
            <FlowStep
              icon={<Eye className="h-5 w-5 text-blue-500" />}
              title="Lens Weighting"
              description="9 stakeholder perspectives apply their priorities to scores"
              outputs={["weighted_scores", "prioritized_insights"]}
              color="border-blue-500/30"
            />
            <FlowStep
              icon={<TrendingUp className="h-5 w-5 text-yellow-500" />}
              title="Investor Readiness"
              description="Market clarity, budget realism, platform fit, franchise scalability"
              outputs={["investor_score", "market_fit", "risk_profile"]}
              color="border-yellow-500/30"
            />
          </div>
        </div>

        <ArrowConnector direction="down" />

        {/* Final Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FlowStep
            icon={<Gauge className="h-5 w-5 text-purple-500" />}
            title="Parameter Scores"
            description="130+ parameters scored with detailed evidence and rationale"
            outputs={["0-10 score", "maturity", "risk level", "fix cost", "upside impact"]}
            color="border-purple-500/30"
          />
          
          <FlowStep
            icon={<Lightbulb className="h-5 w-5 text-amber-500" />}
            title="Actionable Insights"
            description="Prioritized recommendations with minimal and maximal fixes"
            outputs={["strengths", "weaknesses", "opportunities", "risks"]}
            color="border-amber-500/30"
          />
        </div>

        <ArrowConnector direction="down" />

        <FlowStep
          icon={<FileBarChart className="h-5 w-5 text-rose-500" />}
          title="Final Report"
          description="Comprehensive analysis tailored to each stakeholder's perspective"
          outputs={["executive summary", "lens-specific scores", "recommendations", "evidence trail"]}
          color="border-rose-500/30"
        />

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Key Concepts</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Settings2 className="h-4 w-4 text-slate-500" />
                <span className="font-medium">System Agents</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Handle intake, classification, and routing ({SYSTEM_AGENTS.length} agents)
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Analysis Agents</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Core + specialized agents for content analysis ({CORE_AGENTS.length + COMIC_AGENTS.length + INTERACTIVE_AGENTS.length + AUDIO_AGENTS.length} agents)
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Meta Agents</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Post-processing for evolution, feedback, explainability ({META_AGENTS.length} agents)
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Stakeholder Lenses</span>
              </div>
              <p className="text-xs text-muted-foreground">
                9 perspectives that weight parameters based on priorities
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DataFlowDiagram;