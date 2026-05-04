import React, { useState, useEffect, useRef } from 'react';

/**
 * ScrambleText — A premium "hacker-style" text animation.
 * Characters scramble through random symbols before resolving
 * left-to-right into the final text, creating a cinematic reveal.
 */
const ScrambleText = ({ text, duration = 1500, interval = 30 }) => {
  const [display, setDisplay] = useState('');
  const frameRef = useRef(null);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*0123456789';

  useEffect(() => {
    const start = Date.now();
    const length = text.length;

    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) {
        setDisplay(text);
        return;
      }

      let result = '';
      for (let i = 0; i < length; i++) {
        // Characters resolve left-to-right based on their position
        const charThreshold = (i / length) * 0.8; // chars at the start lock in earlier
        if (progress > charThreshold + 0.2) {
          // Locked in — show real character
          result += text[i];
        } else if (progress > charThreshold) {
          // Transitioning — flicker between real and random
          result += Math.random() < (progress - charThreshold) * 5
            ? text[i]
            : chars.charAt(Math.floor(Math.random() * chars.length));
        } else {
          // Still scrambling
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      setDisplay(result);
      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, duration]);

  return (
    <span style={{ 
      display: 'inline-block',
      fontVariantNumeric: 'tabular-nums',
      fontFeatureSettings: '"tnum"'
    }}>
      {display}
    </span>
  );
};

export default ScrambleText;
