import type { SeoHeadPayload } from "@/lib/seo/types";
import { Helmet } from "react-helmet-async";

interface PublicPageHeadProps {
  head: SeoHeadPayload;
}

export function PublicPageHead({ head }: PublicPageHeadProps) {
  return (
    <Helmet>
      <html lang="ar" dir="rtl" />
      <title>{head.title}</title>
      <link rel="canonical" href={head.canonical} />
      <meta property="og:title" content={head.title} />
      <meta property="og:url" content={head.canonical} />
      <meta property="og:type" content={head.ogType} />
      <meta property="og:locale" content="ar_PS" />
      {head.description ? (
        <>
          <meta name="description" content={head.description} />
          <meta property="og:description" content={head.description} />
        </>
      ) : null}
      {head.ogImage ? (
        <meta property="og:image" content={head.ogImage} />
      ) : null}
      {head.prev ? <link rel="prev" href={head.prev} /> : null}
      {head.next ? <link rel="next" href={head.next} /> : null}
    </Helmet>
  );
}
