import { useState } from "react";
import { X } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, loginWithGoogle } from "@/commons/Auth/services/auth.service";
import logo from "@/assets/logo.png";

interface Props {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

const LandingLoginModal = ({ open, onClose, onAuthenticated }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await loginUser(email, password);
      onAuthenticated();
      onClose();
    } catch (error) {
      setErrorMessage("Credenciales incorrectas o error de conexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setErrorMessage("");
      await loginWithGoogle(credentialResponse.credential);
      onAuthenticated();
      onClose();
    } catch (error) {
      setErrorMessage("Error al iniciar sesion con Google.");
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
          aria-label="Cerrar inicio de sesion"
        >
          <X size={18} />
        </button>

        <div className="landing-login__brand">
          <img src={logo} alt="Logo institucional" className="landing-login__logo" />
          <span className="landing-section-tag">Acceso institucional</span>
          <h2>Inicia sesion</h2>
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
            <span>Contrasena</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contrasena"
              required
            />
          </label>

          <button
            type="submit"
            className="landing-btn landing-btn--primary landing-login__submit"
            disabled={!isFormValid || loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesion"}
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
