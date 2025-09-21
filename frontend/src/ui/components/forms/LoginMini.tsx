import { useTranslation } from "react-i18next";
import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "@/auth";

const LoginMini = () => {
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
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="login-form-container">
      <h3 className="text-center mb-3">Iniciar Sesión</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control form-control-sm"
            placeholder="Contraseña"
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
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default LoginMini;
