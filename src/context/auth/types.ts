import type { User } from "@/types";

/** Authenticated session user (same shape as API `User` + optional phone). */
export type AuthUser = User & {
  phone?: string | null;
};

export function normalizeAuthUser(
  raw: Partial<AuthUser> & Pick<AuthUser, "id" | "name" | "email">,
): AuthUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    permissions: raw.permissions ?? [],
    roles: raw.roles ?? [],
    created_at: raw.created_at ?? "",
    phone: raw.phone ?? null,
  };
}

/** Normalize login/me payloads where user may be nested under `data.user`. */
export function normalizeMeUser(
  payload: AuthUser | { user: AuthUser; roles?: string[]; permissions?: string[] },
): AuthUser {
  if ("user" in payload && payload.user) {
    return normalizeAuthUser({
      ...payload.user,
      roles: payload.user.roles ?? payload.roles ?? [],
      permissions: payload.user.permissions ?? payload.permissions ?? [],
    });
  }
  return normalizeAuthUser(payload as AuthUser);
}
