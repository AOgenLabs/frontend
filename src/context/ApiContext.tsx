/* eslint-disable @typescript-eslint/no-explicit-any */
// API Context for managing API state and providing it to components

"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import api, { Automation, Target } from "@/services/api";

interface ApiContextType {
    isConnected: boolean;
    processId: string | null;
    emailBotId: string | null;
    targets: Target[];
    automations: Automation[];
    isLoading: boolean;
    error: string | null;
    connect: (processId: string, emailBotId: string) => Promise<void>;
    disconnect: () => Promise<void>;
    refreshAutomations: () => Promise<void>;
    refreshTargets: () => Promise<void>;
    createAutomation: (
        name: string,
        when: string,
        then: string,
        target: string,
        description?: string
    ) => Promise<void>;
    deleteAutomation: (id: string) => Promise<void>;
    triggerAutomation: (
        id: string,
        action: string,
        data?: string
    ) => Promise<any>;
    sendMessage: (
        target: string,
        action: string,
        data?: string
    ) => Promise<any>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [processId, setProcessId] = useState<string | null>(null);
    const [emailBotId, setEmailBotId] = useState<string | null>(null);
    const [targets, setTargets] = useState<Target[]>([]);
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check connection status on mount
    useEffect(() => {
        checkConnectionStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Check if we're connected to the AO platform
    const checkConnectionStatus = async () => {
        try {
            setIsLoading(true);
            const status = await api.getStatus();
            setIsConnected(status.connected);
            if (status.connected) {
                setProcessId(status.processId || null);
                setEmailBotId(status.emailBotId || null);

                // If connected, fetch targets and automations
                await refreshTargets();
                await refreshAutomations();
            }
        } catch (err) {
            console.error("Failed to check connection status:", err);
            setError("Failed to check connection status");
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Connect to the AO platform
    const connect = async (processId: string, emailBotId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.connect({ processId, emailBotId });

            if (response.success) {
                setIsConnected(true);
                setProcessId(processId);
                setEmailBotId(emailBotId);

                // Fetch targets and automations after connecting
                await refreshTargets();
                await refreshAutomations();
            } else {
                throw new Error(
                    response.error || "Failed to connect to AO platform"
                );
            }
        } catch (err) {
            console.error("Connection error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to connect to AO platform"
            );
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Disconnect from the AO platform
    const disconnect = async () => {
        try {
            setIsLoading(true);
            // Call disconnect API (not implemented in the backend yet)
            // For now, just reset the state
            setIsConnected(false);
            setProcessId(null);
            setEmailBotId(null);
            setTargets([]);
            setAutomations([]);
        } catch (err) {
            console.error("Disconnect error:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to disconnect from AO platform"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh the list of automations
    const refreshAutomations = async () => {
        if (!isConnected) return;

        try {
            setIsLoading(true);
            const data = await api.getAutomations();
            setAutomations(data);
        } catch (err) {
            console.error("Failed to fetch automations:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch automations"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh the list of targets
    const refreshTargets = async () => {
        if (!isConnected) return;

        try {
            setIsLoading(true);
            const data = await api.getTargets();
            setTargets(data);
        } catch (err) {
            console.error("Failed to fetch targets:", err);
            setError(
                err instanceof Error ? err.message : "Failed to fetch targets"
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new automation
    const createAutomation = async (
        name: string,
        when: string,
        then: string,
        target: string,
        description?: string
    ) => {
        if (!isConnected) throw new Error("Not connected to AO platform");

        try {
            setIsLoading(true);
            const response = await api.createAutomation({
                Name: name,
                When: when,
                Then: then,
                Target: target,
                Description: description,
            });

            if (response.success) {
                await refreshAutomations();
            } else {
                throw new Error(
                    response.error || "Failed to create automation"
                );
            }
        } catch (err) {
            console.error("Failed to create automation:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create automation"
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Delete an automation
    const deleteAutomation = async (id: string) => {
        if (!isConnected) throw new Error("Not connected to AO platform");

        try {
            setIsLoading(true);
            await api.deleteAutomation(id);
            await refreshAutomations();
        } catch (err) {
            console.error(`Failed to delete automation ${id}:`, err);
            setError(
                err instanceof Error
                    ? err.message
                    : `Failed to delete automation ${id}`
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger an automation
    const triggerAutomation = async (
        id: string,
        action: string,
        data?: string
    ) => {
        if (!isConnected) throw new Error("Not connected to AO platform");

        try {
            setIsLoading(true);
            const response = await api.triggerAutomation(id, action, data);
            return response;
        } catch (err) {
            console.error(`Failed to trigger automation ${id}:`, err);
            setError(
                err instanceof Error
                    ? err.message
                    : `Failed to trigger automation ${id}`
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Send a message to an AO process
    const sendMessage = async (
        target: string,
        action: string,
        data?: string
    ) => {
        if (!isConnected) throw new Error("Not connected to AO platform");

        try {
            setIsLoading(true);
            const response = await api.sendMessage(target, action, data);
            return response;
        } catch (err) {
            console.error(`Failed to send message to ${target}:`, err);
            setError(
                err instanceof Error
                    ? err.message
                    : `Failed to send message to ${target}`
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        isConnected,
        processId,
        emailBotId,
        targets,
        automations,
        isLoading,
        error,
        connect,
        disconnect,
        refreshAutomations,
        refreshTargets,
        createAutomation,
        deleteAutomation,
        triggerAutomation,
        sendMessage,
    };

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
    const context = useContext(ApiContext);
    if (context === undefined) {
        throw new Error("useApi must be used within an ApiProvider");
    }
    return context;
}
