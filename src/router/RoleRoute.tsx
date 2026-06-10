import { useAuth } from "@/context/auth";
import type { UserRole } from "@/context/types";
import { Loader } from "lucide-react";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "./routes";

export default function RoleRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: Exclude<UserRole, null>[];
}) {
  const { token, user, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) return <Navigate to={ROUTES.LOGIN} replace />;

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
}
