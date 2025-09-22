// src/auth/authContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  login as loginService,
  logout as logoutService,
  getToken,
} from "./authService";
import type { AuthContextType } from "./types";
import { isTokenExpired } from "@/application/utils/jwt";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const hardLogout = () => {
    // marca estado y ejecuta logoutService (borra tokens + redirige a /login)
    setIsAuthenticated(false);
    logoutService();
  };

  const syncFromStorage = () => {
    const t = getToken();
    setToken(t);
    setIsAuthenticated(Boolean(t) && !isTokenExpired(t as string));
  };

  const checkExpiryAndAct = () => {
    const t = getToken();
    if (!t) {
      setToken(null);
      setIsAuthenticated(false);
      return;
    }
    setToken(t);
    if (isTokenExpired(t)) {
      hardLogout();
    } else {
      setIsAuthenticated(true);
    }
  };

  // Hidrata al montar
  useEffect(() => {
    syncFromStorage();
    setIsLoading(false);
  }, []);

  // Escucha cambios de token + foco/visibilidad + eventos de expiración
  useEffect(() => {
    const refresh = () => {
      syncFromStorage();
      checkExpiryAndAct();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    const onAuthExpired = () => {
      // algún fetch devolvió 401/403 -> caducado o sin permiso -> logout inmediato
      hardLogout();
    };

    window.addEventListener("auth:token", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("auth:expired", onAuthExpired as EventListener);

    return () => {
      window.removeEventListener("auth:token", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(
        "auth:expired",
        onAuthExpired as EventListener
      );
    };
  }, []);

  // 🔁 Chequeo periódico cada 5 minutos
  useEffect(() => {
    // chequeo inmediato al cambiar token
    checkExpiryAndAct();

    const FIVE_MIN = 5 * 60 * 1000;
    const id = window.setInterval(() => {
      checkExpiryAndAct();
    }, FIVE_MIN);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const ok = await loginService(username, password);
    const t = getToken();
    setToken(t);
    setIsAuthenticated(Boolean(t) && !!t && !isTokenExpired(t));
    return ok;
  };

  const logout = () => {
    logoutService();
    const t = getToken();
    setToken(t);
    setIsAuthenticated(Boolean(t) && !!t && !isTokenExpired(t as string));
  };

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, login, logout, token }),
    [isAuthenticated, isLoading, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export { AuthContext };
