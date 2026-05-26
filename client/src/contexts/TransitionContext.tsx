/**
 * TransitionContext
 * Provides a single PageTransitionOverlay rendered at the root level (App.tsx),
 * so any page can trigger it without mounting/unmounting issues.
 */
import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import PageTransitionOverlay from "@/components/PageTransitionOverlay";

interface TransitionContextValue {
  navigateWithTransition: (navigateFn: () => void, options?: TransitionOptions) => void;
  isTransitioning: boolean;
}

interface TransitionOptions {
  message?: string;
  subMessage?: string;
  delay?: number;
  exitDelay?: number;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigateWithTransition: (fn) => fn(),
  isTransitioning: false,
});

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [subMessage, setSubMessage] = useState<string | undefined>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateWithTransition = useCallback(
    (navigateFn: () => void, options: TransitionOptions = {}) => {
      const { message: msg, subMessage: sub, delay = 1400, exitDelay = 350 } = options;

      if (timerRef.current) clearTimeout(timerRef.current);

      setMessage(msg);
      setSubMessage(sub);
      setIsTransitioning(true);

      timerRef.current = setTimeout(() => {
        navigateFn();
        timerRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, exitDelay);
      }, delay);
    },
    []
  );

  return (
    <TransitionContext.Provider value={{ navigateWithTransition, isTransitioning }}>
      {children}
      <PageTransitionOverlay
        isVisible={isTransitioning}
        message={message}
        subMessage={subMessage}
      />
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  return useContext(TransitionContext);
}
