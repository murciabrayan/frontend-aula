import React, { useEffect, useState } from "react";
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

const PASSWORD_MESSAGE =
  "La contrasena debe tener minimo 8 caracteres, una mayuscula, un numero y un caracter especial.";

const onlyNumbers = (value: string) => value.replace(/\D/g, "");

const isStrongPassword = (value: string) =>
  value.length >= 8 &&
  /[A-Z]/.test(value) &&
  /\d/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

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
      return;
    }

    setFormData(emptyForm(role));
  }, [user, role]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const normalizedValue =
      name === "cedula"
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      showToast({
        type: "warning",
        title: "Sesion expirada",
        message: "Por favor, inicia sesion nuevamente.",
      });
      return;
    }

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

    if (!user && !isStrongPassword(formData.password)) {
      showToast({
        type: "warning",
        title: "Contrasena insegura",
        message: PASSWORD_MESSAGE,
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
        await axios.patch(`http://127.0.0.1:8000/api/users/${user.id}/`, payload, {
          headers,
        });
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
        <div className="modal-shell__header">
          <div>
            <span className="modal-shell__eyebrow">Administracion</span>
            <h2 className="modal-title">
              {user ? "Editar usuario" : "Agregar nuevo usuario"}
            </h2>
            <p className="modal-shell__subtitle">
              Completa la informacion principal del perfil administrativo, docente o estudiantil.
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
            placeholder="Correo electronico"
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

          {!user ? (
            <input
              type="password"
              name="password"
              placeholder="Contrasena"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              title={PASSWORD_MESSAGE}
              required
              className="input-field"
            />
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
                placeholder="Titulo academico"
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
            {user ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
