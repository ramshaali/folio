import React, { useEffect, useState } from "react";

interface ThinkingBubbleProps {
  updates: string[]; // Array of incremental messages
  onComplete?: () => void;
}

export const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({ updates, onComplete }) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= updates.length) {
      onComplete?.();
      return;
    }

    const text = updates[step];
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDisplayText((prev) => prev + "\n");
        setStep((prev) => prev + 1);
      }
    }, 25); // typing speed

    return () => clearInterval(interval);
  }, [step, updates, onComplete]);

  return (
    <div className="max-w-[70%] p-3 rounded-xl border border-accent bg-gray-100 font-inter text-sm text-accent whitespace-pre-line animate-fade-in">
      {displayText || "🤔 Thinking..."}
    </div>
  );
};
