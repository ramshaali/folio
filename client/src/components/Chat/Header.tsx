import React, { useState } from 'react';
import { FaRegFileAlt } from "react-icons/fa";

interface HeaderProps {
  onNewSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewSession }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="flex justify-between items-center p-6 border-b border-border bg-gold/5 ">
      <div className="flex items-center gap-3">
        {!logoError ? (
          <img 
            src="/assets/logo-sm.png" 
            alt="Folio Logo" 
            className="h-10 w-auto"
            onError={() => setLogoError(true)}
          />
        ) : (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold text-cream">
              <FaRegFileAlt className="text-lg" />
            </div>
            <div>
              <h1 className="font-playfair text-charcoal text-2xl font-bold leading-tight">
                Folio
              </h1>
              <p className="font-inter text-warm-gray text-sm">Article AI Assistant</p>
            </div>
          </>
        )}
      </div>
      
      <button 
        onClick={onNewSession}
        className="p-3 rounded-lg bg-gold text-cream hover:bg-gold/90 shadow-sm transform hover:scale-105 transition-all duration-200"
        title="New Session"
      >
        <FaRegFileAlt className="text-lg" />
      </button>
    </div>
  );
};