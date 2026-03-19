import React, { useEffect, useState } from "react";
import axios from "axios";
import StyledSelect from "@/components/StyledSelect";

const API_BASE = "http://127.0.0.1:8000/api";

interface Props {
  date: string;
  onClose: () => void;
  onSaved: () => void;
}

interface TeacherCourse {
  id: number;
  name?: string;
  nombre?: string;
}

const TeacherEventModal: React.FC<Props> = ({ date, onClose, onSaved }) => {
  const token = localStorage.getItem("access_token");

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"EVENT" | "EXAM" | "ACTIVITY">("EVENT");
  const [course, setCourse] = useState<TeacherCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await axios.get(`${API_BASE}/courses/teacher/course/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);
      } catch (err) {
        console.error("Error cargando curso del docente", err);
        setError("No se pudo cargar tu curso asignado.");
      }
    };

    loadCourse();
  }, [token]);

  const saveEvent = async () => {
    if (!course?.id) {
      setError("No se encontro un curso asignado para crear el evento.");
      return;
    }

    if (!titulo.trim()) {
      setError("El titulo es obligatorio.");
      return;
    }

    setLoading(true);
    setError("");

    const fecha_inicio = `${date}T08:00:00`;
    const fecha_fin = `${date}T09:00:00`;

    try {
      await axios.post(
        `${API_BASE}/calendar/events/`,
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha_inicio,
          fecha_fin,
          tipo,
          curso: course.id,
          materia: null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      await onSaved();
      setShowSuccess(true);

      window.setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error("Error creando evento", err);

      const backendMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        JSON.stringify(err?.response?.data || "");

      setError(
        backendMsg && backendMsg !== '""'
          ? `No se pudo crear el evento: ${backendMsg}`
          : "No se pudo crear el evento.",
      );
    } finally {
      setLoading(false);
    }
  };

  const courseName = course?.name || course?.nombre || "Tu curso";
  const tipoLabel =
    tipo === "EVENT" ? "Evento" : tipo === "EXAM" ? "Evaluacion" : "Actividad";

  return (
    <>
      <div
        className="teacher-calendar-modal-backdrop"
        onClick={(event) => {
          if (event.target === event.currentTarget && !loading) {
            onClose();
          }
        }}
      >
        <div className="teacher-calendar-modal modal-modern">
          <div className="teacher-calendar-modal__header modal-header-modern">
            <div>
              <h2>Nuevo evento</h2>
              <p className="modal-subtitle">
                Crea una actividad para tu curso de forma rapida.
              </p>
            </div>

            <button
              type="button"
              className="teacher-calendar-close-btn"
              onClick={onClose}
              disabled={loading}
            >
              ×
            </button>
          </div>

          <div className="teacher-calendar-modal__body modal-body-modern">
            <div className="meta-row">
              <span className="meta-chip">
                <strong>Curso:</strong> {courseName}
              </span>
              <span className="meta-chip">
                <strong>Fecha:</strong> {date}
              </span>
              <span className="meta-chip meta-chip-dark">{tipoLabel}</span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Titulo</label>
                <input
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Ej: Dia del nino, Examen, Actividad..."
                />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <StyledSelect
                  value={tipo}
                  onChange={(event) =>
                    setTipo(event.target.value as "EVENT" | "EXAM" | "ACTIVITY")
                  }
                >
                  <option value="EVENT">Evento</option>
                  <option value="EXAM">Evaluacion</option>
                  <option value="ACTIVITY">Actividad</option>
                </StyledSelect>
              </div>
            </div>

            <div className="form-group">
              <label>Descripcion (opcional)</label>
              <textarea
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Detalles del evento..."
              />
            </div>

            {error ? <p className="msg error">{error}</p> : null}
          </div>

          <div className="teacher-calendar-modal__footer modal-footer-modern">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={saveEvent}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar evento"}
            </button>
          </div>
        </div>
      </div>

      {showSuccess ? (
        <div className="teacher-calendar-success-backdrop">
          <div className="teacher-calendar-success-modal">
            <div className="teacher-calendar-success-icon">✓</div>
            <h3>Evento creado</h3>
            <p>Se agrego correctamente al calendario.</p>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default TeacherEventModal;
