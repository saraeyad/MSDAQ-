import { useAuth } from "@/context/auth";
import { Loader } from "lucide-react";
import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./routes";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { token, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`
    );
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${redirect}`} replace />;
  }

  return children;
}
