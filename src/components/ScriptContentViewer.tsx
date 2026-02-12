import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  MapPin,
  Clock,
  MessageSquare,
  Film,
  Network,
  FileText,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Home,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScriptContentViewerProps {
  scriptId: string;
  scriptTitle: string;
}

interface Scene {
  id: string;
  scene_number: number;
  heading: string;
  description: string | null;
  location: string | null;
  int_ext: string | null;
  time_of_day: string | null;
  emotional_tone: string | null;
  page_start: number | null;
  page_end: number | null;
}

interface Character {
  id: string;
  name: string;
  description: string | null;
  dialogue_count: number | null;
  scene_count: number | null;
  first_appearance: number | null;
  arc_summary: string | null;
  relationships: { character: string; type: string }[] | null;
}

interface NarrativeGraph {
  id: string;
  graph_type: string;
  nodes: { id: string; label: string; type?: string }[];
  edges: { source: string; target: string; label?: string }[];
  metadata: Record<string, unknown> | null;
}

const TIME_ICONS: Record<string, React.ReactNode> = {
  day: <Sun className="h-3 w-3" />,
  night: <Moon className="h-3 w-3" />,
  morning: <Sunrise className="h-3 w-3" />,
  evening: <Sunset className="h-3 w-3" />,
};

export function ScriptContentViewer({ scriptId, scriptTitle }: ScriptContentViewerProps) {
  const [searchParams] = useSearchParams();
  const highlightScene = searchParams.get('scene') ? Number(searchParams.get('scene')) : null;
  const sceneRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [narrativeGraphs, setNarrativeGraphs] = useState<NarrativeGraph[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      
      const [scenesResult, charactersResult, graphsResult] = await Promise.all([
        supabase
          .from('scenes')
          .select('*')
          .eq('script_id', scriptId)
          .order('scene_number', { ascending: true }),
        supabase
          .from('characters')
          .select('*')
          .eq('script_id', scriptId)
          .order('dialogue_count', { ascending: false }),
        supabase
          .from('narrative_graphs')
          .select('*')
          .eq('script_id', scriptId),
      ]);

      if (scenesResult.data) {
        setScenes(scenesResult.data as Scene[]);
      }
      if (charactersResult.data) {
        setCharacters(charactersResult.data as unknown as Character[]);
      }
      if (graphsResult.data) {
        setNarrativeGraphs(graphsResult.data as unknown as NarrativeGraph[]);
      }

      setIsLoading(false);
    }

    fetchContent();
  }, [scriptId]);

  // Scroll to highlighted scene after loading
  useEffect(() => {
    if (!isLoading && highlightScene && sceneRefs.current[highlightScene]) {
      setTimeout(() => {
        sceneRefs.current[highlightScene]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [isLoading, highlightScene]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hasContent = scenes.length > 0 || characters.length > 0 || narrativeGraphs.length > 0;

  if (!hasContent) {
    return (
      <div className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Extracted Content</h3>
        <p className="text-muted-foreground text-sm">
          This script hasn't been parsed yet. Run an analysis to extract scenes, characters, and narrative structure.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="scenes" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="scenes" className="gap-2">
          <Film className="h-4 w-4" />
          Scenes ({scenes.length})
        </TabsTrigger>
        <TabsTrigger value="characters" className="gap-2">
          <Users className="h-4 w-4" />
          Characters ({characters.length})
        </TabsTrigger>
        {narrativeGraphs.length > 0 && (
          <TabsTrigger value="narrative" className="gap-2">
            <Network className="h-4 w-4" />
            Narrative
          </TabsTrigger>
        )}
      </TabsList>

      <ScrollArea className="h-[500px] mt-4">
        <TabsContent value="scenes" className="mt-0 space-y-3">
          {scenes.map((scene) => (
            <Card
              key={scene.id}
              ref={(el) => { sceneRefs.current[scene.scene_number] = el; }}
              className={cn(
                'bg-muted/30 transition-all duration-500',
                highlightScene === scene.scene_number && 'ring-2 ring-primary bg-primary/5'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Scene {scene.scene_number}
                      </Badge>
                      {scene.int_ext && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          {scene.int_ext === 'INT' ? <Home className="h-3 w-3" /> : <Building className="h-3 w-3" />}
                          {scene.int_ext}
                        </Badge>
                      )}
                      {scene.time_of_day && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          {TIME_ICONS[scene.time_of_day.toLowerCase()] || <Clock className="h-3 w-3" />}
                          {scene.time_of_day}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-mono text-sm font-medium mb-2">{scene.heading}</h4>
                    {scene.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" />
                        {scene.location}
                      </div>
                    )}
                    {scene.description && (
                      <p className="text-sm text-muted-foreground mt-2">{scene.description}</p>
                    )}
                    {scene.emotional_tone && (
                      <Badge className="mt-2" variant="outline">
                        {scene.emotional_tone}
                      </Badge>
                    )}
                  </div>
                  {(scene.page_start || scene.page_end) && (
                    <div className="text-xs text-muted-foreground text-right">
                      <span>pg. {scene.page_start}</span>
                      {scene.page_end && scene.page_end !== scene.page_start && (
                        <span>-{scene.page_end}</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="characters" className="mt-0 space-y-3">
          {characters.map((character) => (
            <Card key={character.id} className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{character.name}</h4>
                    {character.description && (
                      <p className="text-sm text-muted-foreground mb-3">{character.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {character.dialogue_count !== null && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {character.dialogue_count} lines
                        </Badge>
                      )}
                      {character.scene_count !== null && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Film className="h-3 w-3" />
                          {character.scene_count} scenes
                        </Badge>
                      )}
                      {character.first_appearance !== null && (
                        <Badge variant="outline" className="text-xs">
                          First: Scene {character.first_appearance}
                        </Badge>
                      )}
                    </div>
                    {character.arc_summary && (
                      <div className="mt-2 p-2 bg-background/50 rounded text-sm">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Arc Summary</span>
                        <p className="mt-1">{character.arc_summary}</p>
                      </div>
                    )}
                    {character.relationships && character.relationships.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Relationships</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {character.relationships.map((rel, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {rel.character}: {rel.type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="narrative" className="mt-0 space-y-4">
          {narrativeGraphs.map((graph) => (
            <Card key={graph.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize">
                  {graph.graph_type.replace(/_/g, ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                      Nodes ({graph.nodes.length})
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {graph.nodes.slice(0, 20).map((node) => (
                        <Badge key={node.id} variant="secondary" className="text-xs">
                          {node.label}
                          {node.type && <span className="ml-1 opacity-60">({node.type})</span>}
                        </Badge>
                      ))}
                      {graph.nodes.length > 20 && (
                        <Badge variant="outline" className="text-xs">
                          +{graph.nodes.length - 20} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  {graph.edges.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        Connections ({graph.edges.length})
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {graph.edges.slice(0, 10).map((edge, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {edge.source} → {edge.target}
                            {edge.label && <span className="ml-1 opacity-60">({edge.label})</span>}
                          </Badge>
                        ))}
                        {graph.edges.length > 10 && (
                          <Badge variant="outline" className="text-xs">
                            +{graph.edges.length - 10} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
