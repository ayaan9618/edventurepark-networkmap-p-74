import { useCallback, useEffect, useState } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  ConnectionMode,
  BackgroundVariant,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PersonNode } from './nodes/PersonNode';
import { StartupNode } from './nodes/StartupNode';
import { NetworkData } from '../types/network';
import { Button } from './ui/button';
import { Network, Grid3X3, Layers, Circle } from 'lucide-react';

const nodeTypes = {
  person: PersonNode,
  startup: StartupNode,
};

interface NetworkGraphProps {
  data: NetworkData;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
}

type LayoutType = 'force' | 'hierarchical' | 'circular' | 'grid';

// Force-directed layout algorithm
const applyForceLayout = (nodes: Node[], edges: Edge[], iterations = 100) => {
  const nodeMap = new Map(nodes.map(node => [node.id, { ...node }]));
  
  for (let i = 0; i < iterations; i++) {
    // Repulsive forces between all nodes
    nodes.forEach(nodeA => {
      nodes.forEach(nodeB => {
        if (nodeA.id === nodeB.id) return;
        
        const dx = nodeA.position.x - nodeB.position.x;
        const dy = nodeA.position.y - nodeB.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const repulsiveForce = 5000 / (distance * distance);
        const forceX = (dx / distance) * repulsiveForce;
        const forceY = (dy / distance) * repulsiveForce;
        
        nodeA.position.x += forceX * 0.1;
        nodeA.position.y += forceY * 0.1;
      });
    });
    
    // Attractive forces along edges
    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (sourceNode && targetNode) {
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const attractiveForce = distance * 0.001;
        const forceX = (dx / distance) * attractiveForce;
        const forceY = (dy / distance) * attractiveForce;
        
        sourceNode.position.x += forceX;
        sourceNode.position.y += forceY;
        targetNode.position.x -= forceX;
        targetNode.position.y -= forceY;
      }
    });
  }
  
  return Array.from(nodeMap.values());
};

