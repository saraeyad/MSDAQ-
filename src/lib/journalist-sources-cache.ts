import type { JournalistArticleSource } from "@/types/journalist-article";

const STORAGE_KEY = "journalist-article-sources";

function readStore(): Record<string, JournalistArticleSource[]> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, JournalistArticleSource[]>;
  } catch {
    return {};
  }
}

export function getPersistedSources(articleId: number): JournalistArticleSource[] {
  return readStore()[String(articleId)] ?? [];
}

export function persistSources(
  articleId: number,
  sources: JournalistArticleSource[],
): void {
  try {
    const store = readStore();
    store[String(articleId)] = sources;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota / private mode
  }
}
