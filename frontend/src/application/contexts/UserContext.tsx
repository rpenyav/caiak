// src/application/context/UserContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@/domain/models/User";

import { UserService } from "@/application/services/UserService";
import { UserRepository } from "@/core/repositories";
import { getStoredToken } from "@/application/utils/tokenUtils";

type RegisterInput = {
  email: string;
  password: string;
  roles: string[];
};

type UserContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (data: RegisterInput) => Promise<User>;
  refresh: () => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const repo = useMemo(() => new UserRepository(), []);
  const service = useMemo(() => new UserService(repo), [repo]);

  const loadUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const u = await service.getCurrentUser();
      setUser(u);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar el usuario");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    const onToken = () => {
      void loadUser();
    };
    const onExpired = () => {
      setUser(null);
      setError(null);
      setLoading(false);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void loadUser();
    };

    window.addEventListener("auth:token", onToken);
    window.addEventListener("auth:expired", onExpired as EventListener);
    window.addEventListener("focus", onToken);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("auth:token", onToken);
      window.removeEventListener("auth:expired", onExpired as EventListener);
      window.removeEventListener("focus", onToken);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadUser]);

  const register = useCallback(
    async (data: RegisterInput) => {
      setError(null);
      const created = await service.register(data);
      return created;
    },
    [service]
  );

  const refresh = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const logout = useCallback(() => {
    service.logout();
    setUser(null);
  }, [service]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      loading,
      error,
      register,
      refresh,
      logout,
      setUser,
    }),
    [user, loading, error, register, refresh, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser debe usarse dentro de un <UserProvider>");
  }
  return ctx;
}
