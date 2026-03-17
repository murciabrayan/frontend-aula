import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
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

type CourseWorkspaceTab = "equipo" | "estructura";
type StructureSection = "areas" | "materias" | "indicadores";

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

const CourseManagement = () => {
  const { confirm, showToast } = useFeedback();

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseTab, setSelectedCourseTab] =
    useState<CourseWorkspaceTab>("equipo");
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
    setSelectedCourseTab("equipo");
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

  if (loading) {
    return <div className="course-management__state">Cargando gestion de cursos...</div>;
  }

  return (
    <section className="course-management">
      <div className="course-management__header">
        <div>
          <p className="course-management__eyebrow">Administracion academica</p>
          <h2>Cursos y estructura academica</h2>
          <p>
            Crea cursos, asigna su equipo de trabajo y organiza materias,
            areas e indicadores desde un solo espacio.
          </p>
        </div>
      </div>

      <div className="course-management__layout">
        <aside className="course-management__catalog">
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

          <article className="course-management__card course-management__card--fill">
            <div className="course-management__card-header">
              <div>
                <h3>Catalogo de cursos</h3>
                <p>Selecciona un curso para configurarlo en el panel derecho.</p>
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
                      <small>{course.students.length} estudiantes</small>
                    </button>

                    <div className="course-management__course-actions">
                      <button
                        type="button"
                        className="course-management__icon-btn"
                        onClick={() => handleEditCourse(course)}
                        title="Editar curso"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="course-management__icon-btn is-danger"
                        onClick={() => void handleDeleteCourse(course.id!)}
                        title="Eliminar curso"
                      >
                        <Trash2 size={15} />
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
                materias, areas e indicadores sin salir de esta pantalla.
              </p>
            </div>
          ) : loadingWorkspace ? (
            <div className="course-management__state">
              Cargando configuracion de {selectedCourse.name}...
            </div>
          ) : (
            <>
              <article className="course-management__workspace-hero">
                <div>
                  <p className="course-management__eyebrow">Curso seleccionado</p>
                  <h3>{selectedCourse.name}</h3>
                  <div className="course-management__hero-meta">
                    <span>
                      <UserSquare2 size={15} />
                      {getTeacherName(selectedTeacher === "" ? null : selectedTeacher)}
                    </span>
                    <span>
                      <Users size={15} />
                      {selectedStudents.length} estudiantes asignados
                    </span>
                    <span>
                      <LayoutPanelTop size={15} />
                      {subjects.length} materias configuradas
                    </span>
                  </div>
                </div>

                <div className="course-management__workspace-tabs">
                  <button
                    type="button"
                    className={selectedCourseTab === "equipo" ? "is-active" : ""}
                    onClick={() => setSelectedCourseTab("equipo")}
                  >
                    Equipo del curso
                  </button>
                  <button
                    type="button"
                    className={selectedCourseTab === "estructura" ? "is-active" : ""}
                    onClick={() => setSelectedCourseTab("estructura")}
                  >
                    Estructura academica
                  </button>
                </div>
              </article>

              {selectedCourseTab === "equipo" ? (
                <div className="course-management__team-grid">
                  <article className="course-management__card">
                    <div className="course-management__card-header">
                      <div>
                        <h3>Docente asignado</h3>
                        <p>Selecciona el docente responsable del curso.</p>
                      </div>
                    </div>

                    <label className="course-management__field">
                      <span>Docente</span>
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
                    </label>

                    <button
                      type="button"
                      className="course-management__primary-btn"
                      onClick={() => void saveCoursePeople()}
                      disabled={savingCoursePeople}
                    >
                      <Save size={16} />
                      <span>
                        {savingCoursePeople ? "Guardando..." : "Guardar equipo"}
                      </span>
                    </button>
                  </article>

                  <article className="course-management__card course-management__card--fill">
                    <div className="course-management__card-header">
                      <div>
                        <h3>Estudiantes asignados</h3>
                        <p>Marca los estudiantes que pertenecen a este curso.</p>
                      </div>
                    </div>

                    <label className="course-management__search">
                      <Search size={16} />
                      <input
                        type="text"
                        value={studentFilter}
                        onChange={(event) => setStudentFilter(event.target.value)}
                        placeholder="Buscar estudiante..."
                      />
                    </label>

                    <div className="course-management__student-list">
                      {filteredStudents.map((student) => (
                        <label
                          key={student.id}
                          className="course-management__student-item"
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
                          <span>
                            {student.first_name} {student.last_name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </article>
                </div>
              ) : (
                <div className="course-management__structure-shell">
                  <article className="course-management__workspace-hero course-management__workspace-hero--section">
                    <div>
                      <p className="course-management__eyebrow">Organizacion interna</p>
                      <h3>Estructura academica</h3>
                      <p className="course-management__section-copy">
                        Ya no necesitas ver todo junto. Entra a una seccion a la vez
                        para organizar el curso con mas calma y claridad.
                      </p>
                    </div>

                    <div className="course-management__section-tabs">
                      <button
                        type="button"
                        className={
                          selectedStructureSection === "areas" ? "is-active" : ""
                        }
                        onClick={() => setSelectedStructureSection("areas")}
                      >
                        Areas
                      </button>
                      <button
                        type="button"
                        className={
                          selectedStructureSection === "materias" ? "is-active" : ""
                        }
                        onClick={() => setSelectedStructureSection("materias")}
                      >
                        Materias
                      </button>
                      <button
                        type="button"
                        className={
                          selectedStructureSection === "indicadores" ? "is-active" : ""
                        }
                        onClick={() => setSelectedStructureSection("indicadores")}
                      >
                        Indicadores
                      </button>
                    </div>
                  </article>

                  <div className="course-management__structure-layout">
                  {selectedStructureSection === "areas" ? (
                  <article className="course-management__card course-management__structure-card">
                    <div className="course-management__card-header">
                      <div>
                        <h3>Areas</h3>
                        <p>Define los grupos academicos del curso.</p>
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
                              className="course-management__icon-btn is-danger"
                              onClick={() => void removeArea(area.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="course-management__inline-form">
                      <input
                        type="text"
                        value={newAreaName}
                        onChange={(event) => setNewAreaName(event.target.value)}
                        placeholder="Nueva area"
                      />
                      <button
                        type="button"
                        className="course-management__primary-btn"
                        onClick={() => void addArea()}
                      >
                        <Plus size={15} />
                        <span>Agregar</span>
                      </button>
                    </div>
                  </article>
                  ) : null}

                  {selectedStructureSection === "materias" ? (
                  <article className="course-management__card course-management__structure-card">
                    <div className="course-management__card-header">
                      <div>
                        <h3>Materias</h3>
                        <p>Selecciona una materia para ver su configuracion detallada.</p>
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

                    <div className="course-management__stack-form">
                      <input
                        type="text"
                        value={newSubjectName}
                        onChange={(event) => setNewSubjectName(event.target.value)}
                        placeholder="Nueva materia"
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
                  ) : null}

                  {(selectedStructureSection === "materias" ||
                    selectedStructureSection === "indicadores") ? (
                  <div className="course-management__structure-main">
                    <article className="course-management__card">
                      <div className="course-management__card-header">
                        <div>
                          <h3>Detalle de materia</h3>
                          <p>
                            {selectedSubject
                              ? "Asigna el area y los indicadores por periodo."
                              : "Selecciona una materia para administrarla."}
                          </p>
                        </div>
                      </div>

                      {!selectedSubject ? (
                        <div className="course-management__empty course-management__empty--large">
                          Selecciona una materia del panel izquierdo.
                        </div>
                      ) : (
                        <>
                          <div className="course-management__subject-detail-header">
                            <div>
                              <h4>{selectedSubject.nombre}</h4>
                              <p>
                                Area actual: {selectedSubject.area_nombre || "Sin area"}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="course-management__icon-btn is-danger"
                              onClick={() => void removeSubject(selectedSubject.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <label className="course-management__field">
                            <span>Area de la materia</span>
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
                          </label>

                          {selectedStructureSection === "indicadores" ? (
                          <div className="course-management__period-grid">
                            {[1, 2, 3, 4].map((period) => {
                              const typedPeriod = period as 1 | 2 | 3 | 4;
                              const periodAssignments = getAssignmentsForSubjectPeriod(
                                selectedSubject.id,
                                typedPeriod
                              );

                              return (
                                <div
                                  key={period}
                                  className="course-management__period-card"
                                >
                                  <div className="course-management__period-title">
                                    Periodo {period}
                                  </div>

                                  <div className="course-management__period-form">
                                    <select
                                      value={
                                        selectedIndicators[selectedSubject.id]?.[
                                          typedPeriod
                                        ] ?? ""
                                      }
                                      onChange={(event) =>
                                        handleSelectedIndicatorChange(
                                          selectedSubject.id,
                                          typedPeriod,
                                          event.target.value
                                            ? Number(event.target.value)
                                            : ""
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
                                        savingAssignmentKey ===
                                        `${selectedSubject.id}-${period}`
                                      }
                                      onClick={() =>
                                        void assignIndicatorToSubject(
                                          selectedSubject.id,
                                          typedPeriod
                                        )
                                      }
                                    >
                                      {savingAssignmentKey ===
                                      `${selectedSubject.id}-${period}`
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
                                            onClick={() =>
                                              void unassignIndicator(assignment.id)
                                            }
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
                          ) : null}
                        </>
                      )}
                    </article>

                    {selectedStructureSection === "indicadores" ? (
                    <article className="course-management__card course-management__indicator-bank">
                      <div className="course-management__card-header">
                        <div>
                          <h3>Banco de indicadores</h3>
                          <p>Crea y reutiliza indicadores en todas las materias del curso.</p>
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
                                      setEditingIndicatorDescription(
                                        event.target.value
                                      )
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
                                        setEditingIndicatorDescription(
                                          indicator.descripcion
                                        );
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
                    ) : null}
                  </div>
                  ) : null}
                </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </section>
  );
};

export default CourseManagement;
