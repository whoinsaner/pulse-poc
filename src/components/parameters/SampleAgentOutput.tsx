import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Code, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";

const AGENT_COLORS: Record<string, string> = {
  CharacterAgent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  DialogueAgent: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  NarrativeAgent: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ProductionAgent: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  ThematicAgent: "bg-sky-500/10 text-sky-500 border-sky-500/20",
};

const SAMPLE_OUTPUTS: Record<string, { parameter: string; output: object }> = {
  CharacterAgent: {
    parameter: "protagonist_arc_clarity",
    output: {
      score: 8.2,
      maturity: "well_developed",
      riskLevel: "low",
      fixCost: "low",
      upsideImpact: "medium",
      confidence: 0.89,
      rationale: "The protagonist Sarah demonstrates a clear transformation from a risk-averse corporate lawyer to an empowered advocate. Her journey is marked by three distinct phases: denial (Act 1), confrontation (Act 2), and acceptance (Act 3). The character's internal conflict is externalized through her relationship with her estranged father, providing both emotional depth and narrative momentum.",
      evidence: [
        {
          type: "dialogue_reference",
          reference: "Scene 5, Page 12",
          quote: "SARAH: I've spent my whole life playing it safe. Maybe it's time to take a risk.",
          explanation: "This line marks the inciting incident and establishes Sarah's core internal conflict."
        },
        {
          type: "scene_reference",
          reference: "Scene 34, Page 67",
          quote: null,
          explanation: "The courtroom scene demonstrates Sarah's complete transformation as she abandons her prepared notes to speak from the heart."
        },
        {
          type: "pattern_analysis",
          reference: "Acts 1-3",
          quote: null,
          explanation: "Sarah's dialogue patterns shift from formal/defensive to personal/vulnerable, with a 340% increase in personal pronouns by Act 3."
        }
      ]
    }
  },
  DialogueAgent: {
    parameter: "dialogue_authenticity",
    output: {
      score: 7.5,
      maturity: "developing",
      riskLevel: "medium",
      fixCost: "medium",
      upsideImpact: "high",
      confidence: 0.82,
      rationale: "Dialogue generally feels authentic with distinct character voices. However, exposition-heavy scenes in Act 1 occasionally break naturalistic flow. Supporting characters maintain consistent speech patterns, though Marcus's dialogue could benefit from more subtext.",
      evidence: [
        {
          type: "dialogue_reference",
          reference: "Scene 12, Page 28",
          quote: "MARCUS: Let me explain the entire history of our company... (continues for 15 lines)",
          explanation: "This exposition dump breaks conversational authenticity and could be distributed across multiple scenes."
        },
        {
          type: "pattern_analysis",
          reference: "Full script",
          quote: null,
          explanation: "Character voice distinctiveness score: 7.8/10. Each major character uses measurably different vocabulary and sentence structures."
        }
      ]
    }
  },
  NarrativeAgent: {
    parameter: "plot_momentum",
    output: {
      score: 8.7,
      maturity: "well_developed",
      riskLevel: "low",
      fixCost: "low",
      upsideImpact: "low",
      confidence: 0.91,
      rationale: "Excellent pacing with well-distributed plot points. Each act break delivers escalating stakes. The midpoint twist effectively recontextualizes the first act while propelling the narrative forward.",
      evidence: [
        {
          type: "structural_analysis",
          reference: "Page 1-110",
          quote: null,
          explanation: "Plot point distribution follows optimal beat sheet timing within 3% variance."
        },
        {
          type: "scene_reference",
          reference: "Scene 28, Page 55 (Midpoint)",
          quote: null,
          explanation: "The revelation of the antagonist's true identity creates a compelling reversal that energizes the second half."
        }
      ]
    }
  },
  ProductionAgent: {
    parameter: "location_variety",
    output: {
      score: 6.8,
      maturity: "needs_improvement",
      riskLevel: "medium",
      fixCost: "high",
      upsideImpact: "medium",
      confidence: 0.85,
      rationale: "The script features 34 unique locations, with heavy concentration in office and apartment settings (58% of scenes). While cost-effective, this may impact visual variety for theatrical release.",
      evidence: [
        {
          type: "location_breakdown",
          reference: "Full script",
          quote: null,
          explanation: "INT. OFFICE: 22 scenes, INT. APARTMENT: 18 scenes, EXT. Various: 12 scenes. Consider consolidating some office scenes to free budget for 2-3 visually distinctive exteriors."
        }
      ]
    }
  },
  ThematicAgent: {
    parameter: "thematic_coherence",
    output: {
      score: 9.1,
      maturity: "excellent",
      riskLevel: "low",
      fixCost: "low",
      upsideImpact: "low",
      confidence: 0.94,
      rationale: "The central theme of 'authenticity vs. performance' is woven consistently throughout all character arcs and plot developments. Visual and dialogue motifs reinforce the theme without becoming heavy-handed.",
      evidence: [
        {
          type: "motif_tracking",
          reference: "Full script",
          quote: null,
          explanation: "Mirror imagery appears in 8 key scenes, each marking a character's self-confrontation moment. This visual motif elegantly externalizes the internal theme."
        },
        {
          type: "dialogue_reference",
          reference: "Scene 45, Page 89",
          quote: "SARAH: I'm done rehearsing my life. This is the real performance.",
          explanation: "This line explicitly states the theme while feeling earned through the character's journey."
        }
      ]
    }
  }
};

