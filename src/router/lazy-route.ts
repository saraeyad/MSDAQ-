import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const RELOAD_KEY = "msdaq-stale-chunk-reload";

function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("Importing a module script failed")
  );
}

/** Hard-refresh once when Vite left the tab with a stale lazy chunk URL. */
export function reloadIfStaleChunk(error: unknown): boolean {
  if (typeof window === "undefined" || !isStaleChunkError(error)) return false;
  const marker = `${location.pathname}${location.search}`;
  if (sessionStorage.getItem(RELOAD_KEY) === marker) return false;
  sessionStorage.setItem(RELOAD_KEY, marker);
  location.reload();
  return true;
}

export function lazyRoute<T extends ComponentType>(
  loader: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await loader();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem(RELOAD_KEY);
      }
      return mod;
    } catch (error) {
      reloadIfStaleChunk(error);
      throw error;
    }
  });
}
