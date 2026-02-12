import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, Users, GitBranch, Maximize2, Minimize2,
  ZoomIn, ZoomOut, RotateCcw, Filter, MessageSquare, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NarrativeGraphData, CharacterData } from '@/types/database';

interface NarrativeGraphViewerProps {
  graphData?: NarrativeGraphData | null;
  characters?: CharacterData[];
  className?: string;
}

// Known noise labels that aren't real characters
const NOISE_LABELS = new Set([
  'TITLE CARD', 'TITLE CARDS', 'CHYRON', 'SUPER', 'SUPERIMPOSE',
  'V.O.', 'O.S.', 'O.C.', 'CONT\'D', 'CONTINUED',
  'INTERCUT', 'MONTAGE', 'FLASHBACK', 'END FLASHBACK',
  'FADE IN', 'FADE OUT', 'CUT TO', 'SMASH CUT',
  'THE END', 'FIN',
]);

// Heuristic: likely not a character if label matches these patterns
function isLikelyNoise(label: string): boolean {
  const upper = label.toUpperCase().trim();
  if (NOISE_LABELS.has(upper)) return true;
  // Script title used as character
  if (upper.length > 20) return true;
  return false;
}

function isRealCharacter(char: CharacterData): boolean {
  if (isLikelyNoise(char.name)) return false;
  // Keep characters with meaningful presence
  if (char.dialogueCount >= 2 && char.sceneCount >= 1) return true;
  if (char.sceneCount >= 2) return true;
  return false;
}

interface CharacterNode {
  id: string;
  name: string;
  dialogueCount: number;
  sceneCount: number;
  description?: string;
  arcSummary?: string;
  relationships?: Array<{ character: string; type: string; description?: string }>;
  x: number;
  y: number;
  radius: number;
}

interface CharacterEdge {
  source: string;
  target: string;
  weight: number; // co-occurrence strength
}

