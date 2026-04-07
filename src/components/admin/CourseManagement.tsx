import { useEffect, useMemo, useState } from "react";
import { BookOpen, Pencil, Plus, Save, Search, Trash2 } from "lucide-react";
import StyledSelect from "@/components/StyledSelect";
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
  updateSubject,
} from "../../commons/personas/services/subjectService";
import {
  createIndicator,
  createAssignment,
  deleteAssignment,
  deleteIndicator,
  getAssignmentsByCourse,
  getIndicators,
  updateIndicator,
  type Indicator,
  type SubjectIndicatorAssignment,
} from "../../commons/personas/services/indicatorService";
import CourseStructureBoard from "./CourseStructureBoard";
import CourseTeamBoard from "./CourseTeamBoard";
import "./CourseManagement.css";

interface Course {
  id?: number;
  name: string;
  teacher: number | null;
  teacher_name?: string;
  students: number[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
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
  teacher?: number | null;
  teacher_name?: string;
}

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
  const [courseSearch, setCourseSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);

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
  const [newSubjectTeacher, setNewSubjectTeacher] = useState<number | "">("");
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [isAssignIndicatorModalOpen, setIsAssignIndicatorModalOpen] =
    useState(false);
  const [isSubjectIndicatorsModalOpen, setIsSubjectIndicatorsModalOpen] =
    useState(false);
  const [assignmentSubjectId, setAssignmentSubjectId] = useState<number | "">("");
  const [assignmentPeriod, setAssignmentPeriod] = useState<1 | 2 | 3 | 4 | "">("");
  const [assignmentIndicatorId, setAssignmentIndicatorId] = useState<number | "">("");
  const [assignmentIndicatorSearch, setAssignmentIndicatorSearch] = useState("");
  const [newIndicatorDescription, setNewIndicatorDescription] = useState("");

  const [indicatorBank, setIndicatorBank] = useState<Indicator[]>([]);
  const [indicatorAssignments, setIndicatorAssignments] = useState<
    SubjectIndicatorAssignment[]
  >([]);
  const [selectedIndicators, setSelectedIndicators] = useState<
    Record<number, PeriodSelectorState>
  >({});
  const [editingIndicatorId, setEditingIndicatorId] = useState<number | null>(
    null
  );
  const [editingIndicatorDescription, setEditingIndicatorDescription] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [savingCoursePeople, setSavingCoursePeople] = useState(false);
  const [savingSubjectId, setSavingSubjectId] = useState<number | null>(null);

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
        message: "No se pudo cargar la información de cursos.",
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

  const filteredAssignmentIndicators = useMemo(() => {
    const query = assignmentIndicatorSearch.trim().toLowerCase();
    if (!query) return indicatorBank;
    return indicatorBank.filter((indicator) =>
      indicator.descripcion.toLowerCase().includes(query)
    );
  }, [assignmentIndicatorSearch, indicatorBank]);

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

