import { create } from "zustand";
import { nanoid } from "nanoid";
// Use ReactFlow's utility functions for applying changes
import {
  applyNodeChanges,
  applyEdgeChanges,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  NodeChange as ReactFlowNodeChange,
  EdgeChange as ReactFlowEdgeChange,
  XYPosition,
  CoordinateExtent,
  Position,
} from "@reactflow/core";
import "@reactflow/core/dist/style.css";

// Define the type interfaces we need
export type Node<T = any> = any;

export type Edge<T = any> = any;

export type NodeChange = any;
export type EdgeChange = any;

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
  isWorkflowRunning: boolean;
  nodeExecutionState: Record<
    string,
    "pending" | "running" | "success" | "error"
  >;
  nodeResults: Record<string, any>;

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
  addEdge: (params: {
    source: string;
    sourceHandle: string | null;
    target: string;
    targetHandle: string | null;
  }) => void;
  deleteEdge: (edgeId: string) => void;

  // Selection actions
  setSelectedNode: (node: Node<NodeData> | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;

  // Workflow execution
  startWorkflow: () => Promise<void>;
  stopWorkflow: () => Promise<void>;
  executeNode: (nodeId: string, inputData?: any) => Promise<any>;

  // Save/Load
  saveWorkflow: () => void;
  loadWorkflow: () => void;
};

