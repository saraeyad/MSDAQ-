import { DOMAIN_BORDER_ACCENTS } from "@/lib/colors";
import type { DomainGroup, ImageAppearance } from "@/types/image-verification";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getDomainAccent(domain: string): string {
  return DOMAIN_BORDER_ACCENTS[hashString(domain) % DOMAIN_BORDER_ACCENTS.length];
}

export function getCardRotation(domain: string): number {
  const hash = hashString(domain);
  return ((hash % 30) - 15) / 10;
}

export function groupAppearancesByDomain(
  appearances: ImageAppearance[],
): DomainGroup[] {
  const map = new Map<string, DomainGroup>();

  for (const appearance of appearances) {
    const existing = map.get(appearance.domain);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(appearance.domain, {
        domain: appearance.domain,
        logo: appearance.logo,
        count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function extractDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getBubbleSize(count: number, maxCount: number): number {
  if (maxCount <= 0) return 40;
  const min = 36;
  const max = 72;
  return min + ((count / maxCount) * (max - min));
}
