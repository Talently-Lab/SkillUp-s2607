import { useEffect, useState } from "react";

/**
 * True only after `active` has stayed true for `delay` ms.
 * Skeletons use it so fast responses don't flash a placeholder.
 */
export function useDelayedFlag(active: boolean, delay = 300) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setShown(true), delay);
    return () => {
      window.clearTimeout(timer);
      setShown(false);
    };
  }, [active, delay]);

  return active && shown;
}
