import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

const API_BASE = "http://127.0.0.1:8000/api";

const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    axios
      .get(`${API_BASE}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch(() => setError("Error al cargar el perfil."));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/profile/`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Perfil actualizado correctamente.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Error al actualizar el perfil.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.post(`${API_BASE}/change-password/`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Contraseña actualizada correctamente.");
      setPasswordData({ old_password: "", new_password: "" });
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña.");
    }
  };

  if (!profile) return <p>Cargando...</p>;

  return (
    <div className="profile-container">
      <h2>Mi Perfil (Estudiante)</h2>

      <form onSubmit={handleSave} className="profile-form">
        <label>Nombre:</label>
        <input
          type="text"
          value={profile.first_name || ""}
          onChange={(e) =>
            setProfile({ ...profile, first_name: e.target.value })
          }
        />

        <label>Apellido:</label>
        <input
          type="text"
          value={profile.last_name || ""}
          onChange={(e) =>
            setProfile({ ...profile, last_name: e.target.value })
          }
        />

        <label>Correo:</label>
        <input
          type="email"
          value={profile.email || ""}
          onChange={(e) =>
            setProfile({ ...profile, email: e.target.value })
          }
        />

        <label>Grado:</label>
        <input
          type="text"
          value={profile.grado || ""}
          onChange={(e) =>
            setProfile({ ...profile, grado: e.target.value })
          }
        />

        <h4>Datos del acudiente</h4>

        <label>Nombre del acudiente:</label>
        <input
          type="text"
          value={profile.acudiente_nombre || ""}
          onChange={(e) =>
            setProfile({ ...profile, acudiente_nombre: e.target.value })
          }
        />

        <label>Teléfono del acudiente:</label>
        <input
          type="text"
          value={profile.acudiente_telefono || ""}
          onChange={(e) =>
            setProfile({ ...profile, acudiente_telefono: e.target.value })
          }
        />

        <label>Correo del acudiente:</label>
        <input
          type="email"
          value={profile.acudiente_email || ""}
          onChange={(e) =>
            setProfile({ ...profile, acudiente_email: e.target.value })
          }
        />

        <button type="submit" className="btn-primary">
          Guardar cambios
        </button>
      </form>

      <button onClick={() => setShowModal(true)} className="btn-secondary">
        Cambiar contraseña
      </button>

      {success && <p className="msg success">{success}</p>}
      {error && <p className="msg error">{error}</p>}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            {/* Botón de cierre elegante */}
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>

            <h3>Cambiar contraseña</h3>

            <div className="modal-input">
              <input
                type="password"
                placeholder="Contraseña actual"
                value={passwordData.old_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    old_password: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-input">
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new_password: e.target.value,
                  })
                }
              />
            </div>

            <div className="modal-buttons">
              <button onClick={handlePasswordChange} className="btn-primary">
                Actualizar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
