/**
 * useTime Hook
 * Real-time clock hook
 * Cloned from frontend-v2 with TypeScript typing
 */

import { useState, useEffect } from 'react';

export const useTime = (): string => {
  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return currentTime;
};
