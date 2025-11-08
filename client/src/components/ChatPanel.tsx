import React, { useState, useRef, useEffect } from "react";
import { generateArticle, startNewSession, streamAgentOutputs } from "../apis/article";
import { FaPlus } from "react-icons/fa";
import { ThinkingBubble } from "./ThinkingBubble";

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

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [chatHistory, currentAgent]);

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
    if (!input.trim()) return;
    
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
          content: "✅ Article generation completed! Check the preview panel.",
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
        content: "❌ Sorry, there was an error processing your request.",
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setCurrentAgent(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary rounded-md border border-accent shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-accent bg-white">
        <div className="flex items-center gap-2 font-playfair text-accent text-2xl font-bold">
          Folio<span className="text-primary">.</span>
        </div>
        <button 
          onClick={handleNewSession} 
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center gap-1"
        >
          <FaPlus /> New Session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-2`}>
            <div className={`w-9 h-9 flex items-center justify-center rounded-full ${
              msg.role === "user" ? "bg-primary text-white" : "bg-accent text-white"
            }`}>
              {msg.role === "user" ? "You" : "AI"}
            </div>
            <div className={`max-w-[70%] p-3 rounded-xl font-inter text-sm border ${
              msg.role === "user" ? "border-primary/20 bg-blue-50" : "border-accent bg-white"
            }`}>
              {msg.content}
              <div className="text-xs text-muted mt-1 text-right">{msg.timestamp}</div>
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

      {/* Input */}
      <div className="sticky bottom-0 p-4 border-t border-accent bg-secondary flex gap-2">
        <textarea
          className="flex-1 p-2 border border-accent rounded-md font-inter text-sm"
          placeholder="Describe your article topic..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          rows={3}
          disabled={isStreaming}
        />
        <button 
          onClick={handleSend} 
          disabled={isStreaming || !input.trim()}
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isStreaming ? '⏳ Working...' : '📨 Send'}
        </button>
      </div>
    </div>
  );
};