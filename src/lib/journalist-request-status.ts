const STORAGE_KEY = "misdaq_journalist_request_pending";
const PENDING_CHANGE_EVENT = "journalist-request-pending-change";

type PendingEntry = {
  userId: number;
};

function notifyPendingChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PENDING_CHANGE_EVENT));
}

export function isJournalistRequestPending(userId?: number | null): boolean {
  if (!userId || typeof window === "undefined") return false;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const entry = JSON.parse(raw) as PendingEntry;
    return entry.userId === userId;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

export function setJournalistRequestPending(userId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId }));
  notifyPendingChange();
}

export function clearJournalistRequestPending(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  notifyPendingChange();
}

export function subscribeJournalistRequestPending(
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(PENDING_CHANGE_EVENT, listener);
  return () => window.removeEventListener(PENDING_CHANGE_EVENT, listener);
}
