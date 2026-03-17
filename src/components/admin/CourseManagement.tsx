import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Layers3,
  LayoutPanelTop,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  UserSquare2,
  Users,
} from "lucide-react";
import { useFeedback } from "@/context/FeedbackContext";
import {
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from "../../services/courseService";
import { getTeachers, getStudents } from "../../services/userService";
import {
  createArea,
  deleteArea,
  getAreasByCourse,
  updateSubjectArea,
} from "../../commons/personas/services/areaservice";
import {
  createSubject,
  deleteSubject,
  getSubjectsByCourse,
} from "../../commons/personas/services/subjectService";
import {
  createAssignment,
  createIndicator,
  deleteAssignment,
  deleteIndicator,
  getAssignmentsByCourse,
  getIndicators,
  updateIndicator,
  type Indicator,
  type SubjectIndicatorAssignment,
} from "../../commons/personas/services/indicatorService";
import "./CourseManagement.css";

interface Course {
  id?: number;
  name: string;
  teacher: number | null;
  students: number[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface Area {
  id: number;
  nombre: string;
  curso: number;
}

interface Subject {
  id: number;
  nombre: string;
  curso?: number;
  area?: number | null;
  area_nombre?: string;
}

type StructureSection = "areas" | "materias" | "indicadores";
type CourseManagementMode = "course" | "structure";

type PeriodSelectorState = {
  1: number | "";
  2: number | "";
  3: number | "";
  4: number | "";
};

const emptyPeriodState = (): PeriodSelectorState => ({
  1: "",
  2: "",
  3: "",
  4: "",
});

const emptyCourseForm = (): Course => ({
  name: "",
  teacher: null,
  students: [],
});

interface CourseManagementProps {
  mode?: CourseManagementMode;
}

const CourseManagement = ({
  mode = "course",
}: CourseManagementProps) => {
  const { confirm, showToast } = useFeedback();

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedStructureSection, setSelectedStructureSection] =
    useState<StructureSection>("areas");
  const [courseSearch, setCourseSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("");

  const [courseForm, setCourseForm] = useState<Course>(emptyCourseForm());
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseError, setCourseError] = useState("");

  const [selectedTeacher, setSelectedTeacher] = useState<number | "">("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const [newAreaName, setNewAreaName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectArea, setNewSubjectArea] = useState<number | "">("");

  const [indicatorBank, setIndicatorBank] = useState<Indicator[]>([]);
  const [indicatorAssignments, setIndicatorAssignments] = useState<
    SubjectIndicatorAssignment[]
  >([]);
  const [selectedIndicators, setSelectedIndicators] = useState<
    Record<number, PeriodSelectorState>
  >({});
  const [newIndicatorDescription, setNewIndicatorDescription] = useState("");
  const [editingIndicatorId, setEditingIndicatorId] = useState<number | null>(
    null
  );
  const [editingIndicatorDescription, setEditingIndicatorDescription] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [savingCoursePeople, setSavingCoursePeople] = useState(false);
  const [savingSubjectId, setSavingSubjectId] = useState<number | null>(null);
  const [savingAssignmentKey, setSavingAssignmentKey] = useState<string | null>(
    null
  );

  const isCourseMode = mode === "course";

  useEffect(() => {
    void loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [courseRes, teacherRes, studentRes] = await Promise.all([
        getCourses(),
        getTeachers(),
        getStudents(),
      ]);

      setCourses(courseRes.data || []);
      setTeachers(teacherRes.data || []);
      setStudents(studentRes.data || []);
    } catch (error) {
      console.error("Error cargando configuracion de cursos", error);
      showToast({
        type: "error",
        title: "Cursos",
        message: "No se pudo cargar la informacion de cursos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) => course.name.toLowerCase().includes(query));
  }, [courseSearch, courses]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  );

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId]
  );

  const filteredStudents = useMemo(() => {
    const query = studentFilter.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(query)
    );
  }, [studentFilter, students]);

  const groupedSubjects = useMemo(() => {
    return areas.map((area) => ({
      area,
      subjects: subjects.filter((subject) => subject.area === area.id),
    }));
  }, [areas, subjects]);

  const subjectsWithoutArea = useMemo(
    () => subjects.filter((subject) => !subject.area),
    [subjects]
  );

  const getTeacherName = (teacherId: number | null) => {
    if (!teacherId) return "Sin docente";
    const teacher = teachers.find((item) => item.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Sin docente";
  };

  const getStudentName = (studentId: number) => {
    const student = students.find((item) => item.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Estudiante";
  };

  const initializeSelectedIndicators = (subjectList: Subject[]) => {
    const nextState: Record<number, PeriodSelectorState> = {};
    subjectList.forEach((subject) => {
      nextState[subject.id] = emptyPeriodState();
    });
    setSelectedIndicators(nextState);
  };

  const openCourseWorkspace = async (course: Course) => {
    if (!course.id) return;

    setSelectedCourseId(course.id);
    setSelectedTeacher(course.teacher || "");
    setSelectedStudents(course.students || []);
    setSelectedStructureSection("areas");
    setStudentFilter("");
    setLoadingWorkspace(true);

    try {
      const [subjectsRes, areasRes, indicatorsRes, assignmentsRes] =
        await Promise.all([
          getSubjectsByCourse(course.id),
          getAreasByCourse(course.id),
          getIndicators(),
          getAssignmentsByCourse(course.id),
        ]);

      const loadedSubjects = subjectsRes.data || [];
      setSubjects(loadedSubjects);
      setAreas(areasRes.data || []);
      setIndicatorBank(indicatorsRes.data || []);
      setIndicatorAssignments(assignmentsRes.data || []);
      initializeSelectedIndicators(loadedSubjects);
      setSelectedSubjectId(loadedSubjects[0]?.id ?? null);
    } catch (error) {
      console.error("Error cargando el curso seleccionado", error);
      showToast({
        type: "error",
        title: "Curso",
        message: "No se pudo abrir la configuracion del curso.",
      });
    } finally {
      setLoadingWorkspace(false);
    }
  };

  const resetCourseForm = () => {
    setCourseForm(emptyCourseForm());
    setEditingCourseId(null);
    setCourseError("");
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id ?? null);
    setCourseForm({
      id: course.id,
      name: course.name,
      teacher: course.teacher,
      students: course.students,
    });
    setCourseError("");
  };

  const handleSubmitCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    setCourseError("");

    try {
      if (editingCourseId) {
        const response = await updateCourse(editingCourseId, courseForm);
        const updatedCourse = response.data;

        setCourses((current) =>
          current.map((course) =>
            course.id === editingCourseId ? { ...course, ...updatedCourse } : course
          )
        );

        if (selectedCourseId === editingCourseId) {
          setSelectedTeacher(updatedCourse.teacher ?? "");
          setSelectedStudents(updatedCourse.students ?? []);
        }

        showToast({
          type: "success",
          title: "Curso actualizado",
          message: "Los cambios del curso se guardaron correctamente.",
        });
      } else {
        const response = await createCourse(courseForm);
        const createdCourse = response.data;

        setCourses((current) => [...current, createdCourse]);
        showToast({
          type: "success",
          title: "Curso creado",
          message: "El curso se creo correctamente.",
        });

        await openCourseWorkspace(createdCourse);
      }

      resetCourseForm();
    } catch (error: any) {
      if (error.response?.data?.name) {
        setCourseError(error.response.data.name);
      } else if (error.response?.data?.detail) {
        setCourseError(error.response.data.detail);
      } else if (error.response?.data?.non_field_errors?.[0]) {
        setCourseError(error.response.data.non_field_errors[0]);
      } else {
        setCourseError("No se pudo guardar el curso.");
      }
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    const accepted = await confirm({
      title: "Eliminar curso",
      message: "Esta accion eliminara el curso seleccionado.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });

    if (!accepted) return;

    try {
      await deleteCourse(courseId);
      setCourses((current) => current.filter((course) => course.id !== courseId));

      if (selectedCourseId === courseId) {
        setSelectedCourseId(null);
        setSubjects([]);
        setAreas([]);
        setIndicatorBank([]);
        setIndicatorAssignments([]);
        setSelectedIndicators({});
        setSelectedSubjectId(null);
      }

      showToast({
        type: "success",
        title: "Curso eliminado",
        message: "El curso se elimino correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar curso", error);
      showToast({
        type: "error",
        title: "Curso",
        message: "No se pudo eliminar el curso.",
      });
    }
  };

  const saveCoursePeople = async () => {
    if (!selectedCourse?.id) return;

    setSavingCoursePeople(true);
    try {
      const response = await updateCourse(selectedCourse.id, {
        teacher: selectedTeacher === "" ? null : selectedTeacher,
        students: [...selectedStudents],
      });

      const updatedCourse = response.data;
      setCourses((current) =>
        current.map((course) =>
          course.id === selectedCourse.id ? { ...course, ...updatedCourse } : course
        )
      );

      showToast({
        type: "success",
        title: "Curso actualizado",
        message: "Docente y estudiantes guardados correctamente.",
      });
    } catch (error) {
      console.error("Error guardando docentes y estudiantes", error);
      showToast({
        type: "error",
        title: "Curso",
        message: "No se pudieron guardar los cambios del curso.",
      });
    } finally {
      setSavingCoursePeople(false);
    }
  };

  const addArea = async () => {
    if (!selectedCourse?.id) return;
    const nombre = newAreaName.trim();
    if (!nombre) return;

    try {
      const response = await createArea({
        nombre,
        curso: selectedCourse.id,
      });

      setAreas((current) => [...current, response.data]);
      setNewAreaName("");
      showToast({
        type: "success",
        title: "Area creada",
        message: "El area se creo correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Area",
        message:
          error?.response?.data?.non_field_errors?.[0] ||
          error?.response?.data?.detail ||
          "No se pudo crear el area.",
      });
    }
  };

  const removeArea = async (areaId: number) => {
    const hasSubjects = subjects.some((subject) => subject.area === areaId);

    if (hasSubjects) {
      showToast({
        type: "warning",
        title: "Area en uso",
        message: "No puedes eliminar un area que aun tiene materias asignadas.",
      });
      return;
    }

    const accepted = await confirm({
      title: "Eliminar area",
      message: "Esta accion eliminara el area seleccionada.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });

    if (!accepted) return;

    await deleteArea(areaId);
    setAreas((current) => current.filter((area) => area.id !== areaId));
    showToast({
      type: "success",
      title: "Area eliminada",
      message: "El area se elimino correctamente.",
    });
  };

  const addSubject = async () => {
    if (!selectedCourse?.id) return;
    const nombre = newSubjectName.trim();
    if (!nombre) return;

    try {
      const response = await createSubject({
        nombre,
        curso: selectedCourse.id,
        area: newSubjectArea === "" ? null : newSubjectArea,
      });

      const createdSubject = response.data;
      setSubjects((current) => [...current, createdSubject]);
      setSelectedIndicators((current) => ({
        ...current,
        [createdSubject.id]: emptyPeriodState(),
      }));
      setSelectedSubjectId(createdSubject.id);
      setNewSubjectName("");
      setNewSubjectArea("");

      showToast({
        type: "success",
        title: "Materia creada",
        message: "La materia se creo correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Materia",
        message:
          error?.response?.data?.non_field_errors?.[0] ||
          error?.response?.data?.detail ||
          "No se pudo crear la materia.",
      });
    }
  };

  const removeSubject = async (subjectId: number) => {
    const accepted = await confirm({
      title: "Eliminar materia",
      message: "Esta accion eliminara la materia seleccionada.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });

    if (!accepted) return;

    const remainingSubjects = subjects.filter((subject) => subject.id !== subjectId);

    await deleteSubject(subjectId);
    setSubjects(remainingSubjects);
    setIndicatorAssignments((current) =>
      current.filter((assignment) => assignment.materia !== subjectId)
    );
    setSelectedIndicators((current) => {
      const next = { ...current };
      delete next[subjectId];
      return next;
    });
    setSelectedSubjectId(
      selectedSubjectId === subjectId ? remainingSubjects[0]?.id ?? null : selectedSubjectId
    );

    showToast({
      type: "success",
      title: "Materia eliminada",
      message: "La materia se elimino correctamente.",
    });
  };

  const handleAssignAreaToSubject = async (
    subjectId: number,
    areaId: number | ""
  ) => {
    try {
      setSavingSubjectId(subjectId);
      const response = await updateSubjectArea(
        subjectId,
        areaId === "" ? null : areaId
      );

      setSubjects((current) =>
        current.map((subject) =>
          subject.id === subjectId ? { ...subject, ...response.data } : subject
        )
      );
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Materia",
        message:
          error?.response?.data?.detail ||
          "No se pudo actualizar el area de la materia.",
      });
    } finally {
      setSavingSubjectId(null);
    }
  };

  const addIndicatorToBank = async () => {
    const descripcion = newIndicatorDescription.trim();
    if (!descripcion) return;

    try {
      const response = await createIndicator({ descripcion });
      setIndicatorBank((current) =>
        [...current, response.data].sort((a, b) =>
          a.descripcion.localeCompare(b.descripcion)
        )
      );
      setNewIndicatorDescription("");
      showToast({
        type: "success",
        title: "Indicador creado",
        message: "El indicador se creo correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Indicador",
        message:
          error?.response?.data?.descripcion?.[0] ||
          error?.response?.data?.detail ||
          error?.response?.data?.non_field_errors?.[0] ||
          "No se pudo crear el indicador.",
      });
    }
  };

  const saveEditedIndicator = async () => {
    if (!editingIndicatorId) return;
    const descripcion = editingIndicatorDescription.trim();
    if (!descripcion) return;

    try {
      const response = await updateIndicator(editingIndicatorId, { descripcion });

      setIndicatorBank((current) =>
        current
          .map((indicator) =>
            indicator.id === editingIndicatorId ? response.data : indicator
          )
          .sort((a, b) => a.descripcion.localeCompare(b.descripcion))
      );

      setIndicatorAssignments((current) =>
        current.map((assignment) =>
          assignment.indicador === editingIndicatorId
            ? {
                ...assignment,
                indicador_descripcion: response.data.descripcion,
              }
            : assignment
        )
      );

      setEditingIndicatorId(null);
      setEditingIndicatorDescription("");
      showToast({
        type: "success",
        title: "Indicador actualizado",
        message: "El indicador se actualizo correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Indicador",
        message:
          error?.response?.data?.descripcion?.[0] ||
          error?.response?.data?.detail ||
          error?.response?.data?.non_field_errors?.[0] ||
          "No se pudo editar el indicador.",
      });
    }
  };

  const removeIndicatorFromBank = async (indicatorId: number) => {
    const accepted = await confirm({
      title: "Eliminar indicador",
      message: "Esta accion eliminara el indicador del banco.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });

    if (!accepted) return;

    try {
      await deleteIndicator(indicatorId);
      setIndicatorBank((current) =>
        current.filter((indicator) => indicator.id !== indicatorId)
      );
      setIndicatorAssignments((current) =>
        current.filter((assignment) => assignment.indicador !== indicatorId)
      );
      showToast({
        type: "success",
        title: "Indicador eliminado",
        message: "El indicador se elimino correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Indicador",
        message:
          error?.response?.data?.detail ||
          "No se pudo eliminar el indicador.",
      });
    }
  };

  const handleSelectedIndicatorChange = (
    subjectId: number,
    period: 1 | 2 | 3 | 4,
    indicatorId: number | ""
  ) => {
    setSelectedIndicators((current) => ({
      ...current,
      [subjectId]: {
        ...(current[subjectId] || emptyPeriodState()),
        [period]: indicatorId,
      },
    }));
  };

  const assignIndicatorToSubject = async (
    subjectId: number,
    period: 1 | 2 | 3 | 4
  ) => {
    const indicatorId = selectedIndicators[subjectId]?.[period];
    if (!indicatorId) return;

    const assignmentKey = `${subjectId}-${period}`;

    try {
      setSavingAssignmentKey(assignmentKey);
      const response = await createAssignment({
        materia: subjectId,
        periodo: period,
        indicador: Number(indicatorId),
      });

      setIndicatorAssignments((current) => [...current, response.data]);
      setSelectedIndicators((current) => ({
        ...current,
        [subjectId]: {
          ...(current[subjectId] || emptyPeriodState()),
          [period]: "",
        },
      }));
      showToast({
        type: "success",
        title: "Indicador asignado",
        message: `Se asigno correctamente al periodo ${period}.`,
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Asignacion",
        message:
          error?.response?.data?.non_field_errors?.[0] ||
          error?.response?.data?.detail ||
          "No se pudo asignar el indicador.",
      });
    } finally {
      setSavingAssignmentKey(null);
    }
  };

  const unassignIndicator = async (assignmentId: number) => {
    const accepted = await confirm({
      title: "Quitar indicador",
      message: "Esta accion quitara el indicador asignado a la materia.",
      confirmText: "Quitar",
      cancelText: "Cancelar",
      tone: "danger",
    });

    if (!accepted) return;

    try {
      await deleteAssignment(assignmentId);
      setIndicatorAssignments((current) =>
        current.filter((assignment) => assignment.id !== assignmentId)
      );
      showToast({
        type: "success",
        title: "Indicador quitado",
        message: "El indicador se quito correctamente.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Asignacion",
        message:
          error?.response?.data?.detail ||
          "No se pudo quitar el indicador.",
      });
    }
  };

  const getAssignmentsForSubjectPeriod = (
    subjectId: number,
    period: 1 | 2 | 3 | 4
  ) =>
    indicatorAssignments.filter(
      (assignment) => assignment.materia === subjectId && assignment.periodo === period
    );

  const renderSubjectsGroup = (title: string, list: Subject[]) => {
    if (list.length === 0) return null;

    return (
      <div className="course-management__subject-group">
        <div className="course-management__subject-group-title">{title}</div>
        {list.map((subject) => (
          <button
            key={subject.id}
            type="button"
            className={`course-management__subject-item ${
              selectedSubjectId === subject.id ? "is-active" : ""
            }`}
            onClick={() => setSelectedSubjectId(subject.id)}
          >
            <div>
              <strong>{subject.nombre}</strong>
              <span>{subject.area_nombre || "Sin area"}</span>
            </div>
            <span className="course-management__subject-chevron">&gt;</span>
          </button>
        ))}
      </div>
    );
  };

  const renderCourseWorkspace = () => (
    <div className="course-management__roster-shell">
      <article className="course-management__card course-management__roster-hero">
        <div>
          <p className="course-management__eyebrow">Configuracion del curso</p>
          <h3>{selectedCourse?.name}</h3>
          <p className="course-management__section-copy">
            Un espacio para armar el curso con calma: define el docente, revisa
            el grupo y ajusta estudiantes sin salir de la misma vista.
          </p>
        </div>
        <div className="course-management__hero-meta">
          <span>
            <UserSquare2 size={15} />
            {getTeacherName(selectedTeacher === "" ? null : selectedTeacher)}
          </span>
          <span>
            <Users size={15} />
            {selectedStudents.length} estudiantes asignados
          </span>
        </div>
      </article>

      <div className="course-management__roster-overview">
        <div className="course-management__roster-stat">
          <span className="course-management__roster-stat-label">Docente</span>
          <strong>{getTeacherName(selectedTeacher === "" ? null : selectedTeacher)}</strong>
        </div>
        <div className="course-management__roster-stat">
          <span className="course-management__roster-stat-label">Estudiantes</span>
          <strong>{selectedStudents.length}</strong>
        </div>
        <div className="course-management__roster-stat">
          <span className="course-management__roster-stat-label">Estado</span>
          <strong>{selectedStudents.length > 0 ? "Conformado" : "En preparacion"}</strong>
        </div>
      </div>

      <div className="course-management__roster-grid">
        <aside className="course-management__roster-side">
          <article className="course-management__card course-management__teacher-panel">
            <div className="course-management__card-header">
              <div>
                <h3>Docente responsable</h3>
                <p>Selecciona al docente principal en un panel dedicado.</p>
              </div>
            </div>

            <div className="course-management__select-shell">
              <span className="course-management__select-label">Docente del curso</span>
              <select
                value={selectedTeacher}
                onChange={(event) =>
                  setSelectedTeacher(
                    event.target.value ? Number(event.target.value) : ""
                  )
                }
              >
                <option value="">Sin asignar</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="course-management__teacher-summary">
              <div className="course-management__summary-chip">
                <UserSquare2 size={16} />
                <div>
                  <strong>Responsable actual</strong>
                  <span>
                    {getTeacherName(selectedTeacher === "" ? null : selectedTeacher)}
                  </span>
                </div>
              </div>
            </div>

            <div className="course-management__sticky-actions">
              <button
                type="button"
                className="course-management__primary-btn"
                onClick={() => void saveCoursePeople()}
                disabled={savingCoursePeople}
              >
                <Save size={16} />
                <span>{savingCoursePeople ? "Guardando..." : "Guardar equipo"}</span>
              </button>
            </div>
          </article>

          <article className="course-management__card course-management__selection-panel">
            <div className="course-management__card-header">
              <div>
                <h3>Estudiantes elegidos</h3>
                <p>Resumen rapido del grupo que ya hace parte del curso.</p>
              </div>
            </div>

            <div className="course-management__selected-strip">
              {selectedStudents.length === 0 ? (
                <span className="course-management__selected-empty">
                  Aun no has agregado estudiantes.
                </span>
              ) : (
                selectedStudents.map((studentId) => (
                  <span
                    key={studentId}
                    className="course-management__selected-chip"
                  >
                    {getStudentName(studentId)}
                  </span>
                ))
              )}
            </div>
          </article>
        </aside>

        <article className="course-management__card course-management__student-bank">
          <div className="course-management__card-header">
            <div>
              <h3>Explorador de estudiantes</h3>
              <p>Agrega o quita estudiantes desde una grilla amplia y mas comoda de recorrer.</p>
            </div>
          </div>

          <div className="course-management__students-topbar">
            <label className="course-management__search course-management__search--compact">
              <Search size={16} />
              <input
                type="text"
                value={studentFilter}
                onChange={(event) => setStudentFilter(event.target.value)}
                placeholder="Buscar estudiante..."
              />
            </label>
            <div className="course-management__summary-chip">
              <Users size={16} />
              <div>
                <strong>Seleccion actual</strong>
                <span>{selectedStudents.length} marcados</span>
              </div>
            </div>
          </div>

          <div className="course-management__student-grid">
            {filteredStudents.map((student) => (
              <label
                key={student.id}
                className={`course-management__student-card ${
                  selectedStudents.includes(student.id) ? "is-selected" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() =>
                    setSelectedStudents((current) =>
                      current.includes(student.id)
                        ? current.filter((id) => id !== student.id)
                        : [...current, student.id]
                    )
                  }
                />
                <div className="course-management__student-card-body">
                  <span className="course-management__student-check">
                    {selectedStudents.includes(student.id) ? <Check size={14} /> : null}
                  </span>
                  <div>
                    <strong>
                      {student.first_name} {student.last_name}
                    </strong>
                    <small>
                      {selectedStudents.includes(student.id)
                        ? "Incluido en este curso"
                        : "Disponible para asignar"}
                    </small>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </article>
      </div>
    </div>
  );

  const renderStructureWorkspace = () => (
    <div className="course-management__builder-shell">
      <article className="course-management__card course-management__builder-hero">
        <div>
          <p className="course-management__eyebrow">Arquitectura del curso</p>
          <h3>{selectedCourse?.name}</h3>
          <p className="course-management__section-copy">
            Este modulo solo sirve para construir la estructura academica. Elige
            una capa del curso y trabajala con espacio propio.
          </p>
        </div>
        <div className="course-management__hero-meta">
          <span>
            <Layers3 size={15} />
            {areas.length} areas
          </span>
          <span>
            <BookOpen size={15} />
            {subjects.length} materias
          </span>
          <span>
            <LayoutPanelTop size={15} />
            {indicatorBank.length} indicadores
          </span>
        </div>
      </article>

      <div className="course-management__builder-layout">
        <aside className="course-management__builder-nav">
          <button
            type="button"
            className={`course-management__builder-tab ${
              selectedStructureSection === "areas" ? "is-active" : ""
            }`}
            onClick={() => setSelectedStructureSection("areas")}
          >
            <span>01</span>
            <div>
              <strong>Areas</strong>
              <small>Bloques del curso</small>
            </div>
          </button>
          <button
            type="button"
            className={`course-management__builder-tab ${
              selectedStructureSection === "materias" ? "is-active" : ""
            }`}
            onClick={() => setSelectedStructureSection("materias")}
          >
            <span>02</span>
            <div>
              <strong>Materias</strong>
              <small>Mapa academico</small>
            </div>
          </button>
          <button
            type="button"
            className={`course-management__builder-tab ${
              selectedStructureSection === "indicadores" ? "is-active" : ""
            }`}
            onClick={() => setSelectedStructureSection("indicadores")}
          >
            <span>03</span>
            <div>
              <strong>Indicadores</strong>
              <small>Evaluacion por periodo</small>
            </div>
          </button>
        </aside>

        <div className="course-management__builder-stage">
          {selectedStructureSection === "areas" ? (
            <div className="course-management__areas-stage">
              <article className="course-management__card">
                <div className="course-management__card-header">
                  <div>
                    <h3>Panel de areas</h3>
                    <p>Crea y revisa las areas en un tablero amplio.</p>
                  </div>
                </div>
                <div className="course-management__scroll-panel">
                  {areas.length === 0 ? (
                    <div className="course-management__empty">
                      Aun no hay areas creadas.
                    </div>
                  ) : (
                    areas.map((area) => (
                      <div key={area.id} className="course-management__simple-row">
                        <div>
                          <strong>{area.nombre}</strong>
                          <span>
                            {subjects.filter((subject) => subject.area === area.id).length} materias
                          </span>
                        </div>
                        <button
                          type="button"
                          className="course-management__action-pill is-danger"
                          onClick={() => void removeArea(area.id)}
                        >
                          <Trash2 size={14} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className="course-management__card">
                <div className="course-management__card-header">
                  <div>
                    <h3>Nueva area</h3>
                    <p>Agrega una nueva area sin competir con otras configuraciones.</p>
                  </div>
                </div>
                <div className="course-management__stack-form">
                  <input
                    type="text"
                    value={newAreaName}
                    onChange={(event) => setNewAreaName(event.target.value)}
                    placeholder="Nombre del area"
                  />
                  <button
                    type="button"
                    className="course-management__primary-btn"
                    onClick={() => void addArea()}
                  >
                    <Plus size={15} />
                    <span>Crear area</span>
                  </button>
                </div>
              </article>
            </div>
          ) : null}

          {selectedStructureSection === "materias" ? (
            <div className="course-management__subjects-stage">
              <article className="course-management__card">
                <div className="course-management__card-header">
                  <div>
                    <h3>Biblioteca de materias</h3>
                    <p>Selecciona una materia y ajusta su area en el panel lateral.</p>
                  </div>
                </div>
                <div className="course-management__scroll-panel">
                  {groupedSubjects.map((group) =>
                    renderSubjectsGroup(group.area.nombre, group.subjects)
                  )}
                  {subjectsWithoutArea.length > 0 ? (
                    <div className="course-management__subject-group">
                      <div className="course-management__subject-group-title">
                        Sin area
                      </div>
                      {subjectsWithoutArea.map((subject) => (
                        <button
                          key={subject.id}
                          type="button"
                          className={`course-management__subject-item ${
                            selectedSubjectId === subject.id ? "is-active" : ""
                          }`}
                          onClick={() => setSelectedSubjectId(subject.id)}
                        >
                          <div>
                            <strong>{subject.nombre}</strong>
                            <span>Sin area</span>
                          </div>
                          <span className="course-management__subject-chevron">&gt;</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>

              <div className="course-management__subjects-side">
                <article className="course-management__card">
                  <div className="course-management__card-header">
                    <div>
                      <h3>Nueva materia</h3>
                      <p>Crea la materia y ubicala directamente en un area.</p>
                    </div>
                  </div>
                  <div className="course-management__stack-form">
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(event) => setNewSubjectName(event.target.value)}
                      placeholder="Nombre de la materia"
                    />
                    <select
                      value={newSubjectArea}
                      onChange={(event) =>
                        setNewSubjectArea(
                          event.target.value ? Number(event.target.value) : ""
                        )
                      }
                    >
                      <option value="">Sin area</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="course-management__primary-btn"
                      onClick={() => void addSubject()}
                    >
                      <Plus size={15} />
                      <span>Crear materia</span>
                    </button>
                  </div>
                </article>

                <article className="course-management__card">
                  <div className="course-management__card-header">
                    <div>
                      <h3>Detalle activo</h3>
                      <p>
                        {selectedSubject
                          ? "Administra una sola materia a la vez."
                          : "Selecciona una materia para editar su area."}
                      </p>
                    </div>
                  </div>
                  {!selectedSubject ? (
                    <div className="course-management__empty course-management__empty--large">
                      Selecciona una materia del listado.
                    </div>
                  ) : (
                    <div className="course-management__stack-form">
                      <div className="course-management__summary-chip">
                        <BookOpen size={16} />
                        <div>
                          <strong>{selectedSubject.nombre}</strong>
                          <span>{selectedSubject.area_nombre || "Sin area"}</span>
                        </div>
                      </div>
                      <select
                        value={selectedSubject.area ?? ""}
                        disabled={savingSubjectId === selectedSubject.id}
                        onChange={(event) =>
                          void handleAssignAreaToSubject(
                            selectedSubject.id,
                            event.target.value ? Number(event.target.value) : ""
                          )
                        }
                      >
                        <option value="">Sin area</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.nombre}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="course-management__action-pill is-danger"
                        onClick={() => void removeSubject(selectedSubject.id)}
                      >
                        <Trash2 size={14} />
                        <span>Eliminar materia</span>
                      </button>
                    </div>
                  )}
                </article>
              </div>
            </div>
          ) : null}

          {selectedStructureSection === "indicadores" ? (
            <div className="course-management__indicators-stage">
              <article className="course-management__card">
                <div className="course-management__card-header">
                  <div>
                    <h3>Materia activa</h3>
                    <p>Elige una materia desde botones visibles, no desde una vista mezclada.</p>
                  </div>
                </div>
                <div className="course-management__subject-pills">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      className={`course-management__subject-pill ${
                        selectedSubjectId === subject.id ? "is-active" : ""
                      }`}
                      onClick={() => setSelectedSubjectId(subject.id)}
                    >
                      <strong>{subject.nombre}</strong>
                      <span>{subject.area_nombre || "Sin area"}</span>
                    </button>
                  ))}
                </div>
              </article>

              <div className="course-management__indicators-layout">
                <article className="course-management__card">
                  <div className="course-management__card-header">
                    <div>
                      <h3>Asignacion por periodos</h3>
                      <p>
                        {selectedSubject
                          ? `Trabajando sobre ${selectedSubject.nombre}.`
                          : "Selecciona una materia para continuar."}
                      </p>
                    </div>
                  </div>
                  {!selectedSubject ? (
                    <div className="course-management__empty course-management__empty--large">
                      Selecciona una materia para administrar indicadores.
                    </div>
                  ) : (
                    <div className="course-management__period-grid">
                      {[1, 2, 3, 4].map((period) => {
                        const typedPeriod = period as 1 | 2 | 3 | 4;
                        const periodAssignments = getAssignmentsForSubjectPeriod(
                          selectedSubject.id,
                          typedPeriod
                        );

                        return (
                          <div key={period} className="course-management__period-card">
                            <div className="course-management__period-title">
                              Periodo {period}
                            </div>
                            <div className="course-management__period-form">
                              <select
                                value={
                                  selectedIndicators[selectedSubject.id]?.[typedPeriod] ?? ""
                                }
                                onChange={(event) =>
                                  handleSelectedIndicatorChange(
                                    selectedSubject.id,
                                    typedPeriod,
                                    event.target.value ? Number(event.target.value) : ""
                                  )
                                }
                              >
                                <option value="">Selecciona un indicador</option>
                                {indicatorBank.map((indicator) => (
                                  <option key={indicator.id} value={indicator.id}>
                                    {indicator.descripcion}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="course-management__primary-btn"
                                disabled={
                                  savingAssignmentKey === `${selectedSubject.id}-${period}`
                                }
                                onClick={() =>
                                  void assignIndicatorToSubject(
                                    selectedSubject.id,
                                    typedPeriod
                                  )
                                }
                              >
                                {savingAssignmentKey === `${selectedSubject.id}-${period}`
                                  ? "..."
                                  : "Asignar"}
                              </button>
                            </div>
                            <div className="course-management__assignment-list">
                              {periodAssignments.length === 0 ? (
                                <div className="course-management__empty">
                                  Sin indicadores asignados.
                                </div>
                              ) : (
                                periodAssignments.map((assignment) => (
                                  <div
                                    key={assignment.id}
                                    className="course-management__assignment-item"
                                  >
                                    <span>{assignment.indicador_descripcion}</span>
                                    <button
                                      type="button"
                                      className="course-management__icon-btn is-danger"
                                      onClick={() => void unassignIndicator(assignment.id)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>

                <article className="course-management__card course-management__indicator-bank">
                  <div className="course-management__card-header">
                    <div>
                      <h3>Banco de indicadores</h3>
                      <p>Crea y edita indicadores en un panel aparte.</p>
                    </div>
                  </div>
                  <div className="course-management__inline-form course-management__inline-form--column">
                    <textarea
                      value={newIndicatorDescription}
                      onChange={(event) =>
                        setNewIndicatorDescription(event.target.value)
                      }
                      placeholder="Escribe un indicador para reutilizarlo..."
                    />
                    <button
                      type="button"
                      className="course-management__primary-btn"
                      onClick={() => void addIndicatorToBank()}
                    >
                      <Plus size={15} />
                      <span>Crear indicador</span>
                    </button>
                  </div>
                  <div className="course-management__indicator-list">
                    {indicatorBank.length === 0 ? (
                      <div className="course-management__empty">
                        Aun no hay indicadores creados.
                      </div>
                    ) : (
                      indicatorBank.map((indicator) => (
                        <div
                          key={indicator.id}
                          className="course-management__indicator-item"
                        >
                          {editingIndicatorId === indicator.id ? (
                            <>
                              <textarea
                                value={editingIndicatorDescription}
                                onChange={(event) =>
                                  setEditingIndicatorDescription(event.target.value)
                                }
                              />
                              <div className="course-management__indicator-actions">
                                <button
                                  type="button"
                                  className="course-management__primary-btn"
                                  onClick={() => void saveEditedIndicator()}
                                >
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  className="course-management__secondary-btn"
                                  onClick={() => {
                                    setEditingIndicatorId(null);
                                    setEditingIndicatorDescription("");
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p>{indicator.descripcion}</p>
                              <div className="course-management__indicator-actions">
                                <button
                                  type="button"
                                  className="course-management__secondary-btn"
                                  onClick={() => {
                                    setEditingIndicatorId(indicator.id);
                                    setEditingIndicatorDescription(indicator.descripcion);
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  className="course-management__danger-btn"
                                  onClick={() =>
                                    void removeIndicatorFromBank(indicator.id)
                                  }
                                >
                                  Eliminar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </article>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="course-management__state">Cargando gestion de cursos...</div>;
  }

  return (
    <section className="course-management">
      <div className="course-management__header">
        <div>
          <p className="course-management__eyebrow">Administracion academica</p>
          <h2>
            {isCourseMode
              ? "Cursos y equipo academico"
              : "Estructura academica por curso"}
          </h2>
          <p>
            {isCourseMode
              ? "Crea cursos, asigna docentes y organiza estudiantes en un flujo mas claro y comodo."
              : "Selecciona un curso y configura sus areas, materias e indicadores sin mezclarlo con la gestion del equipo."}
          </p>
        </div>
      </div>

      <div className="course-management__layout">
        <aside className="course-management__catalog">
          {isCourseMode ? (
          <article className="course-management__card">
            <div className="course-management__card-header">
              <div>
                <h3>{editingCourseId ? "Editar curso" : "Nuevo curso"}</h3>
                <p>
                  {editingCourseId
                    ? "Actualiza rapidamente la informacion principal del curso."
                    : "Crea un curso nuevo y continua con su configuracion."}
                </p>
              </div>
              {editingCourseId ? (
                <button
                  type="button"
                  className="course-management__mini-btn"
                  onClick={resetCourseForm}
                >
                  Limpiar
                </button>
              ) : null}
            </div>

            <form className="course-management__form" onSubmit={handleSubmitCourse}>
              <label className="course-management__field">
                <span>Nombre del curso</span>
                <input
                  type="text"
                  value={courseForm.name}
                  onChange={(event) =>
                    setCourseForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ej: Sexto A"
                  required
                />
              </label>

              {courseError ? (
                <div className="course-management__error">{courseError}</div>
              ) : null}

              <div className="course-management__form-actions">
                <button type="submit" className="course-management__primary-btn">
                  <Save size={16} />
                  <span>{editingCourseId ? "Guardar curso" : "Crear curso"}</span>
                </button>
                {editingCourseId ? (
                  <button
                    type="button"
                    className="course-management__secondary-btn"
                    onClick={resetCourseForm}
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
          </article>
          ) : (
          <article className="course-management__card">
            <div className="course-management__card-header">
              <div>
                <h3>Seleccion de curso</h3>
                <p>Elige el curso sobre el que vas a construir su estructura academica.</p>
              </div>
            </div>

            <div className="course-management__summary-chip">
              <BookOpen size={16} />
              <div>
                <strong>Curso activo</strong>
                <span>{selectedCourse?.name || "Aun no has seleccionado un curso"}</span>
              </div>
            </div>
          </article>
          )}

          <article className="course-management__card course-management__card--fill">
            <div className="course-management__card-header">
              <div>
                <h3>{isCourseMode ? "Catalogo de cursos" : "Cursos disponibles"}</h3>
                <p>
                  {isCourseMode
                    ? "Selecciona un curso para gestionar su equipo en el panel derecho."
                    : "Selecciona un curso para administrar sus areas, materias e indicadores."}
                </p>
              </div>
            </div>

            <label className="course-management__search">
              <Search size={16} />
              <input
                type="text"
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder="Buscar curso..."
              />
            </label>

            <div className="course-management__course-list">
              {filteredCourses.length === 0 ? (
                <div className="course-management__empty">
                  No hay cursos que coincidan con la busqueda.
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`course-management__course-card ${
                      selectedCourseId === course.id ? "is-active" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="course-management__course-main"
                      onClick={() => void openCourseWorkspace(course)}
                    >
                      <div>
                        <strong>{course.name}</strong>
                        <span>{getTeacherName(course.teacher)}</span>
                      </div>
                      <div className="course-management__course-badges">
                        <small>{course.students.length} estudiantes</small>
                        {selectedCourseId === course.id ? (
                          <span className="course-management__selected-pill">
                            Abierto
                          </span>
                        ) : null}
                      </div>
                    </button>

                    <div className="course-management__course-actions">
                      <button
                        type="button"
                        className="course-management__action-pill"
                        onClick={() => handleEditCourse(course)}
                        title="Editar curso"
                      >
                        <Pencil size={15} />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        className="course-management__action-pill is-danger"
                        onClick={() => void handleDeleteCourse(course.id!)}
                        title="Eliminar curso"
                      >
                        <Trash2 size={15} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </aside>

        <section className="course-management__workspace">
          {!selectedCourse ? (
            <div className="course-management__placeholder">
              <BookOpen size={26} />
              <h3>Selecciona un curso</h3>
              <p>
                Cuando elijas un curso, podras administrar docente, estudiantes,
                {isCourseMode
                  ? " y la asignacion del equipo sin salir de esta pantalla."
                  : " y toda su estructura academica sin salir de esta pantalla."}
              </p>
            </div>
          ) : loadingWorkspace ? (
            <div className="course-management__state">
              Cargando configuracion de {selectedCourse.name}...
            </div>
          ) : (
            <>
              {isCourseMode ? renderCourseWorkspace() : renderStructureWorkspace()}
            </>
          )}
        </section>
      </div>
    </section>
  );
};

export default CourseManagement;

