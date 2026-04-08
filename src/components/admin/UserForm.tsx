import React, { useEffect, useState } from "react";

import api from "@/api/axios";
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
  direccion: string;
  rh: string;
  role: "STUDENT" | "TEACHER";
  acudiente_nombre: string;
  acudiente_cedula: string;
  acudiente_telefono: string;
  acudiente_email: string;
  especialidad: string;
  titulo: string;
}

const RH_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const onlyNumbers = (value: string) => value.replace(/\D/g, "");

const emptyForm = (role: "STUDENT" | "TEACHER"): UserFormState => ({
  email: "",
  cedula: "",
  first_name: "",
  last_name: "",
  direccion: "",
  rh: "",
  role,
  acudiente_nombre: "",
  acudiente_cedula: "",
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
        direccion: user.direccion || "",
        rh: user.rh || "",
        role,
        acudiente_nombre: user.student_profile?.acudiente_nombre || "",
        acudiente_cedula: user.student_profile?.acudiente_cedula || "",
        acudiente_telefono: user.student_profile?.acudiente_telefono || "",
        acudiente_email: user.student_profile?.acudiente_email || "",
        especialidad: user.teacher_profile?.especialidad || "",
        titulo: user.teacher_profile?.titulo || "",
      });
      return;
    }

    setFormData(emptyForm(role));
  }, [user, role]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const normalizedValue =
      name === "cedula"
        ? onlyNumbers(value)
        : name === "acudiente_cedula"
          ? onlyNumbers(value)
        : name === "acudiente_telefono"
          ? onlyNumbers(value).slice(0, 10)
          : value;

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  const buildPayload = () => {
    const basePayload: Record<string, string> = {
      email: formData.email.trim(),
      cedula: formData.cedula.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      direccion: formData.direccion.trim(),
      rh: formData.rh,
      role: formData.role,
    };

    if (role === "TEACHER") {
      basePayload.especialidad = formData.especialidad.trim();
      basePayload.titulo = formData.titulo.trim();
    }

    if (role === "STUDENT") {
      basePayload.acudiente_nombre = formData.acudiente_nombre.trim();
      basePayload.acudiente_cedula = formData.acudiente_cedula.trim();
      basePayload.acudiente_telefono = formData.acudiente_telefono.trim();
      basePayload.acudiente_email = formData.acudiente_email.trim();
    }

    return basePayload;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.email.includes("@")) {
      showToast({
        type: "warning",
        title: "Correo invalido",
        message: "Ingresa un correo valido que incluya arroba.",
      });
      return;
    }

    if (!formData.cedula.trim()) {
      showToast({
        type: "warning",
        title: "Cedula",
        message: "La cedula es obligatoria y solo puede contener numeros.",
      });
      return;
    }

    if (!formData.direccion.trim()) {
      showToast({
        type: "warning",
        title: "Direccion",
        message: "La direccion es obligatoria.",
      });
      return;
    }

    if (!formData.rh) {
      showToast({
        type: "warning",
        title: "RH",
        message: "Selecciona el RH del usuario.",
      });
      return;
    }

    if (
      role === "STUDENT" &&
      formData.acudiente_telefono &&
      formData.acudiente_telefono.length !== 10
    ) {
      showToast({
        type: "warning",
        title: "Telefono",
        message: "El telefono del acudiente debe tener exactamente 10 numeros.",
      });
      return;
    }

    const payload = buildPayload();

    try {
      let response;
      if (user) {
        response = await api.patch(`/api/users/${user.id}/`, payload);
      } else {
        response = await api.post("/api/users/", payload);
      }

      onSave();
      onClose();
      const warningMessage = response?.data?.warning;
      const warningDetail = response?.data?.warning_detail;
      showToast(
        warningMessage
          ? {
              type: "warning",
              title: user ? "Usuario actualizado" : "Usuario creado con advertencia",
              message: warningDetail
                ? `${warningMessage} Detalle: ${warningDetail}`
                : warningMessage,
              duration: 7000,
            }
          : {
              type: "success",
              title: user ? "Usuario actualizado" : "Usuario creado",
              message: user
                ? "Los cambios del usuario se guardaron correctamente."
                : "El usuario se cre? y la contraseña temporal fue enviada al correo.",
            }
      );
    } catch (error: any) {
      const backendErrors = error?.response?.data;

      if (error.response?.status === 401) {
        showToast({
          type: "warning",
          title: "Sesión expirada",
          message: "Tu sesión ha expirado o el token es inválido. Inicia sesión nuevamente.",
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
        <div className="modal-shell__header">
          <div>
            <span className="modal-shell__eyebrow">Administracion</span>
            <h2 className="modal-title">
              {user ? "Editar usuario" : "Agregar nuevo usuario"}
            </h2>
            <p className="modal-shell__subtitle">
              Completa la información principal. La contraseña inicial se generará automáticamente y se enviará al correo del usuario.
            </p>
          </div>

          <button className="close-btn" onClick={onClose} aria-label="Cerrar modal">
            x
          </button>
        </div>

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
            onInvalid={(e) =>
              e.currentTarget.setCustomValidity("Ingresa un correo valido que incluya arroba.")
            }
            onInput={(e) => e.currentTarget.setCustomValidity("")}
            required
            className="input-field"
          />

          <input
            type="text"
            name="cedula"
            placeholder="Cedula"
            value={formData.cedula}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={20}
            required
            className="input-field"
          />

          <input
            type="text"
            name="direccion"
            placeholder="Direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
            className="input-field"
          />

          <select
            name="rh"
            value={formData.rh}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Selecciona el RH</option>
            {RH_OPTIONS.map((rh) => (
              <option key={rh} value={rh}>
                {rh}
              </option>
            ))}
          </select>

          {!user ? (
            <div className="user-form__generated-password">
              La contraseña temporal se asignará automáticamente y se enviará al correo ingresado.
            </div>
          ) : null}

          {role === "TEACHER" ? (
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
          ) : null}

          {role === "STUDENT" ? (
            <>
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
                name="acudiente_cedula"
                placeholder="Cedula del acudiente"
                value={formData.acudiente_cedula}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={20}
                className="input-field"
              />
              <input
                type="text"
                name="acudiente_telefono"
                placeholder="Telefono del acudiente"
                value={formData.acudiente_telefono}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
                className="input-field"
              />
              <input
                type="email"
                name="acudiente_email"
                placeholder="Correo del acudiente"
                value={formData.acudiente_email}
                onChange={handleChange}
                onInvalid={(e) =>
                  e.currentTarget.setCustomValidity("Ingresa un correo valido que incluya arroba.")
                }
                onInput={(e) => e.currentTarget.setCustomValidity("")}
                className="input-field"
              />
            </>
          ) : null}

          <button type="submit" className="btn-primary full">
            {user ? "Guardar cambios" : "Crear usuario"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
