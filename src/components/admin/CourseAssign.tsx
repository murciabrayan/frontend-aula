import { useEffect, useState } from "react";
import { getCourses, updateCourse } from "../../services/courseService";
import { getTeachers, getStudents } from "../../services/userService";
import {
  getSubjectsByCourse,
  createSubject,
  deleteSubject,
} from "../../commons/personas/services/subjectService";
import "@/commons/personas/styles/adminDashboard.css";

interface Course {
  id: number;
  name: string;
  teacher: number | null;
  students: number[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface Subject {
  id: number;
  nombre: string;
}

type Tab = "teacher" | "students" | "subjects";

export default function CourseAssign() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | "">("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");

  const [tab, setTab] = useState<Tab>("teacher");
  const [studentFilter, setStudentFilter] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [c, t, s] = await Promise.all([
        getCourses(),
        getTeachers(),
        getStudents(),
      ]);
      setCourses(c.data);
      setTeachers(t.data);
      setStudents(s.data);
    } finally {
      setLoading(false);
    }
  };

  const openManageCourse = async (course: Course) => {
    setActiveCourse(course);
    setSelectedTeacher(course.teacher || "");
    setSelectedStudents(course.students || []);
    setTab("teacher");

    const res = await getSubjectsByCourse(course.id);
    setSubjects(res.data);
  };

  const closeModal = () => {
    setActiveCourse(null);
    setSubjects([]);
    setNewSubjectName("");
    setStudentFilter("");
  };

  const saveAssignments = async () => {
  if (!activeCourse) return;

  const payload = {
    teacher: selectedTeacher === "" ? null : selectedTeacher,
    students: [...selectedStudents], // 🔥 fuerza nueva referencia
  };

  await updateCourse(activeCourse.id, payload);

  await loadInitialData();
  closeModal();
};
  const addSubject = async () => {
    if (!activeCourse) return;
    const nombre = newSubjectName.trim();
    if (!nombre) return;

    try {
      const res = await createSubject({
        nombre,
        curso: activeCourse.id,
      });
      setSubjects((prev) => [...prev, res.data]);
      setNewSubjectName("");
    } catch (error: any) {
      alert(
        error?.response?.data?.non_field_errors?.[0] ||
          "Error al crear la materia"
      );
    }
  };

  const removeSubject = async (id: number) => {
    if (!confirm("¿Eliminar materia?")) return;
    await deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const filteredStudents = students.filter((s) =>
    `${s.first_name} ${s.last_name}`
      .toLowerCase()
      .includes(studentFilter.toLowerCase())
  );

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="course-assign">
      <h2>Gestión de cursos</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Curso</th>
            <th>Docente</th>
            <th>Estudiantes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>
                {c.teacher
                  ? teachers.find((t) => t.id === c.teacher)?.first_name
                  : "Sin docente"}
              </td>
              <td>{c.students.length}</td>
              <td>
                <button className="ghost" onClick={() => openManageCourse(c)}>
                  ⚙ Gestionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{activeCourse.name}</h3>
              <button onClick={closeModal}>✕</button>
            </div>

            <div className="tabs">
              <div
                className={`tab ${tab === "teacher" ? "active" : ""}`}
                onClick={() => setTab("teacher")}
              >
                Docente
              </div>
              <div
                className={`tab ${tab === "students" ? "active" : ""}`}
                onClick={() => setTab("students")}
              >
                Estudiantes
              </div>
              <div
                className={`tab ${tab === "subjects" ? "active" : ""}`}
                onClick={() => setTab("subjects")}
              >
                Materias
              </div>
            </div>

            <div className="section">
              {tab === "teacher" && (
                <>
                  <label>Docente asignado</label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) =>
                      setSelectedTeacher(
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                  >
                    <option value="">Sin asignar</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.first_name} {t.last_name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {tab === "students" && (
                <>
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={studentFilter}
                    onChange={(e) => setStudentFilter(e.target.value)}
                  />

                  <div className="student-list">
                    {filteredStudents.map((s) => (
                      <label key={s.id} className="student-item">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(s.id)}
                          onChange={() =>
                            setSelectedStudents((prev) =>
                              prev.includes(s.id)
                                ? prev.filter((id) => id !== s.id)
                                : [...prev, s.id]
                            )
                          }
                        />
                        {s.first_name} {s.last_name}
                      </label>
                    ))}
                  </div>
                </>
              )}

              {tab === "subjects" && (
                <>
                  <ul>
                    {subjects.map((s) => (
                      <li key={s.id} className="subject-item">
                        {s.nombre}
                        <button
                          className="danger"
                          onClick={() => removeSubject(s.id)}
                        >
                          🗑
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="subject-add">
                    <input
                      placeholder="Nueva materia"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                    <button className="primary" onClick={addSubject}>
                      +
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="primary" onClick={saveAssignments}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}