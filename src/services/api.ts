/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// API service for communicating with the backend
import axios from "axios";

// Base URL for API requests
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Types
export interface Automation {
    id: string;
    name: string;
    description?: string;
    when: string;
    then: string;
    target?: string;
    createdAt: Date;
    updatedAt?: Date;
    status: "active" | "inactive" | "error";
}

export interface AutomationCreateRequest {
    When: string;
    Then: string;
    Target: string;
    Name: string;
    Description?: string;
}

export interface Target {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface ConnectionRequest {
    processId: string;
    emailBotId: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// API functions
export const api = {
    // Health check
    async checkHealth(): Promise<{ status: string; timestamp: string }> {
        try {
            const response = await apiClient.get("/health");
            return response.data;
        } catch (_error) {
            throw new Error("API health check failed");
        }
    },

    // Connect to AO platform
    async connect(
        connectionData: ConnectionRequest
    ): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.post("/connect", connectionData);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return error.response.data;
            }
            throw error;
        }
    },

    // Get connection status
    async getStatus(): Promise<{
        connected: boolean;
        processId?: string;
        emailBotId?: string;
    }> {
        try {
            const response = await apiClient.get("/status");
            return response.data;
        } catch (_error) {
            throw new Error("Failed to get connection status");
        }
    },

    // Get available targets
    async getTargets(): Promise<Target[]> {
        try {
            const response = await apiClient.get("/targets");
            return response.data;
        } catch (_error) {
            throw new Error("Failed to get targets");
        }
    },

    // Create a new automation
    async createAutomation(
        automation: AutomationCreateRequest
    ): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.post("/automations", automation);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return error.response.data;
            }
            throw error;
        }
    },

    // Get all automations
    async getAutomations(): Promise<Automation[]> {
        try {
            const response = await apiClient.get("/automations");
            return response.data;
        } catch (_error) {
            throw new Error("Failed to get automations");
        }
    },

    // Get a specific automation
    async getAutomation(id: string): Promise<Automation> {
        try {
            const response = await apiClient.get(`/automations/${id}`);
            return response.data;
        } catch (_error) {
            throw new Error(`Failed to get automation with ID: ${id}`);
        }
    },

    // Update an automation
    async updateAutomation(
        id: string,
        updates: Partial<AutomationCreateRequest>
    ): Promise<Automation> {
        try {
            const response = await apiClient.put(`/automations/${id}`, updates);
            return response.data;
        } catch (_error) {
            throw new Error(`Failed to update automation with ID: ${id}`);
        }
    },

    // Delete an automation
    async deleteAutomation(id: string): Promise<Automation> {
        try {
            const response = await apiClient.delete(`/automations/${id}`);
            return response.data;
        } catch (_error) {
            throw new Error(`Failed to delete automation with ID: ${id}`);
        }
    },

    // Trigger an automation
    async triggerAutomation(
        id: string,
        action: string,
        data?: string
    ): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.post(
                `/automations/${id}/trigger`,
                { action, data }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return error.response.data;
            }
            throw error;
        }
    },

    // Send a message to an AO process
    async sendMessage(
        target: string,
        action: string,
        data?: string
    ): Promise<ApiResponse<any>> {
        try {
            const response = await apiClient.post("/send", {
                target,
                action,
                data,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return error.response.data;
            }
            throw error;
        }
    },
};

export default api;
