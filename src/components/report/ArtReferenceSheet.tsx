import { CharacterData, SceneData } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  MapPin, 
  Palette,
  BookOpen,
  Star,
  MessageCircle,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtReferenceSheetProps {
  characters: CharacterData[];
  scenes: SceneData[];
}

export function ArtReferenceSheet({ characters, scenes }: ArtReferenceSheetProps) {
  // Extract unique locations from scenes
  const locations = scenes.reduce((acc, scene) => {
    if (scene.location && !acc.some(l => l.name === scene.location)) {
      acc.push({
        name: scene.location,
        appearances: scenes.filter(s => s.location === scene.location).length,
        type: scene.intExt || 'Unknown',
        timeOfDay: scene.timeOfDay || 'Various',
      });
    }
    return acc;
  }, [] as { name: string; appearances: number; type: string; timeOfDay: string }[])
    .sort((a, b) => b.appearances - a.appearances);

  // Sort characters by importance
  const sortedCharacters = [...characters].sort((a, b) => 
    (b.dialogueCount || 0) - (a.dialogueCount || 0)
  );

  const mainCharacters = sortedCharacters.slice(0, 5);
  const supportingCharacters = sortedCharacters.slice(5);

  const getImportanceLevel = (dialogueCount: number): { label: string; color: string } => {
    if (dialogueCount > 50) return { label: 'Lead', color: 'bg-amber-500' };
    if (dialogueCount > 20) return { label: 'Major', color: 'bg-primary' };
    if (dialogueCount > 5) return { label: 'Supporting', color: 'bg-secondary' };
    return { label: 'Minor', color: 'bg-muted' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Palette className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Art Reference Sheet</h2>
        </div>
        <p className="text-muted-foreground">
          Visual reference guide for artists with character and location breakdowns
        </p>
      </div>

      <Tabs defaultValue="characters" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="characters" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Characters
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Style Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="space-y-8">
          {/* Main Characters */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Main Characters ({mainCharacters.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainCharacters.map((char, idx) => {
                const importance = getImportanceLevel(char.dialogueCount || 0);
                return (
                  <Card key={idx} className="overflow-hidden">
                    <div className={cn('h-2', importance.color)} />
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold truncate">{char.name}</h4>
                            <Badge variant="outline" className="text-[10px]">
                              {importance.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {char.dialogueCount} lines
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {char.sceneCount} panels
                            </span>
                          </div>

                          {char.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {char.description}
                            </p>
                          )}

                          {char.arcSummary && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <span className="font-medium">Arc: </span>
                              {char.arcSummary}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Supporting Characters */}
          {supportingCharacters.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Supporting Characters ({supportingCharacters.length})
              </h3>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pr-4">
                  {supportingCharacters.map((char, idx) => (
                    <Card key={idx} className="text-center">
                      <CardContent className="p-3">
                        <div className="w-10 h-12 bg-muted rounded mx-auto mb-2 flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium truncate">{char.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {char.dialogueCount} lines
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((location, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1">{location.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {location.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {location.timeOfDay}
                        </Badge>
                        <Badge className="text-xs">
                          {location.appearances} panels
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {locations.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No location data extracted</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="style">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visual Style Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Panel Density</h4>
                  <p className="text-sm text-muted-foreground">
                    Average of {scenes.length > 0 ? 
                      (scenes.length / (new Set(scenes.map(s => s.pageStart)).size || 1)).toFixed(1) 
                      : 0} panels per page suggests a 
                    {scenes.length / (new Set(scenes.map(s => s.pageStart)).size || 1) > 5 
                      ? ' dense, action-packed' 
                      : ' cinematic, breathable'} visual approach.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Character Design Priority</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mainCharacters.slice(0, 3).map((char, idx) => (
                      <Badge key={idx} variant="outline">
                        {idx + 1}. {char.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Key Locations to Design</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {locations.slice(0, 4).map((loc, idx) => (
                      <Badge key={idx} variant="secondary">
                        {loc.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Production Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <span className="text-sm">Design {mainCharacters.length} main character models</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <span className="text-sm">Create {Math.min(locations.length, 5)} key environment concepts</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <span className="text-sm">Establish color palette and lighting guide</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold">4</span>
                    </div>
                    <span className="text-sm">Define lettering style for dialogue and SFX</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold">5</span>
                    </div>
                    <span className="text-sm">Layout templates for standard page grids</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
