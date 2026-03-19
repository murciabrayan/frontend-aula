import React, { useRef, useState } from "react";
import StyledSelect from "@/components/StyledSelect";
import {
  getTeacherAttendanceByDate,
  saveTeacherAttendanceBulk,
  type TeacherAttendanceStudent,
} from "@/commons/personas/services/attendanceService";
import "../styles/teacherAttendance.css";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
type PeriodType = 1 | 2 | 3 | 4;

interface EditableAttendanceStudent extends TeacherAttendanceStudent {
  local_status: AttendanceStatus;
  local_notes: string;
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

const TeacherAttendance: React.FC = () => {
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>(1);
  const [loadedDate, setLoadedDate] = useState("");
  const [courseName, setCourseName] = useState("");
  const [students, setStudents] = useState<EditableAttendanceStudent[]>([]);

  const [selectedStudent, setSelectedStudent] =
    useState<EditableAttendanceStudent | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const summary = students.reduce(
    (acc, student) => {
      acc.total += 1;
      if (student.local_status === "PRESENT") acc.present += 1;
      if (student.local_status === "ABSENT") acc.absent += 1;
      if (student.local_status === "LATE") acc.late += 1;
      if (student.is_justified) acc.justified += 1;
      return acc;
    },
    { total: 0, present: 0, absent: 0, late: 0, justified: 0 },
  );

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const res = await getTeacherAttendanceByDate(selectedDate);

      const loadedStudents = (res.data.students || []).map((student) => ({
        ...student,
        local_status: student.status,
        local_notes: student.notes || "",
      }));

      setCourseName(res.data.course.nombre);
      setLoadedDate(selectedDate);
      setStudents(loadedStudents);
      setHasLoaded(true);
      setSelectedStudent(null);

      const firstWithPeriod = loadedStudents.find((student) => student.periodo);
      if (firstWithPeriod?.periodo) {
        setSelectedPeriod(firstWithPeriod.periodo as PeriodType);
      }
    } catch (error: any) {
      console.error("Error cargando asistencia", error);
      setErrorMessage(
        error?.response?.data?.detail ||
          "No se pudo cargar la asistencia del día."
      );
      setStudents([]);
      setCourseName("");
      setLoadedDate(selectedDate);
      setHasLoaded(true);
      setSelectedStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const openStudentModal = (student: EditableAttendanceStudent) => {
    setSelectedStudent({ ...student });
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
  };

  const updateSelectedStudentStatus = (status: AttendanceStatus) => {
    if (!selectedStudent) return;
    setSelectedStudent({
      ...selectedStudent,
      local_status: status,
    });
  };

  const updateSelectedStudentNotes = (notes: string) => {
    if (!selectedStudent) return;
    setSelectedStudent({
      ...selectedStudent,
      local_notes: notes,
    });
  };

  const handleSaveSelectedStudent = async () => {
    if (!selectedStudent) return;

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await saveTeacherAttendanceBulk({
        date: loadedDate || selectedDate,
        periodo: selectedPeriod,
        records: [
          {
            student: selectedStudent.id,
            status: selectedStudent.local_status,
            notes: selectedStudent.local_notes,
          },
        ],
      });

      setStudents((prev) =>
        prev.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                local_status: selectedStudent.local_status,
                local_notes: selectedStudent.local_notes,
                status: selectedStudent.local_status,
                notes: selectedStudent.local_notes,
                periodo: selectedPeriod,
              }
            : student
        )
      );