export function SampleAgentOutput() {
  const [selectedAgent, setSelectedAgent] = useState("CharacterAgent");
  const agents = Object.keys(SAMPLE_OUTPUTS);
  const currentOutput = SAMPLE_OUTPUTS[selectedAgent];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Sample Agent Output
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Explore real output structures from each agent type
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent} value={agent}>
                    {agent.replace("Agent", "")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-3">
          <Badge variant="outline" className={cn("font-medium", AGENT_COLORS[selectedAgent])}>
            {selectedAgent}
          </Badge>
          <span className="text-sm text-muted-foreground">→</span>
          <Badge variant="secondary">{currentOutput.parameter}</Badge>
        </div>

        <Tabs defaultValue="formatted" className="space-y-4">
          <TabsList>
            <TabsTrigger value="formatted">Formatted View</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="formatted" className="space-y-4">
            {/* Score Section */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { label: "Score", value: (currentOutput.output as any).score, color: "text-primary" },
                { label: "Confidence", value: `${((currentOutput.output as any).confidence * 100).toFixed(0)}%`, color: "text-blue-500" },
                { label: "Maturity", value: (currentOutput.output as any).maturity.replace("_", " "), color: "text-purple-500" },
                { label: "Risk", value: (currentOutput.output as any).riskLevel, color: "text-amber-500" },
                { label: "Fix Cost", value: (currentOutput.output as any).fixCost, color: "text-rose-500" },
                { label: "Upside", value: (currentOutput.output as any).upsideImpact, color: "text-green-500" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className={cn("text-lg font-bold capitalize", item.color)}>{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Rationale */}
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Rationale</h4>
              <p className="text-sm text-muted-foreground">{(currentOutput.output as any).rationale}</p>
            </div>

            {/* Evidence */}
            <div className="space-y-3">
              <h4 className="font-medium">Evidence ({(currentOutput.output as any).evidence.length} items)</h4>
              {(currentOutput.output as any).evidence.map((ev: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{ev.type}</Badge>
                    <span className="text-xs text-muted-foreground">{ev.reference}</span>
                  </div>
                  {ev.quote && (
                    <blockquote className="text-sm italic border-l-2 border-primary/50 pl-3 mb-2 text-muted-foreground">
                      {ev.quote}
                    </blockquote>
                  )}
                  <p className="text-sm">{ev.explanation}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="json">
            <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-muted-foreground">
                {JSON.stringify(currentOutput.output, null, 2)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
