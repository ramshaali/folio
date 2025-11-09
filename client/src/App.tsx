import React, { useState, useEffect } from "react";
import { ChatPanel } from "./components/Chat/ChatPanel";
import { ArticlePanel } from "./components/ArticlePanel";
import { FaComments, FaFileAlt, FaExchangeAlt } from "react-icons/fa";

const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "article">("chat");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-switch to article view when article is generated on mobile
  useEffect(() => {
    if (currentArticle && isMobile) {
      setActiveView("article");
    }
  }, [currentArticle, isMobile]);

  return (
    <div className="h-screen flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6 bg-cream">
      {/* Mobile Header with Toggle */}
      {/* {isMobile && (
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h1 className="font-playfair text-charcoal text-xl font-bold">Folio</h1>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-border">
            <button
              onClick={() => setActiveView("chat")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                activeView === "chat" 
                  ? "bg-gold text-cream shadow-sm" 
                  : "text-warm-gray hover:text-charcoal"
              }`}
            >
              <FaComments className="text-sm" />
              <span className="text-sm font-medium">Chat</span>
            </button>
            <button
              onClick={() => setActiveView("article")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                activeView === "article" 
                  ? "bg-gold text-cream shadow-sm" 
                  : "text-warm-gray hover:text-charcoal"
              }`}
              disabled={!currentArticle}
            >
              <FaFileAlt className="text-sm" />
              <span className="text-sm font-medium">Article</span>
            </button>
          </div>
        </div>
      )} */}

      {/* Chat Panel */}
      <div className={`flex-4 flex flex-col h-full ${
        isMobile ? (activeView === "chat" ? "flex" : "hidden") : "flex"
      }`}>
        <ChatPanel
          sessionId={sessionId}
          userId={userId}
          setSessionId={setSessionId}
          setUserId={setUserId}
          setCurrentArticle={setCurrentArticle}
          isMobile={isMobile}
          onSwitchToArticle={() => setActiveView("article")}
        />
      </div>

      {/* Article Panel */}
      <div className={`flex-6 flex flex-col h-full ${
        isMobile ? (activeView === "article" ? "flex" : "hidden") : "flex"
      }`}>
        <ArticlePanel 
          articleContent={currentArticle} 
          isMobile={isMobile}
          onSwitchToChat={() => setActiveView("chat")}
        />
      </div>

      {/* Mobile Floating Action Button for Quick Switch */}
      {isMobile && currentArticle && (
        <button
          onClick={() => setActiveView(activeView === "chat" ? "article" : "chat")}
          className="lg:hidden fixed bottom-6 left-6 w-12 h-12 bg-gold/90 text-cream rounded-full shadow-lg flex items-center justify-center hover:bg-gold/80 transform hover:scale-110 transition-all duration-200 z-10"
          title={`Switch to ${activeView === "chat" ? "article" : "chat"}`}
        >
          <FaExchangeAlt className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default App;