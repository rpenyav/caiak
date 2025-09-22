import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth";

declare const __APP_VERSION__: string;

const LoginMini = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const success = await login(username, password);
      if (success) {
        setError(null);
        navigate("/");
      } else {
        setError(t("login.error"));
      }
    } catch (err) {
      setError(t("login.error"));
    }
  };

  return (
    <div className="login-form-container">
      <h3 className="text-center mb-3">{t("login.title")}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control form-control-sm"
            placeholder={t("login.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control form-control-sm"
            placeholder={t("login.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div className="alert alert-danger alert-sm" role="alert">
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-primary btn-sm w-100">
          {t("login.submit")}
        </button>
        <div className="text-center mt-4">
          <small>{`v${__APP_VERSION__} · ${currentYear}`}</small>
        </div>
      </form>
    </div>
  );
};

export default LoginMini;
