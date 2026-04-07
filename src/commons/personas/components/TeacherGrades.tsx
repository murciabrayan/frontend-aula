import React, { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import { BookOpen, ChevronRight, LayoutGrid, PencilLine, PlusCircle, Users } from "lucide-react";
import "../styles/teacherGrades.css";

interface Subject {
  id: number;
  nombre: string;
  curso?: number;
  course_name?: string;
}

interface Assignment {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_entrega: string;
  materia: number;
  periodo: number;
  requires_submission?: boolean;
}

interface Submission {
  id: number;
  tarea: number;
  estudiante: number;
  estudiante_nombre: string;
  calificacion?: number | null;
  retroalimentacion?: string | null;
}

interface Course {
  id: number;
  name: string;
  students: number[];
  student_details?: User[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface DirectGradeEntry {
  grade: string;
  feedback: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const TeacherGrades: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Assignment | null>(null);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityDate, setActivityDate] = useState(today());
  const [activityGrades, setActivityGrades] = useState<Record<number, DirectGradeEntry>>({});
  const [savingActivity, setSavingActivity] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      void loadGradeData(selectedSubject, selectedPeriod);
    }
  }, [selectedPeriod]);

  const loadSubjects = async () => {
    try {
      const res = await api.get("/api/subjects/");
      setSubjects(res.data);
    } catch (error) {
      console.error("Error cargando materias", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGradeData = async (subject: Subject, period: number) => {
    if (!subject.curso) {
      setErrorMessage("La materia no tiene un curso asociado.");
      return;
    }

    try {
      setSelectedSubject(subject);

      const [assignmentsRes, submissionsRes, courseRes] = await Promise.all([
        api.get(`/api/assignments/?subject=${subject.id}&periodo=${period}`),
        api.get("/api/submissions/"),
        api.get(`/api/courses/${subject.curso}/`),
      ]);

      const subjectAssignments: Assignment[] = assignmentsRes.data || [];
      const allSubmissions: Submission[] = submissionsRes.data || [];
      const teacherCourse: Course = courseRes.data;

      const assignmentIds = subjectAssignments.map((assignment) => assignment.id);
      const filteredSubmissions = allSubmissions.filter((submission) =>
        assignmentIds.includes(submission.tarea),
      );

      setAssignments(subjectAssignments);
      setSubmissions(filteredSubmissions);
      setStudents(teacherCourse.student_details || []);
      setSelectedCourseName(teacherCourse.name || subject.course_name || "");
      setErrorMessage("");
    } catch (error) {
      console.error("Error cargando notas", error);
      setErrorMessage("No se pudieron cargar las actividades de esta materia.");
    }
  };

  const submissionsByAssignment = useMemo(() => {
    const map = new Map<number, Submission[]>();
    submissions.forEach((submission) => {
      const current = map.get(submission.tarea) || [];
      current.push(submission);
      map.set(submission.tarea, current);
    });
    return map;
  }, [submissions]);

  const gradeMap = useMemo(() => {
    const map: Record<string, number | null> = {};

    submissions.forEach((submission) => {
      map[`${submission.estudiante}-${submission.tarea}`] =
        submission.calificacion !== null && submission.calificacion !== undefined
          ? Number(submission.calificacion)
          : null;
    });

    return map;
  }, [submissions]);

  const subjectStats = useMemo(
    () => ({
      subjects: subjects.length,
      courses: new Set(subjects.map((subject) => subject.curso).filter(Boolean)).size,
      students: students.length,
      assignments: assignments.length,
    }),
    [subjects, students.length, assignments.length],
  );

  const resetActivityModal = () => {
    setShowActivityModal(false);
    setEditingActivity(null);
    setActivityTitle("");
    setActivityDescription("");
    setActivityDate(today());
    setActivityGrades({});
  };

  const openCreateActivityModal = () => {
    setEditingActivity(null);
    setActivityTitle("");
    setActivityDescription("");
    setActivityDate(today());
    setActivityGrades({});
    setShowActivityModal(true);
    setErrorMessage("");
  };

  const openEditActivityModal = (assignment: Assignment) => {
    const relatedSubmissions = submissionsByAssignment.get(assignment.id) || [];
    const gradeState: Record<number, DirectGradeEntry> = {};

    relatedSubmissions.forEach((submission) => {
      gradeState[submission.estudiante] = {
        grade:
          submission.calificacion !== null && submission.calificacion !== undefined
            ? String(submission.calificacion)
            : "",
        feedback: submission.retroalimentacion || "",
      };
    });

    setEditingActivity(assignment);
    setActivityTitle(assignment.titulo);
    setActivityDescription(assignment.descripcion || "");
    setActivityDate(assignment.fecha_entrega);
    setActivityGrades(gradeState);
    setShowActivityModal(true);
    setErrorMessage("");
  };

  const updateActivityGrade = (
    studentId: number,
    field: keyof DirectGradeEntry,
    value: string,
  ) => {
    setActivityGrades((prev) => ({
      ...prev,
      [studentId]: {
        grade: prev[studentId]?.grade ?? "",
        feedback: prev[studentId]?.feedback ?? "",
        [field]: value,
      },
    }));
  };

  const saveDirectActivity = async () => {
    if (!selectedSubject) return;

    const grades = students
      .map((student) => ({
        student_id: student.id,
        calificacion: activityGrades[student.id]?.grade?.trim() ?? "",
        retroalimentacion: activityGrades[student.id]?.feedback?.trim() ?? "",
      }))
      .filter((entry) => entry.calificacion !== "");

    if (!activityTitle.trim()) {
      setErrorMessage("Debes escribir un título para la actividad.");
      return;
    }

    if (grades.length === 0) {
      setErrorMessage("Registra al menos una calificación para guardar la actividad.");
      return;
    }

    try {
      setSavingActivity(true);
      setErrorMessage("");
      setFeedbackMessage("");

      const payload = {
        materia: selectedSubject.id,
        titulo: activityTitle.trim(),
        descripcion: activityDescription.trim(),
        fecha_entrega: activityDate,
        periodo: selectedPeriod,
        grades: grades.map((entry) => ({
          ...entry,
          calificacion: Number(entry.calificacion),
        })),
      };

      if (editingActivity) {
        await api.post(`/api/assignments/${editingActivity.id}/direct-activity-update/`, payload);
      } else {
        await api.post("/api/assignments/direct-activity/", payload);
      }

      await loadGradeData(selectedSubject, selectedPeriod);
      resetActivityModal();
      setFeedbackMessage(
        editingActivity
          ? "La actividad evaluable fue actualizada correctamente."
          : "La actividad evaluable fue registrada correctamente.",
      );
      window.setTimeout(() => setFeedbackMessage(""), 2200);
    } catch (error: any) {
      console.error("Error guardando actividad evaluable", error);
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo guardar la actividad evaluable.",
      );
    } finally {
      setSavingActivity(false);
    }
  };

  if (loading) {
    return <div className="teacher-grades-empty">Cargando materias...</div>;
  }

  return (
    <section className="teacher-grades-page">
      {!selectedSubject ? (
        <>
          <div className="teacher-grades-hero">
            <div className="teacher-grades-hero__copy">
              <span className="teacher-grades-hero__badge">Notas</span>
              <h1>Vista académica por materia</h1>
              <p>
                Selecciona una materia para revisar la matriz de calificaciones por
                estudiante y periodo en una vista más limpia.
              </p>
            </div>

            <div className="teacher-grades-hero__stats">
              <article className="teacher-grades-hero__stat">
                <span>Materias</span>
                <strong>{subjectStats.subjects}</strong>
              </article>
              <article className="teacher-grades-hero__stat">
                <span>Curso</span>
                <strong>{subjectStats.courses}</strong>
              </article>
            </div>
          </div>

          <div className="teacher-grades-grid">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                className="teacher-grades-subject-card"
                onClick={() => {
                  setSelectedPeriod(1);
                  void loadGradeData(subject, 1);
                }}
              >
                <div className="teacher-grades-subject-card__icon">
                  <BookOpen size={22} />
                </div>
                <div className="teacher-grades-subject-card__copy">
                  <strong>{subject.nombre}</strong>
                  <span>{subject.course_name || "Ver matriz de notas"}</span>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="teacher-grades-hero compact">
            <div className="teacher-grades-hero__copy">
              <span className="teacher-grades-hero__badge">Materia activa</span>
              <h1>{selectedSubject.nombre}</h1>
              <p>
                Consulta las notas registradas para el periodo y el avance del curso
                por actividad.
              </p>
              {selectedCourseName ? <p>{selectedCourseName}</p> : null}
            </div>

            <div className="teacher-grades-hero__stats">
              <article className="teacher-grades-hero__stat">
                <span>Estudiantes</span>
                <strong>{subjectStats.students}</strong>
              </article>
              <article className="teacher-grades-hero__stat">
                <span>Actividades</span>
                <strong>{subjectStats.assignments}</strong>
              </article>
            </div>
          </div>

          <div className="teacher-grades-toolbar">
            <button
              type="button"
              className="teacher-grades-back-btn"
              onClick={() => setSelectedSubject(null)}
            >
              <LayoutGrid size={16} />
              Volver a materias
            </button>

            <div className="teacher-grades-period-tabs">
              <button
                type="button"
                className="teacher-grades-period-btn teacher-grades-period-btn--accent"
                onClick={openCreateActivityModal}
              >
                <PlusCircle size={16} />
                Actividad evaluable
              </button>
              {[1, 2, 3, 4].map((period) => (
                <button
                  key={period}
                  type="button"
                  className={`teacher-grades-period-btn ${
                    selectedPeriod === period ? "active" : ""
                  }`}
                  onClick={() => setSelectedPeriod(period)}
                >
                  Periodo {period}
                </button>
              ))}
            </div>
          </div>

          {feedbackMessage ? (
            <div className="teacher-grades-feedback success">{feedbackMessage}</div>
          ) : null}
          {errorMessage ? (
            <div className="teacher-grades-feedback error">{errorMessage}</div>
          ) : null}

          <div className="teacher-grades-summary-row">
            <article className="teacher-grades-summary-card">
              <span>Estudiantes activos</span>
              <strong>{subjectStats.students}</strong>
            </article>
            <article className="teacher-grades-summary-card accent">
              <span>Actividades del periodo</span>
              <strong>{subjectStats.assignments}</strong>
            </article>
            <article className="teacher-grades-summary-card dark">
              <span>Vista</span>
              <strong>
                <Users size={18} />
                Matriz
              </strong>
            </article>
          </div>

          <div className="teacher-grades-table-shell">
            <div className="teacher-grades-table-header">
              <h3>Calificaciones del periodo</h3>
              <p>
                La tabla resume las actividades creadas y la nota registrada por
                estudiante.
              </p>
            </div>

            <div className="teacher-grades-table-wrapper">
              <table className="teacher-grades-table">
                <thead>
                  <tr>
                    <th className="student-col">Estudiante</th>
                    {assignments.map((assignment) => (
                      <th key={assignment.id} className="assignment-col">
                        <div className="assignment-title">{assignment.titulo}</div>
                        {!assignment.requires_submission && (
                          <div className="assignment-mode-row">
                            <span className="assignment-mode-badge">Actividad en clase</span>
                            <button
                              type="button"
                              className="assignment-edit-btn"
                              onClick={() => openEditActivityModal(assignment)}
                            >
                              <PencilLine size={14} />
                              Editar
                            </button>
                          </div>
                        )}
                        <div className="assignment-date">{assignment.fecha_entrega}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={assignments.length + 1}>No hay estudiantes en este curso.</td>
                    </tr>
                  ) : assignments.length === 0 ? (
                    <tr>
                      <td colSpan={students.length + 1}>
                        No hay actividades registradas en este periodo.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id}>
                        <td className="teacher-grades-student-cell">
                          {student.first_name} {student.last_name}
                        </td>

                        {assignments.map((assignment) => {
                          const grade = gradeMap[`${student.id}-${assignment.id}`];
                          const hasGrade =
                            grade !== undefined && grade !== null && !isNaN(grade);

                          return (
                            <td key={assignment.id} className="teacher-grades-grade-cell">
                              <div
                                className={`teacher-grades-grade-box ${
                                  hasGrade ? "good" : "empty"
                                }`}
                              >
                                {hasGrade ? Number(grade).toFixed(1) : "-"}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showActivityModal && selectedSubject ? (
        <div className="teacher-grades-modal-backdrop">
          <div className="teacher-grades-modal">
            <div className="teacher-grades-modal__header">
              <div>
                <span className="teacher-grades-modal__eyebrow">Notas</span>
                <h2>
                  {editingActivity ? "Editar actividad evaluable" : "Registrar actividad evaluable"}
                </h2>
                <p>{selectedSubject.nombre}</p>
              </div>
              <button
                type="button"
                className="teacher-grades-modal__close"
                onClick={resetActivityModal}
              >
                ×
              </button>
            </div>

            <div className="teacher-grades-modal__body">
              <div className="teacher-grades-modal__grid">
                <label>
                  <span>Título</span>
                  <input
                    type="text"
                    value={activityTitle}
                    onChange={(event) => setActivityTitle(event.target.value)}
                    placeholder="Ej: Circuito de resistencia"
                  />
                </label>
                <label>
                  <span>Fecha de actividad</span>
                  <input
                    type="date"
                    value={activityDate}
                    onChange={(event) => setActivityDate(event.target.value)}
                  />
                </label>
              </div>

              <label className="teacher-grades-modal__full">
                <span>Descripción</span>
                <textarea
                  value={activityDescription}
                  onChange={(event) => setActivityDescription(event.target.value)}
                  placeholder="Describe brevemente la actividad realizada en clase..."
                />
              </label>

              <div className="teacher-grades-modal__table-wrap">
                <table className="teacher-grades-modal__table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Nota</th>
                      <th>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>
                          {student.first_name} {student.last_name}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={activityGrades[student.id]?.grade ?? ""}
                            onChange={(event) =>
                              updateActivityGrade(student.id, "grade", event.target.value)
                            }
                            placeholder="0.0 - 5.0"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={activityGrades[student.id]?.feedback ?? ""}
                            onChange={(event) =>
                              updateActivityGrade(student.id, "feedback", event.target.value)
                            }
                            placeholder="Opcional"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="teacher-grades-modal__footer">
              <button
                type="button"
                className="teacher-grades-modal__secondary"
                onClick={resetActivityModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="teacher-grades-modal__primary"
                onClick={saveDirectActivity}
                disabled={savingActivity}
              >
                {savingActivity
                  ? "Guardando..."
                  : editingActivity
                    ? "Guardar cambios"
                    : "Guardar actividad y notas"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default TeacherGrades;
