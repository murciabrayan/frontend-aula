import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "@/api/axios";
import StyledSelect from "@/components/StyledSelect";
import { exportRowsToPdf } from "@/utils/exportPdf";
import {
  createAttendanceRecord,
  getAttendanceByCourseAndDate,
  getAttendanceCourseSummary,
  updateAttendanceRecord,
  type AttendanceHistoryEvent,
  type StudentAttendanceRecord,
} from "../../commons/personas/services/attendanceService";
import "../../commons/personas/styles/adminAttendance.css";

const API_COURSES = "/api/report-cards/courses/";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
type JustificationType = "NONE" | "MEDICAL" | "PERMISSION" | "CALAMITY" | "OTHER";
type PeriodType = 1 | 2 | 3 | 4;

interface CourseItem {
  id: number;
  nombre: string;
  docente: string;
  total_estudiantes: number;
}

interface AttendanceTableRow {
  key: string;
  student: StudentItem;
  studentName: string;
  courseName: string;
  record?: StudentAttendanceRecord;
}

interface StudentItem {
  id: number;
  nombre: string;
  email: string;
  cedula: string;
}

interface CourseStudentsResponse {
  curso: {
    id: number;
    nombre: string;
  };
  estudiantes: StudentItem[];
}

interface EditableAttendanceRecord {
  id?: number;
  student: number;
  student_name: string;
  course: number;
  course_name?: string;
  date: string;
  periodo: PeriodType;
  status: AttendanceStatus;
  is_justified: boolean;
  justification_type: JustificationType;
  teacher_notes: string;
  admin_notes: string;
  attachment_url?: string | null;
  created_by_name?: string | null;
  updated_by_name?: string | null;
  updated_by_role?: string | null;
  events?: AttendanceHistoryEvent[];
}

type StatusFilter = "ALL" | AttendanceStatus;

const ALL_COURSES_OPTION: CourseItem = {
  id: 0,
  nombre: "Todos los cursos",
  docente: "Vista general",
  total_estudiantes: 0,
};

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatPrettyDate = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const statusLabel = (status: AttendanceStatus) => {
  if (status === "PRESENT") return "Presente";
  if (status === "ABSENT") return "Ausente";
  return "Tarde";
};

const justificationLabel = (value: string) => {
  if (value === "MEDICAL") return "Excusa médica";
  if (value === "PERMISSION") return "Permiso";
  if (value === "CALAMITY") return "Calamidad";
  if (value === "OTHER") return "Otra";
  return "Sin justificar";
};

