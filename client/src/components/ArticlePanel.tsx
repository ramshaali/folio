import React from "react";
import ReactMarkdown from 'react-markdown';
import { FaFileAlt, FaEdit } from "react-icons/fa";

interface ArticlePanelProps {
  articleContent: string | null;
}

export const ArticlePanel: React.FC<ArticlePanelProps> = ({ articleContent }) => {
  // Extract the first line as title and the rest as content
  const getArticleTitleAndContent = (content: string) => {
    const lines = content.split('\n');
    const firstLine = lines[0]?.trim() || '';
    const remainingContent = lines.slice(1).join('\n').trim();
    
    return { title: firstLine, content: remainingContent };
  };

  const { title, content } = articleContent ? getArticleTitleAndContent(articleContent) : { title: '', content: '' };

  return (
    <div className="flex flex-col h-full bg-secondary rounded-md border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
          <FaFileAlt className="text-lg" />
        </div>
        <div>
          <h3 className="text-gray-900 font-playfair text-xl font-bold">Article Preview</h3>
          <p className="text-gray-500 text-sm">Your generated content appears here</p>
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto">
        {articleContent ? (
          <div className="p-6">
            {/* Title Section */}
            {title && (
              <div className="mb-8 pb-6 border-b border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 font-playfair leading-tight">
                  {title.replace(/^#+\s*/, '')} {/* Remove markdown headers if present */}
                </h1>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <FaEdit className="text-xs" />
                  <span>Generated Article</span>
                </div>
              </div>
            )}
            
            {/* Content Section */}
            <div className="prose prose-lg max-w-none font-lora text-gray-700 leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 font-playfair" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 font-playfair" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-800 mt-5 mb-2 font-playfair" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 leading-7" {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-4 pl-6 list-disc" {...props} />,
                  ol: ({node, ...props}) => <ol className="mb-4 pl-6 list-decimal" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-4" {...props} />,
                }}
              >
                {content || articleContent}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center p-12 h-full flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400 mb-6">
              <FaFileAlt className="text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2 font-playfair">No Article Generated</h3>
            <p className="text-gray-500 max-w-sm">
              Start a conversation with the editorial board to create your first article.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};