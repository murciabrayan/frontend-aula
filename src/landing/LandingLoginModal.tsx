import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import {
  getNextAuthRoute,
  loginUser,
  loginWithGoogle,
} from "@/commons/Auth/services/auth.service";
import logo from "@/assets/logo.png";

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

interface Props {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

const LandingLoginModal = ({ open, onClose, onAuthenticated }: Props) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || loading) return;

    try {
      setLoading(true);
      setErrorMessage("");
      const user = await loginUser(email, password);
      onAuthenticated();
      onClose();
      navigate(getNextAuthRoute(user));
    } catch {
      setErrorMessage("Credenciales incorrectas o error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const user = await loginWithGoogle(credentialResponse.credential);
      onAuthenticated();
      onClose();
      navigate(getNextAuthRoute(user));
    } catch {
      setErrorMessage("Error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-login__overlay" onClick={onClose}>
      <div className="landing-login" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="landing-login__close"
          onClick={onClose}
          aria-label="Cerrar inicio de sesión"
        >
          <X size={18} />
        </button>

        <div className="landing-login__brand">
          <img src={logo} alt="Logo institucional" className="landing-login__logo" />
          <span className="landing-section-tag">Acceso institucional</span>
          <h2>Inicia sesión</h2>
          <p>
            Usa las mismas credenciales de la plataforma institucional para continuar.
          </p>
        </div>

        <form className="landing-login__form" onSubmit={handleSubmit}>
          <label>
            <span>Correo institucional</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@institucion.edu.co"
              required
            />
          </label>

          <label>
            <span>Contraseña</span>
            <div className="landing-login__password-input">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                className="landing-login__password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="landing-btn landing-btn--primary landing-login__submit"
            disabled={!isFormValid || loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <div className="landing-login__google">
            <div className="landing-login__google-visual" aria-hidden="true">
              <span className="landing-login__google-icon">
                <GoogleMark />
              </span>
              <span>Continuar con Google</span>
            </div>
            <GoogleLogin
              width="100%"
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMessage("Error al iniciar con Google.")}
            />
          </div>

          {errorMessage ? <div className="landing-login__error">{errorMessage}</div> : null}
        </form>
      </div>
    </div>
  );
};

export default LandingLoginModal;
