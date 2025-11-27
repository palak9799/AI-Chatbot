import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSend(input.trim());
      setInput('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 sticky bottom-0 z-10">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isLoading || disabled}
          rows={1}
          className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 text-gray-800 placeholder-gray-400 max-h-[120px] scrollbar-hide disabled:opacity-50"
          style={{ minHeight: '44px' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || disabled}
          className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${
            input.trim() && !isLoading && !disabled
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} className={input.trim() ? "ml-0.5" : ""} />
          )}
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-400">
          Powered by Gemini 2.5 Flash • Context aware • AI can make mistakes
        </p>
      </div>
    </div>
  );
};