import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, MessageSquare, Mic } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  npcName: string;
  npcRole: string;
  isTyping: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  npcName, 
  npcRole,
  isTyping 
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
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center border border-amber-700/50">
          <Bot className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-100 historical-font">{npcName}</h3>
          <p className="text-xs text-amber-500/80 uppercase tracking-wide">{npcRole}</p>
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
                  ? 'bg-amber-600 text-white rounded-br-none' 
                  : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
              }`}
            >
              {msg.text}
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
            className="flex-1 bg-gray-950 border border-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-gray-600"
          />
          <button 
            type="button" // Placeholder for voice, not fully implemented logic here to keep simple
            className="p-2 text-gray-400 hover:text-amber-500 transition-colors"
            title="Voice input (Coming soon)"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button 
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};