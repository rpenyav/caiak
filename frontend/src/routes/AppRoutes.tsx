import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import PrivateRoute from "./PrivateRoute";
import { useAuth } from "@/auth";
import { Toaster } from "react-hot-toast";
import Layout from "@/ui/layout/Layout";

// Páginas
const LoginPage = lazy(() => import("@/ui/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/ui/pages/DashboardPage"));
const PerfilPage = lazy(() => import("@/ui/pages/PerfilPage"));
const NotFoundPage = lazy(() => import("@/ui/pages/NotFoundPage"));

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<div className="text-center p-5">Cargando...</div>}>
        <Routes>
          {/* Redirección raíz */}
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />

          {/* Login */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Layout>
                  <LoginPage />
                </Layout>
              )
            }
          />

          {/* Rutas protegidas dentro del layout */}
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

          {/* Página no encontrada */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;
