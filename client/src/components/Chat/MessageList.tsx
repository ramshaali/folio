import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ThinkingBubble } from '../ThinkingBubble';

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
  currentAgent: { name: string; text: string } | null;
  isStreaming: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  currentAgent, 
  isStreaming 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentAgent]);

  const renderMessageContent = (content: string, role: "user" | "ai") => {
    if (role === "ai") {
      return (
        <div className="prose prose-sm max-w-none font-lora text-charcoal leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }
    return <div className="whitespace-pre-wrap font-inter text-charcoal leading-relaxed">{content}</div>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg, idx) => (
        <div 
          key={idx} 
          className={`flex ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-4 animate-fade-in-up`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-cream text-sm font-medium ${
            msg.role === "user" ? "bg-gold" : "bg-charcoal"
          }`}>
            {msg.role === "user" ? "U" : "F"}
          </div>
          
          <div className={`max-w-[80%] p-4 rounded-lg ${
            msg.role === "user" 
              ? "bg-gold/10 border-l-4 border-gold rounded-tl-none" 
              : "bg-white border-l-4 border-charcoal rounded-tl-none shadow-sm"
          }`}>
            {renderMessageContent(msg.content, msg.role)}
            <div className="text-xs text-warm-gray mt-3 font-inter">
              {msg.timestamp}
            </div>
          </div>
        </div>
      ))}
      
      {isStreaming && currentAgent && (
        <ThinkingBubble 
          agentName={currentAgent.name}
          agentText={currentAgent.text}
          isActive={isStreaming}
        />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};