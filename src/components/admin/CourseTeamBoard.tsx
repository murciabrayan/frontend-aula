import { useMemo, useState } from "react";
import { CheckCircle2, Search, UserSquare2, Users, X } from "lucide-react";
import StyledSelect from "@/components/StyledSelect";

type User = {
  id: number;
  first_name: string;
  last_name: string;
};

type TeamTab = "teacher" | "students";

interface CourseTeamBoardProps {
  courseName: string;
  allStudents: User[];
  teacherName: string;
  teachers: User[];
  selectedTeacher: number | "";
  onTeacherChange: (value: number | "") => void;
  selectedStudentIds: number[];
  studentFilter: string;
  onStudentFilterChange: (value: string) => void;
  onAddStudent: (studentId: number) => void;
  onRemoveStudent: (studentId: number) => void;
  onSave: () => void;
  saving: boolean;
  getStudentCourseName: (studentId: number) => string;
  onClose: () => void;
  loading: boolean;
}

const CourseTeamBoard = ({
  courseName,
  allStudents,
  teacherName,
  teachers,
  selectedTeacher,
  onTeacherChange,
  selectedStudentIds,
  studentFilter,
  onStudentFilterChange,
  onAddStudent,
  onRemoveStudent,
  onSave,
  saving,
  getStudentCourseName,
  onClose,
  loading,
}: CourseTeamBoardProps) => {
  const [activeTab, setActiveTab] = useState<TeamTab>("teacher");

  const assignedCount = selectedStudentIds.length;

  const selectedStudentsInView = useMemo(
    () => allStudents.filter((student) => selectedStudentIds.includes(student.id)).length,
    [allStudents, selectedStudentIds]
  );

  return (
    <div className="course-management__modal-backdrop">
      <div className="course-management__modal course-management__modal--wide course-management__team-modal">
        <div className="course-management__modal-header">
          <div>
            <h3>{courseName}</h3>
            <p>Administra el director de curso y los estudiantes desde este modal.</p>
          </div>
          <button
            type="button"
            className="course-management__modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            x
          </button>
        </div>

        <div className="course-management__team-tabs" role="tablist" aria-label="Gestión del curso">
          <button
            type="button"
            className={activeTab === "teacher" ? "is-active" : ""}
            onClick={() => setActiveTab("teacher")}
          >
            Director de curso
          </button>
          <button
            type="button"
            className={activeTab === "students" ? "is-active" : ""}
            onClick={() => setActiveTab("students")}
          >
            Estudiantes
          </button>
        </div>

        {loading ? (
          <div className="course-management__state">Cargando informacion del curso...</div>
        ) : activeTab === "teacher" ? (
          <div className="course-management__team-modal-body course-management__team-modal-body--teacher">
            <article className="course-management__teacher-focus-card">
              <div className="course-management__teacher-focus-icon">
                <UserSquare2 size={22} />
              </div>

              <div className="course-management__teacher-focus-copy">
                <p className="course-management__flow-step">Responsable actual</p>
                <h4>{teacherName}</h4>
                <span>Selecciona el docente que actuará como director de curso.</span>
              </div>

              <label className="course-management__teacher-field">
                <span>Asignar director</span>
                <StyledSelect
                  value={selectedTeacher}
                  onChange={(event) =>
                    onTeacherChange(event.target.value ? Number(event.target.value) : "")
                  }
                >
                  <option value="">Sin director</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </StyledSelect>
              </label>

            <div className="course-management__team-actions">
              <button
                type="button"
                className="course-management__primary-btn"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar director"}
              </button>
            </div>
          </article>
        </div>
        ) : (
          <div className="course-management__team-modal-body">
            <div className="course-management__team-toolbar">
              <label className="course-management__search course-management__search--wide">
                <Search size={16} />
                <input
                  type="text"
                  value={studentFilter}
                  onChange={(event) => onStudentFilterChange(event.target.value)}
                  placeholder="Buscar estudiante..."
                />
              </label>

              <div className="course-management__team-counter">
                <Users size={16} />
                <span>{assignedCount} asignados</span>
              </div>
            </div>

            <div className="course-management__student-table-wrap course-management__student-table-wrap--modal">
              <table className="course-management__student-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Curso actual</th>
                    <th>Estado</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4}>No hay estudiantes para esta busqueda.</td>
                    </tr>
                  ) : (
                    allStudents.map((student) => {
                      const isAssigned = selectedStudentIds.includes(student.id);
                      const currentCourse = getStudentCourseName(student.id);

                      return (
                        <tr key={student.id}>
                          <td>
                            <div className="course-management__student-cell">
                              <strong>
                                {student.first_name} {student.last_name}
                              </strong>
                            </div>
                          </td>
                          <td>{currentCourse}</td>
                          <td>
                            <span
                              className={`course-management__status-badge ${
                                isAssigned ? "is-assigned" : ""
                              }`}
                            >
                              {isAssigned ? (
                                <>
                                  <CheckCircle2 size={14} />
                                  <span>Asignado</span>
                                </>
                              ) : (
                                <span>Disponible</span>
                              )}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`course-management__action-pill ${
                                isAssigned ? "is-active" : ""
                              }`}
                              onClick={() =>
                                isAssigned
                                  ? onRemoveStudent(student.id)
                                  : onAddStudent(student.id)
                              }
                            >
                              {isAssigned ? (
                                <>
                                  <X size={14} />
                                  <span>Quitar</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={14} />
                                  <span>Asignar</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="course-management__team-footer">
              <span>{selectedStudentsInView} visibles ya estan asignados en esta busqueda.</span>
              <button
                type="button"
                className="course-management__primary-btn"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar estudiantes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseTeamBoard;