      closeStudentModal();
      setSuccessMessage("Asistencia guardada correctamente.");
      setTimeout(() => setSuccessMessage(""), 1800);
    } catch (error: any) {
      console.error("Error guardando asistencia", error);
      setErrorMessage(
        error?.response?.data?.detail ||
          error?.response?.data?.non_field_errors?.[0] ||
          "No se pudo guardar la asistencia."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="teacher-attendance-page">
      <section className="teacher-attendance-hero">
        <div className="teacher-attendance-hero-main">
          <div className="teacher-attendance-hero-copy">
            <span className="teacher-attendance-badge">Asistencia</span>
            <h1>Control diario del curso</h1>
            <p>
              Consulta la fecha, selecciona el período académico y edita la
              asistencia del estudiante desde un modal.
            </p>
          </div>

          <div className="teacher-attendance-hero-actions">
            <div className="attendance-date-card">
              <label>Fecha</label>

              <div className="attendance-date-picker">
                <button
                  type="button"
                  className="attendance-date-trigger"
                  onClick={openDatePicker}
                >
                  {formatPrettyDate(selectedDate)}
                </button>

                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="attendance-date-native"
                />
              </div>
            </div>

            <div className="attendance-date-card">
              <label>Periodo</label>
              <StyledSelect
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value) as PeriodType)}
                className="attendance-period-select"
              >
                <option value={1}>Periodo 1</option>
                <option value={2}>Periodo 2</option>
                <option value={3}>Periodo 3</option>
                <option value={4}>Periodo 4</option>
              </StyledSelect>
            </div>

            <button
              type="button"
              className="btn-primary attendance-view-btn"
              onClick={loadAttendance}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Ver asistencia"}
            </button>
          </div>
        </div>
      </section>

      {hasLoaded && courseName && (
        <div className="attendance-course-banner">
          <div>
            Curso asignado: <strong>{courseName}</strong>
          </div>
          <div>
            Fecha consultada: <strong>{formatPrettyDate(loadedDate)}</strong>
          </div>
          <div>
            Periodo: <strong>{selectedPeriod}</strong>
          </div>
        </div>
      )}

      <div className="attendance-summary-grid">
        <div className="attendance-summary-card">
          <span>Total estudiantes</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="attendance-summary-card present">
          <span>Presentes</span>
          <strong>{summary.present}</strong>
        </div>
        <div className="attendance-summary-card absent">
          <span>Ausentes</span>
          <strong>{summary.absent}</strong>
        </div>
        <div className="attendance-summary-card late">
          <span>Tardanzas</span>
          <strong>{summary.late}</strong>
        </div>
      </div>

      {successMessage && (
        <div className="attendance-message success">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="attendance-message error">{errorMessage}</div>
      )}

      {!hasLoaded ? (
        <div className="attendance-empty-box">
          Selecciona una fecha y un período, luego pulsa <strong>Ver asistencia</strong>.
        </div>
      ) : loading ? (
        <div className="attendance-empty-box">Cargando asistencia...</div>
      ) : students.length === 0 ? (
        <div className="attendance-empty-box">
          No hay estudiantes para mostrar en esta fecha.
        </div>
      ) : (
        <section className="attendance-table-section">
          <div className="attendance-section-header">
            <div>
              <h3>Estudiantes del día</h3>
              <p>
                La tabla solo muestra la información. Usa el botón gestionar para
                editar el registro.
              </p>
            </div>
          </div>

          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Periodo</th>
                  <th>Estado</th>
                  <th>Observación</th>
                  <th>Justificada</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="student-cell">{student.student_name}</td>
                    <td>{student.periodo}</td>
                    <td>
                      <span
                        className={`attendance-status-pill ${student.local_status.toLowerCase()}`}
                      >
                        {statusLabel(student.local_status)}
                      </span>
                    </td>
                    <td className="attendance-observation-cell">
                      {student.local_notes || "Sin observación"}
                    </td>
                    <td>
                      {student.is_justified ? (
                        <span className="attendance-justified yes">Sí</span>
                      ) : (
                        <span className="attendance-justified no">No</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="table-manage-btn"
                        onClick={() => openStudentModal(student)}
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

      {selectedStudent && (
        <div className="attendance-modal-backdrop">
          <div className="attendance-modal">
            <div className="attendance-modal-header">
              <div>
                <h2>{selectedStudent.student_name}</h2>
                <p>
                  Edita la asistencia del día{" "}
                  <strong>{formatPrettyDate(loadedDate)}</strong>
                </p>
              </div>

              <button
                type="button"
                className="attendance-close-btn"
                onClick={closeStudentModal}
              >
                ✕
              </button>
            </div>

            <div className="attendance-modal-body">
              <div className="attendance-student-card">
                <div className="attendance-student-main">
                  <span className="attendance-mini-label">Periodo</span>
                  <strong>Periodo {selectedPeriod}</strong>
                </div>

                <div className="attendance-student-main">
                  <span className="attendance-mini-label">Estado actual</span>
                  <strong>{statusLabel(selectedStudent.local_status)}</strong>
                </div>

                <div className="attendance-status-selector">
                  <button
                    type="button"
                    className={`status-action-btn ${
                      selectedStudent.local_status === "PRESENT"
                        ? "active present"
                        : ""
                    }`}
                    onClick={() => updateSelectedStudentStatus("PRESENT")}
                  >
                    Presente
                  </button>

                  <button
                    type="button"
                    className={`status-action-btn ${
                      selectedStudent.local_status === "ABSENT"
                        ? "active absent"
                        : ""
                    }`}
                    onClick={() => updateSelectedStudentStatus("ABSENT")}
                  >
                    Ausente
                  </button>

                  <button
                    type="button"
                    className={`status-action-btn ${
                      selectedStudent.local_status === "LATE"
                        ? "active late"
                        : ""
                    }`}
                    onClick={() => updateSelectedStudentStatus("LATE")}
                  >
                    Tarde
                  </button>
                </div>
              </div>

              <div className="attendance-notes-card">
                <label>Observación</label>
                <textarea
                  value={selectedStudent.local_notes}
                  onChange={(e) => updateSelectedStudentNotes(e.target.value)}
                  placeholder="Escribe una observación si es necesario..."
                />
              </div>
            </div>

            <div className="attendance-modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={closeStudentModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveSelectedStudent}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar asistencia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
