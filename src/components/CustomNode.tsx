'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { motion } from 'framer-motion';
import { NodeData } from '@/types';

// Map of icon emojis for different node types
const typeIcons: Record<string, string> = {
    'trigger': '🔔',
    'action': '⚡',
    'delay': '⏱️',
    'condition': '🔀',
};

// Custom node component for the canvas
function CustomNode({ data, selected }: NodeProps<NodeData>) {
    const icon = typeIcons[data.type] || '📦';
    const { deleteElements } = useReactFlow();

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        deleteElements({ nodes: [{ id: data.id }] });
    };

    // Check if this node has Telegram configuration
    const hasTelegramConfig = data.config && 'chatId' in data.config && 'message' in data.config;
    const isTelegram = data.id.includes('action-telegram');

    // Truncate message for display
    const truncateText = (text: string, maxLength: number) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className={`group w-[130px] h-[130px] rounded-xl shadow-lg flex flex-col justify-center items-center relative ${selected ? 'ring-2 ring-[#cba6f7]' : ''
                } ${isTelegram ? 'cursor-pointer hover:ring-1 hover:ring-[#94e2d5]/50' : ''}`}
            style={{
                backgroundColor: `${data.color}15`, // 15% opacity
                border: `1px solid ${data.color}40`,
            }}
            title={isTelegram ? "Double-click to edit Telegram settings" : ""}
        >
            {/* Delete button - shown on hover or when selected */}
            <button
                className={`absolute -top-2 -right-2 w-6 h-6 bg-[#f38ba8] text-white rounded-full flex items-center justify-center 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hover:bg-[#f38ba8]/80 z-10 ${selected ? 'opacity-100' : ''
                    }`}
                onClick={handleDelete}
                aria-label="Delete node"
            >
                ×
            </button>

            {/* Edit indicator for Telegram nodes */}
            {isTelegram && (
                <div className="absolute -top-1 -left-1 w-5 h-5 bg-[#94e2d5] text-[#181825] rounded-full flex items-center justify-center 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md text-xs font-bold">
                    ✏️
                </div>
            )}

            {/* Input handle - where connections come in */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-[#313244] border-2 border-[#cdd6f4]"
            />

            <div className="text-2xl mb-1" role="img" aria-label={data.type}>
                {isTelegram ? '📱' : icon}
            </div>
            <div className="font-medium text-xs text-center leading-tight px-2">{data.label}</div>

            {/* Display Telegram config summary if available */}
            {hasTelegramConfig && (
                <div className="mt-2 bg-[#181825] rounded-md px-2 py-1 w-[90%] text-center">
                    <div className="text-[9px] text-[#cba6f7] font-medium">
                        Chat: {truncateText((data.config as any).chatId, 12)}
                    </div>
                    <div className="text-[9px] text-[#a6adc8] overflow-hidden text-ellipsis">
                        {truncateText((data.config as any).message, 20)}
                    </div>
                </div>
            )}

            {/* Output handle - where connections go out */}
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-[#313244] border-2 border-[#cdd6f4]"
            />
        </motion.div>
    );
}

export default memo(CustomNode); 