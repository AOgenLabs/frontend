'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Node,
    OnConnect,
    NodeChange,
    EdgeChange,
    applyNodeChanges,
    applyEdgeChanges,
    Panel,
    MiniMap,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDroppable } from '@dnd-kit/core';
import CustomNode from './CustomNode';
import { CanvasNode, CanvasEdge } from '@/types';
import { motion } from 'framer-motion';

// Register custom node types
const nodeTypes = {
    flowNode: CustomNode,
};

interface CanvasProps {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
    onNodesChange: (nodes: CanvasNode[]) => void;
    onEdgesChange: (edges: CanvasEdge[]) => void;
    onConnect: (edge: CanvasEdge) => void;
}

export default function Canvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect
}: CanvasProps) {
    // Set up droppable area
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });

    // Zoom state
    const [zoom, setZoom] = useState(1);

    // Handle node changes (position, etc.)
    const handleNodesChange = useCallback((changes: NodeChange[]) => {
        onNodesChange(applyNodeChanges(changes, nodes) as CanvasNode[]);
    }, [nodes, onNodesChange]);

    // Handle edge changes
    const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
        onEdgesChange(applyEdgeChanges(changes, edges) as CanvasEdge[]);
    }, [edges, onEdgesChange]);

    // Handle new connections
    const handleConnect: OnConnect = useCallback((params) => {
        // Make sure source and target are not null and create a unique edge ID with timestamp
        if (params.source && params.target) {
            const newEdge: CanvasEdge = {
                id: `e${params.source}-${params.target}-${Date.now()}`,
                source: params.source,
                target: params.target,
                type: 'smoothstep',
            };
            onConnect(newEdge);
        }
    }, [onConnect]);

    // Handle zoom change
    const handleZoomChange = (e: any) => {
        if (e && typeof e.zoom === 'number') {
            setZoom(e.zoom);
        }
    };

    return (
        <div
            ref={setNodeRef}
            className="flex-1 h-full bg-[#1e1e2e]"
            data-testid="canvas-droppable"
        >
            <ReactFlow
                nodes={nodes as Node[]}
                edges={edges as Edge[]}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onMove={handleZoomChange}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[20, 20]}
                minZoom={0.2}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    style: {
                        stroke: '#6c7086',
                        strokeWidth: 2
                    },
                    animated: true,
                }}
            >
                <Background
                    color="#313244"
                    gap={20}
                    size={1}
                    variant={BackgroundVariant.Dots}
                />
                <Controls
                    position="bottom-right"
                    style={{
                        backgroundColor: '#181825',
                        borderColor: '#313244',
                        borderRadius: '8px',
                    }}
                />
                <MiniMap
                    position="bottom-left"
                    nodeColor={(node) => {
                        const nodeData = node.data as NodeData;
                        return nodeData?.color || '#cdd6f4';
                    }}
                    maskColor="rgba(24, 24, 37, 0.5)"
                    style={{
                        backgroundColor: '#181825',
                        borderColor: '#313244',
                    }}
                />
                <Panel position="top-right" className="bg-[#181825] p-3 rounded-lg shadow-md border border-[#313244]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-xs text-[#a6adc8]"
                    >
                        <div className="flex flex-col gap-1">
                            <div>Drag items from sidebar • Connect nodes by dragging handles</div>
                            <div>Zoom: {Math.round(zoom * 100)}%</div>
                        </div>
                    </motion.div>
                </Panel>
            </ReactFlow>
        </div>
    );
}

// Define missing interface
interface NodeData {
    id: string;
    type: string;
    label: string;
    color: string;
} 