/**
 * usePageTransition
 * Triggers the full-screen PageTransitionOverlay, waits for the animation,
 * then calls the provided navigation callback.
 *
 * Usage:
 *   const { navigateWithTransition, isTransitioning } = usePageTransition();
 *   navigateWithTransition(() => navigate("/order"), { message: "Preparing your protocol..." });
 */
import { useState, useCallback, useRef } from "react";

interface TransitionOptions {
  /** Primary loading message shown in the overlay */
  message?: string;
  /** Secondary sub-message */
  subMessage?: string;
  /**
   * How long (ms) to show the overlay before navigating.
   * Default: 1400ms — enough for the progress bar to feel satisfying.
   */
  delay?: number;
  /**
   * How long (ms) to keep the overlay visible after navigation
   * so the new page can start rendering underneath.
   * Default: 300ms
   */
  exitDelay?: number;
}

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | undefined>();
  const [transitionSubMessage, setTransitionSubMessage] = useState<string | undefined>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateWithTransition = useCallback(
    (navigateFn: () => void, options: TransitionOptions = {}) => {
      const {
        message,
        subMessage,
        delay = 1400,
        exitDelay = 300,
      } = options;

      // Clear any pending timer from a previous call
      if (timerRef.current) clearTimeout(timerRef.current);

      setTransitionMessage(message);
      setTransitionSubMessage(subMessage);
      setIsTransitioning(true);

      timerRef.current = setTimeout(() => {
        // Execute the actual navigation
        navigateFn();

        // Keep overlay visible briefly so new page renders underneath
        timerRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, exitDelay);
      }, delay);
    },
    []
  );

  return {
    isTransitioning,
    transitionMessage,
    transitionSubMessage,
    navigateWithTransition,
  };
}
