'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { ReactFlowProvider } from 'reactflow';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import { DraggableItem, CanvasNode, CanvasEdge } from '@/types';
import { motion } from 'framer-motion';
import DraggableBlock from './DraggableBlock';

// Define our initial draggable items
const initialItems: DraggableItem[] = [
    { id: 'trigger', type: 'trigger', label: 'Trigger', color: '#f5c2e7' }, // Pink
    { id: 'action', type: 'action', label: 'Action', color: '#94e2d5' },    // Teal
    { id: 'delay', type: 'delay', label: 'Delay', color: '#fab387' },       // Peach
];

// Local storage keys
const STORAGE_KEYS = {
    NODES: 'zapier-canvas-nodes',
    EDGES: 'zapier-canvas-edges',
};

export default function Builder() {
    const [nodes, setNodes] = useState<CanvasNode[]>([]);
    const [edges, setEdges] = useState<CanvasEdge[]>([]);
    const [activeItem, setActiveItem] = useState<DraggableItem | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Configure sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // Load saved layout from localStorage
    useEffect(() => {
        // Only run in the browser
        if (typeof window !== 'undefined') {
            try {
                const savedNodes = localStorage.getItem(STORAGE_KEYS.NODES);
                const savedEdges = localStorage.getItem(STORAGE_KEYS.EDGES);

                if (savedNodes) {
                    setNodes(JSON.parse(savedNodes));
                }

                if (savedEdges) {
                    setEdges(JSON.parse(savedEdges));
                }
            } catch (error) {
                console.error('Error loading layout from localStorage:', error);
            }

            setIsLoaded(true);
        }
    }, []);

    // Save layout to localStorage whenever it changes
    useEffect(() => {
        // Only save after initial load to prevent overwriting with empty state
        if (isLoaded && typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.NODES, JSON.stringify(nodes));
            localStorage.setItem(STORAGE_KEYS.EDGES, JSON.stringify(edges));
        }
    }, [nodes, edges, isLoaded]);

    // Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const draggedItem = initialItems.find(item => item.id === active.id);

        if (draggedItem) {
            setActiveItem(draggedItem);
        }
    };

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        // If dropped over the canvas
        if (over && over.id === 'canvas') {
            // Get drop coordinates
            const dropPoint = {
                x: event.delta.x + 200, // Adding offset from sidebar
                y: event.delta.y + 100, // Some vertical offset
            };

            // Create new node with a unique ID
            const newNodeId = `${active.id}_${Date.now()}`;
            const draggedItem = initialItems.find(item => item.id === active.id);

            if (draggedItem) {
                const newNode: CanvasNode = {
                    id: newNodeId,
                    type: 'flowNode',
                    position: dropPoint,
                    data: {
                        id: newNodeId,
                        type: draggedItem.type,
                        label: draggedItem.label,
                        color: draggedItem.color,
                    },
                };

                setNodes(prev => [...prev, newNode]);
            }
        }
    };

    // Handle edge add
    const handleEdgeAdd = (edge: CanvasEdge) => {
        setEdges(prev => [...prev, edge]);
    };

    // Clear the canvas
    const handleClearCanvas = () => {
        setNodes([]);
        setEdges([]);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#181825] p-4 border-b border-[#313244]">
                <h1 className="text-xl font-semibold text-[#cdd6f4]">Flow Builder</h1>
                <button
                    onClick={handleClearCanvas}
                    className="px-3 py-1 bg-[#f38ba8] bg-opacity-20 text-[#f38ba8] rounded-md text-sm hover:bg-opacity-30 transition-colors"
                >
                    Clear Canvas
                </button>
            </div>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                <ReactFlowProvider>
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <Sidebar items={initialItems} />
                        <Canvas
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={setNodes}
                            onEdgesChange={setEdges}
                            onConnect={handleEdgeAdd}
                        />

                        {/* Drag overlay - shows what's being dragged */}
                        <DragOverlay>
                            {activeItem && (
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <DraggableBlock item={activeItem} />
                                </motion.div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </ReactFlowProvider>
            </div>
        </div>
    );
} 