  const getTeacherName = (teacherId: number | null) => {
    if (!teacherId) return "Sin director";
    const teacher = teachers.find((item) => item.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Sin director";
  };

  const getStudentCourseName = (studentId: number) => {
    const assignedCourse = courses.find((course) => course.students.includes(studentId));
    return assignedCourse?.name || "Sin curso";
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
      setAssignmentSubjectId(loadedSubjects[0]?.id ?? "");
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

  const openTeamModal = async (course: Course) => {
    await openCourseWorkspace(course);
    setIsTeamModalOpen(true);
  };

  const closeTeamModal = () => {
    setIsTeamModalOpen(false);
    setSelectedCourseId(null);
    setStudentFilter("");
  };

  const openStructureModal = async (course: Course) => {
    await openCourseWorkspace(course);
    setIsStructureModalOpen(true);
  };

  const closeStructureModal = () => {
    setIsStructureModalOpen(false);
    setSelectedCourseId(null);
    setSelectedSubjectId(null);
    setNewAreaName("");
    setNewSubjectName("");
    setNewSubjectArea("");
    setNewSubjectTeacher("");
    setIsAreaModalOpen(false);
    setIsSubjectModalOpen(false);
    setIsAssignIndicatorModalOpen(false);
    setIsSubjectIndicatorsModalOpen(false);
  };

  const resetCourseForm = () => {
    setCourseForm(emptyCourseForm());
    setEditingCourseId(null);
    setCourseError("");
    setIsCourseModalOpen(false);
  };

  const openCreateCourseModal = () => {
    setCourseForm(emptyCourseForm());
    setEditingCourseId(null);
    setCourseError("");
    setIsCourseModalOpen(true);
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
    setIsCourseModalOpen(true);
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
        message: "Director y estudiantes guardados correctamente.",
      });
    } catch (error) {
      console.error("Error guardando director y estudiantes", error);
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
        teacher: newSubjectTeacher === "" ? null : newSubjectTeacher,
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
      setNewSubjectTeacher("");
      setIsSubjectModalOpen(false);

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

  const resetSubjectDraft = () => {
    setNewSubjectName("");
    setNewSubjectArea("");
    setNewSubjectTeacher("");
    setIsSubjectModalOpen(false);
  };

  const resetAreaDraft = () => {
    setNewAreaName("");
    setIsAreaModalOpen(false);
  };

  const resetIndicatorAssignmentDraft = () => {
    setAssignmentSubjectId(selectedSubjectId ?? "");
    setAssignmentPeriod("");
    setAssignmentIndicatorId("");
    setAssignmentIndicatorSearch("");
    setIsAssignIndicatorModalOpen(false);
  };

  const resetIndicatorDraft = () => {
    setNewIndicatorDescription("");
    setIsIndicatorModalOpen(false);
  };

  const addIndicator = async () => {
    const descripcion = newIndicatorDescription.trim();
    if (!descripcion) {
      showToast({
        type: "warning",
        title: "Indicador",
        message: "Escribe una descripcion para crear el indicador.",
      });
      return;
    }

    try {
      const response = await createIndicator({ descripcion });
      setIndicatorBank((current) =>
        [...current, response.data].sort((a, b) => a.descripcion.localeCompare(b.descripcion))
      );
      showToast({
        type: "success",
        title: "Indicador creado",
        message: "El indicador fue creado correctamente.",
      });
      resetIndicatorDraft();
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

  const handleAssignTeacherToSubject = async (
    subjectId: number,
    teacherId: number | ""
  ) => {
    try {
      setSavingSubjectId(subjectId);
      const response = await updateSubject(subjectId, {
        teacher: teacherId === "" ? null : teacherId,
      });

      setSubjects((current) =>
        current.map((subject) =>
          subject.id === subjectId ? { ...subject, ...response.data } : subject
        )
      );

      showToast({
        type: "success",
        title: "Materia actualizada",
        message: "El docente de la materia fue actualizado.",
      });
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Materia",
        message:
          error?.response?.data?.detail ||
          "No se pudo actualizar el docente de la materia.",
      });
    } finally {
      setSavingSubjectId(null);
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

  const submitIndicatorAssignment = async () => {
    if (
      assignmentSubjectId === "" ||
      assignmentPeriod === "" ||
      assignmentIndicatorId === ""
    ) {
      showToast({
        type: "warning",
        title: "Asignacion incompleta",
        message: "Selecciona materia, periodo e indicador antes de continuar.",
      });
      return;
    }

    handleSelectedIndicatorChange(
      assignmentSubjectId,
      assignmentPeriod,
      assignmentIndicatorId
    );
    await assignIndicatorToSubject(assignmentSubjectId, assignmentPeriod);
    setSelectedSubjectId(assignmentSubjectId);
    resetIndicatorAssignmentDraft();
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

    try {
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

  const renderCourseWorkspace = () => (
    <CourseTeamBoard
      courseName={selectedCourse?.name || ""}
      allStudents={filteredStudents}
      teacherName={getTeacherName(selectedTeacher === "" ? null : selectedTeacher)}
      teachers={teachers}
      selectedTeacher={selectedTeacher}
      onTeacherChange={setSelectedTeacher}
      selectedStudentIds={selectedStudents}
      studentFilter={studentFilter}
      onStudentFilterChange={setStudentFilter}
      onAddStudent={(studentId) =>
        setSelectedStudents((current) =>
          current.includes(studentId) ? current : [...current, studentId]
        )
      }
      onRemoveStudent={(studentId) =>
        setSelectedStudents((current) => current.filter((id) => id !== studentId))
      }
      onSave={() => void saveCoursePeople()}
      saving={savingCoursePeople}
      getStudentCourseName={getStudentCourseName}
      onClose={closeTeamModal}
      loading={loadingWorkspace}
    />
  );

  const renderStructureWorkspace = () => (
    <CourseStructureBoard
      courseName={selectedCourse?.name || ""}
      onClose={closeStructureModal}
      loading={loadingWorkspace}
      areas={areas}
      subjects={subjects}
      teachers={teachers}
      selectedSubjectId={selectedSubjectId}
      onSelectSubject={setSelectedSubjectId}
      onOpenAreaModal={() => setIsAreaModalOpen(true)}
      onRemoveArea={(areaId) => void removeArea(areaId)}
      onOpenSubjectModal={() => setIsSubjectModalOpen(true)}
      savingSubjectId={savingSubjectId}
      onAssignAreaToSubject={(subjectId, areaId) =>
        void handleAssignAreaToSubject(subjectId, areaId)
      }
      onAssignTeacherToSubject={(subjectId, teacherId) =>
        void handleAssignTeacherToSubject(subjectId, teacherId)
      }
      onRemoveSubject={(subjectId) => void removeSubject(subjectId)}
      onOpenSubjectIndicators={(subjectId) => {
        setSelectedSubjectId(subjectId);
        setIsSubjectIndicatorsModalOpen(true);
      }}
      indicatorBank={indicatorBank}
      editingIndicatorId={editingIndicatorId}
      editingIndicatorDescription={editingIndicatorDescription}
      onEditingIndicatorDescriptionChange={setEditingIndicatorDescription}
      onStartEditIndicator={(indicatorId, description) => {
        setEditingIndicatorId(indicatorId);
        setEditingIndicatorDescription(description);
      }}
      onSaveEditedIndicator={() => void saveEditedIndicator()}
      onCancelEditIndicator={() => {
        setEditingIndicatorId(null);
        setEditingIndicatorDescription("");
      }}
      onRemoveIndicatorFromBank={(indicatorId) =>
        void removeIndicatorFromBank(indicatorId)
      }
      indicatorAssignments={indicatorAssignments}
      onOpenAssignIndicator={(subjectId) => {
        setAssignmentSubjectId(subjectId);
        setAssignmentPeriod("");
        setAssignmentIndicatorId("");
        setIsAssignIndicatorModalOpen(true);
      }}
      onOpenCreateIndicator={() => setIsIndicatorModalOpen(true)}
    />
  );
  if (loading) {
    return <div className="course-management__state">Cargando gestion de cursos...</div>;
  }

  return (
    <section className="course-management">
      <div className="course-management__header">
        <div>
          <p className="course-management__eyebrow">Administración académica</p>
          <h2>
            {isCourseMode
              ? "Cursos y equipo académico"
              : "Estructura académica por curso"}
          </h2>
          <p>
            {isCourseMode
              ? "Crea cursos, asigna directores y organiza estudiantes en un flujo mas claro y comodo."
              : "Selecciona un curso y configura sus areas, materias e indicadores sin mezclarlo con la gestion del equipo."}
          </p>
        </div>
      </div>

      <section className="course-management__command-center">
        <div className="course-management__command-top">
          <div>
            <p className="course-management__flow-step">
              {isCourseMode ? "Sala de cursos" : "Mesa de estructura"}
            </p>
            <h3>
              {isCourseMode
                ? "Abre un curso y arma su equipo como tablero"
                : "Abre un curso y construye su estructura en carriles"}
            </h3>
            <p>
              {isCourseMode
                ? "Primero eliges el curso y luego trabajas con bandejas separadas de director, disponibles y equipo final."
                : "Primero eliges el curso y luego construyes areas, materias e indicadores en un workspace nuevo."}
            </p>
          </div>

          <div className="course-management__command-actions">
            {isCourseMode ? (
              <button
                type="button"
                className="course-management__primary-btn"
                onClick={openCreateCourseModal}
              >
                <Plus size={14} />
                <span>Nuevo curso</span>
              </button>
            ) : (
              <div className="course-management__summary-chip">
                <BookOpen size={16} />
                <div>
                  <strong>Curso activo</strong>
                  <span>{selectedCourse?.name || "Selecciona un curso"}</span>
                </div>
              </div>
            )}

            <label className="course-management__search course-management__search--wide">
              <Search size={16} />
              <input
                type="text"
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder="Buscar curso..."
              />
            </label>
          </div>
        </div>

        <div className="course-management__course-rail">
          {filteredCourses.length === 0 ? (
            <div className="course-management__empty">
              No hay cursos que coincidan con la busqueda.
            </div>
          ) : (
            filteredCourses.map((course) => (
              <article
                key={course.id}
                className={`course-management__rail-card ${
                  selectedCourseId === course.id ? "is-active" : ""
                }`}
              >
                <button
                  type="button"
                  className="course-management__rail-card-main"
                  onClick={() =>
                    void (isCourseMode ? openTeamModal(course) : openStructureModal(course))
                  }
                >
                  <span className="course-management__rail-card-kicker">Curso</span>
                  <strong>{course.name}</strong>
                  <small>{getTeacherName(course.teacher)}</small>
                  <div className="course-management__rail-card-meta">
                    <span>{course.students.length} estudiantes</span>
                    {selectedCourseId === course.id ? (
                      <span className="course-management__selected-pill">Activo</span>
                    ) : null}
                  </div>
                </button>

                {isCourseMode ? (
                  <div className="course-management__rail-card-actions">
                    <button
                      type="button"
                      className="course-management__action-pill"
                      onClick={() => handleEditCourse(course)}
                    >
                      <Pencil size={15} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      className="course-management__action-pill"
                      onClick={() => void handleDeleteCourse(course.id!)}
                    >
                      <Trash2 size={15} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>

        {selectedCourse ? (
          <div className="course-management__summary-banner">
            <div className="course-management__summary-card">
              <span>Curso activo</span>
              <strong>{selectedCourse.name}</strong>
            </div>
            <div className="course-management__summary-card">
              <span>Director de curso</span>
              <strong>{getTeacherName(selectedCourse.teacher)}</strong>
            </div>
            <div className="course-management__summary-card">
              <span>Materias con docente</span>
              <strong>
                {subjects.filter((subject) => subject.teacher).length} / {subjects.length}
              </strong>
            </div>
          </div>
        ) : null}
      </section>

      {isCourseMode && isTeamModalOpen ? renderCourseWorkspace() : null}
      {!isCourseMode && isStructureModalOpen ? renderStructureWorkspace() : null}

      {isCourseMode && isCourseModalOpen ? (
        <div className="course-management__modal-backdrop">
          <div className="course-management__modal">
            <div className="course-management__modal-header">
              <div>
                <h3>{editingCourseId ? "Editar curso" : "Nuevo curso"}</h3>
                <p>
                  {editingCourseId
                    ? "Actualiza el nombre del curso sin salir del catalogo."
                    : "Crea un curso nuevo desde esta ventana compacta."}
                </p>
              </div>
              <button
                type="button"
                className="course-management__modal-close"
                onClick={resetCourseForm}
                aria-label="Cerrar modal"
              >
                x
              </button>
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
                <button
                  type="button"
                  className="course-management__secondary-btn"
                  onClick={resetCourseForm}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {!isCourseMode && isAreaModalOpen ? (
        <div className="course-management__modal-backdrop">
          <div className="course-management__modal">
            <div className="course-management__modal-header">
              <div>
                <h3>Nueva area</h3>
                <p>Crea un area base para organizar las materias del curso.</p>
              </div>
              <button
                type="button"
                className="course-management__modal-close"
                onClick={resetAreaDraft}
                aria-label="Cerrar modal"
              >
                x
              </button>
            </div>

            <div className="course-management__stack-form">
              <input
                type="text"
                value={newAreaName}
                onChange={(event) => setNewAreaName(event.target.value)}
                placeholder="Nombre del area"
              />
              <div className="course-management__form-actions">
                <button
                  type="button"
                  className="course-management__primary-btn"
                  onClick={async () => {
                    await addArea();
                    setIsAreaModalOpen(false);
                  }}
                >
                  <Plus size={15} />
                  <span>Crear area</span>
                </button>
                <button
                  type="button"
                  className="course-management__secondary-btn"
                  onClick={resetAreaDraft}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!isCourseMode && isSubjectModalOpen ? (
        <div className="course-management__modal-backdrop">
          <div className="course-management__modal">
            <div className="course-management__modal-header">
              <div>
                <h3>Nueva materia</h3>
                <p>Crea una materia y, si quieres, asignala de una vez a un area.</p>
              </div>
              <button
                type="button"
                className="course-management__modal-close"
                onClick={resetSubjectDraft}
                aria-label="Cerrar modal"
              >
                x
              </button>
            </div>

            <div className="course-management__stack-form">
              <input
                type="text"
                value={newSubjectName}
                onChange={(event) => setNewSubjectName(event.target.value)}
                placeholder="Nombre de la materia"
              />
              <StyledSelect
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
              </StyledSelect>
              <StyledSelect
                value={newSubjectTeacher}
                onChange={(event) =>
                  setNewSubjectTeacher(
                    event.target.value ? Number(event.target.value) : ""
                  )
                }
              >
                <option value="">Sin docente de materia</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </StyledSelect>
              <div className="course-management__form-actions">
                <button
                  type="button"
                  className="course-management__primary-btn"
                  onClick={() => void addSubject()}
                >
                  <Plus size={15} />
                  <span>Crear materia</span>
                </button>
                <button
                  type="button"
                  className="course-management__secondary-btn"
                  onClick={resetSubjectDraft}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!isCourseMode && isIndicatorModalOpen ? (
        <div className="course-management__modal-backdrop">
          <div className="course-management__modal">
            <div className="course-management__modal-header">
              <div>
                <h3>Nuevo indicador</h3>
                <p>Crea un indicador para dejarlo disponible en el banco del curso.</p>
              </div>
              <button
                type="button"
                className="course-management__modal-close"
                onClick={resetIndicatorDraft}
                aria-label="Cerrar modal"
              >
                x
              </button>
            </div>

            <div className="course-management__stack-form">
              <textarea
                value={newIndicatorDescription}
                onChange={(event) => setNewIndicatorDescription(event.target.value)}
                placeholder="Descripcion del indicador"
                rows={5}
              />
              <div className="course-management__form-actions">
                <button
                  type="button"
                  className="course-management__primary-btn"
                  onClick={() => void addIndicator()}
                >
                  <Plus size={15} />
                  <span>Crear indicador</span>
                </button>
                <button
                  type="button"
                  className="course-management__secondary-btn"
                  onClick={resetIndicatorDraft}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!isCourseMode && isAssignIndicatorModalOpen ? (
        <div className="course-management__modal-backdrop">
          <div className="course-management__modal">
            <div className="course-management__modal-header">
              <div>
                <h3>Asignar indicador</h3>
                <p>Selecciona la materia, el periodo y el indicador que quieres relacionar.</p>
              </div>
              <button
                type="button"
                className="course-management__modal-close"
                onClick={resetIndicatorAssignmentDraft}
                aria-label="Cerrar modal"
              >
                x
              </button>
            </div>

            <div className="course-management__stack-form">
              <StyledSelect
                value={assignmentSubjectId}
                onChange={(event) =>
                  setAssignmentSubjectId(
                    event.target.value ? Number(event.target.value) : ""
                  )
                }
              >
                <option value="">Selecciona una materia</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.nombre}
                  </option>
                ))}
              </StyledSelect>

              <StyledSelect
                value={assignmentPeriod}
                onChange={(event) =>
                  setAssignmentPeriod(
                    event.target.value ? (Number(event.target.value) as 1 | 2 | 3 | 4) : ""
                  )
                }
              >
                <option value="">Selecciona un periodo</option>
                <option value="1">Periodo 1</option>
                <option value="2">Periodo 2</option>
                <option value="3">Periodo 3</option>
                <option value="4">Periodo 4</option>
              </StyledSelect>

              <label className="course-management__search course-management__search--wide">
                <Search size={16} />
                <input
                  type="text"
                  value={assignmentIndicatorSearch}
                  onChange={(event) => setAssignmentIndicatorSearch(event.target.value)}
                  placeholder="Buscar indicador..."
                />
              </label>

              <div className="course-management__indicator-picker">
                {filteredAssignmentIndicators.length === 0 ? (
                  <div className="course-management__empty">
                    No hay indicadores que coincidan con la busqueda.
                  </div>
                ) : (
                  filteredAssignmentIndicators.map((indicator) => (
                    <button
                      key={indicator.id}
                      type="button"
                      className={`course-management__indicator-choice ${
                        assignmentIndicatorId === indicator.id ? "is-active" : ""
                      }`}
                      onClick={() => setAssignmentIndicatorId(indicator.id)}
                    >
                      <span>{indicator.descripcion}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="course-management__form-actions">
                <button
                  type="button"
                  className="course-management__primary-btn"
                  onClick={() => void submitIndicatorAssignment()}
                >
                  <Plus size={14} />
                  <span>Asignar indicador</span>
                </button>
                <button
                  type="button"
                  className="course-management__secondary-btn"
                  onClick={resetIndicatorAssignmentDraft}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!isCourseMode && isSubjectIndicatorsModalOpen ? (
        <div className="course-management__modal-backdrop">
          <div className="course-management__modal course-management__modal--wide">
            <div className="course-management__modal-header">
              <div>
                <h3>
                  {selectedSubject
                    ? `Indicadores de ${selectedSubject.nombre}`
                    : "Indicadores de la materia"}
                </h3>
                <p>Consulta los indicadores guardados y el periodo al que pertenecen.</p>
              </div>
              <button
                type="button"
                className="course-management__modal-close"
                onClick={() => setIsSubjectIndicatorsModalOpen(false)}
                aria-label="Cerrar modal"
              >
                x
              </button>
            </div>

            {!selectedSubject ? (
              <div className="course-management__empty course-management__empty--large">
                Selecciona una materia para ver sus indicadores.
              </div>
            ) : (
              <div className="course-management__student-table-wrap">
                <table className="course-management__student-table">
                  <thead>
                    <tr>
                      <th>Periodo</th>
                      <th>Indicador</th>
                      <th>Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].flatMap((period) => {
                      const typedPeriod = period as 1 | 2 | 3 | 4;
                      const periodAssignments = getAssignmentsForSubjectPeriod(
                        selectedSubject.id,
                        typedPeriod
                      );

                      if (periodAssignments.length === 0) {
                        return [
                          <tr key={`empty-${period}`}>
                            <td>Periodo {period}</td>
                            <td colSpan={2}>Sin indicadores asignados.</td>
                          </tr>,
                        ];
                      }

                      return periodAssignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td>Periodo {period}</td>
                          <td>{assignment.indicador_descripcion}</td>
                          <td>
                            <button
                              type="button"
                              className="course-management__action-pill"
                              onClick={() => void unassignIndicator(assignment.id)}
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CourseManagement;



