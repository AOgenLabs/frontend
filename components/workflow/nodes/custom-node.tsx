"use client";

import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { NodeData } from '@/lib/stores/workflow-store';
import { getIconByName } from '@/lib/utils/icons';

export function CustomNode({ data, id, selected }: NodeProps<NodeData>) {
  const Icon = getIconByName(data.icon);
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`w-56 rounded-lg border shadow-sm bg-card overflow-hidden ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div 
        className={`p-3 font-medium border-b flex items-center gap-2 ${
          data.type.includes('trigger') ? 'bg-mauve/20' :
          data.type.includes('action') ? 'bg-sapphire/20' :
          'bg-peach/20'
        }`}
      >
        <div className="text-primary">{Icon}</div>
        <div className="truncate">{data.label}</div>
      </div>
      
      <div className="p-3 text-xs text-muted-foreground">
        {data.description}
      </div>
      
      {/* Input handle on the left */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
      />
      
      {/* Output handle on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
      />
    </motion.div>
  );
}