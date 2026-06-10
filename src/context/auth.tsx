import { clearJournalistRequestPending } from "@/lib/journalist-request-status";
import { Auth_APIs } from "@/services/api/auth";
import { normalizeAuthUser } from "@/services/types/auth";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "./types";

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isInitialized: boolean;
  saveAuth: (token: string, user?: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredAuth(): { token: string | null; user: AuthUser | null } {
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
  const [auth, setAuth] = useState(readStoredAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  const saveAuth = (newToken: string, newUser?: AuthUser) => {
    const normalizedUser = newUser ? normalizeAuthUser(newUser) : null;

    localStorage.setItem("token", newToken);
    if (normalizedUser) {
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    }

    setAuth({ token: newToken, user: normalizedUser });
  };

  const logout = () => {
    clearJournalistRequestPending();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  const refreshUser = async () => {
    if (!auth.token) return;

    try {
      const response = await Auth_APIs.me();
      if (!response.data.error && response.data.data) {
        const user = normalizeAuthUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(user));
        setAuth((prev) => ({ ...prev, user }));
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!auth.token) {
        setIsInitialized(true);
        return;
      }

      try {
        const response = await Auth_APIs.me();
        if (!response.data.error && response.data.data) {
          const user = normalizeAuthUser(response.data.data);
          localStorage.setItem("user", JSON.stringify(user));
          setAuth({ token: auth.token, user });
        }
      } catch {
        logout();
      } finally {
        setIsInitialized(true);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token: auth.token,
        user: auth.user,
        isInitialized,
        saveAuth,
        logout,
        refreshUser,
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
