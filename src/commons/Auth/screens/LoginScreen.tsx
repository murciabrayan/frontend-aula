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

const GoogleMark = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.215 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.338 4.337-17.694 10.691Z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.193l-6.19-5.238C29.142 35.091 26.715 36 24 36c-5.194 0-9.624-3.327-11.286-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.57l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
    />
  </svg>
);

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
                  <div className="login-google-visual" aria-hidden="true">
                    <span className="login-google-visual__icon">
                      <GoogleMark />
                    </span>
                    <span>Continuar con Google</span>
                  </div>
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
