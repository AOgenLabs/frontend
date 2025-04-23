'use client';

import { DraggableItem } from '@/types';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

interface DraggableBlockProps {
    item: DraggableItem;
}

export default function DraggableBlock({ item }: DraggableBlockProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: item.id,
    });

    return (
        <motion.div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
                opacity: isDragging ? 0.5 : 1,
            }}
        >
            <div
                className="p-3 rounded-lg shadow-md"
                style={{
                    backgroundColor: `${item.color}20`, // 20% opacity of the color
                    borderLeft: `4px solid ${item.color}`,
                }}
            >
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-[#a6adc8] mt-1">{item.type}</div>
            </div>
        </motion.div>
    );
} 