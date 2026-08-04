import { useAuth } from "@/context/auth";
import { Loader } from "lucide-react";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "./routes";

export default function RequirePermission({
  permission,
  permissions,
  children,
  fallback = ROUTES.NEWSROOM,
}: {
  permission?: string;
  permissions?: string[];
  children: JSX.Element;
  fallback?: string;
}) {
  const { isInitialized, hasPermission, hasAnyPermission } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const allowed = permission
    ? hasPermission(permission)
    : permissions
      ? hasAnyPermission(permissions)
      : true;

  if (!allowed) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
