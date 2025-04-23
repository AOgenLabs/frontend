'use client';

import { DraggableItem } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface DraggableBlockProps {
    item: DraggableItem;
}

// Map of icon emojis for different item types
const itemIcons: Record<string, string> = {
    'trigger-webhook': '🔗',
    'trigger-schedule': '⏰',
    'trigger-email': '📧',
    'trigger-form': '📝',
    'action-email': '📤',
    'action-api': '🌐',
    'action-telegram': '📱',
    'delay': '⏱️',
    'condition': '🔀',
};

export default function DraggableBlock({ item }: DraggableBlockProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: item.id,
    });

    const icon = itemIcons[item.id] || '📦';

    return (
        <motion.div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
            style={{
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            <div
                className="w-[100px] h-[100px] rounded-xl shadow-md flex flex-col justify-center items-center"
                style={{
                    backgroundColor: `${item.color}15`, // 15% opacity of the color
                    border: `1px solid ${item.color}40`,
                    transition: 'all 0.2s ease',
                }}
            >
                <div className="text-2xl mb-2" role="img" aria-label={item.label}>{icon}</div>
                <div className="font-medium text-xs text-center leading-tight">{item.label}</div>
            </div>
        </motion.div>
    );
} 