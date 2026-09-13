const AREF_RUQAA =
  "https://fonts.googleapis.com/css2?family=Aref+Ruqaa+Ink:wght@400;700&display=swap";
const IBM_PLEX_SANS =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap";

function injectStylesheet(href: string, id: string) {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/** Decorative hero script — not needed for first paint. */
export function loadDecorativeArabicFont() {
  injectStylesheet(AREF_RUQAA, "font-aref-ruqaa");
}

/** Latin UI face — only when the English locale is active. */
export function loadLatinUiFont() {
  injectStylesheet(IBM_PLEX_SANS, "font-ibm-plex-sans");
}
