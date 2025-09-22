import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth";
import { useNavigate } from "react-router-dom";
import LogoCaiak from "../LogoCaiak";
import IconCloseEye from "../icons/IconCloseEye";
import IconOpenEye from "../icons/IconOpenEye";

declare const __APP_VERSION__: string;

const LoginDesktop = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // Estado para togglear visibilidad

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const success = await login(username, password);
      if (success) {
        setError(null);
        navigate("/"); // misma redirección que el mini
      } else {
        setError(t("login.error"));
      }
    } catch {
      setError(t("login.error"));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-desktop-container">
      <div className="card login-desktop-card">
        <div className="card-body">
          <div className="row h-100">
            <div className="col-md-6 d-flex flex-column justify-content-center align-items-center">
              <div className="text-center mb-4">
                <LogoCaiak color="#000" width={250} height={70} />
                <p className="mini-text-login mt-3">
                  conversation artificial inteligence adaptable knowledge
                </p>
                <div className="mini-text-login text-center mt-4">
                  <small>{`v${__APP_VERSION__} · ${currentYear}`}</small>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex flex-column justify-content-center">
              <form onSubmit={handleSubmit} className="login-desktop-form">
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control custom-input-flat"
                    placeholder={t("login.username")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="mb-3 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control custom-input-flat"
                    placeholder={t("login.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <IconCloseEye /> : <IconOpenEye />}
                  </button>
                </div>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                <button type="submit" className="btn btn-send w-100">
                  {t("login.submit")}
                </button>
              </form>
              <div className="text-end">
                <a href="" className="login-link-custom">
                  Recuperar password
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDesktop;
