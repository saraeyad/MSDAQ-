import BrandLogo from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import {
  buildRegisterUrl,
  getRoleDashboardRoute,
  isJournalistApplyRedirect,
} from "@/lib/auth-redirect";
import { ROUTES } from "@/router/routes";
import { GoogleLogin } from "@react-oauth/google";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import useGoogleAuth from "./hooks/useGoogleAuth";
import useLoginForm from "./hooks/useLoginForm";

export default function Login() {
  const { t } = useTranslation();
  const { token, user, isInitialized } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    onGoogleSuccess,
    onGoogleError,
    loading: googleLoading,
  } = useGoogleAuth();
  const {
    loginForm,
    onSubmit,
    loading: loginLoading,
    apiError,
  } = useLoginForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = loginForm;

  const loading = googleLoading || loginLoading;
  const redirectTarget = searchParams.get("redirect");
  const registerUrl = buildRegisterUrl(redirectTarget ?? ROUTES.HOME);
  const journalistLoginRequired = isJournalistApplyRedirect(redirectTarget);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (token) return <Navigate to={getRoleDashboardRoute(user?.role)} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded border border-border bg-card p-8 md:p-10">
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <BrandLogo linkToHome={false} size="lg" />
            <p className="text-body-md text-muted-foreground">
              {t("auth.signInDescription")}
            </p>
          </div>

          {journalistLoginRequired ? (
            <div className="rounded border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm leading-relaxed text-foreground">
              <p className="font-medium text-secondary">
                {t("auth.journalistLoginRequired")}
              </p>
              <p className="mt-1 text-muted-foreground">
                {t("auth.journalistLoginHint")}
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-body-md font-medium"
              >
                {t("auth.email")}
              </label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-body-md font-medium"
              >
                {t("auth.password")}
              </label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {apiError ? (
              <p className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {apiError}
              </p>
            ) : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loginLoading ? <Loader className="size-4 animate-spin" /> : null}
              {t("auth.login")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-label-caps text-muted-foreground">
                {t("auth.orContinueWith")}
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            {googleLoading ? (
              <div className="flex items-center gap-2 text-body-md text-muted-foreground">
                <Loader className="size-4 animate-spin" />
                {t("auth.signingIn")}
              </div>
            ) : (
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            )}
          </div>

          <p className="text-center text-body-md text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link
              to={registerUrl}
              className="font-medium text-secondary hover:underline"
            >
              {t("auth.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
