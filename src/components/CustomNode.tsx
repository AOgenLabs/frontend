'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { NodeData } from '@/types';

// Custom node component for the canvas
function CustomNode({ data, selected }: NodeProps<NodeData>) {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className={`p-4 rounded-lg shadow-lg ${selected ? 'ring-2 ring-[#cba6f7]' : ''}`}
            style={{
                backgroundColor: `${data.color}20`, // 20% opacity
                borderLeft: `4px solid ${data.color}`,
                minWidth: 150,
            }}
        >
            {/* Input handle - where connections come in */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-[#313244] border-2 border-[#cdd6f4]"
            />

            <div className="font-medium">{data.label}</div>
            <div className="text-xs mt-1 text-[#a6adc8]">{data.type}</div>

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