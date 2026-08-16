import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { getApiData, getApiErrorMessage } from "@/lib/api-data";
import { Auth_APIs } from "@/services/api/auth";
import { normalizeAuthUser } from "@/context/types";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await Auth_APIs.login({ email, password });
      const { token, user } = getApiData(response);
      saveAuth(token, normalizeAuthUser(user));

      const redirect = searchParams.get("redirect");
      const hasAdmin = user.permissions?.includes(
        PERMISSIONS.VIEW_ADMIN_DASHBOARD,
      );
      const defaultRoute = hasAdmin ? ROUTES.ADMIN : ROUTES.NEWSROOM;
      navigate(redirect ? decodeURIComponent(redirect) : defaultRoute, {
        replace: true,
      });
      toast.success(response.data.message || "مرحباً بك");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__brand">
          <BrandLogo size="lg" linkToHome={false} />
          <div>
            <h1 className="login-card__title">تسجيل الدخول</h1>
            <p className="login-card__subtitle">منصة CDMC — للموظفين فقط</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            دخول
          </Button>
        </form>
      </div>
    </div>
  );
}
