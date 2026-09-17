import React, { useEffect, useState } from "react";

import api from "@/api/axios";
import { useFeedback } from "@/context/FeedbackContext";
import type { GeneratedCredentials, User } from "../../types/User";
import { PARENTESCO_OPTIONS } from "../../types/User";
import "./UserManagement.css";

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
  onCreatedCredentials?: (credentials: GeneratedCredentials) => void;
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
  acudiente_parentesco: string;
  acudiente2_nombre: string;
  acudiente2_cedula: string;
  acudiente2_telefono: string;
  acudiente2_email: string;
  acudiente2_parentesco: string;
  especialidad: string;
  titulo: string;
  telefono: string;
}

const RH_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const onlyNumbers = (value: string) => value.replace(/\D/g, "");
const removeDigits = (value: string) => value.replace(/\d/g, "");
const TEXT_ONLY_FIELDS = new Set([
  "first_name",
  "last_name",
  "acudiente_nombre",
  "acudiente2_nombre",
  "especialidad",
  "titulo",
]);
const NUMERIC_FIELDS = new Set(["cedula", "acudiente_cedula", "acudiente2_cedula"]);
const PHONE_FIELDS = new Set(["acudiente_telefono", "acudiente2_telefono", "telefono"]);

const STUDENT_DOCUMENT_LABEL = "Tarjeta de identidad";

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
  acudiente_parentesco: "",
  acudiente2_nombre: "",
  acudiente2_cedula: "",
  acudiente2_telefono: "",
  acudiente2_email: "",
  acudiente2_parentesco: "",
  especialidad: "",
  titulo: "",
  telefono: "",
});

