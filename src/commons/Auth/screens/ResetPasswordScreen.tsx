import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import PasswordRequirements from "@/components/PasswordRequirements";
import { useFeedback } from "@/context/FeedbackContext";
import "@/commons/Auth/styles/login.css";
import sideImage from "@/assets/login-side.jpg";
import logo from "@/assets/logo.png";
import { isStrongPassword } from "@/utils/passwordValidation";

const ResetPasswordScreen = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { showNotice } = useFeedback();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

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

    if (!isStrongPassword(password)) {
      setPasswordTouched(true);
      return;
    }

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/password-reset/${uid}/${token}/`,
        { password },
      );
      await showNotice({
        title: "Contraseña actualizada",
        message: res.data.message || "Tu contraseña fue restablecida exitosamente.",
        buttonText: "Ir al inicio",
        tone: "success",
      });
      navigate("/plataforma");
    } catch (err: any) {
      await showNotice({
        title: "No se pudo restablecer",
        message:
          err.response?.data?.error ||
          "Ocurrió un error al restablecer la contraseña.",
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
              <div className="login-tagline">Restablecer contraseña</div>
            </div>
          </div>

          <div className="login-card">
            <h1>Nueva contraseña</h1>
            <form onSubmit={handleSubmit}>
              <div className="login-password-field">
                <div className="login-password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
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
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
              {confirm && password !== confirm ? (
                <p className="login-inline-error">Las contraseñas no coinciden.</p>
              ) : null}
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
