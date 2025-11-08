import React from "react";

interface ArticlePanelProps {
  articleContent: string | null;
}

export const ArticlePanel: React.FC<ArticlePanelProps> = ({ articleContent }) => {
  return (
    <div className="flex flex-col h-full bg-secondary rounded-md border border-accent shadow-md overflow-hidden">
      <div className="p-4 border-b border-accent bg-white">
        <h3 className="text-accent font-playfair text-xl font-bold">Article Preview</h3>
        <p className="text-muted text-sm">Your refined content appears here</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-lora text-accent leading-relaxed">
        {articleContent ? (
          <div dangerouslySetInnerHTML={{ __html: articleContent }} />
        ) : (
          <div className="text-center text-muted p-20">
            <h3>No Article Yet</h3>
            <p>Start a conversation with the editorial board to generate your first article.</p>
          </div>
        )}
      </div>
    </div>
  );
};
