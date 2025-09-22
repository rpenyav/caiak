import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Layout from "@/ui/layout/Layout";
import { getStoredToken } from "@/application/utils/tokenUtils";
import PrivateRoute from "./PrivateRoute";

const chatMode = import.meta.env.VITE_CHAT_MODE as "mini" | "desktop";

const LoginPage = lazy(() => import("@/ui/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/ui/pages/DashboardPage"));
const PerfilPage = lazy(() => import("@/ui/pages/PerfilPage"));
const SettingsPage = lazy(() => import("@/ui/pages/SettingsPage")); // si aún no existe, crea el stub
const ChatPage = lazy(() => import("@/ui/pages/ChatPage")); // 👈 IMPORTANTE
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
          {/* redirección inicial: seguimos enviando a /dashboard */}
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

          {/* 👇 En MINI -> ChatPage; en DESKTOP -> DashboardPage */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  {chatMode === "mini" ? <ChatPage /> : <DashboardPage />}
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

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <SettingsPage />
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
