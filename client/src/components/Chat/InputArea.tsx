import React, { useRef, useEffect } from 'react';
import { FaArrowUp } from "react-icons/fa";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  onSend: () => void;
  isMobile?: boolean;
  hasActiveSession?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  isStreaming,
  onSend,
  isMobile = false,
  hasActiveSession = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = isMobile ? 100 : 120;
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + 'px';
    }
  }, [input, isMobile]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`border-t border-border bg-cream ${
      isMobile ? 'p-3' : 'p-4 lg:p-6'
    }`}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={`w-full border border-border rounded-lg font-inter text-charcoal bg-white resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all duration-200 placeholder-warm-gray/60 ${
            isMobile 
              ? 'p-3 pr-12 text-sm min-h-[50px] max-h-[100px]' 
              : 'p-4 pr-14 text-base lg:text-sm min-h-[60px] max-h-[120px]'
          }`}
          placeholder={
            hasActiveSession 
              ? "Continue your conversation..." 
              : "Describe your article topic..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={isStreaming}
        />
        
        {/* Send Button */}
        <button 
          onClick={onSend}
          disabled={isStreaming || !input.trim()}
          className={`absolute transition-all duration-200 ${
            isMobile
              ? 'right-2 bottom-2 p-1.5 rounded-md'
              : 'right-3 bottom-3 p-2 rounded-lg'
          } ${
            isStreaming || !input.trim()
              ? 'bg-light-gray text-warm-gray cursor-not-allowed'
              : 'bg-gold text-cream hover:bg-gold/90 shadow-sm transform hover:scale-105'
          }`}
        >
          <FaArrowUp className={isMobile ? "text-xs" : "text-sm"} />
        </button>
      </div>
      
      {/* Helper Text */}
      <div className={`text-warm-gray text-center font-inter text-xs ${
        isMobile ? 'mt-2' : ' mt-3'
      }`}>
        {isStreaming 
          ? "Editorial team is working..." 
          : isMobile 
            ? "Enter to send" 
            : "Enter to send • Shift+Enter for new line"
        }
      </div>
    </div>
  );
};