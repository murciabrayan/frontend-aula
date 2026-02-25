import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, loginWithGoogle } from "@/commons/Auth/services/auth.service";
import { GoogleLogin } from "@react-oauth/google";
import "@/commons/Auth/styles/login.css";

import logo from "@/assets/logo.png";
import sideImage from "@/assets/login-side.jpg";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // 🔹 Login tradicional
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userData = await loginUser(email, password);
      const role = userData?.role;

      if (role === "ADMIN") navigate("/admin");
      else if (role === "TEACHER") navigate("/teacher");
      else if (role === "STUDENT") navigate("/student");
      else setErrorMessage("Rol no autorizado");
    } catch (error) {
      setErrorMessage("Credenciales incorrectas o error de conexión");
    }
  };

  // 🔹 Login con Google
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const googleToken = credentialResponse.credential;

      const userData = await loginWithGoogle(googleToken);
      const role = userData?.role;

      if (role === "ADMIN") navigate("/admin");
      else if (role === "TEACHER") navigate("/teacher");
      else if (role === "STUDENT") navigate("/student");
      else setErrorMessage("Rol no autorizado");
    } catch (error) {
      setErrorMessage("Error al iniciar sesión con Google");
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
                Un camino feliz hacia la construcción del conocimiento
              </div>
            </div>
          </div>

          <div className="login-card">
            <h1>Iniciar Sesión</h1>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button type="submit">Ingresar</button>

              {/* ⭐ BOTÓN GOOGLE */}
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setErrorMessage("Error al iniciar con Google")
                  }
                />
              </div>

              <a
                className="forgot"
                onClick={() => navigate("/forgot-password")}
              >
                ¿Olvidó su contraseña?
              </a>

              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}
            </form>
          </div>
        </div>
      </div>

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
  );
};

export default LoginScreen;