const UserForm: React.FC<UserFormProps> = ({
  user,
  onClose,
  onSave,
  onCreatedCredentials,
  role,
}) => {
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
        acudiente_parentesco: user.student_profile?.acudiente_parentesco || "",
        acudiente2_nombre: user.student_profile?.acudiente2_nombre || "",
        acudiente2_cedula: user.student_profile?.acudiente2_cedula || "",
        acudiente2_telefono: user.student_profile?.acudiente2_telefono || "",
        acudiente2_email: user.student_profile?.acudiente2_email || "",
        acudiente2_parentesco: user.student_profile?.acudiente2_parentesco || "",
        especialidad: user.teacher_profile?.especialidad || "",
        titulo: user.teacher_profile?.titulo || "",
        telefono: user.teacher_profile?.telefono || "",
      });
      return;
    }

    setFormData(emptyForm(role));
  }, [user, role]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const normalizedValue = NUMERIC_FIELDS.has(name)
      ? onlyNumbers(value)
      : PHONE_FIELDS.has(name)
        ? onlyNumbers(value).slice(0, 10)
        : TEXT_ONLY_FIELDS.has(name)
          ? removeDigits(value)
          : value;

    setFormData((prev) => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  const buildPayload = () => {
    const basePayload: Record<string, string> = {
      cedula: formData.cedula.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      direccion: formData.direccion.trim(),
      rh: formData.rh,
      role: formData.role,
    };

    if (role === "TEACHER") {
      basePayload.email = formData.email.trim();
      basePayload.especialidad = formData.especialidad.trim();
      basePayload.titulo = formData.titulo.trim();
      basePayload.telefono = formData.telefono.trim();
    }

    if (role === "STUDENT") {
      basePayload.acudiente_nombre = formData.acudiente_nombre.trim();
      basePayload.acudiente_cedula = formData.acudiente_cedula.trim();
      basePayload.acudiente_telefono = formData.acudiente_telefono.trim();
      basePayload.acudiente_email = formData.acudiente_email.trim();
      basePayload.acudiente_parentesco = formData.acudiente_parentesco;

      // Acudiente 2 (opcional): se envia solo si escribieron algun dato.
      const acudiente2Filled =
        formData.acudiente2_nombre.trim() ||
        formData.acudiente2_cedula.trim() ||
        formData.acudiente2_telefono.trim() ||
        formData.acudiente2_email.trim() ||
        formData.acudiente2_parentesco;
      if (acudiente2Filled) {
        basePayload.acudiente2_nombre = formData.acudiente2_nombre.trim();
        basePayload.acudiente2_cedula = formData.acudiente2_cedula.trim();
        basePayload.acudiente2_telefono = formData.acudiente2_telefono.trim();
        basePayload.acudiente2_email = formData.acudiente2_email.trim();
        basePayload.acudiente2_parentesco = formData.acudiente2_parentesco;
      }
    }

    return basePayload;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (role === "TEACHER" && !formData.email.includes("@")) {
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
        title: role === "STUDENT" ? STUDENT_DOCUMENT_LABEL : "Cedula",
        message:
          role === "STUDENT"
            ? "La tarjeta de identidad es obligatoria y solo puede contener numeros."
            : "La cedula es obligatoria y solo puede contener numeros.",
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

    if (role === "TEACHER" && !user && formData.telefono.length !== 10) {
      showToast({
        type: "warning",
        title: "Telefono",
        message: "El telefono del docente debe tener exactamente 10 numeros.",
      });
      return;
    }

    if (role === "STUDENT" && formData.acudiente_telefono.length !== 10) {
      showToast({
        type: "warning",
        title: "Telefono",
        message: "El telefono del acudiente debe tener exactamente 10 numeros.",
      });
      return;
    }

    if (role === "STUDENT" && !user && !formData.acudiente_parentesco) {
      showToast({
        type: "warning",
        title: "Parentesco",
        message: "Selecciona el parentesco del acudiente.",
      });
      return;
    }

    if (role === "STUDENT") {
      const acudiente2Filled =
        formData.acudiente2_nombre.trim() ||
        formData.acudiente2_cedula.trim() ||
        formData.acudiente2_telefono.trim() ||
        formData.acudiente2_email.trim() ||
        formData.acudiente2_parentesco;
      if (acudiente2Filled) {
        if (
          !formData.acudiente2_nombre.trim() ||
          !formData.acudiente2_cedula.trim() ||
          formData.acudiente2_telefono.length !== 10 ||
          !formData.acudiente2_parentesco
        ) {
          showToast({
            type: "warning",
            title: "Segundo acudiente",
            message:
              "Completa nombre, cedula, telefono (10 numeros) y parentesco del segundo acudiente, o dejalo totalmente vacio.",
          });
          return;
        }
      }
    }

    const payload = buildPayload();

    try {
      const response = user
        ? await api.patch(`/api/users/${user.id}/`, payload)
        : await api.post("/api/users/", payload);

      await onSave();

      if (!user && response?.data?.credentials && onCreatedCredentials) {
        onCreatedCredentials(response.data.credentials);
      }

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
                : role === "STUDENT"
                  ? "El estudiante fue creado y las credenciales quedaron listas para descarga."
                  : "El docente fue creado y la credencial temporal fue generada.",
            },
      );
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
            <h2 className="modal-title">{user ? "Editar usuario" : "Agregar nuevo usuario"}</h2>
            <p className="modal-shell__subtitle">
              {role === "STUDENT"
                ? "El estudiante ingresara con su tarjeta de identidad. Al guardar veras la clave temporal para entregarla manualmente."
                : "Completa la informacion principal. El docente ingresara con su correo y recibira una clave temporal."}
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

          {role === "TEACHER" ? (
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
          ) : null}

          <input
            type="text"
            name="cedula"
            placeholder={role === "STUDENT" ? STUDENT_DOCUMENT_LABEL : "Cedula"}
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

          <select name="rh" value={formData.rh} onChange={handleChange} required className="input-field">
            <option value="">Selecciona el RH</option>
            {RH_OPTIONS.map((rh) => (
              <option key={rh} value={rh}>
                {rh}
              </option>
            ))}
          </select>

          {!user ? (
            <div className="user-form__generated-password">
              {role === "STUDENT"
                ? "El sistema generara una clave temporal y te mostrara un comprobante descargable para entregar al estudiante."
                : "La contrasena temporal se generara automaticamente y se mostrara al finalizar."}
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
                placeholder="Titulo academico"
                value={formData.titulo}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="telefono"
                placeholder="Telefono del docente"
                value={formData.telefono}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
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
              <select
                name="acudiente_parentesco"
                value={formData.acudiente_parentesco}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Parentesco del acudiente</option>
                {PARENTESCO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="form-section-divider">
                Segundo acudiente (opcional)
              </div>
              <input
                type="text"
                name="acudiente2_nombre"
                placeholder="Nombre del segundo acudiente"
                value={formData.acudiente2_nombre}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="text"
                name="acudiente2_cedula"
                placeholder="Cedula del segundo acudiente"
                value={formData.acudiente2_cedula}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={20}
                className="input-field"
              />
              <input
                type="text"
                name="acudiente2_telefono"
                placeholder="Telefono del segundo acudiente"
                value={formData.acudiente2_telefono}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={10}
                className="input-field"
              />
              <select
                name="acudiente2_parentesco"
                value={formData.acudiente2_parentesco}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Parentesco del segundo acudiente</option>
                {PARENTESCO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
