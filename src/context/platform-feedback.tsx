import { PlatformFeedbackDialog } from "@/features/public-site/platform-feedback/PlatformFeedbackDialog";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PlatformFeedbackContextType {
  feedbackOpen: boolean;
  openFeedback: () => void;
  setFeedbackOpen: (open: boolean) => void;
  trustIndexOpen: boolean;
  setTrustIndexOpen: (open: boolean) => void;
}

const PlatformFeedbackContext = createContext<
  PlatformFeedbackContextType | undefined
>(undefined);

export function PlatformFeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [trustIndexOpen, setTrustIndexOpen] = useState(false);

  const openFeedback = useCallback(() => setFeedbackOpen(true), []);

  const value = useMemo(
    () => ({
      feedbackOpen,
      openFeedback,
      setFeedbackOpen,
      trustIndexOpen,
      setTrustIndexOpen,
    }),
    [feedbackOpen, openFeedback, trustIndexOpen],
  );

  return (
    <PlatformFeedbackContext.Provider value={value}>
      {children}
      <PlatformFeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </PlatformFeedbackContext.Provider>
  );
}

export function usePlatformFeedback() {
  const context = useContext(PlatformFeedbackContext);
  if (!context) {
    throw new Error(
      "usePlatformFeedback must be used within PlatformFeedbackProvider",
    );
  }
  return context;
}
