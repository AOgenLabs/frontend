'use client';

import { useState, useEffect, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { ReactFlowProvider, useReactFlow } from 'reactflow';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import { DraggableItem, CanvasNode, CanvasEdge } from '@/types';
import { motion } from 'framer-motion';
import DraggableBlock from './DraggableBlock';
import TelegramForm from './TelegramForm';

// Define our draggable items categorized by type
const sidebarItems = {
    triggers: [
        { id: 'trigger-webhook', type: 'trigger' as const, label: 'Webhook', color: '#f5c2e7' },
        { id: 'trigger-schedule', type: 'trigger' as const, label: 'Schedule', color: '#f5c2e7' },
        { id: 'trigger-email', type: 'trigger' as const, label: 'Email', color: '#f5c2e7' },
        { id: 'trigger-form', type: 'trigger' as const, label: 'Form', color: '#f5c2e7' },
    ],
    actions: [
        { id: 'action-email', type: 'action' as const, label: 'Send Email', color: '#94e2d5' },
        { id: 'action-database', type: 'action' as const, label: 'Database', color: '#94e2d5' },
        { id: 'action-api', type: 'action' as const, label: 'API Call', color: '#94e2d5' },
        { id: 'action-telegram', type: 'action' as const, label: 'Telegram', color: '#94e2d5' },
    ],
    utilities: [
        { id: 'delay', type: 'delay' as const, label: 'Delay', color: '#fab387' },
        { id: 'condition', type: 'condition' as const, label: 'Condition', color: '#fab387' },
    ]
};

// Flatten the categorized items for drag handling logic
const allItems: DraggableItem[] = [
    ...sidebarItems.triggers,
    ...sidebarItems.actions,
    ...sidebarItems.utilities
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
    const [showTelegramForm, setShowTelegramForm] = useState(false);
    const [telegramNodeData, setTelegramNodeData] = useState<{
        nodeId: string;
        position: { x: number; y: number };
        isEditing?: boolean;
        initialChatId?: string;
        initialMessage?: string;
    } | null>(null);

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

    // Handler for node double-click - used to edit Telegram nodes
    const handleNodeDoubleClick = useCallback((nodeId: string) => {
        const node = nodes.find(n => n.id === nodeId);
        if (node && node.id.includes('action-telegram') && node.data.config) {
            // Open the form for editing
            setTelegramNodeData({
                nodeId: node.id,
                position: node.position,
                isEditing: true,
                initialChatId: node.data.config.chatId,
                initialMessage: node.data.config.message
            });
            setShowTelegramForm(true);
        }
    }, [nodes]);

    // Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const draggedItem = allItems.find(item => item.id === active.id);

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
                x: event.delta.x + 250, // Adding offset from sidebar
                y: event.delta.y + 100, // Some vertical offset
            };

            // Create new node with a unique ID
            const newNodeId = `${active.id}_${Date.now()}`;
            const draggedItem = allItems.find(item => item.id === active.id);

            if (draggedItem) {
                // Special handling for Telegram action
                if (draggedItem.id === 'action-telegram') {
                    setTelegramNodeData({
                        nodeId: newNodeId,
                        position: dropPoint
                    });
                    setShowTelegramForm(true);
                    return;
                }

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

    // Handle Telegram form submission
    const handleTelegramFormSubmit = (chatId: string, message: string) => {
        if (telegramNodeData) {
            const telegramItem = allItems.find(item => item.id === 'action-telegram');
            if (telegramItem) {
                const newNode: CanvasNode = {
                    id: telegramNodeData.nodeId,
                    type: 'flowNode',
                    position: telegramNodeData.position,
                    data: {
                        id: telegramNodeData.nodeId,
                        type: telegramItem.type,
                        label: telegramItem.label,
                        color: telegramItem.color,
                        // Add Telegram specific properties
                        config: {
                            chatId,
                            message
                        }
                    },
                };

                if (telegramNodeData.isEditing) {
                    // Update existing node
                    setNodes(prev => prev.map(node =>
                        node.id === telegramNodeData.nodeId ? newNode : node
                    ));
                } else {
                    // Add new node
                    setNodes(prev => [...prev, newNode]);
                }
            }
        }

        // Close the form and reset form data
        setShowTelegramForm(false);
        setTelegramNodeData(null);
    };

    // Handle form cancel
    const handleTelegramFormCancel = () => {
        setShowTelegramForm(false);
        setTelegramNodeData(null);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden font-sans">
            {/* Telegram Configuration Form Modal */}
            {showTelegramForm && (
                <TelegramForm
                    onSubmit={handleTelegramFormSubmit}
                    onCancel={handleTelegramFormCancel}
                    initialChatId={telegramNodeData?.initialChatId || ''}
                    initialMessage={telegramNodeData?.initialMessage || ''}
                    isEditing={telegramNodeData?.isEditing || false}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center bg-[#181825] p-4 border-b border-[#313244]">
                <h1 className="text-xl font-semibold text-[#cdd6f4] tracking-tight">Flow Builder</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleClearCanvas}
                        className="px-4 py-2 bg-[#f38ba8] bg-opacity-20 text-white font-medium rounded-lg text-sm hover:bg-opacity-30 transition-colors shadow-sm"
                    >
                        Clear Canvas
                    </button>
                    <button
                        className="px-4 py-2 bg-[#cba6f7] bg-opacity-20 text-white font-medium rounded-lg text-sm hover:bg-opacity-30 transition-colors shadow-sm"
                    >
                        Save Flow
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                <ReactFlowProvider>
                    <DndContext
                        sensors={sensors}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <Sidebar categories={sidebarItems} />
                        <Canvas
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={setNodes}
                            onEdgesChange={setEdges}
                            onConnect={handleEdgeAdd}
                            onNodeDoubleClick={handleNodeDoubleClick}
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