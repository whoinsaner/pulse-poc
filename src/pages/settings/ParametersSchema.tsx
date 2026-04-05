import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AgentOutputSchema } from "@/components/parameters/AgentOutputSchema";
import { InsightsSchema } from "@/components/parameters/InsightsSchema";
import { DataFlowDiagram } from "@/components/parameters/DataFlowDiagram";
import { SampleAgentOutput } from "@/components/parameters/SampleAgentOutput";
import { AgentSectionMapping } from "@/components/parameters/AgentSectionMapping";
import { ParameterDependencyGraph } from "@/components/parameters/ParameterDependencyGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Loader2 } from "lucide-react";

export default function ParametersSchema() {
  const [globalInstructions, setGlobalInstructions] = useState<string | null>(null);
  const [globalVersion, setGlobalVersion] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGlobalInstructions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("agent_configurations")
          .select("system_prompt, version")
          .eq("agent_name", "GlobalInstructions")
          .eq("is_system", true)
          .maybeSingle();

        if (!error && data) {
          setGlobalInstructions(data.system_prompt);
          setGlobalVersion(data.version ?? 1);
        }
      } catch (err) {
        console.error("Failed to fetch global instructions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalInstructions();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-border bg-card/30">
        <div>
          <h2 className="text-lg font-semibold">Schema & Dependencies</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Output schemas, data flow diagrams, and parameter dependency graphs
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Tabs defaultValue="flow" className="space-y-5">
            <TabsList>
              <TabsTrigger value="flow">Data Flow</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="schema">Output Schema</TabsTrigger>
              <TabsTrigger value="global-rules" className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Global Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flow" className="space-y-5">
              <DataFlowDiagram />
              <AgentSectionMapping />
            </TabsContent>

            <TabsContent value="dependencies" className="space-y-5">
              <ParameterDependencyGraph />
            </TabsContent>

            <TabsContent value="schema" className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AgentOutputSchema />
                <InsightsSchema />
              </div>
              <SampleAgentOutput />
            </TabsContent>

            <TabsContent value="global-rules" className="space-y-5">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-500" />
                        Global Agent Operating Rules
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Master prompt injected into every analysis agent. Defines core philosophy, anti-bias framework, output contract, and evidence rules.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      v{globalVersion}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading global rules...</span>
                    </div>
                  ) : globalInstructions ? (
                    <ScrollArea className="h-[500px]">
                      <pre className="text-sm font-mono whitespace-pre-wrap text-foreground/90 leading-relaxed p-4 bg-muted/30 rounded-lg border border-border">
                        {globalInstructions}
                      </pre>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      Global instructions not configured. Admins can set this up in Agent Prompts.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
