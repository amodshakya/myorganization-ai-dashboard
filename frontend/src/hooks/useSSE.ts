import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { connectToSSE } from '../services/sseService';
import { updateSummary } from '../store/slices/dashboardSlice';

interface SSEPayload {
  type?: string;
  data?: Record<string, unknown>;
}

export function useSSE(): boolean {
  const dispatch = useDispatch<AppDispatch>();
  const [connected, setConnected] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const cleanup = connectToSSE(
      (raw: unknown) => {
        setConnected(true);
        const payload = raw as SSEPayload;
        if (payload?.type === 'dashboard_update' && payload?.data) {
          dispatch(updateSummary(payload.data));
        }
      },
      () => setConnected(false)
    );

    cleanupRef.current = cleanup;

    return () => {
      cleanup();
      setConnected(false);
    };
  }, [dispatch]);

  return connected;
}
