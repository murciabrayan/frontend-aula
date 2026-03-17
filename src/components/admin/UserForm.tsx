import React, { useState, useEffect } from "react";
import axios from "axios";
import { useFeedback } from "@/context/FeedbackContext";
import "./UserManagement.css";
import type { User } from "../../types/User";

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
  role: "STUDENT" | "TEACHER";
}

interface UserFormState {
  email: string;
  cedula: string;
  first_name: string;
  last_name: string;
  password: string;
  role: "STUDENT" | "TEACHER";
  grado: string;
  acudiente_nombre: string;
  acudiente_telefono: string;
  acudiente_email: string;
  especialidad: string;
  titulo: string;
}

const emptyForm = (role: "STUDENT" | "TEACHER"): UserFormState => ({
  email: "",
  cedula: "",
  first_name: "",
  last_name: "",
  password: "",
  role,
  grado: "",
  acudiente_nombre: "",
  acudiente_telefono: "",
  acudiente_email: "",
  especialidad: "",
  titulo: "",
});

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSave, role }) => {
  const { showToast } = useFeedback();
  const [formData, setFormData] = useState<UserFormState>(emptyForm(role));

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        cedula: user.cedula || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        password: "",
        role,
        grado: user.student_profile?.grado || "",
        acudiente_nombre: user.student_profile?.acudiente_nombre || "",
        acudiente_telefono: user.student_profile?.acudiente_telefono || "",
        acudiente_email: user.student_profile?.acudiente_email || "",
        especialidad: user.teacher_profile?.especialidad || "",
        titulo: user.teacher_profile?.titulo || "",
      });
    } else {
      setFormData(emptyForm(role));
    }
  }, [user, role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildPayload = () => {
    const basePayload: Record<string, any> = {
      email: formData.email.trim(),
      cedula: formData.cedula.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      role: formData.role,
    };

    if (!user && formData.password.trim()) {
      basePayload.password = formData.password;
    }

    if (role === "TEACHER") {
      basePayload.especialidad = formData.especialidad.trim();
      basePayload.titulo = formData.titulo.trim();
    }

    if (role === "STUDENT") {
      basePayload.grado = formData.grado.trim();
      basePayload.acudiente_nombre = formData.acudiente_nombre.trim();
      basePayload.acudiente_telefono = formData.acudiente_telefono.trim();
      basePayload.acudiente_email = formData.acudiente_email.trim();
    }

    return basePayload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      showToast({
        type: "warning",
        title: "Sesion expirada",
        message: "Por favor, inicia sesion nuevamente.",
      });
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const payload = buildPayload();

    try {
      if (user) {
        await axios.patch(
          `http://127.0.0.1:8000/api/users/${user.id}/`,
          payload,
          { headers }
        );
      } else {
        await axios.post("http://127.0.0.1:8000/api/users/", payload, {
          headers,
        });
      }

      onSave();
      onClose();
      showToast({
        type: "success",
        title: user ? "Usuario actualizado" : "Usuario creado",
        message: user
          ? "Los cambios del usuario se guardaron correctamente."
          : "El usuario se creo correctamente.",
      });
    } catch (error: any) {
      console.error("❌ Error al guardar el usuario:", error);

      const backendErrors = error?.response?.data;

      if (error.response?.status === 401) {
        showToast({
          type: "warning",
          title: "Sesion expirada",
          message: "Tu sesion ha expirado o el token es invalido. Inicia sesion nuevamente.",
        });
        return;
      }

      if (typeof backendErrors === "object" && backendErrors !== null) {
        const firstKey = Object.keys(backendErrors)[0];
        const firstMessage = Array.isArray(backendErrors[firstKey])
          ? backendErrors[firstKey][0]
          : backendErrors[firstKey];

        showToast({
          type: "error",
          title: "Usuario",
          message: firstMessage || "Error al guardar el usuario.",
        });
        return;
      }

      showToast({
        type: "error",
        title: "Usuario",
        message: "Error al guardar el usuario. Revisa los datos e intenta nuevamente.",
      });
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

          {role === "TEACHER" && (
            <>
              <input
                type="text"
                name="especialidad"
                placeholder="Especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="titulo"
                placeholder="Título académico"
                value={formData.titulo}
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
                value={formData.grado}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="acudiente_nombre"
                placeholder="Nombre del acudiente"
                value={formData.acudiente_nombre}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="acudiente_telefono"
                placeholder="Teléfono del acudiente"
                value={formData.acudiente_telefono}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="email"
                name="acudiente_email"
                placeholder="Correo del acudiente"
                value={formData.acudiente_email}
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
