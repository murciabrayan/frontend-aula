import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

interface Props {
  date: string; // "YYYY-MM-DD"
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

  // ✅ success toast
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await axios.get(`${API_BASE}/courses/teacher/course/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);
      } catch (e) {
        console.error("Error cargando curso del docente", e);
        setError("No se pudo cargar tu curso asignado.");
      }
    };

    loadCourse();
  }, [token]);

  const saveEvent = async () => {
    if (!course?.id) {
      setError("No se encontró un curso asignado para crear el evento.");
      return;
    }
    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setLoading(true);
    setError("");

    // backend espera DateTimeField
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // refrescar calendario
      await onSaved();

      // ✅ mostrar confirmación bonita
      setShowSuccess(true);

      // cerrar automático
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Error creando evento", err);

      const backendMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        JSON.stringify(err?.response?.data || "");

      setError(
        backendMsg && backendMsg !== '""'
          ? `No se pudo crear el evento: ${backendMsg}`
          : "No se pudo crear el evento."
      );
    } finally {
      setLoading(false);
    }
  };

  const courseName = course?.name || course?.nombre || "Tu curso";

  const tipoLabel =
    tipo === "EVENT" ? "Evento" : tipo === "EXAM" ? "Evaluación" : "Actividad";

  return (
    <>
      <div
        className="modal-backdrop"
        onClick={(e) => {
          if (e.target === e.currentTarget && !loading) onClose();
        }}
      >
        <div className="modal-premium modal-modern">
          <div className="modal-header-fixed modal-header-modern">
            <div>
              <h2>Nuevo evento</h2>
              <p className="modal-subtitle">
                Crea una actividad para tu curso de forma rápida.
              </p>
            </div>

            <button className="close-btn" onClick={onClose} disabled={loading}>
              ✕
            </button>
          </div>

          <div className="modal-body modal-body-modern">
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
                <label>Título</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Día del niño, Examen, Actividad..."
                />
              </div>

              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                >
                  <option value="EVENT">Evento</option>
                  <option value="EXAM">Evaluación</option>
                  <option value="ACTIVITY">Actividad</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles del evento..."
              />
            </div>

            {error && <p className="msg error">{error}</p>}
          </div>

          <div className="modal-footer modal-footer-modern">
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={saveEvent}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar evento"}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ MINI MODAL ÉXITO */}
      {showSuccess && (
        <div className="success-backdrop">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h3>Evento creado</h3>
            <p>Se agregó correctamente al calendario.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherEventModal;