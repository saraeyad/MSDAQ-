import { useAuth } from "@/context/auth";
import { readSessionToken } from "@/lib/auth/session-token";
import { Loader } from "lucide-react";
import type { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./routes";

function SessionLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader className="size-8 animate-spin text-primary" />
    </div>
  );
}

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { token, isInitialized } = useAuth();
  const location = useLocation();
  const sessionToken = token ?? readSessionToken();

  if (!isInitialized || (sessionToken && !token)) {
    return <SessionLoading />;
  }

  if (!sessionToken) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`,
    );
    return (
      <Navigate to={`${ROUTES.LOGIN}?redirect=${redirect}`} replace />
    );
  }

  return children;
}
