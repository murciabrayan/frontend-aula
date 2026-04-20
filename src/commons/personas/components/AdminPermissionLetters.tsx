import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileText, Send, Trash2, XCircle } from "lucide-react";

import StyledSelect from "@/components/StyledSelect";
import { useFeedback } from "@/context/FeedbackContext";
import api from "@/api/axios";
import {
  createPermissionLetter,
  deletePermissionLetter,
  getPermissionLetters,
  type PermissionLetter,
} from "@/api/permissionLetters";
import "@/commons/personas/styles/permissionLetters.css";

interface CourseOption {
  id: number;
  nombre?: string;
  name?: string;
}

const getCourseLabel = (course: CourseOption) => course.nombre || course.name || `Curso ${course.id}`;

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Sin fecha";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const AdminPermissionLetters = () => {
  const { confirm, showToast } = useFeedback();
  const [letters, setLetters] = useState<PermissionLetter[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingLetterId, setDeletingLetterId] = useState<number | null>(null);
  const [expandedLetterId, setExpandedLetterId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lettersData, coursesData] = await Promise.all([
        getPermissionLetters(),
        api.get<CourseOption[]>("/api/courses/"),
      ]);
      setLetters(lettersData);
      setCourses(coursesData.data);
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Permisos",
        message: error.response?.data?.error || "No se pudo cargar el módulo de permisos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === form.course) ?? null,
    [courses, form.course],
  );

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!documentFile) {
      showToast({
        type: "warning",
        title: "Permisos",
        message: "Debes adjuntar el PDF del permiso.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("course", form.course);
      payload.append("document", documentFile);

      const created = await createPermissionLetter(payload);
      setLetters((current) => [created, ...current]);
      setExpandedLetterId(null);
      setForm({ title: "", description: "", course: "" });
      setDocumentFile(null);
      showToast({
        type: "success",
        title: "Permisos",
        message: `El permiso fue enviado al curso ${created.course_name}.`,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Permisos",
        message: error.response?.data?.error || "No se pudo crear el permiso.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (letter: PermissionLetter) => {
    const accepted = await confirm({
      title: "Eliminar permiso",
      message: `Se eliminará el permiso "${letter.title}" y sus respuestas asociadas. Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });

    if (!accepted) return;

    try {
      setDeletingLetterId(letter.id);
      await deletePermissionLetter(letter.id);
      setLetters((current) => current.filter((item) => item.id !== letter.id));
      setExpandedLetterId((current) => (current === letter.id ? null : current));
      showToast({
        type: "success",
        title: "Permisos",
        message: "El permiso fue eliminado correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Permisos",
        message: error.response?.data?.error || "No se pudo eliminar el permiso.",
      });
    } finally {
      setDeletingLetterId(null);
    }
  };

  return (
    <section className="permission-letters permission-letters--admin">
      <div className="permission-letters__hero">
        <div>
          <p className="permission-letters__eyebrow">Permisos institucionales</p>
          <h2>Envío y seguimiento de cartas</h2>
          <p>
            Carga permisos en PDF por curso, notifica a los estudiantes y revisa quiénes aceptaron,
            rechazaron o siguen pendientes.
          </p>
        </div>
      </div>

      <div className="permission-letters__layout">
        <article className="permission-card permission-card--form">
          <div className="permission-card__header">
            <h3>Nuevo permiso</h3>
            <span>Se enviará automáticamente a todos los estudiantes del curso seleccionado.</span>
          </div>

          <form className="permission-form" onSubmit={handleCreate}>
            <label className="permission-form__field">
              <span>Título del permiso</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Ej. Salida pedagógica, autorización de evento"
                required
              />
            </label>

            <label className="permission-form__field">
              <span>Curso</span>
              <StyledSelect
                value={form.course}
                onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))}
              >
                <option value="">Selecciona un curso</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {getCourseLabel(course)}
                  </option>
                ))}
              </StyledSelect>
            </label>

            <label className="permission-form__field permission-form__field--wide">
              <span>Descripción breve</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Contexto o instrucciones para el estudiante y su acudiente."
                rows={4}
              />
            </label>

            <label className="permission-form__field permission-form__field--wide">
              <span>PDF del permiso</span>
              <div className="permission-upload">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
                  required
                />
                <small>{documentFile ? documentFile.name : "Sube el archivo oficial del permiso."}</small>
              </div>
            </label>

            <div className="permission-form__footer">
              <div className="permission-form__hint">
                {selectedCourse
                  ? `Se enviará a todos los estudiantes de ${getCourseLabel(selectedCourse)}.`
                  : "Selecciona un curso para habilitar el envío."}
              </div>

              <button
                type="submit"
                className="permission-primary-btn"
                disabled={submitting || !form.title.trim() || !form.course || !documentFile}
              >
                <Send size={16} />
                <span>{submitting ? "Enviando..." : "Enviar permiso"}</span>
              </button>
            </div>
          </form>
        </article>

        <article className="permission-card permission-card--list">
          <div className="permission-card__header">
            <h3>Permisos enviados</h3>
            <span>Consulta el historial y el estado de respuesta por estudiante.</span>
          </div>

          {loading ? (
            <div className="permission-empty">Cargando permisos...</div>
          ) : letters.length ? (
            <div className="permission-letter-list">
              {letters.map((letter) => {
                const expanded = expandedLetterId === letter.id;

                return (
                  <article key={letter.id} className={`permission-letter-item ${expanded ? "is-expanded" : ""}`}>
                    <div className="permission-letter-item__summary-wrap">
                    <button
                      type="button"
                      className="permission-letter-item__summary"
                      onClick={() => setExpandedLetterId(expanded ? null : letter.id)}
                    >
                      <div>
                        <strong>{letter.title}</strong>
                        <span>{letter.course_name} · {formatDate(letter.created_at)}</span>
                      </div>

                      <div className="permission-letter-item__stats">
                        <span className="permission-stat pending">
                          <Clock3 size={14} />
                          {letter.pending_count}
                        </span>
                        <span className="permission-stat accepted">
                          <CheckCircle2 size={14} />
                          {letter.accepted_count}
                        </span>
                        <span className="permission-stat rejected">
                          <XCircle size={14} />
                          {letter.rejected_count}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="permission-delete-btn"
                      onClick={() => void handleDelete(letter)}
                      disabled={deletingLetterId === letter.id}
                      title="Eliminar permiso"
                    >
                      <Trash2 size={15} />
                      <span>{deletingLetterId === letter.id ? "Eliminando..." : "Eliminar"}</span>
                    </button>
                    </div>

                    {expanded ? (
                      <div className="permission-letter-item__detail">
                        <div className="permission-letter-item__meta">
                          <p>{letter.description || "Sin descripción adicional."}</p>
                          {letter.document_url ? (
                            <a href={letter.document_url} target="_blank" rel="noreferrer" className="permission-link">
                              <FileText size={16} />
                              <span>Abrir PDF original</span>
                            </a>
                          ) : null}
                        </div>

                        <div className="permission-recipient-table">
                          <div className="permission-recipient-table__head">
                            <span>Estudiante</span>
                            <span>Estado</span>
                            <span>Fecha</span>
                            <span>Soporte</span>
                          </div>

                          {letter.recipients.map((recipient) => (
                            <div key={recipient.id} className="permission-recipient-row">
                              <div>
                                <strong>{recipient.student_name}</strong>
                                <span>{recipient.student_email}</span>
                              </div>
                              <span className={`permission-status permission-status--${recipient.status.toLowerCase()}`}>
                                {recipient.status === "PENDING"
                                  ? "Pendiente"
                                  : recipient.status === "ACCEPTED"
                                    ? "Aceptado"
                                    : "Rechazado"}
                              </span>
                              <span>{formatDate(recipient.responded_at)}</span>
                              <span>
                                {recipient.signed_document_url ? (
                                  <a
                                    href={recipient.signed_document_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="permission-link permission-link--compact"
                                  >
                                    Abrir
                                  </a>
                                ) : (
                                  "Sin respuesta"
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="permission-empty">Aún no has enviado permisos desde este módulo.</div>
          )}
        </article>
      </div>
    </section>
  );
};

export default AdminPermissionLetters;
