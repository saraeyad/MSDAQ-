/** Encode a hashed/Sqid article id for use in URL path segments. */
export function articleIdParam(id: number | string): string {
  return encodeURIComponent(String(id));
}

/** Decode an article id captured from a URL path segment. */
export function decodeArticleIdParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function sameArticleId(
  a: number | string,
  b: number | string,
): boolean {
  return String(a) === String(b);
}
