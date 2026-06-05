import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CitationCard from './CitationCard';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function ChatMessage({ message, isUser }) {
  return (
    <div className={cn("flex w-full space-x-4 mb-6", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] rounded-2xl px-6 py-4 shadow-sm",
        isUser 
          ? "bg-purple-600 text-white rounded-br-none" 
          : "glass-panel rounded-bl-none text-slate-200"
      )}>
        <div className={cn("prose prose-invert max-w-none", isUser ? "prose-p:leading-relaxed" : "")}>
          <ReactMarkdown>
            {isUser ? message.question : message.answer}
          </ReactMarkdown>
        </div>
        
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sources</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {message.sources.map((source, idx) => (
                <CitationCard key={idx} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shadow-lg border border-white/10">
          <User className="w-6 h-6 text-slate-300" />
        </div>
      )}
    </div>
  );
}
