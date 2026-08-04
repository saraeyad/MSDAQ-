import { Auth_APIs } from "@/services/api/auth";
import { getApiData } from "@/lib/api-data";
import { normalizeAuthUser, normalizeMeUser } from "@/context/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "./types";

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isInitialized: boolean;
  permissions: string[];
  saveAuth: (token: string, user?: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredAuth(): { token: string | null; user: AuthUser | null } {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return { token: storedToken, user: null };
  }

  try {
    return {
      token: storedToken,
      user: normalizeAuthUser(JSON.parse(storedUser) as AuthUser),
    };
  } catch {
    localStorage.removeItem("user");
    return { token: storedToken, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Defer localStorage reads until after mount so SSR/hydration first paint matches.
  const [auth, setAuth] = useState<{ token: string | null; user: AuthUser | null }>({
    token: null,
    user: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const permissions = useMemo(
    () => auth.user?.permissions ?? [],
    [auth.user?.permissions],
  );

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (perms: string[]) => perms.some((p) => permissions.includes(p)),
    [permissions],
  );

  const saveAuth = (newToken: string, newUser?: AuthUser) => {
    const normalizedUser = newUser ? normalizeAuthUser(newUser) : null;
    localStorage.setItem("token", newToken);
    if (normalizedUser) {
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    }
    setAuth({ token: newToken, user: normalizedUser });
  };

  const logout = () => {
    void Auth_APIs.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  const refreshUser = async () => {
    if (!auth.token) return;
    try {
      const response = await Auth_APIs.me();
      const user = normalizeMeUser(getApiData(response));
      localStorage.setItem("user", JSON.stringify(user));
      setAuth((prev) => ({ ...prev, user }));
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const init = async () => {
      const stored = readStoredAuth();

      if (!stored.token) {
        setAuth(stored);
        setIsInitialized(true);
        return;
      }

      setAuth(stored);

      try {
        const response = await Auth_APIs.me();
        const user = normalizeMeUser(getApiData(response));
        localStorage.setItem("user", JSON.stringify(user));
        setAuth({ token: stored.token, user });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuth({ token: null, user: null });
      } finally {
        setIsInitialized(true);
      }
    };
    void init();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        user: auth.user,
        isInitialized,
        permissions,
        saveAuth,
        logout,
        refreshUser,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
