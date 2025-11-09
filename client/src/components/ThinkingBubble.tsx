import React, { useEffect, useState } from 'react';
import { FaSearch, FaEdit, FaCog, FaPalette, FaSync } from "react-icons/fa";

interface ThinkingBubbleProps {
  agentName: string;
  agentText: string;
  isActive: boolean;
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ 
  agentName, 
  agentText, 
  isActive 
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
    <div className="flex items-start gap-4 animate-fade-in-up">
      <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-light-gray ${color}`}>
        {icon}
      </div>
      
      <div className="flex-1 bg-white rounded-lg p-4 border-l-4 border-gold shadow-sm">
        <div className="flex items-center gap-2 text-charcoal font-inter text-sm">
          <span className="font-medium">{action}</span>
          <span className="text-warm-gray animate-pulse-subtle">{dots}</span>
        </div>
        
        {shouldShowText && (
          <div className="mt-2 p-3 bg-cream rounded border border-border text-sm text-warm-gray font-lora leading-relaxed">
            {agentText}
          </div>
        )}
      </div>
    </div>
  );
};