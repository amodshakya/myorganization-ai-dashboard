import { useCallback, useEffect, useRef, useState } from 'react';

export function useAutoRefresh(
  callback: () => void,
  intervalMs: number
): { refresh: () => void; lastRefreshed: Date | null } {
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const refresh = useCallback(() => {
    callbackRef.current();
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      callbackRef.current();
      setLastRefreshed(new Date());
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { refresh, lastRefreshed };
}
