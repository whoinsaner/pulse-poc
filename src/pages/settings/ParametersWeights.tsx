import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Scale, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { LensWeightsEditor } from "@/components/LensWeightsEditor";

interface Parameter {
  id: string;
  name: string;
  display_name: string;
  category: string;
  agent_source: string;
  description: string | null;
  default_weight: number;
}

const LENS_LABELS: Record<string, string> = {
  studio_executive: "Studio Executive",
  producer: "Producer",
  actor: "Actor",
  director: "Director",
  writer: "Writer",
  financier: "Financier",
  investor: "Investor",
  ott_platform: "OTT Platform",
  theatrical: "Theatrical",
};

const getWeightIndicator = (weight: number) => {
  if (weight > 1.05) return { icon: TrendingUp, label: "High Priority", color: "text-green-500" };
  if (weight < 0.95) return { icon: TrendingDown, label: "Lower Priority", color: "text-amber-500" };
  return { icon: Minus, label: "Standard", color: "text-muted-foreground" };
};

export default function ParametersWeights() {
  const { data: parameters = [] } = useQuery({
    queryKey: ["parameters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parameters")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Parameter[];
    },
  });

  const { data: lensWeights = [], isLoading } = useQuery({
    queryKey: ["lens-weights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lens_weights")
        .select(`id, lens, weight, parameter_id, parameters!inner (name, display_name, category)`)
        .order("lens", { ascending: true });
      if (error) throw error;
      return data.map((lw: any) => ({
        id: lw.id, lens: lw.lens, weight: lw.weight, parameter_id: lw.parameter_id,
        parameter_name: lw.parameters.name, display_name: lw.parameters.display_name, category: lw.parameters.category,
      }));
    },
  });

  const lenses = useMemo(() => [...new Set(lensWeights.map((lw: any) => lw.lens))].sort(), [lensWeights]);

  const parametersByCategory = useMemo(() => {
    const grouped: Record<string, Parameter[]> = {};
    parameters.forEach((param) => {
      if (!grouped[param.category]) grouped[param.category] = [];
      grouped[param.category].push(param);
    });
    return grouped;
  }, [parameters]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading weights...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Page Header */}
        <div className="px-6 py-5 border-b border-border bg-card/30">
          <h2 className="text-lg font-semibold">Lens Weights</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure how stakeholder lenses weight each parameter
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Tabs defaultValue="matrix" className="space-y-5">
              <TabsList>
                <TabsTrigger value="matrix">Weight Matrix</TabsTrigger>
                <TabsTrigger value="editor">Edit Weights</TabsTrigger>
              </TabsList>

              <TabsContent value="matrix" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Scale className="h-4 w-4 text-primary" />
                      Lens Weight Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="w-full">
                      <div className="min-w-[700px]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2 font-medium text-xs">Category</th>
                              {lenses.map((lens) => (
                                <th key={lens} className="p-2 text-center">
                                  <span className="text-xs font-medium">{(LENS_LABELS[lens] || lens).split(" ")[0]}</span>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(parametersByCategory).map((category) => {
                              const categoryParams = parametersByCategory[category];
                              return (
                                <tr key={category} className="border-b hover:bg-muted/50">
                                  <td className="p-2 font-medium text-sm">{category}</td>
                                  {lenses.map((lens) => {
                                    const weights = lensWeights.filter(
                                      (lw: any) => lw.lens === lens && categoryParams.some((p) => p.id === lw.parameter_id)
                                    );
                                    const avgWeight = weights.length > 0
                                      ? weights.reduce((sum: number, lw: any) => sum + lw.weight, 0) / weights.length
                                      : 1;
                                    const ind = getWeightIndicator(avgWeight);
                                    const Icon = ind.icon;
                                    return (
                                      <td key={lens} className="p-2 text-center">
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <div className="flex items-center justify-center gap-1">
                                              <Icon className={cn("h-3.5 w-3.5", ind.color)} />
                                              <span className="font-mono text-xs">{avgWeight.toFixed(2)}</span>
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Avg: {avgWeight.toFixed(3)} ({weights.length} params)</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>

                    <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground mt-4 pt-3 border-t">
                      <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> High (&gt;1.05x)</span>
                      <span className="flex items-center gap-1"><Minus className="h-3 w-3" /> Standard</span>
                      <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-amber-500" /> Lower (&lt;0.95x)</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="editor">
                <LensWeightsEditor />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
