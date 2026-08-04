import type { JsonLdGraph } from "@/lib/seo/types";

interface JsonLdProps {
  data: JsonLdGraph;
}

export function JsonLd({ data }: JsonLdProps) {
  if (!data["@graph"].length) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
