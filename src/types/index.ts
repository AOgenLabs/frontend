export interface DraggableItem {
    id: string;
    type: 'trigger' | 'action' | 'delay' | 'condition';
    label: string;
    color: string;
    icon?: string;
}

export interface NodeData {
    id: string;
    type: string;
    label: string;
    color: string;
    config?: {
        chatId?: string;
        message?: string;
        [key: string]: any;
    };
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