import React, { useState, useEffect } from "react";
import { startNewSession, streamAgentOutputs } from "../../apis/article";
import { Header } from "./Header";
import { MessageList } from "./MessageList";
import { InputArea } from "./InputArea";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: string;
  type?: "normal" | "text" | "question"; // Added type for different message styles
}

interface AgentStep {
  agent_name: string;
  article?: string;
  text?: string;
  question?: string;
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
  onNewSession: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  sessionId,
  userId,
  setSessionId,
  setUserId,
  setCurrentArticle,
  isMobile = false,
  onSwitchToArticle,
  onNewSession,
}) => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<{ name: string, text: string } | null>(null);
  const [lastNonWriterResponse, setLastNonWriterResponse] = useState<{ content: string, type: "normal" | "text" | "question" }>({ content: "", type: "normal" });

  // Load chat history from localStorage if session exists
  useEffect(() => {
    if (sessionId) {
      const savedChatHistory = localStorage.getItem(`folio_chatHistory_${sessionId}`);
      if (savedChatHistory) {
        try {
          setChatHistory(JSON.parse(savedChatHistory));
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      }
    } else {
      setChatHistory([]);
    }
  }, [sessionId]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (sessionId && chatHistory.length > 0) {
      localStorage.setItem(`folio_chatHistory_${sessionId}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, sessionId]);

  const handleStartNewSession = async () => {
    try {
      const res = await startNewSession();
      if (res.status === 200) {
        setSessionId(res.data.session_id);
        setUserId(res.data.user_id);
        setChatHistory([]);
        setCurrentAgent(null);
        setLastNonWriterResponse({ content: "", type: "normal" });
        setCurrentArticle(null);

        // Clear previous session's chat history
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('folio_chatHistory_')) {
            localStorage.removeItem(key);
          }
        });
      } else {
        alert("Failed to start new session.");
      }
    } catch (error) {
      console.error('Error starting new session:', error);
      alert("Failed to start new session.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    // If no session exists, create one first
    let currentSessionId = sessionId;
    let currentUserId = userId;

    if (!currentSessionId || !currentUserId) {
      try {
        const res = await startNewSession();
        if (res.status === 200) {
          currentSessionId = res.data.session_id;
          currentUserId = res.data.user_id;
          setSessionId(currentSessionId as string);
          setUserId(currentUserId as string);

          // Clear any previous article when starting new session
          setCurrentArticle(null);
        } else {
          alert("Failed to start session.");
          return;
        }
      } catch (error) {
        console.error('Error starting session:', error);
        alert("Failed to start session.");
        return;
      }
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setCurrentAgent(null);
    setLastNonWriterResponse({ content: "", type: "normal" });

    let finalArticleContent = "";
    let lastAgentBeforeDone: { content: string, type: "normal" | "text" | "question" } = { content: "", type: "normal" };

    try {
      const generator = streamAgentOutputs(input, currentSessionId, currentUserId);

      for await (const chunk of generator) {
        if (chunk.status === "done") {
          break;
        }

        // Handle different output keys
        if (chunk.article) {
          // Article content - send to article panel
          finalArticleContent = chunk.article;
          setCurrentArticle(chunk.article);

          // Auto-switch to article on mobile when article is ready
          if (isMobile && onSwitchToArticle) {
            setTimeout(() => onSwitchToArticle(), 500);
          }
        } else if (chunk.text || chunk.question) {
          // Text or question content - show in thinking bubble
          const content = chunk.text || chunk.question;
          const type = chunk.text ? "text" : "question";

          setCurrentAgent({
            name: chunk.agent_name,
            text: content
          });

          if (chunk.agent_name !== "writer_agent") {
            setLastNonWriterResponse({ content, type });
            lastAgentBeforeDone = { content, type };
          }
        }
      }

      // After streaming completes, add final message to chat history
      if (finalArticleContent) {
        const completionMessage: Message = {
          role: "ai",
          content: `**Article completed**\n\nYour article is ready in the preview panel.${isMobile ? " Swipe or use the toggle to view it." : ""}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, completionMessage]);
      } else if (lastAgentBeforeDone.content) {
        const agentMessage: Message = {
          role: "ai",
          content: lastAgentBeforeDone.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: lastAgentBeforeDone.type
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
      <Header
        onNewSession={onNewSession}
        isMobile={isMobile}
        hasActiveSession={!!sessionId}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList
          messages={chatHistory}
          currentAgent={currentAgent}
          isStreaming={isStreaming}
          isMobile={isMobile}
          sessionId={sessionId}
        />

        <InputArea
          input={input}
          setInput={setInput}
          isStreaming={isStreaming}
          onSend={handleSend}
          isMobile={isMobile}
          hasActiveSession={!!sessionId}
        />
      </div>
    </div>
  );
};