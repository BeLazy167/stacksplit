import { useEffect, useCallback, useRef } from 'react';

export function useDebounce<T>(callback: (value: T) => void, delay: number, deps: any[] = []) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);
    },
    [callback, delay, ...deps]
  );

  return debouncedCallback;
} 