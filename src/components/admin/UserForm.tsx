import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserManagement.css";
import type { User } from "../../types/User";

interface StudentProfile {
  id?: number;
  grado?: string;
  acudiente_nombre?: string;
  acudiente_telefono?: string;
  acudiente_email?: string;
}

interface TeacherProfile {
  id?: number;
  especialidad?: string;
  titulo?: string;
}

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
  role: "STUDENT" | "TEACHER";
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSave, role }) => {
  const [formData, setFormData] = useState<User>({
    email: "",
    cedula: "",
    first_name: "",
    last_name: "",
    password: "",
    role,
  });

  // 🔹 Cargar datos del usuario si se está editando
  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: "",
        teacher_profile: user.teacher_profile || {},
        student_profile: user.student_profile || {},
      });
    } else {
      setFormData({
        email: "",
        cedula: "",
        first_name: "",
        last_name: "",
        password: "",
        role,
      });
    }
  }, [user, role]);

  // 🔹 Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (role === "TEACHER" && (name === "especialidad" || name === "titulo")) {
      setFormData({
        ...formData,
        teacher_profile: {
          ...formData.teacher_profile,
          [name]: value,
        },
      });
    } else if (
      role === "STUDENT" &&
      ["grado", "acudiente_nombre", "acudiente_telefono", "acudiente_email"].includes(name)
    ) {
      setFormData({
        ...formData,
        student_profile: {
          ...formData.student_profile,
          [name]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 🔹 Guardar o actualizar usuario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("No se encontró el token en localStorage");
      alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    console.log("🔹 Enviando headers:", headers);

    try {
      if (user) {
        // 🔹 Actualizar usuario existente
        await axios.put(
          `http://127.0.0.1:8000/api/users/${user.id}/`,
          formData,
          { headers }
        );
        console.log("✅ Usuario actualizado correctamente");
      } else {
        // 🔹 Crear nuevo usuario
        await axios.post("http://127.0.0.1:8000/api/users/", formData, {
          headers,
        });
        console.log("✅ Usuario creado correctamente");
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error("❌ Error al guardar el usuario:", error);

      if (error.response?.status === 401) {
        alert("Tu sesión ha expirado o el token es inválido. Por favor inicia sesión nuevamente.");
      } else {
        alert("Error al guardar el usuario. Revisa la consola para más detalles.");
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2 className="modal-title">
          {user ? "Editar Usuario" : "Agregar Nuevo Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            name="first_name"
            placeholder="Nombre"
            value={formData.first_name}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Apellido"
            value={formData.last_name}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="text"
            name="cedula"
            placeholder="Cédula"
            value={formData.cedula}
            onChange={handleChange}
            required
            className="input-field"
          />

          {!user && (
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
            />
          )}

          {/* 🔹 Campos adicionales según rol */}
          {role === "TEACHER" && (
            <>
              <input
                type="text"
                name="especialidad"
                placeholder="Especialidad"
                value={formData.teacher_profile?.especialidad || ""}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="titulo"
                placeholder="Título académico"
                value={formData.teacher_profile?.titulo || ""}
                onChange={handleChange}
                className="input-field"
              />
            </>
          )}

          {role === "STUDENT" && (
            <>
              <input
                type="text"
                name="grado"
                placeholder="Grado"
                value={formData.student_profile?.grado || ""}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="acudiente_nombre"
                placeholder="Nombre del acudiente"
                value={formData.student_profile?.acudiente_nombre || ""}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="acudiente_telefono"
                placeholder="Teléfono del acudiente"
                value={formData.student_profile?.acudiente_telefono || ""}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="email"
                name="acudiente_email"
                placeholder="Correo del acudiente"
                value={formData.student_profile?.acudiente_email || ""}
                onChange={handleChange}
                className="input-field"
              />
            </>
          )}

          <button type="submit" className="btn-primary full">
            {user ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
