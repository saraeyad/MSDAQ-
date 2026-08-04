import { useAuth } from "@/context/auth";
import { Loader } from "lucide-react";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES, SUPER_ADMIN_ROLE } from "./routes";

export default function RequireSuperAdmin({
  children,
  fallback = ROUTES.ADMIN,
}: {
  children: JSX.Element;
  fallback?: string;
}) {
  const { isInitialized, user } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSuperAdmin = user?.roles?.includes(SUPER_ADMIN_ROLE) ?? false;

  if (!isSuperAdmin) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
