const DEFAULT_API_URL = "https://misdaq-production.up.railway.app";

const API_HOST = import.meta.env.VITE_HOST_API || DEFAULT_API_URL;

function joinApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_HOST.replace(/\/$/, "")}${normalized}`;
}

/** Laravel public disk files are served under /storage/… on the API host. */
function withStoragePrefix(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "");
  if (clean.startsWith("storage/")) return joinApiUrl(clean);
  return joinApiUrl(`storage/${clean}`);
}

export function resolveApiMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;

  const trimmed = path.trim();
  if (!trimmed) return undefined;

  // Backend returns a full URL (R2, CDN, etc.) — use as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/http://") || trimmed.startsWith("/https://")) {
    return trimmed.slice(1);
  }

  const relative = trimmed.replace(/^\//, "");
  if (relative.startsWith("storage/") || relative.startsWith("covers/")) {
    return withStoragePrefix(relative);
  }

  return joinApiUrl(trimmed);
}
