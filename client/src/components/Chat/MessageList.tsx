import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ThinkingBubble } from '../ThinkingBubble';
import { FaExclamationTriangle } from "react-icons/fa";

interface Message {
    role: "user" | "ai";
    content: string;
    timestamp: string;
    type?: "normal" | "text" | "question";
}

interface MessageListProps {
    messages: Message[];
    currentAgent: { name: string; text: string } | null;
    isStreaming: boolean;
    isMobile?: boolean;
    sessionId: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    currentAgent,
    isStreaming,
    isMobile = false,
    sessionId,
}) => {
    const showWelcomeMessage = messages.length === 0 && !isStreaming;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentAgent]);

    const renderMessageContent = (content: string, role: "user" | "ai", type?: "normal" | "text" | "question") => {
        if (role === "ai") {
            if (type === "text") {
                // Warning block for text type
                return (
                    <div className="bg-error/10 border border-error text-error rounded-lg p-3 flex items-start gap-3 font-lora leading-relaxed">
                        <FaExclamationTriangle className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    </div>
                );
            } else {
                // Normal markdown for question and normal types
                return (
                    <div className="prose prose-sm max-w-none font-lora text-charcoal leading-relaxed">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                );
            }
        }
        return <div className="whitespace-pre-wrap font-inter text-charcoal leading-relaxed">{content}</div>;
    };

    return (
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3 space-y-4' : 'p-4 lg:p-6 space-y-4 lg:space-y-6'
            }`}>
            {showWelcomeMessage && (
                <div className="flex flex-row gap-3 lg:gap-4 animate-fade-in-up">
                    <div className={`flex-shrink-0 flex items-center justify-center rounded-full bg-charcoal text-cream ${isMobile ? 'w-7 h-7 text-xs' : 'w-8 h-8'}`}>
                        F
                    </div>
                    <div className={`flex-1 bg-white rounded-lg border-l-2 lg:border-l-4 border-gold shadow-sm ${isMobile ? 'p-3' : 'p-4'}`}>
                        <div className="prose prose-sm max-w-none font-lora text-charcoal">
                            <h3 className="text-lg font-playfair font-bold text-charcoal mb-2">
                                Welcome to Folio!
                            </h3>
                            <p className="text-warm-gray mb-3">
                                I'm your editorial assistant, ready to help you create engaging articles and blog posts. Let's start by describing your article topic.
                            </p>

                            <div className="bg-cream/50 rounded-lg p-3 border border-border">
                                <p className="text-sm text-warm-gray font-inter mb-2">
                                    <strong>You can ask me to:</strong>
                                </p>
                                <ul className="text-sm text-warm-gray space-y-1 list-disc list-inside">
                                    <li>Write an article about any topic</li>
                                    <li>Research and include current information</li>
                                    <li>Refine or improve existing content</li>
                                    <li>Generate multiple versions</li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-warm-gray mt-3 font-inter text-xs">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            )}

            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} ${isMobile ? 'gap-3' : 'gap-3 lg:gap-4'
                        } animate-fade-in-up`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 flex items-center justify-center rounded-full text-cream text-sm font-medium ${isMobile ? 'w-7 h-7 text-xs' : 'w-8 h-8'
                        } ${msg.role === "user" ? "bg-gold" : "bg-charcoal"
                        }`}>
                        {msg.role === "user" ? "U" : "F"}
                    </div>

                    {/* Message Bubble */}
                    <div className={`${isMobile ? 'max-w-[85%] p-3' : 'max-w-[80%] p-4'
                        } rounded-lg ${msg.role === "user"
                            ? "bg-gold/10 border-l-2 lg:border-l-4 border-gold rounded-tl-none"
                            : "bg-white border-l-2 lg:border-l-4 border-charcoal rounded-tl-none shadow-sm"
                        }`}>
                        {renderMessageContent(msg.content, msg.role, msg.type)}
                        <div className="text-xs text-warm-gray mt-3 font-inter">
                            {msg.timestamp}
                        </div>
                    </div>
                </div>
            ))}

            {/* Thinking Bubble */}
            {isStreaming && currentAgent && (
                <ThinkingBubble
                    agentName={currentAgent.name}
                    agentText={currentAgent.text}
                    isActive={isStreaming}
                    isMobile={isMobile}
                />
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};