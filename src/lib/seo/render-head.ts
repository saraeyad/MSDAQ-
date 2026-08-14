import type { JsonLdGraph } from "./types";

export function renderJsonLdScript(graph: JsonLdGraph): string {
  if (!graph["@graph"].length) return "";
  const json = JSON.stringify(graph).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}
