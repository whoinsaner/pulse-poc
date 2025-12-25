import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code, FileJson, Gauge, Quote, FileText, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string | number | boolean;
}

const SCORE_FIELDS: SchemaField[] = [
  { name: "score", type: "number", required: true, description: "Primary evaluation score from 0-10", example: 7.5 },
  { name: "maturity", type: "string", required: false, description: "Development stage assessment", example: "well_developed" },
  { name: "riskLevel", type: "string", required: false, description: "Risk classification for this parameter", example: "low" },
  { name: "fixCost", type: "string", required: false, description: "Estimated effort to improve this parameter", example: "medium" },
  { name: "upsideImpact", type: "string", required: false, description: "Potential benefit if improved", example: "high" },
  { name: "confidence", type: "number", required: false, description: "Agent's confidence in this score (0-1)", example: 0.85 },
];

const RATIONALE_FIELDS: SchemaField[] = [
  { name: "rationale", type: "string", required: true, description: "Detailed explanation of why this score was given" },
  { name: "evidence", type: "Evidence[]", required: true, description: "Array of supporting evidence from the script" },
];

const EVIDENCE_STRUCTURE: SchemaField[] = [
  { name: "type", type: "string", required: true, description: "Evidence category", example: "scene_reference" },
  { name: "reference", type: "string", required: true, description: "Location in script (page, scene, etc.)", example: "Scene 15, Page 22" },
  { name: "quote", type: "string", required: false, description: "Direct quote from the script" },
  { name: "explanation", type: "string", required: true, description: "How this evidence supports the score" },
];

function SchemaFieldRow({ field }: { field: SchemaField }) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-primary">{field.name}</code>
          <Badge variant="outline" className="text-xs font-normal">
            {field.type}
          </Badge>
          {field.required && (
            <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
              required
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
      </div>
      {field.example !== undefined && (
        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-mono">
          {typeof field.example === "string" ? `"${field.example}"` : String(field.example)}
        </code>
      )}
    </div>
  );
}

export function AgentOutputSchema() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-primary" />
          Agent Output Contract
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete schema of what each agent produces for every parameter
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="multiple" defaultValue={["scores", "evidence"]} className="space-y-3">
          {/* Score Fields */}
          <AccordionItem value="scores" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-blue-500/10">
                  <Gauge className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Score Fields</div>
                  <div className="text-xs text-muted-foreground">Numeric evaluations and risk assessments</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-1">
                {SCORE_FIELDS.map((field) => (
                  <SchemaFieldRow key={field.name} field={field} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rationale Fields */}
          <AccordionItem value="rationale" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-purple-500/10">
                  <FileText className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Explanation Fields</div>
                  <div className="text-xs text-muted-foreground">Reasoning and justification for scores</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-1">
                {RATIONALE_FIELDS.map((field) => (
                  <SchemaFieldRow key={field.name} field={field} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Evidence Structure */}
          <AccordionItem value="evidence" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-emerald-500/10">
                  <Quote className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Evidence Structure</div>
                  <div className="text-xs text-muted-foreground">Supporting quotes and references from script</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-1">
                {EVIDENCE_STRUCTURE.map((field) => (
                  <SchemaFieldRow key={field.name} field={field} />
                ))}
              </div>
              <Separator className="my-4" />
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Example Evidence Object</span>
                </div>
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`{
  "type": "dialogue_reference",
  "reference": "Scene 23, Page 45",
  "quote": "SARAH: I never asked for this responsibility, 
           but I won't run from it either.",
  "explanation": "This pivotal moment demonstrates Sarah's 
                  character arc from reluctant to resolute, 
                  directly supporting the high protagonist 
                  transformation score."
}`}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
