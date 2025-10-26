

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat as GeminiChat } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { Message } from '../types';
import Button from './ui/Button';

const Chat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: 'Bonjour ! Je suis Telya AI. Comment puis-je vous aider aujourd\'hui ?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSession = useRef<GeminiChat | null>(null);
    const messageListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!process.env.API_KEY) {
            console.error("API_KEY is not defined. Please set it in your environment variables.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSession.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "Vous êtes Telya AI, un assistant expert pour la plateforme de gestion de projet Telya. Vous êtes spécialisé en gestion de projet, production vidéo, et communication. Votre ton doit être professionnel, concis et serviable. Vous pouvez répondre à des questions sur la plateforme, donner des conseils en gestion de projet, ou aider à trouver des idées créatives. Répondez en français.",
            },
        });
    }, []);

    useEffect(() => {
        // Scroll to bottom when new messages appear
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !chatSession.current) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        try {
            const stream = await chatSession.current.sendMessageStream({ message: input });
            let fullResponse = '';
            setMessages(prev => [...prev, { sender: 'ai', text: '' }]); // Add placeholder for AI response

            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'ai', text: fullResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            setMessages(prev => [...prev, { sender: 'ai', text: 'Désolé, une erreur est survenue. Veuillez réessayer.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground z-50"
                aria-label="Ouvrir le chat"
            >
                {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 w-[calc(100vw-48px)] sm:w-96 h-[60vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col z-40"
                    >
                        <header className="p-4 border-b border-border flex items-center">
                             <Bot className="w-6 h-6 mr-3 text-primary" />
                            <h3 className="font-bold text-lg text-foreground">Telya AI Assistant</h3>
                        </header>
                        
                        <div ref={messageListRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'ai' && (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-5 h-5 text-primary" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                                        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    </div>
                                    {msg.sender === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                            <UserIcon className="w-5 h-5 text-secondary-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="max-w-[80%] p-3 rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none">
                                        <div className="flex items-center space-x-1.5">
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-border">
                            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez votre question..."
                                    className="flex-1 w-full p-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition"
                                    disabled={isLoading}
                                />
                                <Button type="submit" className="!p-3" disabled={isLoading || !input.trim()}>
                                    <Send className="w-5 h-5" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chat;