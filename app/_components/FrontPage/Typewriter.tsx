import { AppConstants } from '@/app/_data-models/AppConstants';
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface TypewriterProps {
  text: string;
  onComplete: () => void;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const typingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.width = containerRef.current.offsetWidth + 'px';
      tempDiv.className = containerRef.current.className;
      tempDiv.innerHTML = `> ${text}|`;

      document.body.appendChild(tempDiv);
      const height = tempDiv.offsetHeight;
      document.body.removeChild(tempDiv);

      containerRef.current.style.minHeight = `${height}px`;
    }
  }, [text]);

  const typeText = useCallback(
    (index: number = 0) => {
      if (!typingRef.current) return;
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        setTimeout(() => typeText(index + 1), AppConstants.TYPING_SPEED_MS);
      } else {
        typingRef.current = false;
        onComplete();
      }
    },
    [text, onComplete]
  );

  useEffect(() => {
    typingRef.current = true;
    typeText();
    return () => {
      typingRef.current = false;
    };
  }, [text, typeText]);

  useEffect(() => {
    const cursorBlink = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorBlink);
  }, []);

  return (
    <div
      ref={containerRef}
      className="p-2 mb-4 font-mono w-full bg-slate-600 text-white max-w-[768px]"
      style={{
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: '200px',
        overflowY: 'auto'
      }}
    >
      {'> '}
      {displayedText}
      <span style={{ opacity: showCursor ? 1 : 0 }}>|</span>
    </div>
  );
};

export default Typewriter;
