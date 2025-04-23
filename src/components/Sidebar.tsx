'use client';

import { DraggableItem } from '@/types';
import DraggableBlock from './DraggableBlock';
import { motion } from 'framer-motion';

interface SidebarProps {
    items: DraggableItem[];
}

export default function Sidebar({ items }: SidebarProps) {
    return (
        <div className="w-[200px] h-full bg-[#181825] border-r border-[#313244] shadow-lg p-4 flex flex-col">
            <motion.h2
                className="text-lg font-medium mb-6 text-[#cba6f7]"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                Components
            </motion.h2>

            <div className="flex flex-col gap-3">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * items.indexOf(item) }}
                    >
                        <DraggableBlock item={item} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
} 