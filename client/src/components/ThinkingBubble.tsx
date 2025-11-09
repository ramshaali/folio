import React, { useEffect, useState } from 'react';

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

  // Animated dots
  useEffect(() => {
    if (!isActive) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const getAgentAction = (name: string): string => {
    const actions: { [key: string]: string } = {
      'extract_agent': 'Analyzing your request and extracting key elements',
      'websearch_agent': 'Searching the web for relevant information',
      'writer_agent': 'Crafting engaging content based on research',
      'refine_agent': 'Polishing and refining the article',
      'image_gen_agent': 'Generating visual assets',
      'content_creator_root_agent': 'Coordinating the editorial team'
    };
    return actions[name] || 'Processing';
  };

  // For extract_agent, don't show the actual text (like "google"), just show the action message
  const shouldShowText = agentName !== 'extract_agent' && agentText && agentText !== 'undefined';

  return (
    <div className="flex flex-row gap-2 animate-pulse">
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-500 text-white">
        ⚡
      </div>
      <div className="max-w-[70%] p-3 rounded-xl font-inter text-sm border border-gray-300 bg-gray-100">
        <div className="text-gray-700">
          <span className="font-semibold">{getAgentAction(agentName)}</span>
          {shouldShowText && (
            <>
              : <span className="text-gray-600">{agentText}</span>
            </>
          )}
          <span className="text-gray-400">{dots}</span>
        </div>
      </div>
    </div>
  );
};