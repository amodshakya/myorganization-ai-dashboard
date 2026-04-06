import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { connectToSSE } from '../services/sseService';
import { updateSummary } from '../store/slices/dashboardSlice';

interface SSEPayload {
  type?: string;
  data?: Record<string, unknown>;
}

interface GridStatsData {
  frequency_hz?: number;
  peak_load_gw?: number;
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
        } else if (payload?.type === 'grid_stats' && payload?.data) {
          // Map grid_stats fields to DashboardSummary fields
          const stats = payload.data as GridStatsData;
          const update: Record<string, number> = {};
          if (stats.frequency_hz != null) update.grid_frequency = stats.frequency_hz;
          if (stats.peak_load_gw != null) update.peak_load_gw = stats.peak_load_gw;
          if (Object.keys(update).length > 0) {
            dispatch(updateSummary(update));
          }
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
