import { useState, useEffect, useRef } from 'react';

/**
 * Tracks user behavior to detect when they might be stuck
 * Returns: { isUserStuck, behaviorData, resetStuckState }
 */
const useBehaviorTracker = () => {
  const [isUserStuck, setIsUserStuck] = useState(false);
  const [behaviorData, setBehaviorData] = useState({
    idleTime: 0,
    scrollCount: 0,
    clicks: 0,
    lastActivity: Date.now()
  });

  const hasTriggeredRef = useRef(false);
  const idleTimerRef = useRef(null);
  const scrollCountRef = useRef(0);
  const scrollTimerRef = useRef(null);
  const lastScrollTimeRef = useRef(Date.now());

  useEffect(() => {
    // Mouse movement handler - resets idle timer
    const handleMouseMove = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      setBehaviorData(prev => ({
        ...prev,
        idleTime: 0,
        lastActivity: Date.now()
      }));

      // Start new idle timer (30 seconds)
      idleTimerRef.current = setTimeout(() => {
        if (!hasTriggeredRef.current) {
          setIsUserStuck(true);
          hasTriggeredRef.current = true;
        }
      }, 30000);
    };

    // Scroll handler - detects rapid scrolling
    const handleScroll = () => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTimeRef.current;

      // If scrolling within 5 seconds, increment counter
      if (timeSinceLastScroll < 5000) {
        scrollCountRef.current += 1;
      } else {
        scrollCountRef.current = 1;
      }

      lastScrollTimeRef.current = now;

      setBehaviorData(prev => ({
        ...prev,
        scrollCount: scrollCountRef.current,
        lastActivity: now
      }));

      // Clear existing scroll timer
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      // Reset scroll count after 5 seconds of no scrolling
      scrollTimerRef.current = setTimeout(() => {
        scrollCountRef.current = 0;
      }, 5000);

      // Trigger if user scrolls up/down more than 4 times rapidly
      if (scrollCountRef.current > 4 && !hasTriggeredRef.current) {
        setIsUserStuck(true);
        hasTriggeredRef.current = true;
      }
    };

    // Click handler - tracks engagement
    const handleClick = () => {
      setBehaviorData(prev => ({
        ...prev,
        clicks: prev.clicks + 1,
        lastActivity: Date.now()
      }));
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    // Start initial idle timer
    idleTimerRef.current = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        setIsUserStuck(true);
        hasTriggeredRef.current = true;
      }
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const resetStuckState = () => {
    setIsUserStuck(false);
    hasTriggeredRef.current = false;
  };

  return {
    isUserStuck,
    behaviorData,
    resetStuckState
  };
};

export default useBehaviorTracker;
