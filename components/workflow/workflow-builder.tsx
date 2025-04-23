"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import { useWorkflowStore } from '@/lib/stores/workflow-store';
import { NodeTypesSidebar } from './node-types-sidebar';
import { PropertiesPanel } from './properties-panel';
import { CustomNode } from './nodes/custom-node';
import 'reactflow/dist/style.css';

const nodeTypes = {
  customNode: CustomNode,
};

function WorkflowCanvas() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    addEdge,
    setSelectedNode,
    setSelectedEdge,
  } = useWorkflowStore();
  
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  
  // Handle panel toggling
  useEffect(() => {
    const handleToggleLeftPanel = (e: CustomEvent) => {
      setLeftPanelVisible(e.detail);
    };
    
    const handleToggleRightPanel = (e: CustomEvent) => {
      setRightPanelVisible(e.detail);
    };
    
    document.addEventListener('toggle-left-panel', handleToggleLeftPanel as EventListener);
    document.addEventListener('toggle-right-panel', handleToggleRightPanel as EventListener);
    
    return () => {
      document.removeEventListener('toggle-left-panel', handleToggleLeftPanel as EventListener);
      document.removeEventListener('toggle-right-panel', handleToggleRightPanel as EventListener);
    };
  }, []);
  
  const onConnect = useCallback((params) => {
    addEdge(params);
  }, [addEdge]);
  
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);
  
  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, [setSelectedEdge, setSelectedNode]);
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');
      
      // Check if the dropped element is valid
      if (!nodeType || typeof nodeType !== 'string') {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      // Add the new node
      useWorkflowStore.getState().addNode(nodeType, position);
    },
    [reactFlowInstance]
  );
  
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);
  
  return (
    <div ref={reactFlowWrapper} className="h-full w-full flex">
      {leftPanelVisible && (
        <NodeTypesSidebar />
      )}
      
      <div 
        className="flex-1 h-full" 
        onDrop={onDrop} 
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Control"
          selectionKeyCode="Shift"
        >
          <Controls 
            position="bottom-right"
            className="m-3"
          />
          <MiniMap 
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-card border border-border rounded-md"
            nodeBorderRadius={8}
          />
          <Background 
            color="hsl(var(--muted-foreground))"
            gap={16} 
            size={1}
          />
          <Panel position="top-center" className="p-1 px-2 bg-card rounded-md border border-border text-sm shadow-md">
            Click nodes to connect them. Drag from sidebar to add new nodes.
          </Panel>
        </ReactFlow>
      </div>
      
      {rightPanelVisible && (
        <PropertiesPanel />
      )}
    </div>
  );
}

export function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
}