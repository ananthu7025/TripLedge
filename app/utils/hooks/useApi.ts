/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from 'react';
import {  ApiError } from '../api-client';

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setError: (error: string | null) => void;
}

export function useApi<T = any>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const result = await apiCall();

        setState({
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'An unexpected error occurred';

        setState({
          data: null,
          error: errorMessage,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });

        return null;
      }
    },
    []
  );

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);


  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
      isError: error !== null,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setError,
  };
}

export function useMutation<T = any>() {
  const { execute, isLoading, error, isSuccess, reset, setError } = useApi<T>();

  const mutate = useCallback(
    async (apiCall: () => Promise<T>): Promise<boolean> => {
      const result = await execute(apiCall);
      return result !== null;
    },
    [execute]
  );

  return {
    mutate,
    isLoading,
    error,
    isSuccess,
    reset,
    setError,
  };
}

export function useQuery<T = any>(
  queryFn: () => Promise<T>,
  options: { fetchOnMount?: boolean } = {}
) {
  const { execute, data, isLoading, error, isSuccess, reset } = useApi<T>();

  const fetch = useCallback(async () => {
    await execute(queryFn);
  }, [execute, queryFn]);

  // Auto-fetch on mount if enabled
  useState(() => {
    if (options.fetchOnMount) {
      fetch();
    }
  });

  return {
    data,
    isLoading,
    error,
    isSuccess,
    fetch,
    refetch: fetch,
    reset,
  };
}
