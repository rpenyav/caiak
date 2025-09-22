// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "@/ui/layout/Layout";
import { getStoredToken } from "@/application/utils/tokenUtils";
import PrivateRoute from "./PrivateRoute";

const LoginPage = lazy(() => import("@/ui/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/ui/pages/DashboardPage"));
const PerfilPage = lazy(() => import("@/ui/pages/PerfilPage"));
const NotFoundPage = lazy(() => import("@/ui/pages/NotFoundPage"));

const AppRoutes = () => {
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

  const hasToken = !!getStoredToken();

  return (
    <>
      <Toaster />
      <Suspense>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate to={hasToken ? "/dashboard" : "/login"} replace />
            }
          />

          <Route
            path="/login"
            element={
              hasToken ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Layout>
                  <LoginPage />
                </Layout>
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Layout>
                  <PerfilPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;
