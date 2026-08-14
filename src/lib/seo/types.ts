export interface SeoHeadPayload {
  title: string;
  description?: string | null;
  canonical: string;
  ogType: string;
  ogImage?: string | null;
  prev?: string;
  next?: string;
}

export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": Record<string, unknown>[];
}
