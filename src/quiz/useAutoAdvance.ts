import { useCallback, useEffect, useRef } from 'react';

/**
 * A single-choice answer advances on its own, but not instantly — she needs
 * to see the tick land before the screen changes, or the funnel feels like it
 * is guessing. The timer is cleared on unmount so a fast back-tap cannot
 * fire a navigation for a screen that is already gone.
 */
export function useAutoAdvance(next: () => void, delay = 280) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  return useCallback((pick: () => void) => {
    pick();
    clearTimeout(timer.current);
    timer.current = setTimeout(next, delay);
  }, [next, delay]);
}
