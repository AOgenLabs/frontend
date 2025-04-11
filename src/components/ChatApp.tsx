/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import MessageInput from "./MessageInput";
import ConnectionForm from "./ConnectionForm";
import AutomationsList from "./AutomationsList";
import CreateAutomationForm from "./CreateAutomationForm";
import { useApi } from "@/context/ApiContext";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
}

export default function ChatApp() {
    const { isConnected, sendMessage, processId, emailBotId } = useApi();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "AO Process Builder Terminal v1.0.0 ready. Type 'help' for available commands.",
            sender: "ai",
            timestamp: new Date(),
        },
        {
            id: "2",
            text: "Welcome to AO Process Builder. Connect to the AO platform to get started.",
            sender: "ai",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const [systemStatus, setSystemStatus] = useState({
        memory: "87.4MB",
        cpu: "2.3%",
        uptime: "00:00:00",
    });
    const [showAutomations, setShowAutomations] = useState(false);

    // This useEffect ensures the component only renders on the client side
    useEffect(() => {
        setIsClient(true);
        // Set dark mode
        document.documentElement.classList.add("dark");

        // Update uptime
        const uptimeInterval = setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");

            setSystemStatus((prev) => ({
                ...prev,
                uptime: `${hours}:${minutes}:${seconds}`,
                cpu: `${Math.floor(Math.random() * 4) + 1}.${Math.floor(
                    Math.random() * 9
                )}%`,
            }));
        }, 1000);

        return () => clearInterval(uptimeInterval);
    }, []);

    // Scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        // Add user message
        const newUserMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMessage]);

        // Handle special commands
        if (text.toLowerCase() === "help") {
            setTimeout(() => {
                const helpMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text:
                        "Available commands:\n\n" +
                        "System Commands:\n" +
                        "- help: Display this help menu\n" +
                        "- status: Show system status\n" +
                        "- clear: Clear chat history\n" +
                        "- about: About AO Process Builder\n" +
                        "- connect: Show connection form\n" +
                        "- automations: Show/hide automations panel\n\n" +
                        "AO Platform Commands (when connected):\n" +
                        '- target:SendEmail:{"to":"example@example.com","subject":"Test","body":"Message"}\n' +
                        '- target:CreateAutomation:{"name":"My Automation","when":"Event","then":"Action"}\n' +
                        '- target:TriggerAutomation:{"id":"automation-id","data":"optional-data"}\n' +
                        "- target:GetStatus\n\n" +
                        "Replace 'target' with the actual process ID you want to communicate with.",
                    sender: "ai",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, helpMessage]);
            }, 500);
            return;
        }

        if (text.toLowerCase() === "status") {
            setTimeout(() => {
                const connectionStatus = isConnected
                    ? "Connected to AO Platform"
                    : "Not connected to AO Platform";
                const processIdInfo = isConnected
                    ? `\n- Process Builder ID: ${
                          processId ||
                          "AekAOxMpGADIxITvlVEeoOI89vD4cOMr4B5mGAN7TDA"
                      }\n- Email Bot ID: ${
                          emailBotId ||
                          "zsPNCzySkeo1nNvAshcrNK6HihH-nL1taWWjylVkmio"
                      }`
                    : "";
                const automationsCount = Math.floor(Math.random() * 5) + 1; // Simulate 1-5 automations
                const automationsInfo = isConnected
                    ? `\n- Active Automations: ${automationsCount}`
                    : "";

                const statusMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: `System Status:\n- Memory Usage: ${systemStatus.memory}\n- CPU Load: ${systemStatus.cpu}\n- Uptime: ${systemStatus.uptime}\n- AO Connection: ${connectionStatus}${processIdInfo}${automationsInfo}\n- All systems operational`,
                    sender: "ai",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, statusMessage]);
            }, 500);
            return;
        }

        if (text.toLowerCase() === "clear") {
            setTimeout(() => {
                setMessages([
                    {
                        id: (Date.now() + 1).toString(),
                        text: "Chat history cleared. How may I assist you?",
                        sender: "ai",
                        timestamp: new Date(),
                    },
                ]);
            }, 300);
            return;
        }

        if (text.toLowerCase() === "about") {
            setTimeout(() => {
                const aboutMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "AO Process Builder v1.0.0\nA terminal interface for the AO platform\nCopyright © 2023\nCreate and manage automations on the AO platform.",
                    sender: "ai",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aboutMessage]);
            }, 500);
            return;
        }

        if (text.toLowerCase() === "connect") {
            setTimeout(() => {
                const connectMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: isConnected
                        ? "Already connected to AO Platform."
                        : "Please use the connection form above to connect to the AO Platform.",
                    sender: "ai",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, connectMessage]);
            }, 300);
            return;
        }

        if (text.toLowerCase() === "automations") {
            setShowAutomations(!showAutomations);
            setTimeout(() => {
                const automationsMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: showAutomations
                        ? "Hiding automations panel."
                        : "Showing automations panel.",
                    sender: "ai",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, automationsMessage]);
            }, 300);
            return;
        }

        // If connected to AO, try to send the message to the platform
        if (isConnected) {
            setIsTyping(true);
            try {
                // Extract command pattern: target:action:data
                const commandMatch = text.match(/^([^:]+):([^:]+)(?::(.+))?$/);

                if (commandMatch) {
                    const [, target, action, data] = commandMatch;

                    // Simulate a delay for processing
                    await new Promise((resolve) => setTimeout(resolve, 1500));

                    // Simulate responses based on the action
                    let responseText = "";
                    let responseData = {};

                    if (action === "SendEmail") {
                        responseData = {
                            success: true,
                            message: "Email sent successfully",
                            data: {
                                emailId: "email-" + Date.now(),
                                sentAt: new Date().toISOString(),
                            },
                        };
                        responseText = `Email sent successfully!\n\nDetails:\n- Target: ${target}\n- Action: ${action}\n- Response: ${JSON.stringify(
                            responseData,
                            null,
                            2
                        )}`;
                    } else if (action === "CreateAutomation") {
                        responseData = {
                            success: true,
                            message: "Automation created successfully",
                            data: {
                                id: "auto-" + Date.now(),
                                createdAt: new Date().toISOString(),
                            },
                        };
                        responseText = `Automation created successfully!\n\nDetails:\n- Target: ${target}\n- Action: ${action}\n- Response: ${JSON.stringify(
                            responseData,
                            null,
                            2
                        )}`;
                    } else if (action === "TriggerAutomation") {
                        responseData = {
                            success: true,
                            message: "Automation triggered successfully",
                            data: {
                                executionId: "exec-" + Date.now(),
                                triggeredAt: new Date().toISOString(),
                                status: "completed",
                            },
                        };
                        responseText = `Automation triggered successfully!\n\nDetails:\n- Target: ${target}\n- Action: ${action}\n- Response: ${JSON.stringify(
                            responseData,
                            null,
                            2
                        )}`;
                    } else if (action === "GetStatus") {
                        responseData = {
                            success: true,
                            message: "Status retrieved successfully",
                            data: {
                                status: "active",
                                uptime: "2h 34m",
                                lastActivity: new Date().toISOString(),
                                pendingTasks: 0,
                            },
                        };
                        responseText = `Status retrieved successfully!\n\nDetails:\n- Target: ${target}\n- Action: ${action}\n- Response: ${JSON.stringify(
                            responseData,
                            null,
                            2
                        )}`;
                    } else {
                        // Try to send the actual message if it's not a simulated action
                        try {
                            const response = await sendMessage(
                                target,
                                action,
                                data
                            );
                            responseData = response;
                            responseText = `Message sent to AO Platform:\nTarget: ${target}\nAction: ${action}\nResponse: ${JSON.stringify(
                                response,
                                null,
                                2
                            )}`;
                        } catch (err) {
                            responseData = {
                                success: false,
                                error:
                                    err instanceof Error
                                        ? err.message
                                        : "Unknown error",
                            };
                            responseText = `Error sending message to AO Platform: ${
                                err instanceof Error
                                    ? err.message
                                    : "Unknown error"
                            }`;
                        }
                    }

                    setIsTyping(false);
                    const responseMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        text: responseText,
                        sender: "ai",
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, responseMessage]);
                } else {
                    setIsTyping(false);
                    const helpMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        text: 'To send a message to the AO Platform, use the format: target:action:data\nExample: processId:CreateAutomation:{"name":"My Automation"}',
                        sender: "ai",
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, helpMessage]);
                }
            } catch (err) {
                setIsTyping(false);
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: `Error sending message to AO Platform: ${
                        err instanceof Error ? err.message : "Unknown error"
                    }`,
                    sender: "ai",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
            return;
        }

        // If not connected, simulate AI typing
        setIsTyping(true);

        // Simulate AI response after delay
        setTimeout(() => {
            setIsTyping(false);

            // Add AI response
            const newAiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getAIResponse(text),
                sender: "ai",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, newAiMessage]);
        }, 1500);
    };

    // Placeholder AI response function
    const getAIResponse = (_message: string) => {
        const responses = [
            "I understand. Can you tell me more about that?",
            "Interesting point! Let me think about that...",
            "I'm AO Process Builder, here to assist with your automation needs. How can I help further?",
            "That's a great question. From my understanding...",
            "I'm processing that information. Could you provide additional details?",
            "I see what you mean. Here's what I think we should do...",
            "Thanks for sharing that. I'm here to help you explore this further.",
            "I'm designed to help with all your AO platform needs. What specific aspect are you interested in?",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    if (!isClient) return null;

    return (
        <div className="relative h-screen flex flex-col bg-black text-green-400 font-mono">
            {/* OS-style status bar */}
            <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 px-4 py-1 z-10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span>AO Process Builder Terminal v1.0.0</span>
                </div>
                <div className="flex items-center gap-4">
                    <div>MEM: {systemStatus.memory}</div>
                    <div>CPU: {systemStatus.cpu}</div>
                    <div>UPTIME: {systemStatus.uptime}</div>
                </div>
            </div>

            {/* Terminal window */}
            <div className="flex-grow overflow-y-auto pt-8 pb-16 px-4 text-sm">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-4">
                        <div className="text-gray-500 mb-2">
                            {"/* Welcome to AO Process Builder Terminal */"}
                        </div>
                        <div className="text-gray-500 mb-2">
                            {"/* Type 'help' for available commands */"}
                        </div>
                    </div>

                    {/* Connection form */}
                    <ConnectionForm />

                    {/* Automations panel */}
                    {isConnected && showAutomations && (
                        <div className="mb-4 p-3 border border-gray-700 bg-gray-800/30 rounded">
                            <CreateAutomationForm />
                            <AutomationsList />
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((message) => (
                            <div key={message.id} className="mb-2">
                                <div className="text-gray-500 text-xs">
                                    [{message.timestamp.toLocaleTimeString()}]{" "}
                                    {message.sender === "user"
                                        ? "USER@AOgen:~$"
                                        : "AOgen:~$"}
                                </div>
                                <div
                                    className={`pl-2 border-l-2 ${
                                        message.sender === "user"
                                            ? "border-blue-500 text-blue-300"
                                            : "border-green-500 text-green-300"
                                    } whitespace-pre-line`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <div className="mb-2">
                            <div className="text-gray-500 text-xs">
                                [{new Date().toLocaleTimeString()}] AOgen:~$
                            </div>
                            <div className="pl-2 border-l-2 border-green-500 text-green-300 flex items-center gap-1">
                                <span className="inline-block w-2 h-4 bg-green-400 animate-blink"></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Command input */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-900 p-2">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center">
                        <div className="text-gray-400 mr-2">USER@AOgen:~$</div>
                        <MessageInput onSendMessage={handleSendMessage} />
                    </div>
                </div>
            </div>
        </div>
    );
}
