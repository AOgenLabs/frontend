'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TelegramFormProps {
    onSubmit: (chatId: string, message: string) => void;
    onCancel: () => void;
    initialChatId?: string;
    initialMessage?: string;
    isEditing?: boolean;
}

export default function TelegramForm({
    onSubmit,
    onCancel,
    initialChatId = '',
    initialMessage = '',
    isEditing = false
}: TelegramFormProps) {
    const [chatId, setChatId] = useState(initialChatId);
    const [message, setMessage] = useState(initialMessage);
    const [errors, setErrors] = useState<{ chatId?: string; message?: string }>({});

    // Focus on first input when form opens
    useEffect(() => {
        const timer = setTimeout(() => {
            const input = document.getElementById('chatId');
            if (input) input.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const newErrors: { chatId?: string; message?: string } = {};

        if (!chatId) {
            newErrors.chatId = 'Chat ID is required';
        }

        if (!message) {
            newErrors.message = 'Message is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // If validation passes, submit the form
        onSubmit(chatId, message);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300
                    }}
                    className="bg-[#1e1e2e] rounded-2xl shadow-2xl w-full max-w-md border border-[#313244] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-[#313244] bg-[#181825]">
                        <h2 className="text-xl font-semibold text-[#cdd6f4]">
                            {isEditing ? 'Edit Telegram Action' : 'Configure Telegram Action'}
                        </h2>
                        <p className="text-xs text-[#a6adc8] mt-1">
                            {isEditing
                                ? 'Update settings for your Telegram message'
                                : 'Enter the Telegram chat ID and message template'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-5">
                        <div>
                            <label htmlFor="chatId" className="block text-sm font-medium text-[#cdd6f4] mb-2">
                                Chat ID
                            </label>
                            <input
                                type="text"
                                id="chatId"
                                value={chatId}
                                onChange={(e) => setChatId(e.target.value)}
                                className={`w-full px-4 py-2.5 bg-[#181825] rounded-lg border ${errors.chatId ? 'border-[#f38ba8]' : 'border-[#313244]'
                                    } text-[#cdd6f4] focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-transparent transition-all`}
                                placeholder="Enter Telegram chat ID"
                            />
                            {errors.chatId && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-2 text-xs text-[#f38ba8]"
                                >
                                    {errors.chatId}
                                </motion.p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-[#cdd6f4] mb-2">
                                Message Template
                            </label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className={`w-full px-4 py-2.5 bg-[#181825] rounded-lg border ${errors.message ? 'border-[#f38ba8]' : 'border-[#313244]'
                                    } text-[#cdd6f4] focus:outline-none focus:ring-2 focus:ring-[#cba6f7] focus:border-transparent resize-none transition-all`}
                                placeholder="Hello! This is a message from the automation flow."
                            />
                            {errors.message && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-2 text-xs text-[#f38ba8]"
                                >
                                    {errors.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <motion.button
                                type="button"
                                onClick={onCancel}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-4 py-2.5 bg-[#313244] text-[#cdd6f4] rounded-lg text-sm hover:bg-[#45475a] transition-colors font-medium"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-5 py-2.5 bg-[#94e2d5] bg-opacity-15 text-[#94e2d5] rounded-lg text-sm hover:bg-opacity-25 transition-colors font-medium"
                            >
                                {isEditing ? 'Update' : 'Save'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
} 