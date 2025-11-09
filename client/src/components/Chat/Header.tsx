import React, { useState } from 'react';
import { FaRegFileAlt } from "react-icons/fa";

interface HeaderProps {
    onNewSession: () => void;
    isMobile?: boolean;
    hasActiveSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    onNewSession,
    isMobile = false,
    hasActiveSession = false
}) => {
    const [logoError, setLogoError] = useState(false);

    return (
        <div className="flex justify-between items-center p-4 lg:p-6 border-b border-border bg-gold/5">
            <div className="flex items-center gap-3">
                {!logoError ? (
                    <img
                        src="/assets/logo-sm.png"
                        alt="Folio Logo"
                        className="h-8 lg:h-10 w-auto"
                        onError={() => setLogoError(true)}
                    />
                ) : (
                    <>
                        <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gold text-cream">
                            <FaRegFileAlt className="text-base lg:text-lg" />
                        </div>
                        <div>
                            <h1 className="font-playfair text-charcoal text-xl lg:text-2xl font-bold leading-tight">
                                Folio
                            </h1>
                            <p className="font-inter text-warm-gray text-xs lg:text-sm">
                                {isMobile ? "AI Assistant" : "Editorial Assistant"}
                            </p>
                        </div>
                    </>
                )}

                {/* Session Status Indicator */}
                {hasActiveSession && (
                    <div className="flex items-center gap-1 bg-light-gray rounded-full px-2 py-1">
                        <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                        <span className="text-xs text-warm-gray font-inter">Active</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onNewSession}
                    className="p-2 lg:p-3 rounded-lg bg-gold text-cream hover:bg-gold/90 shadow-sm transform hover:scale-105 transition-all duration-200"
                    title="New Session"
                >
                    <FaRegFileAlt className="text-base lg:text-lg" />
                </button>
            </div>
        </div>
    );
};