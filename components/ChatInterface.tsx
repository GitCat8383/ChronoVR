import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, MessageSquare, Mic, BookOpen } from 'lucide-react';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  npcName: string;
  npcRole: string;
  isTyping: boolean;
  activeTab?: 'npc' | 'expert';
  onTabChange?: (tab: 'npc' | 'expert') => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  npcName, 
  npcRole,
  isTyping,
  activeTab,
  onTabChange
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-800 overflow-hidden shadow-xl">
      
      {/* Tab Switcher & Header */}
      <div className="bg-gray-900/50 border-b border-gray-800">
          {onTabChange && activeTab && (
              <div className="flex w-full">
                  <button 
                    onClick={() => onTabChange('npc')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                        ${activeTab === 'npc' ? 'bg-amber-900/20 text-amber-500 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                    `}
                  >
                      <User className="w-3 h-3" /> Roleplay
                  </button>
                  <button 
                    onClick={() => onTabChange('expert')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                        ${activeTab === 'expert' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                    `}
                  >
                      <BookOpen className="w-3 h-3" /> Expert Analysis
                  </button>
              </div>
          )}
          
          <div className="p-4 flex items-center space-x-3">
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border
                ${activeTab === 'expert' ? 'bg-blue-900/30 border-blue-700/50 text-blue-400' : 'bg-amber-900/30 border-amber-700/50 text-amber-500'}
            `}>
              {activeTab === 'expert' ? <BookOpen className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-100 historical-font">{npcName}</h3>
              <p className={`text-xs uppercase tracking-wide ${activeTab === 'expert' ? 'text-blue-400/80' : 'text-amber-500/80'}`}>
                  {npcRole}
              </p>
            </div>
          </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2 opacity-60">
            <MessageSquare className="w-12 h-12" />
            <p className="text-sm">Start a conversation with {npcName}...</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? `${activeTab === 'expert' ? 'bg-blue-600' : 'bg-amber-600'} text-white rounded-br-none` 
                  : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
              }`}
            >
              <ReactMarkdown 
                components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    a: ({node, ...props}) => <a className="underline hover:text-white/80" target="_blank" rel="noopener noreferrer" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-white/30 pl-3 italic my-2" {...props} />,
                    code: ({node, className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match && !String(children).includes('\n');
                        return isInline ? (
                            <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                {children}
                            </code>
                        ) : (
                            <div className="my-2 bg-black/30 rounded-lg overflow-hidden border border-white/10">
                                {match?.[1] && (
                                    <div className="bg-black/20 px-3 py-1 text-[10px] uppercase opacity-70 font-mono border-b border-white/5">
                                        {match[1]}
                                    </div>
                                )}
                                <code className="block p-3 text-xs font-mono overflow-x-auto" {...props}>
                                    {children}
                                </code>
                            </div>
                        )
                    }
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-700 flex space-x-1 items-center">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900/50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${npcName} a question...`}
            className={`flex-1 bg-gray-950 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 transition-colors placeholder-gray-600
                ${activeTab === 'expert' ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-amber-500 focus:ring-amber-500'}
            `}
          />
          <button 
            type="button" 
            className={`p-2 transition-colors ${activeTab === 'expert' ? 'text-gray-400 hover:text-blue-500' : 'text-gray-400 hover:text-amber-500'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button 
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`
                disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center
                ${activeTab === 'expert' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}
            `}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};