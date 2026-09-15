import type { PublicArticleEntity } from "@/types";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isInternalEntityLink(entity: PublicArticleEntity): boolean {
  return entity.link_type === "internal";
}

/** In-app path for an internal entity URL. */
export function entityInternalPath(url: string): string {
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

export type ArticleEntityPiece =
  | { type: "text"; value: string }
  | { type: "entity"; value: string; entity: PublicArticleEntity };

/** Title, description, and body variants — tags can live in any of them. */
export function articleEntityCorpus(
  ...parts: Array<string | null | undefined>
): string {
  return parts
    .map((part) => part?.trim() ?? "")
    .filter(Boolean)
    .join("\n");
}

/** Longest `match_text` first so a short tag cannot swallow a longer one. */
export function splitArticleEntities(
  text: string,
  entities: PublicArticleEntity[] | null | undefined,
): ArticleEntityPiece[] {
  const unique = new Map<string, PublicArticleEntity>();
  for (const entity of entities ?? []) {
    const match = entity.match_text?.trim();
    if (!match || unique.has(match)) continue;
    unique.set(match, entity);
  }

  const matches = [...unique.keys()].sort((a, b) => b.length - a.length);
  if (matches.length === 0 || !text) {
    return text ? [{ type: "text", value: text }] : [];
  }

  const pattern = new RegExp(`(${matches.map(escapeRegExp).join("|")})`, "g");
  const pieces: ArticleEntityPiece[] = [];
  for (const part of text.split(pattern)) {
    if (!part) continue;
    const entity = unique.get(part);
    pieces.push(
      entity
        ? { type: "entity", value: part, entity }
        : { type: "text", value: part },
    );
  }
  return pieces;
}
