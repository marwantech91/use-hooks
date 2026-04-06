import { useState, useEffect, useRef } from 'react';

/**
 * Throttle a value so it updates at most once per interval.
 * Unlike debounce, throttle emits the first value immediately
 * and then limits subsequent updates.
 */
export function useThrottle<T>(value: T, intervalMs: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdated.current;

    if (elapsed >= intervalMs) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, intervalMs - elapsed);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, intervalMs]);

  return throttledValue;
}
