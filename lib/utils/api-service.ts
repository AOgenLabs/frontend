// API service for interacting with the backend services

const API_BASE_URL = "http://18.206.120.157/api";

// Track if the bot is active across the application
let isBotActive = false;

// Store callback for file processing
let onNewFileProcessed: ((fileData: any) => void) | null = null;

// Track the last processed file ID to detect changes
let lastProcessedFileId: string | null = null;

// Telegram Bot API
export const telegramApi = {
    // Initialize the Telegram bot
    initialize: async () => {
        console.log("Initializing Telegram bot...");
        const response = await fetch(`${API_BASE_URL}/telegram/initialize`, {
            method: "POST",
        });
        return response.json();
    },

    // Start the Telegram bot
    start: async () => {
        console.log("Starting Telegram bot...");
        const response = await fetch(`${API_BASE_URL}/telegram/start`, {
            method: "POST",
        });
        if (response.ok) {
            isBotActive = true;
        }
        return response.json();
    },

    // Stop the Telegram bot
    stop: async () => {
        console.log("Stopping Telegram bot...");
        isBotActive = false;
        onNewFileProcessed = null; // Clear callback
        const response = await fetch(`${API_BASE_URL}/telegram/stop`, {
            method: "POST",
        });
        return response.json();
    },

    // Register a callback for new file processing
    registerFileProcessedCallback: (callback: (fileData: any) => void) => {
        onNewFileProcessed = callback;
    },

    // Get bot status
    getStatus: async () => {
        const response = await fetch(`${API_BASE_URL}/telegram/status`);
        const data = await response.json();
        if (data.success) {
            isBotActive = data.status.active;
        }
        return data;
    },

    // Get pending messages
    getPendingMessages: async () => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/messages/pending`
        );
        return response.json();
    },

    // Get recent files
    getRecentFiles: async () => {
        console.log("Fetching recent files from Telegram...");
        const response = await fetch(`${API_BASE_URL}/telegram/files/recent`);
        const data = await response.json();

        let hasNewFiles = false;
        let latestFileId = null;

        if (data.success && data.files && data.files.length > 0) {
            // Sort files by ID or timestamp to ensure newest is first
            const sortedFiles = [...data.files].sort(
                (a, b) => parseInt(b.id) - parseInt(a.id)
            );

            latestFileId = sortedFiles[0].id;

            // Check if we have a new file (different from the last processed)
            if (latestFileId !== lastProcessedFileId) {
                hasNewFiles = true;
                lastProcessedFileId = latestFileId;
            }
        }

        return {
            ...data,
            hasNewFiles,
            latestFileId,
        };
    },

    // Process a specific message
    processMessage: async (messageId: string) => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/messages/${messageId}/process`,
            {
                method: "POST",
            }
        );
        return response.json();
    },

    // Get all files
    getFiles: async () => {
        const response = await fetch(`${API_BASE_URL}/telegram/files`);
        return response.json();
    },

    // Get specific file
    getFile: async (fileId: string) => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/files/${fileId}`
        );
        return response.json();
    },

    // Download a file
    downloadFile: async (fileId: string) => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/files/${fileId}/download`
        );
        return response.blob();
    },

    // Delete a file
    deleteFile: async (fileId: string) => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/files/${fileId}`,
            {
                method: "DELETE",
            }
        );
        return response.json();
    },

    // Send Telegram message
    sendMessage: async (chatId: string, message: string) => {
        console.log(`Sending Telegram message to chat ID: ${chatId}`);
        const response = await fetch(`${API_BASE_URL}/proxy/telegram/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chatId,
                message,
            }),
        });
        return response.json();
    },
};

