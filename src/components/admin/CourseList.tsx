import { useEffect, useState } from "react";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../services/courseService";
import "./CourseList.css";

interface Course {
  id?: number;
  name: string;
  teacher: number | null;
  students: number[];
}

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const openCreateModal = () => {
    setFormData({ name: "", teacher: null, students: [] });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setFormData(course);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (formData.id) {
        await updateCourse(formData.id, formData);
      } else {
        await createCourse(formData);
      }

      closeModal();
      await loadCourses();
    } catch (error: any) {
      if (error.response?.data?.name) {
        setErrorMsg(error.response.data.name);
      } else if (error.response?.data?.detail) {
        setErrorMsg(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors) {
        setErrorMsg(error.response.data.non_field_errors[0]);
      } else {
        setErrorMsg("Error al guardar el curso");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

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
      <div className="course-header">
        <h2 className="course-title">📚 Gestión de Cursos</h2>
        <button className="btn-primary" onClick={openCreateModal}>
          + Nuevo curso
        </button>
      </div>

      <ul className="course-list">
        {courses.map((course) => (
          <li key={course.id} className="course-item">
            <span>{course.name}</span>
            <div className="btn-group">
              <button
                className="btn-secondary"
                onClick={() => openEditModal(course)}
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">
              {formData.id ? "Editar curso" : "Crear curso"}
            </h3>

            <form onSubmit={handleSubmit} className="modal-form">
              <input
                type="text"
                placeholder="Nombre del curso"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />

              {errorMsg && <p className="error-text">{errorMsg}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {formData.id ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}