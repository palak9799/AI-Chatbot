import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { Message, Role } from './types';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the Gemini chat session on mount
    const success = geminiService.initializeChat();
    if (success) {
      setIsInitialized(true);
      // Add an initial greeting
      setMessages([
        {
          id: 'init-1',
          role: Role.MODEL,
          content: "Hello! I'm your advanced NLP assistant powered by Gemini. I can help you with analysis, coding, creative writing, and more. How can I assist you today?",
          timestamp: new Date(),
        },
      ]);
    } else {
      setError("Failed to initialize chat service. Please check your API key configuration.");
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create a placeholder message for the bot's response
    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: Role.MODEL,
      content: '', // Start empty
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, botMessagePlaceholder]);

    try {
      await geminiService.sendMessageStream(text, (updatedText) => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, content: updatedText } 
              : msg
          )
        );
      });

      // Mark streaming as done
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
    } catch (err) {
      console.error(err);
      setError("I encountered an error while processing your request. Please try again.");
      // Remove the failed placeholder or mark it as error
      setMessages((prev) => prev.filter(msg => msg.id !== botMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  if (!process.env.API_KEY) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-bold mb-2">Configuration Missing</h1>
          <p className="text-gray-600 mb-6">
            The API key is missing from the environment variables. Please check your setup.
          </p>
          <div className="bg-gray-100 p-3 rounded text-sm font-mono text-left overflow-x-auto">
            process.env.API_KEY
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-gray-800">Gemini NLP Chatbot</h1>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online & Ready
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
           {/* Add helpful links or status indicators here if needed */}
           <div className="flex items-center gap-1">
             <MessageSquare size={16} />
             <span>Multi-turn Enabled</span>
           </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth relative">
        <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full pb-4">
          
          {messages.length === 0 && isInitialized && (
             <div className="flex flex-col items-center justify-center flex-1 opacity-50 space-y-4">
                <Sparkles size={48} className="text-gray-300" />
                <p className="text-gray-400 font-medium">Start a conversation...</p>
             </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {error && (
            <div className="flex justify-center my-4">
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <ChatInput 
        onSend={handleSendMessage} 
        isLoading={isLoading} 
        disabled={!isInitialized}
      />

    </div>
  );
}