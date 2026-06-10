export function getUserInitials(name?: string | null, email?: string | null): string {
  const source = (name?.trim() || email?.trim() || "?").replace(/\s+/g, " ");
  const parts = source.split(" ").filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function getUserDisplayName(name?: string | null, email?: string | null): string {
  return name?.trim() || email?.trim() || "";
}
