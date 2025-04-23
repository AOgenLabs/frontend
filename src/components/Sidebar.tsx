'use client';

import { DraggableItem } from '@/types';
import DraggableBlock from './DraggableBlock';
import { motion } from 'framer-motion';

interface SidebarProps {
    categories: {
        triggers: DraggableItem[];
        actions: DraggableItem[];
        utilities: DraggableItem[];
    };
}

export default function Sidebar({ categories }: SidebarProps) {
    return (
        <div className="w-[250px] h-full bg-[#181825] border-r border-[#313244] shadow-lg overflow-y-auto">
            <div className="p-5 flex flex-col gap-6 font-sans">

                {/* Triggers Section */}
                <div className="space-y-4">
                    <h3 className="text-[#f5c2e7] text-sm font-medium uppercase tracking-wider">Triggers</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.triggers.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.05 * index }}
                            >
                                <DraggableBlock item={item} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Actions Section */}
                <div className="space-y-4">
                    <h3 className="text-[#94e2d5] text-sm font-medium uppercase tracking-wider">Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.actions.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.05 * index }}
                            >
                                <DraggableBlock item={item} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Utilities Section */}
                <div className="space-y-4">
                    <h3 className="text-[#fab387] text-sm font-medium uppercase tracking-wider">Utilities</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.utilities.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.05 * index }}
                            >
                                <DraggableBlock item={item} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 