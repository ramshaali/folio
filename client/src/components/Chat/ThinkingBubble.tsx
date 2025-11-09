import React, { useEffect, useState } from 'react';
import { FaSearch, FaEdit, FaCog, FaPalette, FaSync } from "react-icons/fa";

interface ThinkingBubbleProps {
  agentName: string;
  agentText: string;
  isActive: boolean;
  isMobile?: boolean;
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({
  agentName,
  agentText,
  isActive,
  isMobile = false
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isActive) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => prev === '...' ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const getAgentConfig = (name: string) => {
    const config: { [key: string]: { action: string; icon: React.ReactNode; color: string } } = {
      'extract_agent': {
        action: 'Analyzing request and extracting key elements',
        icon: <FaCog className="text-sm" />,
        color: 'text-warm-gray'
      },
      'websearch_agent': {
        action: 'Researching and gathering information',
        icon: <FaSearch className="text-sm" />,
        color: 'text-gold'
      },
      'writer_agent': {
        action: 'Composing article content',
        icon: <FaEdit className="text-sm" />,
        color: 'text-charcoal'
      },
      'refine_agent': {
        action: 'Refining and polishing content',
        icon: <FaPalette className="text-sm" />,
        color: 'text-burgundy'
      },
      'image_gen_agent': {
        action: 'Preparing visual elements',
        icon: <FaPalette className="text-sm" />,
        color: 'text-gold'
      },
      'content_creator_root_agent': {
        action: 'Orchestrating editorial workflow',
        icon: <FaSync className="text-sm" />,
        color: 'text-charcoal'
      }
    };
    return config[name] || { action: 'Processing', icon: <FaCog />, color: 'text-warm-gray' };
  };

  const { action, icon, color } = getAgentConfig(agentName);
  const shouldShowText = agentName !== 'extract_agent' && agentText && agentText !== 'undefined';

  return (
    <div className={`flex items-start gap-3 lg:gap-4 animate-fade-in-up ${isMobile ? 'text-sm' : ''
      }`}>
      {/* Agent Icon */}
      <div className={`flex-shrink-0 flex items-center justify-center rounded-full bg-light-gray ${color} ${isMobile ? 'w-7 h-7' : 'w-8 h-8'
        }`}>
        {icon}
      </div>

      {/* Thinking Content */}
      <div className={`flex-1 bg-white rounded-lg border-l-2 lg:border-l-4 border-gold shadow-sm ${isMobile ? 'p-3' : 'p-4'
        }`}>
        <div className="flex items-center gap-2 text-charcoal font-inter">
          <span className="font-medium">{action}</span>
          <span className="text-warm-gray animate-pulse-subtle">{dots}</span>
        </div>

        {/* Agent Text Preview */}
        {shouldShowText && (
          <div className={`mt-2 bg-cream rounded border border-border text-warm-gray font-lora leading-relaxed ${isMobile ? 'p-2 text-xs' : 'p-3 text-sm'
            }`}>
            {agentText.length > (isMobile ? 120 : 200)
              ? agentText.substring(0, isMobile ? 120 : 200) + '...'
              : agentText
            }
          </div>
        )}
      </div>
    </div>
  );
};