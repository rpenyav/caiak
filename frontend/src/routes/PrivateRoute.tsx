// src/auth/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStoredToken } from "@/application/utils/tokenUtils";
import type { JSX } from "react";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);

    const onVisibility = () => {
      if (document.visibilityState === "visible") bump();
    };

    const onAuthToken = () => bump();
    const onAuthExpired = () => bump();

    window.addEventListener("auth:token", onAuthToken);
    window.addEventListener("auth:expired", onAuthExpired as EventListener);
    window.addEventListener("focus", bump);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("auth:token", onAuthToken);
      window.removeEventListener(
        "auth:expired",
        onAuthExpired as EventListener
      );
      window.removeEventListener("focus", bump);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const tokenPresent = !!getStoredToken();
  if (!tokenPresent) return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;