const roleLabel = (role?: string | null) => {
  if (role === "ADMIN") return "Coordinación";
  if (role === "TEACHER") return "Docente";
  return "Sistema";
};

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const AdminAttendance: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<EditableAttendanceRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);

  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0,
    justified: 0,
    total: 0,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isAllCoursesSelected = selectedCourse?.id === ALL_COURSES_OPTION.id;

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await api.get<CourseItem[]>(API_COURSES);
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error cargando cursos", error);
      setErrorMessage("No se pudieron cargar los cursos.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadStudentsByCourse = async (courseId: number) => {
    const res = await api.get<CourseStudentsResponse>(
      `/api/report-cards/courses/${courseId}/students/`
    );
    setStudents(res.data.estudiantes || []);
  };

  const loadAttendance = async (courseId: number, date: string) => {
    try {
      setLoadingAttendance(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (courseId === ALL_COURSES_OPTION.id) {
        setStudents([]);
        const recordsRes = await api.get<StudentAttendanceRecord[]>(
          `/api/attendance/?date=${date}`,
        );
        const loadedRecords = recordsRes.data || [];
        setRecords(loadedRecords);
        setSummary({
          present: loadedRecords.filter((item) => item.status === "PRESENT").length,
          absent: loadedRecords.filter((item) => item.status === "ABSENT").length,
          late: loadedRecords.filter((item) => item.status === "LATE").length,
          justified: loadedRecords.filter((item) => item.is_justified).length,
          total: loadedRecords.length,
        });
      } else {
        await loadStudentsByCourse(courseId);

        const [recordsRes, summaryRes] = await Promise.all([
          getAttendanceByCourseAndDate(courseId, date),
          getAttendanceCourseSummary(courseId, date),
        ]);

        const loadedRecords = recordsRes.data || [];
        setRecords(loadedRecords);

        const firstWithPeriod = loadedRecords.find((item) => item.periodo);
        if (firstWithPeriod?.periodo) {
          setSelectedPeriod(firstWithPeriod.periodo as PeriodType);
        }

        setSummary({
          present: summaryRes.data.present,
          absent: summaryRes.data.absent,
          late: summaryRes.data.late,
          justified: summaryRes.data.justified,
          total: summaryRes.data.total,
        });
      }
    } catch (error: any) {
      console.error("Error cargando asistencia", error);
      setRecords([]);
      setSummary({
        present: 0,
        absent: 0,
        late: 0,
        justified: 0,
        total: 0,
      });
      setErrorMessage(
        error?.response?.data?.detail ||
          "No se pudo cargar la asistencia del curso."
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  const recordsMap = useMemo(() => {
    const map = new Map<number, StudentAttendanceRecord>();
    records.forEach((record) => {
      map.set(record.student, record);
    });
    return map;
  }, [records]);

  const rows = useMemo<AttendanceTableRow[]>(() => {
    if (!selectedCourse) return [];

    const baseRows = isAllCoursesSelected
      ? records.map((record) => ({
          key: `record-${record.id}`,
          student: {
            id: record.student,
            nombre: record.student_name,
            email: "",
            cedula: "",
          },
          studentName: record.student_name,
          courseName: record.course_name || "Curso",
          record,
        }))
      : students.map((student) => {
          const record = recordsMap.get(student.id);
          return {
            key: `student-${student.id}`,
            student,
            studentName: student.nombre,
            courseName: selectedCourse.nombre,
            record,
          };
        });

    return baseRows.filter(({ record }) =>
      statusFilter === "ALL"
        ? true
        : (record?.status || "PRESENT") === statusFilter,
    );
  }, [students, records, recordsMap, selectedCourse, statusFilter, isAllCoursesSelected]);

  const handleViewAttendance = async () => {
    if (!selectedCourse) return;
    await loadAttendance(selectedCourse.id, selectedDate);
  };
  const handleExportPdf = () => {
    const exportRows = rows.map(({ student, record }) => ({
      curso: record?.course_name || selectedCourse?.nombre || "Curso",
      estudiante: student.nombre,
      periodo: record?.periodo || selectedPeriod,
      estado: statusLabel((record?.status || "PRESENT") as AttendanceStatus),
      justificada: record?.is_justified ? "Sí" : "No",
      motivo: justificationLabel(record?.justification_type || "NONE"),
      observacion_docente: record?.teacher_notes || record?.notes || "Sin observación",
      observacion_administrativa: record?.admin_notes || "Sin observación",
      soporte: record?.attachment_url ? "Sí" : "No",
      registro_inicial: record?.created_by_name || "Sin autor",
      ultima_gestion: record?.events?.[0]?.summary || "Sin movimientos posteriores",
    }));

    exportRowsToPdf({
      filename: `asistencia-admin-${selectedCourse?.nombre || "curso"}-${selectedDate}.pdf`,
      title: `Asistencia administrativa - ${selectedCourse?.nombre || "Curso"}`,
      subtitle: `Fecha ${formatPrettyDate(selectedDate)} • Periodo ${selectedPeriod} • Estado ${statusFilter === "ALL" ? "Todos" : statusLabel(statusFilter)}`,
      summary: [
        { label: "Presentes", value: summary.present },
        { label: "Ausentes", value: summary.absent },
        { label: "Tardanzas", value: summary.late },
        { label: "Justificadas", value: summary.justified },
      ],
      columns: [
        { header: "Curso", key: "curso" },
        { header: "Estudiante", key: "estudiante" },
        { header: "Periodo", key: "periodo" },
        { header: "Estado", key: "estado" },
        { header: "Justificada", key: "justificada" },
        { header: "Motivo", key: "motivo" },
        { header: "Observación docente", key: "observacion_docente" },
        { header: "Observación administrativa", key: "observacion_administrativa" },
        { header: "Soporte", key: "soporte" },
        { header: "Registro inicial", key: "registro_inicial" },
        { header: "Última gestión", key: "ultima_gestion" },
      ].map((column) => ({
        ...column,
        width:
          column.key === "curso"
            ? 90
            : column.key === "estudiante"
              ? 120
              : column.key.includes("observacion")
                ? 130
                : column.key === "ultima_gestion"
                  ? 120
                  : column.key === "registro_inicial"
                    ? 90
                    : 60,
      })),
      rows: exportRows,
    });
  };
  const openEditModal = ({ student, record, courseName }: AttendanceTableRow) => {
    if (!selectedCourse) return;

    setCurrentRecord({
      id: record?.id,
      student: student.id,
      student_name: student.nombre,
      course: record?.course || selectedCourse.id,
      course_name: record?.course_name || courseName || selectedCourse.nombre,
      date: selectedDate,
      periodo: ((record?.periodo as PeriodType) || selectedPeriod),
      status: record?.status || "PRESENT",
      is_justified: record?.is_justified || false,
      justification_type: (record?.justification_type as JustificationType) || "NONE",
      teacher_notes: record?.teacher_notes || record?.notes || "",
      admin_notes: record?.admin_notes || "",
      attachment_url: record?.attachment_url || null,
      created_by_name: record?.created_by_name || null,
      updated_by_name: record?.updated_by_name || null,
      updated_by_role: record?.updated_by_role || null,
      events: record?.events || [],
    });

    setSelectedFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentRecord(null);
    setSelectedFile(null);
  };

  const updateCurrentRecord = (
    field: keyof EditableAttendanceRecord,
    value: string | boolean | number
  ) => {
    if (!currentRecord) return;

    const updated = {
      ...currentRecord,
      [field]: value,
    } as EditableAttendanceRecord;

    if (field === "is_justified") {
      if (value === false) {
        updated.justification_type = "NONE";
      } else if (value === true && updated.justification_type === "NONE") {
        updated.justification_type = "OTHER";
      }
    }

    if (field === "status") {
      if (value === "PRESENT") {
        updated.is_justified = false;
        updated.justification_type = "NONE";
      } else if (
        updated.is_justified &&
        updated.justification_type === "NONE"
      ) {
        updated.justification_type = "OTHER";
      }
    }

    setCurrentRecord(updated);
  };

  const handleSaveRecord = async () => {
    if (!currentRecord) return;

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const normalizedStatus = currentRecord.status;
      const normalizedIsJustified =
        normalizedStatus === "PRESENT" ? false : currentRecord.is_justified;

      const normalizedJustificationType = normalizedIsJustified
        ? currentRecord.justification_type === "NONE"
          ? "OTHER"
          : currentRecord.justification_type
        : "NONE";

      const formData = new FormData();
      formData.append("student", String(currentRecord.student));
      formData.append("course", String(currentRecord.course));
      formData.append("date", currentRecord.date);
      formData.append("periodo", String(currentRecord.periodo));
      formData.append("status", normalizedStatus);
      formData.append("is_justified", String(normalizedIsJustified));
      formData.append("justification_type", normalizedJustificationType);
      formData.append("teacher_notes", currentRecord.teacher_notes || "");
      formData.append("admin_notes", currentRecord.admin_notes || "");

      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      if (currentRecord.id) {
        await updateAttendanceRecord(currentRecord.id, formData);
      } else {
        await createAttendanceRecord(formData);
      }

      closeModal();
      setSuccessMessage("Registro de asistencia guardado correctamente.");

      if (selectedCourse) {
        await loadAttendance(selectedCourse.id, selectedDate);
      }

      setTimeout(() => setSuccessMessage(""), 1800);
    } catch (error: any) {
      console.error("Error guardando asistencia", error);
      console.error("Respuesta backend:", error?.response?.data);

      const backendData = error?.response?.data;

      if (backendData?.detail) {
        setErrorMessage(backendData.detail);
      } else if (backendData?.non_field_errors?.[0]) {
        setErrorMessage(backendData.non_field_errors[0]);
      } else if (backendData?.justification_type?.[0]) {
        setErrorMessage(backendData.justification_type[0]);
      } else if (backendData?.is_justified?.[0]) {
        setErrorMessage(backendData.is_justified[0]);
      } else if (backendData?.status?.[0]) {
        setErrorMessage(backendData.status[0]);
      } else if (backendData?.student?.[0]) {
        setErrorMessage(backendData.student[0]);
      } else if (backendData?.periodo?.[0]) {
        setErrorMessage(backendData.periodo[0]);
      } else {
        setErrorMessage("No se pudo guardar el registro.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingCourses) {
    return <div className="admin-attendance-empty">Cargando cursos...</div>;
  }

  return (
    <div className="admin-attendance-page">
      <section className="admin-attendance-hero">
        <div className="admin-attendance-hero-copy">
          <span className="admin-attendance-badge">Asistencia</span>
          <h1>Gestión administrativa de asistencia</h1>
          <p>
            Consulta un curso, una fecha y un período. Luego revisa y corrige
            registros, justificaciones y soportes.
          </p>
        </div>

        <div className="admin-attendance-hero-actions">
          <div className="admin-attendance-input-card">
            <label>Curso</label>
            <StyledSelect
              value={selectedCourse?.id === ALL_COURSES_OPTION.id ? "ALL" : selectedCourse?.id || ""}
              onChange={(e) => {
                const course =
                  e.target.value === "ALL"
                    ? ALL_COURSES_OPTION
                    : courses.find((c) => c.id === Number(e.target.value)) || null;
                setSelectedCourse(course);
                setRecords([]);
                setStudents([]);
              }}
            >
              <option value="">Selecciona un curso</option>
              <option value="ALL">Todos los cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.nombre}
                </option>
              ))}
            </StyledSelect>
          </div>

          <div className="admin-attendance-input-card">
            <label>Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="admin-attendance-input-card">
            <label>Periodo</label>
            <StyledSelect
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value) as PeriodType)}
            >
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
              <option value={4}>Periodo 4</option>
            </StyledSelect>
          </div>

          <div className="admin-attendance-input-card">
            <label>Estado</label>
            <StyledSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="ALL">Todos</option>
              <option value="PRESENT">Presentes</option>
              <option value="ABSENT">Ausentes</option>
              <option value="LATE">Tarde</option>
            </StyledSelect>
          </div>

          <div className="admin-attendance-action-group">
            <button
              type="button"
              className="admin-attendance-primary-btn"
              onClick={handleViewAttendance}
              disabled={!selectedCourse || loadingAttendance}
            >
              {loadingAttendance ? "Cargando..." : "Ver asistencia"}
            </button>

            <button
              type="button"
              className="admin-attendance-secondary-btn admin-attendance-export-btn"
              onClick={handleExportPdf}
              disabled={!selectedCourse || rows.length === 0}
            >
              Exportar PDF
            </button>
          </div>
        </div>
      </section>

      {selectedCourse && (
        <div className="admin-attendance-course-banner">
          <div>
            Curso: <strong>{selectedCourse.nombre}</strong>
          </div>
          {!isAllCoursesSelected && (
            <div>
              Director: <strong>{selectedCourse.docente}</strong>
            </div>
          )}
          <div>
            Fecha: <strong>{formatPrettyDate(selectedDate)}</strong>
          </div>
          <div>
            Periodo: <strong>{selectedPeriod}</strong>
          </div>
          <div>
            Estado: <strong>{statusFilter === "ALL" ? "Todos" : statusLabel(statusFilter)}</strong>
          </div>
        </div>
      )}

      <div className="admin-attendance-summary-grid">
        <div className="admin-attendance-summary-card">
          <span>Presentes</span>
          <strong>{summary.present}</strong>
        </div>
        <div className="admin-attendance-summary-card absent">
          <span>Ausentes</span>
          <strong>{summary.absent}</strong>
        </div>
        <div className="admin-attendance-summary-card late">
          <span>Tardanzas</span>
          <strong>{summary.late}</strong>
        </div>
        <div className="admin-attendance-summary-card justified">
          <span>Justificadas</span>
          <strong>{summary.justified}</strong>
        </div>
      </div>

      {successMessage && (
        <div className="admin-attendance-message success">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="admin-attendance-message error">{errorMessage}</div>
      )}

      {!selectedCourse ? (
        <div className="admin-attendance-empty">
          Selecciona un curso para consultar la asistencia.
        </div>
      ) : loadingAttendance ? (
        <div className="admin-attendance-empty">
          Cargando registros de asistencia...
        </div>
      ) : rows.length === 0 ? (
        <div className="admin-attendance-empty">
          {isAllCoursesSelected
            ? "No hay registros de asistencia para la fecha consultada."
            : "No hay estudiantes en este curso."}
        </div>
      ) : (
        <section className="admin-attendance-table-section">
          <div className="admin-attendance-section-header">
            <h3>Asistencia por estudiante</h3>
            <p>
              Consulta el registro original del docente y aplica una corrección
              administrativa solo cuando haga falta.
            </p>
          </div>

          <div className="admin-attendance-table-wrapper">
            <table className="admin-attendance-table">
              <thead>
                <tr>
                  {isAllCoursesSelected ? <th>Curso</th> : null}
                  <th>Estudiante</th>
                  <th>Periodo</th>
                  <th>Estado</th>
                  <th>Justificada</th>
                  <th>Motivo</th>
                  <th>Observación docente</th>
                  <th>Registró</th>
                  <th>Última gestión</th>
                  <th>Soporte</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const { student, record, courseName } = row;
                  const lastEvent = record?.events?.[0] || null;

                  return (
                    <tr key={row.key}>
                      {isAllCoursesSelected ? <td>{courseName}</td> : null}
                      <td className="admin-attendance-student-cell">
                        {student.nombre}
                      </td>
                      <td>{record?.periodo || selectedPeriod}</td>
                      <td>
                        <span
                          className={`admin-attendance-status-pill ${(record?.status || "PRESENT").toLowerCase()}`}
                        >
                          {statusLabel((record?.status || "PRESENT") as AttendanceStatus)}
                        </span>
                      </td>
                      <td>
                        {record?.is_justified ? (
                          <span className="admin-attendance-justified yes">Sí</span>
                        ) : (
                          <span className="admin-attendance-justified no">No</span>
                        )}
                      </td>
                      <td>{justificationLabel(record?.justification_type || "NONE")}</td>
                      <td className="admin-attendance-observation-cell">
                        {record?.teacher_notes || record?.notes || "Sin observación"}
                      </td>
                      <td className="admin-attendance-trace-cell">
                        {record?.created_by_name ? (
                          <div className="admin-attendance-trace">
                            <strong>{record.created_by_name}</strong>
                            <small>
                              {record.created_by_name === record.updated_by_name && record.updated_by_role === "TEACHER"
                                ? "Registro docente"
                                : "Registro inicial"}
                            </small>
                          </div>
                        ) : (
                          <span className="admin-attendance-muted">Sin registro previo</span>
                        )}
                      </td>
                      <td className="admin-attendance-trace-cell">
                        {lastEvent ? (
                          <div className="admin-attendance-trace admin">
                            <strong>{lastEvent.actor_name || roleLabel(lastEvent.actor_role)}</strong>
                            <small>{lastEvent.summary}</small>
                          </div>
                        ) : (
                          <span className="admin-attendance-muted">Sin movimientos</span>
                        )}
                      </td>
                      <td>
                        {record?.attachment_url ? (
                          <a
                            href={record.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-attendance-file-link"
                          >
                            Ver soporte
                          </a>
                        ) : (
                          <span className="admin-attendance-muted">Sin archivo</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-attendance-manage-btn"
                          onClick={() => openEditModal(row)}
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showModal && currentRecord && (
        <div className="admin-attendance-modal-backdrop">
          <div className="admin-attendance-modal">
            <div className="admin-attendance-modal-header">
              <div>
                <h2>{currentRecord.student_name}</h2>
                <p>
                  Edita el registro del día <strong>{formatPrettyDate(currentRecord.date)}</strong>
                </p>
              </div>

              <button
                type="button"
                className="admin-attendance-close-btn"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="admin-attendance-modal-body">
              <div className="admin-attendance-audit-grid">
                <div className="admin-attendance-audit-card">
                  <span className="admin-attendance-audit-label">Registro original</span>
                  <strong>{currentRecord.created_by_name || "Sin autor identificado"}</strong>
                  <p>
                    {currentRecord.created_by_name
                      ? "Primer registro guardado para este estudiante."
                      : "Aún no se ha identificado un autor inicial."}
                  </p>
                </div>
                <div className="admin-attendance-audit-card accent">
                  <span className="admin-attendance-audit-label">Última intervención</span>
                  <strong>
                    {currentRecord.events?.[0]?.summary || "Aún no hay movimientos posteriores"}
                  </strong>
                  {currentRecord.events?.[0] && (
                    <p>
                      {(currentRecord.events[0].actor_name || roleLabel(currentRecord.events[0].actor_role))} •{" "}
                      {formatDateTime(currentRecord.events[0].created_at)}
                    </p>
                  )}
                </div>
              </div>

              <div className="admin-attendance-form-grid">
                <div className="admin-attendance-form-block">
                  <label>Periodo</label>
                  <StyledSelect
                    value={currentRecord.periodo}
                    onChange={(e) =>
                      updateCurrentRecord("periodo", Number(e.target.value) as PeriodType)
                    }
                  >
                    <option value={1}>Periodo 1</option>
                    <option value={2}>Periodo 2</option>
                    <option value={3}>Periodo 3</option>
                    <option value={4}>Periodo 4</option>
                  </StyledSelect>
                </div>

                <div className="admin-attendance-form-block">
                  <label>Estado</label>
                  <StyledSelect
                    value={currentRecord.status}
                    onChange={(e) =>
                      updateCurrentRecord("status", e.target.value as AttendanceStatus)
                    }
                  >
                    <option value="PRESENT">Presente</option>
                    <option value="ABSENT">Ausente</option>
                    <option value="LATE">Tarde</option>
                  </StyledSelect>
                </div>

                <div className="admin-attendance-form-block checkbox-block">
                  <label>Justificada</label>
                  <input
                    type="checkbox"
                    checked={currentRecord.is_justified}
                    onChange={(e) =>
                      updateCurrentRecord("is_justified", e.target.checked)
                    }
                    disabled={currentRecord.status === "PRESENT"}
                  />
                </div>

                <div className="admin-attendance-form-block">
                  <label>Tipo de justificación</label>
                  <StyledSelect
                    value={currentRecord.justification_type}
                    onChange={(e) =>
                      updateCurrentRecord(
                        "justification_type",
                        e.target.value as JustificationType
                      )
                    }
                    disabled={!currentRecord.is_justified}
                  >
                    <option value="NONE">Sin justificar</option>
                    <option value="MEDICAL">Excusa médica</option>
                    <option value="PERMISSION">Permiso</option>
                    <option value="CALAMITY">Calamidad</option>
                    <option value="OTHER">Otra</option>
                  </StyledSelect>
                </div>

                <div className="admin-attendance-form-block full">
                  <label>Observación del docente</label>
                  <div className="admin-attendance-readonly-note">
                    {currentRecord.teacher_notes || "El docente no dejó observación en este registro."}
                  </div>
                </div>

                <div className="admin-attendance-form-block full">
                  <label>Observación administrativa</label>
                  <textarea
                    value={currentRecord.admin_notes}
                    onChange={(e) => updateCurrentRecord("admin_notes", e.target.value)}
                    placeholder="Escribe una observación..."
                  />
                </div>

                <div className="admin-attendance-form-block full">
                  <label>Soporte</label>
                  <div className="admin-attendance-file-row">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        const nextSelectedFile = e.target.files?.[0] || null;
                        if (nextSelectedFile && !isPdfFile(nextSelectedFile)) {
                          setErrorMessage("Solo se permiten archivos PDF para los soportes.");
                          e.currentTarget.value = "";
                          setSelectedFile(null);
                          return;
                        }
                        setErrorMessage("");
                        setSelectedFile(nextSelectedFile);
                      }}
                    />

                    {currentRecord.attachment_url && !selectedFile && (
                      <a
                        href={currentRecord.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-attendance-file-link"
                      >
                        Ver soporte actual
                      </a>
                    )}

                    {selectedFile && (
                      <span className="admin-attendance-file-selected">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-attendance-history-card">
                <div className="admin-attendance-history-header">
                  <h3>Historial del registro</h3>
                  <p>Revisa aquí los cambios y observaciones que ya tuvo esta asistencia.</p>
                </div>
                {currentRecord.events?.length ? (
                  <div className="admin-attendance-history-list">
                    {currentRecord.events.map((event) => (
                      <article key={event.id} className="admin-attendance-history-item">
                        <div className="admin-attendance-history-top">
                          <strong>{event.summary}</strong>
                          <span>{formatDateTime(event.created_at)}</span>
                        </div>
                        <p className="admin-attendance-history-meta">
                          {event.actor_name || roleLabel(event.actor_role)} • {roleLabel(event.actor_role)}
                        </p>
                        {event.notes && (
                          <div className="admin-attendance-history-note">{event.notes}</div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="admin-attendance-history-empty">
                    Este registro todavía no tiene historial adicional.
                  </div>
                )}
              </div>
            </div>

            <div className="admin-attendance-modal-footer">
              <button
                type="button"
                className="admin-attendance-secondary-btn"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-attendance-primary-btn"
                onClick={handleSaveRecord}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;



