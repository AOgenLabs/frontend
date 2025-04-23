import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Edge, Node, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges, XYPosition } from 'reactflow';

export type NodeData = {
  label: string;
  type: string;
  icon: string;
  description: string;
  config: Record<string, any>;
};

type WorkflowState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNode: Node<NodeData> | null;
  selectedEdge: Edge | null;
  
  // Node actions
  setNodes: (nodes: Node<NodeData>[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  addNode: (nodeType: string, position: XYPosition) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  
  // Edge actions
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addEdge: (params: { source: string; sourceHandle: string | null; target: string; targetHandle: string | null }) => void;
  deleteEdge: (edgeId: string) => void;
  
  // Selection actions
  setSelectedNode: (node: Node<NodeData> | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  
  // Save/Load
  saveWorkflow: () => void;
  loadWorkflow: () => void;
};

// Node type definitions for the sidebar
export const NODE_TYPES = {
  trigger: {
    category: 'Triggers',
    items: [
      {
        type: 'webhook',
        label: 'Webhook',
        icon: 'webhook',
        description: 'Trigger when a webhook is received',
        config: { endpoint: '' }
      },
      {
        type: 'schedule',
        label: 'Schedule',
        icon: 'clock',
        description: 'Trigger on a schedule',
        config: { schedule: '0 0 * * *' }
      },
      {
        type: 'form',
        label: 'Form Submission',
        icon: 'formInput',
        description: 'Trigger when a form is submitted',
        config: { formId: '' }
      }
    ]
  },
  action: {
    category: 'Actions',
    items: [
      {
        type: 'email',
        label: 'Send Email',
        icon: 'mail',
        description: 'Send an email',
        config: { to: '', subject: '', body: '' }
      },
      {
        type: 'telegram',
        label: 'Send Telegram',
        icon: 'messageCircle',
        description: 'Send a Telegram message',
        config: { chatId: '', message: '' }
      },
      {
        type: 'http',
        label: 'HTTP Request',
        icon: 'globe',
        description: 'Make an HTTP request',
        config: { url: '', method: 'GET', headers: {}, body: '' }
      },
      {
        type: 'database',
        label: 'Database',
        icon: 'database',
        description: 'Interact with a database',
        config: { query: '' }
      }
    ]
  },
  logic: {
    category: 'Logic',
    items: [
      {
        type: 'filter',
        label: 'Filter',
        icon: 'filter',
        description: 'Filter data based on conditions',
        config: { condition: '' }
      },
      {
        type: 'transform',
        label: 'Transform',
        icon: 'repeat',
        description: 'Transform data',
        config: { transformation: '' }
      },
      {
        type: 'delay',
        label: 'Delay',
        icon: 'clock',
        description: 'Add a delay',
        config: { delay: 5 }
      }
    ]
  }
};

// Helper to get node data from type
export const getNodeDataFromType = (nodeType: string): NodeData | null => {
  for (const category of Object.values(NODE_TYPES)) {
    const item = category.items.find((item) => item.type === nodeType);
    if (item) {
      return { ...item };
    }
  }
  return null;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  
  setNodes: (nodes) => set({ nodes }),
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  addNode: (nodeType, position) => {
    const nodeData = getNodeDataFromType(nodeType);
    if (!nodeData) return;
    
    const newNode: Node<NodeData> = {
      id: nanoid(),
      type: 'customNode',
      position,
      data: nodeData,
    };
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNode: newNode,
    }));
  },
  
  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      }),
    }));
  },
  
  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;
    
    const newNode: Node<NodeData> = {
      ...node,
      id: nanoid(),
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNode: newNode,
    }));
  },
  
  deleteNode: (nodeId) => {
    set((state) => {
      // Remove associated edges
      const newEdges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );
      
      return {
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: newEdges,
        selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
      };
    });
  },
  
  setEdges: (edges) => set({ edges }),
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  addEdge: (params) => {
    // Check if connection already exists to prevent duplicates
    const exists = get().edges.some(
      (edge) =>
        edge.source === params.source &&
        edge.target === params.target &&
        edge.sourceHandle === params.sourceHandle &&
        edge.targetHandle === params.targetHandle
    );
    
    if (exists) return;
    
    const newEdge: Edge = {
      id: nanoid(),
      ...params,
      type: 'smoothstep',
      animated: true,
    };
    
    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
  },
  
  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdge: state.selectedEdge?.id === edgeId ? null : state.selectedEdge,
    }));
  },
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedEdge: (edge) => set({ selectedEdge: edge }),
  
  saveWorkflow: () => {
    try {
      const { nodes, edges } = get();
      const workflow = { nodes, edges };
      localStorage.setItem('workflow', JSON.stringify(workflow));
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  },
  
  loadWorkflow: () => {
    try {
      const saved = localStorage.getItem('workflow');
      if (saved) {
        const { nodes, edges } = JSON.parse(saved);
        set({ nodes, edges });
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  },
}));