import React, { useEffect, useState } from "react";
import axios from "axios";
import "@/commons/personas/styles/adminDashboard.css";

const API_BASE = "http://127.0.0.1:8000/api";

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Datos del perfil:", res.data);
        setProfile(res.data);
      } catch {
        setError("Error al cargar perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      await axios.put(`${API_BASE}/profile/`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Perfil actualizado correctamente.");
      setEditing(false);
    } catch {
      setError("Error al actualizar perfil.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const res = await axios.post(
        `${API_BASE}/change-password/`,
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data.message || "Contraseña actualizada correctamente.");
      setOldPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cambiar contraseña.");
    }
  };

  if (loading) return <p>Cargando datos...</p>;
  if (!profile) return <p>No se pudo cargar el perfil.</p>;

  return (
    <div className="admin-profile-container" style={{ padding: "40px" }}>
      <h2 className="titulo" style={{ marginBottom: "20px" }}>
        Mi Perfil de Administrador
      </h2>

      {/* Mensajes */}
      {success && (
        <div
          style={{
            backgroundColor: "#d1fae5",
            color: "#065f46",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
          }}
        >
          ✅ {success}
        </div>
      )}
      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Información del perfil */}
      <div
        className="profile-section"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          padding: "25px",
          marginBottom: "40px",
          width: "500px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Datos personales</h3>

        {!editing ? (
          <div>
            <p>
              <strong>Nombre:</strong> {profile.first_name}
            </p>
            <p>
              <strong>Apellido:</strong> {profile.last_name}
            </p>
            <p>
              <strong>Correo:</strong> {profile.email}
            </p>

            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: "15px",
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "10px 15px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <input
              type="text"
              value={profile.first_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
              placeholder="Nombre"
            />
            <input
              type="text"
              value={profile.last_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
              placeholder="Apellido"
            />
            <input
              type="email"
              value={profile.email || ""}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              placeholder="Correo electrónico"
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button type="submit" className="btn-primary">
                Guardar Cambios
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Cambiar contraseña */}
      <div
        className="password-section"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          padding: "25px",
          width: "500px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>Cambiar Contraseña</h3>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Contraseña actual"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            style={{
              marginTop: "10px",
              backgroundColor: "#16a34a",
              color: "#fff",
              padding: "10px 15px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
