import React, { useState, useRef, useEffect } from "react";
import { startNewSession, streamAgentOutputs } from "../../apis/article";
import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";
import { ThinkingBubble } from "../ThinkingBubble";

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
  isMobile?: boolean;
  onSwitchToArticle?: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  sessionId,
  userId,
  setSessionId,
  setUserId,
  setCurrentArticle,
  isMobile = false,
  onSwitchToArticle,
}) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<{name: string, text: string} | null>(null);
  const [lastNonWriterResponse, setLastNonWriterResponse] = useState<string>("");

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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
          break;
        }

        setCurrentAgent({
          name: chunk.agent_name,
          text: chunk.text
        });

        if (chunk.agent_name !== "writer_agent") {
          setLastNonWriterResponse(chunk.text);
          lastAgentBeforeDone = chunk.text;
        }

        if (chunk.agent_name === "writer_agent") {
          finalArticleContent = chunk.text;
          setCurrentArticle(chunk.text);
          
          // Auto-switch to article on mobile when article is ready
          if (isMobile && onSwitchToArticle) {
            setTimeout(() => onSwitchToArticle(), 500);
          }
        }
      }

      if (finalArticleContent) {
        const completionMessage: Message = {
          role: "ai",
          content: `**Article completed**\n\nYour article is ready in the preview panel.${
            isMobile ? " Swipe or use the toggle to view it." : ""
          }`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, completionMessage]);
      } else if (lastAgentBeforeDone) {
        const agentMessage: Message = {
          role: "ai",
          content: lastAgentBeforeDone,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, agentMessage]);
      }

    } catch (error) {
      console.error("Stream error:", error);
      const errorMessage: Message = {
        role: "ai",
        content: "**An error occurred**\n\nPlease try again or rephrase your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setCurrentAgent(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream rounded-lg shadow-sm border border-border">
      <Header onNewSession={handleNewSession} isMobile={isMobile} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList 
          messages={chatHistory} 
          currentAgent={currentAgent}
          isStreaming={isStreaming}
          isMobile={isMobile}
        />
        
        <InputArea
          input={input}
          setInput={setInput}
          isStreaming={isStreaming}
          onSend={handleSend}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};