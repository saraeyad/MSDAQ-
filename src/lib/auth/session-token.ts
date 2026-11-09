/** Token written by login. Safe to read during render; absent on the server. */
export function readSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token")?.trim();
  return token ? token : null;
}
