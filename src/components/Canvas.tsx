'use client';

import { useCallback, useState, useEffect } from 'react';
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
    useReactFlow,
    NodeMouseHandler,
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
    onNodeDoubleClick?: (nodeId: string) => void;
}

export default function Canvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDoubleClick
}: CanvasProps) {
    // Set up droppable area
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });

    // Zoom state
    const [zoom, setZoom] = useState(1);

    // Get ReactFlow instance
    const reactFlowInstance = useReactFlow();

    // Handle node changes (position, etc.)
    const handleNodesChange = useCallback((changes: NodeChange[]) => {
        // Check if there are any node removals
        const nodeRemovals = changes.filter(change => change.type === 'remove');

        // First apply the changes to nodes
        const updatedNodes = applyNodeChanges(changes, nodes) as CanvasNode[];
        onNodesChange(updatedNodes);

        // If nodes were removed, clean up connected edges
        if (nodeRemovals.length > 0) {
            const removedNodeIds = nodeRemovals.map(change => change.id);
            // Filter out edges connected to removed nodes
            const updatedEdges = edges.filter(
                edge => !removedNodeIds.includes(edge.source) && !removedNodeIds.includes(edge.target)
            );

            // Update edges if any were removed
            if (updatedEdges.length !== edges.length) {
                onEdgesChange(updatedEdges);
            }
        }
    }, [nodes, edges, onNodesChange, onEdgesChange]);

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

    // Handle node double click
    const handleNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
        event.preventDefault();
        if (onNodeDoubleClick) {
            onNodeDoubleClick(node.id);
        }
    }, [onNodeDoubleClick]);

    // Handle zoom change
    const handleZoomChange = (e: any) => {
        if (e && typeof e.zoom === 'number') {
            setZoom(e.zoom);
        }
    };

    return (
        <div
            ref={setNodeRef}
            className="flex-1 h-full bg-[#1e1e2e] font-sans"
            data-testid="canvas-droppable"
        >
            <ReactFlow
                nodes={nodes as Node[]}
                edges={edges as Edge[]}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onNodeDoubleClick={handleNodeDoubleClick}
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
                <Panel position="top-right" className="bg-[#181825] p-4 rounded-xl shadow-lg border border-[#313244]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="text-xs text-[#a6adc8] font-medium flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-[#a6e3a1]"></span>
                                Drag items from sidebar • Connect nodes by dragging handles
                            </div>
                            <div className="text-xs flex items-center gap-2">
                                <span className="text-[#89b4fa] font-medium">Zoom:</span>
                                <span className="bg-[#313244] px-2 py-1 rounded-md text-[#cdd6f4]">
                                    {Math.round(zoom * 100)}%
                                </span>
                            </div>
                            <div className="text-xs text-[#a6adc8] mt-1">
                                <span className="text-[#f38ba8]">Tip:</span> Hover over a node to see the delete option
                            </div>
                            <div className="text-xs text-[#a6adc8]">
                                <span className="text-[#94e2d5]">Pro tip:</span> Double-click Telegram nodes to edit settings
                            </div>
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