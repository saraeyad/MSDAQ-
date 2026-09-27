import type { SeoHeadPayload } from "@/lib/seo/types";
import { siteFaviconHref, siteLogoUrl } from "@/lib/seo/site-url";
import { useLocale } from "@/context/locale";
import { useSiteOrigin } from "@/context/site-origin";
import { Helmet } from "react-helmet-async";

interface PublicPageHeadProps {
  head: SeoHeadPayload;
}

export function PublicPageHead({ head }: PublicPageHeadProps) {
  const { lang, dir, ogLocale } = useLocale();
  const origin = useSiteOrigin();
  const ogImage = head.ogImage || siteLogoUrl(origin);

  return (
    <Helmet>
      <html lang={lang} dir={dir} />
      <title>{head.title}</title>
      <link rel="icon" type="image/png" href={siteFaviconHref()} />
      <link rel="apple-touch-icon" href={siteFaviconHref()} />
      <link rel="canonical" href={head.canonical} />
      <meta property="og:title" content={head.title} />
      <meta property="og:url" content={head.canonical} />
      <meta property="og:type" content={head.ogType} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage} />
      {head.description ? (
        <>
          <meta name="description" content={head.description} />
          <meta property="og:description" content={head.description} />
        </>
      ) : null}
      {head.prev ? <link rel="prev" href={head.prev} /> : null}
      {head.next ? <link rel="next" href={head.next} /> : null}
    </Helmet>
  );
}
