import { useEffect, useState } from "react";
import {
  getCourses,
  updateCourse,
  removeStudent as apiRemoveStudent,
  removeTeacher as apiRemoveTeacher,
} from "../../services/courseService";
import { getTeachers, getStudents } from "../../services/userService";
import "@/commons/personas/styles/adminDashboard.css";

interface Course {
  id: number;
  name: string;
  teacher: number | null;
  students: number[];
}
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

export default function CourseAssign() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [selectedTeacher, setSelectedTeacher] = useState<number | "">("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roleType, setRoleType] = useState<"teacher" | "student" | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, tRes, sRes] = await Promise.all([
        getCourses(),
        getTeachers(),
        getStudents(),
      ]);
      setCourses(cRes.data);
      setTeachers(tRes.data);
      setStudents(sRes.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      alert("Error al cargar los datos. Verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return alert("Selecciona un curso.");
    const data: any = { students: selectedStudents };
    if (selectedTeacher !== "" && selectedTeacher !== null)
      data.teacher = selectedTeacher;
    try {
      await updateCourse(Number(selectedCourse), data);
      alert(
        isEditing
          ? "✏️ Asignación actualizada"
          : "✅ Asignación guardada correctamente"
      );
      loadData();
      resetForm();
    } catch (error) {
      console.error("Error al asignar:", error);
      alert("❌ Error al guardar la asignación.");
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course.id);
    setSelectedTeacher(course.teacher || "");
    setSelectedStudents(course.students || []);
    setShowModal(true);
    setIsEditing(true);
    setRoleType("student");
  };

  const handleRemoveStudent = async (courseId: number, studentId: number) => {
    if (!window.confirm("¿Quitar este estudiante del curso?")) return;
    try {
      await apiRemoveStudent(courseId, studentId);
      alert("Estudiante removido correctamente");
      loadData();
      if (isEditing && selectedCourse === courseId) {
        setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
      }
    } catch (err) {
      console.error("Error al remover estudiante:", err);
      alert("No se pudo remover el estudiante");
    }
  };

  const handleRemoveTeacher = async (courseId: number) => {
    if (!window.confirm("¿Quitar el docente de este curso?")) return;
    try {
      await apiRemoveTeacher(courseId);
      alert("Docente removido correctamente");
      loadData();
      if (isEditing && selectedCourse === courseId) {
        setSelectedTeacher("");
      }
    } catch (err) {
      console.error("Error al remover docente:", err);
      alert("No se pudo remover el docente");
    }
  };

  const resetForm = () => {
    setSelectedCourse("");
    setSelectedTeacher("");
    setSelectedStudents([]);
    setRoleType("");
    setShowModal(false);
    setIsEditing(false);
  };

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Cargando datos...</p>;

  return (
    <div className="course-assign">
      <h2>🏫 Gestión de Cursos</h2>
      <button
        onClick={() => {
          setShowModal(true);
          setIsEditing(false);
        }}
      >
        + Asignar Curso
      </button>

      <div className="search-box" style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="🔍 Buscar curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "#f9fafb",
            color: "#111827",
          }}
        />
      </div>

      <div
        className="bg-white shadow rounded-lg p-4 mt-4"
        style={{ overflowX: "auto" }}
      >
        <h3
          style={{
            fontWeight: "700",
            fontSize: "1.2rem",
            color: "#b8860b",
            marginBottom: "10px",
          }}
        >
          📚 Cursos actuales
        </h3>
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Docente</th>
              <th>Estudiantes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td>{course.name}</td>
                <td>
                  {course.teacher
                    ? `${teachers.find((t) => t.id === course.teacher)?.first_name || ""
                      } ${teachers.find((t) => t.id === course.teacher)?.last_name || ""
                      }`
                    : "Sin docente"}
                </td>
                <td>
                  {course.students.length > 0 ? (
                    <ul
                      style={{
                        paddingLeft: "1rem",
                        listStyleType: "none",
                        margin: 0,
                      }}
                    >
                      {course.students.map((id) => {
                        const student = students.find((s) => s.id === id);
                        return (
                          <li
                            key={id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                              padding: "4px 0",
                            }}
                          >
                            <span>
                              {student
                                ? `${student.first_name} ${student.last_name}`
                                : ""}
                            </span>
                            <button
                              onClick={() => handleRemoveStudent(course.id, id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#b91c1c",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                              }}
                              title="Quitar estudiante"
                            >
                              Eliminar
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    "Sin estudiantes"
                  )}
                </td>

                <td style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleEdit(course)}
                    style={{
                      background: "#111827",
                      color: "white",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      fontSize: "0.85rem",
                    }}
                  >
                    ✏️ Editar
                  </button>

                  {course.teacher && (
                    <button
                      onClick={() => handleRemoveTeacher(course.id)}
                      style={{
                        background: "#b8860b",
                        color: "white",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "0.85rem",
                      }}
                    >
                      🧑‍🏫 Quitar Docente
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <button className="close" onClick={() => resetForm()}>
              ✕
            </button>
            <h3
              style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#b8860b",
                marginBottom: "1rem",
              }}
            >
              {isEditing ? "Editar Asignación" : "Asignar Curso"}
            </h3>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label>Curso:</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(Number(e.target.value))}
                  disabled={isEditing}
                >
                  <option value="">-- Selecciona un curso --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Tipo de asignación:</label>
                <select
                  value={roleType}
                  onChange={(e) =>
                    setRoleType(e.target.value as "teacher" | "student" | "")
                  }
                >
                  <option value="">-- Selecciona tipo --</option>
                  <option value="teacher">Docente</option>
                  <option value="student">Estudiante</option>
                </select>
              </div>

              {roleType === "teacher" && (
                <div>
                  <label>Docente:</label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(Number(e.target.value))}
                  >
                    <option value="">-- Sin asignar --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.first_name} {t.last_name} ({t.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {roleType === "student" && (
                <div>
                  <label>Estudiantes:</label>
                  <div
                    style={{
                      maxHeight: "250px",
                      overflowY: "auto",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      padding: "10px",
                      background: "#fffaf0",
                    }}
                  >
                    {students.map((s) => {
                      const isSelected = selectedStudents.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 8px",
                            marginBottom: "4px",
                            background: isSelected ? "#fef3c7" : "white",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "background 0.2s",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              setSelectedStudents((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== s.id)
                                  : [...prev, s.id]
                              )
                            }
                          />
                          <span style={{ fontWeight: 500, color: "#111827" }}>
                            {s.first_name} {s.last_name}
                          </span>
                          <span
                            style={{ color: "#6b7280", fontSize: "0.85rem" }}
                          >
                            ({s.username})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit">
                {isEditing ? "Guardar Cambios" : "Guardar Asignación"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
