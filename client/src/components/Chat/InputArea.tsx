import React, { useRef, useEffect } from 'react';
import { FaArrowUp } from "react-icons/fa";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  onSend: () => void;
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  setInput,
  isStreaming,
  onSend,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-6 border-t border-border bg-cream">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full p-4 pr-14 border border-border rounded-lg font-inter text-charcoal bg-white resize-none focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all duration-200 placeholder-warm-gray/60"
          placeholder="Describe your article topic or provide specific instructions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
          disabled={isStreaming}
          style={{
            minHeight: '60px',
            maxHeight: '120px'
          }}
        />
        
        <button 
          onClick={onSend}
          disabled={isStreaming || !input.trim()}
          className={`absolute right-4 bottom-4 p-2 rounded-lg transition-all duration-200 ${
            isStreaming || !input.trim()
              ? 'bg-light-gray text-warm-gray cursor-not-allowed'
              : 'bg-gold text-cream hover:bg-gold/90 shadow-sm transform hover:scale-105'
          }`}
        >
          <FaArrowUp className="text-sm" />
        </button>
      </div>
      
      <div className="text-xs text-warm-gray text-center mt-3 font-inter">
        {isStreaming ? "Editorial team is working..." : "Enter to send • Shift+Enter for new line"}
      </div>
    </div>
  );
};