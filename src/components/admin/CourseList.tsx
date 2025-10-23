import { useEffect, useState } from "react";
import { getCourses, createCourse, updateCourse, deleteCourse } from "../../services/courseService";
import "./CourseList.css"; // 👈 tu estilo personalizado

interface Course {
  id?: number;
  name: string;
  teacher: number | null;
  students: number[];
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<Course>({
    name: "",
    teacher: null,
    students: [],
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    console.log("📤 Enviando datos al backend:", formData);
    if (formData.id) {
      await updateCourse(formData.id, formData);
    } else {
      await createCourse(formData);
    }
    setFormData({ name: "", teacher: null, students: [] });
    await loadCourses();
  } catch (error: any) {
    console.error("Error al guardar curso:", error.response?.data || error);
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleEdit = (course: Course) => setFormData(course);

  const handleDelete = async (id: number) => {
    if (confirm("¿Seguro que deseas eliminar este curso?")) {
      try {
        await deleteCourse(id);
        await loadCourses();
      } catch (error) {
        console.error("Error al eliminar curso:", error);
      }
    }
  };

  return (
    <div className="course-container">
      <h2 className="course-title">📚 Gestión de Cursos</h2>

      <form onSubmit={handleSubmit} className="course-form">
        <input
          type="text"
          placeholder="Nombre del curso"
          value={formData.name}
          onChange={handleChange}
          className="input-field"
        />
        <button type="submit" className="btn-primary">
          {formData.id ? "Actualizar" : "Crear"}
        </button>
      </form>

      <ul className="course-list">
        {courses.map((course) => (
          <li key={course.id} className="course-item">
            <span>{course.name}</span>
            <div className="btn-group">
              <button
                className="btn-secondary"
                onClick={() => handleEdit(course)}
              >
                Editar
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(course.id!)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
