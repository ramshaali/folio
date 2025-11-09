import React, { useState, useRef, useEffect } from "react";
import { generateArticle, startNewSession, streamAgentOutputs } from "../apis/article";
import { FaArrowUp, FaRegComment } from "react-icons/fa";
import { ThinkingBubble } from "./ThinkingBubble";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

interface AgentStep {
  agent_name: string;
  text: string;
  status?: string;
}

interface ChatPanelProps {
  sessionId: string | null;
  userId: string | null;
  setSessionId: (id: string) => void;
  setUserId: (id: string) => void;
  setCurrentArticle: (article: any) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  sessionId,
  userId,
  setSessionId,
  setUserId,
  setCurrentArticle,
}) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<{name: string, text: string} | null>(null);
  const [lastNonWriterResponse, setLastNonWriterResponse] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [chatHistory, currentAgent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleNewSession = async () => {
    const res = await startNewSession();
    if (res.status === 200) {
      setSessionId(res.data.session_id);
      setUserId(res.data.user_id);
      setChatHistory([]);
      setCurrentAgent(null);
      setLastNonWriterResponse("");
      setCurrentArticle(null);
    } else {
      alert("Failed to start new session.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage: Message = { 
      role: "user", 
      content: input, 
      timestamp: new Date().toLocaleTimeString() 
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setCurrentAgent(null);
    setLastNonWriterResponse("");

    let finalArticleContent = "";
    let lastAgentBeforeDone = "";

    try {
      const generator = streamAgentOutputs(input, sessionId, userId);
      
      for await (const chunk of generator) {
        if (chunk.status === "done") {
          // Stream completed
          break;
        }

        // Update current agent thinking
        setCurrentAgent({
          name: chunk.agent_name,
          text: chunk.text
        });

        // Store the last agent response for non-writer agents
        if (chunk.agent_name !== "writer_agent") {
          setLastNonWriterResponse(chunk.text);
          lastAgentBeforeDone = chunk.text;
        }

        // If it's writer agent, update article panel
        if (chunk.agent_name === "writer_agent") {
          finalArticleContent = chunk.text;
          setCurrentArticle(chunk.text);
        }
      }

      // After stream completes
      if (finalArticleContent) {
        // If we have article content, show completion message in chat
        const completionMessage: Message = {
          role: "ai",
          content: "**Article generation completed!**\n\nYour article is now ready in the preview panel. You can continue chatting to make edits or generate new content.",
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => [...prev, completionMessage]);
      } else if (lastAgentBeforeDone) {
        // If last agent wasn't writer, show its response in chat
        const agentMessage: Message = {
          role: "ai",
          content: lastAgentBeforeDone,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => [...prev, agentMessage]);
      }

    } catch (error) {
      console.error("Stream error:", error);
      const errorMessage: Message = {
        role: "ai",
        content: "**Sorry, there was an error processing your request.**\n\nPlease try again or rephrase your request.",
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setCurrentAgent(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageContent = (content: string, role: "user" | "ai") => {
    if (role === "ai") {
      return (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-secondary rounded-md border border-muted shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-muted bg-white">
        <div className="flex items-center gap-2">
          {/* Replace Folio text with logo */}
          <img 
            src="assets/logo-sm.png" 
            alt="Logo" 
            className="h-8 w-auto" 
            onError={(e) => {
              // Fallback if logo doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // Show text fallback
              const fallback = document.createElement('div');
              fallback.className = 'font-playfair text-muted text-2xl font-bold';
              fallback.textContent = 'Folio.';
              target.parentNode?.insertBefore(fallback, target);
            }}
          />
        </div>
        <button 
          onClick={handleNewSession} 
          className="p-3 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center"
          title="New Session"
        >
          <FaRegComment className="text-lg" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-3`}>
            <div className={`w-9 h-9 flex items-center justify-center rounded-full ${
              msg.role === "user" ? "bg-primary text-white" : "bg-muted text-white"
            }`}>
              {msg.role === "user" ? "You" : "AI"}
            </div>
            <div className={`max-w-[75%] p-4 rounded-2xl font-inter text-sm border ${
              msg.role === "user" 
                ? "border-primary/20 bg-blue-50 rounded-br-none" 
                : "border-muted/20 bg-white rounded-bl-none"
            }`}>
              {renderMessageContent(msg.content, msg.role)}
              <div className="text-xs text-muted mt-2 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}
        
        {/* Thinking Bubble - Shows current agent activity */}
        {isStreaming && currentAgent && (
          <ThinkingBubble 
            agentName={currentAgent.name}
            agentText={currentAgent.text}
            isActive={isStreaming}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - DeepSeek Style */}
      <div className="sticky bottom-0 p-4 border-t border-muted/50 bg-secondary">
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full p-4 pr-12 border border-muted/30 rounded-2xl font-inter text-sm bg-white resize-none focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Describe your article topic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            disabled={isStreaming}
            style={{
              minHeight: '70px',
              maxHeight: '120px'
            }}
          />
          <button 
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all duration-200 ${
              isStreaming || !input.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md'
            }`}
            style={{
              transform: isStreaming || !input.trim() ? 'scale(1)' : 'scale(1.05)'
            }}
          >
            <FaArrowUp className={`text-sm ${isStreaming ? 'opacity-50' : ''}`} />
          </button>
        </div>
        
        {/* Helper text */}
        <div className="text-xs text-muted text-center mt-2">
          {isStreaming ? "Generating response... Please wait." : "Press Enter to send, Shift+Enter for new line"}
        </div>
      </div>
    </div>
  );
};