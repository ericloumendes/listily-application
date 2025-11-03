import { useCallback } from "react";
import { useFocusEffect } from "expo-router";

// Run the provided effect whenever the screen gains focus.
// Pass a stable function (e.g., useCallback) and its deps for correct memoization.
export function useRefreshOnFocus(effect: () => void | Promise<void>, deps: any[] = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useCallback(() => {
    let isActive = true;
    const run = async () => {
      try {
        await Promise.resolve(effect());
      } catch {
        // swallow
      }
    };
    run();
    return () => {
      isActive = false;
    };
  }, deps);

  useFocusEffect(memoized);
}
