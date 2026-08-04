import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth";
import { SiteOriginProvider } from "@/context/site-origin";
import AppRouter from "@/router/AppRouter";
import "./index.css";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import type { DehydratedState } from "@tanstack/react-query";

declare global {
  interface Window {
    __REACT_QUERY_STATE__?: DehydratedState;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const dehydratedState = window.__REACT_QUERY_STATE__;
const rootElement = document.getElementById("root")!;
const hasSsrMarkup = rootElement.innerHTML.trim().length > 0;

const app = (
  <StrictMode>
    <HelmetProvider>
      <NuqsAdapter>
        <AuthProvider>
          <SiteOriginProvider>
            <QueryClientProvider client={queryClient}>
              {dehydratedState ? (
                <HydrationBoundary state={dehydratedState}>
                  <AppRouter />
                </HydrationBoundary>
              ) : (
                <AppRouter />
              )}
              <Toaster position="top-center" expand visibleToasts={4} />
            </QueryClientProvider>
          </SiteOriginProvider>
        </AuthProvider>
      </NuqsAdapter>
    </HelmetProvider>
  </StrictMode>
);

if (hasSsrMarkup) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
