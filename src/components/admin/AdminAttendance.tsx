import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  createAttendanceRecord,
  getAttendanceByCourseAndDate,
  getAttendanceCourseSummary,
  updateAttendanceRecord,
  type StudentAttendanceRecord,
} from "../../commons/personas/services/attendanceService";
import "../../commons/personas/styles/adminAttendance.css";

const API_COURSES = "http://127.0.0.1:8000/api/report-cards/courses/";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
type JustificationType = "NONE" | "MEDICAL" | "PERMISSION" | "CALAMITY" | "OTHER";
type PeriodType = 1 | 2 | 3 | 4;

interface CourseItem {
  id: number;
  nombre: string;
  docente: string;
  total_estudiantes: number;
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
  notes: string;
  attachment_url?: string | null;
}

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

const AdminAttendance: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const token = localStorage.getItem("access_token");

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(1);

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

  useEffect(() => {
    loadCourses();
  }, []);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await axios.get<CourseItem[]>(API_COURSES, {
        headers: authHeaders,
      });
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error cargando cursos", error);
      setErrorMessage("No se pudieron cargar los cursos.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadStudentsByCourse = async (courseId: number) => {
    const res = await axios.get<CourseStudentsResponse>(
      `http://127.0.0.1:8000/api/report-cards/courses/${courseId}/students/`,
      { headers: authHeaders }
    );
    setStudents(res.data.estudiantes || []);
  };

  const loadAttendance = async (courseId: number, date: string) => {
    try {
      setLoadingAttendance(true);
      setErrorMessage("");
      setSuccessMessage("");

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

  const rows = useMemo(() => {
    if (!selectedCourse) return [];

    return students.map((student) => {
      const record = recordsMap.get(student.id);
      return {
        student,
        record,
      };
    });
  }, [students, recordsMap, selectedCourse]);

  const handleViewAttendance = async () => {
    if (!selectedCourse) return;
    await loadAttendance(selectedCourse.id, selectedDate);
  };

  const openEditModal = (student: StudentItem) => {
    if (!selectedCourse) return;

    const record = recordsMap.get(student.id);

    setCurrentRecord({
      id: record?.id,
      student: student.id,
      student_name: student.nombre,
      course: selectedCourse.id,
      course_name: selectedCourse.nombre,
      date: selectedDate,
      periodo: ((record?.periodo as PeriodType) || selectedPeriod),
      status: record?.status || "PRESENT",
      is_justified: record?.is_justified || false,
      justification_type: (record?.justification_type as JustificationType) || "NONE",
      notes: record?.notes || "",
      attachment_url: record?.attachment_url || null,
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
      formData.append("notes", currentRecord.notes || "");

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
            <select
              value={selectedCourse?.id || ""}
              onChange={(e) => {
                const course = courses.find((c) => c.id === Number(e.target.value)) || null;
                setSelectedCourse(course);
                setRecords([]);
                setStudents([]);
              }}
            >
              <option value="">Selecciona un curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.nombre}
                </option>
              ))}
            </select>
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
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value) as PeriodType)}
            >
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
              <option value={4}>Periodo 4</option>
            </select>
          </div>

          <button
            type="button"
            className="admin-attendance-primary-btn"
            onClick={handleViewAttendance}
            disabled={!selectedCourse || loadingAttendance}
          >
            {loadingAttendance ? "Cargando..." : "Ver asistencia"}
          </button>
        </div>
      </section>

      {selectedCourse && (
        <div className="admin-attendance-course-banner">
          <div>
            Curso: <strong>{selectedCourse.nombre}</strong>
          </div>
          <div>
            Docente: <strong>{selectedCourse.docente}</strong>
          </div>
          <div>
            Fecha: <strong>{formatPrettyDate(selectedDate)}</strong>
          </div>
          <div>
            Periodo: <strong>{selectedPeriod}</strong>
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
          No hay estudiantes en este curso.
        </div>
      ) : (
        <section className="admin-attendance-table-section">
          <div className="admin-attendance-section-header">
            <h3>Asistencia por estudiante</h3>
            <p>
              Revisa el estado actual del día y abre el editor de cada registro.
            </p>
          </div>

          <div className="admin-attendance-table-wrapper">
            <table className="admin-attendance-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Periodo</th>
                  <th>Estado</th>
                  <th>Justificada</th>
                  <th>Motivo</th>
                  <th>Observación</th>
                  <th>Soporte</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ student, record }) => (
                  <tr key={student.id}>
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
                      {record?.notes || "Sin observación"}
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
                        onClick={() => openEditModal(student)}
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
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
                  Edita el registro del día{" "}
                  <strong>{formatPrettyDate(currentRecord.date)}</strong>
                </p>
              </div>

              <button
                type="button"
                className="admin-attendance-close-btn"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <div className="admin-attendance-modal-body">
              <div className="admin-attendance-form-grid">
                <div className="admin-attendance-form-block">
                  <label>Periodo</label>
                  <select
                    value={currentRecord.periodo}
                    onChange={(e) =>
                      updateCurrentRecord("periodo", Number(e.target.value) as PeriodType)
                    }
                  >
                    <option value={1}>Periodo 1</option>
                    <option value={2}>Periodo 2</option>
                    <option value={3}>Periodo 3</option>
                    <option value={4}>Periodo 4</option>
                  </select>
                </div>

                <div className="admin-attendance-form-block">
                  <label>Estado</label>
                  <select
                    value={currentRecord.status}
                    onChange={(e) =>
                      updateCurrentRecord("status", e.target.value as AttendanceStatus)
                    }
                  >
                    <option value="PRESENT">Presente</option>
                    <option value="ABSENT">Ausente</option>
                    <option value="LATE">Tarde</option>
                  </select>
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
                  <select
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
                  </select>
                </div>

                <div className="admin-attendance-form-block full">
                  <label>Observación</label>
                  <textarea
                    value={currentRecord.notes}
                    onChange={(e) => updateCurrentRecord("notes", e.target.value)}
                    placeholder="Escribe una observación..."
                  />
                </div>

                <div className="admin-attendance-form-block full">
                  <label>Soporte</label>
                  <div className="admin-attendance-file-row">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
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