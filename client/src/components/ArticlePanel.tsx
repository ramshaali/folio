import React from "react";
import ReactMarkdown from 'react-markdown';
import { FaFileAlt, FaPenNib } from "react-icons/fa";

interface ArticlePanelProps {
  articleContent: string | null;
}

export const ArticlePanel: React.FC<ArticlePanelProps> = ({ articleContent }) => {
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
      {/* <div className="flex items-center gap-4 p-6 border-b border-border bg-cream">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gold text-cream">
          <FaFileAlt className="text-xl" />
        </div>
        <div>
          <h2 className="font-playfair text-charcoal text-2xl font-bold">Article</h2>
          <p className="font-inter text-warm-gray text-sm">Blogpost preview</p>
        </div>
      </div> */}

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto">
        {articleContent ? (
          <div className="p-8 max-w-4xl mx-auto">
            {/* Title Section */}
            {title && (
              <div className="mb-12 pb-8 border-b border-border">
                <h1 className="text-4xl font-bold text-charcoal font-playfair leading-tight tracking-tight mb-4">
                  {title.replace(/^#+\s*/, '')}
                </h1>
                <div className="flex items-center gap-2 text-warm-gray font-inter text-sm">
                  <FaPenNib className="text-xs" />
                  <span>Generated Article • {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            )}
            
            {/* Content Section */}
            <div className="prose prose-lg max-w-none font-lora text-charcoal leading-relaxed">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-charcoal mt-12 mb-6 font-playfair border-b border-border pb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-charcoal mt-10 mb-4 font-playfair" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold text-charcoal mt-8 mb-3 font-playfair" {...props} />,
                  p: ({node, ...props}) => <p className="mb-6 leading-8 text-charcoal/90" {...props} />,
                  ul: ({node, ...props}) => <ul className="mb-6 pl-6 list-disc space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="mb-6 pl-6 list-decimal space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="leading-7" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gold pl-6 italic text-warm-gray my-6 py-2 bg-cream/50" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-charcoal" {...props} />,
                }}
              >
                {content || articleContent}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center p-16 h-full flex flex-col items-center justify-center">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-cream text-warm-gray mb-8 border border-border">
              <FaFileAlt className="text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold text-charcoal mb-3 font-playfair">No Article Generated</h3>
            <p className="text-warm-gray max-w-sm font-lora leading-relaxed">
              Begin a conversation with the editorial assistant to create your first article.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};