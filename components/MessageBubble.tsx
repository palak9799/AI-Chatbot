import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] lg:max-w-[60%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
        } shadow-sm`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words relative ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="markdown-content prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-emerald-600 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 prose-pre:rounded-lg">
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-emerald-500 animate-pulse" />
                )}
              </div>
            )}
          </div>
          <span className={`text-[10px] text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

      </div>
    </div>
  );
};