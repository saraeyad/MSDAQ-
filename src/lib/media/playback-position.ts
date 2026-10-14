const STORAGE_KEY = "sabbara-audio-position:v1";

type PositionStore = Record<string, number>;

function readStore(): PositionStore {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as PositionStore;
  } catch {
    return {};
  }
}

function writeStore(store: PositionStore) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/** Seconds already heard for this article, or 0. */
export function readPlaybackPosition(id: number | string): number {
  const seconds = readStore()[String(id)];
  return typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0
    ? seconds
    : 0;
}

export function writePlaybackPosition(id: number | string, seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 1) return;
  const store = readStore();
  store[String(id)] = Math.round(seconds * 10) / 10;
  writeStore(store);
}

export function clearPlaybackPosition(id: number | string) {
  const store = readStore();
  if (!(String(id) in store)) return;
  delete store[String(id)];
  writeStore(store);
}
