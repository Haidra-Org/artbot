import React, { useState, useEffect } from 'react';

const emojis = ['🎨', '😀', '🖌️', '🖍️', '☀️', '🍻', '❤️', '🎉', '🦄', '🤖', '💻', '😬', '🤪', '✨'];

export default function AnimatedEmoji() {
  const [currentEmoji, setCurrentEmoji] = useState(emojis[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-6">{currentEmoji}</span>;
}