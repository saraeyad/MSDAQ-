import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { usePublicCopy } from "@/context/locale";
import { getApiData, getApiErrorMessage } from "@/lib/api-data";
import { Auth_APIs } from "@/services/api/auth";
import { normalizeAuthUser, type AuthUser } from "@/context/types";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const LOGIN_PHOTO = "/images/hero-people.jpg";
const LOGIN_FALLBACK = "/images/hero-verification.png";

const WORKSPACE_PERMISSIONS = [
  PERMISSIONS.VIEW_ARTICLES,
  PERMISSIONS.VIEW_ADMIN_DASHBOARD,
  PERMISSIONS.ACCESS_TOOLS,
];

function defaultAfterLoginPath(user: AuthUser): string {
  const permissions = user.permissions ?? [];
  if (WORKSPACE_PERMISSIONS.some((permission) => permissions.includes(permission))) {
    return ROUTES.NEWSROOM;
  }
  return ROUTES.HOME;
}

function safeInternalPath(value: string | null): string | null {
  if (!value) return null;
  try {
    const path = decodeURIComponent(value);
    if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
      return null;
    }
    return path;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const { saveAuth } = useAuth();
  const { hero, brand } = usePublicCopy();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoSrc, setPhotoSrc] = useState(LOGIN_PHOTO);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await Auth_APIs.login({ email, password });
      const { token, user } = getApiData(response);
      const sessionUser = normalizeAuthUser(user);
      saveAuth(token, sessionUser);

      const redirect = safeInternalPath(searchParams.get("redirect"));
      navigate(redirect ?? defaultAfterLoginPath(sessionUser), { replace: true });
      toast.success(response.data.message || "مرحباً بك");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onPhotoError = () => {
    setPhotoSrc((current) =>
      current.endsWith(LOGIN_FALLBACK) ? current : LOGIN_FALLBACK,
    );
  };

  return (
    <div className="login-page">
      <div className="login-page__backdrop" aria-hidden>
        <img
          src={photoSrc}
          alt=""
          className="login-page__backdrop-photo"
          onError={onPhotoError}
        />
      </div>
      <div className="login-page__veil" aria-hidden />

      <div className="login-shell">
        <section className="login-panel" aria-hidden>
          <img
            src={photoSrc}
            alt=""
            className="login-panel__photo"
            onError={onPhotoError}
          />
          <div className="login-panel__scrim" />
          <div className="login-panel__copy">
            <p className="login-panel__kicker">{hero.rec}</p>
            <p className="login-panel__title">
              {hero.headline}
              <span> {hero.headlineAccent}</span>
            </p>
            <p className="login-panel__brand">{hero.brandLine}</p>
            <p className="login-panel__lead">{hero.lead}</p>
          </div>
        </section>

        <div className="login-card">
          <div className="login-card__top">
            <Link to={ROUTES.HOME} className="login-card__home" aria-label={brand.homeAria}>
              <BrandLogo size="xl" linkToHome={false} />
            </Link>
          </div>

          <div className="login-card__brand">
            <h1 className="login-card__title">تسجيل الدخول</h1>
          </div>

          <form onSubmit={handleSubmit} className="login-card__form">
            <div className="login-field">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                autoComplete="username"
                className="login-field__input"
              />
            </div>
            <div className="login-field">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="login-field__password">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  autoComplete="current-password"
                  className="login-field__input"
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setShowPassword((open) => !open)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="login-card__submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              دخول
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
