import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/utils/format";

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Small data-fetching hook around the API service layer.
 * Gives every page consistent loading / error / refetch behaviour.
 */
export function useApiQuery<T>(
  fn: () => Promise<T>,
  deps: unknown[],
  options: { enabled?: boolean } = {},
) {
  const { enabled = true } = options;
  const [state, setState] = useState<State<T>>({ data: null, loading: enabled, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const reqId = useRef(0);

  const run = useCallback(async () => {
    const id = ++reqId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (id === reqId.current) setState({ data, loading: false, error: null });
    } catch (err) {
      if (id === reqId.current)
        setState({
          data: null,
          loading: false,
          error: errorMessage(err, "Unable to load data. Please try again."),
        });
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return { ...state, refetch: run };
}

/** Imperative variant, for actions such as "Generate Prediction". */
export function useApiAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [data, setData] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const execute = useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(errorMessage(err, "The request could not be completed. Please try again."));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}
