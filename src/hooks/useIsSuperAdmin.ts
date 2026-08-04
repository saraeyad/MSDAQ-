import { useAuth } from "@/context/auth";
import { SUPER_ADMIN_ROLE } from "@/router/routes";

export function useIsSuperAdmin(): boolean {
  const { user } = useAuth();
  return user?.roles?.includes(SUPER_ADMIN_ROLE) ?? false;
}
