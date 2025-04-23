export interface DraggableItem {
    id: string;
    type: 'trigger' | 'action' | 'delay';
    label: string;
    color: string;
    icon?: string;
}

export interface NodeData {
    id: string;
    type: string;
    label: string;
    color: string;
}

export interface CanvasNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: NodeData;
}

export interface CanvasEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
} 