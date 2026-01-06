import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Fetch state interface
 */
export interface UseFetchState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Fetch options interface
 */
export interface UseFetchOptions {
  /** Skip initial fetch on mount */
  skip?: boolean;
  /** Dependencies that trigger refetch */
  deps?: unknown[];
  /** Transform response data */
  transform?: <T>(data: T) => T;
}

/**
 * Fetch return interface
 */
export interface UseFetchReturn<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for data fetching with loading and error states
 *
 * @param endpoint - API endpoint to fetch
 * @param options - Fetch options
 * @returns Fetch state and control functions
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading, error } = useFetch<User[]>('/users');
 *
 * // With dependencies
 * const { data, refetch } = useFetch<Tickets>(`/tickets?date=${date}`, {
 *   deps: [date]
 * });
 *
 * // Skip initial fetch
 * const { data, refetch } = useFetch<Report>('/report', { skip: true });
 * // Later: refetch() to trigger the fetch
 * ```
 */
export function useFetch<T>(
  endpoint: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const { skip = false, deps = [], transform } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    error: null,
    isLoading: !skip,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.get<T>(endpoint);

      if (!isMountedRef.current || controller.signal.aborted) return;

      const data = transform ? transform(response as T) : response;

      setState({
        data: data as T,
        error: null,
        isLoading: false,
      });
    } catch (err) {
      if (!isMountedRef.current || controller.signal.aborted) return;

      setState({
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error'),
        isLoading: false,
      });
    }
  }, [endpoint, transform]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;

    if (!skip) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps]);

  return {
    ...state,
    refetch,
    reset,
  };
}

/**
 * Custom hook for POST/PUT/PATCH/DELETE mutations
 *
 * @returns Mutation state and mutate function
 *
 * @example
 * ```tsx
 * const { mutate, isLoading, error } = useMutation<User>();
 *
 * const handleSubmit = async (data: UserInput) => {
 *   const result = await mutate('/users', 'POST', data);
 *   if (result) {
 *     // Success
 *   }
 * };
 * ```
 */
export function useMutation<T>() {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const mutate = useCallback(
    async (
      endpoint: string,
      method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      body?: unknown
    ): Promise<T | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        let response: T | null = null;

        switch (method) {
          case 'POST':
            response = await api.post<T>(endpoint, body);
            break;
          case 'PUT':
            response = await api.put<T>(endpoint, body);
            break;
          case 'PATCH':
            response = await api.patch<T>(endpoint, body);
            break;
          case 'DELETE':
            response = await api.delete<T>(endpoint);
            break;
        }

        setState({
          data: response,
          error: null,
          isLoading: false,
        });

        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState({
          data: null,
          error,
          isLoading: false,
        });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

export default useFetch;
