import BrandLogo from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import {
  buildLoginUrl,
  getRoleDashboardRoute,
  isJournalistApplyRedirect,
} from "@/lib/auth-redirect";
import { ROUTES } from "@/router/routes";
import { GoogleLogin } from "@react-oauth/google";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import useGoogleAuth from "./hooks/useGoogleAuth";
import useRegisterForm from "./hooks/useRegisterForm";

export default function Register() {
  const { t } = useTranslation();
  const { token, user, isInitialized } = useAuth();
  const [searchParams] = useSearchParams();
  const { onGoogleSuccess, onGoogleError, loading: googleLoading } = useGoogleAuth();
  const { registerForm, onSubmit, loading: registerLoading } = useRegisterForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = registerForm;

  const loading = googleLoading || registerLoading;
  const redirectTarget = searchParams.get("redirect");
  const loginUrl = buildLoginUrl(redirectTarget ?? ROUTES.HOME);
  const journalistApplyIntent = isJournalistApplyRedirect(redirectTarget);

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
            <p className="text-body-md text-muted-foreground">{t("auth.registerDescription")}</p>
          </div>

          {journalistApplyIntent ? (
            <div className="rounded border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm leading-relaxed text-foreground">
              <p className="font-medium text-secondary">{t("auth.journalistRegisterHint")}</p>
              <p className="mt-1 text-muted-foreground">{t("auth.journalistLoginHint")}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-body-md font-medium">
                {t("auth.name")}
              </label>
              <Input id="name" type="text" {...register("name")} />
              {errors.name ? (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-body-md font-medium">
                {t("auth.email")}
              </label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-body-md font-medium">
                {t("auth.phone")}
              </label>
              <Input id="phone" type="tel" {...register("phone")} />
              {errors.phone ? (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-body-md font-medium">
                {t("auth.password")}
              </label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="password_confirmation"
                className="mb-2 block text-body-md font-medium"
              >
                {t("auth.passwordConfirmation")}
              </label>
              <Input
                id="password_confirmation"
                type="password"
                {...register("password_confirmation")}
              />
              {errors.password_confirmation ? (
                <p className="mt-1 text-xs text-destructive">
                  {errors.password_confirmation.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {registerLoading ? <Loader className="size-4 animate-spin" /> : null}
              {t("auth.createAccount")}
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
                {t("auth.signingUp")}
              </div>
            ) : (
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
              />
            )}
          </div>

          <p className="text-center text-body-md text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link to={loginUrl} className="font-medium text-secondary hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
