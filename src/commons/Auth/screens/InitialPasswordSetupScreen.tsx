import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import logo from "@/assets/logo.png";
import sideImage from "@/assets/login-side.jpg";
import PasswordRequirements from "@/components/PasswordRequirements";
import {
  completeInitialPassword,
  getCurrentUser,
  getDashboardRoute,
  logoutUser,
} from "@/commons/Auth/services/auth.service";
import { isStrongPassword } from "@/utils/passwordValidation";
import "@/commons/Auth/styles/login.css";

const InitialPasswordSetupScreen = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/plataforma", { replace: true });
      return;
    }

    if (!currentUser.must_change_password) {
      navigate(getDashboardRoute(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (!isStrongPassword(password)) {
      setPasswordTouched(true);
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      await completeInitialPassword(password);
      const refreshedUser = getCurrentUser();
      navigate(getDashboardRoute(refreshedUser?.role), { replace: true });
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error ||
          "No fue posible actualizar la contraseña. Intenta nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="login-shell">
      <button
        type="button"
        className="login-home-link login-home-link--floating"
        onClick={() => {
          logoutUser();
          navigate("/plataforma");
        }}
      >
        Salir
      </button>

      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-header">
            <img src={logo} alt="Logo Institucional" className="login-logo" />
            <div className="login-institution">
              <strong>GIMNASIO LOS CERROS</strong>
              <div className="login-tagline">Primer ingreso seguro</div>
            </div>
          </div>

          <div className="login-card">
            <h1>Crea tu nueva contraseña</h1>
            <p className="login-first-access-copy">
              Tu cuenta ya fue creada. Antes de entrar a la plataforma debes cambiar la
              contraseña temporal por una propia.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="login-password-field">
                <div className="login-password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordTouched(true);
                    }}
                    onBlur={() => setPasswordTouched(true)}
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
                {(passwordTouched || password) ? (
                  <PasswordRequirements password={password} />
                ) : null}
              </div>

              <div className="login-password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {confirmPassword && password !== confirmPassword ? (
                <p className="login-inline-error">Las contraseñas no coinciden.</p>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className={saving ? "login-btn" : "login-btn active"}
              >
                {saving ? "Guardando..." : "Actualizar contraseña"}
              </button>

              {errorMessage ? <div className="error-message">{errorMessage}</div> : null}
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

export default InitialPasswordSetupScreen;
