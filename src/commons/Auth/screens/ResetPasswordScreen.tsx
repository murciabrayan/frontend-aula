import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFeedback } from "@/context/FeedbackContext";
import "@/commons/Auth/styles/login.css";
import sideImage from "@/assets/login-side.jpg";

import logo from "@/assets/logo.png";

const ResetPasswordScreen = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { showNotice } = useFeedback();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      await showNotice({
        title: "Contraseñas distintas",
        message: "Las contraseñas no coinciden. Verifica e intenta nuevamente.",
        buttonText: "Entendido",
        tone: "warning",
      });
      return;
    }

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/password-reset/${uid}/${token}/`,
        { password }
      );
      await showNotice({
        title: "Contraseña actualizada",
        message:
          res.data.message || "Tu contraseña fue restablecida exitosamente.",
        buttonText: "Ir al inicio",
        tone: "success",
      });
      navigate("/");
    } catch (err: any) {
      await showNotice({
        title: "No se pudo restablecer",
        message:
          err.response?.data?.error ||
          "Ocurrio un error al restablecer la contraseña.",
        buttonText: "Entendido",
        tone: "error",
      });
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
