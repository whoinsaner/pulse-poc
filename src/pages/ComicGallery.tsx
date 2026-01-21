import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Palette, BookOpen, Sparkles, ArrowRight, FileText, Users, Layers } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Import cover images
import neonRoninCover from "@/assets/comic-covers/neon-ronin.jpg";
import lastCartographerCover from "@/assets/comic-covers/last-cartographer.jpg";
import midnightDinerCover from "@/assets/comic-covers/midnight-diner.jpg";
import hollowEarthCover from "@/assets/comic-covers/hollow-earth.jpg";
import runRabbitRunCover from "@/assets/comic-covers/run-rabbit-run.jpg";

interface ComicScript {
  id: string;
  title: string;
  genre: string;
  logline: string;
  pageCount: number;
  coverImage: string;
  characterCount: number;
  sceneCount: number;
  genreColor: string;
}

const COMIC_SCRIPTS: ComicScript[] = [
  {
    id: "comic-cyberpunk-neon",
    title: "Neon Ronin",
    genre: "Cyberpunk Action",
    logline: "In a cyberpunk Tokyo overrun by rogue AI, a disgraced samurai with cybernetic implants must protect a child who holds the key to humanity's survival.",
    pageCount: 24,
    coverImage: neonRoninCover,
    characterCount: 4,
    sceneCount: 6,
    genreColor: "chart-1",
  },
  {
    id: "comic-fantasy-cartographer",
    title: "The Last Cartographer",
    genre: "Fantasy Adventure",
    logline: "In a dying world where maps rewrite reality, an elderly cartographer and her apprentice must draw the one map that could save everything—or erase it all.",
    pageCount: 24,
    coverImage: lastCartographerCover,
    characterCount: 5,
    sceneCount: 8,
    genreColor: "chart-2",
  },
  {
    id: "comic-sliceoflife-diner",
    title: "Midnight Diner",
    genre: "Slice of Life Drama",
    logline: "A late-night diner in Tokyo becomes the crossroads for strangers whose stories interweave across one transformative evening.",
    pageCount: 22,
    coverImage: midnightDinerCover,
    characterCount: 6,
    sceneCount: 7,
    genreColor: "chart-3",
  },
  {
    id: "comic-horror-hollow",
    title: "Hollow Earth",
    genre: "Sci-Fi Horror",
    logline: "A deep-sea drilling crew discovers a bioluminescent civilization beneath the ocean floor—and awakens something that has been waiting for millennia.",
    pageCount: 24,
    coverImage: hollowEarthCover,
    characterCount: 5,
    sceneCount: 8,
    genreColor: "chart-4",
  },
  {
    id: "comic-crime-rabbit",
    title: "Run Rabbit Run",
    genre: "Crime Thriller",
    logline: "A getaway driver with three hours to live must complete one last job while rival gangs, corrupt cops, and her own past close in.",
    pageCount: 22,
    coverImage: runRabbitRunCover,
    characterCount: 6,
    sceneCount: 7,
    genreColor: "chart-5",
  },
];

export default function ComicGallery() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[500px] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleViewScript = (scriptId: string) => {
    // Navigate to sample comic script page with selected script
    navigate(`/sample-comic-script?id=${scriptId}`);
  };

  const handleAnalyzeScript = (scriptId: string) => {
    // Navigate to sample comic report for this script
    navigate("/sample-comic-report");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Comic Script Gallery</h1>
                <p className="text-muted-foreground text-sm">
                  Explore sample comic scripts across diverse genres
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMIC_SCRIPTS.map((script) => (
            <Card
              key={script.id}
              className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Cover Image */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={script.coverImage}
                  alt={`${script.title} cover`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Genre Badge */}
                <Badge
                  className={`absolute top-3 left-3 bg-${script.genreColor} text-white border-0`}
                  style={{ backgroundColor: `hsl(var(--${script.genreColor}))` }}
                >
                  {script.genre}
                </Badge>

                {/* Page Count */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                  <FileText className="h-3 w-3" />
                  {script.pageCount} pages
                </div>

                {/* Quick Stats - visible on hover */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{script.characterCount} characters</span>
                  </div>
                  <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <span>{script.sceneCount} scenes</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {script.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {script.logline}
                </p>
              </CardContent>

              {/* Actions */}
              <CardFooter className="p-4 pt-0 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewScript(script.id)}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  View Script
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAnalyzeScript(script.id)}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  See Analysis
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Ready to analyze your own comic?</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Upload your comic script and get comprehensive analysis with our specialized comic framework—covering panel flow, lettering, pacing, and more.
              </p>
              <Button onClick={() => navigate("/upload")} className="mt-2">
                Upload Your Comic
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
