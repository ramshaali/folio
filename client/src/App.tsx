import React, { useState, useEffect } from "react";
import { ChatPanel } from "./components/Chat/ChatPanel";
import { ArticlePanel } from "./components/Article/ArticlePanel";
import { FaExchangeAlt } from "react-icons/fa";

const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "article">("chat");
  const [isMobile, setIsMobile] = useState(false);

  // Load session and article from localStorage on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('folio_sessionId');
    const savedUserId = localStorage.getItem('folio_userId');
    const savedArticle = savedSessionId ? localStorage.getItem(`folio_article_${savedSessionId}`) : null;

    if (savedSessionId && savedUserId) {
      setSessionId(savedSessionId);
      setUserId(savedUserId);

      // Restore article content if it exists
      if (savedArticle) {
        setCurrentArticle(savedArticle);
      }
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (sessionId && userId) {
      localStorage.setItem('folio_sessionId', sessionId);
      localStorage.setItem('folio_userId', userId);
    } else {
      localStorage.removeItem('folio_sessionId');
      localStorage.removeItem('folio_userId');
    }
  }, [sessionId, userId]);

  // Save article content whenever it changes
  useEffect(() => {
    if (sessionId && currentArticle) {
      localStorage.setItem(`folio_article_${sessionId}`, currentArticle);
    } else if (sessionId && currentArticle === null) {
      // Clear article if it's explicitly set to null
      localStorage.removeItem(`folio_article_${sessionId}`);
    }
  }, [currentArticle, sessionId]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

  const handleNewSession = () => {
    // Clear current session data from localStorage
    if (sessionId) {
      localStorage.removeItem(`folio_chatHistory_${sessionId}`);
      localStorage.removeItem(`folio_article_${sessionId}`);
    }

    // Clear both state and localStorage
    setSessionId(null);
    setUserId(null);
    setCurrentArticle(null);
    setActiveView("chat");

    localStorage.removeItem('folio_sessionId');
    localStorage.removeItem('folio_userId');
  };

  const handleSetCurrentArticle = (article: string | null) => {
    setCurrentArticle(article);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6 bg-cream">
      {/* Chat Panel */}
      <div className={`flex-4 flex flex-col h-full ${isMobile ? (activeView === "chat" ? "flex" : "hidden") : "flex"
        }`}>
        <ChatPanel
          sessionId={sessionId}
          userId={userId}
          setSessionId={setSessionId}
          setUserId={setUserId}
          setCurrentArticle={handleSetCurrentArticle}
          isMobile={isMobile}
          onSwitchToArticle={() => setActiveView("article")}
          onNewSession={handleNewSession}
        />
      </div>

      {/* Article Panel */}
      <div className={`flex-6 flex flex-col h-full ${isMobile ? (activeView === "article" ? "flex" : "hidden") : "flex"
        }`}>
        <ArticlePanel
          articleContent={currentArticle}
          isMobile={isMobile}
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