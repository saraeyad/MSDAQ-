import type { JsonLdGraph } from "./types";
import type { SeoHeadPayload } from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function metaTag(name: string, content: string): string {
  return `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}" />`;
}

function propertyTag(property: string, content: string): string {
  return `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}" />`;
}

export function renderHeadTags(head: SeoHeadPayload): string {
  const tags: string[] = [
    `<title>${escapeHtml(head.title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(head.canonical)}" />`,
    propertyTag("og:title", head.title),
    propertyTag("og:url", head.canonical),
    propertyTag("og:type", head.ogType),
    propertyTag("og:locale", "ar_PS"),
  ];

  if (head.description) {
    tags.push(metaTag("description", head.description));
    tags.push(propertyTag("og:description", head.description));
  }

  if (head.ogImage) {
    tags.push(propertyTag("og:image", head.ogImage));
  }

  return tags.join("\n    ");
}

export function renderJsonLdScript(graph: JsonLdGraph): string {
  if (!graph["@graph"].length) return "";
  const json = JSON.stringify(graph).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}
