import React from "react";
import ReactMarkdown from 'react-markdown';

interface ArticlePanelProps {
  articleContent: string | null;
}

export const ArticlePanel: React.FC<ArticlePanelProps> = ({ articleContent }) => {
  return (
    <div className="flex flex-col h-full bg-secondary rounded-md border border-accent shadow-md overflow-hidden">
      <div className="p-4 border-b border-accent bg-white">
        <h3 className="text-accent font-playfair text-xl font-bold">Article Preview</h3>
        <p className="text-muted text-sm">Your article will appear here</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {articleContent ? (
          <div className="prose prose-lg max-w-none font-lora text-accent leading-relaxed">
            <ReactMarkdown>{articleContent}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center text-muted p-20 h-full flex items-center justify-center">
            <div>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No Article Yet</h3>
              <p>Start a conversation to generate your first article.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};