export function NarrativeGraphViewer({ graphData, characters, className }: NarrativeGraphViewerProps) {
  const [activeTab, setActiveTab] = useState<'character' | 'plot'>('character');
  const [zoom, setZoom] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showMinorChars, setShowMinorChars] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!selectedNode) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelectedNode(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedNode]);

  // Build character relationship graph from characters data
  const characterGraph = useMemo(() => {
    if (!characters?.length) return { nodes: [], edges: [] };

    const realChars = characters.filter(c => isRealCharacter(c));
    
    // Split into major/minor based on dialogue presence
    const maxDialogue = Math.max(...realChars.map(c => c.dialogueCount || 0), 1);
    const majorThreshold = maxDialogue * 0.1; // top 90% by dialogue
    
    const filteredChars = showMinorChars 
      ? realChars 
      : realChars.filter(c => (c.dialogueCount || 0) >= majorThreshold || (c.sceneCount || 0) >= 3);

    if (filteredChars.length === 0) return { nodes: [], edges: [] };

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    // Position using radial layout with importance-based distance from center
    const sorted = [...filteredChars].sort((a, b) => 
      (b.dialogueCount || 0) + (b.sceneCount || 0) * 2 - 
      (a.dialogueCount || 0) - (a.sceneCount || 0) * 2
    );

    const nodes: CharacterNode[] = sorted.map((char, i) => {
      const importance = ((char.dialogueCount || 0) + (char.sceneCount || 0) * 3) / 
        (maxDialogue + Math.max(...realChars.map(c => c.sceneCount || 0), 1) * 3);
      
      // Most important character near center, others radiate outward
      const ringIndex = i === 0 ? 0 : Math.ceil(i / 4);
      const ringCount = i === 0 ? 1 : Math.min(4, sorted.length - (ringIndex - 1) * 4);
      const posInRing = i === 0 ? 0 : ((i - 1) % 4);
      
      const radius = ringIndex === 0 ? 0 : 80 + ringIndex * 70;
      const angleOffset = ringIndex * 0.3; // stagger rings
      const angle = ringIndex === 0 ? 0 : (2 * Math.PI * posInRing) / ringCount + angleOffset;
      
      const nodeRadius = Math.max(14, Math.min(32, 14 + importance * 24));

      return {
        id: char.name,
        name: char.name,
        dialogueCount: char.dialogueCount || 0,
        sceneCount: char.sceneCount || 0,
        description: char.description,
        arcSummary: char.arcSummary,
        relationships: char.relationships,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        radius: nodeRadius,
      };
    });

    // Apply simple force repulsion to prevent overlaps
    for (let iter = 0; iter < 50; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = nodes[i].radius + nodes[j].radius + 40;
          
          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) / dist * 0.3;
            const fx = dx * force;
            const fy = dy * force;
            nodes[i].x -= fx;
            nodes[i].y -= fy;
            nodes[j].x += fx;
            nodes[j].y += fy;
          }
        }
        // Keep in bounds
        nodes[i].x = Math.max(nodes[i].radius + 30, Math.min(width - nodes[i].radius - 30, nodes[i].x));
        nodes[i].y = Math.max(nodes[i].radius + 20, Math.min(height - nodes[i].radius - 20, nodes[i].y));
      }
    }

    // Infer connections: characters with higher scene counts likely co-occur
    // Use a simple heuristic: connect characters whose scene ranges overlap
    const edges: CharacterEdge[] = [];
    for (let i = 0; i < filteredChars.length; i++) {
      for (let j = i + 1; j < filteredChars.length; j++) {
        const a = filteredChars[i];
        const b = filteredChars[j];
        // Weight by shared presence (geometric mean of scene counts, normalized)
        const sharedWeight = Math.sqrt((a.sceneCount || 1) * (b.sceneCount || 1));
        const maxScene = Math.max(...realChars.map(c => c.sceneCount || 0), 1);
        const normalizedWeight = sharedWeight / maxScene;
        
        // Only connect if both have meaningful presence
        if ((a.sceneCount || 0) >= 2 && (b.sceneCount || 0) >= 2) {
          edges.push({
            source: a.name,
            target: b.name,
            weight: normalizedWeight,
          });
        } else if ((a.sceneCount || 0) + (b.sceneCount || 0) >= 4) {
          edges.push({
            source: a.name,
            target: b.name,
            weight: normalizedWeight * 0.5,
          });
        }
      }
    }

    return { nodes, edges };
  }, [characters, showMinorChars]);

  // Plot structure from graph data
  const plotNodes = useMemo(() => {
    if (!graphData?.nodes?.length) return { nodes: [], edges: [] };

    // Filter to only scene nodes, keep them in order
    const sceneNodes = graphData.nodes
      .filter(n => n.type === 'scene' || n.type === 'beat' || n.type === 'act' || n.type === 'sequence')
      .slice(0, 30); // Limit to first 30 for readability

    const sceneEdges = graphData.edges.filter(e => {
      const sourceNode = sceneNodes.find(n => n.id === e.source);
      const targetNode = sceneNodes.find(n => n.id === e.target);
      return sourceNode && targetNode;
    });

    const width = 600;
    const height = 400;
    const padding = 50;

    // Layout scenes in a flowing grid
    const cols = Math.ceil(Math.sqrt(sceneNodes.length * 1.5));
    const rows = Math.ceil(sceneNodes.length / cols);
    const cellW = (width - padding * 2) / cols;
    const cellH = (height - padding * 2) / Math.max(rows, 1);

    const positioned = sceneNodes.map((node, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        ...node,
        x: padding + col * cellW + cellW / 2,
        y: padding + row * cellH + cellH / 2,
        radius: 10,
      };
    });

    return { nodes: positioned, edges: sceneEdges };
  }, [graphData]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.3));
  const handleReset = () => setZoom(1);

  const connectedToHovered = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const connected = new Set<string>();
    connected.add(hoveredNode);
    
    if (activeTab === 'character') {
      characterGraph.edges.forEach(e => {
        if (e.source === hoveredNode) connected.add(e.target);
        if (e.target === hoveredNode) connected.add(e.source);
      });
    } else {
      plotNodes.edges.forEach(e => {
        if (e.source === hoveredNode) connected.add(e.target);
        if (e.target === hoveredNode) connected.add(e.source);
      });
    }
    return connected;
  }, [hoveredNode, activeTab, characterGraph.edges, plotNodes.edges]);

  const hasCharacterData = characters && characters.filter(c => isRealCharacter(c)).length > 0;
  const hasPlotData = graphData && graphData.nodes?.length > 0;

  // Empty state
  if (!hasCharacterData && !hasPlotData) {
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

  const renderCharacterGraph = () => {
    const { nodes, edges } = characterGraph;
    if (nodes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Users className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">No significant characters found</p>
        </div>
      );
    }

    const width = 600;
    const height = 400;
    const maxDialogue = Math.max(...nodes.map(n => n.dialogueCount), 1);

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        {/* Render edges */}
        <g className="edges">
          {edges.map((edge, i) => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;

            const isHighlighted = hoveredNode && 
              (edge.source === hoveredNode || edge.target === hoveredNode);
            const isDimmed = hoveredNode && !isHighlighted;
            
            const opacity = isDimmed ? 0.05 : Math.max(0.15, Math.min(0.6, edge.weight));
            const strokeWidth = isDimmed ? 0.5 : Math.max(1, Math.min(3, edge.weight * 4));

            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={cn(
                  isHighlighted ? 'stroke-chart-1' : 'stroke-muted-foreground'
                )}
                strokeWidth={isHighlighted ? strokeWidth + 1 : strokeWidth}
                opacity={opacity}
                strokeDasharray={edge.weight < 0.3 ? '4 4' : undefined}
              />
            );
          })}
        </g>

        {/* Render nodes */}
        <g className="nodes">
          {nodes.map(node => {
            const isHovered = hoveredNode === node.id;
            const isConnected = connectedToHovered.has(node.id);
            const isDimmed = hoveredNode && !isConnected;
            const dialogueRatio = node.dialogueCount / maxDialogue;
            
            // Color intensity based on dialogue count
            const fillOpacity = isDimmed ? 0.15 : Math.max(0.5, dialogueRatio);

            return (
              <g 
                key={node.id} 
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                opacity={isDimmed ? 0.3 : 1}
              >
                {/* Glow ring on hover or selected */}
                {(isHovered || selectedNode === node.id) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 6}
                    className="fill-chart-1/10 stroke-chart-1/30"
                    strokeWidth={2}
                  />
                )}
                
                {/* Main circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  className="stroke-background"
                  strokeWidth={2}
                  fill={`hsl(var(--chart-1) / ${fillOpacity})`}
                />

                {/* Dialogue count indicator */}
                {node.dialogueCount > 0 && (
                  <text
                    x={node.x}
                    y={node.y + 4}
                    className="fill-chart-1-foreground text-[9px] font-bold pointer-events-none"
                    textAnchor="middle"
                    opacity={isDimmed ? 0.3 : 0.9}
                  >
                    {node.dialogueCount}
                  </text>
                )}

                {/* Name label */}
                <text
                  x={node.x}
                  y={node.y + node.radius + 14}
                  className="fill-foreground text-[11px] font-medium pointer-events-none"
                  textAnchor="middle"
                  opacity={isDimmed ? 0.3 : 1}
                >
                  {node.name.length > 14 ? node.name.slice(0, 14) + '…' : node.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  const renderPlotGraph = () => {
    const { nodes, edges } = plotNodes;
    if (nodes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <GitBranch className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">No plot structure data available</p>
        </div>
      );
    }

    const width = 600;
    const height = 400;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        {/* Edges */}
        <g>
          {edges.map((edge, i) => {
            const source = nodes.find(n => n.id === edge.source);
            const target = nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;

            const isHighlighted = hoveredNode && 
              (edge.source === hoveredNode || edge.target === hoveredNode);
            const isDimmed = hoveredNode && !isHighlighted;

            return (
              <line
                key={i}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={isHighlighted ? 'stroke-chart-2' : 'stroke-muted-foreground/30'}
                strokeWidth={isHighlighted ? 2 : 1}
                opacity={isDimmed ? 0.1 : 0.6}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node: any) => {
            const isHovered = hoveredNode === node.id;
            const isConnected = connectedToHovered.has(node.id);
            const isDimmed = hoveredNode && !isConnected;

            // Extract short label
            const shortLabel = node.label
              .replace(/^PAGE\s*/i, 'P')
              .replace(/\s*-\s*PANEL\s*/i, '.')
              .replace(/^(P\d+\.\d+).*/, '$1');

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                opacity={isDimmed ? 0.2 : 1}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  className={cn(
                    'stroke-background stroke-2',
                    isHovered ? 'fill-chart-2' : 'fill-chart-2/60'
                  )}
                />
                <text
                  x={node.x}
                  y={node.y + node.radius + 12}
                  className="fill-foreground text-[8px] pointer-events-none"
                  textAnchor="middle"
                  opacity={isDimmed ? 0.3 : 0.8}
                >
                  {shortLabel.length > 8 ? shortLabel.slice(0, 8) : shortLabel}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  const realCharCount = characters?.filter(c => isRealCharacter(c)).length || 0;
  const totalCharCount = characters?.length || 0;

  return (
    <Card className={cn(
      'bg-card/50 border-border/50 transition-all duration-300',
      isExpanded && 'fixed inset-4 z-50',
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <Network className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <CardTitle className="text-lg">Character Network</CardTitle>
              <CardDescription>
                Interactive map of character relationships and story structure
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8">
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {realCharCount} Characters
          </Badge>
          {totalCharCount > realCharCount && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              <Filter className="h-3 w-3 mr-1" />
              {totalCharCount - realCharCount} filtered
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            <GitBranch className="h-3 w-3 mr-1" />
            {characterGraph.edges.length} Connections
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'character' | 'plot')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-2 w-auto">
              <TabsTrigger value="character" className="flex items-center gap-2 px-4">
                <Users className="h-4 w-4" />
                Character Network
              </TabsTrigger>
              <TabsTrigger value="plot" className="flex items-center gap-2 px-4">
                <GitBranch className="h-4 w-4" />
                Scene Flow
              </TabsTrigger>
            </TabsList>

            {activeTab === 'character' && (
              <Button
                variant={showMinorChars ? 'secondary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setShowMinorChars(!showMinorChars)}
              >
                <Filter className="h-3 w-3 mr-1" />
                {showMinorChars ? 'All Characters' : 'Major Only'}
              </Button>
            )}
          </div>

          <TabsContent value="character" className="mt-0">
            <div ref={containerRef} className={cn(
              'relative bg-muted/20 rounded-lg border border-border/50 overflow-hidden',
              isExpanded ? 'h-[calc(100vh-280px)]' : 'h-[400px]'
            )}>
              {renderCharacterGraph()}

              {/* Character detail popover */}
              {selectedNode && (() => {
                const node = characterGraph.nodes.find(n => n.id === selectedNode);
                if (!node) return null;
                // Convert SVG coords to container-relative pixel position
                const containerEl = containerRef.current;
                const svgW = 600, svgH = 400;
                const cW = containerEl?.clientWidth || svgW;
                const cH = containerEl?.clientHeight || svgH;
                const pxX = (node.x / svgW) * cW;
                const pxY = (node.y / svgH) * cH;
                // Position popover to the right if space, else left
                const popLeft = pxX > cW * 0.6 ? pxX - 260 : pxX + 20;
                const popTop = Math.max(8, Math.min(pxY - 40, cH - 220));

                return (
                  <div
                    ref={popoverRef}
                    className="absolute z-20 w-[250px] rounded-lg border bg-popover text-popover-foreground shadow-lg p-3 text-xs animate-in fade-in-0 zoom-in-95"
                    style={{ left: popLeft, top: popTop }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{node.name}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedNode(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-3 mb-2">
                      <Badge variant="secondary" className="text-[10px]">{node.sceneCount} scenes</Badge>
                      <Badge variant="secondary" className="text-[10px]">{node.dialogueCount} lines</Badge>
                    </div>
                    {node.description && (
                      <p className="text-muted-foreground mb-2 leading-relaxed">{node.description}</p>
                    )}
                    {node.arcSummary && (
                      <div className="mb-2">
                        <span className="font-medium text-foreground">Arc: </span>
                        <span className="text-muted-foreground">{node.arcSummary}</span>
                      </div>
                    )}
                    {node.relationships && node.relationships.length > 0 && (
                      <div>
                        <span className="font-medium text-foreground block mb-1">Relationships:</span>
                        <div className="space-y-0.5">
                          {node.relationships.slice(0, 4).map((rel, i) => (
                            <div key={i} className="text-muted-foreground">
                              <span className="text-foreground">{rel.character}</span> — {rel.type}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!node.description && !node.arcSummary && (!node.relationships || node.relationships.length === 0) && (
                      <p className="text-muted-foreground italic">No detailed data yet. Run analysis to populate.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </TabsContent>

          <TabsContent value="plot" className="mt-0">
            <div className={cn(
              'relative bg-muted/20 rounded-lg border border-border/50 overflow-hidden',
              isExpanded ? 'h-[calc(100vh-280px)]' : 'h-[400px]'
            )}>
              {renderPlotGraph()}
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-4 text-xs">
            {activeTab === 'character' ? (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-chart-1/80" />
                  <span className="text-muted-foreground">Major character</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-chart-1/40" />
                  <span className="text-muted-foreground">Minor character</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Number = dialogue lines</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-chart-2" />
                  <span className="text-muted-foreground">Scene / Panel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-px bg-muted-foreground/40" />
                  <span className="text-muted-foreground">Sequence flow</span>
                </div>
              </>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">Click a node to explore</span>
        </div>
      </CardContent>
    </Card>
  );
}
