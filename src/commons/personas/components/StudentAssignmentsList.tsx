import React, { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FileText,
  Search,
  Upload,
} from "lucide-react";
import UploadSubmissionForm from "./UploadSubmissionForm";
import "./../styles/assignments.css";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

interface Area {
  id: number;
  nombre: string;
}

interface Subject {
  id: number;
  nombre: string;
  area?: number | null;
  area_nombre?: string;
}

interface Assignment {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  archivo?: string;
  materia?: number;
  requires_submission?: boolean;
}

interface Submission {
  id: number;
  tarea: number;
  fecha_entrega: string;
  calificacion?: number;
  retroalimentacion?: string;
}

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

const StudentAssignmentsList: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showGrade, setShowGrade] = useState<Submission | null>(null);
  const [showDetails, setShowDetails] = useState<Assignment | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    api
      .get("/api/subjects/")
      .then((res) => setSubjects(res.data));

    api
      .get("/api/areas/")
      .then((res) => setAreas(res.data));

    api
      .get("/api/assignments/?requires_submission=true")
      .then((res) => setAllAssignments(res.data));

    reloadSubmissions();
  }, []);

  const reloadSubmissions = () => {
    api
      .get("/api/submissions/")
      .then((res) => setSubmissions(res.data));
  };

  const loadAssignments = (subject: Subject) => {
    setActiveSubject(subject);
    api
      .get(`/api/assignments/?subject=${subject.id}&requires_submission=true`)
      .then((res) => setAssignments(res.data));
  };

  const getSubmission = (assignmentId: number) =>
    submissions.find((s) => s.tarea === assignmentId);

  const showSuccessToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1600);
  };

  const groupedSubjects = useMemo(() => {
    return areas
      .map((area) => ({
        area,
        subjects: subjects.filter(
          (s) => s.area === area.id && normalizeText(s.nombre).includes(normalizeText(subjectSearch)),
        ),
      }))
      .filter((item) => item.subjects.length > 0);
  }, [areas, subjects, subjectSearch]);

  const subjectsWithoutArea = useMemo(
    () =>
      subjects.filter(
        (s) => !s.area && normalizeText(s.nombre).includes(normalizeText(subjectSearch)),
      ),
    [subjects, subjectSearch]
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const pendingAssignments = useMemo(
    () =>
      allAssignments
        .filter((item) => !getSubmission(item.id))
        .map((item) => ({
          ...item,
          subjectName: subjectMap.get(item.materia || 0)?.nombre || "Materia",
        })),
    [allAssignments, submissions, subjectMap],
  );

  const taskStats = useMemo(() => {
    const pending = allAssignments.filter((item) => !getSubmission(item.id)).length;

    return {
      subjects: subjects.length,
      pending,
    };
  }, [allAssignments, submissions, subjects]);

  const activeSubjectStats = useMemo(() => {
    const delivered = assignments.filter((item) => getSubmission(item.id)).length;
    const graded = assignments.filter((item) => {
      const submission = getSubmission(item.id);
      return submission?.calificacion !== undefined;
    }).length;

    return {
      total: assignments.length,
      delivered,
      pending: Math.max(assignments.length - delivered, 0),
      graded,
    };
  }, [assignments, submissions]);

  return (
    <section className="student-tasks">
      <div className="student-tasks__hero">
        <div className="student-tasks__hero-copy">
          <span className="student-tasks__badge">Tareas</span>
          <h2>Organiza tus entregas por materia</h2>
          <p>
            Elige una materia, revisa actividades pendientes y consulta el estado de
            cada entrega en un espacio mas claro y comodo de seguir.
          </p>
        </div>

        <div className="student-tasks__stats">
          <article className="student-tasks__stat-card">
            <span>Materias</span>
            <strong>{taskStats.subjects}</strong>
          </article>
          <article className="student-tasks__stat-card warning">
            <span>Pendientes</span>
            <button
              type="button"
              className="student-tasks__stat-trigger"
              onClick={() => setShowPendingModal(true)}
            >
              <strong>{taskStats.pending}</strong>
            </button>
          </article>
        </div>
      </div>

      <div className="student-tasks__section-head">
        <div>
          <h3>Mapa académico</h3>
          <p>Accede a cada materia desde su area y abre su panel de actividades.</p>
        </div>
        <label className="student-tasks__search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar materia"
            value={subjectSearch}
            onChange={(event) => setSubjectSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="student-tasks__areas">
        {groupedSubjects.map(({ area, subjects: areaSubjects }) => (
          <article key={area.id} className="student-tasks__area-card">
            <div className="student-tasks__area-top">
              <span className="student-tasks__area-pill">Area</span>
              <strong>{area.nombre}</strong>
            </div>

            <div className="student-tasks__subject-grid">
              {areaSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  className="student-tasks__subject-card"
                  onClick={() => loadAssignments(subject)}
                >
                  <div className="student-tasks__subject-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="student-tasks__subject-copy">
                    <strong>{subject.nombre}</strong>
                    <span>Abrir actividades</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </article>
        ))}

        {subjectsWithoutArea.length > 0 && (
          <article className="student-tasks__area-card">
            <div className="student-tasks__area-top">
              <span className="student-tasks__area-pill">Libre</span>
              <strong>Materias sin area</strong>
            </div>

            <div className="student-tasks__subject-grid">
              {subjectsWithoutArea.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  className="student-tasks__subject-card"
                  onClick={() => loadAssignments(subject)}
                >
                  <div className="student-tasks__subject-icon">
                    <BookOpen size={20} />
                  </div>
                  <div className="student-tasks__subject-copy">
                    <strong>{subject.nombre}</strong>
                    <span>Abrir actividades</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </article>
        )}
      </div>

      {showToast && (
        <div className="toast-backdrop" onClick={() => setShowToast(false)}>
          <div className="toast-success" onClick={(e) => e.stopPropagation()}>
            <div>
              <strong>Listo</strong> - {toastMsg}
            </div>
            <button className="btn-secondary" onClick={() => setShowToast(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showPendingModal && (
        <div className="modal-backdrop" onClick={() => setShowPendingModal(false)}>
          <div className="modal-premium" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header-fixed">
              <div className="student-task-modal__headline">
                <span className="student-task-modal__eyebrow">Pendientes</span>
                <h3>Tareas por entregar</h3>
              </div>
              <button
                className="student-task-modal__close-btn"
                onClick={() => setShowPendingModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body student-task-modal__detail">
              {pendingAssignments.length === 0 ? (
                <div className="student-task-modal__empty">
                  No tienes tareas pendientes en este momento.
                </div>
              ) : (
                <div className="student-task-pending-list">
                  {pendingAssignments.map((assignment) => (
                    <article key={assignment.id} className="student-task-pending-item">
                      <div>
                        <span>{assignment.subjectName}</span>
                        <strong>{assignment.titulo}</strong>
                      </div>
                      <small>{formatDate(assignment.fecha_entrega)}</small>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPendingModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubject && (
        <div className="modal-backdrop">
          <div className="modal-premium modal-premium--wide">
            <div className="modal-header-fixed">
              <div className="student-task-modal__headline">
                <span className="student-task-modal__eyebrow">Materia activa</span>
                <h2>{activeSubject.nombre}</h2>
              </div>
              <button
                className="student-task-modal__close-btn"
                onClick={() => setActiveSubject(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body student-task-modal__body">
              <div className="student-task-modal__summary">
                <article className="student-task-modal__summary-card">
                  <span>Total</span>
                  <strong>{activeSubjectStats.total}</strong>
                </article>
                <article className="student-task-modal__summary-card accent">
                  <span>Entregadas</span>
                  <strong>{activeSubjectStats.delivered}</strong>
                </article>
                <article className="student-task-modal__summary-card warning">
                  <span>Pendientes</span>
                  <strong>{activeSubjectStats.pending}</strong>
                </article>
                <article className="student-task-modal__summary-card">
                  <span>Calificadas</span>
                  <strong>{activeSubjectStats.graded}</strong>
                </article>
              </div>

              {assignments.length === 0 ? (
                <div className="student-task-modal__empty">
                  No hay tareas asignadas aun para esta materia.
                </div>
              ) : (
                <div className="student-task-modal__list">
                  {assignments.map((assignment) => {
                    const submission = getSubmission(assignment.id);

                    return (
                      <article key={assignment.id} className="student-task-item">
                        <div className="student-task-item__content">
                          <div className="student-task-item__top">
                            <h4>{assignment.titulo}</h4>
                            <span className="student-task-item__date">
                              <CalendarDays size={14} />
                              {formatDate(assignment.fecha_entrega)}
                            </span>
                          </div>

                          <div className="student-task-item__state-row">
                            {!submission && (
                              <span className="student-task-item__status pending">
                                Pendiente por entregar
                              </span>
                            )}

                            {submission && submission.calificacion === undefined && (
                              <span className="student-task-item__status delivered">
                                Entregada, pendiente de revision
                              </span>
                            )}

                            {submission?.calificacion !== undefined && (
                              <span className="student-task-item__status graded">
                                Calificada: {submission.calificacion}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="student-task-item__actions">
                          <button
                            className="btn-secondary"
                            onClick={() => setShowDetails(assignment)}
                          >
                            <Eye size={16} />
                            Ver
                          </button>

                          {!submission && (
                            <button
                              className="btn-primary"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowUpload(true);
                              }}
                            >
                              <Upload size={16} />
                              Entregar
                            </button>
                          )}

                          {submission?.calificacion !== undefined && (
                            <button
                              className="btn-primary btn-primary--dark"
                              onClick={() => setShowGrade(submission)}
                            >
                              <ClipboardCheck size={16} />
                              Ver nota
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDetails &&
        (() => {
          const submission = getSubmission(showDetails.id);

          return (
            <div className="modal-backdrop">
              <div className="modal-premium">
                <div className="modal-header-fixed">
                  <div className="student-task-modal__headline">
                    <span className="student-task-modal__eyebrow">Detalle de tarea</span>
                    <h3>{showDetails.titulo}</h3>
                  </div>
                  <button
                    className="student-task-modal__close-btn"
                    onClick={() => setShowDetails(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="modal-body student-task-modal__detail">
                  <div className="student-task-modal__info-grid">
                    <div className="student-task-modal__info-card">
                      <span>Entrega</span>
                      <strong>{formatDate(showDetails.fecha_entrega)}</strong>
                    </div>
                    <div className="student-task-modal__info-card">
                      <span>Estado</span>
                      <strong>
                        {!submission
                          ? "Pendiente"
                          : submission.calificacion !== undefined
                            ? "Calificada"
                            : "Entregada"}
                      </strong>
                    </div>
                  </div>

                  {showDetails.descripcion && (
                    <div className="assignment-description">
                      <strong>Descripción</strong>
                      <p>{showDetails.descripcion}</p>
                    </div>
                  )}

                  {showDetails.archivo && (
                    <div className="student-task-modal__file-box">
                      <div>
                        <strong>Archivo del docente</strong>
                        <p>Puedes revisar el material de apoyo antes de entregar.</p>
                      </div>
                      <a
                        href={showDetails.archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        <FileText size={16} />
                        Descargar archivo
                      </a>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  {!submission ? (
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setSelectedAssignment(showDetails);
                        setShowDetails(null);
                        setShowUpload(true);
                      }}
                    >
                      <Upload size={16} />
                      Subir entrega
                    </button>
                  ) : submission.calificacion !== undefined ? (
                    <button
                      className="btn-primary btn-primary--dark"
                      onClick={() => {
                        setShowDetails(null);
                        setShowGrade(submission);
                      }}
                    >
                      <ClipboardCheck size={16} />
                      Ver calificacion
                    </button>
                  ) : (
                    <button className="btn-secondary" onClick={() => setShowDetails(null)}>
                      Cerrar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {showUpload && selectedAssignment && (
        <div className="modal-backdrop">
          <div className="modal-premium">
            <div className="modal-header-fixed">
              <div className="student-task-modal__headline">
                <span className="student-task-modal__eyebrow">Entrega</span>
                <h3>Subir archivo</h3>
              </div>
              <button
                className="student-task-modal__close-btn"
                onClick={() => setShowUpload(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body student-task-modal__detail">
              <div className="student-task-modal__upload-note">
                <strong>{selectedAssignment.titulo}</strong>
                <p>
                  Carga tu archivo final y asegúrate de que corresponda a la tarea
                  indicada.
                </p>
              </div>

              <UploadSubmissionForm
                assignmentId={selectedAssignment.id}
                onClose={() => setShowUpload(false)}
                onSuccess={() => {
                  setShowUpload(false);
                  reloadSubmissions();
                  showSuccessToast("Tarea entregada correctamente.");
                }}
              />
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUpload(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showGrade && (
        <div className="modal-backdrop">
          <div className="modal-premium">
            <div className="modal-header-fixed">
              <div className="student-task-modal__headline">
                <span className="student-task-modal__eyebrow">Resultado</span>
                <h3>Calificacion recibida</h3>
              </div>
              <button
                className="student-task-modal__close-btn"
                onClick={() => setShowGrade(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body student-task-modal__detail">
              <div className="grade-box">
                <div className="grade-number">
                  {showGrade.calificacion !== undefined ? showGrade.calificacion : "--"}
                </div>
                <div className="student-task-modal__feedback">
                  <strong>Retroalimentación</strong>
                  <p>{showGrade.retroalimentacion || "Aún no hay observaciones registradas."}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowGrade(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentAssignmentsList;
