import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/commons/Auth/styles/login.css";
import sideImage from "@/assets/login-side.jpg";
import logo from "@/assets/logo.png";

const API_URL = "http://127.0.0.1:8000/api/password-reset/";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post(API_URL, { email });
      setMessage(res.data.message || "Correo enviado correctamente.");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al enviar el correo.");
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
                Recuperar contraseña
              </div>
            </div>
          </div>

          <div className="login-card">
            <h1>Recuperar contraseña</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Enviar enlace</button>

              {message && <div className="success-message">{message}</div>}
              {error && <div className="error-message">{error}</div>}

              <a className="forgot" onClick={() => navigate("/")}>
                ← Volver al inicio de sesión
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
></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
