import { errorToast, successToast } from "@/components/sonner-toast";
import { useAuth } from "@/context/auth";
import type { AuthUser } from "@/context/types";
import { getRedirectFromSearch } from "@/lib/auth-redirect";
import { ROUTES } from "@/router/routes";
import { getAuthErrorMessage, parseAuthResponse } from "@/services/types/auth";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

function getPostLoginRoute(user?: AuthUser | null) {
  if (user?.role === "admin") return ROUTES.ADMIN_DASHBOARD;
  if (user?.role === "journalist") return ROUTES.JOURNALIST_DASHBOARD;
  return ROUTES.HOME;
}

export const useAuthSession = () => {
  const { t } = useTranslation();
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const completeAuth = (
    token: string,
    user: Parameters<typeof saveAuth>[1],
  ) => {
    saveAuth(token, user);
    successToast(t("auth.loginSuccess"));

    const redirect = getRedirectFromSearch(searchParams.toString());
    navigate(redirect ?? getPostLoginRoute(user));
  };

  const handleAuthError = (error: unknown) => {
    errorToast(getAuthErrorMessage(error, t, t("auth.authenticationError")));
  };

  return { completeAuth, handleAuthError, parseAuthResponse };
};
