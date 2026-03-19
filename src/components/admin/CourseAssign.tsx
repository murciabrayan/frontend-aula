import { useEffect, useMemo, useState } from "react";
import StyledSelect from "@/components/StyledSelect";
import { useFeedback } from "@/context/FeedbackContext";
import { getCourses, updateCourse } from "../../services/courseService";
import { getTeachers, getStudents } from "../../services/userService";
import {
  getSubjectsByCourse,
  createSubject,
  deleteSubject,
} from "../../commons/personas/services/subjectService";
import {
  getAreasByCourse,
  createArea,
  deleteArea,
  updateSubjectArea,
} from "../../commons/personas/services/areaservice";
import {
  getIndicators,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  getAssignmentsByCourse,
  createAssignment,
  deleteAssignment,
} from "../../commons/personas/services/indicatorService";
import type {
  Indicator,
  SubjectIndicatorAssignment,
} from "../../commons/personas/services/indicatorService";
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

type Tab = "teacher" | "students" | "subjects";

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

export default function CourseAssign() {
  const { confirm, showToast } = useFeedback();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

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

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | "">("");
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectArea, setNewSubjectArea] = useState<number | "">("");

  const [newAreaName, setNewAreaName] = useState("");

  const [tab, setTab] = useState<Tab>("teacher");
  const [studentFilter, setStudentFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingSubjectId, setSavingSubjectId] = useState<number | null>(null);
  const [savingAssignmentKey, setSavingAssignmentKey] = useState<string | null>(
    null
  );

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

  const notifyError = (message: string) => {
    showToast({
      type: "error",
      title: "Gestion de cursos",
      message,
    });
  };

  const notifySuccess = (message: string) => {
    showToast({
      type: "success",
      title: "Gestion de cursos",
      message,
    });
  };

  const truncateIndicator = (text: string, max = 90) => {
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  const initializeSelectedIndicators = (subjectList: Subject[]) => {
    const state: Record<number, PeriodSelectorState> = {};
    subjectList.forEach((subject) => {
      state[subject.id] = emptyPeriodState();
    });
    setSelectedIndicators(state);
  };

  const openManageCourse = async (course: Course) => {
    setActiveCourse(course);
    setSelectedTeacher(course.teacher || "");
    setSelectedStudents(course.students || []);
    setTab("teacher");
    setNewSubjectName("");
    setNewSubjectArea("");
    setNewAreaName("");
    setStudentFilter("");
    setNewIndicatorDescription("");
    setEditingIndicatorId(null);
    setEditingIndicatorDescription("");

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
  };

  const closeModal = () => {
    setActiveCourse(null);
    setSubjects([]);
    setAreas([]);
    setIndicatorBank([]);
    setIndicatorAssignments([]);
    setSelectedIndicators({});
    setNewSubjectName("");
    setNewSubjectArea("");
    setNewAreaName("");
    setStudentFilter("");
    setSavingSubjectId(null);
    setSavingAssignmentKey(null);
    setNewIndicatorDescription("");
    setEditingIndicatorId(null);
    setEditingIndicatorDescription("");
  };

  const saveAssignments = async () => {
    if (!activeCourse) return;

    const payload = {
      teacher: selectedTeacher === "" ? null : selectedTeacher,
      students: [...selectedStudents],
    };

    await updateCourse(activeCourse.id, payload);
    await loadInitialData();
    notifySuccess("Los cambios del curso se guardaron correctamente.");
    closeModal();
  };

  const addArea = async () => {
    if (!activeCourse) return;

    const nombre = newAreaName.trim();
    if (!nombre) return;

    try {
      const res = await createArea({
        nombre,
        curso: activeCourse.id,
      });

      setAreas((prev) => [...prev, res.data]);
      setNewAreaName("");
    } catch (error: any) {
      notifyError(
        error?.response?.data?.non_field_errors?.[0] ||
          error?.response?.data?.detail ||
          "Error al crear el área"
      );
    }
  };

  const removeArea = async (id: number) => {
    const hasSubjects = subjects.some((s) => s.area === id);
    if (hasSubjects) {
      notifyError("No puedes eliminar un área que aún tiene materias asignadas.");
      return;
    }

    const shouldRemoveArea = await confirm({
      title: "Eliminar área",
      message: "Esta acción eliminará el área seleccionada.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });
    if (!shouldRemoveArea) return;

    await deleteArea(id);
    setAreas((prev) => prev.filter((a) => a.id !== id));
    notifySuccess("El área se eliminó correctamente.");
  };

  const addSubject = async () => {
    if (!activeCourse) return;

    const nombre = newSubjectName.trim();
    if (!nombre) return;

    try {
      const res = await createSubject({
        nombre,
        curso: activeCourse.id,
        area: newSubjectArea === "" ? null : newSubjectArea,
      });

      const createdSubject = res.data;

      setSubjects((prev) => [...prev, createdSubject]);
      setSelectedIndicators((prev) => ({
        ...prev,
        [createdSubject.id]: emptyPeriodState(),
      }));

      setNewSubjectName("");
      setNewSubjectArea("");
    } catch (error: any) {
      notifyError(
        error?.response?.data?.non_field_errors?.[0] ||
          error?.response?.data?.detail ||
          "Error al crear la materia"
      );
    }
  };

  const removeSubject = async (id: number) => {
    const shouldRemoveSubject = await confirm({
      title: "Eliminar materia",
      message: "Esta acción eliminará la materia seleccionada.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });
    if (!shouldRemoveSubject) return;
    await deleteSubject(id);

    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setIndicatorAssignments((prev) => prev.filter((item) => item.materia !== id));
    setSelectedIndicators((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    notifySuccess("La materia se eliminó correctamente.");
  };

  const handleAssignAreaToSubject = async (
    subjectId: number,
    areaId: number | ""
  ) => {
    try {
      setSavingSubjectId(subjectId);

      const payloadArea = areaId === "" ? null : areaId;
      const res = await updateSubjectArea(subjectId, payloadArea);

      setSubjects((prev) =>
        prev.map((subject) =>
          subject.id === subjectId ? { ...subject, ...res.data } : subject
        )
      );
    } catch (error: any) {
      notifyError(
        error?.response?.data?.detail ||
          "No se pudo actualizar el área de la materia"
      );
    } finally {
      setSavingSubjectId(null);
    }
  };

  const addIndicatorToBank = async () => {
    const descripcion = newIndicatorDescription.trim();
    if (!descripcion) return;

    try {
      const res = await createIndicator({ descripcion });
      setIndicatorBank((prev) => [...prev, res.data].sort((a, b) => a.descripcion.localeCompare(b.descripcion)));
      setNewIndicatorDescription("");
    } catch (error: any) {
      notifyError(
        error?.response?.data?.descripcion?.[0] ||
          error?.response?.data?.detail ||
          error?.response?.data?.non_field_errors?.[0] ||
          "No se pudo crear el indicador."
      );
    }
  };

  const startEditIndicator = (indicator: Indicator) => {
    setEditingIndicatorId(indicator.id);
    setEditingIndicatorDescription(indicator.descripcion);
  };

  const saveEditedIndicator = async () => {
    if (!editingIndicatorId) return;

    const descripcion = editingIndicatorDescription.trim();
    if (!descripcion) return;

    try {
      const res = await updateIndicator(editingIndicatorId, { descripcion });

      setIndicatorBank((prev) =>
        prev
          .map((item) => (item.id === editingIndicatorId ? res.data : item))
          .sort((a, b) => a.descripcion.localeCompare(b.descripcion))
      );

      setIndicatorAssignments((prev) =>
        prev.map((assignment) =>
          assignment.indicador === editingIndicatorId
            ? {
                ...assignment,
                indicador_descripcion: res.data.descripcion,
              }
            : assignment
        )
      );

      setEditingIndicatorId(null);
      setEditingIndicatorDescription("");
    } catch (error: any) {
      notifyError(
        error?.response?.data?.descripcion?.[0] ||
          error?.response?.data?.detail ||
          error?.response?.data?.non_field_errors?.[0] ||
          "No se pudo editar el indicador."
      );
    }
  };

  const removeIndicatorFromBank = async (indicatorId: number) => {
    const shouldRemoveIndicator = await confirm({
      title: "Eliminar indicador",
      message: "Esta acción eliminará el indicador del banco.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      tone: "danger",
    });
    if (!shouldRemoveIndicator) return;

    try {
      await deleteIndicator(indicatorId);
      setIndicatorBank((prev) => prev.filter((item) => item.id !== indicatorId));
      setIndicatorAssignments((prev) =>
        prev.filter((assignment) => assignment.indicador !== indicatorId)
      );
      notifySuccess("El indicador se eliminó correctamente.");
    } catch (error: any) {
      notifyError(
        error?.response?.data?.detail ||
          "No se pudo eliminar el indicador."
      );
    }
  };

  const handleSelectedIndicatorChange = (
    subjectId: number,
    period: 1 | 2 | 3 | 4,
    indicatorId: number | ""
  ) => {
    setSelectedIndicators((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || emptyPeriodState()),
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

      const res = await createAssignment({
        materia: subjectId,
        periodo: period,
        indicador: Number(indicatorId),
      });

      setIndicatorAssignments((prev) => [...prev, res.data]);

      setSelectedIndicators((prev) => ({
        ...prev,
        [subjectId]: {
          ...(prev[subjectId] || emptyPeriodState()),
          [period]: "",
        },
      }));
    } catch (error: any) {
      notifyError(
        error?.response?.data?.non_field_errors?.[0] ||
          error?.response?.data?.detail ||
          "No se pudo asignar el indicador."
      );
    } finally {
      setSavingAssignmentKey(null);
    }
  };

  const unassignIndicator = async (assignmentId: number) => {
    const shouldUnassignIndicator = await confirm({
      title: "Quitar indicador",
      message: "Esta acción quitará el indicador asignado a la materia.",
      confirmText: "Quitar",
      cancelText: "Cancelar",
      tone: "danger",
    });
    if (!shouldUnassignIndicator) return;

    try {
      await deleteAssignment(assignmentId);
      setIndicatorAssignments((prev) =>
        prev.filter((item) => item.id !== assignmentId)
      );
      notifySuccess("El indicador se quitó correctamente.");
    } catch (error: any) {
      notifyError(
        error?.response?.data?.detail ||
          "No se pudo quitar el indicador."
      );
    }
  };

  const getAssignmentsForSubjectPeriod = (
    subjectId: number,
    period: 1 | 2 | 3 | 4
  ) => {
    return indicatorAssignments.filter(
      (item) => item.materia === subjectId && item.periodo === period
    );
  };

  const filteredStudents = students.filter((s) =>
    `${s.first_name} ${s.last_name}`
      .toLowerCase()
      .includes(studentFilter.toLowerCase())
  );

  const groupedSubjects = useMemo(() => {
    return areas.map((area) => ({
      area,
      subjects: subjects.filter((s) => s.area === area.id),
    }));
  }, [areas, subjects]);

  const subjectsWithoutArea = useMemo(
    () => subjects.filter((s) => !s.area),
    [subjects]
  );

  const renderSubjectCard = (subject: Subject) => (
    <div key={subject.id} className="indicator-subject-card">
      <div className="subject-item subject-item-extended">
        <span>{subject.nombre}</span>

        <div className="subject-actions-inline">
          <StyledSelect
            value={subject.area ?? ""}
            disabled={savingSubjectId === subject.id}
            onChange={(e) =>
              handleAssignAreaToSubject(
                subject.id,
                e.target.value ? Number(e.target.value) : ""
              )
            }
          >
            <option value="">Sin área</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </StyledSelect>

          <button className="danger" onClick={() => removeSubject(subject.id)}>
            🗑
          </button>
        </div>
      </div>

      <div className="subject-periods-grid">
        {[1, 2, 3, 4].map((period) => {
          const typedPeriod = period as 1 | 2 | 3 | 4;
          const periodAssignments = getAssignmentsForSubjectPeriod(
            subject.id,
            typedPeriod
          );

          return (
            <div key={period} className="subject-period-card">
              <div className="subject-period-header">Periodo {period}</div>

              <div className="indicator-period-actions">
                <StyledSelect
                  value={selectedIndicators[subject.id]?.[typedPeriod] ?? ""}
                  onChange={(e) =>
                    handleSelectedIndicatorChange(
                      subject.id,
                      typedPeriod,
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                >
                  <option value="">Selecciona un indicador</option>
                  {indicatorBank.map((indicator) => (
                    <option key={indicator.id} value={indicator.id}>
                      {truncateIndicator(indicator.descripcion)}
                    </option>
                  ))}
                </StyledSelect>

                <button
                  className="primary"
                  disabled={savingAssignmentKey === `${subject.id}-${period}`}
                  onClick={() => assignIndicatorToSubject(subject.id, typedPeriod)}
                >
                  {savingAssignmentKey === `${subject.id}-${period}`
                    ? "..."
                    : "Asignar"}
                </button>
              </div>

              {periodAssignments.length === 0 ? (
                <p className="helper-text small">Sin indicadores asignados.</p>
              ) : (
                <div className="assigned-indicators-list">
                  {periodAssignments.map((assignment) => (
                    <div key={assignment.id} className="assigned-indicator-chip">
                      <span>{assignment.indicador_descripcion}</span>
                      <button onClick={() => unassignIndicator(assignment.id)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
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
              <div>
                <h3>{activeCourse.name}</h3>
                <p>
                  Gestiona docentes, estudiantes, materias y estructura academica del curso.
                </p>
              </div>
              <button type="button" onClick={closeModal} aria-label="Cerrar modal">
                x
              </button>
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
                Materias, áreas e indicadores
              </div>
            </div>

            <div className="section">
              {tab === "teacher" && (
                <>
                  <label>Docente asignado</label>
                  <StyledSelect
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
                  </StyledSelect>
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
                <div className="areas-subjects-admin">
                  <div className="areas-block">
                    <h4>Áreas</h4>

                    {areas.length === 0 ? (
                      <p className="helper-text">Aún no hay áreas creadas.</p>
                    ) : (
                      <ul>
                        {areas.map((a) => (
                          <li key={a.id} className="subject-item">
                            <span>{a.nombre}</span>
                            <button
                              className="danger"
                              onClick={() => removeArea(a.id)}
                            >
                              🗑
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="subject-add">
                      <input
                        placeholder="Nueva área"
                        value={newAreaName}
                        onChange={(e) => setNewAreaName(e.target.value)}
                      />
                      <button className="primary" onClick={addArea}>
                        +
                      </button>
                    </div>
                  </div>

                  <div className="areas-block">
                    <h4>Banco de indicadores</h4>

                    <div className="indicator-bank-create">
                      <textarea
                        placeholder="Escribe un indicador para reutilizarlo después..."
                        value={newIndicatorDescription}
                        onChange={(e) => setNewIndicatorDescription(e.target.value)}
                      />
                      <button className="primary" onClick={addIndicatorToBank}>
                        Crear indicador
                      </button>
                    </div>

                    {indicatorBank.length === 0 ? (
                      <p className="helper-text">Aún no hay indicadores creados.</p>
                    ) : (
                      <div className="indicator-bank-list">
                        {indicatorBank.map((indicator) => (
                          <div key={indicator.id} className="indicator-bank-item">
                            {editingIndicatorId === indicator.id ? (
                              <>
                                <textarea
                                  value={editingIndicatorDescription}
                                  onChange={(e) =>
                                    setEditingIndicatorDescription(
                                      e.target.value
                                    )
                                  }
                                />
                                <div className="indicator-bank-actions">
                                  <button
                                    className="primary"
                                    onClick={saveEditedIndicator}
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    className="ghost"
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
                                <div className="indicator-bank-text">
                                  {indicator.descripcion}
                                </div>
                                <div className="indicator-bank-actions">
                                  <button
                                    className="ghost"
                                    onClick={() => startEditIndicator(indicator)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className="danger"
                                    onClick={() =>
                                      removeIndicatorFromBank(indicator.id)
                                    }
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <h4 style={{ marginTop: 24 }}>Materias e indicadores</h4>

                    {subjects.length === 0 ? (
                      <p className="helper-text">Aún no hay materias creadas.</p>
                    ) : (
                      <>
                        {groupedSubjects.map(({ area, subjects: areaSubjects }) => (
                          <div key={area.id} className="admin-area-group">
                            <div className="admin-area-group-title">
                              {area.nombre}
                            </div>

                            {areaSubjects.length === 0 ? (
                              <p className="helper-text small">
                                Sin materias en esta área.
                              </p>
                            ) : (
                              areaSubjects.map((subject) =>
                                renderSubjectCard(subject)
                              )
                            )}
                          </div>
                        ))}

                        <div className="admin-area-group">
                          <div className="admin-area-group-title">
                            Sin área
                          </div>

                          {subjectsWithoutArea.length === 0 ? (
                            <p className="helper-text small">
                              No hay materias sin área.
                            </p>
                          ) : (
                            subjectsWithoutArea.map((subject) =>
                              renderSubjectCard(subject)
                            )
                          )}
                        </div>
                      </>
                    )}

                    <div className="subject-add subject-add-stacked">
                      <input
                        placeholder="Nueva materia"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                      />
                      <StyledSelect
                        value={newSubjectArea}
                        onChange={(e) =>
                          setNewSubjectArea(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                      >
                        <option value="">Sin área</option>
                        {areas.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nombre}
                          </option>
                        ))}
                      </StyledSelect>
                      <button className="primary" onClick={addSubject}>
                        Crear materia
                      </button>
                    </div>
                  </div>
                </div>
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