// ArDrive API
export const ardriveApi = {
    // Get wallet balance
    getBalance: async () => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/ardrive/balance`
        );
        return response.json();
    },

    // Get pending upload files
    getPendingUploads: async () => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/ardrive/pending`
        );
        return response.json();
    },

    // Get upload cost estimate
    getUploadCost: async (fileId: string) => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/ardrive/files/${fileId}/cost`
        );
        return response.json();
    },

    // Upload a file to ArDrive
    uploadFile: async (fileId: string) => {
        const response = await fetch(
            `${API_BASE_URL}/telegram/ardrive/files/${fileId}/upload`,
            {
                method: "POST",
            }
        );
        return response.json();
    },
};

// Node execution functions
export const nodeExecutors = {
    // Execute the Receive Telegram node
    executeTelegramReceive: async (config: any) => {
        try {
            // Ensure we have required config properties
            const safeConfig = {
                checkInterval: config.checkInterval || "10",
                messageTypes: config.messageTypes || "all",
                maxFileSizeInMB: config.maxFileSizeInMB || "50",
            };

            console.log(
                "Executing Telegram Receive node with config:",
                safeConfig
            );

            // Initialize the bot and wait for successful completion
            const initResponse = await telegramApi.initialize();

            if (!initResponse || !initResponse.success) {
                throw new Error(
                    `Failed to initialize Telegram bot: ${
                        initResponse?.message || "Unknown error"
                    }`
                );
            }

            console.log(
                "Telegram bot initialized successfully:",
                initResponse.status.botInfo?.username
            );

            // Only start the bot after successful initialization
            const startResponse = await telegramApi.start();

            if (!startResponse || !startResponse.success) {
                throw new Error(
                    `Failed to start Telegram bot: ${
                        startResponse?.message || "Unknown error"
                    }`
                );
            }

            console.log(
                "Telegram bot started successfully:",
                startResponse.status.botInfo?.username
            );

            // Set up polling for new messages
            let pollInterval: NodeJS.Timeout | null = null;

            // Return object with methods for controlling the node
            return {
                // Process messages once and return results
                processExistingMessages: async () => {
                    try {
                        console.log("Processing existing messages...");

                        // Check if the bot is still active
                        if (!isBotActive) {
                            console.log(
                                "Bot is no longer active, not processing messages"
                            );
                            return [];
                        }

                        const processedFiles = [];

                        // First, check for any pending messages
                        const pendingResponse =
                            await telegramApi.getPendingMessages();
                        if (
                            pendingResponse.success &&
                            pendingResponse.pendingMessages &&
                            pendingResponse.pendingMessages.length > 0
                        ) {
                            console.log(
                                `Found ${pendingResponse.pendingMessages.length} pending messages`
                            );

                            for (const message of pendingResponse.pendingMessages) {
                                // Skip messages that don't match the filter if not set to 'all'
                                if (
                                    safeConfig.messageTypes !== "all" &&
                                    message.type !== safeConfig.messageTypes
                                ) {
                                    console.log(
                                        `Skipping message of type ${message.type} (filter: ${safeConfig.messageTypes})`
                                    );
                                    continue;
                                }

                                console.log(
                                    `Processing message ${message.id} of type ${message.type}`
                                );
                                // Process the message
                                const processResult =
                                    await telegramApi.processMessage(
                                        message.id
                                    );

                                if (
                                    processResult.success &&
                                    processResult.file
                                ) {
                                    console.log(
                                        `Successfully processed file: ${processResult.file.fileName} (${processResult.file.id})`
                                    );
                                    processedFiles.push(processResult.file);
                                } else {
                                    console.error(
                                        "Failed to process message:",
                                        processResult.error || "Unknown error"
                                    );
                                }
                            }
                        } else {
                            console.log("No pending messages found");
                        }

                        console.log(
                            `Total processed files: ${processedFiles.length}`
                        );
                        return processedFiles;
                    } catch (error) {
                        console.error("Error processing messages:", error);
                        throw error;
                    }
                },

                // Process only recent files (useful for direct API calls)
                processRecentFiles: async () => {
                    try {
                        console.log("Processing recent files only...");

                        // Check if the bot is still active
                        if (!isBotActive) {
                            console.log(
                                "Bot is no longer active, not processing files"
                            );
                            return [];
                        }

                        // Get recent files
                        const recentFilesResponse =
                            await telegramApi.getRecentFiles();

                        // Check if we have new files
                        if (
                            recentFilesResponse.success &&
                            recentFilesResponse.hasNewFiles &&
                            recentFilesResponse.latestFileId
                        ) {
                            console.log(
                                `Found new files! Latest file ID: ${recentFilesResponse.latestFileId}`
                            );

                            // Get just the latest file to return
                            const latestFile = recentFilesResponse.files.find(
                                (file: any) =>
                                    file.id === recentFilesResponse.latestFileId
                            );

                            if (latestFile) {
                                console.log(
                                    `Latest file: ${latestFile.fileName} (${latestFile.id})`
                                );

                                // Call the callback if it exists (to process the file immediately)
                                if (onNewFileProcessed) {
                                    console.log(
                                        `Triggering immediate processing for latest file: ${latestFile.fileName}`
                                    );
                                    onNewFileProcessed(latestFile);
                                }

                                return [latestFile]; // Only return the latest file
                            }
                        } else {
                            console.log("No new files found");
                        }

                        return []; // Return empty array if no new files
                    } catch (error) {
                        console.error("Error processing recent files:", error);
                        throw error;
                    }
                },

                // Start polling for new messages
                startPolling: (callback: (fileData: any) => void) => {
                    const checkIntervalMs =
                        parseInt(safeConfig.checkInterval, 10) * 1000;
                    console.log(
                        `Starting to poll for new files every ${checkIntervalMs}ms`
                    );

                    // Register callback
                    telegramApi.registerFileProcessedCallback(callback);

                    // Clear any existing interval
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }

                    // Set up polling
                    pollInterval = setInterval(async () => {
                        if (!isBotActive) {
                            console.log(
                                "Bot is no longer active, stopping polling"
                            );
                            if (pollInterval) {
                                clearInterval(pollInterval);
                                pollInterval = null;
                            }
                            return;
                        }

                        try {
                            // Check for recent files (this is our primary method now)
                            const recentFilesResponse =
                                await telegramApi.getRecentFiles();

                            // Only process if we have new files (based on lastProcessedFileId tracking)
                            if (
                                recentFilesResponse.success &&
                                recentFilesResponse.hasNewFiles &&
                                recentFilesResponse.latestFileId
                            ) {
                                console.log(
                                    `Poll found new file with ID: ${recentFilesResponse.latestFileId}`
                                );

                                // Get the latest file
                                const latestFile =
                                    recentFilesResponse.files.find(
                                        (file: any) =>
                                            file.id ===
                                            recentFilesResponse.latestFileId
                                    );

                                if (latestFile && onNewFileProcessed) {
                                    console.log(
                                        `New file found during polling: ${latestFile.fileName}`
                                    );
                                    onNewFileProcessed(latestFile);
                                }
                            }
                        } catch (error) {
                            console.error("Error during polling:", error);
                        }
                    }, checkIntervalMs);
                },

                stop: async () => {
                    // Stop polling
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }

                    // Stop the bot
                    try {
                        const stopResponse = await telegramApi.stop();

                        if (!stopResponse || !stopResponse.success) {
                            console.error(
                                `Failed to stop Telegram bot: ${
                                    stopResponse?.message || "Unknown error"
                                }`
                            );
                        } else {
                            console.log(
                                "Telegram bot stopped successfully:",
                                stopResponse.status.botInfo?.username
                            );
                        }
                    } catch (error) {
                        console.error("Error stopping Telegram bot:", error);
                    }
                },
            };
        } catch (error) {
            console.error("Error executing Telegram Receive node:", error);
            throw error;
        }
    },

    // Execute the Upload to Arweave node
    executeArweaveUpload: async (config: any, fileData: any) => {
        try {
            // Ensure we have required config properties
            const safeConfig = {
                tags: config.tags || "",
                permanent: config.permanent || "true",
            };

            console.log("Arweave node received file data:", fileData);

            if (!fileData || !fileData.id) {
                throw new Error(
                    "No valid file data provided to upload. Received: " +
                        JSON.stringify(fileData)
                );
            }

            // Get the upload cost
            console.log(`Getting upload cost for file ID: ${fileData.id}`);
            const costResponse = await ardriveApi.getUploadCost(fileData.id);

            if (!costResponse.success) {
                throw new Error(
                    `Failed to get upload cost: ${
                        costResponse.error || "Unknown error"
                    }`
                );
            }

            console.log(`Upload cost: ${costResponse.cost} AR`);

            // Upload the file to Arweave
            console.log(`Uploading file ID: ${fileData.id} to Arweave`);
            const uploadResponse = await ardriveApi.uploadFile(fileData.id);

            if (!uploadResponse.success) {
                throw new Error(
                    `Failed to upload file: ${
                        uploadResponse.error || "Unknown error"
                    }`
                );
            }

            console.log(
                `File uploaded successfully to Arweave. Transaction ID: ${uploadResponse.data?.transactionId}`
            );

            return {
                ...uploadResponse.data,
                originalFile: fileData,
            };
        } catch (error) {
            console.error("Error executing Arweave Upload node:", error);
            throw error;
        }
    },

    // Execute the Send Telegram node
    executeTelegramSend: async (config: any, inputData: any) => {
        try {
            // Ensure we have required config properties
            const safeConfig = {
                chatId: config.chatId || "",
                message: config.message || "",
            };

            console.log(
                "Executing Send Telegram node with config:",
                safeConfig
            );

            // If no chat ID is provided, throw an error
            if (!safeConfig.chatId) {
                throw new Error("No chat ID provided for Telegram message");
            }

            // If no message is provided, throw an error
            if (!safeConfig.message) {
                throw new Error(
                    "No message content provided for Telegram message"
                );
            }

            // Send the Telegram message
            console.log(
                `Sending Telegram message to chat ID: ${safeConfig.chatId}`
            );
            const sendResponse = await telegramApi.sendMessage(
                safeConfig.chatId,
                safeConfig.message
            );

            if (!sendResponse.success) {
                throw new Error(
                    `Failed to send Telegram message: ${
                        sendResponse.error || "Unknown error"
                    }`
                );
            }

            console.log(
                `Message sent successfully to chat ID: ${safeConfig.chatId}`
            );

            return {
                success: true,
                sentTo: safeConfig.chatId,
                message: safeConfig.message,
                response: sendResponse,
                inputData,
            };
        } catch (error) {
            console.error("Error executing Send Telegram node:", error);
            throw error;
        }
    },
};
