"use client";

import { useState, useCallback } from "react";

export interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

export interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: TData | undefined;
  reset: () => void;
}

export function useMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables> = {}
): MutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setData(undefined);
    setIsPending(false);
    setIsError(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsPending(true);
      setIsError(false);
      setIsSuccess(false);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        setIsSuccess(true);
        options.onSuccess?.(result, variables);
        options.onSettled?.(result, null, variables);
        return result;
      } catch (err: unknown) {
        const parsed = err instanceof Error ? err : new Error(String(err));
        setError(parsed);
        setIsError(true);
        options.onError?.(parsed, variables);
        options.onSettled?.(undefined, parsed, variables);
        throw parsed;
      } finally {
        setIsPending(false);
      }
    },
    [mutationFn, options]
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {
        // Catch to prevent unhandled rejection when mutate() is called fire-and-forget
      });
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync,
    isPending,
    isError,
    isSuccess,
    error,
    data,
    reset,
  };
}
