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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hidrata al montar desde cookie/LS
  useEffect(() => {
    const t = getToken();
    setToken(t);
    setIsAuthenticated(!!t);
    setIsLoading(false);
  }, []);

  // Reacciona a cambios emitidos por tokenUtils (auth:token)
  useEffect(() => {
    const onChange = () => {
      const t = getToken();
      setToken(t);
      setIsAuthenticated(!!t);
    };
    window.addEventListener("auth:token", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("auth:token", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const ok = await loginService(username, password);
    const t = getToken();
    setToken(t);
    setIsAuthenticated(!!t);
    return ok;
  };

  const logout = () => {
    logoutService();
    const t = getToken();
    setToken(t);
    setIsAuthenticated(!!t);
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
