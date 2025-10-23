import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "@/commons/Auth/styles/login.css";
import sideImage from "@/assets/login-side.jpg";

import logo from "@/assets/logo.png";

const ResetPasswordScreen = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/password-reset/${uid}/${token}/`,
        { password }
      );
      setMessage(res.data.message || "Contraseña restablecida exitosamente.");
      setTimeout(() => navigate("/"), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al restablecer la contraseña.");
    }
  };

  return (
    <div className="login-shell">
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-header">
            <img src={logo} alt="Logo Institucional" className="login-logo" />
            <div className="login-institution">
              <strong>GIMNASIO LOS CERROS</strong>
              <div className="login-tagline">
                Restablecer contraseña
              </div>
            </div>
          </div>

          <div className="login-card">
            <h1>Nueva contraseña</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button type="submit">Guardar contraseña</button>

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}
            </form>
             <div
  className="login-right"
  style={{
    backgroundImage: `url(${sideImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: "50%",
    height: "100vh",
    position: "absolute",
    top: 0,
    right: 0,
  }}
  aria-hidden="true"
></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