export const NetworkGraph = ({ data, onNodeClick }: NetworkGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layout, setLayout] = useState<LayoutType>('force');

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeClick?.(node.id, node.data);
  }, [onNodeClick]);

  const applyLayout = useCallback((layoutType: LayoutType, personNodes: Node[], startupNodes: Node[]) => {
    const allNodes = [...personNodes, ...startupNodes];
    
    switch (layoutType) {
      case 'force':
        // Start with initial positions then apply force layout
        const initialNodes = allNodes.map((node, index) => ({
          ...node,
          position: {
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400
          }
        }));
        
        // Find founder and center them
        const founder = initialNodes.find(node => 
          node.data.isFounder || (typeof node.data.role === 'string' && node.data.role.toLowerCase().includes('founder'))
        );
        if (founder) {
          founder.position = { x: 0, y: 0 };
        }
        
        return applyForceLayout(initialNodes, edges);
        
      case 'hierarchical':
        // Place founder at center, people in inner ring, startups in outer ring
        const founderNode = personNodes.find(node => node.data.isFounder);
        const otherPeople = personNodes.filter(node => !node.data.isFounder);
        
        const hierarchicalNodes = [];
        
        // Founder at center
        if (founderNode) {
          hierarchicalNodes.push({
            ...founderNode,
            position: { x: 0, y: 0 }
          });
        }
        
        // People in inner ring
        otherPeople.forEach((person, index) => {
          const angle = (index * 2 * Math.PI) / otherPeople.length;
          const radius = 250;
          hierarchicalNodes.push({
            ...person,
            position: {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            }
          });
        });
        
        // Startups in outer ring, grouped by domain
        startupNodes.forEach((startup, index) => {
          const angle = (index * 2 * Math.PI) / startupNodes.length;
          const radius = 450;
          hierarchicalNodes.push({
            ...startup,
            position: {
              x: Math.cos(angle) * radius,
              y: Math.sin(angle) * radius
            }
          });
        });
        
        return hierarchicalNodes;
        
      case 'grid':
        // Arrange in a grid pattern
        const cols = Math.ceil(Math.sqrt(allNodes.length));
        return allNodes.map((node, index) => ({
          ...node,
          position: {
            x: (index % cols) * 200 - (cols * 100),
            y: Math.floor(index / cols) * 150 - 150
          }
        }));
        
      case 'circular':
      default:
        // Original circular layout
        return allNodes.map((node, index) => {
          const isFounder = node.data.isFounder;
          const angle = (index * 2 * Math.PI) / allNodes.length;
          const radius = isFounder ? 0 : 300;
          
          return {
            ...node,
            position: {
              x: isFounder ? 0 : Math.cos(angle) * radius,
              y: isFounder ? 0 : Math.sin(angle) * radius
            }
          };
        });
    }
  }, [edges]);

  useEffect(() => {
    if (!data.people.length && !data.startups.length) return;

    // Create person nodes
    const personNodes: Node[] = data.people.map((person) => {
      const isFounder = (typeof person.role === 'string' && person.role.toLowerCase().includes('founder')) || 
                       (typeof person.name === 'string' && (person.name.toLowerCase().includes('ayaan') ||
                        person.name.toLowerCase().includes('rahul')));
      
      return {
        id: person.id,
        type: 'person',
        position: { x: 0, y: 0 }, // Will be set by layout
        data: { 
          ...person,
          isFounder 
        },
        draggable: true,
      };
    });

    // Create startup nodes
    const startupNodes: Node[] = data.startups.map((startup) => ({
      id: startup.id,
      type: 'startup',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: startup,
      draggable: true,
    }));

    // Create edges with improved styling
    const relationshipEdges: Edge[] = data.relationships.map((rel, index) => ({
      id: `edge-${index}`,
      source: rel.personId,
      target: rel.startupId,
      label: rel.role,
      type: 'smoothstep',
      animated: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--network-edge))',
        width: 15,
        height: 15,
      },
      style: {
        stroke: 'hsl(var(--network-edge))',
        strokeWidth: 1.5,
        strokeOpacity: 0.7,
      },
      labelStyle: {
        fill: 'hsl(var(--foreground))',
        fontWeight: 500,
        fontSize: '10px',
      },
      labelBgStyle: {
        fill: 'hsl(var(--background))',
        fillOpacity: 0.9,
        rx: 4,
        ry: 4,
      },
    }));

    // Apply layout and set nodes
    const layoutNodes = applyLayout(layout, personNodes, startupNodes);
    setNodes(layoutNodes);
    setEdges(relationshipEdges);
  }, [data, layout, applyLayout, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-network-background rounded-lg overflow-hidden border border-border shadow-network relative">
      {/* Layout Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant={layout === 'force' ? 'default' : 'outline'}
          onClick={() => setLayout('force')}
          className="bg-card/90 backdrop-blur-sm"
        >
          <Network className="w-3 h-3 mr-1" />
          Force
        </Button>
        <Button
          size="sm"
          variant={layout === 'hierarchical' ? 'default' : 'outline'}
          onClick={() => setLayout('hierarchical')}
          className="bg-card/90 backdrop-blur-sm"
        >
          <Layers className="w-3 h-3 mr-1" />
          Hierarchy
        </Button>
        <Button
          size="sm"
          variant={layout === 'circular' ? 'default' : 'outline'}
          onClick={() => setLayout('circular')}
          className="bg-card/90 backdrop-blur-sm"
        >
          <Circle className="w-3 h-3 mr-1" />
          Circular
        </Button>
        <Button
          size="sm"
          variant={layout === 'grid' ? 'default' : 'outline'}
          onClick={() => setLayout('grid')}
          className="bg-card/90 backdrop-blur-sm"
        >
          <Grid3X3 className="w-3 h-3 mr-1" />
          Grid
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.3,
          minZoom: 0.05,
          maxZoom: 2,
        }}
        minZoom={0.05}
        maxZoom={2}
        className="bg-network-background"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={25} 
          size={1}
          color="hsl(var(--network-edge) / 0.2)"
        />
        <Controls 
          className="bg-card/90 backdrop-blur-sm border border-border shadow-lg"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};