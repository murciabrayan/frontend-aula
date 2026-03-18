import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useFeedback } from "@/context/FeedbackContext";
import sideImage from "@/assets/login-side.jpg";
import logo from "@/assets/logo.png";
import "@/commons/Auth/styles/login.css";

const API_URL = "http://127.0.0.1:8000/api/password-reset/";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const { showNotice } = useFeedback();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(API_URL, { email });
      await showNotice({
        title: "Correo enviado",
        message:
          res.data.message ||
          "Te enviamos un enlace para restablecer tu contrasena.",
        buttonText: "Volver",
        tone: "success",
      });
      navigate("/plataforma");
    } catch (err: any) {
      await showNotice({
        title: "No se pudo enviar",
        message:
          err.response?.data?.error ||
          "Ocurrio un error al enviar el correo de recuperacion.",
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
              <div className="login-tagline">Recuperar contrasena</div>
            </div>
          </div>

          <div className="login-card">
            <h1>Recuperar contrasena</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Correo electronico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Enviar enlace</button>

              <a className="forgot" onClick={() => navigate("/plataforma")}>
                Volver al inicio de sesion
              </a>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
