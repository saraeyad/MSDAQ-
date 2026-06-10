export type UserRole = "admin" | "journalist" | "normal_user" | null;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: number | string | null;
  created_at: string;
};
