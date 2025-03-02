import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface AsyncDataState<T, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
}

interface UseAsyncDataOptions<T, E> {
  onSuccess?: (data: T) => void;
  onError?: (error: E) => void;
  errorMessage?: string;
  retryCount?: number;
}

export function useAsyncData<T, E = Error>(
  asyncFn: () => Promise<T>,
  options: UseAsyncDataOptions<T, E> = {}
) {
  const {
    onSuccess,
    onError,
    errorMessage = 'エラーが発生しました',
    retryCount = 3
  } = options;

  const [state, setState] = useState<AsyncDataState<T, E>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    let attempts = 0;
    while (attempts < retryCount) {
      try {
        const data = await asyncFn();
        setState({ data, loading: false, error: null });
        onSuccess?.(data);
        return data;
      } catch (error) {
        attempts++;
        if (attempts === retryCount) {
          const typedError = error as E;
          setState({ data: null, loading: false, error: typedError });
          onError?.(typedError);
          toast.error(errorMessage);
          return null;
        }
        // 指数バックオフ
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }
  }, [asyncFn, onSuccess, onError, errorMessage, retryCount]);

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null })
  };
} 