import React, { useState, useEffect } from 'react';
import { 
  FaMedium, 
  FaLinkedin, 
  FaTwitter, 
  FaCopy, 
  FaCheck,
  FaGhost,
  FaDev,
  FaTimes
} from 'react-icons/fa';

interface ShareOptionsProps {
  articleContent: string | null;
  onClose: () => void;
  isMobile?: boolean;
}

export const ShareOptions: React.FC<ShareOptionsProps> = ({
  articleContent,
  onClose,
  isMobile = false
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setShowOptions(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stripMarkdown = (content: string): string => {
    return content
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/>\s/g, '') // Remove blockquotes
      .replace(/\n{3,}/g, '\n\n') // Normalize newlines
      .trim();
  };

  const handleCopy = async () => {
    if (!articleContent) return;

    try {
      const plainText = stripMarkdown(articleContent);
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sharePlatforms = [
    {
      name: 'Medium',
      icon: FaMedium,
      url: 'https://medium.com/new-story',
      color: 'hover:text-black'
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: 'https://www.linkedin.com/posts/new',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: 'https://twitter.com/intent/tweet',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Ghost',
      icon: FaGhost,
      url: 'https://ghost.org/',
      color: 'hover:text-purple-600'
    },
    {
      name: 'Dev.to',
      icon: FaDev,
      url: 'https://dev.to/new',
      color: 'hover:text-gray-800'
    }
  ];

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end justify-center ${
      isMobile ? 'p-4' : 'p-8'
    }`}>
      <div 
        className={`bg-white rounded-t-2xl lg:rounded-2xl shadow-xl border border-border transform transition-all duration-300 ${
          showOptions 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-full opacity-0'
        } ${
          isMobile ? 'w-full max-w-md' : 'w-96'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-playfair text-charcoal font-semibold">
            Share Article
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-light-gray transition-colors"
          >
            <FaTimes className="text-warm-gray text-sm" />
          </button>
        </div>

        {/* Copy Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-sm text-charcoal font-medium">
                Copy article content
              </p>
              <p className="font-inter text-xs text-warm-gray mt-1">
                Ready to paste into any editor
              </p>
            </div>
            <button
              onClick={handleCopy}
              disabled={copied}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                copied
                  ? 'bg-gold/20 text-gold border border-gold'
                  : 'bg-gold text-cream hover:bg-gold/90 shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <FaCheck className="text-sm" />
                  <span className="font-inter text-sm font-medium">Copied</span>
                </>
              ) : (
                <>
                  <FaCopy className="text-sm" />
                  <span className="font-inter text-sm font-medium">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Platform Options */}
        <div className="p-4">
          <p className="font-inter text-sm text-warm-gray mb-3">
            Open editor on:
          </p>
          <div className={`grid gap-2 ${
            isMobile ? 'grid-cols-3' : 'grid-cols-2'
          }`}>
            {sharePlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.name}
                  onClick={() => handlePlatformClick(platform.url)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold hover:bg-gold/5 transition-all duration-200 group"
                >
                  <Icon className={`text-warm-gray group-hover:scale-110 transition-all duration-200 ${platform.color}`} />
                  <span className="font-inter text-sm text-charcoal font-medium">
                    {platform.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-cream/50 rounded-b-2xl lg:rounded-b-lg">
          <p className="font-inter text-xs text-warm-gray text-center">
            Content copied in plain text format
          </p>
        </div>
      </div>
    </div>
  );
};