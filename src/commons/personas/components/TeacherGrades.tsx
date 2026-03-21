import React, { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import { BookOpen, ChevronRight, LayoutGrid, Users } from "lucide-react";
import "../styles/teacherGrades.css";

interface Subject {
  id: number;
  nombre: string;
}

interface Assignment {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_entrega: string;
  materia: number;
  periodo: number;
}

interface Submission {
  id: number;
  tarea: number;
  estudiante: number;
  estudiante_nombre: string;
  calificacion?: number | null;
}

interface Course {
  id: number;
  name: string;
  students: number[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
}

const TeacherGrades: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadGradeData(selectedSubject, selectedPeriod);
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
    try {
      setSelectedSubject(subject);

      const [assignmentsRes, submissionsRes, courseRes, usersRes] = await Promise.all([
        api.get(`/api/assignments/?subject=${subject.id}&periodo=${period}`),
        api.get("/api/submissions/"),
        api.get("/api/courses/teacher/course/"),
        api.get("/api/users/"),
      ]);

      const subjectAssignments: Assignment[] = assignmentsRes.data || [];
      const allSubmissions: Submission[] = submissionsRes.data || [];
      const teacherCourse: Course = courseRes.data;
      const allUsers: User[] = usersRes.data || [];

      const assignmentIds = subjectAssignments.map((assignment) => assignment.id);
      const filteredSubmissions = allSubmissions.filter((submission) =>
        assignmentIds.includes(submission.tarea),
      );

      const courseStudents = allUsers.filter(
        (user) => teacherCourse.students.includes(user.id) && user.role === "STUDENT",
      );

      setAssignments(subjectAssignments);
      setSubmissions(filteredSubmissions);
      setStudents(courseStudents);
    } catch (error) {
      console.error("Error cargando notas", error);
    }
  };

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
      students: students.length,
      assignments: assignments.length,
    }),
    [subjects.length, students.length, assignments.length],
  );

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
                estudiante y periodo en una vista mas limpia.
              </p>
            </div>

            <div className="teacher-grades-hero__stats">
              <article className="teacher-grades-hero__stat">
                <span>Materias</span>
                <strong>{subjectStats.subjects}</strong>
              </article>
              <article className="teacher-grades-hero__stat">
                <span>Curso</span>
                <strong>Activo</strong>
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
                  loadGradeData(subject, 1);
                }}
              >
                <div className="teacher-grades-subject-card__icon">
                  <BookOpen size={22} />
                </div>
                <div className="teacher-grades-subject-card__copy">
                  <strong>{subject.nombre}</strong>
                  <span>Ver matriz de notas</span>
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
    </section>
  );
};

export default TeacherGrades;
