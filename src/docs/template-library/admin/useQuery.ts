import * as React from "react";

export interface QueryState<T> {
  status: "loading" | "success" | "error";
  /** Last successful result, kept while a new request runs so the screen does not flash empty. */
  data: T | undefined;
  error: unknown;
  /** Loads again and shows the loading state (after an error). */
  retry: () => void;
  /** Loads again in the background, after a save: the data on screen stays until the new one arrives. */
  refresh: () => void;
}

/**
 * Runs `load` when `deps` change and cancels the previous request (AbortSignal). A small stand-in for TanStack Query or
 * SWR; swap it for one of those when you need caching or refetch on focus.
 */
export function useQuery<T>(load: (signal: AbortSignal) => Promise<T>, deps: React.DependencyList): QueryState<T> {
  const [state, setState] = React.useState<Omit<QueryState<T>, "retry" | "refresh">>({ status: "loading", data: undefined, error: undefined });
  const [run, setRun] = React.useState(0);
  const background = React.useRef(false);

  React.useEffect(() => {
    const controller = new AbortController();
    const quiet = background.current;
    background.current = false;
    if (!quiet) setState((s) => (s.status === "loading" ? s : { ...s, status: "loading" }));
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: "success", data, error: undefined });
      },
      (error: unknown) => {
        // A failed background refresh keeps what is on screen.
        if (!controller.signal.aborted && !quiet) setState((s) => ({ status: "error", data: s.data, error }));
      },
    );
    return () => controller.abort();
    // `load` is a new function on every render; the caller lists what it depends on in `deps`.
  }, [...deps, run]);

  const retry = React.useCallback(() => setRun((n) => n + 1), []);
  const refresh = React.useCallback(() => {
    background.current = true;
    setRun((n) => n + 1);
  }, []);
  return { ...state, retry, refresh };
}

/** The value, once it has stopped changing for `delay` ms (search fields). */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [settled, setSettled] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}
