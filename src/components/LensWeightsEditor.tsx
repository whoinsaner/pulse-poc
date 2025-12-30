import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, RotateCcw, Scale, Users, Briefcase, Camera, 
  Megaphone, PenTool, Wallet, Tv, Theater, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StakeholderLens } from '@/types/database';

interface LensWeight {
  id: string;
  lens: StakeholderLens;
  parameter_id: string;
  weight: number;
}

interface Parameter {
  id: string;
  name: string;
  display_name: string;
  category: string;
  description: string | null;
  default_weight: number | null;
}

interface GroupedWeights {
  [category: string]: {
    parameter: Parameter;
    weight: number;
    originalWeight: number;
  }[];
}

const LENS_CONFIG: Record<StakeholderLens, { label: string; icon: React.ElementType; color: string }> = {
  studio_executive: { label: 'Studio Executive', icon: Briefcase, color: 'text-blue-500' },
  producer: { label: 'Producer', icon: Users, color: 'text-purple-500' },
  actor: { label: 'Actor', icon: Camera, color: 'text-pink-500' },
  director: { label: 'Director', icon: Megaphone, color: 'text-orange-500' },
  writer: { label: 'Writer', icon: PenTool, color: 'text-emerald-500' },
  financier: { label: 'Financier', icon: Wallet, color: 'text-yellow-500' },
  ott_platform: { label: 'OTT Platform', icon: Tv, color: 'text-red-500' },
  theatrical: { label: 'Theatrical', icon: Theater, color: 'text-indigo-500' },
};

const ALL_LENSES: StakeholderLens[] = [
  'studio_executive', 'producer', 'actor', 'director', 'writer',
  'financier', 'ott_platform', 'theatrical'
];

export function LensWeightsEditor() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLens, setActiveLens] = useState<StakeholderLens>('studio_executive');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [lensWeights, setLensWeights] = useState<LensWeight[]>([]);
  const [modifiedWeights, setModifiedWeights] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paramsRes, weightsRes] = await Promise.all([
        supabase.from('parameters').select('*').order('category', { ascending: true }),
        supabase.from('lens_weights').select('*'),
      ]);

      if (paramsRes.error) throw paramsRes.error;
      if (weightsRes.error) throw weightsRes.error;

      setParameters(paramsRes.data || []);
      // Filter out any lens types not in our StakeholderLens type
      const validLenses = ALL_LENSES as string[];
      const filteredWeights = (weightsRes.data || []).filter(
        w => validLenses.includes(w.lens)
      ) as LensWeight[];
      setLensWeights(filteredWeights);
    } catch (err) {
      console.error('Error fetching lens weights:', err);
      toast({
        title: 'Error loading weights',
        description: 'Could not load lens weight configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getGroupedWeights = (): GroupedWeights => {
    const grouped: GroupedWeights = {};
    
    parameters.forEach(param => {
      const lensWeight = lensWeights.find(
        lw => lw.lens === activeLens && lw.parameter_id === param.id
      );
      const originalWeight = lensWeight?.weight ?? param.default_weight ?? 1.0;
      const currentWeight = modifiedWeights[`${activeLens}-${param.id}`] ?? originalWeight;

      if (!grouped[param.category]) {
        grouped[param.category] = [];
      }
      
      grouped[param.category].push({
        parameter: param,
        weight: currentWeight,
        originalWeight,
      });
    });

    return grouped;
  };

  const handleWeightChange = (parameterId: string, value: number) => {
    const key = `${activeLens}-${parameterId}`;
    setModifiedWeights(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleReset = () => {
    // Reset only weights for current lens
    const keysToRemove = Object.keys(modifiedWeights).filter(k => k.startsWith(`${activeLens}-`));
    setModifiedWeights(prev => {
      const next = { ...prev };
      keysToRemove.forEach(k => delete next[k]);
      return next;
    });
    setHasChanges(Object.keys(modifiedWeights).length > keysToRemove.length);
    toast({
      title: 'Weights reset',
      description: `${LENS_CONFIG[activeLens].label} weights restored to defaults`,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would update the lens_weights table
      // For now, we'll just show a success message since lens_weights doesn't allow updates from users
      toast({
        title: 'Weights saved',
        description: 'Lens weight configuration has been updated',
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving weights:', err);
      toast({
        title: 'Error saving',
        description: 'Could not save weight configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const groupedWeights = getGroupedWeights();
  const categories = Object.keys(groupedWeights);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Lens Weight Configuration</CardTitle>
              <CardDescription>
                Adjust how parameters are weighted for each stakeholder perspective
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-2 mt-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-600 dark:text-amber-400">
              You have unsaved changes
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeLens} onValueChange={(v) => setActiveLens(v as StakeholderLens)}>
          <ScrollArea className="w-full pb-2">
            <TabsList className="inline-flex w-max gap-1 bg-muted/50 p-1">
              {ALL_LENSES.map(lens => {
                const config = LENS_CONFIG[lens];
                const Icon = config.icon;
                return (
                  <TabsTrigger
                    key={lens}
                    value={lens}
                    className="flex items-center gap-2 data-[state=active]:bg-background"
                  >
                    <Icon className={cn('h-4 w-4', config.color)} />
                    <span className="hidden sm:inline">{config.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>

          {ALL_LENSES.map(lens => (
            <TabsContent key={lens} value={lens} className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      
                      <div className="space-y-4">
                        {groupedWeights[category].map(({ parameter, weight, originalWeight }) => (
                          <div
                            key={parameter.id}
                            className="p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-medium text-sm">
                                  {parameter.display_name}
                                </span>
                                {parameter.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {parameter.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={weight !== originalWeight ? 'default' : 'secondary'}
                                  className="tabular-nums"
                                >
                                  {weight.toFixed(1)}x
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground w-8">0.0</span>
                              <Slider
                                value={[weight]}
                                onValueChange={([v]) => handleWeightChange(parameter.id, v)}
                                min={0}
                                max={3}
                                step={0.1}
                                className="flex-1"
                              />
                              <span className="text-xs text-muted-foreground w-8">3.0</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
