import { DependencyList, useEffect, useState } from "react";

export function useResource<T>(loader: (signal: AbortSignal) => Promise<T>, dependencies: DependencyList) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true); setError(""); setData(undefined);
    loader(controller.signal).then(setData).catch((reason: Error) => {
      if (active && reason.name !== "AbortError") setError(reason.message);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  // The loader is intentionally supplied by the caller and recreated per render.
  // Callers provide the stable values that define the request in dependencies.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, retryCount]);
  return { data, loading, error, retry: () => setRetryCount(value => value + 1) };
}
