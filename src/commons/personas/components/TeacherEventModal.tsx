import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import StyledSelect from "@/components/StyledSelect";

interface TeacherCalendarEvent {
  title: string;
  start?: string;
  extendedProps?: {
    tipo?: "TASK" | "EVENT" | "EXAM" | "ACTIVITY";
    curso?: string;
    materia?: string;
    descripcion?: string;
    readonly?: boolean;
  };
}

interface Props {
  date: string;
  event?: TeacherCalendarEvent | null;
  onClose: () => void;
  onSaved: () => void;
}

interface TeacherCourse {
  id: number;
  name?: string;
  nombre?: string;
}

const TeacherEventModal: React.FC<Props> = ({ date, event, onClose, onSaved }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"EVENT" | "EXAM" | "ACTIVITY">("EVENT");
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const isReadOnly = Boolean(event);

  useEffect(() => {
    if (!event) {
      setTitulo("");
      setDescripcion("");
      setTipo("EVENT");
      return;
    }

    setTitulo(event.title || "");
    setDescripcion(event.extendedProps?.descripcion || "");

    const eventType = event.extendedProps?.tipo;
    if (eventType === "EVENT" || eventType === "EXAM" || eventType === "ACTIVITY") {
      setTipo(eventType);
    } else {
      setTipo("EVENT");
    }
  }, [event]);

  useEffect(() => {
    if (isReadOnly) return;

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

    void loadCourses();
  }, [isReadOnly]);

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
      await api.post("/api/calendar/events/", {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fecha_inicio,
        fecha_fin,
        tipo,
        curso: selectedCourseId,
        materia: null,
      });

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
  const courseName = isReadOnly
    ? event?.extendedProps?.curso || "Sin curso"
    : selectedCourse?.name || selectedCourse?.nombre || "Selecciona un curso";
  const displayDate = event?.start
    ? new Date(event.start).toLocaleDateString("es-CO")
    : date;
  const tipoLabel =
    tipo === "EVENT" ? "Evento" : tipo === "EXAM" ? "Evaluacion" : "Actividad";

  return (
    <>
      <div
        className="teacher-calendar-modal-backdrop"
        onClick={(clickedEvent) => {
          if (clickedEvent.target === clickedEvent.currentTarget && !loading) {
            onClose();
          }
        }}
      >
        <div className="teacher-calendar-modal modal-modern">
          <div className="teacher-calendar-modal__header modal-header-modern">
            <div>
              <h2>{isReadOnly ? "Detalle del evento" : "Nuevo evento"}</h2>
              <p className="modal-subtitle">
                {isReadOnly
                  ? "Consulta la informacion registrada en el calendario."
                  : "Crea una actividad para tu curso de forma rapida."}
              </p>
            </div>

            <button
              type="button"
              className="teacher-calendar-close-btn"
              onClick={onClose}
              disabled={loading}
            >
              x
            </button>
          </div>

          <div className="teacher-calendar-modal__body modal-body-modern">
            <div className="meta-row">
              <span className="meta-chip">
                <strong>Curso:</strong> {courseName}
              </span>
              <span className="meta-chip">
                <strong>Fecha:</strong> {displayDate}
              </span>
              <span className="meta-chip meta-chip-dark">{tipoLabel}</span>
              {isReadOnly && event?.extendedProps?.materia ? (
                <span className="meta-chip">
                  <strong>Materia:</strong> {event.extendedProps.materia}
                </span>
              ) : null}
            </div>

            {isReadOnly ? (
              <div className="teacher-calendar-detail-grid">
                <div className="form-group">
                  <label>Titulo</label>
                  <div className="teacher-calendar-detail-box">{titulo || "Sin titulo"}</div>
                </div>

                <div className="form-group">
                  <label>Descripcion</label>
                  <div className="teacher-calendar-detail-box teacher-calendar-detail-box--large">
                    {descripcion || "Este evento no tiene descripcion registrada."}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Titulo</label>
                    <input
                      value={titulo}
                      onChange={(changeEvent) => setTitulo(changeEvent.target.value)}
                      placeholder="Ej: Dia del nino, Examen, Actividad..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Curso</label>
                    <StyledSelect
                      value={selectedCourseId}
                      onChange={(changeEvent) =>
                        setSelectedCourseId(
                          changeEvent.target.value ? Number(changeEvent.target.value) : ""
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
                      onChange={(changeEvent) =>
                        setTipo(changeEvent.target.value as "EVENT" | "EXAM" | "ACTIVITY")
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
                    onChange={(changeEvent) => setDescripcion(changeEvent.target.value)}
                    placeholder="Detalles del evento..."
                  />
                </div>
              </>
            )}

            {error ? <p className="msg error">{error}</p> : null}
          </div>

          <div className="teacher-calendar-modal__footer modal-footer-modern">
            <button
              type="button"
              className={isReadOnly ? "btn-primary" : "btn-secondary"}
              onClick={onClose}
              disabled={loading}
            >
              {isReadOnly ? "Cerrar" : "Cancelar"}
            </button>
            {!isReadOnly ? (
              <button
                type="button"
                className="btn-primary"
                onClick={saveEvent}
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar evento"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {showSuccess ? (
        <div className="teacher-calendar-success-backdrop">
          <div className="teacher-calendar-success-modal">
            <div className="teacher-calendar-success-icon">OK</div>
            <h3>Evento creado</h3>
            <p>Se agrego correctamente al calendario.</p>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default TeacherEventModal;
