import React, { useState, useRef, useEffect } from "react";
import { generateArticle, startNewSession, streamAgentOutputs } from "../apis/article";
import { FaPlus } from "react-icons/fa";

interface Message {
  role: "user" | "ai" | "system";
  content: string;
  timestamp: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [chatHistory]);

  const handleNewSession = async () => {
    const res = await startNewSession();
    if (res.status === 200) {
      setSessionId(res.data.session_id);
      setUserId(res.data.user_id);
      setChatHistory([]);
    } else {
      alert("Failed to start new session.");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input, timestamp: new Date().toLocaleTimeString() };
    setChatHistory((prev) => [...prev, userMessage]);
    setInput("");

    const aiPlaceholder: Message = { role: "ai", content: "🤔 The editorial board is reviewing...", timestamp: new Date().toLocaleTimeString() };
    setChatHistory((prev) => [...prev, aiPlaceholder]);

    // Stream response
    const generator = streamAgentOutputs(input, sessionId, userId);
    let collectedText = "";
    for await (const chunk of generator) {
      collectedText += chunk.text;
      setChatHistory((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...aiPlaceholder, content: collectedText };
        return copy;
      });
    }

    setCurrentArticle(collectedText);
  };

  return (
    <div className="flex flex-col h-full bg-secondary rounded-md border border-accent shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-accent bg-white">
        <div className="flex items-center gap-2 font-playfair text-accent text-2xl font-bold">
          Folio<span className="text-primary">.</span>
        </div>
        <button onClick={handleNewSession} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center gap-1">
          <FaPlus /> New Session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-2`}>
            <div className={`w-9 h-9 flex items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary text-white" : "bg-accent text-white"}`}>
              {msg.role === "user" ? "You" : "AI"}
            </div>
            <div className="max-w-[70%] p-3 rounded-xl font-inter text-sm border border-accent bg-white">
              {msg.content}
              <div className="text-xs text-muted mt-1 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 p-4 border-t border-accent bg-secondary flex gap-2">
        <textarea
          className="flex-1 p-2 border border-accent rounded-md font-inter text-sm"
          placeholder="Describe your article topic..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
        />
        <button onClick={handleSend} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">
          📨 Send
        </button>
      </div>
    </div>
  );
};
