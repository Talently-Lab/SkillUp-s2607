import { useEffect, useEffectEvent, useState } from "react";

type Result<T> =
  | { key: string; data: T; error: null }
  | { key: string; data: null; error: unknown };

/**
 * Runs `fetcher` on mount and again whenever `key` changes. The result is
 * stored with the key it belongs to, so a new key reads as loading without
 * resetting state inside the effect.
 */
export function useFetch<T>(key: string, fetcher: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const requestKey = `${key}#${attempt}`;
  const runFetcher = useEffectEvent(fetcher);

  useEffect(() => {
    let ignore = false;
    runFetcher().then(
      (data) => {
        if (!ignore) setResult({ key: requestKey, data, error: null });
      },
      (error: unknown) => {
        if (!ignore) setResult({ key: requestKey, data: null, error });
      },
    );
    return () => {
      ignore = true;
    };
  }, [requestKey]);

  const current = result?.key === requestKey ? result : null;

  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    isLoading: current === null,
    retry: () => setAttempt((prev) => prev + 1),
  };
}
