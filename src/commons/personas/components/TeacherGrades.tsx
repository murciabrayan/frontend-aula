import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiBookOpen } from "react-icons/fi";
import "../styles/teacherGrades.css";

const API_BASE = "http://127.0.0.1:8000/api";

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
  const token = localStorage.getItem("access_token");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/subjects/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (err) {
      console.error("Error cargando materias", err);
    } finally {
      setLoading(false);
    }
  };

  const loadGradeData = async (subject: Subject) => {
    try {
      setSelectedSubject(subject);

      const [assignmentsRes, submissionsRes, courseRes, usersRes] =
        await Promise.all([
          axios.get(`${API_BASE}/assignments/?subject=${subject.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/submissions/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/courses/teacher/course/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/users/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const subjectAssignments: Assignment[] = assignmentsRes.data || [];
      const allSubmissions: Submission[] = submissionsRes.data || [];
      const teacherCourse: Course = courseRes.data;
      const allUsers: User[] = usersRes.data || [];

      const assignmentIds = subjectAssignments.map((a) => a.id);

      const filteredSubmissions = allSubmissions.filter((s) =>
        assignmentIds.includes(s.tarea)
      );

      const courseStudents = allUsers.filter(
        (u) => teacherCourse.students.includes(u.id) && u.role === "STUDENT"
      );

      setAssignments(subjectAssignments);
      setSubmissions(filteredSubmissions);
      setStudents(courseStudents);
    } catch (err) {
      console.error("Error cargando notas", err);
    }
  };

  const gradeMap = useMemo(() => {
  const map: Record<string, number | null> = {};

  submissions.forEach((s) => {
    map[`${s.estudiante}-${s.tarea}`] =
      s.calificacion !== null && s.calificacion !== undefined
        ? Number(s.calificacion)
        : null;
  });

  return map;
}, [submissions]);

  if (loading) {
    return <p>Cargando materias...</p>;
  }

  return (
    <div className="teacher-grades-container">
      {!selectedSubject ? (
        <>
          <header className="teacher-grades-page-header">
            <h1>Notas por Materia</h1>
            <p>Selecciona una materia para ver la tabla de calificaciones</p>
          </header>

          <div className="teacher-subjects-grid">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="teacher-subject-card"
                onClick={() => loadGradeData(subject)}
              >
                <div className="teacher-subject-icon">
                  <FiBookOpen size={24} />
                </div>
                <div className="teacher-subject-name">{subject.nombre}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <header className="teacher-grades-page-header">
            <h1>{selectedSubject.nombre}</h1>
            <p>Tabla de estudiantes y calificaciones por actividad</p>
          </header>

          <div className="teacher-grades-topbar">
            <button
              className="teacher-back-btn"
              onClick={() => setSelectedSubject(null)}
            >
              ← Volver a materias
            </button>
          </div>

          <div className="grades-table-wrapper">
            <table className="grades-excel-table">
              <thead>
                <tr>
                  <th className="student-col">Estudiante</th>
                  {assignments.map((assignment) => (
                    <th key={assignment.id} className="assignment-col">
                      <div className="assignment-title">{assignment.titulo}</div>
                      <div className="assignment-date">
                        {assignment.fecha_entrega}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={assignments.length + 1}>
                      No hay estudiantes en este curso.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td className="student-name-cell">
                        {student.first_name} {student.last_name}
                      </td>

                      {assignments.map((assignment) => {
                        const grade = gradeMap[`${student.id}-${assignment.id}`];

const hasGrade =
  grade !== undefined &&
  grade !== null &&
  !isNaN(grade);

return (
  <td key={assignment.id} className="grade-cell">
    <div
      className={`grade-box-teacher ${
        hasGrade ? "good" : "empty"
      }`}
    >
      {hasGrade ? Number(grade).toFixed(1) : "—"}
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
        </>
      )}
    </div>
  );
};

export default TeacherGrades;