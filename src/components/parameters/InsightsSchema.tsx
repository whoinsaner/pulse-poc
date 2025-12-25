import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Lightbulb, Users, Wrench, AlertTriangle, CheckCircle, Code } from "lucide-react";

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string | number | boolean;
}

const INSIGHT_CORE_FIELDS: SchemaField[] = [
  { name: "category", type: "string", required: true, description: "Insight classification (strength, weakness, opportunity, risk)", example: "opportunity" },
  { name: "title", type: "string", required: true, description: "Brief, actionable headline for the insight", example: "Underutilized Antagonist Potential" },
  { name: "description", type: "string", required: true, description: "Detailed explanation of the finding and its implications" },
  { name: "priority", type: "number", required: true, description: "Urgency ranking from 1 (highest) to 5 (lowest)", example: 2 },
  { name: "actionable", type: "boolean", required: true, description: "Whether this insight can be addressed through revisions", example: true },
];

const STAKEHOLDER_FIELDS: SchemaField[] = [
  { name: "affectedStakeholders", type: "string[]", required: false, description: "Which lenses care most about this insight", example: '["director", "actor"]' },
  { name: "impactByLens", type: "Record<string, number>", required: false, description: "How each stakeholder lens weighs this insight" },
];

const FIX_RECOMMENDATION_FIELDS: SchemaField[] = [
  { name: "minimalFix", type: "string", required: false, description: "Quick, low-effort suggestion to address the issue" },
  { name: "maximalFix", type: "string", required: false, description: "Comprehensive solution for best results" },
  { name: "estimatedEffort", type: "string", required: false, description: "Time/complexity to implement fixes", example: "1-2 revision passes" },
];

const SUPPORTING_EVIDENCE_FIELDS: SchemaField[] = [
  { name: "type", type: "string", required: true, description: "Evidence category", example: "pattern_analysis" },
  { name: "details", type: "string", required: true, description: "Specific supporting information" },
  { name: "relatedParameters", type: "string[]", required: false, description: "Parameter IDs this evidence relates to" },
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
        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-mono whitespace-nowrap">
          {String(field.example)}
        </code>
      )}
    </div>
  );
}

export function InsightsSchema() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Insights Schema
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Beyond scores, agents generate actionable insights with fix recommendations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="multiple" defaultValue={["core", "fixes"]} className="space-y-3">
          {/* Core Insight Fields */}
          <AccordionItem value="core" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-amber-500/10">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Core Insight Fields</div>
                  <div className="text-xs text-muted-foreground">Classification, description, and priority</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-1">
                {INSIGHT_CORE_FIELDS.map((field) => (
                  <SchemaFieldRow key={field.name} field={field} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Stakeholder Impact */}
          <AccordionItem value="stakeholders" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Stakeholder Impact</div>
                  <div className="text-xs text-muted-foreground">Which lenses are most affected</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-1">
                {STAKEHOLDER_FIELDS.map((field) => (
                  <SchemaFieldRow key={field.name} field={field} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Fix Recommendations */}
          <AccordionItem value="fixes" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-green-500/10">
                  <Wrench className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Fix Recommendations</div>
                  <div className="text-xs text-muted-foreground">Minimal and maximal improvement suggestions</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-1">
                {FIX_RECOMMENDATION_FIELDS.map((field) => (
                  <SchemaFieldRow key={field.name} field={field} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Supporting Evidence */}
          <AccordionItem value="supporting" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded bg-purple-500/10">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Supporting Evidence</div>
                  <div className="text-xs text-muted-foreground">Data backing up the insight</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div className="space-y-1">
                {SUPPORTING_EVIDENCE_FIELDS.map((field) => (
                  <SchemaFieldRow key={field.name} field={field} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Separator />

        {/* Example Insight */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Example Complete Insight</span>
          </div>
          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`{
  "category": "opportunity",
  "title": "Underutilized Antagonist Potential",
  "description": "The antagonist Marcus appears in 12 scenes but 
                  lacks clear motivation until Act 3. Earlier hints 
                  at his backstory could create stronger tension.",
  "priority": 2,
  "actionable": true,
  "affectedStakeholders": ["director", "actor", "writer"],
  "minimalFix": "Add 2-3 lines in Scene 8 hinting at Marcus's 
                 past trauma.",
  "maximalFix": "Create a new scene in Act 1 showing Marcus's 
                 origin, intercut with protagonist's journey.",
  "estimatedEffort": "1-2 pages of new dialogue",
  "supportingEvidence": [
    {
      "type": "pattern_analysis",
      "details": "Antagonist screen time: 18 min. Motivation 
                  clarity score: 4.2/10 before Scene 45.",
      "relatedParameters": ["antagonist_depth", "conflict_clarity"]
    }
  ]
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
