import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, loginWithGoogle } from "@/commons/Auth/services/auth.service";
import logo from "@/assets/logo.png";

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
      if (user.must_change_password) {
        navigate("/primer-acceso");
      }
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
      if (user.must_change_password) {
        navigate("/primer-acceso");
      }
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
            <GoogleLogin
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
