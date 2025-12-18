import { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterData } from '@/types/database';
import { cn } from '@/lib/utils';
import { Users, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CharacterNetworkProps {
  characters: CharacterData[];
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  dialogueCount: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
  type: string;
  strength: number;
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  ally: 'hsl(var(--success))',
  rival: 'hsl(var(--destructive))',
  lover: 'hsl(var(--chart-4))',
  family: 'hsl(var(--chart-2))',
  friend: 'hsl(var(--chart-3))',
  mentor: 'hsl(var(--chart-5))',
  enemy: 'hsl(var(--destructive))',
  colleague: 'hsl(var(--muted-foreground))',
  default: 'hsl(var(--muted-foreground))',
};

const NODE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

export function CharacterNetwork({ characters }: CharacterNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize nodes and edges
  useEffect(() => {
    if (!characters || characters.length === 0) return;

    const maxDialogue = Math.max(...characters.map(c => c.dialogueCount || 1));
    
    const newNodes: Node[] = characters.slice(0, 15).map((char, i) => ({
      id: char.name,
      label: char.name,
      x: 300 + Math.cos(i * 2 * Math.PI / Math.min(characters.length, 15)) * 200,
      y: 250 + Math.sin(i * 2 * Math.PI / Math.min(characters.length, 15)) * 200,
      vx: 0,
      vy: 0,
      radius: 20 + (char.dialogueCount / maxDialogue) * 30,
      dialogueCount: char.dialogueCount,
      color: NODE_COLORS[i % NODE_COLORS.length],
    }));

    const newEdges: Edge[] = [];
    characters.forEach(char => {
      if (char.relationships) {
        char.relationships.forEach(rel => {
          const targetNode = newNodes.find(n => n.id === rel.character);
          if (targetNode) {
            // Avoid duplicate edges
            const exists = newEdges.some(
              e => (e.source === char.name && e.target === rel.character) ||
                   (e.source === rel.character && e.target === char.name)
            );
            if (!exists) {
              newEdges.push({
                source: char.name,
                target: rel.character,
                type: rel.type || 'default',
                strength: 1,
              });
            }
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [characters]);

  // Force simulation
  const simulate = useCallback(() => {
    if (nodes.length === 0) return;

    setNodes(prevNodes => {
      const newNodes = [...prevNodes];
      
      // Apply forces
      for (let i = 0; i < newNodes.length; i++) {
        const node = newNodes[i];
        
        // Repulsion between nodes
        for (let j = 0; j < newNodes.length; j++) {
          if (i === j) continue;
          const other = newNodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 5000 / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
        
        // Attraction along edges
        edges.forEach(edge => {
          if (edge.source === node.id || edge.target === node.id) {
            const otherId = edge.source === node.id ? edge.target : edge.source;
            const other = newNodes.find(n => n.id === otherId);
            if (other) {
              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              node.vx += dx * 0.01;
              node.vy += dy * 0.01;
            }
          }
        });
        
        // Center gravity
        node.vx += (300 - node.x) * 0.001;
        node.vy += (250 - node.y) * 0.001;
        
        // Apply velocity with damping
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounds
        node.x = Math.max(node.radius, Math.min(600 - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(500 - node.radius, node.y));
      }
      
      return newNodes;
    });
  }, [edges]);

  // Animation loop
  useEffect(() => {
    let frameCount = 0;
    const maxFrames = 300;

    const animate = () => {
      if (frameCount < maxFrames) {
        simulate();
        frameCount++;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulate, nodes.length]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 600 * dpr;
    canvas.height = 500 * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = 'hsl(var(--card))';
    ctx.fillRect(0, 0, 600, 500);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = RELATIONSHIP_COLORS[edge.type] || RELATIONSHIP_COLORS.default;
      ctx.lineWidth = 2;
      ctx.globalAlpha = hoveredNode 
        ? (hoveredNode.id === edge.source || hoveredNode.id === edge.target ? 1 : 0.2)
        : 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;
      const isConnected = hoveredNode && edges.some(
        e => (e.source === hoveredNode.id && e.target === node.id) ||
             (e.target === hoveredNode.id && e.source === node.id)
      );

      ctx.globalAlpha = hoveredNode && !isHovered && !isConnected ? 0.3 : 1;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      if (isHovered || isSelected) {
        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = `${isHovered ? 'bold ' : ''}12px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + node.radius + 16);

      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }, [nodes, edges, hoveredNode, selectedNode, zoom, offset]);

  // Mouse handlers
  const getNodeAtPosition = (x: number, y: number): Node | null => {
    const adjustedX = (x - offset.x) / zoom;
    const adjustedY = (y - offset.y) / zoom;
    
    for (const node of nodes) {
      const dx = adjustedX - node.x;
      const dy = adjustedY - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius) {
        return node;
      }
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setOffset({
        x: offset.x + (e.clientX - dragStart.x),
        y: offset.y + (e.clientY - dragStart.y),
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      const node = getNodeAtPosition(x, y);
      setHoveredNode(node);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = node ? 'pointer' : 'grab';
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const node = getNodeAtPosition(x, y);

    if (node) {
      setSelectedNode(node);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  if (!characters || characters.length === 0) {
    return null;
  }

  const relationshipTypes = [...new Set(edges.map(e => e.type))];

  return (
    <section className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="px-4 py-1.5 rounded-full bg-chart-5/10 text-chart-5 text-sm font-medium">
            Network Analysis
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4">
            Character Relationships
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive force-directed graph of {characters.length} characters and their connections
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Graph */}
          <div className="lg:col-span-3">
            <div 
              ref={containerRef}
              className="relative rounded-2xl bg-card border border-border overflow-hidden"
            >
              {/* Controls */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={resetView}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <canvas
                ref={canvasRef}
                width={600}
                height={500}
                style={{ width: '100%', height: 500 }}
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  setHoveredNode(null);
                  setIsDragging(false);
                }}
              />

              {/* Legend */}
              <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-background/80 backdrop-blur border border-border">
                <p className="text-xs font-medium mb-2">Relationship Types</p>
                <div className="flex flex-wrap gap-2">
                  {relationshipTypes.slice(0, 5).map(type => (
                    <div key={type} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: RELATIONSHIP_COLORS[type] || RELATIONSHIP_COLORS.default }}
                      />
                      <span className="text-xs capitalize">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected character details */}
            {selectedNode ? (
              <div className="p-6 rounded-xl bg-card border border-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: selectedNode.color }}
                  >
                    {selectedNode.label.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedNode.label}</h4>
                    <p className="text-sm text-muted-foreground">{selectedNode.dialogueCount} lines</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Connections</p>
                  {edges
                    .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                    .map((edge, i) => {
                      const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                      return (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span>{otherId}</span>
                          <span 
                            className="px-2 py-0.5 rounded text-xs capitalize"
                            style={{ 
                              backgroundColor: `${RELATIONSHIP_COLORS[edge.type] || RELATIONSHIP_COLORS.default}20`,
                              color: RELATIONSHIP_COLORS[edge.type] || RELATIONSHIP_COLORS.default
                            }}
                          >
                            {edge.type}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-muted/50 border border-border text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click a character to see details</p>
              </div>
            )}

            {/* Stats */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h4 className="font-semibold mb-4">Network Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Characters</span>
                  <span className="font-medium">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Connections</span>
                  <span className="font-medium">{edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Connections</span>
                  <span className="font-medium">{(edges.length * 2 / nodes.length || 0).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Top connected */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h4 className="font-semibold mb-4">Most Connected</h4>
              <div className="space-y-2">
                {nodes
                  .map(node => ({
                    ...node,
                    connections: edges.filter(e => e.source === node.id || e.target === node.id).length
                  }))
                  .sort((a, b) => b.connections - a.connections)
                  .slice(0, 5)
                  .map((node, i) => (
                    <div 
                      key={node.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-lg -mx-2"
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{i + 1}.</span>
                        <span className="text-sm font-medium">{node.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{node.connections}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
