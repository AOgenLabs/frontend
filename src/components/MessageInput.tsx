import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex-1">
            <div className="flex items-center">
                <motion.input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-green-400 font-mono focus:outline-none"
                    placeholder="Type a command or message..."
                    autoComplete="off"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
                <span className="inline-block w-2 h-4 bg-green-400 animate-blink ml-1"></span>
            </div>
        </form>
    );
};

export default MessageInput; 