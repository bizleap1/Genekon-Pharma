"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface QueryOptions<T> {
  enabled?: boolean;
  initialData?: T;
  staleTime?: number; // in ms
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refetch: () => Promise<void>;
}

// In-memory simple cache for deduplicating query keys during session
const queryCache = new Map<string, { data: unknown; timestamp: number }>();

export function useQuery<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> {
  const {
    enabled = true,
    initialData,
    staleTime = 30000,
    onSuccess,
    onError,
  } = options;

  const serializedKey = JSON.stringify(queryKey);
  const cached = queryCache.get(serializedKey);
  const hasFreshCache = cached && Date.now() - cached.timestamp < staleTime;

  const [data, setData] = useState<T | undefined>(
    hasFreshCache ? (cached.data as T) : initialData
  );
  const [isLoading, setIsLoading] = useState<boolean>(!hasFreshCache && enabled);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(Boolean(hasFreshCache));

  // Store options and queryFn in refs to avoid effect loops
  const optionsRef = useRef({ onSuccess, onError });
  optionsRef.current = { onSuccess, onError };

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const execute = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await queryFnRef.current();
      setData(result);
      setIsSuccess(true);
      queryCache.set(serializedKey, { data: result, timestamp: Date.now() });
      optionsRef.current.onSuccess?.(result);
    } catch (err: unknown) {
      const parsedError = err instanceof Error ? err : new Error(String(err));
      setError(parsedError);
      setIsError(true);
      optionsRef.current.onError?.(parsedError);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, serializedKey]);

  useEffect(() => {
    if (enabled && !hasFreshCache) {
      execute();
    }
  }, [enabled, serializedKey, execute, hasFreshCache]);

  const refetch = useCallback(async () => {
    await execute();
  }, [execute]);

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  };
}