// Node type definitions for the sidebar
export const NODE_TYPES = {
  trigger: {
    category: "Triggers",
    items: [
      {
        type: "telegram-receive",
        label: "Receive Telegram",
        icon: "messageCircle",
        description: "Receive messages and files from Telegram bot",
        config: {
          checkInterval: "10", // seconds
          messageTypes: "all", // all, photo, document, etc.
          maxFileSizeInMB: "50",
        },
      },
    ],
  },
  action: {
    category: "Actions",
    items: [
      {
        type: "telegram",
        label: "Send Telegram",
        icon: "messageCircle",
        description: "Send a Telegram message",
        config: { chatId: "", message: "" },
      },
      {
        type: "arweave-upload",
        label: "Upload to Arweave",
        icon: "upload",
        description: "Upload files to Arweave permanent storage",
        config: {
          tags: "", // comma-separated list of tags for the file
          permanent: "true", // Store permanently
        },
      },
    ],
  },
  logic: {
    category: "Logic",
    items: [
      {
        type: "delay",
        label: "Delay",
        icon: "clock",
        description: "Add a delay",
        config: { delay: 5 },
      },
    ],
  },
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
  isWorkflowRunning: false,
  nodeExecutionState: {},
  nodeResults: {},

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
      type: "customNode",
      position,
      data: nodeData,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNode: newNode,
    }));
  },

  updateNodeData: (nodeId, data) => {
    try {
      console.log(`Updating node ${nodeId} with data:`, data);

      set((state) => {
        // Find the node first to make sure it exists
        const node = state.nodes.find((n) => n.id === nodeId);
        if (!node) {
          console.error(`Node with ID ${nodeId} not found.`);
          return state; // Return unchanged state
        }

        // If config is being updated, make sure we merge properly
        let updatedData = { ...data };
        if (data.config) {
          updatedData.config = {
            ...node.data.config,
            ...data.config,
          };
          console.log("Updated config:", updatedData.config);
        }

        // Create new nodes array with updated node
        const updatedNodes = state.nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updatedData,
              },
            };
          }
          return node;
        });

        // Log the update so we can see it in the console
        const updatedNode = updatedNodes.find((n) => n.id === nodeId);
        console.log(
          `Node ${nodeId} updated successfully:`,
          updatedNode?.data
        );

        return {
          nodes: updatedNodes,
          // Also update selectedNode if it matches the updated node
          selectedNode:
            state.selectedNode?.id === nodeId
              ? updatedNodes.find((n) => n.id === nodeId) ||
              state.selectedNode
              : state.selectedNode,
        };
      });
    } catch (error) {
      console.error("Error updating node data:", error);
    }
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
        selectedNode:
          state.selectedNode?.id === nodeId
            ? null
            : state.selectedNode,
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
      type: "smoothstep",
      animated: true,
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdge:
        state.selectedEdge?.id === edgeId ? null : state.selectedEdge,
    }));
  },

  setSelectedNode: (node) => set({ selectedNode: node }),
  setSelectedEdge: (edge) => set({ selectedEdge: edge }),

  // Workflow execution
  startWorkflow: async () => {
    try {
      set({
        isWorkflowRunning: true,
        nodeExecutionState: {},
        nodeResults: {},
      });

      // Find trigger nodes (nodes without incoming edges)
      const { nodes, edges } = get();
      const triggerNodes = nodes.filter(
        (node) => !edges.some((edge) => edge.target === node.id)
      );

      // Start execution from the trigger nodes
      for (const triggerNode of triggerNodes) {
        get().executeNode(triggerNode.id);
      }
    } catch (error) {
      console.error("Error starting workflow:", error);
      set({ isWorkflowRunning: false });
    }
  },

  stopWorkflow: async () => {
    try {
      console.log("Stopping workflow...");

      // Handle clean-up for each node
      const { nodes, nodeResults } = get();

      // Stop any running trigger nodes (especially important for telegram-receive)
      const telegramNodes = nodes.filter(
        (node) => node.data.type === "telegram-receive"
      );

      if (telegramNodes.length > 0) {
        console.log(
          `Stopping ${telegramNodes.length} Telegram nodes...`
        );

        for (const node of telegramNodes) {
          console.log(
            `Stopping Telegram node: ${node.data.label} (${node.id})`
          );

          if (nodeResults[node.id]?.stop) {
            try {
              await nodeResults[node.id].stop();
              console.log(
                `Successfully stopped Telegram node: ${node.id}`
              );
            } catch (error) {
              console.error(
                `Error stopping Telegram node ${node.id}:`,
                error
              );
            }
          } else {
            console.warn(
              `No stop method found for Telegram node: ${node.id}`
            );
          }
        }
      }

      // Clear all execution states and results
      console.log("Clearing workflow execution state...");
      set({
        isWorkflowRunning: false,
        nodeExecutionState: {},
        nodeResults: {},
      });

      console.log("Workflow stopped successfully");
    } catch (error) {
      console.error("Error stopping workflow:", error);
      set({ isWorkflowRunning: false });
    }
  },

  executeNode: async (nodeId, inputData) => {
    try {
      const { nodes, edges, nodeResults } = get();
      const node = nodes.find((n) => n.id === nodeId);

      if (!node) {
        throw new Error(`Node with id ${nodeId} not found`);
      }

      console.log(
        `Executing node '${node.data.label}' (${node.data.type}) with ID ${nodeId}`
      );

      // Update node state to running
      set((state) => ({
        nodeExecutionState: {
          ...state.nodeExecutionState,
          [nodeId]: "running",
        },
      }));

      // Execute the node based on its type
      let result;

      switch (node.data.type) {
        case "telegram-receive": {
          try {
            // Import dynamically to avoid circular dependencies
            const { nodeExecutors } = await import(
              "@/lib/utils/api-service"
            );

            // Start the Telegram receive process
            console.log("Starting Telegram receive process...");
            const telegramHandler =
              await nodeExecutors.executeTelegramReceive(
                node.data.config
              );

            // Store the handler in nodeResults (mainly for the stop method)
            set((state) => ({
              nodeResults: {
                ...state.nodeResults,
                [nodeId]: telegramHandler,
              },
            }));

            // Keep node in running state while the bot is active
            set((state) => ({
              nodeExecutionState: {
                ...state.nodeExecutionState,
                [nodeId]: "running",
              },
            }));

            console.log(
              "Telegram node is now waiting for changes in recent files..."
            );

            // Also add a method to manually check for recent files
            const checkRecentFiles = async () => {
              console.log(
                "Manually checking for recent files..."
              );
              if (get().isWorkflowRunning) {
                const recentFiles =
                  await telegramHandler.processRecentFiles();
                if (recentFiles.length > 0) {
                  console.log(
                    `Found new file, passing to connected nodes...`
                  );
                  // Show success state temporarily
                  set((state) => ({
                    nodeExecutionState: {
                      ...state.nodeExecutionState,
                      [nodeId]: "success",
                    },
                  }));

                  // Get outgoing edges from this node
                  const outgoingEdges = edges.filter(
                    (edge) => edge.source === nodeId
                  );
                  console.log(
                    `Found ${outgoingEdges.length} outgoing edges from Telegram node`
                  );

                  const latestFile = recentFiles[0]; // There will only be one file in the array if there's a change
                  console.log(`Processing latest file: ${latestFile.fileName || latestFile.id}`);

                  // Determine node types to pass different context to each node
                  const arweaveNodes = [];
                  const telegramNodes = [];

                  outgoingEdges.forEach(edge => {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (targetNode) {
                      if (targetNode.data.type === 'arweave-upload') {
                        arweaveNodes.push(edge);
                      } else if (targetNode.data.type === 'telegram') {
                        telegramNodes.push(edge);
                      }
                    }
                  });

                  // Execute telegram nodes first with "parallel before" context
                  const telegramPromises = telegramNodes.map(edge => {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    console.log(`Sending "parallel before" message to Telegram node: ${targetNode?.data.label || edge.target}`);
                    return get().executeNode(edge.target, {
                      ...latestFile,
                      messageContext: 'before',
                      originalMessage: node.data.config.message || 'parallel before'
                    });
                  });

                  // Execute all Telegram nodes and wait for completion
                  if (telegramPromises.length > 0) {
                    console.log('Sending all Telegram messages first...');
                    await Promise.all(telegramPromises);
                    console.log('All Telegram messages sent successfully');
                  }

                  // Execute arweave nodes without waiting for them to complete
                  arweaveNodes.forEach(edge => {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    console.log(`Starting file upload to Arweave node (background): ${targetNode?.data.label || edge.target}`);
                    // Don't await here - let it run in the background
                    get().executeNode(edge.target, latestFile)
                      .then(() => console.log(`Arweave upload completed for node: ${targetNode?.data.label || edge.target}`))
                      .catch(err => console.error(`Error in background Arweave upload: ${err.message}`));
                  });

                  // After 2 seconds, go back to running state
                  setTimeout(() => {
                    if (get().isWorkflowRunning) {
                      set(state => ({
                        nodeExecutionState: {
                          ...state.nodeExecutionState,
                          [nodeId]: 'running'
                        }
                      }));
                    }
                  }, 2000);
                } else {
                  console.log('No new files found');
                }
              }
            };

            // Add the check method to the node result
            set((state) => ({
              nodeResults: {
                ...state.nodeResults,
                [nodeId]: {
                  ...state.nodeResults[nodeId],
                  checkRecentFiles
                }
              }
            }));

            // Start polling for new files and set up the callback
            console.log('Starting to poll for new files...');
            telegramHandler.startPolling(async (fileData: any) => {
              console.log('New file detected from Telegram:', fileData);

              // When a new file is detected, temporarily show success state
              set(state => ({
                nodeExecutionState: {
                  ...state.nodeExecutionState,
                  [nodeId]: 'success'
                }
              }));

              // Get outgoing edges and forward the latest file
              const outgoingEdges = get().edges.filter(edge => edge.source === nodeId);

              // Determine node types to pass different context to each node
              const arweaveNodes = [];
              const telegramNodes = [];

              outgoingEdges.forEach(edge => {
                const targetNode = get().nodes.find(n => n.id === edge.target);
                if (targetNode) {
                  if (targetNode.data.type === 'arweave-upload') {
                    arweaveNodes.push(edge);
                  } else if (targetNode.data.type === 'telegram') {
                    telegramNodes.push(edge);
                  }
                }
              });

              // Execute telegram nodes first with "parallel before" context
              const telegramPromises = telegramNodes.map(edge => {
                const targetNode = get().nodes.find(n => n.id === edge.target);
                console.log(`Sending "parallel before" message to Telegram node: ${targetNode?.data.label || edge.target}`);
                return get().executeNode(edge.target, {
                  ...fileData,
                  messageContext: 'before',
                  originalMessage: node.data.config.message || 'parallel before'
                });
              });

              // Execute all Telegram nodes and wait for completion
              if (telegramPromises.length > 0) {
                console.log('Sending all Telegram messages first...');
                await Promise.all(telegramPromises);
                console.log('All Telegram messages sent successfully');
              }

              // Execute arweave nodes without waiting for them to complete
              arweaveNodes.forEach(edge => {
                const targetNode = get().nodes.find(n => n.id === edge.target);
                console.log(`Starting file upload to Arweave node (background): ${targetNode?.data.label || edge.target}`);
                // Don't await here - let it run in the background
                get().executeNode(edge.target, fileData)
                  .then(() => console.log(`Arweave upload completed for node: ${targetNode?.data.label || edge.target}`))
                  .catch(err => console.error(`Error in background Arweave upload: ${err.message}`));
              });

              // After 2 seconds, go back to running state
              setTimeout(() => {
                if (get().isWorkflowRunning) {
                  set(state => ({
                    nodeExecutionState: {
                      ...state.nodeExecutionState,
                      [nodeId]: 'running'
                    }
                  }));
                }
              }, 2000);
            });

            result = []; // No immediate results, the node will keep polling
          } catch (error) {
            console.error(`Error initializing Telegram node ${nodeId}:`, error);

            // Update node state to error
            set((state) => ({
              nodeExecutionState: {
                ...state.nodeExecutionState,
                [nodeId]: "error",
              },
            }));

            throw error;
          }
          break;
        }

        case "telegram": {
          try {
            console.log(`Executing Telegram send node (${nodeId})`);

            // Import dynamically to avoid circular dependencies
            const { nodeExecutors } = await import(
              "@/lib/utils/api-service"
            );

            // Execute the Telegram send operation
            console.log(
              `Sending Telegram message with config:`,
              node.data.config
            );
            const sendResult =
              await nodeExecutors.executeTelegramSend(
                node.data.config,
                inputData
              );
            console.log(`Message sent successfully:`, sendResult);

            // Store the result
            set((state) => ({
              nodeResults: {
                ...state.nodeResults,
                [nodeId]: sendResult,
              },
              nodeExecutionState: {
                ...state.nodeExecutionState,
                [nodeId]: "success",
              },
            }));

            // Get outgoing edges from this node
            const outgoingEdges = edges.filter(
              (edge) => edge.source === nodeId
            );

            // Execute the next nodes with the send result as input
            for (const edge of outgoingEdges) {
              const targetNode = nodes.find(
                (n) => n.id === edge.target
              );
              console.log(
                `Passing Telegram send result to node: ${targetNode?.data.label || edge.target
                }`
              );
              await get().executeNode(edge.target, sendResult);
            }

            result = sendResult;
          } catch (error) {
            console.error(`Error in Telegram send node:`, error);

            // Update node state to error
            set((state) => ({
              nodeExecutionState: {
                ...state.nodeExecutionState,
                [nodeId]: "error",
              },
            }));

            throw error;
          }
          break;
        }

        case "arweave-upload": {
          try {
            if (!inputData) {
              console.error(
                "No file data provided to Arweave upload node"
              );
              throw new Error("No file data provided to upload");
            }

            console.log(
              `Arweave upload node received input:`,
              inputData
            );

            // Import dynamically to avoid circular dependencies
            const { nodeExecutors } = await import(
              "@/lib/utils/api-service"
            );

            // Upload the file to Arweave
            console.log(`Uploading file to Arweave...`);
            const uploadResult =
              await nodeExecutors.executeArweaveUpload(
                node.data.config,
                inputData
              );
            console.log(`Upload successful:`, uploadResult);

            // Store the result
            set((state) => ({
              nodeResults: {
                ...state.nodeResults,
                [nodeId]: uploadResult,
              },
              nodeExecutionState: {
                ...state.nodeExecutionState,
                [nodeId]: "success",
              },
            }));

            // Get outgoing edges from this node
            const outgoingEdges = edges.filter(
              (edge) => edge.source === nodeId
            );

            // Execute the next nodes with the upload result as input
            for (const edge of outgoingEdges) {
              const targetNode = nodes.find(
                (n) => n.id === edge.target
              );
              console.log(
                `Passing Arweave result to node: ${targetNode?.data.label || edge.target
                }`
              );
              await get().executeNode(edge.target, uploadResult);
            }

            result = uploadResult;
          } catch (error) {
            console.error(`Error in Arweave upload node:`, error);

            // Update node state to error
            set((state) => ({
              nodeExecutionState: {
                ...state.nodeExecutionState,
                [nodeId]: "error",
              },
            }));

            throw error;
          }
          break;
        }

        // Handle other node types here
        default:
          console.warn(
            `No executor implemented for node type: ${node.data.type}`
          );

          // For now, just pass through the input data
          result = inputData;

          // Get outgoing edges from this node
          const outgoingEdges = edges.filter(
            (edge) => edge.source === nodeId
          );

          // Execute the next nodes with the input data
          for (const edge of outgoingEdges) {
            get().executeNode(edge.target, inputData);
          }

          // Update node state to success
          set((state) => ({
            nodeExecutionState: {
              ...state.nodeExecutionState,
              [nodeId]: "success",
            },
          }));
      }

      return result;
    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error);

      // Update node state to error
      set((state) => ({
        nodeExecutionState: {
          ...state.nodeExecutionState,
          [nodeId]: "error",
        },
      }));

      throw error;
    }
  },

  saveWorkflow: () => {
    try {
      const { nodes, edges } = get();
      const workflow = { nodes, edges };
      localStorage.setItem("workflow", JSON.stringify(workflow));
    } catch (error) {
      console.error("Failed to save workflow:", error);
    }
  },

  loadWorkflow: () => {
    try {
      const saved = localStorage.getItem("workflow");
      if (saved) {
        const { nodes, edges } = JSON.parse(saved);
        set({ nodes, edges });
      }
    } catch (error) {
      console.error("Failed to load workflow:", error);
    }
  },
}));
