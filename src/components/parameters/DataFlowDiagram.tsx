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
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  outputs: string[];
  color: string;
}

function FlowStep({ icon, title, description, outputs, color }: FlowStepProps) {
  return (
    <div className={cn("p-4 rounded-lg border-2 bg-card", color)}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-semibold">{title}</span>
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

export function DataFlowDiagram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Analysis Data Flow
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How script content flows through agents to produce lens-weighted reports
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
          <FlowStep
            icon={<FileText className="h-5 w-5 text-slate-500" />}
            title="Script Input"
            description="Parsed screenplay with scenes, dialogue, and action lines"
            outputs={["scenes", "characters", "dialogue", "action"]}
            color="border-slate-500/30"
          />
          
          <ArrowConnector />
          
          <FlowStep
            icon={<Bot className="h-5 w-5 text-emerald-500" />}
            title="Agent Analysis"
            description="14 specialized agents evaluate their assigned parameters"
            outputs={["scores", "rationale", "evidence", "confidence"]}
            color="border-emerald-500/30"
          />
          
          <ArrowConnector />
          
          <FlowStep
            icon={<Eye className="h-5 w-5 text-blue-500" />}
            title="Lens Weighting"
            description="8 stakeholder perspectives apply their priorities"
            outputs={["weighted scores", "prioritized insights"]}
            color="border-blue-500/30"
          />
        </div>

        <ArrowConnector direction="down" />

        {/* Output Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FlowStep
            icon={<Gauge className="h-5 w-5 text-purple-500" />}
            title="Parameter Scores"
            description="91 scored parameters with detailed evidence and rationale"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">Agents</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Specialized AI evaluators that analyze specific aspects of the script (character, dialogue, narrative, etc.)
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Parameters</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Specific measurable qualities each agent evaluates, like "protagonist arc" or "dialogue authenticity"
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Lenses</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Stakeholder perspectives that weight parameters differently based on their priorities
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
