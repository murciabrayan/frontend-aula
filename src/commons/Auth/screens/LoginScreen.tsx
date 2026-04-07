import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import {
  getNextAuthRoute,
  loginUser,
  loginWithGoogle,
} from "@/commons/Auth/services/auth.service";
import { GoogleLogin } from "@react-oauth/google";
import "@/commons/Auth/styles/login.css";

import logo from "@/assets/logo.png";
import sideImage from "@/assets/login-side.jpg";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    try {
      const userData = await loginUser(email, password);
      navigate(getNextAuthRoute(userData));
    } catch {
      setErrorMessage("Credenciales incorrectas o error de conexión");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const googleToken = credentialResponse.credential;
      const userData = await loginWithGoogle(googleToken);
      navigate(getNextAuthRoute(userData));
    } catch {
      setErrorMessage("Error al iniciar sesión con Google");
    }
  };

  return (
    <div className="login-shell">
      <button
        type="button"
        className="login-home-link login-home-link--floating"
        onClick={() => navigate("/")}
      >
        Ir a la página principal
      </button>

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
            <h1>Iniciar sesión</h1>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="login-password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className={isFormValid ? "login-btn active" : "login-btn"}
              >
                Ingresar
              </button>

              <div className="login-social-block">
                <div className="login-social-divider">
                  <span>o continúa con</span>
                </div>

                <div className="login-google-wrap">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErrorMessage("Error al iniciar con Google")}
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="pill"
                    logo_alignment="left"
                    width="312"
                  />
                </div>
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
        }}
        aria-hidden="true"
      ></div>
    </div>
  );
};

export default LoginScreen;
