const SSE_URL = (process.env.REACT_APP_API_URL ?? '/api') + '/events';
const RECONNECT_DELAY_MS = 5000;

export function connectToSSE(
  onMessage: (data: unknown) => void,
  onError?: (err: Event) => void
): () => void {
  let source: EventSource | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  function connect() {
    if (closed) return;
    source = new EventSource(SSE_URL);

    source.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as unknown;
        onMessage(data);
      } catch {
        // Ignore malformed messages
      }
    };

    source.onerror = (err: Event) => {
      if (onError) onError(err);
      source?.close();
      source = null;
      if (!closed) {
        reconnectTimeout = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    };
  }

  connect();

  return () => {
    closed = true;
    if (reconnectTimeout !== null) clearTimeout(reconnectTimeout);
    source?.close();
  };
}
