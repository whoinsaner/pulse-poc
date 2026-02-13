import { AgentOutputSchema } from "@/components/parameters/AgentOutputSchema";
import { InsightsSchema } from "@/components/parameters/InsightsSchema";
import { DataFlowDiagram } from "@/components/parameters/DataFlowDiagram";
import { SampleAgentOutput } from "@/components/parameters/SampleAgentOutput";
import { AgentSectionMapping } from "@/components/parameters/AgentSectionMapping";
import { ParameterDependencyGraph } from "@/components/parameters/ParameterDependencyGraph";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ParametersSchema() {
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}
