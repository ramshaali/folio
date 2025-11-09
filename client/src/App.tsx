import React, { useState } from "react";
import { ChatPanel } from "./components/Chat/ChatPanel";
import { ArticlePanel } from "./components/ArticlePanel";

const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<string | null>(null);

  return (
    <div className="h-screen flex gap-6 p-6 bg-cream">
      <div className="flex-4 flex flex-col h-full">
        <ChatPanel
          sessionId={sessionId}
          userId={userId}
          setSessionId={setSessionId}
          setUserId={setUserId}
          setCurrentArticle={setCurrentArticle}
        />
      </div>
      <div className="flex-6 flex flex-col h-full">
        <ArticlePanel articleContent={currentArticle} />
      </div>
    </div>
  );
};

export default App;