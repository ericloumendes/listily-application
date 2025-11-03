import { useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";

// Run the callback only once the next time the screen regains focus after mounting.
// After it runs once, it will not run again until the component is remounted.
export function useRefocusOnce(cb: () => void | Promise<void>, deps: any[] = []) {
  const hasRunRef = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onFocus = useCallback(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    Promise.resolve(cb()).catch(() => {});
  }, deps);

  useFocusEffect(onFocus);
}
