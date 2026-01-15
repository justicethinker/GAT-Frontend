import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

const IDLE_LIMIT = 15 * 60 * 1000; // 15 minutes in milliseconds

export function useIdleTimer() {
  const [, setLocation] = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const logout = () => {
    sessionStorage.clear(); // Wipe the token
    setLocation('/login'); // Force redirect
    
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Only set timer if user is actually logged in
    if (sessionStorage.getItem('token')) {
      timeoutRef.current = setTimeout(logout, IDLE_LIMIT);
    }
  };

  useEffect(() => {
    // Events that count as "activity"
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    // Attach listeners
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, []);
}