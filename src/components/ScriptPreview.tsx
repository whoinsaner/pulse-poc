import { useState, useEffect } from 'react';
import { FileText, Eye, Code, Download, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Scene {
  id: string;
  scene_number: number;
  heading: string;
  description: string | null;
  location: string | null;
  int_ext: string | null;
  time_of_day: string | null;
}

interface Character {
  id: string;
  name: string;
  dialogue_count: number | null;
  scene_count: number | null;
}

interface ScriptPreviewProps {
  scriptId: string;
  title: string;
  fileUrl: string;
  format: string;
  pageCount?: number;
}

export function ScriptPreview({ scriptId, title, fileUrl, format, pageCount }: ScriptPreviewProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadScriptData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load scenes and characters in parallel
        const [scenesResult, charactersResult] = await Promise.all([
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
        ]);

        if (scenesResult.error) throw scenesResult.error;
        if (charactersResult.error) throw charactersResult.error;

        setScenes(scenesResult.data || []);
        setCharacters(charactersResult.data || []);

        // Get signed URL for PDF preview
        if (format === 'pdf') {
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('scripts')
            .createSignedUrl(fileUrl, 3600); // 1 hour expiry

          if (!urlError && signedUrlData) {
            setPdfUrl(signedUrlData.signedUrl);
          }
        }
      } catch (err) {
        console.error('Error loading script data:', err);
        setError('Failed to load script preview data');
      } finally {
        setLoading(false);
      }
    };

    loadScriptData();
  }, [scriptId, fileUrl, format]);

  const downloadOriginal = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('scripts')
        .createSignedUrl(fileUrl, 60);

      if (error) throw error;
      if (data) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading script preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="p-6 flex items-center gap-4">
          <AlertTriangle className="h-6 w-6 text-warning" />
          <div>
            <p className="font-medium">Unable to load preview</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {scenes.length} scenes • {characters.length} characters
              {pageCount && ` • ~${pageCount} pages`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadOriginal}>
          <Download className="h-4 w-4 mr-2" />
          Download Original
        </Button>
      </div>

      <Tabs defaultValue="extracted" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="extracted" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Extracted Text
          </TabsTrigger>
          <TabsTrigger value="scenes" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Scenes ({scenes.length})
          </TabsTrigger>
          <TabsTrigger value="characters" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Characters ({characters.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extracted" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Extracted Scene Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {scenes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No scenes extracted from script
                    </p>
                  ) : (
                    scenes.map((scene) => (
                      <div
                        key={scene.id}
                        className="p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="font-mono">
                            Scene {scene.scene_number}
                          </Badge>
                          <div className="flex gap-2">
                            {scene.int_ext && (
                              <Badge variant="secondary" className="text-xs">
                                {scene.int_ext}
                              </Badge>
                            )}
                            {scene.time_of_day && (
                              <Badge variant="secondary" className="text-xs">
                                {scene.time_of_day}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="font-medium text-sm mb-1">{scene.heading}</p>
                        {scene.location && (
                          <p className="text-xs text-muted-foreground">
                            Location: {scene.location}
                          </p>
                        )}
                        {scene.description && (
                          <p className="text-sm mt-2 text-muted-foreground line-clamp-3">
                            {scene.description}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scene List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {scenes.map((scene, index) => (
                    <div
                      key={scene.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg transition-colors",
                        index % 2 === 0 ? "bg-muted/30" : "bg-transparent"
                      )}
                    >
                      <span className="text-sm font-mono text-muted-foreground w-8">
                        {scene.scene_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{scene.heading}</p>
                        {scene.location && (
                          <p className="text-xs text-muted-foreground">{scene.location}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {scene.int_ext && (
                          <Badge variant="outline" className="text-xs">
                            {scene.int_ext}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Character List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {characters.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No characters extracted from script
                    </p>
                  ) : (
                    characters.map((character, index) => (
                      <div
                        key={character.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg transition-colors",
                          index % 2 === 0 ? "bg-muted/30" : "bg-transparent"
                        )}
                      >
                        <span className="font-medium">{character.name}</span>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {character.dialogue_count != null && (
                            <span>{character.dialogue_count} lines</span>
                          )}
                          {character.scene_count != null && (
                            <span>{character.scene_count} scenes</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Original Document Preview (PDF only) */}
      {format === 'pdf' && pdfUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Original Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border border-border">
              <iframe
                src={pdfUrl}
                className="w-full h-[600px]"
                title="PDF Preview"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
