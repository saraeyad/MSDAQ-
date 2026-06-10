import { ROUTES } from "@/router/routes";

export function getRedirectFromSearch(search: string): string | null {
  const redirect = new URLSearchParams(search).get("redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return null;
}

export function buildLoginUrl(redirect = ROUTES.JOURNALIST_APPLY) {
  return `${ROUTES.LOGIN}?redirect=${encodeURIComponent(redirect)}`;
}

export function buildRegisterUrl(redirect = ROUTES.JOURNALIST_APPLY) {
  return `${ROUTES.REGISTER}?redirect=${encodeURIComponent(redirect)}`;
}

export function isJournalistApplyRedirect(redirect: string | null): boolean {
  if (!redirect) return false;
  return (
    redirect === ROUTES.JOURNALIST_APPLY ||
    redirect.startsWith(`${ROUTES.JOURNALIST_APPLY}/`)
  );
}

export function getRoleDashboardRoute(role?: string | null): string {
  if (role === "admin") return ROUTES.ADMIN_DASHBOARD;
  if (role === "journalist") return ROUTES.JOURNALIST_DASHBOARD;
  return ROUTES.HOME;
}

export function getJournalistRequestHref(
  isAuthenticated: boolean,
  role?: string | null,
) {
  if (!isAuthenticated) return buildLoginUrl();
  if (role === "journalist" || role === "admin") return null;
  return ROUTES.JOURNALIST_APPLY;
}
