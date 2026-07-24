import { useState, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (promise: Promise<T>) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await promise;
      if (!ctrl.signal.aborted) {
        setState({ data, isLoading: false, error: null });
      }
      return data;
    } catch (err) {
      if (!ctrl.signal.aborted) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
      }
      return null as T;
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
