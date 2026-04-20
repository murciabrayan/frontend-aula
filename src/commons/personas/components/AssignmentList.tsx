import React, { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import {
  BookOpen,
  ChevronRight,
  Eye,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import AssignmentForm from "./AssignmentForm";
import SubmissionList from "./SubmissionList";
import { useFeedback } from "@/context/FeedbackContext";
import "./teacherAssignments.css";

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
  curso?: number;
  course_name?: string;
}

interface Assignment {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_entrega: string;
  periodo: number;
  requires_submission?: boolean;
}

interface CourseGroup {
  id: number;
  name: string;
  subjects: Subject[];
}

const AssignmentDashboard: React.FC = () => {
  const { showToast } = useFeedback();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [mode, setMode] = useState<"create" | "grade">("create");
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [subjectSearch, setSubjectSearch] = useState("");

  useEffect(() => {
    api
      .get("/api/subjects/?teaching_only=true")
      .then((res) => setSubjects(res.data));
  }, []);

  useEffect(() => {
    api
      .get("/api/areas/")
      .then((res) => setAreas(res.data));
  }, []);

  const loadAssignments = (subjectId: number) => {
    api
      .get(`/api/assignments/?subject=${subjectId}&requires_submission=true`)
      .then((res) =>
        setAssignments(
          res.data.map((assignment: any) => ({
            id: assignment.id,
            titulo: assignment.titulo,
            descripcion: assignment.descripcion ?? "",
            fecha_entrega: assignment.fecha_entrega ?? "",
            periodo: assignment.periodo ?? 1,
          })),
        ),
      );
  };

  const openSubject = (subject: Subject) => {
    setActiveSubject(subject);
    setMode("create");
    setSelectedAssignment(null);
    loadAssignments(subject.id);
  };

  const closeSubjectModal = () => {
    setActiveSubject(null);
    setSelectedAssignment(null);
    setEditingAssignment(null);
  };

  const closeCourseView = () => {
    setActiveCourseId(null);
    setActiveSubject(null);
    setSelectedAssignment(null);
    setEditingAssignment(null);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    await api.delete(`/api/assignments/${assignmentToDelete.id}/`);

    if (activeSubject) {
      loadAssignments(activeSubject.id);
    }

    setShowConfirm(false);
    setAssignmentToDelete(null);
    setSelectedAssignment(null);
    showToast({
      type: "success",
      title: "Tarea eliminada",
      message: "La tarea fue eliminada exitosamente.",
    });
  };

  const groupedCourses = useMemo(() => {
    const courseMap = new Map<number, CourseGroup>();
    const query = normalizeText(subjectSearch);

    subjects.forEach((subject) => {
      if (!subject.curso) return;

      const matchesQuery =
        !query ||
        normalizeText(subject.nombre).includes(query) ||
        normalizeText(subject.course_name || "").includes(query);

      if (!matchesQuery) return;

      if (!courseMap.has(subject.curso)) {
        courseMap.set(subject.curso, {
          id: subject.curso,
          name: subject.course_name || `Curso ${subject.curso}`,
          subjects: [],
        });
      }

      courseMap.get(subject.curso)!.subjects.push(subject);
    });

    return Array.from(courseMap.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [subjectSearch, subjects]);

  const activeCourse = useMemo(
    () => groupedCourses.find((course) => course.id === activeCourseId) ?? null,
    [activeCourseId, groupedCourses],
  );

  const groupedSubjects = useMemo(
    () =>
      areas
        .map((area) => ({
          area,
          subjects: (activeCourse?.subjects || []).filter((subject) => subject.area === area.id),
        }))
        .filter((group) => group.subjects.length > 0),
    [activeCourse?.subjects, areas],
  );

  const subjectsWithoutArea = useMemo(
    () => (activeCourse?.subjects || []).filter((subject) => !subject.area),
    [activeCourse?.subjects],
  );

  const stats = useMemo(
    () => ({
      areas: areas.length,
      subjects: subjects.length,
      currentCourse: new Set(subjects.map((subject) => subject.curso).filter(Boolean)).size,
    }),
    [areas.length, subjects],
  );

  const periodoLabel = (periodo: number) => `Periodo ${periodo}`;

  return (
    <section className="teacher-task-page">
      <div className="teacher-task-hero">
        <div className="teacher-task-hero__copy">
          <span className="teacher-task-hero__badge">Gestión de tareas</span>
          <h1>{activeCourse ? activeCourse.name : "Cursos con materias asignadas"}</h1>
          <p>
            {activeCourse
              ? "Abre una materia del curso para crear tareas o revisar entregas sin perder el contexto."
              : "Empieza por el curso donde dictas y luego entra a cada materia para continuar con el flujo actual."}
          </p>
        </div>

        <div className="teacher-task-hero__stats">
          <article className="teacher-task-hero__stat">
            <span>Cursos</span>
            <strong>{stats.currentCourse}</strong>
          </article>
          <article className="teacher-task-hero__stat">
            <span>Areas</span>
            <strong>{stats.areas}</strong>
          </article>
          <article className="teacher-task-hero__stat">
            <span>Materias</span>
            <strong>{stats.subjects}</strong>
          </article>
        </div>
      </div>

      <div className="teacher-task-section-head">
        <div>
          <h3>{activeCourse ? `Materias de ${activeCourse.name}` : "Cursos asignados"}</h3>
          <p>
            {activeCourse
              ? "Abre una materia para crear actividades o revisar entregas ya registradas."
              : "Selecciona primero un curso y luego entra a la materia donde vas a trabajar."}
          </p>
        </div>

        <label className="teacher-task-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={activeCourse ? "Buscar materia" : "Buscar curso o materia"}
            value={subjectSearch}
            onChange={(event) => setSubjectSearch(event.target.value)}
          />
        </label>
      </div>

      {!activeCourse ? (
        <div className="teacher-task-subject-grid">
          {groupedCourses.length === 0 ? (
            <div className="teacher-task-empty">No hay cursos con materias asignadas.</div>
          ) : (
            groupedCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                className="teacher-task-subject-card"
                onClick={() => setActiveCourseId(course.id)}
              >
                <div className="teacher-task-subject-card__icon">
                  <BookOpen size={20} />
                </div>
                <div className="teacher-task-subject-card__copy">
                  <strong>{course.name}</strong>
                  <span>{course.subjects.length} materias asignadas</span>
                </div>
                <ChevronRight size={18} />
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="teacher-task-section-head">
            <div>
              <h3>Catálogo de materias</h3>
              <p>Todo el trabajo de tareas de este curso empieza desde aquí.</p>
            </div>

            <button type="button" className="teacher-task-action-btn primary" onClick={closeCourseView}>
              <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
              Volver a cursos
            </button>
          </div>

          <div className="teacher-task-areas">
            {groupedSubjects.map(({ area, subjects: areaSubjects }) => (
              <article key={area.id} className="teacher-task-area-card">
                <div className="teacher-task-area-card__top">
                  <span className="teacher-task-area-card__pill">Area</span>
                  <strong>{area.nombre}</strong>
                </div>

                <div className="teacher-task-subject-grid">
                  {areaSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      className="teacher-task-subject-card"
                      onClick={() => openSubject(subject)}
                    >
                      <div className="teacher-task-subject-card__icon">
                        <BookOpen size={20} />
                      </div>
                      <div className="teacher-task-subject-card__copy">
                        <strong>{subject.nombre}</strong>
                        <span>{subject.course_name || "Abrir espacio de trabajo"}</span>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </article>
            ))}

            {subjectsWithoutArea.length > 0 && (
              <article className="teacher-task-area-card">
                <div className="teacher-task-area-card__top">
                  <span className="teacher-task-area-card__pill">Libre</span>
                  <strong>Materias sin area</strong>
                </div>

                <div className="teacher-task-subject-grid">
                  {subjectsWithoutArea.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      className="teacher-task-subject-card"
                      onClick={() => openSubject(subject)}
                    >
                      <div className="teacher-task-subject-card__icon">
                        <BookOpen size={20} />
                      </div>
                      <div className="teacher-task-subject-card__copy">
                        <strong>{subject.nombre}</strong>
                        <span>{subject.course_name || "Abrir espacio de trabajo"}</span>
                      </div>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              </article>
            )}
          </div>
        </>
      )}

      {activeSubject && (
        <div className="teacher-task-modal-backdrop">
          <div className={`teacher-task-modal ${mode === "create" ? "form" : ""}`}>
            <div className="teacher-task-modal__header">
              <div className="teacher-task-modal__headline">
                <span>Materia activa</span>
                <h2>{activeSubject.nombre}</h2>
              </div>

              <div className="teacher-task-modal__header-actions">
                <div className="teacher-task-mode-switch">
                  <button
                    type="button"
                    className={mode === "create" ? "active" : ""}
                    onClick={() => setMode("create")}
                  >
                    <PlusCircle size={16} />
                    Crear tarea
                  </button>
                  <button
                    type="button"
                    className={mode === "grade" ? "active" : ""}
                    onClick={() => setMode("grade")}
                  >
                    <Eye size={16} />
                    Revisar entregas
                  </button>
                </div>

                <button
                  type="button"
                  className="teacher-task-close-btn"
                  onClick={closeSubjectModal}
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="teacher-task-modal__body">
              {mode === "create" && (
                <div className="teacher-task-form-shell">
                  <AssignmentForm
                    subjectId={activeSubject.id}
                    onClose={closeSubjectModal}
                    onSuccess={() => {
                      loadAssignments(activeSubject.id);
                      setMode("grade");
                      showToast({
                        type: "success",
                        title: "Tarea creada",
                        message: "La tarea fue creada exitosamente.",
                      });
                    }}
                  />
                </div>
              )}

              {mode === "grade" && (
                <div className="teacher-task-panel">
                  <div className="teacher-task-panel__head">
                    <h3>Tareas creadas</h3>
                    <p>
                      Selecciona una actividad para abrir sus entregas y calificar sin
                      salir del flujo.
                    </p>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="teacher-task-empty">
                      No hay tareas creadas en esta materia.
                    </div>
                  ) : (
                    <div className="teacher-task-table-wrap">
                      <table className="teacher-task-table">
                        <thead>
                          <tr>
                            <th>Título</th>
                            <th>Periodo</th>
                            <th>Fecha de entrega</th>
                            <th>Descripción</th>
                            <th>Entregas</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignments.map((assignment) => (
                            <tr key={assignment.id}>
                              <td className="teacher-task-table__title">{assignment.titulo}</td>
                              <td>
                                <span className="teacher-task-period-badge">
                                  {periodoLabel(assignment.periodo)}
                                </span>
                              </td>
                              <td>{assignment.fecha_entrega}</td>
                              <td className="teacher-task-table__description">
                                {assignment.descripcion || "Sin descripcion"}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="teacher-task-action-btn primary"
                                  onClick={() => setSelectedAssignment(assignment)}
                                >
                                  <Eye size={15} />
                                  Ver
                                </button>
                              </td>
                              <td>
                                <div className="teacher-task-table__actions">
                                  <button
                                    type="button"
                                    className="teacher-task-action-btn edit"
                                    onClick={() => setEditingAssignment(assignment)}
                                  >
                                    <Pencil size={15} />
                                    Editar
                                  </button>

                                  <button
                                    type="button"
                                    className="teacher-task-action-btn delete"
                                    onClick={() => {
                                      setAssignmentToDelete(assignment);
                                      setShowConfirm(true);
                                    }}
                                  >
                                    <Trash2 size={15} />
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAssignment && (
        <div className="teacher-task-modal-backdrop layer-2">
          <div className="teacher-task-modal">
            <div className="teacher-task-modal__header">
              <div className="teacher-task-modal__headline">
                <span>Entregas</span>
                <h2>{selectedAssignment.titulo}</h2>
              </div>
              <button
                type="button"
                className="teacher-task-close-btn"
                onClick={() => setSelectedAssignment(null)}
                aria-label="Cerrar entregas"
              >
                ×
              </button>
            </div>

            <div className="teacher-task-modal__body">
              <SubmissionList assignmentId={selectedAssignment.id} />
            </div>
          </div>
        </div>
      )}

      {editingAssignment && activeSubject && (
        <div className="teacher-task-modal-backdrop layer-2">
          <div className="teacher-task-modal form">
            <div className="teacher-task-modal__header">
              <div className="teacher-task-modal__headline">
                <span>Edicion</span>
                <h2>Actualizar tarea</h2>
              </div>
              <button
                type="button"
                className="teacher-task-close-btn"
                onClick={() => setEditingAssignment(null)}
                aria-label="Cerrar edicion"
              >
                ×
              </button>
            </div>

            <div className="teacher-task-modal__body">
              <div className="teacher-task-form-shell">
                <AssignmentForm
                  subjectId={activeSubject.id}
                  assignmentToEdit={editingAssignment}
                  onClose={() => setEditingAssignment(null)}
                  onSuccess={() => {
                    loadAssignments(activeSubject.id);
                    setEditingAssignment(null);
                    showToast({
                      type: "success",
                      title: "Tarea actualizada",
                      message: "La tarea fue actualizada exitosamente.",
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && assignmentToDelete && (
        <div className="teacher-confirm-backdrop">
          <div className="teacher-confirm-modal">
            <h3>Eliminar tarea</h3>
            <p>
              Esta accion eliminara <strong>{assignmentToDelete.titulo}</strong> y sus
              entregas asociadas.
            </p>

            <div className="teacher-confirm-actions">
              <button type="button" className="teacher-btn-danger" onClick={confirmDelete}>
                Eliminar
              </button>
              <button
                type="button"
                className="teacher-btn-secondary"
                onClick={() => {
                  setShowConfirm(false);
                  setAssignmentToDelete(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default AssignmentDashboard;
