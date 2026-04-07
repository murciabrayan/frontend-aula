import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import StyledSelect from "@/components/StyledSelect";

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
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"EVENT" | "EXAM" | "ACTIVITY">("EVENT");
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get("/api/courses/");
        const availableCourses = res.data || [];
        setCourses(availableCourses);
        setSelectedCourseId(availableCourses[0]?.id || "");
      } catch (err) {
        console.error("Error cargando cursos del docente", err);
        setError("No se pudieron cargar tus cursos disponibles.");
      }
    };

    loadCourses();
  }, []);

  const saveEvent = async () => {
    if (!selectedCourseId) {
      setError("Debes seleccionar un curso para crear el evento.");
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
      await api.post(
        "/api/calendar/events/",
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha_inicio,
          fecha_fin,
          tipo,
          curso: selectedCourseId,
          materia: null,
        },
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

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) || null;
  const courseName = selectedCourse?.name || selectedCourse?.nombre || "Selecciona un curso";
  const tipoLabel =
    tipo === "EVENT" ? "Evento" : tipo === "EXAM" ? "Evaluación" : "Actividad";

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
                Crea una actividad para tu curso de forma rápida.
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
                <label>Título</label>
                <input
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Ej: Día del niño, Examen, Actividad..."
                />
              </div>

              <div className="form-group">
                <label>Curso</label>
                <StyledSelect
                  value={selectedCourseId}
                  onChange={(event) =>
                    setSelectedCourseId(
                      event.target.value ? Number(event.target.value) : ""
                    )
                  }
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name || course.nombre}
                    </option>
                  ))}
                </StyledSelect>
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
                  <option value="EXAM">Evaluación</option>
                  <option value="ACTIVITY">Actividad</option>
                </StyledSelect>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción (opcional)</label>
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
            <p>Se agregó correctamente al calendario.</p>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default TeacherEventModal;
