'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import AnimatedBackground from './AnimatedBackground';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function ChatApp() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "System initialized. AOgen AI v1.0.4 ready. Type 'help' for available commands.",
            sender: 'ai',
            timestamp: new Date()
        },
        {
            id: '2',
            text: "Welcome to AOgen. How may I assist you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const [systemStatus, setSystemStatus] = useState({
        memory: '87.4MB',
        cpu: '2.3%',
        uptime: '00:00:00'
    });

    // This useEffect ensures the component only renders on the client side
    useEffect(() => {
        setIsClient(true);
        // Set dark mode
        document.documentElement.classList.add('dark');

        // Update uptime
        const uptimeInterval = setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            setSystemStatus(prev => ({
                ...prev,
                uptime: `${hours}:${minutes}:${seconds}`,
                cpu: `${Math.floor(Math.random() * 4) + 1}.${Math.floor(Math.random() * 9)}%`
            }));
        }, 1000);

        return () => clearInterval(uptimeInterval);
    }, []);

    // Scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = (text: string) => {
        // Add user message
        const newUserMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);

        // Handle special commands
        if (text.toLowerCase() === 'help') {
            setTimeout(() => {
                const helpMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Available commands:\n- help: Display this help menu\n- status: Show system status\n- clear: Clear chat history\n- about: About AOgen",
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, helpMessage]);
            }, 500);
            return;
        }

        if (text.toLowerCase() === 'status') {
            setTimeout(() => {
                const statusMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: `System Status:\n- Memory Usage: ${systemStatus.memory}\n- CPU Load: ${systemStatus.cpu}\n- Uptime: ${systemStatus.uptime}\n- All systems operational`,
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, statusMessage]);
            }, 500);
            return;
        }

        if (text.toLowerCase() === 'clear') {
            setTimeout(() => {
                setMessages([{
                    id: (Date.now() + 1).toString(),
                    text: "Chat history cleared. How may I assist you?",
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            }, 300);
            return;
        }

        if (text.toLowerCase() === 'about') {
            setTimeout(() => {
                const aboutMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "AOgen v1.0.4\nAdvanced Operational Generator\nCopyright © 2023\nA next-generation AI assistant designed to help with creative and technical tasks.",
                    sender: 'ai',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aboutMessage]);
            }, 500);
            return;
        }

        // Simulate AI typing
        setIsTyping(true);

        // Simulate AI response after delay
        setTimeout(() => {
            setIsTyping(false);

            // Add AI response
            const newAiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: getAIResponse(text),
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newAiMessage]);
        }, 1500);
    };

    // Placeholder AI response function
    const getAIResponse = (message: string) => {
        const responses = [
            "I understand. Can you tell me more about that?",
            "Interesting point! Let me think about that...",
            "I'm AOgen, here to assist with your AI generation needs. How can I help further?",
            "That's a great question. From my understanding...",
            "I'm processing that information. Could you provide additional details?",
            "I see what you mean. Here's what I think we should do...",
            "Thanks for sharing that. I'm here to help you explore this further.",
            "I'm designed to help with all your creative AI needs. What specific aspect are you interested in?",
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
                    <span>AOgen Terminal v1.0.4</span>
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
                        <div className="text-gray-500 mb-2">/* Welcome to AOgen OS Terminal */</div>
                        <div className="text-gray-500 mb-2">/* Type 'help' for available commands */</div>
                    </div>

                    <AnimatePresence>
                        {messages.map((message) => (
                            <div key={message.id} className="mb-2">
                                <div className="text-gray-500 text-xs">
                                    [{message.timestamp.toLocaleTimeString()}] {message.sender === 'user' ? 'USER@AOgen:~$' : 'AOgen:~$'}
                                </div>
                                <div className={`pl-2 border-l-2 ${message.sender === 'user' ? 'border-blue-500 text-blue-300' : 'border-green-500 text-green-300'} whitespace-pre-line`}>
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