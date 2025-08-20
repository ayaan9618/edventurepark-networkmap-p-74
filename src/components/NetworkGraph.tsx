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
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PersonNode } from './nodes/PersonNode';
import { StartupNode } from './nodes/StartupNode';
import { NetworkData } from '../types/network';

const nodeTypes = {
  person: PersonNode,
  startup: StartupNode,
};

interface NetworkGraphProps {
  data: NetworkData;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
}

export const NetworkGraph = ({ data, onNodeClick }: NetworkGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeClick?.(node.id, node.data);
  }, [onNodeClick]);

  useEffect(() => {
    if (!data.people.length && !data.startups.length) return;

    // Create nodes
    const personNodes: Node[] = data.people.map((person, index) => {
      const isFounder = person.role?.toLowerCase().includes('founder') || 
                       person.name?.toLowerCase().includes('ayaan');
      
      // Position founder at center, others in circle around
      const angle = (index * 2 * Math.PI) / data.people.length;
      const radius = isFounder ? 0 : 300;
      
      return {
        id: person.id,
        type: 'person',
        position: {
          x: isFounder ? 0 : Math.cos(angle) * radius,
          y: isFounder ? 0 : Math.sin(angle) * radius,
        },
        data: { 
          ...person,
          isFounder 
        },
        draggable: true,
      };
    });

    const startupNodes: Node[] = data.startups.map((startup, index) => {
      // Position startups in outer circle
      const angle = (index * 2 * Math.PI) / data.startups.length;
      const radius = 500;
      
      return {
        id: startup.id,
        type: 'startup',
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        },
        data: startup,
        draggable: true,
      };
    });

    // Create edges from relationships
    const relationshipEdges: Edge[] = data.relationships.map((rel, index) => ({
      id: `edge-${index}`,
      source: rel.personId,
      target: rel.startupId,
      label: rel.role,
      type: 'default',
      style: {
        stroke: 'hsl(var(--network-edge))',
        strokeWidth: 2,
      },
      labelStyle: {
        fill: 'hsl(var(--foreground))',
        fontWeight: 500,
        fontSize: '12px',
      },
      labelBgStyle: {
        fill: 'hsl(var(--background))',
        fillOpacity: 0.8,
      },
    }));

    setNodes([...personNodes, ...startupNodes]);
    setEdges(relationshipEdges);
  }, [data, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-network-background rounded-lg overflow-hidden border border-border shadow-network">
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
          padding: 0.2,
          minZoom: 0.1,
          maxZoom: 2,
        }}
        className="bg-network-background"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="hsl(var(--network-edge) / 0.3)"
        />
        <Controls 
          className="bg-card border border-border shadow-lg"
        />
      </ReactFlow>
    </div>
  );
};