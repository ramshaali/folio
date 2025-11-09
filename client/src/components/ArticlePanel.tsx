import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { FaFileAlt, FaPenNib, FaShare } from "react-icons/fa";
import { ShareOptions } from "./ShareOptions";

interface ArticlePanelProps {
  articleContent: string | null;
  isMobile?: boolean;
}

export const ArticlePanel: React.FC<ArticlePanelProps> = ({
  articleContent,
  isMobile = false,
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const getArticleTitleAndContent = (content: string) => {
    const lines = content.split('\n');
    const firstLine = lines[0]?.trim() || '';
    const remainingContent = lines.slice(1).join('\n').trim();

    return { title: firstLine, content: remainingContent };
  };

  const { title, content } = articleContent ? getArticleTitleAndContent(articleContent) : { title: '', content: '' };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border bg-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gold text-cream">
            <FaFileAlt className="text-lg lg:text-xl" />
          </div>
          <div>
            <h2 className="font-playfair text-charcoal text-xl lg:text-2xl font-bold">Article</h2>
            <p className="font-inter text-warm-gray text-sm">Editorial preview</p>
          </div>
        </div>

        {/* Share Button - Only show when article exists */}
        {articleContent && (
          <button
            onClick={() => setShowShareOptions(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cream text-charcoal hover:bg-light-gray border border-border hover:border-warm-gray transition-all duration-200"
          >
            <FaShare className="text-sm" />
            <span className="font-inter text-sm font-medium">Share</span>
          </button>
        )}
      </div>

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto">
        {articleContent ? (
          <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            {/* Title Section */}
            {title && (
              <div className="mb-6 lg:mb-12 pb-6 lg:pb-8 border-b border-border">
                <h1 className="text-2xl lg:text-4xl font-bold text-charcoal font-playfair leading-tight tracking-tight mb-4">
                  {title.replace(/^#+\s*/, '')}
                </h1>
                <div className="flex items-center gap-2 text-warm-gray font-inter text-sm">
                  <FaPenNib className="text-xs" />
                  <span>Generated Article • {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            )}
            
            {/* Content Section */}
            <div className="prose prose-sm lg:prose-lg max-w-none font-lora text-charcoal leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-xl lg:text-3xl font-bold text-charcoal mt-8 mb-4 lg:mt-12 lg:mb-6 font-playfair border-b border-border pb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg lg:text-2xl font-bold text-charcoal mt-6 mb-3 lg:mt-10 lg:mb-4 font-playfair" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base lg:text-xl font-bold text-charcoal mt-4 mb-2 lg:mt-8 lg:mb-3 font-playfair" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4 lg:mb-6 leading-7 text-charcoal/90" {...props} />,
                  ul: ({ node, ...props }) => <ul className="mb-4 lg:mb-6 pl-4 lg:pl-6 list-disc space-y-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="mb-4 lg:mb-6 pl-4 lg:pl-6 list-decimal space-y-2" {...props} />,
                  li: ({ node, ...props }) => <li className="leading-6 lg:leading-7" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gold pl-4 lg:pl-6 italic text-warm-gray my-4 lg:my-6 py-2 bg-cream/50" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-charcoal" {...props} />,
                }}
              >
                {content || articleContent}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center p-8 lg:p-16 h-full flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-cream text-warm-gray mb-6 lg:mb-8 border border-border">
              <FaFileAlt className="text-2xl lg:text-3xl" />
            </div>
            <h3 className="text-lg lg:text-2xl font-semibold text-charcoal mb-3 font-playfair">No Article Generated</h3>
            <p className="text-warm-gray max-w-sm text-sm lg:text-base font-lora leading-relaxed">
              {isMobile ? "Switch to chat to generate your first article." : "Start a conversation to generate your first article."}
            </p>
          </div>
        )}
      </div>

      {/* Share Options Modal */}
      {showShareOptions && (
        <ShareOptions
          articleContent={articleContent}
          onClose={() => setShowShareOptions(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};