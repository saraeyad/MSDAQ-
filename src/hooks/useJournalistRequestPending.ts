import { useAuth } from "@/context/auth";
import {
  clearJournalistRequestPending,
  isJournalistRequestPending,
  subscribeJournalistRequestPending,
} from "@/lib/journalist-request-status";
import { useEffect, useState } from "react";

export function useJournalistRequestPending() {
  const { user } = useAuth();
  const userId = user?.id;
  const [isPending, setIsPending] = useState(() =>
    isJournalistRequestPending(userId),
  );

  useEffect(() => {
    setIsPending(isJournalistRequestPending(userId));
    return subscribeJournalistRequestPending(() => {
      setIsPending(isJournalistRequestPending(userId));
    });
  }, [userId]);

  useEffect(() => {
    if (user && user.role !== "normal_user") {
      clearJournalistRequestPending();
      setIsPending(false);
    }
  }, [user?.role]);

  return { isPending, userId };
}
