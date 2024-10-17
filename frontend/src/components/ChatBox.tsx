import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
    user: string;
    message: string;
}

interface ChatBoxProps {
    messages: ChatMessage[];
    sendMessage: (message: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, sendMessage }) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-80"> {/* Set a max height */}
                {messages.map((msg, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-2">
                        <span className="font-bold">{msg.user}: </span>
                        <span>{msg.message}</span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;
