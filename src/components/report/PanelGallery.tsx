import { useState } from 'react';
import { SceneData } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  LayoutGrid, 
  Rows, 
  Maximize2, 
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelGalleryProps {
  scenes: SceneData[];
}

type ViewMode = 'grid' | 'pages' | 'flow';

export function PanelGallery({ scenes }: PanelGalleryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedPanel, setSelectedPanel] = useState<SceneData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Group scenes by page
  const pageGroups = scenes.reduce((acc, scene) => {
    const page = scene.pageStart || 1;
    if (!acc[page]) acc[page] = [];
    acc[page].push(scene);
    return acc;
  }, {} as Record<number, SceneData[]>);

  const pages = Object.keys(pageGroups).map(Number).sort((a, b) => a - b);
  const totalPages = pages.length || 1;

  const getPanelType = (heading: string): string => {
    const lowerHeading = heading.toLowerCase();
    if (lowerHeading.includes('splash')) return 'splash';
    if (lowerHeading.includes('spread')) return 'spread';
    if (lowerHeading.includes('inset')) return 'inset';
    return 'panel';
  };

  const getPanelColor = (type: string): string => {
    switch (type) {
      case 'splash': return 'bg-amber-500/20 border-amber-500/40';
      case 'spread': return 'bg-purple-500/20 border-purple-500/40';
      case 'inset': return 'bg-cyan-500/20 border-cyan-500/40';
      default: return 'bg-primary/10 border-primary/30';
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {scenes.map((scene, idx) => {
        const panelType = getPanelType(scene.heading);
        return (
          <Card
            key={idx}
            className={cn(
              'cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2',
              getPanelColor(panelType),
              selectedPanel?.sceneNumber === scene.sceneNumber && 'ring-2 ring-primary'
            )}
            onClick={() => setSelectedPanel(scene)}
          >
            <CardContent className="p-3 aspect-[3/4] flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-muted/50 rounded-md mb-2">
                {panelType === 'splash' ? (
                  <Sparkles className="h-8 w-8 text-amber-500" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="text-[10px] px-1.5">
                  {panelType.toUpperCase()}
                </Badge>
                <p className="text-xs font-medium truncate">
                  P{scene.pageStart || '?'} - #{scene.sceneNumber}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderPageView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="aspect-[2/3] bg-muted/30 rounded-lg p-4 flex flex-col gap-2">
              <div className="text-center mb-2 pb-2 border-b border-border">
                <span className="text-sm font-bold">PAGE {pages[currentPage - 1] || currentPage}</span>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-2">
                {(pageGroups[pages[currentPage - 1]] || []).map((scene, idx) => {
                  const panelType = getPanelType(scene.heading);
                  const isFullWidth = panelType === 'splash' || panelType === 'spread';
                  
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'rounded border-2 p-2 flex flex-col justify-between cursor-pointer hover:bg-muted/50 transition-colors',
                        getPanelColor(panelType),
                        isFullWidth && 'col-span-2'
                      )}
                      onClick={() => setSelectedPanel(scene)}
                    >
                      <div className="text-xs font-medium">
                        Panel {scene.sceneNumber}
                      </div>
                      {scene.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                          {scene.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderFlowView = () => (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-4 pb-4">
        {pages.map((pageNum) => (
          <Card key={pageNum} className="flex-shrink-0 w-[280px] border-2 border-border">
            <CardContent className="p-4">
              <div className="text-center mb-3 pb-2 border-b border-border">
                <span className="text-sm font-bold">PAGE {pageNum}</span>
              </div>
              <div className="space-y-2">
                {(pageGroups[pageNum] || []).map((scene, idx) => {
                  const panelType = getPanelType(scene.heading);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'rounded border p-2 cursor-pointer hover:bg-muted/50 transition-colors',
                        getPanelColor(panelType)
                      )}
                      onClick={() => setSelectedPanel(scene)}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {panelType}
                        </Badge>
                        <span className="text-xs">#{scene.sceneNumber}</span>
                      </div>
                      {scene.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">
                          {scene.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Panel Gallery</h2>
          <p className="text-muted-foreground">
            {scenes.length} panels across {totalPages} pages
          </p>
        </div>
        
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'pages' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('pages')}
          >
            <Rows className="h-4 w-4 mr-1" />
            Pages
          </Button>
          <Button
            variant={viewMode === 'flow' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('flow')}
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            Flow
          </Button>
        </div>
      </div>

      {/* Panel stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{scenes.length}</p>
            <p className="text-xs text-muted-foreground">Total Panels</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {scenes.filter(s => getPanelType(s.heading) === 'splash').length}
            </p>
            <p className="text-xs text-muted-foreground">Splash Pages</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {scenes.filter(s => getPanelType(s.heading) === 'spread').length}
            </p>
            <p className="text-xs text-muted-foreground">Double Spreads</p>
          </CardContent>
        </Card>
        <Card className="bg-muted">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {totalPages > 0 ? (scenes.length / totalPages).toFixed(1) : 0}
            </p>
            <p className="text-xs text-muted-foreground">Avg Panels/Page</p>
          </CardContent>
        </Card>
      </div>

      {/* View content */}
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'pages' && renderPageView()}
      {viewMode === 'flow' && renderFlowView()}

      {/* Selected panel detail */}
      {selectedPanel && (
        <Card className="mt-8 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">{selectedPanel.heading}</h3>
                <p className="text-sm text-muted-foreground">
                  Page {selectedPanel.pageStart} • Panel #{selectedPanel.sceneNumber}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPanel(null)}>
                Close
              </Button>
            </div>
            {selectedPanel.description && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed">{selectedPanel.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
