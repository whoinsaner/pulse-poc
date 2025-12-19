import { useNavigate } from 'react-router-dom';
import { SAMPLE_COMIC_SCRIPT, SAMPLE_COMIC_SCENES, SAMPLE_COMIC_CHARACTERS } from '@/data/sampleComicScript';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Film, 
  Palette, 
  BarChart3,
  Clock,
  MapPin,
  Layers
} from 'lucide-react';

export default function SampleComicScript() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Sample Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-chart-5/10 border-b border-chart-5/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-chart-5" />
            <span className="text-sm font-medium">
              Sample Comic Script: "Neon Ronin"
            </span>
            <Badge variant="secondary" className="text-xs bg-chart-5/20 text-chart-5 border-chart-5/30">
              Comic Demo
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/sample-comic-report')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Report
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/auth?mode=signup')}
            >
              Analyze Your Comic
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="pt-14 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{SAMPLE_COMIC_SCRIPT.title}</h1>
                <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/30">
                  <Layers className="h-3 w-3 mr-1" />
                  Comic Script
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {SAMPLE_COMIC_SCRIPT.logline}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Badge>{SAMPLE_COMIC_SCRIPT.genre}</Badge>
                <Badge variant="outline">{SAMPLE_COMIC_SCRIPT.pageCount} pages</Badge>
                <Badge variant="outline" className="capitalize">{SAMPLE_COMIC_SCRIPT.format}</Badge>
              </div>
            </div>
            
            <Card className="w-full md:w-auto">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-chart-5">{SAMPLE_COMIC_SCENES.length}</p>
                    <p className="text-xs text-muted-foreground">Pages</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-chart-5">{SAMPLE_COMIC_CHARACTERS.length}</p>
                    <p className="text-xs text-muted-foreground">Characters</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-chart-5">24</p>
                    <p className="text-xs text-muted-foreground">Panels</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="script" className="space-y-6">
          <TabsList>
            <TabsTrigger value="script" className="gap-2">
              <FileText className="h-4 w-4" />
              Script
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <Layers className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="characters" className="gap-2">
              <Users className="h-4 w-4" />
              Characters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="script">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Comic Script (Pages 1-6)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] rounded-lg border border-border bg-muted/20 p-6">
                  <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {SAMPLE_COMIC_SCRIPT.content}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <div className="grid gap-4">
              {SAMPLE_COMIC_SCENES.map((scene) => (
                <Card key={scene.sceneNumber} className="card-hover border-chart-5/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono bg-chart-5/10 text-chart-5 border-chart-5/30">
                            Page {scene.sceneNumber}
                          </Badge>
                          <h3 className="font-semibold">{scene.heading}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {scene.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {scene.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {scene.timeOfDay}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {scene.emotionalTone}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-chart-5/10 text-chart-5 border-chart-5/30">
                          {scene.intExt}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="characters">
            <div className="grid md:grid-cols-2 gap-6">
              {SAMPLE_COMIC_CHARACTERS.map((character) => (
                <Card key={character.name} className="card-hover border-chart-5/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{character.name}</span>
                      {character.firstAppearance > 0 && (
                        <Badge variant="outline" className="bg-chart-5/10 text-chart-5 border-chart-5/30">
                          Page {character.firstAppearance}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {character.description}
                    </p>
                    
                    {character.dialogueCount > 0 && (
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dialogue: </span>
                          <span className="font-medium">{character.dialogueCount} lines</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pages: </span>
                          <span className="font-medium">{character.sceneCount}</span>
                        </div>
                      </div>
                    )}

                    {character.arcSummary && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Character Arc</p>
                        <p className="text-sm italic">{character.arcSummary}</p>
                      </div>
                    )}

                    {character.relationships.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Relationships</p>
                        <div className="flex flex-wrap gap-2">
                          {character.relationships.map((rel, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {rel.character} ({rel.type})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="mt-12 bg-gradient-to-br from-chart-5/10 via-card to-card border-chart-5/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-3">
              Ready to analyze your own comic script?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Get comprehensive analysis including panel flow, art direction notes, 
              and visual storytelling insights tailored for graphic narratives.
            </p>
            <Button size="lg" onClick={() => navigate('/auth?mode=signup')} className="bg-chart-5 hover:bg-chart-5/90">
              <Palette className="h-4 w-4 mr-2" />
              Start Analyzing Comics
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
