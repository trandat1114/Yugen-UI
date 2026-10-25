import * as React from "react";

export interface QueryState<T> {
  status: "loading" | "success" | "error";
  /** Last successful result. Kept while a new request runs, so the UI does not flash empty. */
  data: T | undefined;
  error: unknown;
  retry: () => void;
}

/**
 * Runs `load` when `deps` change and cancels the previous request (AbortSignal). A small stand-in for TanStack Query or
 * SWR; swap it for one of those when you need caching or refetch on focus.
 */
export function useQuery<T>(load: (signal: AbortSignal) => Promise<T>, deps: React.DependencyList): QueryState<T> {
  const [state, setState] = React.useState<Omit<QueryState<T>, "retry">>({ status: "loading", data: undefined, error: undefined });
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();
    setState((s) => (s.status === "loading" ? s : { ...s, status: "loading" }));
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: "success", data, error: undefined });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState((s) => ({ status: "error", data: s.data, error }));
      },
    );
    return () => controller.abort();
    // `load` is a new function on every render; the caller lists what it depends on in `deps`.
  }, [...deps, attempt]);

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
