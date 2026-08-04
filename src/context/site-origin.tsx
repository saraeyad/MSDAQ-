import { getSiteOrigin } from "@/lib/seo/site-url";
import { createContext, useContext, type ReactNode } from "react";

const SiteOriginContext = createContext<string | undefined>(undefined);

export function SiteOriginProvider({
  origin,
  children,
}: {
  origin?: string;
  children: ReactNode;
}) {
  return (
    <SiteOriginContext.Provider value={origin}>
      {children}
    </SiteOriginContext.Provider>
  );
}

export function useSiteOrigin(): string {
  const origin = useContext(SiteOriginContext);
  return origin ?? getSiteOrigin();
}
