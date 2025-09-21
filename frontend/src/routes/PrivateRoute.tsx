// src/auth/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth";
import { getStoredToken } from "@/application/utils/tokenUtils";

import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Re-render ante cambios de token SIEMPRE (mock o real)
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((x) => x + 1);
    window.addEventListener("storage", onChange);
    window.addEventListener("auth:token", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("auth:token", onChange);
    };
  }, []);

  // Mientras carga el contexto, puedes mostrar loader
  if (isLoading) {
    return <div className="text-center p-5">Cargando...</div>;
  }

  // Comprueba token “real” almacenado
  const tokenPresent = !!getStoredToken();
  const canPass = isAuthenticated || tokenPresent;

  if (!canPass) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
