import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, Users, GitBranch, Maximize2, Minimize2,
  ZoomIn, ZoomOut, RotateCcw, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NarrativeGraphData } from '@/types/database';

interface NarrativeGraphViewerProps {
  graphData?: NarrativeGraphData | null;
  className?: string;
}

const NODE_COLORS: Record<string, string> = {
  character: 'fill-chart-1',
  scene: 'fill-chart-2',
  event: 'fill-chart-3',
  theme: 'fill-chart-4',
  beat: 'fill-chart-3',
  act: 'fill-chart-4',
  sequence: 'fill-chart-5',
};

const NODE_SIZES: Record<string, number> = {
  character: 24,
  scene: 18,
  event: 16,
  theme: 20,
  beat: 16,
  act: 24,
  sequence: 20,
};

export function NarrativeGraphViewer({ graphData, className }: NarrativeGraphViewerProps) {
  const [activeTab, setActiveTab] = useState<'character' | 'plot'>('character');
  const [zoom, setZoom] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate positions for nodes using a simple force-directed-like layout
  const nodePositions = useMemo(() => {
    if (!graphData?.nodes?.length) return {};
    
    const positions: Record<string, { x: number; y: number }> = {};
    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Group nodes by type
    const nodesByType: Record<string, typeof graphData.nodes> = {};
    graphData.nodes.forEach(node => {
      const type = node.type || 'scene';
      if (!nodesByType[type]) nodesByType[type] = [];
      nodesByType[type].push(node);
    });
    
    // Position nodes in concentric circles by type
    let typeIndex = 0;
    Object.entries(nodesByType).forEach(([, nodes]) => {
      const radius = 80 + typeIndex * 60;
      nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      });
      typeIndex++;
    });
    
    return positions;
  }, [graphData?.nodes]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5));
  const handleReset = () => setZoom(1);

  // Empty state
  if (!graphData || !graphData.nodes?.length) {
    return (
      <Card className={cn('bg-card/50 border-border/50', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Network className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Graph Data Available</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Narrative graph visualization will appear here once the script has been analyzed
            and relationship data has been extracted.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderGraph = () => {
    const width = 600;
    const height = 400;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className="fill-muted-foreground/50"
            />
          </marker>
        </defs>

        {/* Render edges */}
        <g className="edges">
          {graphData.edges.map((edge, i) => {
            const sourcePos = nodePositions[edge.source];
            const targetPos = nodePositions[edge.target];
            if (!sourcePos || !targetPos) return null;

            const dx = targetPos.x - sourcePos.x;
            const dy = targetPos.y - sourcePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Offset to not overlap with node circles
            const sourceNode = graphData.nodes.find(n => n.id === edge.source);
            const targetNode = graphData.nodes.find(n => n.id === edge.target);
            const sourceRadius = NODE_SIZES[sourceNode?.type || 'character'] / 2;
            const targetRadius = NODE_SIZES[targetNode?.type || 'character'] / 2;
            
            const offsetX = (dx / dist) || 0;
            const offsetY = (dy / dist) || 0;

            return (
              <g key={i}>
                <line
                  x1={sourcePos.x + offsetX * sourceRadius}
                  y1={sourcePos.y + offsetY * sourceRadius}
                  x2={targetPos.x - offsetX * targetRadius}
                  y2={targetPos.y - offsetY * targetRadius}
                  className="stroke-muted-foreground/30"
                  strokeWidth={1}
                  markerEnd="url(#arrowhead)"
                />
                {edge.type && (
                  <text
                    x={(sourcePos.x + targetPos.x) / 2}
                    y={(sourcePos.y + targetPos.y) / 2 - 5}
                    className="fill-muted-foreground text-[8px]"
                    textAnchor="middle"
                  >
                    {edge.type}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Render nodes */}
        <g className="nodes">
          {graphData.nodes.map(node => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const size = NODE_SIZES[node.type] || 18;
            const colorClass = NODE_COLORS[node.type] || 'fill-chart-2';

            return (
              <g key={node.id} className="cursor-pointer hover:opacity-80 transition-opacity">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size / 2}
                  className={cn(colorClass, 'stroke-background stroke-2')}
                />
                <text
                  x={pos.x}
                  y={pos.y + size / 2 + 12}
                  className="fill-foreground text-[10px] font-medium"
                  textAnchor="middle"
                >
                  {node.label.length > 12 ? node.label.slice(0, 12) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  const stats = {
    nodes: graphData.nodes.length,
    edges: graphData.edges.length,
    acts: graphData.nodes.filter(n => n.type === 'act').length,
    scenes: graphData.nodes.filter(n => n.type === 'scene').length,
  };

  return (
    <Card className={cn(
      'bg-card/50 border-border/50 transition-all duration-300',
      isExpanded && 'fixed inset-4 z-50',
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <Network className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <CardTitle className="text-lg">Narrative Graph</CardTitle>
              <CardDescription>
                Visual representation of story relationships
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {stats.nodes} Nodes
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" />
            {stats.edges} Connections
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'character' | 'plot')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="character" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Character Relations
            </TabsTrigger>
            <TabsTrigger value="plot" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Plot Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="mt-0">
            <div className={cn(
              'relative bg-muted/20 rounded-lg border border-border/50 overflow-hidden',
              isExpanded ? 'h-[calc(100vh-250px)]' : 'h-[400px]'
            )}>
              {renderGraph()}
            </div>
          </TabsContent>

          <TabsContent value="plot" className="mt-0">
            <div className={cn(
              'relative bg-muted/20 rounded-lg border border-border/50 overflow-hidden',
              isExpanded ? 'h-[calc(100vh-250px)]' : 'h-[400px]'
            )}>
              {renderGraph()}
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Legend:</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-chart-1" />
              <span>Character</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-chart-2" />
              <span>Scene</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-chart-3" />
              <span>Event</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-chart-4" />
              <span>Theme</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
