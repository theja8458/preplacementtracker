import { useRef, useCallback } from "react";

/**
 * useDebouncedCallback
 *
 * Returns a stable debounced version of `callback` that only fires
 * after `delay` ms of silence (i.e. no new call within the window).
 *
 * • No lodash dependency — keeps the bundle minimal.
 * • Timer ref is shared across renders so it always cancels correctly.
 * • The returned function itself is stable (won't change between renders)
 *   as long as `callback` and `delay` are stable or memo'd by the caller.
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep latest callback in a ref so the debounced wrapper never goes stale
  callbackRef.current = callback;

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
