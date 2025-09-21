import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/auth";

const LoginDesktop = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      setError(null);
    } catch (err) {
      setError(t("login.error"));
    }
  };

  return (
    <div className="login-desktop-container">
      <div className="card login-desktop-card">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">{t("login.title")}</h2>
          <form onSubmit={handleSubmit} className="login-desktop-form">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder={t("login.username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder={t("login.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary w-100">
              {t("login.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDesktop;
