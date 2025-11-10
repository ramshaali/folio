import React, { useState, useEffect, useRef } from 'react';
import {
    FaCopy,
    FaCheck,
    FaShare,
    FaMedium,
    FaLinkedin,
    FaWordpress,
    FaGhost,
    FaDev,
    FaEllipsisV
} from 'react-icons/fa';
import { SiBlogger } from "react-icons/si";

interface ArticleActionsProps {
    articleContent: string | null;
    isMobile?: boolean;
}

export const ArticleActions: React.FC<ArticleActionsProps> = ({
    articleContent,
    isMobile = false
}) => {
    const [copied, setCopied] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowShareOptions(false);
                setShowMobileMenu(false);
            }
        };

        if (showShareOptions || showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showShareOptions, showMobileMenu]);

    // Auto-hide copied state
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const stripMarkdown = (content: string): string => {
        return content
            .replace(/^#+\s+/gm, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/>\s/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    };

    const handleCopy = async () => {
        if (!articleContent) return;

        try {
            const plainText = stripMarkdown(articleContent);
            await navigator.clipboard.writeText(plainText);
            setCopied(true);
            setShowMobileMenu(false);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const sharePlatforms = [
        {
            name: 'Medium',
            icon: FaMedium,
            url: 'https://medium.com/new-story',
            color: 'bg-black'
        },
        {
            name: 'LinkedIn',
            icon: FaLinkedin,
            url: 'https://www.linkedin.com/posts/new',
            color: 'bg-blue-600'
        },
        {
            name: 'WordPress',
            icon: FaWordpress,
            url: 'https://wordpress.com/post',
            color: 'bg-blue-800'
        },
        {
            name: 'Ghost',
            icon: FaGhost,
            url: 'https://ghost.org/',
            color: 'bg-purple-600'
        },
        {
            name: 'Dev.to',
            icon: FaDev,
            url: 'https://dev.to/new',
            color: 'bg-gray-800'
        },
        {
            name: 'Blogger',
            icon: SiBlogger,
            url: 'https://www.blogger.com/blog/post/edit/',
            color: 'bg-orange-500'
        }
    ];

    const handlePlatformClick = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setShowShareOptions(false);
        setShowMobileMenu(false);
    };

    if (!articleContent) return null;

    // Mobile View - Three dots menu
    if (isMobile) {
        return (
            <div ref={containerRef} className="absolute top-4 right-4">
                {/* Mobile Menu Button */}
                <div className="relative group">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="w-9 h-9 rounded-md flex items-center justify-center transition-all duration-300 border border-border text-warm-gray hover:border-gold hover:text-gold bg-cream hover:bg-gold/5"
                    >
                        <FaEllipsisV className="text-xs" />
                    </button>

                    {/* Mobile Dropdown Menu */}
                    {showMobileMenu && (
                        <div className="absolute right-0 top-10 bg-cream border border-border rounded-md shadow-lg py-2 min-w-40 z-50">
                            {/* Copy Option */}
                            <button
                                onClick={handleCopy}
                                className="w-full px-4 py-2 text-sm text-charcoal hover:bg-cream flex items-center gap-3 transition-colors bg-cream"
                            >
                                {copied ? (
                                    <FaCheck className="text-gold text-xs" />
                                ) : (
                                    <FaCopy className="text-xs" />
                                )}
                                <span>{copied ? 'Copied!' : 'Copy Article'}</span>
                            </button>

                            {/* Share Option */}
                            <button
                                onClick={() => setShowShareOptions(!showShareOptions)}
                                className="w-full px-4 py-2 text-sm text-charcoal hover:bg-cream flex items-center gap-3 transition-colors border-t border-border bg-cream"
                            >
                                <FaShare className="text-xs" />
                                <span>Share</span>
                            </button>

                            {/* Share Platforms Submenu */}
                            {showShareOptions && (
                                <div className="border-t border-border bg-cream/30">
                                    {sharePlatforms.map((platform) => {
                                        const Icon = platform.icon;
                                        return (
                                            <button
                                                key={platform.name}
                                                onClick={() => handlePlatformClick(platform.url)}
                                                className="w-full px-4 py-2 text-sm text-charcoal hover:bg-cream flex items-center gap-3 transition-colors bg-cream"
                                            >
                                                <Icon className="text-xs" />
                                                <span className='text-start'>Share to {platform.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop View - Updated with non-transparent buttons
    return (
        <div ref={containerRef} className="absolute top-4 right-4">
            <div className="flex flex-col gap-2 items-end">
                {/* Copy Button */}
                <div className="relative group">
                    <button
                        onClick={handleCopy}
                        className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-300 border bg-cream ${
                            copied
                                ? 'border-gold text-gold scale-110'
                                : 'border-border text-warm-gray hover:border-gold hover:text-gold'
                        }`}
                    >
                        {copied ? (
                            <FaCheck className="text-xs" />
                        ) : (
                            <FaCopy className="text-xs" />
                        )}
                    </button>

                    {/* Tooltip */}
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-charcoal text-cream text-xs font-inter px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                        {copied ? 'Copied!' : 'Copy article'}
                    </div>
                </div>

                {/* Share Button - Expanding */}
                <div className="relative group">
                    {/* The actual expanding container */}
                    <div
                        className={`flex flex-col items-center transition-all duration-500 border rounded-md overflow-hidden bg-cream ${
                            showShareOptions
                                ? 'h-[255px] w-9 border-gold shadow-sm'
                                : 'h-9 w-9 border-border'
                        }`}
                    >
                        {/* Share Toggle - Always at top */}
                        <button
                            onClick={() => setShowShareOptions(!showShareOptions)}
                            className={`w-9 h-9 mt-1 p-2 flex items-center justify-center transition-colors duration-300 bg-cream ${
                                showShareOptions ? 'text-gold' : 'text-warm-gray hover:text-gold'
                            }`}
                        >
                            <FaShare className="text-xs" />
                        </button>

                        {/* Platform Icons - Inside the expanded container */}
                        <div className={`flex flex-col gap-2 py-2 transition-all duration-300 ${
                            showShareOptions ? 'opacity-100' : 'opacity-0'
                        }`}>
                            {sharePlatforms.map((platform) => {
                                const Icon = platform.icon;
                                return (
                                    <button
                                        key={platform.name}
                                        onClick={() => handlePlatformClick(platform.url)}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition-transform duration-200 hover:scale-110 ${platform.color}`}
                                        title={platform.name}
                                    >
                                        <Icon className="text-xs" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tooltip - Only when collapsed */}
                    {!showShareOptions && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-charcoal text-cream text-xs font-inter px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                            Share to platforms
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};